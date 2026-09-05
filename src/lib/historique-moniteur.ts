import { PedagogicalContent } from '@/types';
import { GROUPES, groupeDe } from '@/data/groupes';

/**
 * Ce que ce moniteur a déjà fait — la seule matière sur laquelle un calcul ait ici du sens.
 *
 * Trois tentatives d'« intelligence » ont échoué avant ce fichier, toutes pour la même
 * raison : elles essayaient de DÉDUIRE un savoir pédagogique absent des données. Le moteur
 * de poids de `seasonal-context.ts` produisait « gros coefficient + vent → repères
 * spatio-temporels » ; le score par tags produisait trente fiches en vrac ; la
 * classification des accroches par mots-clés ratait 65% des phrases. Le lien « ciel
 * instable → parler des nuages » n'est écrit nulle part en base : il vit dans la tête des
 * moniteurs. L'inférer, c'est l'inventer — d'où la table explicite de `entrees-semaine.ts`.
 *
 * Ce qui est réellement calculable, c'est l'historique : 45 semaines préparées montrent que
 * 65% du catalogue n'a JAMAIS été choisi, pendant que « jusqu'où la mer va monter » revient
 * neuf fois. Le « ça tourne en rond » rapporté par les moniteurs est un fait mesurable, et
 * c'est lui que ces fonctions traitent — pas en interdisant les rappels (revenir sur un
 * sujet est enseigné par la formation), mais en rendant visible ce qui dort.
 */

/**
 * Volontairement en objets et tableaux nus, pas en Map/Set : cet historique est construit
 * côté serveur et traverse la frontière client (`page.tsx` → `ExplorerClient`), qui ne
 * sérialise ni l'un ni l'autre. Les accès passent par les helpers plus bas.
 */
export type HistoriqueMoniteur = {
    /** Fiches déjà retenues dans une semaine passée → nombre de fois. */
    dejaVues: Record<string, number>;
    /** Fiches qui ont bien marché en séance (bilans de clôture). */
    ontMarche: string[];
    /** Fiches tombées à plat — proposées en dernier, jamais masquées. */
    ontRate: string[];
    /** Groupes de `groupes.ts` jamais abordés par ce moniteur. */
    groupesJamaisAbordes: string[];
};

export function construireHistorique(params: {
    /** `selected_content` de toutes les semaines passées (hors semaine en cours). */
    semainesPassees: (string[] | null | undefined)[];
    successIds?: string[];
    lowIds?: string[];
}): HistoriqueMoniteur {
    const { semainesPassees, successIds = [], lowIds = [] } = params;

    const dejaVues: Record<string, number> = {};
    for (const semaine of semainesPassees) {
        for (const id of semaine ?? []) {
            dejaVues[id] = (dejaVues[id] ?? 0) + 1;
        }
    }

    const groupesAbordes = new Set<string>();
    for (const id of Object.keys(dejaVues)) {
        const g = groupeDe(id);
        if (g) groupesAbordes.add(g.id);
    }

    return {
        dejaVues,
        ontMarche: successIds,
        ontRate: lowIds,
        groupesJamaisAbordes: GROUPES.map(g => g.id).filter(id => !groupesAbordes.has(id)),
    };
}

/** Ce qu'on peut dire d'une fiche au vu de l'historique — affiché, jamais subi. */
export type SignalFiche =
    | { type: 'jamais_abordee' }
    | { type: 'a_marche' }
    | { type: 'deja_faite'; fois: number }
    | { type: 'a_retenter' };

export function signalPour(ficheId: string, h: HistoriqueMoniteur): SignalFiche | null {
    if (h.ontMarche.includes(ficheId)) return { type: 'a_marche' };
    if (h.ontRate.includes(ficheId)) return { type: 'a_retenter' };

    const fois = h.dejaVues[ficheId];
    if (fois) return { type: 'deja_faite', fois };

    // Neuf sur dix des fiches jamais choisies ne sont pas mauvaises — elles n'ont jamais
    // été vues. Le signaler est le seul moyen de sortir de la boucle des mêmes marées.
    return { type: 'jamais_abordee' };
}

/**
 * Ordonne des fiches pour la découverte, sans jamais rien masquer.
 *
 * Priorité : ce qui a marché (le moniteur sait déjà le raconter), puis ce qu'il n'a jamais
 * abordé (l'essentiel du catalogue), puis ce qu'il a déjà fait — le moins souvent d'abord —
 * et enfin ce qui est tombé à plat. Rien ne disparaît : l'ordre change, pas la liste.
 */
export function ordonnerPourDecouverte(
    fiches: PedagogicalContent[],
    h: HistoriqueMoniteur,
): PedagogicalContent[] {
    const rang = (f: PedagogicalContent) => {
        if (h.ontMarche.includes(f.id)) return 0;
        if (h.ontRate.includes(f.id)) return 3;
        return h.dejaVues[f.id] ? 2 : 1;
    };

    return [...fiches].sort((a, b) => {
        const d = rang(a) - rang(b);
        if (d !== 0) return d;
        // À rang égal, le moins ressassé passe devant.
        return (h.dejaVues[a.id] ?? 0) - (h.dejaVues[b.id] ?? 0);
    });
}
