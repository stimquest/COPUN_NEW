'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { MILIEUX, GROUPES } from '@/data/groupes';
import { PILLARS } from '@/data/etages';
import { niveauRepere } from '@/data/niveaux';
import { PedagogicalContent } from '@/types';

type Props = {
    pool: PedagogicalContent[];
    retenues: string[];
    onToggleFiche: (id: string) => void;
    onFicheInfo?: (fiche: PedagogicalContent) => void;
};

const pilierDe = (f: PedagogicalContent) => {
    const d = (f.dimension ?? '').toUpperCase();
    const cle = d.startsWith('COMPR') ? 'COMPRENDRE' : d.startsWith('OBSERV') ? 'OBSERVER' : 'PROTÉGER';
    return PILLARS.find(p => p.id === cle);
};

/**
 * L'entrée par centre d'intérêt — un complément au choix par paliers, pas un remplacement.
 *
 * Les deux chemins ne posent pas la même question. Le choix par paliers part de l'intention
 * pédagogique (« qu'est-ce que je veux leur faire comprendre »). Celui-ci part de l'objet
 * lui-même — les méduses, le brouillard, la laisse de mer : le moniteur sait de quoi il veut
 * parler, pas sous quel angle le ranger.
 *
 * D'où l'ordre inverse : le phénomène d'abord, l'angle COP découvert ensuite, en lisant les
 * questions. Les quatorze sujets tiennent en une grille, sans entonnoir à traverser — la
 * version précédente demandait trois étapes (milieu → groupe → angle) pour arriver ici.
 */
