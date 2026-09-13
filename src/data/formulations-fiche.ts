import type { PedagogicalContent } from '@/types';
import type { AccrocheFormee } from './formes-accroche';
import editoriales from './accroches-editoriales.json';

/** Source commune des propositions en découverte et en préparation.
 * Les formes en base priment ; le catalogue conserve les propositions historiques
 * quand une révision de l'explication a laissé ce champ vide.
 */
export function formulationsFiche(fiche: PedagogicalContent): Array<AccrocheFormee | { texte: string }> {
    if (fiche.accroches_formes?.length) return fiche.accroches_formes;
    const conservees = (editoriales as Record<string, AccrocheFormee[]>)[fiche.id];
    if (conservees?.length) return conservees;
    if (fiche.accroches_variantes?.length) return fiche.accroches_variantes.map(texte => ({ texte }));
    return [{ texte: fiche.accroche || fiche.question }];
}
