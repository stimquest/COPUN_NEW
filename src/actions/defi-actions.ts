'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { DEFAULT_LITTORAL_SPECIES } from '@/data/littoral-species';

// ==========================================
// DEFIS (Base défis catalog)
// ==========================================

export async function getDefis() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('defis').select('*').eq('actif', true).order('id');
    if (error) { console.error('[getDefis]', error.message); return []; }
    return data;
}

// ==========================================
// USER DEFI VALIDATIONS (Personal progress)
// ==========================================

export async function uploadDefiPhoto(formData: FormData) {
    const supabase = await createClient();
    const file = formData.get('file') as File;
    if (!file) return { success: false, error: 'No file provided' };

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `preuves/${fileName}`;

    const { error } = await supabase.storage.from('defis').upload(filePath, file);
    if (error) { console.error('[uploadDefiPhoto]', error.message); return { success: false, error: error.message }; }

    const { data: { publicUrl } } = supabase.storage.from('defis').getPublicUrl(filePath);
    return { success: true, url: publicUrl };
}

// ==========================================
// STAGE EXPLOITS (Assigned défis to stages)
// ==========================================

export async function addStageExploit(stageId: string, defiId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('stage_exploits').insert({ stage_id: stageId, exploit_id: defiId, status: 'en_cours' });

    if (error) {
        if (error.code === '23505') return { success: false, error: 'Défi déjà assigné' };
        console.error('[addStageExploit]', error.message);
        return { success: false, error: error.message };
    }

    revalidatePath('/stages');
    revalidatePath(`/stages/${stageId}/defis`);
    return { success: true };
}

export async function getStageExploits(stageId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('stage_exploits').select('*, defis(*)').eq('stage_id', stageId).order('created_at', { ascending: true });
    if (error) { console.error('[getStageExploits]', error.message); return []; }
    return data;
}

export async function updateStageExploitStatus(
    stageId: string,
    defiId: string,
    status: 'en_cours' | 'complete',
    preuveUrl?: string
) {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = { status };
    if (status === 'complete') updateData.completed_at = new Date().toISOString();
    if (preuveUrl) {
        const { data: existing } = await supabase
            .from('stage_exploits').select('preuves_url').eq('stage_id', stageId).eq('exploit_id', defiId).single();
        updateData.preuves_url = [...(existing?.preuves_url || []), preuveUrl];
    }

    const { error } = await supabase
        .from('stage_exploits').update(updateData).eq('stage_id', stageId).eq('exploit_id', defiId);
    if (error) { console.error('[updateStageExploitStatus]', error.message); return { success: false, error: error.message }; }

    let pointsAwarded = 0;
    if (status === 'complete') {
        const { data: defi } = await supabase.from('defis').select('spot_fixe').eq('id', defiId).single();
        const points = defi?.spot_fixe ? 3 : 2;
        const awarded = await awardPointsForDefiInternal(supabase, stageId, defiId, points);
        if (awarded) pointsAwarded = points;
    } else {
        // Défi dévalidé : on reprend les points pour que le total reste honnête.
        await revokePointsForDefiInternal(supabase, stageId, defiId);
    }

    revalidatePath('/stages');
    revalidatePath(`/stages/${stageId}/defis`);
    return { success: true, pointsAwarded };
}

export async function removeDefiPhoto(
    stageId: string,
    defiId: string,
    photoUrl: string,
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const marker = '/object/public/defis/';
    const markerIdx = photoUrl.indexOf(marker);
    if (markerIdx !== -1) {
        const storagePath = decodeURIComponent(photoUrl.slice(markerIdx + marker.length));
        await supabase.storage.from('defis').remove([storagePath]);
    }

    const { data: existing } = await supabase
        .from('stage_exploits').select('preuves_url').eq('stage_id', stageId).eq('exploit_id', defiId).single();

    const remaining = (existing?.preuves_url ?? []).filter((u: string) => u !== photoUrl);

    const { error } = await supabase
        .from('stage_exploits')
        .update({
            preuves_url: remaining,
            status: remaining.length === 0 ? 'en_cours' : 'complete',
            completed_at: remaining.length === 0 ? null : undefined,
        })
        .eq('stage_id', stageId)
        .eq('exploit_id', defiId);

    if (error) return { success: false, error: error.message };

    // Plus aucune preuve = défi dévalidé, on reprend aussi les points.
    if (remaining.length === 0) {
        await revokePointsForDefiInternal(supabase, stageId, defiId);
    }

    revalidatePath(`/stages/${stageId}/defis`);
    revalidatePath('/stages');
    return { success: true };
}

