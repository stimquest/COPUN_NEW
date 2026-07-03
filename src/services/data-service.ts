import { createClient } from '@/lib/supabase/server';
import { summarizeObjectiveReviews, type ObjectiveAnalyticsInput, type StageObjectiveAnalyticsSummary } from '@/lib/stage-objective-analytics';
import { isStageObjectiveExecutionStatus, isStageObjectiveImpactLevel } from '@/lib/stage-objective-review';
import { PedagogicalContent, StageObjectiveReviewItem } from '@/types';
import { OBSERVATION_TYPES } from '@/data/observations';
import { PILLARS, THEMES_BY_PILLAR } from '@/data/etages';


export async function getStageById(id: string) {
    // Robustness: if ID is not a valid UUID format, return null instead of calling DB
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
        console.warn(`Non-UUID stage ID requested: ${id}`);
        return null;
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from('stages')
        .select('*')
        .eq('id', id)
        .eq('owner_id', user.id) // Enforce ownership
        .maybeSingle(); // null sans erreur si le stage n'existe pas / n'appartient pas au user

    if (error) {
        console.error('Data Error (getStageById):', error.message);
        return null;
    }
    return data;
}

export async function getStages() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from('stages')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Data Error (getStages):', error.message);
        return [];
    }
    return data;
}

export async function getDashboardStages() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: stages, error: stagesError } = await supabase
        .from('stages')
        .select('id, title, level, activity, dates, selected_content, closed_at, closing_notes, created_at')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    if (stagesError || !stages) {
        console.error('Data Error (getDashboardStages):', stagesError?.message);
        return [];
    }

    const stageIds = stages.map(s => s.id);
    if (stageIds.length === 0) return [];

    const [{ data: exploitsData }, { data: reviewsData }, { data: quizData }] = await Promise.all([
        supabase.from('stage_exploits').select('stage_id, status').in('stage_id', stageIds),
        supabase.from('stage_objective_reviews').select('stage_id, execution_status').in('stage_id', stageIds),
        supabase.from('stage_quizzes').select('stage_id, completed_at, score_correct, score_total').in('stage_id', stageIds),
    ]);

    return stages.map(stage => {
        const contentCount = stage.selected_content?.length ?? 0;
        const reviews = (reviewsData ?? []).filter(r => r.stage_id === stage.id);
        const workedCount = reviews.filter(r => r.execution_status === 'done' || r.execution_status === 'partial').length;
        const exploits = (exploitsData ?? []).filter(e => e.stage_id === stage.id);
        const quiz = (quizData ?? []).find(q => q.stage_id === stage.id) ?? null;

        return {
            id: stage.id,
            title: stage.title,
            level: stage.level,
            activity: stage.activity,
            dates: stage.dates,
            closed_at: stage.closed_at,
            created_at: stage.created_at,
            contentCount,
            workedCount,
            exploitsSummary: {
                completed: exploits.filter(e => e.status === 'complete').length,
                total: exploits.length,
            },
            quiz: quiz ? {
                done: !!quiz.completed_at,
                score: quiz.score_correct ?? 0,
                total: quiz.score_total ?? 0,
            } : null,
        };
    });
}

/**
 * Statistiques d'avancement d'un stage pour la carte de pilotage.
 * Progression de transmission, défis validés, quiz fait/score.
 */
export async function getStageCockpitStats(stageId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const [{ data: stage }, { data: exploits }, { data: quiz }, { data: pointsRows }] = await Promise.all([
        supabase.from('stages').select('selected_content, dates').eq('id', stageId).maybeSingle(),
        supabase.from('stage_exploits').select('status').eq('stage_id', stageId),
        supabase.from('stage_quizzes').select('completed_at, score_correct, score_total, points_awarded').eq('stage_id', stageId).maybeSingle(),
        supabase.from('leaderboard_points').select('points').eq('stage_id', stageId),
    ]);

    const selectedContent: string[] = stage?.selected_content ?? [];
    const contentCount = selectedContent.length;

    const defisTotal = exploits?.length ?? 0;
    const defisDone = (exploits ?? []).filter(e => e.status === 'complete').length;

    const stageTotalPoints = (pointsRows ?? []).reduce((sum: number, r: { points: number }) => sum + r.points, 0);

    return {
        contentCount,
        defisTotal,
        defisDone,
        quizDone: !!quiz?.completed_at,
        quizScore: quiz?.score_correct ?? null,
        quizTotal: quiz?.score_total ?? null,
        quizPoints: quiz?.points_awarded ?? null,
        stageTotalPoints,
    };
}

