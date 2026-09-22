import { BookOpen, Compass, GraduationCap, House, NotebookPen, Waves, Settings, ChartNoAxesColumn, CalendarDays, ShieldCheck, Library } from 'lucide-react';

/**
 * La barre du bas sur mobile, où seul le primaire tient.
 *
 * La formation n'y figure pas : elle occupe la plus grande tuile de l'accueil, qui reste à
 * un tap, alors que le wiki n'avait plus aucun chemin court — il n'était atteignable que
 * par le profil, ce qui est long pour une ressource qu'on ouvre en cherchant une réponse.
 */
export const PRIMARY_NAV = [
    { name: 'Accueil', href: '/stages', icon: House },
    { name: 'Parcours', href: '/specialisation', icon: Waves },
    { name: 'Explorer', href: '/stages/decouvrir', icon: Compass },
    { name: 'Carnet', href: '/profil/carnet', icon: NotebookPen },
    { name: 'Ressources', href: '/ressources', icon: BookOpen },
];
/** Repris dans la barre latérale et dans le profil — jamais dans la barre du bas. */
export const SECONDARY_NAV = [
    { name: 'Formation', href: '/formation', icon: GraduationCap },
    { name: 'Mes semaines', href: '/stages/semaines', icon: CalendarDays },
    { name: 'Statistiques', href: '/stats', icon: ChartNoAxesColumn },
    { name: 'Mon profil', href: '/profil', icon: Settings },
];
export const SPORT_NAV = { name: 'Fiches sportives', href: '/fiches', icon: Library };
export const ADMIN_NAV = { name: 'Administration', href: '/admin', icon: ShieldCheck };
export function activeNavigation(path: string, href: string) {
    if (href === '/stages') return path === href;
    if (href === '/profil') return path === href || path.startsWith('/profil/fil-rouge');
    if (href === '/stages/semaines') return path.startsWith('/stages/') && !path.startsWith('/stages/decouvrir');
    return path === href || path.startsWith(href + '/');
}
