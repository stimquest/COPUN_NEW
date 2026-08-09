'use client';

import clsx from 'clsx';
import { PedagogicalContent } from '@/types';
import { PILLARS, THEMES_BY_PILLAR } from '@/data/etages';
import { niveauRepere } from '@/data/niveaux';

type Props = {
    pool: PedagogicalContent[];
    retenues: string[];
    onToggleFiche: (id: string) => void;
    onFicheInfo: (fiche: PedagogicalContent) => void;
};

const TOUS_LES_THEMES = Object.values(THEMES_BY_PILLAR).flat();

/**
 * Récapitulatif de la sélection en cours, groupé par pilier COP — l'arrivée par défaut
 * sur l'écran, y compris pour une semaine déjà préparée.
 *
 * Avant, revenir sur une semaine déjà préparée affichait tout de suite le catalogue par
 * phénomène (marées, vent…), avec les groupes déjà sélectionnés ouverts — ce qui montrait
 * en permanence l'organisation par sujet de terrain que la créatrice de la méthode ne
 * veut pas voir mise en avant. Cette vue ne montre que ce qui est déjà retenu, dans le
 * prisme COP ; l'organisation par phénomène ne redevient visible qu'en passant par
 * l'entonnoir « Par sujet de terrain ».
 */
export default function SelectionRecapCopun({ pool, retenues, onToggleFiche, onFicheInfo }: Props) {
    const fiches = retenues
        .map(id => pool.find(f => f.id === id))
        .filter((f): f is PedagogicalContent => !!f);

    const groupes = PILLARS.map(pillar => ({
        pillar,
        fiches: fiches.filter(f => f.dimension === pillar.id),
    })).filter(g => g.fiches.length > 0);

    if (groupes.length === 0) return null;

    return (
        <div className="space-y-6">
            {groupes.map(({ pillar, fiches }) => (
                <section key={pillar.id} className="space-y-2">
                    <div className="flex items-center gap-2 px-1 py-2">
                        <div className={clsx('size-7 rounded-lg flex items-center justify-center shrink-0', pillar.bg)}>
                            <span className="material-symbols-outlined text-white text-base">{pillar.icon}</span>
                        </div>
                        <p className={clsx('flex-1 text-sm font-black uppercase tracking-tight', pillar.color)}>{pillar.label}</p>
                        <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full">{fiches.length}</span>
                    </div>

                    <div className="space-y-1.5">
                        {fiches.map(fiche => {
                            const themesLabels = TOUS_LES_THEMES.filter(t =>
                                (fiche.tags_theme ?? []).map(String).includes(t.id),
                            );
                            return (
                                <div
                                    key={fiche.id}
                                    className="relative flex items-start gap-2 rounded-xl overflow-hidden transition-colors shadow-sm bg-indigo-50"
                                >
                                    <span className={clsx('absolute left-0 top-0 bottom-0 w-1', pillar.bg)} />

                                    <button
                                        onClick={() => onFicheInfo(fiche)}
                                        className="flex-1 min-w-0 text-left pl-4 py-3"
                                    >
                                        {themesLabels.length > 0 && (
                                            <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                                                {themesLabels.map(t => t.label).join(' · ')}
                                            </span>
                                        )}
                                        <span className="block text-[13px] font-bold text-slate-800 leading-snug">
                                            {fiche.question}
                                        </span>
                                        {niveauRepere(fiche.niveau) && (
                                            <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">
                                                {niveauRepere(fiche.niveau)}
                                            </span>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => onToggleFiche(fiche.id)}
                                        aria-label="Retirer"
                                        className="size-8 my-2.5 mr-2.5 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 bg-indigo-600 text-white"
                                    >
                                        <span className="material-symbols-outlined text-[17px]">check</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>
            ))}
        </div>
    );
}
