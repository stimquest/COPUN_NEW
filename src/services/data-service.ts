import { createClient } from '@/lib/supabase/server';
import { summarizeObjectiveReviews, type ObjectiveAnalyticsInput, type StageObjectiveAnalyticsSummary } from '@/lib/stage-objective-analytics';
import { isStageObjectiveExecutionStatus, isStageObjectiveImpactLevel } from '@/lib/stage-objective-review';
import { Session, SessionStep, PedagogicalContent, StageObjectiveReviewItem, TopicTracking } from '@/types';


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

    // Fetch stages with their basic info
    const { data: stages, error: stagesError } = await supabase
        .from('stages')
        .select(`
            id,
            title,
            level,
            dates,
            selected_content,
            created_at
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    if (stagesError || !stages) {
        console.error('Data Error (getDashboardStages):', stagesError?.message);
        return [];
    }

    // Now, fetch all exploits for these stages
    const stageIds = stages.map(s => s.id);

    // We get stage exploits for the connected user's stages
    const { data: exploitsData } = await supabase
        .from('stage_exploits')
        .select(`
            stage_id,
            status
        `)
        .in('stage_id', stageIds);

    // We get session links (for ordering + session count)
    const { data: sessionsData } = await supabase
        .from('sessions')
        .select(`
            id,
            stage_id,
            session_order
        `)
        .in('stage_id', stageIds);

    // Fetch validated content_ids by this user across all stage sessions
    const sessionIds = sessionsData?.map(s => s.id) || [];
    const { data: validationsData } = sessionIds.length > 0
        ? await supabase
            .from('user_validations')
            .select('session_id, content_id')
            .eq('user_id', user.id)
            .in('session_id', sessionIds)
        : { data: [] };

    // Get the content pool just to extract themes if possible (optimized)
    // To limit payload, we only fetch content IDs that are actually selected in stages
    const allSelectedContentIds = new Set<string>();
    stages.forEach(s => s.selected_content?.forEach((id: string) => allSelectedContentIds.add(id)));

    const contentThemeMap = new Map<string, string[]>();
    if (allSelectedContentIds.size > 0) {
        const { data: contentData } = await supabase
            .from('pedagogical_content')
            .select('id, tags_theme')
            .in('id', Array.from(allSelectedContentIds));

        if (contentData) {
            contentData.forEach(c => contentThemeMap.set(c.id, c.tags_theme || []));
        }
    }

    // Process and merge the data
    const enrichedStages = stages.map(stage => {
        const exploits = exploitsData?.filter(e => e.stage_id === stage.id) || [];
        const completedExploits = exploits.filter(e => e.status === 'complete').length;
        const totalExploits = exploits.length;

        const stageSessions = sessionsData?.filter(s => s.stage_id === stage.id) || [];
        const stageSessionIds = new Set(stageSessions.map(s => s.id));
        const selectedSet = new Set(stage.selected_content ?? []);
        // Count distinct content_ids that belong to this stage's selected_content
        const validatedContentIds = new Set(
            (validationsData ?? [])
                .filter(v => stageSessionIds.has(v.session_id) && selectedSet.has(v.content_id))
                .map(v => v.content_id)
        );
        const stageValidations = validatedContentIds;

        // First session by order — used by the dashboard "play" shortcut
        const firstSession = [...stageSessions].sort((a, b) => a.session_order - b.session_order)[0];

        // Extract Top 2 themes
        const themesCount = new Map<string, number>();
        stage.selected_content?.forEach((contentId: string) => {
            const themes = contentThemeMap.get(contentId) || [];
            themes.forEach(t => {
                themesCount.set(t, (themesCount.get(t) || 0) + 1);
            });
        });
        const topThemes = Array.from(themesCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(e => e[0]);

        return {
            ...stage,
            exploitsSummary: { completed: completedExploits, total: totalExploits },
            validationCount: stageValidations.size,
            contentCount: stage.selected_content?.length || 0,
            themes: topThemes,
            totalSessions: stageSessions.length,
            firstSessionId: firstSession?.id ?? null
        };
    });

    return enrichedStages;
}

export async function getSessionsForStage(stageId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('sessions')
        .select(`
            *,
            steps:session_structure(*)
        `)
        .eq('stage_id', stageId)
        .order('session_order', { ascending: true })
        .order('step_order', { foreignTable: 'session_structure', ascending: true });

    if (error) {
        console.error('Error fetching sessions:', error);
        return [];
    }
    return data;
}

/**
 * Statistiques d'avancement d'un stage pour la carte de pilotage.
 * Progression de transmission, défis validés, quiz fait/score, prochaine séance.
 */
export async function getStageCockpitStats(stageId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: stage } = await supabase
        .from('stages')
        .select('selected_content, dates')
        .eq('id', stageId)
        .single();

    const selectedContent: string[] = stage?.selected_content ?? [];
    const contentCount = selectedContent.length;

    // Sessions + étapes du stage
    const { data: sessions } = await supabase
        .from('sessions')
        .select('id, title, session_order')
        .eq('stage_id', stageId)
        .order('session_order', { ascending: true });

    const sessionIds = (sessions ?? []).map(s => s.id);
    const selectedSet = new Set(selectedContent);

    // Étapes de ces sessions (pour connaître les fiches "placées")
    let placedCount = 0;
    let stepIds: string[] = [];
    if (sessionIds.length > 0) {
        const { data: steps } = await supabase
            .from('session_structure')
            .select('id')
            .in('session_id', sessionIds);
        stepIds = (steps ?? []).map(s => s.id);

        if (stepIds.length > 0) {
            const { data: links } = await supabase
                .from('session_step_pedagogical_links')
                .select('pedagogical_content_id')
                .in('session_step_id', stepIds);

            // Fiches distinctes placées qui font partie du réservoir prévu
            const placed = new Set(
                (links ?? [])
                    .map(l => l.pedagogical_content_id)
                    .filter(cid => selectedSet.has(cid))
            );
            placedCount = placed.size;
        }
    }

    // Notions validées dans ces sessions
    let validatedCount = 0;
    if (sessionIds.length > 0 && contentCount > 0) {
        const { data: validations } = await supabase
            .from('user_validations')
            .select('content_id, session_id')
            .eq('user_id', user.id)
            .in('session_id', sessionIds);

        const validated = new Set(
            (validations ?? [])
                .filter(v => selectedSet.has(v.content_id))
                .map(v => v.content_id)
        );
        validatedCount = validated.size;
    }

    // Défis
    const { data: exploits } = await supabase
        .from('stage_exploits')
        .select('status')
        .eq('stage_id', stageId);

    const defisTotal = exploits?.length ?? 0;
    const defisDone = (exploits ?? []).filter(e => e.status === 'complete').length;

    // Quiz
    const { data: quiz } = await supabase
        .from('stage_quizzes')
        .select('completed_at, score_correct, score_total, points_awarded')
        .eq('stage_id', stageId)
        .maybeSingle();

    // Total points gagnés sur ce stage (quiz + défis)
    let stageTotalPoints = 0;
    const { data: pointsRows } = await supabase
        .from('leaderboard_points')
        .select('points')
        .eq('stage_id', stageId);

    if (pointsRows) {
        stageTotalPoints = pointsRows.reduce((sum: number, r: { points: number }) => sum + r.points, 0);
    }

    return {
        contentCount,        // Prévu (réservoir du stage)
        placedCount,         // Placé (lié à une étape de séance)
        validatedCount,      // Réalisé (validé sur le terrain)
        progressPct: contentCount > 0 ? Math.round((validatedCount / contentCount) * 100) : 0,
        defisTotal,
        defisDone,
        sessionsCount: sessions?.length ?? 0,
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
        .single();

    if (stageError || !stage) {
        console.error('Error fetching stage objective review items:', stageError);
        return [];
    }

    const selectedContent: string[] = stage.selected_content ?? [];
    if (selectedContent.length === 0) return [];

    const selectedSet = new Set(selectedContent);

    const [{ data: contentRows }, { data: reviewRows }, { data: sessions }] = await Promise.all([
        supabase.from('pedagogical_content').select('*').in('id', selectedContent),
        supabase
            .from('stage_objective_reviews')
            .select('pedagogical_content_id, execution_status, impact_level, note')
            .eq('stage_id', stageId),
        supabase.from('sessions').select('id, title, session_order').eq('stage_id', stageId).order('session_order', { ascending: true }),
    ]);

    const contentById = new Map((contentRows as PedagogicalContent[] ?? []).map(content => [content.id, content]));
    const orderedSessions = (sessions ?? []).map(session => ({ id: session.id, title: session.title }));
    const sessionIds = orderedSessions.map(session => session.id);

    let stepRows: Array<{ id: string; session_id: string }> = [];
    let linkRows: Array<{ session_step_id: string; pedagogical_content_id: string }> = [];
    let validationRows: Array<{ content_id: string; session_id: string }> = [];

    if (sessionIds.length > 0) {
        const [{ data: steps }, { data: validations }] = await Promise.all([
            supabase.from('session_structure').select('id, session_id').in('session_id', sessionIds),
            supabase
                .from('user_validations')
                .select('content_id, session_id')
                .eq('user_id', user.id)
                .in('session_id', sessionIds),
        ]);

        stepRows = steps ?? [];
        validationRows = validations ?? [];

        if (stepRows.length > 0) {
            const { data: links } = await supabase
                .from('session_step_pedagogical_links')
                .select('session_step_id, pedagogical_content_id')
                .in('session_step_id', stepRows.map(step => step.id));

            linkRows = links ?? [];
        }
    }

    const reviewByContentId = new Map(
        (reviewRows ?? []).map(review => [
            review.pedagogical_content_id,
            {
                executionStatus: review.execution_status,
                impactLevel: review.impact_level,
                note: review.note,
            },
        ])
    );

    const stepToSessionId = new Map(stepRows.map(step => [step.id, step.session_id]));
    const placedByContentId = new Map<string, Set<string>>();
    const validatedByContentId = new Map<string, Set<string>>();

    linkRows.forEach(link => {
        if (!selectedSet.has(link.pedagogical_content_id)) return;
        const sessionId = stepToSessionId.get(link.session_step_id);
        if (!sessionId) return;
        const bucket = placedByContentId.get(link.pedagogical_content_id) ?? new Set<string>();
        bucket.add(sessionId);
        placedByContentId.set(link.pedagogical_content_id, bucket);
    });

    validationRows.forEach(validation => {
        if (!selectedSet.has(validation.content_id)) return;
        const bucket = validatedByContentId.get(validation.content_id) ?? new Set<string>();
        bucket.add(validation.session_id);
        validatedByContentId.set(validation.content_id, bucket);
    });

    const sessionsFromSet = (set?: Set<string>) => {
        if (!set) return [];
        return orderedSessions.filter(session => set.has(session.id));
    };

    return selectedContent
        .map(contentId => {
            const pedagogicalContent = contentById.get(contentId);
            if (!pedagogicalContent) return null;

            const placedSessions = sessionsFromSet(placedByContentId.get(contentId));
            const validatedSessions = sessionsFromSet(validatedByContentId.get(contentId));

            return {
                pedagogicalContent,
                placedSessions,
                validatedSessions,
                isPlaced: placedSessions.length > 0,
                isValidated: validatedSessions.length > 0,
                review: reviewByContentId.get(contentId) ?? null,
            } satisfies StageObjectiveReviewItem;
        })
        .filter((item): item is StageObjectiveReviewItem => item !== null);
}

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
    dimensions: Array<{
        label: string;
        summary: StageObjectiveAnalyticsSummary;
    }>;
    topicTracking: {
        established: TopicTracking[];
        improving: TopicTracking[];
        fragile: TopicTracking[];
        emerging: TopicTracking[];
        dormant: TopicTracking[];
    };
};

export async function getStageObjectiveDashboardStats(): Promise<StageObjectiveDashboardStats> {
    const emptySummary = summarizeObjectiveReviews([]);
    const empty: StageObjectiveDashboardStats = { stagesCount: 0, summary: emptySummary, recentStages: [], dimensions: [], topicTracking: { established: [], improving: [], fragile: [], emerging: [], dormant: [] } };
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

    const [{ data: reviewRows }, { data: contentRows }, { data: allContentRows }] = await Promise.all([
        supabase
            .from('stage_objective_reviews')
            .select('stage_id, pedagogical_content_id, execution_status, impact_level')
            .in('stage_id', stageIds),
        selectedContentIds.length > 0
            ? supabase.from('pedagogical_content').select('id, dimension, tags_filtre').in('id', selectedContentIds)
            : Promise.resolve({ data: [] }),
        supabase.from('pedagogical_content').select('tags_filtre'),
    ]);

    const reviewByKey = new Map<string, ObjectiveAnalyticsInput>();
    (reviewRows ?? []).forEach(review => {
        const executionStatus = isStageObjectiveExecutionStatus(review.execution_status) ? review.execution_status : null;
        const impactLevel = review.impact_level && isStageObjectiveImpactLevel(review.impact_level) ? review.impact_level : null;
        reviewByKey.set(`${review.stage_id}:${review.pedagogical_content_id}`, { executionStatus, impactLevel });
    });

    const dimensionByContentId = new Map((contentRows ?? []).map(content => [content.id, content.dimension ?? 'Sans dimension']));
    const contentById = new Map((contentRows ?? []).map(content => [content.id, content]));
    const allInputs: ObjectiveAnalyticsInput[] = [];
    const dimensionInputs = new Map<string, ObjectiveAnalyticsInput[]>();

    const recentStages = stages.map(stage => {
        const stageInputs = ((stage.selected_content ?? []) as string[]).map(contentId => {
            const input = reviewByKey.get(`${stage.id}:${contentId}`) ?? { executionStatus: null, impactLevel: null };
            const dimension = dimensionByContentId.get(contentId) ?? 'Sans dimension';
            allInputs.push(input);
            dimensionInputs.set(dimension, [...(dimensionInputs.get(dimension) ?? []), input]);
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

    const dimensions = Array.from(dimensionInputs.entries())
        .map(([label, inputs]) => ({ label, summary: summarizeObjectiveReviews(inputs) }))
        .sort((a, b) => b.summary.totalObjectives - a.summary.totalObjectives)
        .slice(0, 6);

    // --- Suivi des sujets ---
    const allTags = new Set<string>();
    (allContentRows ?? []).forEach((c: { tags_filtre?: string[] }) => c.tags_filtre?.forEach(tag => allTags.add(tag)));

    const tagOccurrences = new Map<string, Array<{ stageId: string; stageClosedAt: string | null; score: number }>>();

    stages.forEach(stage => {
        (stage.selected_content ?? []).forEach((contentId: string) => {
            const review = reviewByKey.get(`${stage.id}:${contentId}`);
            if (!review?.executionStatus || review.executionStatus === 'not_done') return;
            const content = contentById.get(contentId) as { tags_filtre?: string[] } | undefined;
            if (!content?.tags_filtre?.length) return;

            const execScore = review.executionStatus === 'done' ? 2 : 1;
            const impactScore = review.impactLevel === 'high' ? 2 : review.impactLevel === 'medium' ? 1 : 0;
            const score = execScore + impactScore;

            content.tags_filtre.forEach(tag => {
                if (!allTags.has(tag)) return;
                const list = tagOccurrences.get(tag) ?? [];
                const existing = list.find(o => o.stageId === stage.id);
                if (existing) {
                    if (score > existing.score) existing.score = score;
                } else {
                    list.push({ stageId: stage.id, stageClosedAt: stage.closed_at, score });
                }
                tagOccurrences.set(tag, list);
            });
        });
    });

    const topicTrackingList: TopicTracking[] = Array.from(allTags).map(tag => {
        const occurrences = (tagOccurrences.get(tag) ?? []).sort((a, b) => {
            if (!a.stageClosedAt && !b.stageClosedAt) return 0;
            if (!a.stageClosedAt) return 1;
            if (!b.stageClosedAt) return -1;
            return new Date(b.stageClosedAt).getTime() - new Date(a.stageClosedAt).getTime();
        });

        const lastScore = occurrences[0]?.score ?? 0;
        const previousScore = occurrences[1]?.score ?? null;
        const avg = occurrences.length > 0 ? occurrences.reduce((s, o) => s + o.score, 0) / occurrences.length : 0;

        let category: TopicTracking['category'];
        if (occurrences.length >= 3) {
            if (avg >= 3.5) category = 'established';
            else if (lastScore > (previousScore ?? 0)) category = 'improving';
            else if (avg < 2.5) category = 'fragile';
            else category = 'dormant';
        } else if (occurrences.length === 2) {
            if (lastScore > previousScore!) category = 'improving';
            else if (avg >= 3.5) category = 'emerging';
            else category = 'dormant';
        } else if (occurrences.length === 1) {
            if (lastScore >= 4) category = 'emerging';
            else category = 'dormant';
        } else {
            category = 'dormant';
        }

        return {
            tag,
            category,
            occurrences: occurrences.length,
            lastScore,
            previousScore,
            lastClosedAt: occurrences[0]?.stageClosedAt ?? null,
        };
    });

    const topicTracking = {
        established: topicTrackingList.filter(t => t.category === 'established').sort((a, b) => b.occurrences - a.occurrences),
        improving: topicTrackingList.filter(t => t.category === 'improving').sort((a, b) => b.occurrences - a.occurrences),
        fragile: topicTrackingList.filter(t => t.category === 'fragile').sort((a, b) => b.occurrences - a.occurrences),
        emerging: topicTrackingList.filter(t => t.category === 'emerging').sort((a, b) => b.lastScore - a.lastScore),
        dormant: topicTrackingList.filter(t => t.category === 'dormant').sort((a, b) => a.occurrences - b.occurrences),
    };

    return {
        stagesCount: stages.length,
        summary: summarizeObjectiveReviews(allInputs),
        recentStages: recentStages.slice(0, 5),
        dimensions,
        topicTracking,
    };
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

export async function getSessionStepLinks(stepIds: string[]) {
    if (!stepIds || stepIds.length === 0) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('session_step_pedagogical_links')
        .select('*')
        .in('session_step_id', stepIds);

    if (error) {
        console.error('Error fetching links:', error);
        return [];
    }
    return data;
}

export async function getSessionFull(sessionId: string) {
    const supabase = await createClient();

    // 1. Get Session & Steps
    const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select(`
            *,
            steps:session_structure(*)
        `)
        .eq('id', sessionId)
        .single();

    if (sessionError || !sessionData) return null;

    const session = sessionData as Session & { steps: SessionStep[] };

    // Sort steps
    session.steps.sort((a, b) => a.step_order - b.step_order);

    // 2. Get Links for these steps
    const stepIds = session.steps.map(s => s.id);
    const { data: links } = await supabase
        .from('session_step_pedagogical_links')
        .select('session_step_id, pedagogical_content_id')
        .in('session_step_id', stepIds);

    // 3. Get Content Details
    const contentIds = links?.map(l => l.pedagogical_content_id) || [];
    let contentMap: PedagogicalContent[] = [];

    if (contentIds.length > 0) {
        const { data: content } = await supabase
            .from('pedagogical_content')
            .select('*')
            .in('id', contentIds);
        contentMap = (content as PedagogicalContent[]) || [];
    }

    return {
        session,
        steps: session.steps,
        links: links || [],
        contentPool: contentMap
    };
}

export async function getUserValidationsForSession(sessionId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from('user_validations')
        .select('content_id')
        .eq('user_id', user.id)
        .eq('session_id', sessionId);

    if (error) {
        console.error('Error fetching validations:', error);
        return [];
    }

    return data.map(v => v.content_id);
}
