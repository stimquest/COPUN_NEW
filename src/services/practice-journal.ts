import { createClient, getCachedUser } from '@/lib/supabase/server';
import { isStageObjectiveExecutionStatus, isStageObjectiveImpactLevel } from '@/lib/stage-objective-review';
import { StageObjectiveExecutionStatus, StageObjectiveImpactLevel } from '@/types';

export type JournalFicheNote = {
    question: string;
    status: StageObjectiveExecutionStatus;
    note: string;
};

export type JournalWeek = {
    id: string;
    title: string;
    dates: string | null;
    closedAt: string;
    workedCount: number;
    totalCount: number;
    highImpactCount: number;
    quizScore: number | null;
    quizTotal: number | null;
    closingNote: string | null;
    ficheNotes: JournalFicheNote[];
};

export type FicheAttempt = {
    closedAt: string;
    weekTitle: string;
    status: StageObjectiveExecutionStatus;
    impact: StageObjectiveImpactLevel | null;
    note: string | null;
};

export type FicheTrajectory = {
    contentId: string;
    question: string;
    attempts: FicheAttempt[];
};

export type PracticeJournal = {
    weeksCount: number;
    insights: string[];
    reminder: { note: string; question: string; weeksAgo: number } | null;
    evolution: { weekTitle: string; worked: number; total: number; highImpact: number }[];
    progressing: FicheTrajectory[];
    resisting: FicheTrajectory[];
    weeks: JournalWeek[];
};

/** Rang de réussite d'une tentative, pour comparer deux passages sur une même fiche. */
function attemptRank(status: StageObjectiveExecutionStatus, impact: StageObjectiveImpactLevel | null): number {
    if (status === 'not_done') return 0;
    if (status === 'partial') return 1;
    if (impact === 'high') return 4;
    if (impact === 'medium') return 3;
    return 2; // done sans impact renseigné ou impact faible
}

/**
 * Construit le « carnet de pratique » personnel du moniteur à partir de ses bilans de semaine :
 * fil chronologique relisible, observations en français, rappel de ses propres notes,
 * et trajectoires des fiches tentées plusieurs fois.
 */
