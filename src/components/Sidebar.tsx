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

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-slate-200 shadow-sm p-6 z-50 shrink-0">
            <div className="mb-10 px-4">
                <span className="text-2xl font-black text-indigo-600 tracking-tight">COPUN.</span>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-semibold",
                                isActive
                                    ? "text-indigo-700 bg-indigo-50 shadow-sm"
                                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                            )}
                        >
                            <span className={clsx("material-symbols-outlined text-xl", isActive && item.fill && "font-variation-fill-1")}>
                                {item.icon}
                            </span>
                            <span className="uppercase tracking-wider text-sm">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                        CN
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-slate-800 truncate">Club Nautique</p>
                        <p className="text-xs text-slate-500 truncate">Espace Moniteur</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
