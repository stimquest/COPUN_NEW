import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStageById, getPedagogicalContentByIds } from '@/services/data-service';
import { getDefis, getStageExploits } from '@/actions/defi-actions';
import DefisTab from '@/components/DefisTab';

export default async function DefisPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const stage = await getStageById(id);

    if (!stage) return notFound();

    const [availableDefis, assignedExploits] = await Promise.all([
        getDefis(),
        getStageExploits(id)
    ]);

    // Extract themes from selected stage content
    const selectedContentIds = stage.selected_content || [];
    const stageContent = await getPedagogicalContentByIds(selectedContentIds);
    const suggestedThemesSet = new Set<string>();
    stageContent.forEach(content => {
        content.tags_theme?.forEach((theme: string) => suggestedThemesSet.add(theme));
    });
    const suggestedThemes = Array.from(suggestedThemesSet);

    const completedCount = assignedExploits.filter(e => e.status === 'complete').length;

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
                <Link href={`/stages/${id}`} className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div className="flex-1">
                    <h1 className="text-[10px] font-black tracking-widest text-emerald-500 uppercase">Défis Terrain</h1>
                    <p className="text-lg font-bold leading-none text-slate-900">{stage.title}</p>
                </div>
                {completedCount > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 rounded-full">
                        <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                        <span className="text-sm font-bold text-emerald-700">{completedCount}</span>
                    </div>
                )}
            </header>

            <main className="flex-1 px-4 py-6 pb-32 max-w-2xl mx-auto w-full">
                {/* Stats Summary */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="size-14 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">eco</span>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-black text-slate-900">Engagement Environnemental</h2>
                            <p className="text-sm text-slate-600">
                                {assignedExploits.length === 0
                                    ? 'Assignez des défis terrain pour ce stage'
                                    : `${completedCount}/${assignedExploits.length} défis validés`
                                }
                            </p>
                        </div>
                        {assignedExploits.length > 0 && (
                            <div className="text-right">
                                <div className="text-3xl font-black text-emerald-600">
                                    {Math.round((completedCount / assignedExploits.length) * 100)}%
                                </div>
                            </div>
                        )}
                    </div>
                    {assignedExploits.length > 0 && (
                        <div className="mt-4 h-2 bg-emerald-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{ width: `${(completedCount / assignedExploits.length) * 100}%` }}
                            />
                        </div>
                    )}
                </div>

                {/* DefisTab Component */}
                <DefisTab
                    stageId={id}
                    availableDefis={availableDefis}
                    assignedExploits={assignedExploits}
                    suggestedThemes={suggestedThemes}
                />
            </main>
        </div>
    );
}
