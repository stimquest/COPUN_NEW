import { usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';

const baseNavItems = [
    { name: 'Accueil', href: '/', icon: 'home', fill: false },
    { name: 'Semaines', href: '/semaines', icon: 'calendar_month', fill: false },
    { name: 'Fiches', href: '/fiches', icon: 'sailing', fill: false },
    { name: 'Stats', href: '/stats', icon: 'leaderboard', fill: false },
    { name: 'Profil', href: '/profil', icon: 'person', fill: false },
];

export function BottomNav() {
    const pathname = usePathname();
    const navItems = baseNavItems;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md rounded-full border border-slate-200/60 px-6 py-3 flex items-center justify-around shadow-2xl pointer-events-auto">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                "flex flex-col items-center gap-1 transition-colors active:scale-95 p-2 rounded-xl",
                                isActive
                                    ? "text-indigo-600 bg-indigo-50"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <span className="material-symbols-outlined">
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