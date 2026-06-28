'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type TemplateCondition =
    | 'vent_fort' | 'vent_faible' | 'mer_calme' | 'mer_agitee'
    | 'pluie' | 'grand_soleil' | 'brouillard';

export type TemplatePeriode =
    | 'printemps' | 'juillet' | 'aout' | 'automne' | 'hiver' | 'vacances_scolaires' | 'hors_vacances';

export type TemplateSupport =
    | 'catamaran_enfant' | 'catamaran_adulte' | 'deriveur_simple' | 'deriveur_double'
    | 'planche_a_voile' | 'wing_foil' | 'kite_surf'
    | 'char_a_voile'
    | 'kayak_mer' | 'sup' | 'paddle_geant'
    | 'cerf_volant' | 'marche_aquatique';

export type TemplateTypeStage =
    | 'decouverte' | 'initiation' | 'perfectionnement' | 'competition'
    | 'randonnee' | 'scolaire_classe_mer' | 'teambuilding' | 'evg_evjf'
    | 'bien_etre' | 'secourisme_bnssa';

export type TemplatePublic =
    | 'enfants_7_10' | 'enfants_10_14' | 'ados' | 'adultes' | 'seniors'
    | 'groupes_scolaires' | 'entreprises' | 'tous_niveaux';

export type StageTemplate = {
    id: string;
    name: string;
    activity: string;
    level: string;
    duration_days: number;
    tags_conditions: TemplateCondition[];
    tags_periode: TemplatePeriode[];
    tags_support: TemplateSupport[];
    tags_type_stage: TemplateTypeStage[];
    tags_public: TemplatePublic[];
    sessions_snapshot: SessionSnapshot[];
    defis_snapshot: string[];
    created_at: string;
};

type StepSnapshot = {
    title: string;
    duration: number;
    order: number;
    todos: string[];
};

type SessionSnapshot = {
    title: string;
    order: number;
    steps: StepSnapshot[];
};

export async function saveStageAsTemplate(
    stageId: string,
    name: string,
    tagsConditions: TemplateCondition[],
    tagsPeriode: TemplatePeriode[],
    tagsSupport: TemplateSupport[],
    tagsTypeStage: TemplateTypeStage[],
    tagsPublic: TemplatePublic[]
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Non connecté' };

    // Charger le stage
    const { data: stage } = await supabase
        .from('stages')
        .select('activity, level, dates')
        .eq('id', stageId)
        .eq('owner_id', user.id)
        .single();
    if (!stage) return { success: false, error: 'Stage introuvable' };

    // Charger sessions + étapes
    const { data: sessions } = await supabase
        .from('sessions')
        .select('id, title, session_order, session_structure(id, step_title, step_duration_minutes, step_order)')
        .eq('stage_id', stageId)
        .order('session_order');

    // Charger les todos de chaque étape
    const stepIds = (sessions ?? []).flatMap(s =>
        ((s.session_structure as { id: string }[]) ?? []).map(st => st.id)
    );
    const { data: todos } = stepIds.length > 0
        ? await supabase.from('step_todos').select('session_step_id, text, todo_order').in('session_step_id', stepIds).order('todo_order')
        : { data: [] };

    const todosByStep: Record<string, string[]> = {};
    for (const t of todos ?? []) {
        if (!todosByStep[t.session_step_id]) todosByStep[t.session_step_id] = [];
        todosByStep[t.session_step_id].push(t.text);
    }

    const sessionsSnapshot: SessionSnapshot[] = (sessions ?? []).map(s => ({
        title: s.title,
        order: s.session_order,
        steps: ((s.session_structure as { id: string; step_title: string; step_duration_minutes: number; step_order: number }[]) ?? [])
            .sort((a, b) => a.step_order - b.step_order)
            .map(st => ({
                title: st.step_title,
                duration: st.step_duration_minutes,
                order: st.step_order,
                todos: todosByStep[st.id] ?? [],
            })),
    }));

    // Charger les défis assignés
    const { data: exploits } = await supabase
        .from('stage_exploits')
        .select('exploit_id')
        .eq('stage_id', stageId);
    const defisSnapshot = (exploits ?? []).map(e => e.exploit_id);

    // Calculer la durée en jours depuis les dates du stage
    const durationDays = sessionsSnapshot.length || 5;

    const { error } = await supabase.from('stage_templates').insert({
        owner_id: user.id,
        name,
        activity: stage.activity,
        level: stage.level,
        duration_days: durationDays,
        tags_conditions: tagsConditions,
        tags_periode: tagsPeriode,
        tags_support: tagsSupport,
        tags_type_stage: tagsTypeStage,
        tags_public: tagsPublic,
        sessions_snapshot: sessionsSnapshot,
        defis_snapshot: defisSnapshot,
    });

    if (error) return { success: false, error: error.message };
    revalidatePath('/stages/new');
    return { success: true };
}

