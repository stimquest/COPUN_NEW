'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { PedagogicalContent } from '@/types';
import { PILLARS } from '@/data/etages';
import { StagePreparation, toggleSujetRaconte } from '@/actions/preparation-actions';
import { actionSujetParId, ActionSujet } from '@/data/actions-sujets';
import { niveauRepere } from '@/data/niveaux';

type Props = {
    stageId: string;
    contents: PedagogicalContent[];
    preparations: Record<string, StagePreparation>;
    /** Lecture seule sur le bilan clôturé : plus de rature possible, l'historique est figé. */
    readOnly?: boolean;
};

function pilierDe(c: PedagogicalContent) {
    const d = (c.dimension ?? '').toUpperCase();
    const cle = d.startsWith('COMPR') ? 'COMPRENDRE' : d.startsWith('OBSERV') ? 'OBSERVER' : 'PROTÉGER';
    return PILLARS.find(p => p.id === cle);
}

/**
 * Le fil de ma semaine — le discours reconstitué, à relire avant de descendre sur l'eau.
 * Pas un tableau de bord de suivi, pas un index de titres : le texte que le moniteur a
 * réellement construit sur l'écran de préparation, en entier.
 *
 * Registre retenu : un article de blog. Seul le texte de fond (l'explication de la
 * fiche) est tronqué à trois lignes avec un « Lire tout » façon extrait WordPress —
 * l'accroche, le déroulé et la chute sont ce que le moniteur a construit lui-même et
 * restent toujours entièrement visibles, jamais réduits au clamp. Un sujet traité se
 * réduit à son seul titre barré : l'espace libéré sert aux sujets qui restent à traiter,
 * et le titre reste cliquable pour rouvrir l'article si besoin d'y revenir.
 *
 * Vocabulaire : « raconté » entrait en collision avec le vocabulaire de l'app pour l'acte
 * de parler au groupe. L'action de marquer un sujet vu s'appelle donc « traité » côté
 * affichage ; la donnée reste `raconte` en base et dans l'action serveur, déjà nommée
 * ainsi et migrée.
 */
