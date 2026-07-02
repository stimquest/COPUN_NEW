import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import { getStages } from '@/services/data-service';

export default async function StagesHistoriquePage() {
    noStore();
    const stages = await getStages();
    const archivedStages = stages.filter(s => !!s.closed_at);

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100">
                <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
                    <Link href="/stages" className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition active:scale-95 shrink-0">
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Historique</p>
                        <p className="text-sm font-bold text-slate-900">Semaines archivées</p>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 pt-5">
                {archivedStages.length === 0 ? (
                    <p className="text-center text-sm text-slate-400 py-10">Aucune semaine archivée pour l&apos;instant.</p>
                ) : (
                    <div className="space-y-2">
                        {archivedStages.map(s => (
                            <Link key={s.id} href={`/stages/${s.id}/bilan`} className="flex items-center gap-3 bg-white rounded-2xl border border-slate-200 px-4 py-3 hover:bg-slate-50 transition active:scale-95">
                                <span className="material-symbols-outlined text-slate-300 text-xl shrink-0">archive</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-700 truncate">{s.title}</p>
                                    <p className="text-xs text-slate-400">{s.dates}</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-300 text-base shrink-0">chevron_right</span>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
