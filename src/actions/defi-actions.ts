'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ==========================================
// DEFIS (Base défis catalog)
// ==========================================

export async function getDefis() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('defis')
        .select('id, description, instruction, type_preuve, icon, tags_theme, stage_type, spot_fixe, terrain_temps_reel, points')
        .order('id');

    if (error) {
        console.error('Error fetching defis:', error);
        return [];
    }
    return data;
}

export async function getDefisForStageType(stageType: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('defis')
        .select('id, description, instruction, type_preuve, icon, tags_theme, stage_type, spot_fixe, terrain_temps_reel, points')
        .contains('stage_type', [stageType])
        .order('id');

    if (error) {
        console.error('Error fetching defis for stage type:', error);
        return [];
    }
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

    const { error } = await supabase.storage
        .from('defis')
        .upload(filePath, file);

    if (error) {
        console.error('Error uploading photo:', error);
        return { success: false, error: error.message };
    }

    const { data: { publicUrl } } = supabase.storage
        .from('defis')
        .getPublicUrl(filePath);

    return { success: true, url: publicUrl };
}

export async function validateDefi(defiId: string, proofUrl?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase
        .from('user_defi_validations')
        .insert({
            user_id: user.id,
            defi_id: defiId,
            proof_url: proofUrl
        });

    if (error) {
        if (error.code === '23505') {
            return { success: true, message: 'Already validated' };
        }
        console.error('Error validating defi:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/session/[id]');
    return { success: true };
}

export async function getUserDefiValidations() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from('user_defi_validations')
        .select('defi_id')
        .eq('user_id', user.id);

    if (error) return [];
    return data.map(v => v.defi_id);
}

// ==========================================
// STAGE EXPLOITS (Assigned défis to stages)
// ==========================================

export async function addStageExploit(stageId: string, defiId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('stage_exploits')
        .insert({
            stage_id: stageId,
            exploit_id: defiId,
            status: 'en_cours'
        });

    if (error) {
        if (error.code === '23505') {
            return { success: false, error: 'Défi déjà assigné' };
        }
        console.error('Error adding stage exploit:', error);
        return { success: false, error: error.message };
    }

    revalidatePath(`/stages/${stageId}`);
    revalidatePath(`/stages/${stageId}/defis`);
    return { success: true };
}

export async function getStageExploits(stageId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('stage_exploits')
        .select('*, defis(id, description, instruction, type_preuve, icon, tags_theme, stage_type, spot_fixe, terrain_temps_reel, points)')
        .eq('stage_id', stageId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching stage exploits:', error);
        return [];
    }
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
    if (status === 'complete') {
        updateData.completed_at = new Date().toISOString();
    }

    if (preuveUrl) {
        const { data: existing } = await supabase
            .from('stage_exploits')
            .select('preuves_url')
            .eq('stage_id', stageId)
            .eq('exploit_id', defiId)
            .single();

        const currentProofs = existing?.preuves_url || [];
        updateData.preuves_url = [...currentProofs, preuveUrl];
    }

    const { error } = await supabase
        .from('stage_exploits')
        .update(updateData)
        .eq('stage_id', stageId)
        .eq('exploit_id', defiId);

    if (error) {
        console.error('Error updating stage exploit:', error);
        return { success: false, error: error.message };
    }

    revalidatePath(`/stages/${stageId}`);
    revalidatePath(`/stages/${stageId}/defis`);
    return { success: true };
}

export async function removeDefiPhoto(
    stageId: string,
    defiId: string,
    photoUrl: string,
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // Extract storage path from public URL (everything after "/object/public/defis/")
    const marker = '/object/public/defis/';
    const markerIdx = photoUrl.indexOf(marker);
    if (markerIdx !== -1) {
        const storagePath = decodeURIComponent(photoUrl.slice(markerIdx + marker.length));
        await supabase.storage.from('defis').remove([storagePath]);
        // Ignore storage error — file may already be gone
    }

    // Remove URL from preuves_url array and revert status to en_cours
    const { data: existing } = await supabase
        .from('stage_exploits')
        .select('preuves_url')
        .eq('stage_id', stageId)
        .eq('exploit_id', defiId)
        .single();

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

    revalidatePath(`/session/${stageId}`);
    revalidatePath(`/stages/${stageId}`);
    return { success: true };
}

export async function removeStageExploit(stageId: string, defiId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('stage_exploits')
        .delete()
        .eq('stage_id', stageId)
        .eq('exploit_id', defiId);

    if (error) {
        console.error('Error removing stage exploit:', error);
        return { success: false, error: error.message };
    }

    revalidatePath(`/stages/${stageId}`);
    revalidatePath(`/stages/${stageId}/defis`);
    return { success: true };
}

// ==========================================
// LEADERBOARD POINTS
// ==========================================

// Internal helper using existing supabase client
async function awardPointsForDefiInternal(
    supabase: Awaited<ReturnType<typeof createClient>>,
    stageId: string,
    defiId: string,
    points: number
) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: stage } = await supabase
        .from('stages')
        .select('club_id')
        .eq('id', stageId)
        .single();

    await supabase
        .from('leaderboard_points')
        .insert({
            monitor_id: user.id,
            club_id: stage?.club_id || null,
            stage_id: stageId,
            defi_id: defiId,
            points,
            reason: `Défi validé: ${defiId}`
        });
}

export async function awardPointsForDefi(
    stageId: string,
    defiId: string,
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    const [{ data: stage }, { data: defi }] = await Promise.all([
        supabase.from('stages').select('club_id').eq('id', stageId).single(),
        supabase.from('defis').select('points').eq('id', defiId).single(),
    ]);

    const points = defi?.points ?? 2;

    const { error } = await supabase
        .from('leaderboard_points')
        .insert({
            monitor_id: user.id,
            club_id: stage?.club_id || null,
            stage_id: stageId,
            defi_id: defiId,
            points,
            reason: `Défi validé: ${defiId}`
        });

    if (error) {
        console.error('Error awarding points:', error);
        return { success: false, error: error.message };
    }

    return { success: true, points };
}