export async function getStageObjectiveReviewItems(stageId: string): Promise<StageObjectiveReviewItem[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: stage, error: stageError } = await supabase
        .from('stages')
        .select('selected_content')
        .eq('id', stageId)
        .eq('owner_id', user.id)
        .maybeSingle(); // null sans erreur si le stage n'existe pas / n'appartient pas au user

    if (stageError) {
        console.error('Error fetching stage objective review items:', stageError.message);
        return [];
    }
    if (!stage) return [];

    const selectedContent: string[] = stage.selected_content ?? [];
    if (selectedContent.length === 0) return [];

    const [{ data: contentRows }, { data: reviewRows }] = await Promise.all([
        supabase.from('pedagogical_content').select('*').in('id', selectedContent),
        supabase
            .from('stage_objective_reviews')
            .select('pedagogical_content_id, execution_status, impact_level, reasons, note')
            .eq('stage_id', stageId),
    ]);

    const contentById = new Map((contentRows as PedagogicalContent[] ?? []).map(content => [content.id, content]));

    const reviewByContentId = new Map(
        (reviewRows ?? []).map(review => [
            review.pedagogical_content_id,
            {
                executionStatus: review.execution_status,
                impactLevel: review.impact_level,
                reasons: review.reasons ?? [],
                note: review.note,
            },
        ])
    );

    return selectedContent
        .map(contentId => {
            const pedagogicalContent = contentById.get(contentId);
            if (!pedagogicalContent) return null;

            return {
                pedagogicalContent,
                review: reviewByContentId.get(contentId) ?? null,
            } satisfies StageObjectiveReviewItem;
        })
        .filter((item): item is StageObjectiveReviewItem => item !== null);
}

export type ThemeTracking = {
    id: string;
    label: string;
    icon: string;
    occurrences: number;
    observationCount: number;
    summary: StageObjectiveAnalyticsSummary;
    /** Nombre de fiches du catalogue COP'UN taguées sur ce thème. */
    catalogCount: number;
    /** Nombre de ces fiches déjà sélectionnées au moins une fois dans une semaine. */
    selectedCount: number;
};

export type PillarTracking = {
    pillarId: string;
    label: string;
    summary: StageObjectiveAnalyticsSummary;
    themes: ThemeTracking[];
};

export type KeywordTracking = {
    tag: string;
    occurrences: number;
    catalogCount: number;
    selectedCount: number;
};

export type StageObjectiveDashboardStats = {
    stagesCount: number;
    summary: StageObjectiveAnalyticsSummary;
    recentStages: Array<{
        id: string;
        title: string;
        dates: string | null;
        closedAt: string | null;
        summary: StageObjectiveAnalyticsSummary;
    }>;
    pillars: PillarTracking[];
    /** Couverture du catalogue COP'UN : fiches déjà sélectionnées au moins une fois vs. total disponible. */
    catalogCoverage: { selected: number; total: number };
    /** Suivi précis par mot-clé (tags_filtre, ex: marée, vent, houle…), trié du plus au moins choisi. */
    keywords: KeywordTracking[];
};

