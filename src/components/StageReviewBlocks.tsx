import { cn } from '@/lib/utils';
import { getStageClosingMemoSections, parseStageClosingMemo } from '@/lib/stage-closing-memo';

export type StageReviewStats = {
    contentCount?: number;
    placedCount?: number;
    validatedCount?: number;
    defisDone?: number;
    defisTotal?: number;
    quizDone?: boolean;
    quizScore?: number | null;
    quizTotal?: number | null;
    quizPoints?: number | null;
    stageTotalPoints?: number;
};

export function formatStageClosedAt(closedAt?: string | null) {
    if (!closedAt) return null;
    return new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'long',
        timeStyle: 'short',
    }).format(new Date(closedAt));
}

function MetricCard({
    icon,
    label,
    value,
    helper,
    tone = 'slate',
}: {
    icon: string;
    label: string;
    value: string;
    helper: string;
    tone?: 'slate' | 'indigo' | 'emerald' | 'amber' | 'violet';
}) {
    const toneCls = {
        slate: 'border-slate-200 bg-white text-slate-900',
        indigo: 'border-indigo-200 bg-indigo-50 text-indigo-950',
        emerald: 'border-emerald-200 bg-emerald-50 text-emerald-950',
        amber: 'border-amber-200 bg-amber-50 text-amber-950',
        violet: 'border-violet-200 bg-violet-50 text-violet-950',
    }[tone];

    return (
        <div className={cn('rounded-3xl border p-4 sm:p-5', toneCls)}>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
                    <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{helper}</p>
                </div>
                <span className="material-symbols-outlined text-[24px] text-slate-400">{icon}</span>
            </div>
        </div>
    );
}

export function StageReviewHighlights({
    stats,
    closedAt,
    className,
}: {
    stats?: StageReviewStats | null;
    closedAt?: string | null;
    className?: string;
}) {
    const prevu = stats?.contentCount ?? 0;
    const place = stats?.placedCount ?? 0;
    const fait = stats?.validatedCount ?? 0;
    const defisTotal = stats?.defisTotal ?? 0;
    const defisDone = stats?.defisDone ?? 0;
    const quizScore = stats?.quizScore ?? 0;
    const quizTotal = stats?.quizTotal ?? 0;
    const quizPoints = stats?.quizPoints ?? 0;
    const totalPoints = stats?.stageTotalPoints ?? 0;
    const closedLabel = formatStageClosedAt(closedAt);

    return (
        <div className={cn('grid gap-3 sm:grid-cols-2 xl:grid-cols-5', className)}>
            <MetricCard
                icon="track_changes"
                label="Objectifs"
                value={`${prevu}`}
                helper={place > 0 ? `${place} fiche${place > 1 ? 's' : ''} placée${place > 1 ? 's' : ''} dans les séances` : 'Réservoir pédagogique du stage'}
                tone="slate"
            />
            <MetricCard
                icon="flag"
                label="Transmission réalisée"
                value={`${fait}/${prevu}`}
                helper={prevu > 0 ? `${Math.round((fait / prevu) * 100)}% des fiches prévues ont été validées` : 'Aucune fiche sélectionnée'}
                tone="amber"
            />
            <MetricCard
                icon="eco"
                label="Défis terrain"
                value={`${defisDone}/${defisTotal}`}
                helper={defisTotal > 0 ? 'Défis validés par le groupe pendant le stage' : 'Aucun défi affecté à ce stage'}
                tone="emerald"
            />
            <MetricCard
                icon="quiz"
                label="Quiz final"
                value={quizTotal > 0 ? `${quizScore}/${quizTotal}` : '—'}
                helper={quizTotal > 0 ? `+${quizPoints} pt${quizPoints > 1 ? 's' : ''} gagnés grâce au quiz` : 'Le quiz n’a pas encore été terminé'}
                tone="violet"
            />
            <MetricCard
                icon={closedLabel ? 'workspace_premium' : 'stars'}
                label={closedLabel ? 'Stage clôturé' : 'Banque de points'}
                value={closedLabel ? closedLabel : `+${totalPoints}`}
                helper={closedLabel ? 'Bilan figé et conservé dans votre historique' : 'Total des points gagnés sur ce stage'}
                tone="indigo"
            />
        </div>
    );
}

