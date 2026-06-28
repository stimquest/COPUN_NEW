'use server';

import { createClient } from '@/lib/supabase/server';

async function requireAdminOrClubAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, club_id')
        .eq('id', user.id)
        .single();
    if (!profile || !['admin', 'club_admin'].includes(profile.role)) return null;
    return { user, supabase, role: profile.role, club_id: profile.club_id as string | null };
}

export type ReportingData = {
    // Totaux globaux
    nb_stages: number;
    nb_stagiaires_total: number;
    nb_moniteurs_actifs: number;
    nb_clubs_actifs: number;
    nb_defis_valides: number;
    nb_quiz_completes: number;
    score_quiz_moyen: number | null;

    // Par club
    par_club: {
        club_id: string;
        club_name: string;
        nb_stages: number;
        nb_stagiaires: number;
        nb_moniteurs: number;
        nb_defis: number;
        score_quiz_moyen: number | null;
    }[];

    // Par thématique défi
    par_thematique: {
        defi_id: string;
        nb_validations: number;
    }[];

    // Évolution mensuelle
    par_mois: {
        mois: string;
        nb_stages: number;
        nb_stagiaires: number;
        nb_defis: number;
    }[];
};

export async function getReportingData(annee?: number): Promise<{ data?: ReportingData; error?: string; role?: string }> {
    const ctx = await requireAdminOrClubAdmin();
    if (!ctx) return { error: 'Accès refusé.' };

    const { supabase, role, club_id: myClubId } = ctx;
    const year = annee ?? new Date().getFullYear();
    const dateStart = `${year}-01-01`;
    const dateEnd = `${year}-12-31`;

    // Pour un club_admin : on récupère d'abord les moniteurs de son club
    let ownerFilter: string[] | null = null;
    if (role === 'club_admin' && myClubId) {
        const { data: clubMembers } = await supabase
            .from('profiles')
            .select('id')
            .eq('club_id', myClubId);
        ownerFilter = (clubMembers ?? []).map(p => p.id);
    }

    // Stages de l'année
    let stagesQuery = supabase
        .from('stages')
        .select('id, nb_stagiaires, owner_id, created_at')
        .gte('created_at', dateStart)
        .lte('created_at', dateEnd);

    if (ownerFilter !== null) {
        stagesQuery = ownerFilter.length > 0
            ? stagesQuery.in('owner_id', ownerFilter)
            : stagesQuery.in('owner_id', ['__none__']);
    }

    const { data: stages, error: stagesError } = await stagesQuery;

    if (stagesError) return { error: stagesError.message };

    const stageIds = (stages ?? []).map(s => s.id);

    // club_id vient du profil du moniteur, pas du stage
    const ownerIds = [...new Set((stages ?? []).map(s => s.owner_id).filter(Boolean))];
    const { data: ownerProfiles } = await supabase
        .from('profiles')
        .select('id, club_id')
        .in('id', ownerIds.length > 0 ? ownerIds : ['__none__']);
    const ownerClubMap = Object.fromEntries((ownerProfiles ?? []).map(p => [p.id, p.club_id]));

    // Points / défis validés sur ces stages
    const { data: points } = await supabase
        .from('leaderboard_points')
        .select('club_id, defi_id, monitor_id, stage_id, created_at')
        .in('stage_id', stageIds.length > 0 ? stageIds : ['__none__']);

    // Quiz complétés sur ces stages
    const { data: quizzes } = await supabase
        .from('stage_quizzes')
        .select('stage_id, score_correct, score_total, completed_at')
        .in('stage_id', stageIds.length > 0 ? stageIds : ['__none__'])
        .not('completed_at', 'is', null);

    // Clubs
    const { data: clubs } = await supabase
        .from('clubs')
        .select('id, name');

    const clubMap = Object.fromEntries((clubs ?? []).map(c => [c.id, c.name]));

    // ── Calculs globaux ──────────────────────────────────────────────────────
    const stagesArr = stages ?? [];
    const pointsArr = points ?? [];
    const quizzesArr = quizzes ?? [];

    const nb_stagiaires_total = stagesArr.reduce((sum, s) => sum + (s.nb_stagiaires ?? 0), 0);
    const moniteurs_actifs = new Set(stagesArr.map(s => s.owner_id));
    const clubs_actifs = new Set(stagesArr.map(s => ownerClubMap[s.owner_id]).filter(Boolean));

    const scores_valides = quizzesArr.filter(q => q.score_total > 0);
    const score_quiz_moyen = scores_valides.length > 0
        ? Math.round(scores_valides.reduce((sum, q) => sum + (q.score_correct / q.score_total) * 100, 0) / scores_valides.length)
        : null;

    // ── Par club ─────────────────────────────────────────────────────────────
    const clubStats: Record<string, {
        club_id: string; club_name: string;
        stages: Set<string>; stagiaires: number;
        moniteurs: Set<string>; defis: number;
        quiz_scores: number[];
    }> = {};

    for (const s of stagesArr) {
        const cid = ownerClubMap[s.owner_id] ?? 'sans_club';
        if (!clubStats[cid]) clubStats[cid] = {
            club_id: cid,
            club_name: clubMap[cid] ?? 'Sans club',
            stages: new Set(), stagiaires: 0,
            moniteurs: new Set(), defis: 0, quiz_scores: [],
        };
        clubStats[cid].stages.add(s.id);
        clubStats[cid].stagiaires += s.nb_stagiaires ?? 0;
        clubStats[cid].moniteurs.add(s.owner_id);
    }

    for (const p of pointsArr) {
        const cid = p.club_id ?? 'sans_club';
        if (clubStats[cid]) clubStats[cid].defis++;
    }

    for (const q of quizzesArr) {
        const stage = stagesArr.find(s => s.id === q.stage_id);
        if (!stage) continue;
        const cid = ownerClubMap[stage.owner_id] ?? 'sans_club';
        if (clubStats[cid] && q.score_total > 0) {
            clubStats[cid].quiz_scores.push(Math.round((q.score_correct / q.score_total) * 100));
        }
    }

    const par_club = Object.values(clubStats).map(c => ({
        club_id: c.club_id,
        club_name: c.club_name,
        nb_stages: c.stages.size,
        nb_stagiaires: c.stagiaires,
        nb_moniteurs: c.moniteurs.size,
        nb_defis: c.defis,
        score_quiz_moyen: c.quiz_scores.length > 0
            ? Math.round(c.quiz_scores.reduce((a, b) => a + b, 0) / c.quiz_scores.length)
            : null,
    })).sort((a, b) => b.nb_stages - a.nb_stages);

    // ── Par thématique ───────────────────────────────────────────────────────
    const defiCount: Record<string, number> = {};
    for (const p of pointsArr) {
        if (p.defi_id) defiCount[p.defi_id] = (defiCount[p.defi_id] ?? 0) + 1;
    }
    const par_thematique = Object.entries(defiCount)
        .map(([defi_id, nb_validations]) => ({ defi_id, nb_validations }))
        .sort((a, b) => b.nb_validations - a.nb_validations);

    // ── Par mois ─────────────────────────────────────────────────────────────
    const moisStats: Record<string, { nb_stages: number; nb_stagiaires: number; nb_defis: number }> = {};
    for (let m = 1; m <= 12; m++) {
        const key = `${year}-${String(m).padStart(2, '0')}`;
        moisStats[key] = { nb_stages: 0, nb_stagiaires: 0, nb_defis: 0 };
    }
    for (const s of stagesArr) {
        const key = s.created_at.slice(0, 7);
        if (moisStats[key]) {
            moisStats[key].nb_stages++;
            moisStats[key].nb_stagiaires += s.nb_stagiaires ?? 0;
        }
    }
    for (const p of pointsArr) {
        const key = (p.created_at as string).slice(0, 7);
        if (moisStats[key]) moisStats[key].nb_defis++;
    }
    const par_mois = Object.entries(moisStats).map(([mois, v]) => ({ mois, ...v }));

    return {
        data: {
            nb_stages: stagesArr.length,
            nb_stagiaires_total,
            nb_moniteurs_actifs: moniteurs_actifs.size,
            nb_clubs_actifs: clubs_actifs.size,
            nb_defis_valides: pointsArr.length,
            nb_quiz_completes: quizzesArr.length,
            score_quiz_moyen,
            par_club,
            par_thematique,
            par_mois,
        },
    };
}
