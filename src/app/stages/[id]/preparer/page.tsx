import { getStageById, getPedagogicalContentByIds } from '@/services/data-service';
import { getStagePreparations } from '@/actions/preparation-actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PedagogicalContent } from '@/types';
import PreparerClient from './PreparerClient';

export default async function PreparerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const stage = await getStageById(id);
    if (!stage) return notFound();

    const selectedIds: string[] = stage.selected_content ?? [];
    const contents = (await getPedagogicalContentByIds(selectedIds)) as PedagogicalContent[];

    // Toutes les fiches retenues sont préparables. La couche transmission (accroche,
    // idée à retenir…) n'existe que sur une poignée de fiches et enrichit l'écran quand
    // elle est là — la filtrer produisait un « Rien à préparer » sur presque toute
    // sélection, et donc un cul-de-sac juste après le choix des contenus.
    const preparations = await getStagePreparations(id);

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="flex items-center gap-3 px-4 py-4 sticky top-0 bg-background/90 backdrop-blur-sm z-40">
                <Link
                    href="/stages"
                    className="size-9 rounded-full bg-white flex items-center justify-center text-slate-600 active:scale-90 transition shrink-0"
                >
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </Link>
                <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Le fil de ma semaine</p>
                    <h1 className="text-base font-black text-slate-900 leading-tight truncate">{stage.title}</h1>
                </div>
            </header>

            <PreparerClient
                stageId={id}
                contents={contents}
                initialPreparations={preparations}
                initialActionsSemaine={stage.actions_semaine ?? []}
            />
        </div>
    );
}
