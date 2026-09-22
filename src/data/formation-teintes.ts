import { Sparkles, PenLine, Cog, CircleCheck, type LucideIcon } from 'lucide-react';
import type { SectionFormation } from './formation-methode';

/**
 * Teinte et icône de chaque thème de formation.
 *
 * Même vocabulaire visuel que `ProgrammeCondense` (dégradé plein `linear-gradient(150deg,
 * vif, sombre)`, grande icône fantôme en fond) — repris ici plutôt qu'inventé, pour ancrer
 * la formation dans l'identité déjà établie de l'app.
 *
 * Partagé entre la liste `/formation` (FormationClient) et le dashboard de l'accueil
 * `/stages` (DashboardFormation) : les deux doivent afficher la même couleur pour un même
 * thème, sinon un moniteur qui passe de l'un à l'autre perd le repère visuel.
 */
export const TEINTE_THEME: Record<SectionFormation['id'], { vif: string; sombre: string; icone: LucideIcon }> = {
    pourquoi: { vif: '#80643b', sombre: '#80643b', icone: Sparkles },
    'quoi-dire': { vif: '#915d50', sombre: '#915d50', icone: PenLine },
    'faire-vivre': { vif: '#286561', sombre: '#286561', icone: Cog },
    methode: { vif: '#4d643b', sombre: '#4d643b', icone: CircleCheck },
};