export async function getStageObjectiveDashboardStats(): Promise<StageObjectiveDashboardStats> {
    const emptySummary = summarizeObjectiveReviews([]);
    const empty: StageObjectiveDashboardStats = { stagesCount: 0, summary: emptySummary, recentStages: [], pillars: [], catalogCoverage: { selected: 0, total: 0 }, keywords: [] };
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return empty;

    const { data: stages, error: stagesError } = await supabase
        .from('stages')
        .select('id, title, dates, closed_at, selected_content')
        .eq('owner_id', user.id)
        .not('closed_at', 'is', null)
        .order('closed_at', { ascending: false })
        .limit(20);

    if (stagesError || !stages?.length) return empty;

    const stageIds = stages.map(stage => stage.id);
    const selectedContentIds = Array.from(new Set(
        stages.flatMap(stage => (stage.selected_content ?? []) as string[])
    ));

    const [{ data: reviewRows }, { data: contentRows }, { data: observationRows }, { data: catalogRows }] = await Promise.all([
        supabase
            .from('stage_objective_reviews')
            .select('stage_id, pedagogical_content_id, execution_status, impact_level')
            .in('stage_id', stageIds),
        selectedContentIds.length > 0
            ? supabase.from('pedagogical_content').select('id, dimension, tags_theme, tags_filtre, source').in('id', selectedContentIds)
            : Promise.resolve({ data: [] }),
        supabase.from('week_observations').select('linked_thematic').in('stage_id', stageIds),
        supabase.from('pedagogical_content').select('id, tags_theme, tags_filtre, source'),
    ]);

    const reviewByKey = new Map<string, ObjectiveAnalyticsInput>();
    (reviewRows ?? []).forEach(review => {
        const executionStatus = isStageObjectiveExecutionStatus(review.execution_status) ? review.execution_status : null;
        const impactLevel = review.impact_level && isStageObjectiveImpactLevel(review.impact_level) ? review.impact_level : null;
        reviewByKey.set(`${review.stage_id}:${review.pedagogical_content_id}`, { executionStatus, impactLevel });
    });

    // Les fiches sportives créées par le moniteur (source==='custom') ne sont pas des
    // objectifs environnementaux COP'UN : elles sont exclues de ces statistiques pédagogiques.
    const envContentIds = new Set((contentRows ?? []).filter(c => c.source !== 'custom').map(c => c.id));

    // Couverture du catalogue : combien de fiches COP'UN (par thème et au global) ont déjà été
    // sélectionnées au moins une fois, par rapport à l'ensemble des fiches disponibles.
    const catalogFiches = (catalogRows ?? []).filter(c => c.source !== 'custom');
    const catalogFicheIdsByTheme = new Map<string, Set<string>>();
    const catalogFicheIdsByTag = new Map<string, Set<string>>();
    catalogFiches.forEach(c => {
        ((c.tags_theme ?? []) as string[]).forEach(themeId => {
            const set = catalogFicheIdsByTheme.get(themeId) ?? new Set<string>();
            set.add(c.id);
            catalogFicheIdsByTheme.set(themeId, set);
        });
        ((c.tags_filtre ?? []) as string[]).forEach(tag => {
            const set = catalogFicheIdsByTag.get(tag) ?? new Set<string>();
            set.add(c.id);
            catalogFicheIdsByTag.set(tag, set);
        });
    });
    const catalogCoverage = {
        selected: envContentIds.size,
        total: catalogFiches.length,
    };

    const dimensionByContentId = new Map((contentRows ?? []).map(content => [content.id, content.dimension ?? 'Sans dimension']));
    const themesByContentId = new Map((contentRows ?? []).map(content => [content.id, (content.tags_theme ?? []) as string[]]));
    const tagsByContentId = new Map((contentRows ?? []).map(content => [content.id, (content.tags_filtre ?? []) as string[]]));
    const allInputs: ObjectiveAnalyticsInput[] = [];
    const dimensionInputs = new Map<string, ObjectiveAnalyticsInput[]>();
    const themeInputs = new Map<string, ObjectiveAnalyticsInput[]>();
    const tagInputs = new Map<string, ObjectiveAnalyticsInput[]>();

    const recentStages = stages.map(stage => {
        const stageInputs = ((stage.selected_content ?? []) as string[])
            .filter(contentId => envContentIds.has(contentId))
            .map(contentId => {
                const input = reviewByKey.get(`${stage.id}:${contentId}`) ?? { executionStatus: null, impactLevel: null };
                const dimension = dimensionByContentId.get(contentId) ?? 'Sans dimension';
                allInputs.push(input);
                dimensionInputs.set(dimension, [...(dimensionInputs.get(dimension) ?? []), input]);
                // Une fiche peut être rattachée à un thème hors de son propre pilier (ex: une fiche
                // COMPRENDRE qui croise aussi un thème OBSERVER) : on l'attribue à chacun de ses thèmes.
                (themesByContentId.get(contentId) ?? []).forEach(themeId => {
                    themeInputs.set(themeId, [...(themeInputs.get(themeId) ?? []), input]);
                });
                (tagsByContentId.get(contentId) ?? []).forEach(tag => {
                    tagInputs.set(tag, [...(tagInputs.get(tag) ?? []), input]);
                });
                return input;
            });

        return {
            id: stage.id,
            title: stage.title,
            dates: stage.dates,
            closedAt: stage.closed_at,
            summary: summarizeObjectiveReviews(stageInputs),
        };
    });

    // Retours terrain liés à chaque thématique — linked_thematic partage le même référentiel
    // que tags_theme (les 9 thèmes des 3 piliers COP'UN), ce qui permet de croiser les deux.
    const observationCountByTheme = new Map<string, number>();
    (observationRows ?? []).forEach(o => {
        if (!o.linked_thematic) return;
        observationCountByTheme.set(o.linked_thematic, (observationCountByTheme.get(o.linked_thematic) ?? 0) + 1);
    });

    // Suivi organisé par pilier COP'UN (Comprendre/Observer/Protéger), puis par thème —
    // le même référentiel que /program et le bilan, plutôt qu'un nuage de tags libres.
    const pillars: PillarTracking[] = PILLARS.map(pillar => {
        const themes: ThemeTracking[] = (THEMES_BY_PILLAR[pillar.id] ?? []).map(theme => {
            const inputs = themeInputs.get(theme.id) ?? [];
            const catalogIds = catalogFicheIdsByTheme.get(theme.id) ?? new Set<string>();
            const selectedIds = Array.from(catalogIds).filter(id => envContentIds.has(id));
            return {
                id: theme.id,
                label: theme.label,
                icon: theme.icon,
                occurrences: inputs.filter(i => i.executionStatus).length,
                observationCount: observationCountByTheme.get(theme.id) ?? 0,
                summary: summarizeObjectiveReviews(inputs),
                catalogCount: catalogIds.size,
                selectedCount: selectedIds.length,
            };
        });

        return {
            pillarId: pillar.id,
            label: pillar.label,
            summary: summarizeObjectiveReviews(dimensionInputs.get(pillar.id) ?? []),
            themes,
        };
    });

    // Suivi précis par mot-clé (tags_filtre) — ex: « marée », « vent », « houle » — pour repérer
    // si le moniteur se concentre toujours sur les mêmes notions sans jamais varier.
    const keywords: KeywordTracking[] = Array.from(catalogFicheIdsByTag.keys())
        .map(tag => {
            const catalogIds = catalogFicheIdsByTag.get(tag) ?? new Set<string>();
            const selectedIds = Array.from(catalogIds).filter(id => envContentIds.has(id));
            const inputs = tagInputs.get(tag) ?? [];
            return {
                tag,
                occurrences: inputs.filter(i => i.executionStatus).length,
                catalogCount: catalogIds.size,
                selectedCount: selectedIds.length,
            };
        })
        .sort((a, b) => b.occurrences - a.occurrences);

    return {
        stagesCount: stages.length,
        summary: summarizeObjectiveReviews(allInputs),
        recentStages: recentStages.slice(0, 5),
        pillars,
        catalogCoverage,
        keywords,
    };
}