export async function getMonitorPoints(monitorId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('leaderboard_points')
        .select('points')
        .eq('monitor_id', monitorId);

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
        const { data, error } = await supabase
            .from('leaderboard_points')
            .select('monitor_id, points');

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
            .from('profiles')
            .select('id, full_name, clubs(name)')
            .in('id', monitorIds);

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
        const { data, error } = await supabase
            .from('leaderboard_points')
            .select('club_id, points, clubs(name)')
            .not('club_id', 'is', null);

        if (error || !data) return [];

        const byClub = new Map<string, { name: string; total: number }>();
        data.forEach((row: Record<string, unknown>) => {
            if (!row.club_id) return;
            const id = row.club_id as string;
            const club = row.clubs as { name?: string } | null;
            const existing = byClub.get(id);
            byClub.set(id, {
                name: club?.name ?? 'Club',
                total: (existing?.total ?? 0) + (row.points as number),
            });
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: profile } = await supabase
        .from('profiles').select('club_id').eq('id', user.id).single();
    if (!profile?.club_id) return [];

    const { data } = await supabase
        .from('club_observation_targets')
        .select('*')
        .eq('club_id', profile.club_id)
        .order('sort_order');
    return data || [];
}

export async function saveClubObservationTargets(
    targets: { name: string; categorie: string }[]
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const { data: profile } = await supabase
        .from('profiles').select('club_id').eq('id', user.id).single();
    if (!profile?.club_id) return { success: false, error: 'No club' };

    await supabase.from('club_observation_targets').delete().eq('club_id', profile.club_id);

    if (targets.length === 0) return { success: true };

    const { data: inserted, error } = await supabase.from('club_observation_targets').insert(
        targets.map((t, i) => ({
            club_id: profile.club_id,
            name: t.name,
            categorie: t.categorie,
            sort_order: i,
        }))
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
            .from('stage_exploits')
            .select('preuves_url')
            .eq('stage_id', stageId)
            .eq('exploit_id', defiId)
            .single();
        updateData.preuves_url = [...(existing?.preuves_url || []), photoUrl];
    }

    const { error, count } = await supabase
        .from('stage_exploits')
        .update(updateData)
        .eq('stage_id', stageId)
        .eq('exploit_id', defiId);

    if (error) return { success: false, error: error.message };
    if (!count || count === 0) return { success: false, error: 'Exploit introuvable' };

    const { data: defi } = await supabase
        .from('defis').select('points').eq('id', defiId).single();
    if (defi) await awardPointsForDefiInternal(supabase, stageId, defiId, defi.points);

    revalidatePath(`/stages/${stageId}/defis`);
    return { success: true };
}

// ==========================================
// CLUB SPOTS (GPS reference points for recurring defis)
// ==========================================

export async function getClubSpotsForUser(defiIds: string[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || defiIds.length === 0) return [];

    const { data: profile } = await supabase
        .from('profiles')
        .select('club_id')
        .eq('id', user.id)
        .single();

    if (!profile?.club_id) return [];

    const { data } = await supabase
        .from('club_spots')
        .select('*')
        .eq('club_id', profile.club_id)
        .in('defi_id', defiIds);

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
        .from('defis')
        .select('id, description, instruction, icon, tags_theme, points')
        .eq('fil_rouge', true)
        .order('id');
    return data ?? [];
}

export async function getMonitorFilRouge(): Promise<string | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
        .from('profiles')
        .select('defi_fil_rouge_id')
        .eq('id', user.id)
        .single();
    return data?.defi_fil_rouge_id ?? null;
}

export async function setMonitorFilRouge(defiId: string | null): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Non connecté' };
    const { error } = await supabase
        .from('profiles')
        .update({ defi_fil_rouge_id: defiId })
        .eq('id', user.id);
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { entries: [], defi: null };

    const { data: profile } = await supabase
        .from('profiles')
        .select('defi_fil_rouge_id')
        .eq('id', user.id)
        .single();

    const defiId = profile?.defi_fil_rouge_id;
    if (!defiId) return { entries: [], defi: null };

    // Récupère tous les stages du moniteur
    const { data: stages } = await supabase
        .from('stages')
        .select('id, title, dates')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    if (!stages || stages.length === 0) return { entries: [], defi: null };

    const stageIds = stages.map(s => s.id);

    // Tous les exploits du défi fil rouge sur ces stages
    const { data: exploits } = await supabase
        .from('stage_exploits')
        .select('stage_id, exploit_id, status, completed_at, preuves_url, notes, created_at')
        .eq('exploit_id', defiId)
        .in('stage_id', stageIds)
        .order('created_at', { ascending: false });

    // Le défi lui-même
    const { data: defiData } = await supabase
        .from('defis')
        .select('id, description, instruction, icon, tags_theme, points')
        .eq('id', defiId)
        .single();

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

export async function saveClubSpot(
    defiId: string,
    lat: number,
    lng: number,
    bearing: number | null
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('club_id')
        .eq('id', user.id)
        .single();

    if (!profile?.club_id) return { success: false, error: 'No club' };

    const { error } = await supabase
        .from('club_spots')
        .upsert(
            { club_id: profile.club_id, defi_id: defiId, gps_lat: lat, gps_lng: lng, bearing },
            { onConflict: 'club_id,defi_id', ignoreDuplicates: false }
        );

    if (error) return { success: false, error: error.message };
    return { success: true };
}