export async function removeStageExploit(stageId: string, defiId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('stage_exploits').delete().eq('stage_id', stageId).eq('exploit_id', defiId);
    if (error) { console.error('[removeStageExploit]', error.message); return { success: false, error: error.message }; }
    revalidatePath('/stages');
    revalidatePath(`/stages/${stageId}/defis`);
    return { success: true };
}

// ==========================================
// LEADERBOARD POINTS
// ==========================================

async function awardPointsForDefiInternal(
    supabase: Awaited<ReturnType<typeof createClient>>,
    stageId: string,
    defiId: string,
    points: number
): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Un seul gain par défi et par semaine : revalider (photo supplémentaire, relevé
    // modifié, dévalidation/revalidation) ne doit jamais créditer de nouveaux points.
    const { data: existing } = await supabase
        .from('leaderboard_points')
        .select('id')
        .eq('monitor_id', user.id)
        .eq('stage_id', stageId)
        .eq('defi_id', defiId)
        .limit(1)
        .maybeSingle();
    if (existing) return false;

    // Le club vient du profil du moniteur : les stages n'ont pas de club_id renseigné,
    // s'appuyer dessus laissait toutes les lignes de points sans club.
    const { data: profile } = await supabase
        .from('profiles').select('club_id').eq('id', user.id).maybeSingle();

    await supabase.from('leaderboard_points').insert({
        monitor_id: user.id,
        club_id: profile?.club_id ?? null,
        stage_id: stageId,
        defi_id: defiId,
        points,
        reason: `Défi validé: ${defiId}`,
    });
    return true;
}

/** Retire les points d'un défi dévalidé (nécessite la policy DELETE sur leaderboard_points). */
async function revokePointsForDefiInternal(
    supabase: Awaited<ReturnType<typeof createClient>>,
    stageId: string,
    defiId: string,
) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('leaderboard_points')
        .delete()
        .eq('monitor_id', user.id)
        .eq('stage_id', stageId)
        .eq('defi_id', defiId);
}

export async function awardPointsForDefi(stageId: string, defiId: string) {
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Non authentifié' };

    const { data: defi } = await ctx.supabase.from('defis').select('points').eq('id', defiId).single();
    const points = defi?.points ?? 2;

    await awardPointsForDefiInternal(ctx.supabase, stageId, defiId, points);
    return { success: true, points };
}

export async function getMonitorPoints(monitorId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from('leaderboard_points').select('points').eq('monitor_id', monitorId);
    if (error) return 0;
    return data.reduce((sum, row) => sum + row.points, 0);
}

export async function getLeaderboard(type?: 'monitors', limit?: number): Promise<{ monitor_id: string; full_name: string; club_name: string | null; total_points: number }[]>;
export async function getLeaderboard(type: 'clubs', limit?: number): Promise<{ club_id: string; club_name: string; total_points: number }[]>;
export async function getLeaderboard(type: 'monitors' | 'clubs' = 'monitors', limit = 10): Promise<
    { monitor_id: string; full_name: string; club_name: string | null; total_points: number }[] |
    { club_id: string; club_name: string; total_points: number }[]