export default function ParSujetTerrain({ pool, retenues, onToggleFiche, onFicheInfo }: Props) {
    const [ouvert, setOuvert] = useState<string | null>(null);
    const [recherche, setRecherche] = useState('');

    const parGroupe = useMemo(() => {
        const map = new Map<string, PedagogicalContent[]>();
        GROUPES.forEach(g => {
            const ids = new Set(g.fiches.map(String));
            map.set(g.id, pool.filter(f => ids.has(f.id)));
        });
        return map;
    }, [pool]);

    // La recherche traverse les groupes : taper « méduse » doit trouver la question où
    // qu'elle soit rangée, sans avoir à deviner son milieu de rattachement.
    const resultats = useMemo(() => {
        const q = recherche.trim().toLowerCase();
        if (!q) return null;
        return GROUPES
            .map(groupe => ({
                groupe,
                fiches: (parGroupe.get(groupe.id) ?? []).filter(f =>
                    `${f.question} ${f.objectif ?? ''} ${(f.tags_filtre ?? []).join(' ')}`
                        .toLowerCase().includes(q),
                ),
            }))
            .filter(r => r.fiches.length > 0);
    }, [recherche, parGroupe]);

    return (
        <section className="space-y-3">
            <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-[19px]">
                    search
                </span>
                <input
                    value={recherche}
                    onChange={e => setRecherche(e.target.value)}
                    placeholder="Méduses, brouillard, laisse de mer…"
                    className="w-full h-11 pl-10 pr-9 rounded-xl bg-white text-sm font-medium text-slate-800 placeholder:text-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                />
                {recherche && (
                    <button
                        onClick={() => setRecherche('')}
                        aria-label="Effacer"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 active:scale-90 transition"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                )}
            </div>

            {resultats ? (
                resultats.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        <span className="material-symbols-outlined text-3xl">search_off</span>
                        <p className="text-[12px] font-bold mt-1.5">Rien ne correspond à « {recherche} »</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {resultats.map(({ groupe, fiches }) => (
                            <div key={groupe.id} className="space-y-1.5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                                    {groupe.label}
                                </p>
                                {fiches.map(f => (
                                    <CarteQuestion
                                        key={f.id}
                                        fiche={f}
                                        retenue={retenues.includes(f.id)}
                                        onToggle={() => onToggleFiche(f.id)}
                                        onInfo={() => onFicheInfo?.(f)}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                )
            ) : (
                MILIEUX.map(milieu => {
                    const groupes = GROUPES.filter(g => g.milieu === milieu.id);
                    if (groupes.length === 0) return null;

                    return (
                        <div key={milieu.id} className="space-y-1">
                            <div className="flex items-center gap-1.5 px-1">
                                <span className="material-symbols-outlined text-[15px] text-slate-400">
                                    {milieu.icon}
                                </span>
                                <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                                    {milieu.label}
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                {groupes.map(groupe => {
                                    const fiches = parGroupe.get(groupe.id) ?? [];
                                    if (fiches.length === 0) return null;
                                    const deplie = ouvert === groupe.id;
                                    const nbRetenues = fiches.filter(f => retenues.includes(f.id)).length;

                                    return (
                                        <div key={groupe.id} className="rounded-xl bg-white shadow-sm overflow-hidden">
                                            <button
                                                onClick={() => setOuvert(deplie ? null : groupe.id)}
                                                aria-expanded={deplie}
                                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
                                            >
                                                <span className="material-symbols-outlined text-[19px] text-slate-400 shrink-0">
                                                    {groupe.icon}
                                                </span>
                                                <span className="flex-1 min-w-0">
                                                    <span className="block text-[13px] font-black text-slate-800 leading-tight">
                                                        {groupe.label}
                                                    </span>
                                                    <span className="block text-[10.5px] font-medium text-slate-400 leading-tight mt-0.5 truncate">
                                                        {groupe.accroche}
                                                    </span>
                                                </span>
                                                {nbRetenues > 0 && (
                                                    <span className="text-[9.5px] font-black text-white bg-indigo-600 rounded-full px-1.5 py-0.5 shrink-0">
                                                        {nbRetenues}
                                                    </span>
                                                )}
                                                <span className="text-[10px] font-bold text-slate-300 tabular-nums shrink-0">
                                                    {fiches.length}
                                                </span>
                                                <span className={clsx(
                                                    'material-symbols-outlined text-[18px] text-slate-300 shrink-0 transition-transform',
                                                    deplie && 'rotate-180',
                                                )}>
                                                    expand_more
                                                </span>
                                            </button>

                                            <AnimatePresence initial={false}>
                                                {deplie && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="px-2 pb-2 space-y-1.5">
                                                            {fiches.map(f => (
                                                                <CarteQuestion
                                                                    key={f.id}
                                                                    fiche={f}
                                                                    retenue={retenues.includes(f.id)}
                                                                    onToggle={() => onToggleFiche(f.id)}
                                                                    onInfo={() => onFicheInfo?.(f)}
                                                                />
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })
            )}
        </section>
    );
}

/**
 * Une question, dans le même habit que sur le chemin par sujet : liseré de la couleur du
 * pilier, titre, repère de niveau. C'est ici que l'angle COP se découvre — il n'a pas été
 * demandé en amont, il se lit sur la question.
 */
function CarteQuestion({
    fiche, retenue, onToggle, onInfo,
}: {
    fiche: PedagogicalContent;
    retenue: boolean;
    onToggle: () => void;
    onInfo: () => void;
}) {
    const pilier = pilierDe(fiche);

    return (
        <div className={clsx(
            'relative flex items-start gap-2 rounded-xl overflow-hidden transition-colors',
            retenue ? 'bg-indigo-50' : 'bg-[#F6F8FC]',
        )}>
            <span className={clsx('absolute left-0 top-0 bottom-0 w-1', pilier?.bg)} />

            <button onClick={onInfo} className="flex-1 min-w-0 text-left pl-4 py-2.5">
                <span className={clsx('block text-[9px] font-black uppercase tracking-widest', pilier?.color)}>
                    {pilier?.label}
                </span>
                <span className="block text-[12.5px] font-bold text-slate-800 leading-snug mt-0.5">
                    {fiche.question}
                </span>
                {niveauRepere(fiche.niveau) && (
                    <span className="block text-[9.5px] font-semibold text-slate-400 mt-0.5">
                        {niveauRepere(fiche.niveau)}
                    </span>
                )}
            </button>

            <button
                onClick={onToggle}
                aria-label={retenue ? 'Retirer' : 'Retenir'}
                className={clsx(
                    'size-7 my-2 mr-2 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90',
                    retenue ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 shadow-sm',
                )}
            >
                <span className="material-symbols-outlined text-[16px]">
                    {retenue ? 'check' : 'add'}
                </span>
            </button>
        </div>
    );
}
