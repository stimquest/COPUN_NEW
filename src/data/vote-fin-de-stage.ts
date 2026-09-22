import type { PedagogicalContent } from '@/types';

/**
 * Le vote de fin de stage : des affirmations lues à voix haute, auxquelles le groupe
 * répond en levant un panneau VRAI ou FAUX.
 *
 * Deux natures d'affirmation, volontairement indiscernables à l'oral :
 *
 * - `savoir`  ce que le groupe a retenu de la semaine. C'est le jeu, et c'est ce qui donne
 *             au vote une raison d'exister pour les enfants.
 * - `action`  « Cette semaine, on a … » — le groupe confirme qu'une action a bien eu lieu.
 *             C'est la seule validation qui ne vienne pas du moniteur : il ne peut pas
 *             répondre à la place de ses stagiaires, et ces chiffres peuvent donc servir
 *             de justificatif au club.
 *
 * Le mélange n'est pas décoratif. Un vote qui ne contiendrait que des confirmations serait
 * une formalité déguisée, que ni le moniteur ni le groupe n'auraient envie de tenir ; noyées
 * dans un jeu, les confirmations se répondent spontanément. Et comme rien ne distingue les
 * deux types, personne ne sait lesquelles « comptent ».
 *
 * Format vrai/faux plutôt qu'un QCM : quatre options obligeraient les enfants à LIRE les
 * propositions, donc à disposer d'un écran partagé — le dispositif que les moniteurs
 * refusent. Deux réponses tiennent à l'oral. Les quiz de `game_cards` gardent leurs quatre
 * options pour leur usage d'animation, séparé.
 */
export type AffirmationVote =
    | { type: 'savoir'; id: string; contentId: string; texte: string; reponse: boolean }
    | { type: 'action'; id: string; contentId: string; actionId: string; texte: string };

/**
 * Le vote produit DEUX résultats, et c'est pour cela qu'il mêle deux natures d'affirmation :
 *
 *   - un score de savoir  ce que le groupe a retenu de la semaine, pour le moniteur ;
 *   - des actions validées par les enfants, pour sa démarche et celle du club.
 *
 * Une confirmation par carte de la semaine, donc une à trois — c'est la carte qui est le
 * sujet travaillé, pas l'action. Le savoir complète de sorte que le vote fasse cinq ou six
 * affirmations et reste majoritairement pédagogique : un vote rempli de confirmations se
 * donnerait à lire pour ce qu'il est, et chacun saurait lesquelles comptent pour le club.
 */
const MAX_ACTIONS = 3;

/** Combien de questions de savoir accompagnent N confirmations d'action. */
const SAVOIRS_PAR_ACTIONS: Record<number, number> = { 0: 5, 1: 4, 2: 3, 3: 3 };
/**
 * Mélange déterministe : même semaine, même ordre.
 *
 * Le moniteur peut rouvrir le vote (réseau coupé, groupe dissipé, reprise le lendemain)
 * sans que les affirmations changent sous ses yeux, et sans qu'il puisse re-tirer jusqu'à
 * tomber sur une série qui l'arrange.
 */
