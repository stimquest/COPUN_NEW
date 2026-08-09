'use client';

import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { PedagogicalContent, Dimension } from '@/types';
import { Groupe } from '@/data/groupes';
import { PILLARS, THEMES_BY_PILLAR } from '@/data/etages';
import { niveauRepere } from '@/data/niveaux';

type Props = {
    groupe: Groupe;
    fiches: PedagogicalContent[];
    retenues: string[];
    ouvert: boolean;
    onToggleOuvert: () => void;
    onToggleFiche: (id: string) => void;
    onVoirFiche: (f: PedagogicalContent) => void;
};

// Ordre d'affichage seulement. COP n'impose aucune séquence : selon le moniteur et la
// situation, on peut partir de l'observation pour aller vers la compréhension, ou
// commencer par un geste de protection avant de l'expliquer. L'ordre du déroulé
// appartient au moniteur, pas à l'écran.
const ORDRE_AFFICHAGE: Dimension[] = ['COMPRENDRE', 'OBSERVER', 'PROTÉGER'];

// Tous les thèmes du référentiel, tous piliers confondus — sert à retrouver le libellé
// d'un tags_theme même quand il n'appartient pas au pilier de la fiche qui le porte (les
// données croisent parfois les deux, ex. une fiche COMPRENDRE taguée « repères
// spatio-temporels », qui est un thème OBSERVER).
const TOUS_LES_THEMES = Object.values(THEMES_BY_PILLAR).flat();

/**
 * Un phénomène et ses trois entrées COP.
 *
 * Le catalogue s'affichait à plat : 128 questions d'affilée, impossibles à situer. Ici
 * chaque phénomène est une unité, et les trois dimensions apparaissent à l'intérieur —
 * le moniteur voit d'un coup d'œil ce que le sujet permet de couvrir, et compose
 * librement (deux « comprendre » et un « observer », ou l'inverse).
 */
export default function GroupeBloc({
    groupe, fiches, retenues, ouvert, onToggleOuvert, onToggleFiche, onVoirFiche,
}: Props) {
    const nbRetenues = fiches.filter(f => retenues.includes(f.id)).length;

    const parDimension = ORDRE_AFFICHAGE.map(dim => ({
        pilier: PILLARS.find(p => p.id === dim)!,
        items: fiches.filter(f => {
            const d = (f.dimension ?? '').toUpperCase();
            const cle = d.startsWith('COMPR') ? 'COMPRENDRE' : d.startsWith('OBSERV') ? 'OBSERVER' : 'PROTÉGER';
            return cle === dim;
        }),
    })).filter(g => g.items.length > 0);

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
                onClick={onToggleOuvert}
                className="w-full flex items-center gap-3 px-4 py-4 text-left active:bg-slate-50 transition-colors"
            >
                <span className="size-10 rounded-xl bg-[#EBF0F7] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px] text-slate-500">{groupe.icon}</span>
                </span>

                <span className="flex-1 min-w-0">
                    <span className="block text-[15px] font-black text-slate-900 leading-tight">{groupe.label}</span>
                    <span className="block text-xs text-slate-400 mt-0.5">{groupe.accroche}</span>
                </span>

                {nbRetenues > 0 && (
                    <span className="size-6 rounded-full bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                        {nbRetenues}
                    </span>
                )}
                <span className="text-xs font-bold text-slate-300 tabular-nums shrink-0">{fiches.length}</span>
                <span className={clsx(
                    'material-symbols-outlined text-slate-300 text-xl shrink-0 transition-transform duration-200',
                    ouvert && 'rotate-180',
                )}>
                    expand_more
                </span>
            </button>

            <AnimatePresence initial={false}>
                {ouvert && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-4">
                            {parDimension.map(({ pilier, items }) => (
                                <div key={pilier.id}>
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <span className={clsx('material-symbols-outlined text-[13px]', pilier.color)}>
                                            {pilier.icon}
                                        </span>
                                        <p className={clsx('text-[10px] font-black uppercase tracking-[0.15em]', pilier.color)}>
                                            {pilier.label}
                                        </p>
                                    </div>

                                    <div className="space-y-1.5">
                                        {items.map(f => {
                                            const prise = retenues.includes(f.id);
                                            // Tous les thèmes de la fiche, pas seulement ceux du pilier
                                            // affiché ici — les données croisent parfois pilier et thème
                                            // d'un autre pilier (voir TOUS_LES_THEMES).
                                            const themesFiche = TOUS_LES_THEMES.filter(t =>
                                                (f.tags_theme ?? []).map(String).includes(t.id),
                                            );
                                            return (
                                                <div
                                                    key={f.id}
                                                    className={clsx(
                                                        'relative flex items-start gap-2 rounded-xl overflow-hidden transition-colors shadow-sm',
                                                        prise ? 'bg-indigo-50' : 'bg-white',
                                                    )}
                                                >
                                                    <span className={clsx('absolute left-0 top-0 bottom-0 w-1', pilier.bg)} />

                                                    <button
                                                        onClick={() => onVoirFiche(f)}
                                                        className="flex-1 min-w-0 text-left pl-4 py-3"
                                                    >
                                                        {themesFiche.length > 0 && (
                                                            <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                                                                {themesFiche.map(t => t.label).join(' · ')}
                                                            </span>
                                                        )}
                                                        <span className="block text-[13px] font-bold text-slate-800 leading-snug">
                                                            {f.question}
                                                        </span>
                                                        {niveauRepere(f.niveau) && (
                                                            <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">
                                                                {niveauRepere(f.niveau)}
                                                            </span>
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={() => onToggleFiche(f.id)}
                                                        aria-label={prise ? 'Retirer' : 'Retenir'}
                                                        className={clsx(
                                                            'size-8 my-2.5 mr-2.5 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90',
                                                            prise
                                                                ? 'bg-indigo-600 text-white'
                                                                : 'bg-white text-slate-400 shadow-sm',
                                                        )}
                                                    >
                                                        <span className="material-symbols-outlined text-[17px]">
                                                            {prise ? 'check' : 'add'}
                                                        </span>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
