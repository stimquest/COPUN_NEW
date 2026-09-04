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
    pourquoi: { vif: '#f59e0b', sombre: '#7c4a03', icone: Sparkles },
    'quoi-dire': { vif: '#6366f1', sombre: '#312e81', icone: PenLine },
    'faire-vivre': { vif: '#10b981', sombre: '#065f46', icone: Cog },
    methode: { vif: '#2563eb', sombre: '#16307a', icone: CircleCheck },
};
