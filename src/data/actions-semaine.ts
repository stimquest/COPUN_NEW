/**
 * Actions transversales, choisies une fois pour la semaine entière.
 *
 * Ces actions sont volontairement génériques : elles valent pour n'importe quel sujet et
 * se tiennent sur toute la durée du stage — un rituel de séance plutôt qu'une consigne
 * ponctuelle. Le moniteur en retient une ou deux au début de sa semaine, et n'y revient
 * plus.
 *
 * C'est ce niveau de choix qui rend le générique acceptable. Proposées fiche par fiche,
 * les mêmes actions réapparaissaient à chaque sujet du même groupe — quatre fois dans une
 * semaine, puis à l'identique la semaine suivante : le choix devenait mécanique et la
 * liste, du bruit. Une action valable partout doit donc se décider une seule fois, au
 * niveau où elle s'applique vraiment.
 *
 * Le rangement par pilier COP (Comprendre / Observer / Protéger) suit l'intention
 * pédagogique plutôt que le phénomène, puisque ces actions ne dépendent d'aucun contenu
 * précis. Il permet aussi au moniteur de repérer ce qu'il néglige : trois actions
 * « Comprendre » et aucune « Protéger » en dit long sur sa semaine.
 *
 * Les actions propres à un sujet vivent dans `actions-sujets.ts`.
 */

export type PilierAction = 'COMPRENDRE' | 'OBSERVER' | 'PROTÉGER';

export type ActionSemaine = {
    id: string;
    /** Ce qu'on met en place, nommé simplement. */
    label: string;
    /** Le rituel, tel qu'on le tiendrait sur la semaine. */
    consigne: string;
    pilier: PilierAction;
};

export const ACTIONS_SEMAINE: ActionSemaine[] = [
    // ── Comprendre : ancrer ce qui a été dit ──
    {
        id: 'semaine_question_veille',
        label: 'La question de la veille',
        consigne: 'Chaque matin, reposez une question abordée la veille. Sans prévenir, à quelqu’un au hasard.',
        pilier: 'COMPRENDRE',
    },
    {
        id: 'semaine_expert_jour',
        label: 'L’expert du jour',
        consigne: 'Chaque jour, un stagiaire différent est chargé d’expliquer le sujet du jour aux autres en fin de séance.',
        pilier: 'COMPRENDRE',
    },
    {
        id: 'semaine_mot_jour',
        label: 'Le mot du jour',
        consigne: 'Un mot nouveau par jour, annoncé au départ. Celui qui le replace correctement dans la journée marque le coup.',
        pilier: 'COMPRENDRE',
    },

    // ── Observer : installer le regard ──
    {
        id: 'semaine_meteo_matin',
        label: 'Le relevé du matin',
        consigne: 'Chaque matin avant de partir, le groupe annonce vent, mer et marée. On compare à ce qu’on trouve.',
        pilier: 'OBSERVER',
    },
    {
        id: 'semaine_point_fixe',
        label: 'Le point fixe',
        consigne: 'Un même endroit photographié ou décrit chaque jour. En fin de semaine, on regarde ce qui a changé.',
        pilier: 'OBSERVER',
    },
    {
        id: 'semaine_carnet',
        label: 'Le carnet du groupe',
        consigne: 'Une observation notée par jour, par un stagiaire différent. Relu en entier le dernier jour.',
        pilier: 'OBSERVER',
    },
    {
        id: 'semaine_minute_silence',
        label: 'La minute d’observation',
        consigne: 'Une minute sans parler à chaque séance, toujours au même moment. Puis chacun dit ce qu’il a vu.',
        pilier: 'OBSERVER',
    },

    // ── Protéger : passer du constat au geste ──
    {
        id: 'semaine_geste_tenu',
        label: 'Le geste tenu',
        consigne: 'Le groupe choisit lundi un geste à tenir toute la semaine. On fait le point le dernier jour.',
        pilier: 'PROTÉGER',
    },
    {
        id: 'semaine_ramassage',
        label: 'Le ramassage de fin de séance',
        consigne: 'Cinq minutes avant de rentrer, chacun rapporte un déchet. On compte le total sur la semaine.',
        pilier: 'PROTÉGER',
    },
    {
        id: 'semaine_sans_trace',
        label: 'Sans laisser de trace',
        consigne: 'Avant de quitter le site, le groupe cherche les traces de son propre passage et les efface.',
        pilier: 'PROTÉGER',
    },
];

export const PILIERS_ACTION: PilierAction[] = ['COMPRENDRE', 'OBSERVER', 'PROTÉGER'];

export function actionsDuPilier(pilier: PilierAction): ActionSemaine[] {
    return ACTIONS_SEMAINE.filter(a => a.pilier === pilier);
}

export function actionSemaineParId(id: string): ActionSemaine | undefined {
    return ACTIONS_SEMAINE.find(a => a.id === id);
}
