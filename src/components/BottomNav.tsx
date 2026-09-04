'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { SPORT_FEATURES_ENABLED } from '@/lib/feature-flags';

const baseNavItems = [
    { name: 'Accueil', href: '/stages', icon: 'dashboard', fill: true },
    { name: 'Formation', href: '/formation', icon: 'school', fill: false },
    { name: 'Ressources', href: '/ressources', icon: 'menu_book', fill: false },
    { name: 'Fiches', href: '/fiches', icon: 'sports', fill: false },
    { name: 'Stats', href: '/stats', icon: 'leaderboard', fill: false },
    { name: 'Profil', href: '/profil', icon: 'person', fill: false },
];

const adminNavItem = { name: 'Admin', href: '/admin', icon: 'admin_panel_settings', fill: false };

export function BottomNav({ role, formationEnCours }: { role?: string | null; formationEnCours?: boolean }) {
    const pathname = usePathname();
    const navItems = ((role === 'admin' || role === 'club_admin') ? [...baseNavItems, adminNavItem] : baseNavItems)
        .filter(i => SPORT_FEATURES_ENABLED || i.href !== '/fiches');

    return (
        <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-50 md:hidden px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 pointer-events-none">
            <div className="nav-glass rounded-full border border-slate-200/60 px-6 py-3 flex items-center justify-around shadow-2xl backdrop-blur-md bg-white/90 pointer-events-auto">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                "relative flex flex-col items-center gap-1 transition-colors active:scale-95 p-2 rounded-xl",
                                isActive
                                    ? item.href === '/admin' ? "text-violet-600 bg-violet-50" : "text-indigo-600 bg-indigo-50"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <span className={clsx("material-symbols-outlined", isActive && item.fill && "font-variation-fill-1")}>
                                {item.icon}
                            </span>
                            {/* Tant que la formation n'est pas terminée, un point la signale
                                depuis n'importe quel écran — c'est ça, la présence continue
                                demandée : un rappel discret et permanent dans la nav, pas un
                                dashboard dupliqué sur l'accueil. Disparaît de lui-même une
                                fois tous les modules acquis. */}
                            {item.href === '/formation' && formationEnCours && !isActive && (
                                <span className="absolute top-1 right-2.5 size-2 rounded-full bg-indigo-500 border-2 border-white" />
                            )}
                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