export default function ProgrammeCondense({ stageId, contents, preparations, readOnly = false }: Props) {
    const [traites, setTraites] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(contents.map(c => [c.id, !!preparations[c.id]?.raconte])),
    );
    // Un article rouvert depuis son titre réduit (ex: pour vérifier son contenu) reste
    // affiché en entier même s'il est toujours marqué traité — sans quoi rouvrir puis
    // refermer sans y toucher le referait disparaître, ce qui n'a pas de sens pour une
    // simple relecture.
    const [ouverts, setOuverts] = useState<Record<string, boolean>>({});
    const [depliees, setDepliees] = useState<Record<string, boolean>>({});
    const [, startTransition] = useTransition();

    if (contents.length === 0) {
        return (
            <Link
                href={`/stages/${stageId}/program`}
                className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-4 py-4 hover:border-indigo-300 transition-colors"
            >
                <span className="material-symbols-outlined text-slate-300 text-2xl shrink-0">menu_book</span>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900">Rien à raconter pour l&apos;instant</p>
                    <p className="text-xs text-slate-400">Choisissez les sujets de la semaine</p>
                </div>
                <span className="material-symbols-outlined text-slate-300 shrink-0">chevron_right</span>
            </Link>
        );
    }

    const basculer = (contentId: string) => {
        if (readOnly) return;
        const suivant = !traites[contentId];
        setTraites(prev => ({ ...prev, [contentId]: suivant }));
        // Marquer traité referme l'article (retour à la ligne réduite) ; annuler le
        // laisse ouvert, sinon il resterait invisible-mais-présent, ni barré ni lisible.
        setOuverts(prev => ({ ...prev, [contentId]: !suivant }));
        startTransition(async () => {
            const r = await toggleSujetRaconte(stageId, contentId, suivant);
            if (!r.success) setTraites(prev => ({ ...prev, [contentId]: !suivant }));
        });
    };

    return (
        <div className="divide-y divide-slate-200">
            {contents.map(c => {
                const prep = preparations[c.id];
                const pilier = pilierDe(c);
                const raye = traites[c.id];
                const reduit = raye && !ouverts[c.id];
                const depliee = depliees[c.id];
                const chute = prep?.chute ?? c.a_retenir;
                const actions = (prep?.actions ?? [])
                    .map(id => actionSujetParId(id, c.actions))
                    .filter((a): a is ActionSujet => !!a);

                // Un article réduit ne montre que son titre, barré et cliquable — c'est
                // ce qui libère l'espace au fil de la semaine sans perdre le contenu.
                if (reduit) {
                    return (
                        <button
                            key={c.id}
                            onClick={() => setOuverts(prev => ({ ...prev, [c.id]: true }))}
                            className="w-full text-left py-3 flex items-baseline gap-2"
                        >
                            <span className={clsx('text-[10.5px] font-bold uppercase tracking-widest shrink-0', pilier?.color, 'opacity-50')}>
                                {pilier?.label}
                            </span>
                            {niveauRepere(c.niveau) && (
                                <span className="text-[10.5px] font-semibold text-slate-300 shrink-0">
                                    · {niveauRepere(c.niveau)}
                                </span>
                            )}
                            <span className="text-[14px] font-semibold text-slate-400 line-through decoration-1 truncate">
                                {c.question}
                            </span>
                        </button>
                    );
                }

                return (
                    <article key={c.id} className="py-6">
                        <div className="flex items-baseline gap-1.5">
                            <span className={clsx('text-[10.5px] font-bold uppercase tracking-widest', pilier?.color)}>
                                {pilier?.label}
                            </span>
                            {niveauRepere(c.niveau) && (
                                <span className="text-[10.5px] font-semibold text-slate-400">
                                    · {niveauRepere(c.niveau)}
                                </span>
                            )}
                        </div>
                        <h3 className={clsx(
                            'text-[16px] font-bold text-slate-900 leading-snug mt-0.5',
                            raye && 'line-through decoration-1',
                        )}>
                            {c.question}
                        </h3>

                        {/* Le clamp ne porte que sur le texte de fond de la fiche — l'accroche,
                            le déroulé et la chute sont ce que le moniteur a construit lui-même
                            et doivent rester entièrement visibles, jamais tronqués. */}
                        {c.explication && (
                            <p className={clsx(
                                'text-[13.5px] leading-relaxed text-slate-500 mt-2',
                                !depliee && 'line-clamp-3',
                            )}>
                                {c.explication}
                            </p>
                        )}

                        {c.explication && (
                            <button
                                onClick={() => setDepliees(prev => ({ ...prev, [c.id]: !prev[c.id] }))}
                                className="text-[11px] font-bold uppercase tracking-wide text-indigo-500 hover:text-indigo-700 transition-colors mt-1"
                            >
                                {depliee ? 'Réduire' : 'Lire tout'}
                            </button>
                        )}

                        {prep?.accroche_choisie && (
                            <p className="text-[15px] leading-relaxed italic mt-3 pl-3 border-l-2 border-amber-300 text-slate-800">
                                «&nbsp;{prep.accroche_choisie}&nbsp;»
                            </p>
                        )}

                        {actions.length > 0 && (
                            <div className="mt-3">
                                <span className="text-[13px] font-semibold text-slate-500">
                                    Vous leur faites faire
                                </span>
                                <ul className="mt-1 space-y-1.5">
                                    {actions.map(a => (
                                        <li key={a.id} className="text-[13.5px] leading-relaxed text-slate-600 pl-3.5 relative">
                                            <span className="absolute left-0 top-[0.6em] size-1 rounded-full bg-current opacity-50" />
                                            {a.consigne}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {chute && (
                            <p className="text-[13.5px] leading-relaxed mt-3 text-slate-600">
                                <span className="font-semibold text-slate-500">Ils repartent avec </span>
                                {chute}
                            </p>
                        )}

                        {!prep?.accroche_choisie && (
                            <p className="text-[13px] text-amber-600 font-semibold mt-3">
                                Pas encore préparé
                            </p>
                        )}

                        {!readOnly && (
                            <button
                                onClick={() => basculer(c.id)}
                                className="block text-[11px] font-bold uppercase tracking-wide text-slate-300 hover:text-slate-500 transition-colors mt-3"
                            >
                                {raye ? 'Marquer comme non traité' : 'Marquer comme traité'}
                            </button>
                        )}
                    </article>
                );
            })}

            <Link
                href={`/stages/${stageId}/preparer`}
                className="flex items-center justify-center gap-2 py-3.5 text-[13px] font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
                Revoir mon programme
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
        </div>
    );
}
