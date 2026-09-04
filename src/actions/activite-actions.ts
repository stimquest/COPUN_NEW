'use server';

import { createClient, getCachedUser } from '@/lib/supabase/server';

/**
 * Statistiques d'usage de l'app.
 *
 * Deux origines, qu'il faut distinguer à la lecture :
 *
 * — L'activité (`activite_*`) est reconstituée après coup depuis les écritures horodatées
 *   de l'app. Elle couvre tout l'historique, y compris l'été de test, mais ne connaît que
 *   les journées où quelque chose a été produit.
 * — Les sessions (`user_sessions`) sont journalisées depuis la mise en place du suivi.
 *   Elles donnent les connexions et les durées réelles, mais restent vides avant cette
 *   date. Ne pas lire un « 0 session » de juillet comme une absence d'usage : c'est une
 *   absence de mesure, et c'est l'activité reconstituée qui fait foi sur cette période.
 */

async function requireAdminOrClubAdmin() {
    const supabase = await createClient();
    const user = await getCachedUser();
    if (!user) return null;
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, club_id')
        .eq('id', user.id)
        .single();
    if (!profile || !['admin', 'club_admin'].includes(profile.role)) return null;
    return { user, supabase, role: profile.role as string, club_id: profile.club_id as string | null };
}

export type MoniteurActivite = {
    user_id: string;
    email: string | null;
    full_name: string | null;
    role: string | null;
    club_id: string | null;
    inscrit_le: string;
    /** Journées où le moniteur a produit quelque chose dans l'app. */
    jours_actifs: number;
    total_actions: number;
    premier_jour: string | null;
    dernier_jour: string | null;
    /** Part des jours utilisés entre le premier et le dernier passage. */
    regularite_pct: number | null;
    jours_actifs_30j: number;
    last_sign_in_at: string | null;
    // Volet sessions — nul tant que le suivi n'a rien enregistré pour ce moniteur.
    nb_sessions: number;
    nb_pages: number;
    duree_moyenne_min: number | null;
    derniere_session: string | null;
};

export type ActiviteData = {
    /** Début de l'historique reconstituable, pour situer la profondeur des données. */
    depuis: string | null;
    nb_comptes: number;
    nb_jamais_utilise: number;
    nb_actifs_30j: number;
    total_jours_actifs: number;
    /** Vrai dès qu'une session a été journalisée : sinon le volet sessions est prématuré. */
    suivi_sessions_actif: boolean;
    moniteurs: MoniteurActivite[];
    par_jour: { jour: string; nb_moniteurs: number; nb_actions: number }[];
    par_genre: { genre: string; nb_actions: number; nb_moniteurs: number }[];
    pages: { chemin: string; nb_vues: number; nb_moniteurs: number }[];
};

type LigneActivite = {
    user_id: string; email: string | null; full_name: string | null;
    role: string | null; club_id: string | null; inscrit_le: string;
    jours_actifs: number; total_actions: number;
    premier_jour: string | null; dernier_jour: string | null;
    regularite_pct: number | null; jours_actifs_30j: number;
    last_sign_in_at: string | null;
};

type LigneSession = {
    user_id: string; nb_sessions: number; nb_pages: number;
    duree_moyenne_min: number | null; derniere_session: string | null;
};

export async function getActiviteData(depuis?: string): Promise<{ data?: ActiviteData; error?: string }> {
    const ctx = await requireAdminOrClubAdmin();
    if (!ctx) return { error: 'Accès refusé.' };

    const { supabase, role, club_id: myClubId } = ctx;
    const p = depuis ?? null;

    const [activite, sessions, parJour, parGenre, pages] = await Promise.all([
        supabase.rpc('admin_activite_moniteurs'),
        supabase.rpc('admin_sessions_moniteurs', { p_depuis: p }),
        supabase.rpc('admin_activite_journaliere', { p_depuis: p }),
        supabase.rpc('admin_activite_par_genre', { p_depuis: p }),
        supabase.rpc('admin_pages_vues', { p_depuis: p }),
    ]);

    // Les vues d'activité sont le socle : sans elles il n'y a rien à montrer. Les RPC de
    // session, elles, peuvent légitimement échouer si la migration de suivi n'a pas encore
    // été appliquée — on dégrade au lieu de refuser la page.
    if (activite.error) {
        return { error: `Statistiques indisponibles : ${activite.error.message}` };
    }

    let lignes = (activite.data ?? []) as LigneActivite[];

    // Un club_admin ne voit que son club. Le filtrage est fait ici plutôt que dans la RPC :
    // celle-ci est en SECURITY DEFINER et ne connaît pas l'appelant.
    if (role === 'club_admin') {
        lignes = lignes.filter(l => l.club_id === myClubId);
    }

    const sessionParUser = new Map<string, LigneSession>(
        ((sessions.data ?? []) as LigneSession[]).map(s => [s.user_id, s]),
    );

    const moniteurs: MoniteurActivite[] = lignes.map(l => {
        const s = sessionParUser.get(l.user_id);
        return {
            ...l,
            jours_actifs: Number(l.jours_actifs ?? 0),
            total_actions: Number(l.total_actions ?? 0),
            jours_actifs_30j: Number(l.jours_actifs_30j ?? 0),
            regularite_pct: l.regularite_pct != null ? Number(l.regularite_pct) : null,
            nb_sessions: Number(s?.nb_sessions ?? 0),
            nb_pages: Number(s?.nb_pages ?? 0),
            duree_moyenne_min: s?.duree_moyenne_min != null ? Number(s.duree_moyenne_min) : null,
            derniere_session: s?.derniere_session ?? null,
        };
    });

    const jours = ((parJour.data ?? []) as { jour: string; nb_moniteurs: number; nb_actions: number }[])
        .map(j => ({ ...j, nb_moniteurs: Number(j.nb_moniteurs), nb_actions: Number(j.nb_actions) }));

    // Les agrégats journaliers et par genre sont calculés tous moniteurs confondus : pour
    // un club_admin ils déborderaient de son périmètre, on préfère les masquer.
    const estGlobal = role === 'admin';

    return {
        data: {
            depuis: jours[0]?.jour ?? null,
            nb_comptes: moniteurs.length,
            nb_jamais_utilise: moniteurs.filter(m => m.jours_actifs === 0).length,
            nb_actifs_30j: moniteurs.filter(m => m.jours_actifs_30j > 0).length,
            total_jours_actifs: moniteurs.reduce((n, m) => n + m.jours_actifs, 0),
            suivi_sessions_actif: moniteurs.some(m => m.nb_sessions > 0),
            moniteurs,
            par_jour: estGlobal ? jours : [],
            par_genre: estGlobal
                ? ((parGenre.data ?? []) as { genre: string; nb_actions: number; nb_moniteurs: number }[])
                    .map(g => ({ ...g, nb_actions: Number(g.nb_actions), nb_moniteurs: Number(g.nb_moniteurs) }))
                : [],
            pages: estGlobal
                ? ((pages.data ?? []) as { chemin: string; nb_vues: number; nb_moniteurs: number }[])
                    .map(v => ({ ...v, nb_vues: Number(v.nb_vues), nb_moniteurs: Number(v.nb_moniteurs) }))
                    .slice(0, 25)
                : [],
        },
    };
}
