import { getFormationProgression } from '@/actions/formation-actions';
import { LECONS_FORMATION, PLAN_FORMATION } from '@/data/formation-methode';
import { FormationClient } from './FormationClient';

/**
 * Parcours « Savoir en parler » — formation à la démarche COP.
 *
 * Point d'entrée mis en avant (onglet dédié dans la nav) mais jamais bloquant : la
 * préparation de semaine reste accessible sans être passé par ici. Voir le commentaire de
 * tête de `formation-methode.ts` pour le constat qui motive ce parcours.
 *
 * `PLAN_FORMATION` porte les 13 modules prévus, répartis en 4 thèmes façon Google Primer —
 * des catégories au même niveau, sans ordre imposé entre elles ni au sein de chacune (voir
 * le commentaire de tête de `formation-methode.ts`). `LECONS_FORMATION` ne contient que
 * ceux déjà rédigés. La liste montre le plan complet — c'est ce qui dit au moniteur où va
 * la formation, plutôt qu'un module isolé qui donnerait l'impression d'un module esseulé.
 */
export default async function FormationPage() {
    const termine = await getFormationProgression();

    return <FormationClient plan={PLAN_FORMATION} lecons={LECONS_FORMATION} termine={termine} />;
}