export function StageReviewStory({
    stats,
    className,
}: {
    stats?: StageReviewStats | null;
    className?: string;
}) {
    const prevu = stats?.contentCount ?? 0;
    const place = stats?.placedCount ?? 0;
    const fait = stats?.validatedCount ?? 0;
    const defisTotal = stats?.defisTotal ?? 0;
    const defisDone = stats?.defisDone ?? 0;
    const quizScore = stats?.quizScore ?? 0;
    const quizTotal = stats?.quizTotal ?? 0;
    const quizPoints = stats?.quizPoints ?? 0;
    const totalPoints = stats?.stageTotalPoints ?? 0;

    return (
        <div className={cn('grid gap-4 lg:grid-cols-2', className)}>
            <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Ce qu’on avait prévu</p>
                <h3 className="mt-2 text-xl font-black text-slate-900">Le cadre posé pour ce groupe</h3>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                    <li className="flex gap-3"><span className="mt-0.5 size-2 rounded-full bg-sky-400 shrink-0" />{prevu} fiche{prevu > 1 ? 's' : ''} pédagogique{prevu > 1 ? 's' : ''} sélectionnée{prevu > 1 ? 's' : ''} pour le stage.</li>
                    <li className="flex gap-3"><span className="mt-0.5 size-2 rounded-full bg-amber-400 shrink-0" />{place} fiche{place > 1 ? 's' : ''} effectivement placée{place > 1 ? 's' : ''} dans les séances.</li>
                    <li className="flex gap-3"><span className="mt-0.5 size-2 rounded-full bg-emerald-400 shrink-0" />{defisTotal} défi{defisTotal > 1 ? 's' : ''} terrain prévu{defisTotal > 1 ? 's' : 'u'} pour embarquer le groupe.</li>
                    <li className="flex gap-3"><span className="mt-0.5 size-2 rounded-full bg-violet-400 shrink-0" />Un quiz final {quizTotal > 0 ? `de ${quizTotal} question${quizTotal > 1 ? 's' : ''}` : 'prévu pour vérifier la transmission'}.</li>
                </ul>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-slate-900 p-5 text-white sm:p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Ce qui a été réussi</p>
                <h3 className="mt-2 text-xl font-black">Le bilan réel de l’équipe</h3>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-200">
                    <li className="flex gap-3"><span className="mt-0.5 size-2 rounded-full bg-amber-300 shrink-0" />{fait}/{prevu} fiche{fait > 1 ? 's' : ''} réellement validée{fait > 1 ? 's' : ''} sur le terrain.</li>
                    <li className="flex gap-3"><span className="mt-0.5 size-2 rounded-full bg-emerald-300 shrink-0" />{defisDone}/{defisTotal} défi{defisDone > 1 ? 's' : ''} validé{defisDone > 1 ? 's' : ''} par le groupe.</li>
                    <li className="flex gap-3"><span className="mt-0.5 size-2 rounded-full bg-violet-300 shrink-0" />Quiz final {quizTotal > 0 ? `terminé avec ${quizScore}/${quizTotal} bonnes réponses` : 'pas encore terminé'}.</li>
                    <li className="flex gap-3"><span className="mt-0.5 size-2 rounded-full bg-indigo-300 shrink-0" />+{totalPoints} points cumulés sur le stage, dont {quizTotal > 0 ? `+${quizPoints} grâce au quiz` : 'les gains liés aux défis'}.</li>
                </ul>
            </section>
        </div>
    );
}

export function StageClosingNotes({
    notes,
    title = 'Mémo moniteur',
    className,
}: {
    notes?: string | null;
    title?: string;
    className?: string;
}) {
    if (!notes?.trim()) return null;

    const memo = parseStageClosingMemo(notes);
    const sections = getStageClosingMemoSections(memo);

    if (sections.length === 0) return null;

    return (
        <section className={cn('rounded-3xl border border-slate-200 bg-white p-5 sm:p-6', className)}>
            <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">edit_note</span>
                </div>
                <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Mémoire moniteur</p>
                    <h3 className="text-xl font-black text-slate-900">{title}</h3>
                </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
                {sections.map(section => (
                    <div key={section.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{section.title}</p>
                        <p className="mt-2 text-xs leading-relaxed text-slate-500">{section.helper}</p>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{section.value}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}