export type ObservationsDashboardStats = {
    totalObservations: number;
    byType: { type: string; label: string; icon: string; count: number }[];
    topSpecies: { name: string; count: number; type: string }[];
};

/**
 * Agrège les retours terrain (observations naturalistes) de toutes les semaines du moniteur
 * — y compris les semaines en cours, contrairement au suivi pédagogique qui ne porte que sur
 * les semaines clôturées, car une observation a une valeur scientifique dès sa saisie.
 */
export async function getObservationsDashboardStats(): Promise<ObservationsDashboardStats> {
    const empty: ObservationsDashboardStats = { totalObservations: 0, byType: [], topSpecies: [] };
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return empty;

    const { data: stages } = await supabase.from('stages').select('id').eq('owner_id', user.id);
    if (!stages?.length) return empty;
    const stageIds = stages.map(s => s.id);

    const { data: observations } = await supabase
        .from('week_observations')
        .select('observation_type, species_label, species_uncertain, target_id')
        .in('stage_id', stageIds);

    if (!observations?.length) return empty;

    const targetIds = Array.from(new Set(observations.map(o => o.target_id).filter((id): id is string => Boolean(id))));
    const targetNames = new Map<string, string>();
    if (targetIds.length > 0) {
        const { data: targets } = await supabase.from('club_observation_targets').select('id, name').in('id', targetIds);
        (targets ?? []).forEach(t => targetNames.set(t.id, t.name));
    }

    const byTypeCounts = new Map<string, number>();
    const speciesCounts = new Map<string, { name: string; type: string; count: number }>();

    observations.forEach(o => {
        if (!o.observation_type) return;
        byTypeCounts.set(o.observation_type, (byTypeCounts.get(o.observation_type) ?? 0) + 1);

        const name = (o.target_id && targetNames.get(o.target_id))
            || o.species_label
            || (o.species_uncertain ? 'Espèce non identifiée' : null);
        if (!name) return;

        const key = `${o.observation_type}:${name}`;
        const existing = speciesCounts.get(key) ?? { name, type: o.observation_type, count: 0 };
        existing.count += 1;
        speciesCounts.set(key, existing);
    });

    const byType = OBSERVATION_TYPES
        .map(t => ({ type: t.value, label: t.label, icon: t.icon, count: byTypeCounts.get(t.value) ?? 0 }))
        .filter(t => t.count > 0)
        .sort((a, b) => b.count - a.count);

    const topSpecies = Array.from(speciesCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

    return { totalObservations: observations.length, byType, topSpecies };
}

export async function getPedagogicalPool() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('pedagogical_content')
        .select('*');

    if (error) {
        console.error('Error fetching pool:', error);
        return [];
    }
    return data;
}

export async function getPedagogicalContentByIds(ids: string[]) {
    if (!ids || ids.length === 0) return [];
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('pedagogical_content')
        .select('*')
        .in('id', ids);

    if (error) {
        console.error('Error fetching content by ids:', error);
        return [];
    }
    return data;
}

