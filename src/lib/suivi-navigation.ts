import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Journalisation des navigations, appelée depuis le middleware.
 *
 * Le middleware est sur le chemin critique de chaque requête : le suivi ne doit ni
 * retarder la réponse ni la faire échouer. D'où deux partis pris — l'appel n'est jamais
 * attendu (`void`), et toute erreur est avalée. Une statistique perdue est sans
 * conséquence ; une page blanche parce que la table de suivi est absente n'en est pas une.
 */

/** Chemins hors mesure : ni pages consultées, ni révélateurs d'un usage. */
const IGNORES = [
    '/auth/',
    '/api/',
    '/_next/',
    '/manifest.webmanifest',
    '/favicon.ico',
];

/**
 * Ramène un chemin à sa forme d'écran.
 *
 * `/stages/08809f3b-.../program` et la même page pour une autre semaine sont le même
 * écran : sans ce repliement, le classement des pages vues serait une liste d'UUID où
 * aucun écran ne ressort. Les identifiants de fiche (`/ressources/42`) subissent le même
 * sort.
 */
export function normaliserChemin(chemin: string): string {
    return chemin
        .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
        .replace(/\/\d+(?=\/|$)/g, '/:id');
}

export function cheminSuivi(chemin: string): boolean {
    return !IGNORES.some(prefixe => chemin.startsWith(prefixe));
}

/**
 * Enregistre une navigation sans bloquer la réponse.
 *
 * Volontairement non `await`é par l'appelant : la requête part, la page est rendue. Sur
 * un runtime qui coupe le contexte à la fin du handler, une écriture peut se perdre —
 * perte acceptable au regard du coût d'un aller-retour synchrone sur chaque navigation.
 */
export function enregistrerNavigation(
    supabase: SupabaseClient,
    chemin: string,
    userAgent: string | null,
): void {
    const ua = userAgent ?? '';
    void supabase
        .rpc('enregistrer_navigation', {
            p_chemin: normaliserChemin(chemin),
            p_user_agent: ua.slice(0, 400) || null,
            p_est_mobile: /Mobile|Android|iPhone|iPad/i.test(ua),
            // L'app installée n'envoie pas d'en-tête dédié : le mode PWA est déduit
            // côté client et transmis dans un cookie posé au premier lancement.
            p_est_pwa: null,
        })
        .then(
            () => {},
            () => {}, // Suivi défaillant : on ne perturbe pas la navigation pour autant.
        );
}
