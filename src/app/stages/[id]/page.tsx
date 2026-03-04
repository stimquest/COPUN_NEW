import { getStageById, getSessionsForStage } from '@/services/data-service';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function StageCockpitPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const stage = await getStageById(id);
    const sessions = await getSessionsForStage(id);

    if (!stage) return notFound();

    const firstSessionId = sessions && sessions.length > 0 ? sessions[0].id : null;

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
                <Link href="/stages" className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Pilotage du Stage</h1>
                    <p className="text-lg font-bold leading-none text-slate-900">{stage.title}</p>
                </div>
            </header>

            <main className="flex-1 px-4 py-6 space-y-8 overflow-y-auto pb-36 max-w-6xl mx-auto w-full">

                {/* Stage Status Card */}
                <div className="bg-[#1f2249] text-white p-8 rounded-[1.5rem] shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <span className="material-symbols-outlined text-9xl">sailing</span>
                    </div>
                    <div className="relative z-10">
                        <span className="inline-block bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 border border-emerald-500/30">En Cours</span>
                        <h2 className="text-3xl font-black mb-2 leading-tight">{stage.title}</h2>
                        <div className="flex items-center gap-4 text-slate-400 text-sm font-medium">
                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">sailing</span> {stage.activity}</span>
                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">calendar_month</span> {stage.dates}</span>
                        </div>
                    </div>
                </div>

                {/* THE 4 LAYERS WORKFLOW */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Layer 1: PROGRAMME (Strategie) */}
                    <Link href={`/stages/${id}/program`} className="block h-full border-b-8 border-sky-300 rounded-[1.5rem]">
                        <div className="bg-white p-6 rounded-[1.5rem] shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
                            <div className="size-12 rounded-xl bg-sky-100 text-sky-500 flex items-center justify-center shrink-0 mb-6">
                                <span className="material-symbols-outlined text-2xl">track_changes</span>
                            </div>
                            <div className="flex-1 flex flex-col">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">ÉTAPE 1</span>
                                <h4 className="text-2xl font-bold text-slate-900 leading-tight mb-4">Les Objectifs</h4>
                                <div className="mt-4 flex-1">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">ÉTAT D&apos;AVANCEMENT</span>
                                    <p className="text-sm text-slate-600 font-medium leading-snug">Constituer le réservoir de fiches PEDAGO pour la semaine.</p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Layer 2: SEANCES (Tactique) */}
                    <Link href={`/stages/${id}/sessions`} className="block h-full border-b-8 border-amber-300 rounded-[1.5rem]">
                        <div className="bg-white p-6 rounded-[1.5rem] shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
                            <div className="size-12 rounded-xl bg-amber-100 text-amber-500 flex items-center justify-center shrink-0 mb-6">
                                <span className="material-symbols-outlined text-2xl">flag</span>
                            </div>
                            <div className="flex-1 flex flex-col">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">ÉTAPE 2</span>
                                <h4 className="text-2xl font-bold text-slate-900 leading-tight mb-4">Le Planning</h4>
                                <div className="mt-4 flex-1">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">ORGANISATION</span>
                                    <p className="text-sm text-slate-600 font-medium leading-snug">Organiser les séances de voile et y lier les cartes pedago.</p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Layer 3: DÉFIS TERRAIN */}
                    <Link href={`/stages/${id}/defis`} className="block h-full border-b-8 border-emerald-300 rounded-[1.5rem] md:order-3">
                        <div className="bg-white p-6 rounded-[1.5rem] shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
                            <div className="size-12 rounded-xl bg-emerald-100 text-emerald-500 flex items-center justify-center shrink-0 mb-6">
                                <span className="material-symbols-outlined text-2xl">eco</span>
                            </div>
                            <div className="flex-1 flex flex-col">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">ÉTAPE 3</span>
                                <h4 className="text-2xl font-bold text-slate-900 leading-tight mb-4">Les Défis</h4>
                                <div className="mt-4 flex-1">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">ENGAGEMENT ÉCO</span>
                                    <p className="text-sm text-slate-600 font-medium leading-snug">Objectifs terrain et activités environnementales.</p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Layer 4: COMPAGNON (Execution) */}
                    <Link href={`/session/${firstSessionId || '#'}`} className="block h-full border-b-8 border-indigo-400 rounded-[1.5rem] md:order-4 group">
                        <div className="bg-[#1a1744] text-white p-6 rounded-[1.5rem] shadow-sm flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 to-transparent group-hover:from-indigo-500/20 transition-colors"></div>
                            <div className="size-12 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 mb-6 relative z-10 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-2xl">play_arrow</span>
                            </div>
                            <div className="flex-1 flex flex-col relative z-10">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">EN DIRECT</span>
                                    {firstSessionId && <span className="animate-pulse flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>}
                                </div>
                                <h4 className="text-2xl font-bold leading-tight mb-4">En action</h4>
                                <div className="mt-auto pt-8">
                                    <p className="text-sm text-slate-300 font-medium leading-snug">Interface de terrain en direct.</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </section>


            </main>
        </div>
    );
}