export async function getMyTemplates(): Promise<StageTemplate[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase
        .from('stage_templates')
        .select('*')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false });
    return (data ?? []) as StageTemplate[];
}

export async function deleteTemplate(templateId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Non connecté' };
    const { error } = await supabase
        .from('stage_templates')
        .delete()
        .eq('id', templateId)
        .eq('owner_id', user.id);
    if (error) return { success: false, error: error.message };
    return { success: true };
}

export async function createStageFromTemplate(
    templateId: string,
    dates: string,
    nbStagiaires?: number,
    suggestedThematics?: string[]
): Promise<{ success: boolean; stageId?: string; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Non connecté' };

    // Charger le template
    const { data: tpl } = await supabase
        .from('stage_templates')
        .select('*')
        .eq('id', templateId)
        .eq('owner_id', user.id)
        .single();
    if (!tpl) return { success: false, error: 'Modèle introuvable' };

    // Créer le stage
    const { data: stage, error: stageError } = await supabase
        .from('stages')
        .insert({
            title: tpl.name,
            activity: tpl.activity,
            level: tpl.level,
            dates,
            nb_stagiaires: nbStagiaires ?? null,
            selected_content: [],
            suggested_thematics: suggestedThematics ?? [],
            owner_id: user.id,
        })
        .select('id')
        .single();
    if (stageError || !stage) return { success: false, error: stageError?.message };

    const stageId = stage.id;

    // Recréer les sessions + étapes + todos
    for (const s of (tpl.sessions_snapshot as SessionSnapshot[])) {
        const { data: session, error: sErr } = await supabase
            .from('sessions')
            .insert({ stage_id: stageId, title: s.title, session_order: s.order })
            .select('id')
            .single();
        if (sErr || !session) continue;

        for (const st of s.steps) {
            const { data: step, error: stErr } = await supabase
                .from('session_structure')
                .insert({ session_id: session.id, step_title: st.title, step_duration_minutes: st.duration, step_order: st.order })
                .select('id')
                .single();
            if (stErr || !step) continue;

            if (st.todos.length > 0) {
                await supabase.from('step_todos').insert(
                    st.todos.map((text, i) => ({ session_step_id: step.id, text, todo_order: i }))
                );
            }
        }
    }

    // Réassigner les défis (sauf fil rouge qui s'auto-assigne via createStage)
    const { data: profile } = await supabase.from('profiles').select('defi_fil_rouge_id').eq('id', user.id).single();
    const filRougeId = profile?.defi_fil_rouge_id;

    const defisToAssign = (tpl.defis_snapshot as string[]).filter(id => id !== filRougeId);
    if (filRougeId) defisToAssign.push(filRougeId); // toujours inclure le fil rouge actuel

    if (defisToAssign.length > 0) {
        await supabase.from('stage_exploits').insert(
            defisToAssign.map(defiId => ({ stage_id: stageId, exploit_id: defiId, status: 'en_cours' }))
        );
    }

    revalidatePath('/stages');
    return { success: true, stageId };
}
