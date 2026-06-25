import Link from 'next/link';
import { getFilRougeHistory } from '@/actions/defi-actions';

export default async function FilRougePage() {
    const { entries, defi } = await getFilRougeHistory();

    const validated = entries.filter(e => e.status === 'complete');
    const total = entries.length;
    const streak = computeStreak(entries);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-32">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-5 py-4 flex items-center gap-4">
                <Link href="/profil" className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                    <p className="text-[10px] font-black tracking-widest text-emerald-500 uppercase">Défi de saison</p>
                    <p className="text-lg font-bold leading-none text-slate-900">Mon fil rouge</p>
                </div>
            </header>

            <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full space-y-6">

                {/* Pas de fil rouge défini */}
                {!defi && (
                    <div className="text-center py-20 space-y-4">
                        <span className="material-symbols-outlined text-5xl text-slate-200">timeline</span>
                        <p className="text-slate-500 font-semibold">Aucun défi de saison sélectionné.</p>
                        <Link href="/profil" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-black uppercase tracking-widest">
                            Choisir mon défi
                        </Link>
                    </div>
                )}

                {defi && (
                    <>
                        {/* Défi actif */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                            <div className="flex items-start gap-4">
                                <div className="size-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-2xl">{defi.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-0.5">Défi de saison actif</p>
                                    <h2 className="font-black text-slate-900 text-base leading-tight">{defi.description}</h2>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{defi.instruction}</p>
                                </div>
                            </div>
                        </div>

                        {/* KPIs */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-emerald-600 rounded-2xl p-4 text-center shadow-lg shadow-emerald-500/20">
                                <p className="text-3xl font-black text-white">{validated.length}</p>
                                <p className="text-[9px] font-black text-emerald-200 uppercase tracking-widest mt-0.5">Validés</p>
                            </div>
                            <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-slate-100">
                                <p className="text-3xl font-black text-slate-900">{total}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Stages</p>
                            </div>
                            <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-slate-100">
                                <p className="text-3xl font-black text-amber-500">{streak}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Série</p>
                            </div>
                        </div>

                        {/* Barre de progression saison */}
                        {total > 0 && (
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Régularité sur la saison</p>
                                    <p className="text-sm font-black text-emerald-600">{Math.round((validated.length / total) * 100)}%</p>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all"
                                        style={{ width: `${(validated.length / total) * 100}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-2">{validated.length} validation{validated.length > 1 ? 's' : ''} sur {total} stage{total > 1 ? 's' : ''}</p>
                            </div>
                        )}

                        {/* Timeline */}
                        {entries.length === 0 ? (
                            <div className="text-center py-12 space-y-2">
                                <span className="material-symbols-outlined text-4xl text-slate-200">history</span>
                                <p className="text-sm text-slate-400 font-semibold">Aucun stage avec ce défi pour l&apos;instant.</p>
                                <p className="text-xs text-slate-400">Le défi sera automatiquement assigné à votre prochain stage.</p>
                            </div>
                        ) : (
                            <section>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Historique des passages</p>
                                <div className="relative">
                                    {/* Ligne verticale */}
                                    <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200" />

                                    <div className="space-y-4">
                                        {entries.map((entry, i) => {
                                            const isFirst = i === 0;
                                            const done = entry.status === 'complete';
                                            return (
                                                <div key={`${entry.stage_id}-${i}`} className="relative flex gap-4">
                                                    {/* Dot timeline */}
                                                    <div className={`relative z-10 size-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                                                        done
                                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                                            : 'bg-white border-slate-300 text-slate-400'
                                                    }`}>
                                                        <span className="material-symbols-outlined text-sm">
                                                            {done ? 'check' : 'schedule'}
                                                        </span>
                                                        {isFirst && done && (
                                                            <span className="absolute -top-1 -right-1 size-3 bg-amber-400 rounded-full border-2 border-white" title="Dernier passage" />
                                                        )}
                                                    </div>

                                                    {/* Contenu */}
                                                    <div className="flex-1 pb-4">
                                                        <div className={`rounded-2xl p-4 border shadow-sm ${
                                                            done ? 'bg-white border-slate-100' : 'bg-slate-50 border-slate-100'
                                                        }`}>
                                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                                <div>
                                                                    <p className="font-bold text-slate-900 text-sm">{entry.stage_title}</p>
                                                                    {entry.stage_dates && (
                                                                        <p className="text-xs text-slate-400 mt-0.5">{entry.stage_dates}</p>
                                                                    )}
                                                                </div>
                                                                {done ? (
                                                                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">Validé</span>
                                                                ) : (
                                                                    <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">En cours</span>
                                                                )}
                                                            </div>

                                                            {/* Notes de terrain */}
                                                            {entry.notes && (
                                                                <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-3">
                                                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-0.5">Observation</p>
                                                                    <p className="text-xs text-amber-900 leading-relaxed">{entry.notes}</p>
                                                                </div>
                                                            )}

                                                            {/* Photos */}
                                                            {entry.preuves_url.length > 0 && (
                                                                <div className="flex gap-2 flex-wrap mt-2">
                                                                    {entry.preuves_url.map((url, j) => (
                                                                        <a key={j} href={url} target="_blank" rel="noreferrer" className="block">
                                                                            <img
                                                                                src={url}
                                                                                alt={`Photo ${j + 1}`}
                                                                                className="size-20 object-cover rounded-xl border border-slate-200 hover:scale-105 transition-transform"
                                                                            />
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {done && entry.preuves_url.length === 0 && !entry.notes && (
                                                                <p className="text-xs text-slate-400 italic">Validé sans photo ni note</p>
                                                            )}

                                                            {/* Lien vers le stage */}
                                                            <Link
                                                                href={`/stages/${entry.stage_id}/defis`}
                                                                className="mt-3 flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
                                                            >
                                                                <span className="material-symbols-outlined text-xs">open_in_new</span>
                                                                Voir le stage
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

function computeStreak(entries: { status: string }[]): number {
    let streak = 0;
    for (const e of entries) {
        if (e.status === 'complete') streak++;
        else break;
    }
    return streak;
}
