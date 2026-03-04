import { createClient } from '@/lib/supabase/server';
import { Session, SessionStep, PedagogicalContent } from '@/types';


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
        .single();


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

    // We get session links to calculate validation progress
    const { data: sessionsData } = await supabase
        .from('sessions')
        .select(`
            id,
            stage_id,
            session_order,
            steps:session_structure(id)
        `)
        .in('stage_id', stageIds);

    // We get validations
    const sessionIds = sessionsData?.map(s => s.id) || [];
    const { data: validationsData } = await supabase
        .from('session_validations')
        .select('session_id')
        .in('session_id', sessionIds);

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
        const stageSessionIds = stageSessions.map(s => s.id);
        const stageValidations = validationsData?.filter(v => stageSessionIds.includes(v.session_id)) || [];

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
            validationCount: stageValidations.length,
            contentCount: stage.selected_content?.length || 0,
            themes: topThemes,
            totalSessions: stageSessions.length
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
