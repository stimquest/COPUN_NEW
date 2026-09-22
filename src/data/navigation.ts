import { BookOpen, Compass, GraduationCap, House, NotebookPen, Waves, Settings, ChartNoAxesColumn, CalendarDays, ShieldCheck, Library } from 'lucide-react';

export const PRIMARY_NAV = [
    { name: 'Accueil', href: '/stages', icon: House },
    { name: 'Formation', href: '/formation', icon: GraduationCap },
    { name: 'Parcours', href: '/specialisation', icon: Waves },
    { name: 'Explorer', href: '/stages/decouvrir', icon: Compass },
    { name: 'Carnet', href: '/profil/carnet', icon: NotebookPen },
];
export const SECONDARY_NAV = [
    { name: 'Ressources', href: '/ressources', icon: BookOpen },
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
