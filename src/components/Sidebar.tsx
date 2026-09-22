'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PRIMARY_NAV, SECONDARY_NAV, SPORT_NAV, ADMIN_NAV, activeNavigation } from '@/data/navigation';
import { SPORT_FEATURES_ENABLED } from '@/lib/feature-flags';

type SidebarProps = { role?: string | null; fullName?: string | null; email?: string | null; clubName?: string | null; formationEnCours?: boolean };
export function Sidebar({ role, fullName, email, clubName, formationEnCours }: SidebarProps) {
    const path = usePathname();
    if (path === '/' || path.startsWith('/login') || path.startsWith('/auth')) return null;
    const secondary = [...SECONDARY_NAV, ...(SPORT_FEATURES_ENABLED ? [SPORT_NAV] : []), ...(['admin', 'club_admin'].includes(role ?? '') ? [ADMIN_NAV] : [])];
    return <aside className="co-sidebar">
        <Link href="/stages" className="co-wordmark">cop<span>’</span>un<span className="co-wordmark-dot">.</span></Link>
        <p className="co-sidebar-tagline">Le terrain a tant à raconter.</p>
        <nav aria-label="Navigation principale">{PRIMARY_NAV.map(item => {
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} aria-current={activeNavigation(path, item.href) ? 'page' : undefined}><Icon size={20}/>{item.name}{item.href === '/formation' && formationEnCours && <i className="co-nav-dot"/>}</Link>;
        })}</nav>
        <nav className="co-sidebar-secondary" aria-label="Outils et compte">{secondary.map(item => {
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} aria-current={activeNavigation(path, item.href) ? 'page' : undefined}><Icon size={18}/>{item.name}</Link>;
        })}</nav>
        <Link href="/profil" className="co-sidebar-profile"><span className="co-avatar">{(fullName || email || 'M').slice(0, 1).toUpperCase()}</span><span>{fullName || 'Mon profil'}<small>{clubName || 'Mon espace personnel'}</small></span></Link>
    </aside>;
}
