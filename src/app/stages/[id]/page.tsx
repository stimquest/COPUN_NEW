import { getStageById, getSessionsForStage } from '@/services/data-service';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DeleteStageButton } from '@/components/DeleteStageButton';

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
                <div className="flex-1">
                    <h1 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Pilotage du Stage</h1>
                    <p className="text-lg font-bold leading-none text-slate-900">{stage.title}</p>
                </div>
                <DeleteStageButton stageId={stage.id} />
            </header>

            <main className="flex-1 px-4 py-6 space-y-8 overflow-y-auto pb-36 max-w-6xl mx-auto w-full">

                {/* Stage Status Card */}
                <div className="bg-[#1f2249] text-white rounded-[1.5rem] shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <span className="material-symbols-outlined text-9xl">sailing</span>
                    </div>

                    {/* Top section: infos stage */}
                    <div className="relative z-10 p-6 pb-4">
                        <span className="inline-block bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 border border-emerald-500/30">En Cours</span>
                        <h2 className="text-2xl font-black mb-4 leading-tight">{stage.title}</h2>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-slate-300 text-sm">
                                <span className="material-symbols-outlined text-base text-slate-400">sailing</span>
                                <span className="font-medium">{stage.activity}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300 text-sm">
                                <span className="material-symbols-outlined text-base text-slate-400">calendar_month</span>
                                <span className="font-medium">{stage.dates}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300 text-sm">
                                <span className="material-symbols-outlined text-base text-slate-400">school</span>
                                <span className="font-medium">{stage.level}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300 text-sm">
                                <span className="material-symbols-outlined text-base text-slate-400">menu_book</span>
                                <span className="font-medium">{stage.selected_content?.length ?? 0} fiche{(stage.selected_content?.length ?? 0) !== 1 ? 's' : ''} pédago</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300 text-sm col-span-2">
                                <span className="material-symbols-outlined text-base text-slate-400">directions_boat</span>
                                <span className="font-medium">{sessions.length} séance{sessions.length !== 1 ? 's' : ''} planifiée{sessions.length !== 1 ? 's' : ''}</span>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/10 mx-6" />

                    {/* Bottom section: CTA En action */}
                    <div className="relative z-10 p-4">
                        <Link
                            href={firstSessionId ? `/session/${firstSessionId}` : `/stages/${id}/sessions`}
                            className="flex items-center justify-between bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all px-5 py-3.5 rounded-2xl group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="size-9 rounded-xl bg-white/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">play_arrow</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">EN DIRECT</p>
                                    <p className="text-base font-bold leading-none">En action</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {firstSessionId && <span className="animate-pulse flex h-2 w-2 rounded-full bg-emerald-400"></span>}
                                <span className="material-symbols-outlined text-indigo-200 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </div>
                        </Link>
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

                    {/* Layer 4: QUIZ (Bilan transmission) */}
                    <Link href={`/stages/${id}/quiz`} className="block h-full border-b-8 border-violet-400 rounded-[1.5rem] md:order-4 group">
                        <div className="bg-white p-6 rounded-[1.5rem] shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
                            <div className="size-12 rounded-xl bg-violet-100 text-violet-500 flex items-center justify-center shrink-0 mb-6">
                                <span className="material-symbols-outlined text-2xl">quiz</span>
                            </div>
                            <div className="flex-1 flex flex-col">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">ÉTAPE 4</span>
                                <h4 className="text-2xl font-bold text-slate-900 leading-tight mb-4">Le Quiz</h4>
                                <div className="mt-4 flex-1">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">BILAN DE TRANSMISSION</span>
                                    <p className="text-sm text-slate-600 font-medium leading-snug">Valider ce que le groupe a retenu — débloque les points.</p>
                                </div>
                            </div>
                        </div>
                    </Link>

                </section>


            </main>
        </div>
    );
}
