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
        .select('*')
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
        .select('*')
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
        .select('*, defis(*)')
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
        // Append to preuves_url array
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

    // Award points when défi is completed
    if (status === 'complete') {
        const { data: defi } = await supabase
            .from('defis')
            .select('type_preuve')
            .eq('id', defiId)
            .single();

        if (defi) {
            await awardPointsForDefiInternal(supabase, stageId, defiId, defi.type_preuve);
        }
    }

    revalidatePath(`/stages/${stageId}`);
    revalidatePath(`/stages/${stageId}/defis`);
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

const POINTS_BY_PROOF_TYPE: Record<string, number> = {
    photo: 2,
    checkbox: 1,
    action: 1,
    quiz: 1,
};

// Internal helper using existing supabase client
async function awardPointsForDefiInternal(
    supabase: Awaited<ReturnType<typeof createClient>>,
    stageId: string,
    defiId: string,
    proofType: string
) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: stage } = await supabase
        .from('stages')
        .select('club_id')
        .eq('id', stageId)
        .single();

    const points = POINTS_BY_PROOF_TYPE[proofType] || 1;

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
    proofType: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    const { data: stage } = await supabase
        .from('stages')
        .select('club_id')
        .eq('id', stageId)
        .single();

    const points = POINTS_BY_PROOF_TYPE[proofType] || 1;

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

export async function getLeaderboard(type: 'monitors' | 'clubs' = 'monitors', limit = 10) {
    const supabase = await createClient();

    if (type === 'monitors') {
        const { data, error } = await supabase
            .from('leaderboard_points')
            .select('monitor_id, points');

        if (error || !data) return [];

        const byMonitor = new Map<string, number>();
        data.forEach(row => {
            byMonitor.set(row.monitor_id, (byMonitor.get(row.monitor_id) || 0) + row.points);
        });

        return Array.from(byMonitor.entries())
            .map(([id, pts]) => ({ monitor_id: id, total_points: pts }))
            .sort((a, b) => b.total_points - a.total_points)
            .slice(0, limit);
    } else {
        const { data, error } = await supabase
            .from('leaderboard_points')
            .select('club_id, points')
            .not('club_id', 'is', null);

        if (error || !data) return [];

        const byClub = new Map<string, number>();
        data.forEach(row => {
            if (row.club_id) {
                byClub.set(row.club_id, (byClub.get(row.club_id) || 0) + row.points);
            }
        });

        return Array.from(byClub.entries())
            .map(([id, pts]) => ({ club_id: id, total_points: pts }))
            .sort((a, b) => b.total_points - a.total_points)
            .slice(0, limit);
    }
}
