'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const navItems = [
    { name: 'Accueil', href: '/stages', icon: 'dashboard', fill: true },
    { name: 'Jeux', href: '/jeux', icon: 'quiz', fill: false },
    { name: 'Stats', href: '/stats', icon: 'leaderboard', fill: false },
    { name: 'Outils', href: '/profil', icon: 'settings', fill: false },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-6 left-6 right-6 z-50 md:hidden">
            <div className="nav-glass rounded-full border border-slate-200/60 px-6 py-3 flex items-center justify-around shadow-2xl backdrop-blur-md bg-white/80">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                "flex flex-col items-center gap-1 transition-colors active:scale-95 p-2 rounded-xl",
                                isActive ? "text-indigo-600 bg-indigo-50" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <span className={clsx("material-symbols-outlined", isActive && item.fill && "font-variation-fill-1")}>
                                {item.icon}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
