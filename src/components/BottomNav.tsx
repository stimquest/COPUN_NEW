'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PRIMARY_NAV, activePole } from '@/data/navigation';

/** Une entrée par pôle : un parcours allume « Formation », le carnet allume « Mes séances ». */
export function BottomNav({ formationEnCours }: { role?: string | null; formationEnCours?: boolean }) {
    const path = usePathname();
    if (path === '/' || path.startsWith('/login') || path.startsWith('/auth')) return null;
    return <nav className="co-bottom-nav" aria-label="Navigation principale">
        {PRIMARY_NAV.map(item => {
            const active = activePole(path, item.href);
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={active ? 'is-active' : ''}>
                <span className="co-nav-icon"><Icon size={21} strokeWidth={active ? 2.2 : 1.7}/>{item.href === '/formation' && formationEnCours && !active && <i/>}</span>
                <span>{item.name}</span>
            </Link>;
        })}
    </nav>;
}