function melangeStable<T>(items: T[], graine: string): T[] {
    let etat = 0;
    for (let i = 0; i < graine.length; i++) etat = (Math.imul(etat, 31) + graine.charCodeAt(i)) >>> 0;
    const suivant = () => {
        etat = (etat + 0x6d2b79f5) >>> 0;
        let t = etat;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(suivant() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

/**
 * Une carte donne son affirmation vraie OU sa fausse, jamais les deux : les entendre coup
 * sur coup sur le même sujet rendrait la seconde évidente.
 */
function affirmationDeSavoir(carte: PedagogicalContent, graine: string): AffirmationVote[] {
    const options: AffirmationVote[] = [];
    if (carte.vote_vrai) options.push({ type: 'savoir', id: `${carte.id}:vrai`, contentId: carte.id, texte: carte.vote_vrai, reponse: true });
    if (carte.vote_faux) options.push({ type: 'savoir', id: `${carte.id}:faux`, contentId: carte.id, texte: carte.vote_faux, reponse: false });
    if (!options.length) return [];
    return [melangeStable(options, graine + carte.id)[0]];
}
/**
 * Compose le vote d'une semaine.
 *
 * Les actions posées le sont sans égard à ce que le moniteur déclare avoir mené : un « non »
 * est une information aussi utile qu'un « oui », et ne poser que les actions supposées faites
 * transformerait le vote en validation de complaisance.
 *
 * Les deux natures sont ensuite mélangées : rien ne doit distinguer une confirmation d'une
 * question de savoir, ni pour le groupe ni pour le moniteur, sans quoi chacun saurait
 * lesquelles comptent pour les chiffres du club.
 *
 * `complement` sert à tenir le nombre de questions de savoir quand la semaine n'en fournit
 * pas assez : une carte n'en donne qu'une, donc une semaine à une seule carte plafonnerait à
 * une question là où il en faut quatre. Les questions de complément portent sur d'autres
 * sujets du catalogue — ce que le groupe a vu les semaines précédentes, ou simplement une
 * notion du littoral. Le score de savoir s'en trouve élargi, ce qui est sans inconvénient :
 * il renseigne le moniteur, il ne note personne.
 */
export function composerVote(
    cartes: PedagogicalContent[],
    graine: string,
    complement: PedagogicalContent[] = [],
    /** L'action retenue pour la semaine, par carte (`stage_preparations.actions`). */
    choixParCarte?: Record<string, string | undefined>,
): AffirmationVote[] {
    // Une confirmation par carte, et c'est l'action que le moniteur a retenue pour la semaine.
    //
    // Les deux ou trois actions d'une carte ne sont pas une liste à accomplir : ce sont des
    // variantes, dont il en choisit UNE. C'est ce qui rend une carte rejouable — la reprendre
    // une autre saison, sous un autre angle. Poser les autres au groupe reviendrait à lui
    // demander de confirmer des choses qu'on ne lui a jamais proposées.
    const actions: AffirmationVote[] = cartes.flatMap(carte => {
        const retenue = choixParCarte?.[carte.id];
        const action = (carte.actions ?? []).find(item => item.id === retenue && item.confirmation)
            // Sans choix enregistré (préparation non remplie), la première action rédigée
            // fait foi : mieux vaut une confirmation approximative que pas de validation.
            ?? (carte.actions ?? []).find(item => item.confirmation);
        if (!action?.confirmation) return [];
        return [{
            type: 'action' as const,
            id: `${carte.id}:${action.id}`,
            contentId: carte.id,
            actionId: action.id,
            texte: `Cette semaine, ${action.confirmation}.`,
        }];
    });

    const savoirs: AffirmationVote[] = cartes.flatMap(carte => affirmationDeSavoir(carte, graine));

    const posees = melangeStable(actions, graine).slice(0, MAX_ACTIONS);
    const nbSavoirs = SAVOIRS_PAR_ACTIONS[posees.length] ?? SAVOIRS_PAR_ACTIONS[MAX_ACTIONS];
    const retenus = melangeStable(savoirs, graine).slice(0, nbSavoirs);

    // Les cartes de la semaine d'abord : elles portent sur ce que le groupe vient de vivre.
    // Le catalogue ne comble que ce qui manque.
    if (retenus.length < nbSavoirs) {
        // `complement` arrive trié du plus proche au plus lointain (même groupe d'abord,
        // puis même milieu). Le tirage respecte cet ordre : on ne pioche dans un sujet
        // voisin que lorsque le groupe lui-même n'a plus de carte rédigée à proposer.
        //
        // Le mélange ne porte donc que sur la graine de chaque carte, pas sur la liste :
        // mélanger l'ensemble effacerait la priorité, et le vote parlerait des dunes à un
        // groupe qui a passé la semaine sur les marées alors qu'une carte « marées » restait
        // disponible.
        const dejaVues = new Set(cartes.map(carte => carte.id));
        const ailleurs = complement
            .filter(carte => !dejaVues.has(carte.id))
            .flatMap(carte => affirmationDeSavoir(carte, graine))
            .slice(0, nbSavoirs - retenus.length);
        retenus.push(...ailleurs);
    }
    return melangeStable([...posees, ...retenus], graine + 'ordre');
}
