import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 -left-32 size-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 -right-32 size-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-150 bg-blue-900/20 rounded-full blur-3xl pointer-events-none" />

            <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative z-10">

                {/* Logo */}
                <div className="size-32 mx-auto mb-6 drop-shadow-2xl">
                    <Image src="/logo.jpg" alt="COP'UN logo" width={128} height={128} className="rounded-full w-full h-full object-cover" priority />
                </div>

                {/* Title */}
                <h1 className="text-5xl font-black text-white uppercase tracking-tight mb-3 text-center">COP&apos;UN</h1>
                <p className="text-slate-400 font-medium text-center max-w-xs leading-relaxed mb-12">
                    Un outil pour intégrer l&apos;environnement marin dans vos séances et faire de chaque vague une vague de conscience.
                </p>

                {/* Feature pills */}
                <div className="flex flex-wrap justify-center gap-2 mb-12 max-w-sm">
                    {[
                        { icon: 'menu_book', label: 'Fiches pédagogiques' },
                        { icon: 'flag', label: 'Planning de stage' },
                        { icon: 'eco', label: 'Défis terrain' },
                        { icon: 'task_alt', label: 'Bilan de séance' },
                    ].map(f => (
                        <span key={f.label} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-slate-400">
                            <span className="material-symbols-outlined text-[14px] text-indigo-400">{f.icon}</span>
                            {f.label}
                        </span>
                    ))}
                </div>

                {/* CTA */}
                <Link
                    href="/login"
                    className="w-full max-w-xs py-5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-500/30 active:scale-[0.98] transition-all text-center flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-[20px]">login</span>
                    Se connecter
                </Link>

                <p className="mt-6 text-slate-600 text-xs font-bold uppercase tracking-widest">Accès réservé aux moniteurs et clubs</p>
            </main>

            <footer className="relative z-10 text-center pb-8">
                <p className="text-slate-700 text-xs italic">&ldquo;Pour un littoral vivant et protégé&rdquo;</p>
            </footer>
        </div>
    );
}
