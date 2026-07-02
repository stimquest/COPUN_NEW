import clsx from 'clsx';
import {
    Abundance, Frequency,
    ABUNDANCE_LABELS, INVENTAIRE_GROUPES, LAISSE_CATEGORIES, FREQUENCY_LABELS,
} from '@/data/defi-structured-labels';

const ABUNDANCE_DOT: Record<Abundance, string> = {
    absent: 'bg-slate-200',
    quelques: 'bg-amber-400',
    abondant: 'bg-emerald-500',
};

function AbundanceRow({ label, value }: { label: string; value: Abundance }) {
    if (value === 'absent') return null;
    return (
        <div className="flex items-center gap-2 text-xs">
            <span className={clsx('size-2 rounded-full shrink-0', ABUNDANCE_DOT[value])} />
            <span className="text-slate-600 flex-1">{label}</span>
            <span className="font-bold text-slate-800">{ABUNDANCE_LABELS[value]}</span>
        </div>
    );
}

/** Affiche en lecture seule le contenu de `structured_data` d'un stage_exploit, selon le défi concerné. */
export function DefiStructuredSummary({ defiId, structuredData }: { defiId: string; structuredData: Record<string, unknown> | null }) {
    if (!structuredData) return null;

    if (defiId === 'defi_bio_2') {
        const groupes = (structuredData.groupes ?? {}) as Record<string, Abundance>;
        const coverage = structuredData.coverage as string | null | undefined;
        const etat = structuredData.etat as string | null | undefined;
        const rows = INVENTAIRE_GROUPES.filter(g => groupes[g.key] && groupes[g.key] !== 'absent');
        if (rows.length === 0 && !coverage && !etat) return null;
        return (
            <div className="space-y-1.5">
                {(coverage || etat) && (
                    <p className="text-xs text-slate-500">
                        {coverage ? `Recouvrement du vivant : ${coverage}` : ''}
                        {coverage && etat ? ' · ' : ''}
                        {etat ? `État : ${etat}` : ''}
                    </p>
                )}
                {rows.map(g => <AbundanceRow key={g.key} label={g.label} value={groupes[g.key]} />)}
            </div>
        );
    }

    if (defiId === 'defi_laisse_1') {
        const categories = (structuredData.categories ?? {}) as Record<string, Abundance>;
        const rows = LAISSE_CATEGORIES.filter(c => categories[c.key] && categories[c.key] !== 'absent');
        if (rows.length === 0) return null;
        return (
            <div className="space-y-1.5">
                {rows.map(c => <AbundanceRow key={c.key} label={c.label} value={categories[c.key]} />)}
            </div>
        );
    }

    if (defiId === 'defi_erosion_1') {
        const changeVisible = structuredData.change_visible as boolean | null;
        const notes = structuredData.notes as string | null;
        if (changeVisible === null && !notes) return null;
        return (
            <div className="space-y-1">
                {changeVisible !== null && (
                    <p className="text-xs text-slate-600">
                        Changement visible : <span className="font-bold">{changeVisible ? 'Oui' : 'Non'}</span>
                    </p>
                )}
                {notes && <p className="text-xs text-slate-500 italic">{notes}</p>}
            </div>
        );
    }

    if (defiId === 'defi_faune_1') {
        const obs = (structuredData.observations ?? []) as { name: string; count: number; frequency: Frequency | null }[];
        const freeText = structuredData.free_text as string | null;
        if (obs.length === 0 && !freeText) return null;
        return (
            <div className="space-y-1.5">
                {obs.map((o, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="text-slate-600 flex-1">{o.name}</span>
                        <span className="font-bold text-slate-800">×{o.count}</span>
                        {o.frequency && (
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                                {FREQUENCY_LABELS[o.frequency] ?? o.frequency}
                            </span>
                        )}
                    </div>
                ))}
                {freeText && <p className="text-xs text-slate-500 italic">{freeText}</p>}
            </div>
        );
    }

    return null;
}