> {
    const supabase = await createClient();

    if (type === 'monitors') {
        // NB : pas de join PostgREST profiles(...) ici — la FK leaderboard_points.monitor_id
        // pointe vers auth.users, pas profiles, donc le join implicite échoue. On agrège
        // d'abord les points, puis on charge les profils en une requête séparée.
        const { data, error } = await supabase.from('leaderboard_points').select('monitor_id, points');
        if (error || !data) return [];

        const totals = new Map<string, number>();
        data.forEach((row: Record<string, unknown>) => {
            const id = row.monitor_id as string;
            if (!id) return;
            totals.set(id, (totals.get(id) ?? 0) + (row.points as number));
        });

        const monitorIds = Array.from(totals.keys());
        if (monitorIds.length === 0) return [];

        const { data: profiles } = await supabase
            .from('profiles').select('id, full_name, clubs(name)').in('id', monitorIds);

        const profileMap = new Map<string, { full_name: string | null; club_name: string | null }>();
        (profiles ?? []).forEach((p: Record<string, unknown>) => {
            const club = p.clubs as { name?: string } | null;
            profileMap.set(p.id as string, {
                full_name: (p.full_name as string) ?? null,
                club_name: club?.name ?? null,
            });
        });

        return monitorIds
            .map(id => ({
                monitor_id: id,
                full_name: profileMap.get(id)?.full_name ?? 'Moniteur',
                club_name: profileMap.get(id)?.club_name ?? null,
                total_points: totals.get(id) ?? 0,
            }))
            .sort((a, b) => b.total_points - a.total_points)
            .slice(0, limit);
    } else {
        // On n'agrège PAS sur leaderboard_points.club_id : historiquement les stages n'avaient
        // pas de club_id, donc la plupart des lignes ont club_id null et le classement club
        // ratait les points des moniteurs. On somme par moniteur puis on rattache chaque
        // moniteur au club de son profil.
        const [{ data: points, error }, { data: profiles }] = await Promise.all([
            supabase.from('leaderboard_points').select('monitor_id, points'),
            supabase.from('profiles').select('id, club_id, clubs(name)').not('club_id', 'is', null),
        ]);
        if (error || !points) return [];

        const profileClub = new Map<string, { id: string; name: string }>();
        (profiles ?? []).forEach((p: Record<string, unknown>) => {
            const club = p.clubs as { name?: string } | null;
            profileClub.set(p.id as string, { id: p.club_id as string, name: club?.name ?? 'Club' });
        });

        const byClub = new Map<string, { name: string; total: number }>();
        points.forEach((row: Record<string, unknown>) => {
            const club = profileClub.get(row.monitor_id as string);
            if (!club) return;
            const existing = byClub.get(club.id);
            byClub.set(club.id, { name: club.name, total: (existing?.total ?? 0) + (row.points as number) });
        });

        return Array.from(byClub.entries())
            .map(([id, v]) => ({ club_id: id, club_name: v.name, total_points: v.total }))
            .sort((a, b) => b.total_points - a.total_points)
            .slice(0, limit);
    }
}

// ==========================================
// CLUB OBSERVATION TARGETS (faune défi)
// ==========================================

export async function getClubObservationTargets() {
    const ctx = await requireAuth();
    if (!ctx) return [];

    const { data: profile } = await ctx.supabase.from('profiles').select('club_id').eq('id', ctx.user.id).single();
    if (!profile?.club_id) return [];

    const { data } = await ctx.supabase
        .from('club_observation_targets').select('*').eq('club_id', profile.club_id).order('sort_order');

    // Tant que le club n'a pas personnalisé sa liste, on propose la liste par défaut des
    // espèces courantes du littoral (faune + flore) sans encore l'écrire en base.
    if (!data || data.length === 0) {
        return DEFAULT_LITTORAL_SPECIES.map((s, i) => ({
            id: `default-${i}`,
            club_id: profile.club_id,
            name: s.name,
            categorie: s.categorie,
            sort_order: i,
        }));
    }
    return data;
}

export async function saveClubObservationTargets(targets: { name: string; categorie: string }[]) {
    const ctx = await requireAuth();
    if (!ctx) return { success: false };

    const { data: profile } = await ctx.supabase.from('profiles').select('club_id').eq('id', ctx.user.id).single();
    if (!profile?.club_id) return { success: false, error: 'No club' };

    await ctx.supabase.from('club_observation_targets').delete().eq('club_id', profile.club_id);
    if (targets.length === 0) return { success: true };

    const { data: inserted, error } = await ctx.supabase.from('club_observation_targets').insert(
        targets.map((t, i) => ({ club_id: profile.club_id, name: t.name, categorie: t.categorie, sort_order: i }))
    ).select('id, name, categorie');

    if (error) return { success: false, error: error.message };
    return { success: true, targets: inserted ?? [] };
}

export async function completeFilRougeDefi(
    stageId: string,
    defiId: string,
    structuredData: Record<string, unknown>,
    photoUrl?: string
) {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {
        status: 'complete',
        completed_at: new Date().toISOString(),
        structured_data: structuredData,
    };

    if (photoUrl) {
        const { data: existing } = await supabase
            .from('stage_exploits').select('preuves_url').eq('stage_id', stageId).eq('exploit_id', defiId).single();
        updateData.preuves_url = [...(existing?.preuves_url || []), photoUrl];
    }

    const { error, count } = await supabase
        .from('stage_exploits').update(updateData).eq('stage_id', stageId).eq('exploit_id', defiId);

    if (error) return { success: false, error: error.message };
    if (!count || count === 0) return { success: false, error: 'Exploit introuvable' };

    let pointsAwarded = 0;
    const { data: defi } = await supabase.from('defis').select('points').eq('id', defiId).single();
    if (defi) {
        const awarded = await awardPointsForDefiInternal(supabase, stageId, defiId, defi.points);
        if (awarded) pointsAwarded = defi.points;
    }

    revalidatePath(`/stages/${stageId}/defis`);
    return { success: true, pointsAwarded };
}

