/**
 * Les quatre formes d'accroche enseignées dans le module de formation « Fabriquer une
 * accroche » (voir `src/data/formation-methode.ts`, leçon `fabriquer-accroche`).
 *
 * Extrait ici en donnée neutre, réutilisable à la fois par la formation et par l'écran
 * de préparation (`PreparerClient`) — c'est le pont entre les deux qui manquait : le
 * moniteur retrouve, au moment de choisir son accroche, le même vocabulaire et les mêmes
 * exemples qu'en formation, sans que les deux textes ne divergent avec le temps.
 *
 * Volontairement PAS utilisé pour classer automatiquement les `accroches_variantes` d'une
 * fiche — la structure réelle de ces phrases est trop hétérogène pour qu'un classement
 * mots-clés soit fiable (vérifié : moins de 35% des phrases portent un marqueur net). Le
 * moniteur choisit lui-même la forme qui l'inspire, puis reconnaît par son propre
 * jugement laquelle des variantes de la fiche s'en rapproche — c'est ça, la compétence
 * qu'on veut faire travailler, pas un classement automatique risquant d'être faux sur une
 * technique qu'on vient d'enseigner avec soin.
 */
export type FormeAccrocheId = 'pari' | 'piege' | 'constat' | 'choix_force';

export type FormeAccroche = {
    id: FormeAccrocheId;
    nom: string;
    exemple: string;
    pourquoi: string;
};

/** Une proposition éditorialement reliée à une forme enseignée. */
export type AccrocheFormee = {
    forme: FormeAccrocheId;
    texte: string;
};

export const FORMES_ACCROCHE: FormeAccroche[] = [
    {
        id: 'pari',
        nom: 'Le pari',
        exemple: "Je peux vous dire l'heure de la marée du 14 juillet 2030. Vous me croyez ?",
        pourquoi: "Tu prends le risque, pas eux. Ils veulent te prendre en défaut, donc ils écoutent.",
    },
    {
        id: 'piege',
        nom: 'Le piège',
        exemple: "Pour bien observer, il faut s'approcher le plus près possible. Qui est d'accord ?",
        pourquoi: "Ils s'engagent en répondant. Quand tu retournes la réponse, ils ne l'oublient plus.",
    },
    {
        id: 'constat',
        nom: 'Le constat intrigant',
        exemple: "Personne en vue. Pourtant ils sont passés par là. Comment le savoir ?",
        pourquoi: 'Le mot « pourtant » fait tout le travail : il y a une contradiction, ils veulent l\'expliquer.',
    },
    {
        id: 'choix_force',
        nom: 'Le choix forcé',
        exemple: 'Vent de terre ou vent de mer : lequel vous inquiète le plus ?',
        pourquoi: "Impossible de rester passif. Même celui qui s'en fiche doit trancher.",
    },
];
