import { createClient, getCachedUser } from '@/lib/supabase/server';
import { RESSENTI_RAISONS, isRessentiNiveau, type RessentiNiveau } from '@/lib/stage-ressenti';

/**
 * Un frein qui revient appelle une piste concrète pour la prochaine préparation. Les
 * freins qui ne dépendent pas du moniteur (météo, sécurité) n'en ont pas : on ne lui
 * reproche pas le temps qu'il fait.
 */
const CONSEILS_FREINS: Record<string, string> = {
    'Pas eu le temps sur certains sujets': 'Prévoyez un sujet de moins, et gardez-en un « si on a le temps ».',
    'Trop de sujets prévus pour la semaine': 'Visez trois sujets par semaine plutôt que cinq.',
    'Programme trop ambitieux pour le temps disponible': 'Visez trois sujets par semaine plutôt que cinq.',
    'Groupe inégal (âges ou niveaux mélangés)': 'Choisissez des cartes de niveau Découverte : elles parlent à tous.',
    'Groupe peu réceptif': 'Ouvrez par un pari ou un piège : une accroche qui fait réagir avant d’expliquer.',
    'Groupe changeant en cours de semaine': 'Placez les sujets clés en début de semaine.',
    'Groupe trop nombreux pour un vrai suivi': 'Privilégiez les actions en petits groupes ou en binômes.',
};

/** Agrège les ressentis de bilan, du plus ancien au plus récent. */
function evolutionBilans(stages: { id: string; title: string; ressenti: unknown }[]): EvolutionBilans | null {
    const semaines = stages.flatMap(stage => {
        const r = stage.ressenti as { niveau?: unknown; raisons?: unknown } | null;
        if (!r || !isRessentiNiveau(r.niveau)) return [];
        const raisons = Array.isArray(r.raisons) ? r.raisons.filter((x): x is string => typeof x === 'string') : [];
        return [{ id: stage.id, titre: stage.title, niveau: r.niveau, raisons }];
    });
    if (!semaines.length) return null;
    const leviersPossibles = new Set(RESSENTI_RAISONS.largement);
    const compter = (garder: (raison: string) => boolean) => {
        const fois = new Map<string, number>();
        semaines.forEach(s => s.raisons.filter(garder).forEach(r => fois.set(r, (fois.get(r) ?? 0) + 1)));
        return [...fois.entries()].sort((a, b) => b[1] - a[1]).map(([raison, n]) => ({ raison, fois: n }));
    };
    return {
        semaines,
        leviers: compter(r => leviersPossibles.has(r)),
        freins: compter(r => !leviersPossibles.has(r)).map(f => ({ ...f, conseil: CONSEILS_FREINS[f.raison] ?? null })),
    };
}

export type JournalWeek = {
    id: string;
    title: string;
    closedAt: string;
    /** Sujets notés « Effleuré » ou « Abordé » dans Mes séances. */
    workedCount: number;
    totalCount: number;
    closingNote: string | null;
};

/** Retour libre après un essai de terrain dans un parcours de formation. */
export type FormationPracticeNote = {
    id: string;
    sequenceId: string;
    prompt: string;
    note: string;
    createdAt: string;
};

/** Ce que les bilans racontent dans la durée : le ressenti semaine après semaine, et les
 *  raisons cochées, agrégées en leviers (ce qui a aidé) et freins (ce qui a manqué). */
export type EvolutionBilans = {
    semaines: { id: string; titre: string; niveau: RessentiNiveau; raisons: string[] }[];
    leviers: { raison: string; fois: number }[];
    freins: { raison: string; fois: number; conseil: string | null }[];
};

export type PracticeJournal = {
    bilans: EvolutionBilans | null;
    weeksCount: number;
    /** Du plus récent au plus ancien. */
    weeks: JournalWeek[];
    formationNotes: FormationPracticeNote[];
};

/**
 * Le carnet du moniteur, à partir de données encore collectées : ressentis et raisons de
 * bilan, statuts des sujets notés dans Mes séances, mémos de clôture, essais des parcours.
 */
export async function getPracticeJournal(): Promise<PracticeJournal> {
    const vide: PracticeJournal = { bilans: null, weeksCount: 0, weeks: [], formationNotes: [] };
    const supabase = await createClient();
    const user = await getCachedUser();
    if (!user) return vide;

    const [{ data: stages }, { data: notes }] = await Promise.all([
        supabase.from('stages')
            .select('id, title, closed_at, closing_notes, selected_content, ressenti')
            .eq('owner_id', user.id)
            .not('closed_at', 'is', null)
            .order('closed_at', { ascending: true }),
        supabase.from('formation_practice_notes')
            .select('id, sequence_id, prompt, note, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20),
    ]);
    const formationNotes: FormationPracticeNote[] = (notes ?? []).map(note => ({
        id: note.id, sequenceId: note.sequence_id, prompt: note.prompt, note: note.note, createdAt: note.created_at,
    }));

    const closes = stages ?? [];
    if (!closes.length) return { ...vide, formationNotes };

    const { data: revues } = await supabase
        .from('stage_objective_reviews')
        .select('stage_id, execution_status')
        .in('stage_id', closes.map(s => s.id));
    const abordesParSemaine = new Map<string, number>();
    (revues ?? []).forEach(r => {
        if (r.execution_status === 'done' || r.execution_status === 'partial') {
            abordesParSemaine.set(r.stage_id, (abordesParSemaine.get(r.stage_id) ?? 0) + 1);
        }
    });

    const weeks: JournalWeek[] = closes.map(s => ({
        id: s.id,
        title: s.title,
        closedAt: s.closed_at as string,
        workedCount: abordesParSemaine.get(s.id) ?? 0,
        totalCount: (s.selected_content ?? []).length,
        closingNote: s.closing_notes?.trim() || null,
    }));

    return {
        bilans: evolutionBilans(closes),
        weeksCount: weeks.length,
        weeks: weeks.reverse(),
        formationNotes,
    };
}