// ==========================================
// CLUB SPOTS (GPS reference points for recurring defis)
// ==========================================

export async function getClubSpotsForUser(defiIds: string[]) {
    const ctx = await requireAuth();
    if (!ctx || defiIds.length === 0) return [];

    const { data: profile } = await ctx.supabase.from('profiles').select('club_id').eq('id', ctx.user.id).single();
    if (!profile?.club_id) return [];

    const { data } = await ctx.supabase
        .from('club_spots').select('*').eq('club_id', profile.club_id).in('defi_id', defiIds);
    return data || [];
}

// ==========================================
// FIL ROUGE — Défi de saison du moniteur
// ==========================================

export type FilRougeDefi = {
    id: string;
    description: string;
    instruction: string;
    icon: string;
    tags_theme: string[];
    points: number;
};

export async function getFilRougeDefis(): Promise<FilRougeDefi[]> {
    const supabase = await createClient();
    const { data } = await supabase
        .from('defis').select('id, description, instruction, icon, tags_theme, points').eq('fil_rouge', true).order('id');
    return data ?? [];
}

export async function getMonitorFilRouge(): Promise<string | null> {
    const ctx = await requireAuth();
    if (!ctx) return null;
    const { data } = await ctx.supabase.from('profiles').select('defi_fil_rouge_id').eq('id', ctx.user.id).single();
    return data?.defi_fil_rouge_id ?? null;
}

export async function setMonitorFilRouge(defiId: string | null): Promise<{ success: boolean; error?: string }> {
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Non connecté' };
    const { error } = await ctx.supabase.from('profiles').update({ defi_fil_rouge_id: defiId }).eq('id', ctx.user.id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/profil');
    return { success: true };
}

export type FilRougeEntry = {
    stage_id: string;
    stage_title: string;
    stage_dates: string;
    exploit_id: string;
    status: 'en_cours' | 'complete';
    completed_at: string | null;
    preuves_url: string[];
    notes: string | null;
    created_at: string;
    defi: FilRougeDefi;
};

export async function getFilRougeHistory(): Promise<{ entries: FilRougeEntry[]; defi: FilRougeDefi | null }> {
    const ctx = await requireAuth();
    if (!ctx) return { entries: [], defi: null };

    const { data: profile } = await ctx.supabase.from('profiles').select('defi_fil_rouge_id').eq('id', ctx.user.id).single();
    const defiId = profile?.defi_fil_rouge_id;
    if (!defiId) return { entries: [], defi: null };

    const { data: stages } = await ctx.supabase
        .from('stages').select('id, title, dates').eq('owner_id', ctx.user.id).order('created_at', { ascending: false });
    if (!stages || stages.length === 0) return { entries: [], defi: null };

    const stageIds = stages.map(s => s.id);

    const [{ data: exploits }, { data: defiData }] = await Promise.all([
        ctx.supabase
            .from('stage_exploits')
            .select('stage_id, exploit_id, status, completed_at, preuves_url, notes, created_at')
            .eq('exploit_id', defiId)
            .in('stage_id', stageIds)
            .order('created_at', { ascending: false }),
        ctx.supabase
            .from('defis')
            .select('id, description, instruction, icon, tags_theme, points')
            .eq('id', defiId)
            .single(),
    ]);

    const stageMap = Object.fromEntries(stages.map(s => [s.id, s]));

    const entries: FilRougeEntry[] = (exploits ?? []).map(e => ({
        stage_id: e.stage_id,
        stage_title: stageMap[e.stage_id]?.title ?? 'Stage',
        stage_dates: stageMap[e.stage_id]?.dates ?? '',
        exploit_id: e.exploit_id,
        status: e.status,
        completed_at: e.completed_at,
        preuves_url: e.preuves_url ?? [],
        notes: e.notes ?? null,
        created_at: e.created_at,
        defi: defiData as FilRougeDefi,
    }));

    return { entries, defi: defiData as FilRougeDefi | null };
}

export async function saveClubSpot(defiId: string, lat: number, lng: number, bearing: number | null) {
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Non authentifié' };

    const { data: profile } = await ctx.supabase.from('profiles').select('club_id').eq('id', ctx.user.id).single();
    if (!profile?.club_id) return { success: false, error: 'No club' };

    const { error } = await ctx.supabase
        .from('club_spots')
        .upsert(
            { club_id: profile.club_id, defi_id: defiId, gps_lat: lat, gps_lng: lng, bearing },
            { onConflict: 'club_id,defi_id', ignoreDuplicates: false }
        );

    if (error) return { success: false, error: error.message };
    return { success: true };
}
