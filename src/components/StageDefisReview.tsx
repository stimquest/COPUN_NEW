import clsx from 'clsx';
import { DefiStructuredSummary } from './DefiStructuredSummary';

export type DefiReview = {
    id: string;
    description: string;
    status: 'en_cours' | 'complete';
    points: number;
    terrain_temps_reel: boolean;
    structured_data: Record<string, unknown> | null;
    preuves_url: string[];
};

/** Relecture des défis terrain assignés à la semaine, avec le détail structuré (espèces, catégories…) si renseigné. */
export function StageDefisReview({ defis }: { defis: DefiReview[] }) {
    return (
        <div className="space-y-2">
            {defis.map(defi => {
                const hasDetail = !!defi.structured_data || defi.preuves_url.length > 0;
                return (
                    <div
                        key={defi.id}
                        className={clsx(
                            'rounded-xl border px-4 py-3',
                            defi.status === 'complete' ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <span className={clsx(
                                'material-symbols-outlined text-xl shrink-0',
                                defi.status === 'complete' ? 'text-emerald-600' : 'text-amber-600'
                            )}>
                                {defi.status === 'complete' ? 'check_circle' : 'pending'}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900">{defi.description}</p>
                                <p className="text-[10px] text-slate-500">
                                    {defi.terrain_temps_reel && 'Temps réel · '}
                                    {defi.points} points
                                </p>
                            </div>
                            <span className={clsx(
                                'text-[10px] font-black px-2 py-1 rounded-full shrink-0',
                                defi.status === 'complete' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                            )}>
                                {defi.status === 'complete' ? 'Validé' : 'En cours'}
                            </span>
                        </div>

                        {hasDetail && (
                            <div className="mt-3 pt-3 border-t border-black/5 space-y-3">
                                <DefiStructuredSummary defiId={defi.id} structuredData={defi.structured_data} />
                                {defi.preuves_url.length > 0 && (
                                    <div className="flex gap-2 flex-wrap">
                                        {defi.preuves_url.map((url, i) => (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block size-16 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                                <img src={url} alt="" className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