export async function getPracticeJournal(): Promise<PracticeJournal> {
    const empty: PracticeJournal = { weeksCount: 0, insights: [], reminder: null, evolution: [], progressing: [], resisting: [], weeks: [] };
    const supabase = await createClient();
    const user = await getCachedUser();
    if (!user) return empty;

    const { data: allStages } = await supabase
        .from('stages')
        .select('id, title, dates, closed_at, closing_notes, selected_content, created_at')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true });

    const closedStages = (allStages ?? [])
        .filter(s => s.closed_at)
        .sort((a, b) => new Date(a.closed_at!).getTime() - new Date(b.closed_at!).getTime());
    if (closedStages.length === 0) return empty;

    const closedIds = closedStages.map(s => s.id);
    const allContentIds = Array.from(new Set(
        (allStages ?? []).flatMap(s => (s.selected_content ?? []) as string[])
    ));

    const [{ data: reviewRows }, { data: contentRows }, { data: quizRows }, { data: catalogRows }] = await Promise.all([
        supabase
            .from('stage_objective_reviews')
            .select('stage_id, pedagogical_content_id, execution_status, impact_level, note')
            .in('stage_id', closedIds),
        allContentIds.length > 0
            ? supabase.from('pedagogical_content').select('id, question, tags_filtre, source').in('id', allContentIds)
            : Promise.resolve({ data: [] }),
        supabase.from('stage_quizzes').select('stage_id, score_correct, score_total').in('stage_id', closedIds),
        supabase.from('pedagogical_content').select('tags_filtre, source'),
    ]);

    const contentById = new Map((contentRows ?? []).map(c => [c.id, c]));
    const envIds = new Set((contentRows ?? []).filter(c => c.source !== 'custom').map(c => c.id));
    const quizByStage = new Map((quizRows ?? []).map(q => [q.stage_id, q]));

    type Review = { status: StageObjectiveExecutionStatus; impact: StageObjectiveImpactLevel | null; note: string | null };
    const reviewByKey = new Map<string, Review>();
    (reviewRows ?? []).forEach(r => {
        if (!isStageObjectiveExecutionStatus(r.execution_status)) return;
        reviewByKey.set(`${r.stage_id}:${r.pedagogical_content_id}`, {
            status: r.execution_status,
            impact: r.impact_level && isStageObjectiveImpactLevel(r.impact_level) ? r.impact_level : null,
            note: r.note,
        });
    });

    // ── Fil des semaines + évolution ──────────────────────────────────────────
    const weeks: JournalWeek[] = closedStages.map(stage => {
        const ids = ((stage.selected_content ?? []) as string[]).filter(id => envIds.has(id));
        let worked = 0, high = 0;
        const ficheNotes: JournalFicheNote[] = [];
        ids.forEach(id => {
            const review = reviewByKey.get(`${stage.id}:${id}`);
            if (!review) return;
            if (review.status === 'done' || review.status === 'partial') worked += 1;
            if (review.status === 'done' && review.impact === 'high') high += 1;
            if (review.note?.trim()) {
                const content = contentById.get(id);
                if (content) ficheNotes.push({ question: content.question, status: review.status, note: review.note.trim() });
            }
        });
        const quiz = quizByStage.get(stage.id);
        return {
            id: stage.id,
            title: stage.title,
            dates: stage.dates,
            closedAt: stage.closed_at!,
            workedCount: worked,
            totalCount: ids.length,
            highImpactCount: high,
            quizScore: quiz?.score_correct ?? null,
            quizTotal: quiz?.score_total ?? null,
            closingNote: stage.closing_notes?.trim() || null,
            ficheNotes,
        };
    });

    const evolution = weeks.slice(-8).map(w => ({
        weekTitle: w.title,
        worked: w.workedCount,
        total: w.totalCount,
        highImpact: w.highImpactCount,
    }));

    // ── Trajectoires par fiche (≥ 2 tentatives) ───────────────────────────────
    const attemptsByContent = new Map<string, FicheAttempt[]>();
    closedStages.forEach(stage => {
        ((stage.selected_content ?? []) as string[]).filter(id => envIds.has(id)).forEach(id => {
            const review = reviewByKey.get(`${stage.id}:${id}`);
            if (!review) return;
            const list = attemptsByContent.get(id) ?? [];
            list.push({ closedAt: stage.closed_at!, weekTitle: stage.title, status: review.status, impact: review.impact, note: review.note });
            attemptsByContent.set(id, list);
        });
    });

    const progressing: FicheTrajectory[] = [];
    const resisting: FicheTrajectory[] = [];
    attemptsByContent.forEach((attempts, contentId) => {
        if (attempts.length < 2) return;
        const content = contentById.get(contentId);
        if (!content) return;
        const first = attemptRank(attempts[0].status, attempts[0].impact);
        const last = attemptRank(attempts[attempts.length - 1].status, attempts[attempts.length - 1].impact);
        const best = Math.max(...attempts.map(a => attemptRank(a.status, a.impact)));
        const trajectory = { contentId, question: content.question, attempts };
        if (last > first && last >= 2) progressing.push(trajectory);
        else if (best < 2) resisting.push(trajectory);
    });
    progressing.sort((a, b) => b.attempts.length - a.attempts.length);
    resisting.sort((a, b) => b.attempts.length - a.attempts.length);

    // ── Rappel : sa dernière note laissée sur une fiche non reprise depuis ────
    let reminder: PracticeJournal['reminder'] = null;
    for (let i = closedStages.length - 1; i >= 0 && !reminder; i--) {
        const stage = closedStages[i];
        const laterSelections = new Set(
            (allStages ?? [])
                .filter(s => s.id !== stage.id && new Date(s.created_at).getTime() > new Date(stage.created_at).getTime())
                .flatMap(s => (s.selected_content ?? []) as string[])
        );
        for (const id of ((stage.selected_content ?? []) as string[])) {
            const review = reviewByKey.get(`${stage.id}:${id}`);
            if (!review?.note?.trim()) continue;
            if (review.status === 'done') continue;
            if (laterSelections.has(id)) continue;
            const content = contentById.get(id);
            if (!content) continue;
            const weeksAgo = Math.max(1, Math.round((Date.now() - new Date(stage.closed_at!).getTime()) / (7 * 24 * 3600 * 1000)));
            reminder = { note: review.note.trim(), question: content.question, weeksAgo };
            break;
        }
    }

    // ── Observations en français (3 max) ──────────────────────────────────────
    const insights: string[] = [];

    // 1. Réalisme de planification, sur les 4 dernières semaines
    const recent = weeks.slice(-4);
    const avgTotal = recent.reduce((s, w) => s + w.totalCount, 0) / recent.length;
    const avgWorked = recent.reduce((s, w) => s + w.workedCount, 0) / recent.length;
    if (avgTotal >= 5 && avgWorked / avgTotal < 0.5) {
        insights.push(
            `Tu prévois en moyenne ${Math.round(avgTotal)} fiches par semaine mais tu en travailles ${Math.round(avgWorked)} — vise plus petit pour aller au bout.`
        );
    }

    // 2. Notion dominante vs notions jamais abordées
    const workedTagCounts = new Map<string, number>();
    let workedFichesCount = 0;
    closedStages.slice(-6).forEach(stage => {
        ((stage.selected_content ?? []) as string[]).filter(id => envIds.has(id)).forEach(id => {
            const review = reviewByKey.get(`${stage.id}:${id}`);
            if (!review || review.status === 'not_done') return;
            workedFichesCount += 1;
            const content = contentById.get(id);
            ((content?.tags_filtre ?? []) as string[]).forEach(tag => {
                workedTagCounts.set(tag, (workedTagCounts.get(tag) ?? 0) + 1);
            });
        });
    });
    const everWorkedTags = new Set(workedTagCounts.keys());
    const allCatalogTags = new Set<string>();
    (catalogRows ?? []).forEach((c: { tags_filtre?: string[]; source?: string }) => {
        if (c.source === 'custom') return;
        (c.tags_filtre ?? []).forEach(t => allCatalogTags.add(t));
    });
    const neverTags = Array.from(allCatalogTags).filter(t => !everWorkedTags.has(t));
    const topTag = Array.from(workedTagCounts.entries()).sort((a, b) => b[1] - a[1])[0];
    if (topTag && workedFichesCount >= 4 && topTag[1] / workedFichesCount >= 0.5) {
        const suffix = neverTags.length > 0
            ? ` — « ${neverTags.slice(0, 2).join(' », « ')} », jamais encore.`
            : '.';
        insights.push(`« ${topTag[0]} » revient dans ${topTag[1]} de tes ${workedFichesCount} dernières fiches travaillées${suffix}`);
    }

    // 3. Tendance : les 3 dernières semaines vs les 3 précédentes
    if (weeks.length >= 6) {
        const rate = (ws: JournalWeek[]) => {
            const t = ws.reduce((s, w) => s + w.totalCount, 0);
            return t > 0 ? ws.reduce((s, w) => s + w.workedCount, 0) / t : 0;
        };
        const lastRate = rate(weeks.slice(-3));
        const prevRate = rate(weeks.slice(-6, -3));
        if (lastRate - prevRate >= 0.15) insights.push('Tes trois dernières semaines sont nettement plus abouties que les précédentes — ça se voit.');
        else if (prevRate - lastRate >= 0.2) insights.push('Tes dernières semaines aboutissent moins qu\'avant — période chargée, ou objectifs trop ambitieux ?');
    }

    // 4. Régularité, si rien d'autre à dire
    if (insights.length === 0) {
        insights.push(
            weeks.length === 1
                ? 'Première semaine clôturée — ton carnet démarre.'
                : `${weeks.length} semaines clôturées — ton carnet s'étoffe, continue de noter tes ressentis.`
        );
    }

    return {
        weeksCount: weeks.length,
        insights: insights.slice(0, 3),
        reminder,
        evolution,
        progressing: progressing.slice(0, 5),
        resisting: resisting.slice(0, 5),
        weeks: [...weeks].reverse(), // fil du plus récent au plus ancien
    };
}
