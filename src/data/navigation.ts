import { BookOpen, Compass, GraduationCap, House, NotebookPen, Waves, Settings, ChartNoAxesColumn, CalendarDays, ShieldCheck, Library } from 'lucide-react';

/**
 * L'application a deux pôles, et le menu les reflète :
 *
 *   - Me former : la formation générale (les modules) et les parcours environnement.
 *     Les parcours SONT de la formation — ils ne vivent pas à part.
 *   - Intégrer l'environnement dans mes séances : la semaine en cours et son suivi, la
 *     préparation, l'exploration des cartes et le carnet des essais.
 *
 * Les ressources (le wiki) servent les deux pôles : elles restent une entrée à part.
 */

/** Barre du bas, sur mobile : une entrée par pôle, plus l'exploration et le wiki. */
export const PRIMARY_NAV = [
    { name: 'Accueil', href: '/stages', icon: House },
    { name: 'Formation', href: '/formation', icon: GraduationCap },
    { name: 'Mes séances', href: '/stages/semaines', icon: CalendarDays },
    { name: 'Explorer', href: '/stages/decouvrir', icon: Compass },
    { name: 'Ressources', href: '/ressources', icon: BookOpen },
];

/** Barre latérale, sur grand écran : la place permet d'afficher chaque pôle en entier. */
export const NAV_POLES = [
    {
        titre: 'Me former',
        liens: [
            { name: 'Formation générale', href: '/formation', icon: GraduationCap },
            { name: 'Parcours environnement', href: '/specialisation', icon: Waves },
        ],
    },
    {
        titre: 'Mes séances',
        liens: [
            { name: 'Ma semaine', href: '/stages/semaines', icon: CalendarDays },
            { name: 'Explorer les cartes', href: '/stages/decouvrir', icon: Compass },
            { name: 'Mon carnet', href: '/profil/carnet', icon: NotebookPen },
        ],
    },
];

/** Outils transverses et compte : barre latérale et profil. */
export const SECONDARY_NAV = [
    { name: 'Ressources', href: '/ressources', icon: BookOpen },
    { name: 'Statistiques', href: '/stats', icon: ChartNoAxesColumn },
    { name: 'Mon profil', href: '/profil', icon: Settings },
];
export const SPORT_NAV = { name: 'Fiches sportives', href: '/fiches', icon: Library };
export const ADMIN_NAV = { name: 'Administration', href: '/admin', icon: ShieldCheck };

/** Lien précis actif (barre latérale, où chaque page a sa propre entrée). */
export function activeNavigation(path: string, href: string) {
    if (href === '/stages') return path === href;
    if (href === '/profil') return path === href || path.startsWith('/profil/fil-rouge');
    if (href === '/stages/semaines') return path.startsWith('/stages/') && !path.startsWith('/stages/decouvrir');
    return path === href || path.startsWith(href + '/');
}

/**
 * Entrée active dans la barre du bas, qui regroupe par pôle : un parcours allume
 * « Formation », le carnet allume « Mes séances ».
 */
export function activePole(path: string, href: string) {
    if (href === '/formation') return activeNavigation(path, '/formation') || activeNavigation(path, '/specialisation');
    if (href === '/stages/semaines') return activeNavigation(path, '/stages/semaines') || activeNavigation(path, '/profil/carnet');
    return activeNavigation(path, href);
}
