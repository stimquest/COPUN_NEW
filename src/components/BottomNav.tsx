'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PRIMARY_NAV, activeNavigation } from '@/data/navigation';

/**
 * La formation ayant quitté la barre du bas, son point d'alerte se pose sur l'accueil :
 * c'est de là que part sa tuile, et le signal se perdrait autrement sur mobile.
 */
export function BottomNav({ formationEnCours }: { role?: string | null; formationEnCours?: boolean }) {
    const path = usePathname();
    if (path === '/' || path.startsWith('/login') || path.startsWith('/auth')) return null;
    return <nav className="co-bottom-nav" aria-label="Navigation principale">
        {PRIMARY_NAV.map(item => {
            const active = activeNavigation(path, item.href);
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={active ? 'is-active' : ''}>
                <span className="co-nav-icon"><Icon size={21} strokeWidth={active ? 2.2 : 1.7}/>{item.href === '/stages' && formationEnCours && !active && <i/>}</span>
                <span>{item.name}</span>
            </Link>;
        })}
    </nav>;
}
