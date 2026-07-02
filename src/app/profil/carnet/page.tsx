import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import { getPracticeJournal } from '@/services/practice-journal';
import { CarnetClient } from './CarnetClient';

export default async function CarnetPage() {
    noStore();
    const journal = await getPracticeJournal();

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100">
                <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
                    <Link
                        href="/profil"
                        className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition active:scale-95 shrink-0"
                    >
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Suivi personnel</p>
                        <p className="text-sm font-bold text-slate-900">Mon carnet de pratique</p>
                    </div>
                    {journal.weeksCount > 0 && (
                        <span className="text-[10px] font-bold text-slate-400 shrink-0">
                            {journal.weeksCount} semaine{journal.weeksCount > 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 pt-5">
                {journal.weeksCount === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center mt-6">
                        <span className="material-symbols-outlined text-4xl text-slate-300">auto_stories</span>
                        <p className="mt-3 text-sm font-bold text-slate-500">Ton carnet est encore vide</p>
                        <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                            Il se remplit à chaque semaine clôturée : tes bilans, tes notes,
                            ton évolution — tout se retrouve ici pour te relire.
                        </p>
                    </div>
                ) : (
                    <CarnetClient journal={journal} />
                )}
            </main>
        </div>
    );
}
