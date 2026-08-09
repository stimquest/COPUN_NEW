'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { Reorder, useDragControls } from 'framer-motion';
import { PedagogicalContent } from '@/types';
import { PILLARS } from '@/data/etages';
import { niveauRepere } from '@/data/niveaux';

type Props = {
    contents: PedagogicalContent[];
    /** Appelé avec le nouvel ordre des identifiants, à persister côté appelant. */
    onReordonner: (ids: string[]) => void;
    /** Repli du bloc — utile là où l'ordre n'est pas l'objet principal de l'écran. */
    repliable?: boolean;
};

function pilierDe(c: PedagogicalContent) {
    const d = (c.dimension ?? '').toUpperCase();
    const cle = d.startsWith('COMPR') ? 'COMPRENDRE' : d.startsWith('OBSERV') ? 'OBSERVER' : 'PROTÉGER';
    return PILLARS.find(p => p.id === cle);
}

/**
 * L'ordre de traitement des sujets de la semaine, réorganisable au glisser-déposer.
 *
 * L'ordre porte du sens : enchaîner les méduses puis le vent parce que les méduses
 * dérivent avec lui est une intention pédagogique, pas un hasard de sélection. Il doit
 * donc être décidé par le moniteur, et non hérité de l'ordre où il a coché les fiches —
 * ni, pire, de l'ordre des identifiants en base.
 *
 * Le glisser est déclenché depuis la poignée seule (`useDragControls`) et non depuis
 * toute la carte : sur téléphone, une carte entièrement draggable capture le geste de
 * défilement et rend la liste impossible à parcourir. `touch-none` sur la poignée
 * neutralise le scroll natif une fois le doigt dessus.
 *
 * Composant partagé entre l'écran de sélection et l'écran de préparation, pour que le
 * geste soit identique aux deux endroits.
 */
export default function OrdreSujets({ contents, onReordonner, repliable = false }: Props) {
    const [ouvert, setOuvert] = useState(!repliable);

    if (contents.length < 2) return null;

    return (
        <section>
            {repliable ? (
                <button
                    onClick={() => setOuvert(o => !o)}
                    aria-expanded={ouvert}
                    className="w-full flex items-center justify-between gap-3 text-left"
                >
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Mes sujets, dans l&apos;ordre
                    </h3>
                    <span className="material-symbols-outlined text-[20px] text-slate-300 shrink-0">
                        {ouvert ? 'expand_less' : 'expand_more'}
                    </span>
                </button>
            ) : (
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Dans quel ordre&nbsp;?
                </h3>
            )}

            {ouvert && (
                <Reorder.Group
                    axis="y"
                    values={contents.map(c => c.id)}
                    onReorder={onReordonner}
                    className="mt-3 space-y-2"
                >
                    {contents.map((c, i) => (
                        <Ligne key={c.id} content={c} rang={i + 1} />
                    ))}
                </Reorder.Group>
            )}
        </section>
    );
}

function Ligne({ content, rang }: { content: PedagogicalContent; rang: number }) {
    const controls = useDragControls();
    const [saisi, setSaisi] = useState(false);
    const pilier = pilierDe(content);

    return (
        <Reorder.Item
            value={content.id}
            dragListener={false}
            dragControls={controls}
            onDragStart={() => setSaisi(true)}
            onDragEnd={() => setSaisi(false)}
            className={clsx(
                'flex items-center gap-2 rounded-2xl bg-white border pl-3 pr-1 py-3 transition-shadow',
                saisi ? 'border-indigo-300 shadow-lg shadow-indigo-500/10' : 'border-slate-200/80',
            )}
        >
            <span className="text-[13px] font-black text-slate-300 tabular-nums shrink-0 w-4">
                {rang}
            </span>

            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                    <span className={clsx(
                        'text-[9px] font-black uppercase tracking-widest',
                        pilier?.color ?? 'text-slate-400',
                    )}>
                        {pilier?.label}
                    </span>
                    {niveauRepere(content.niveau) && (
                        <span className="text-[9px] font-semibold text-slate-300">
                            · {niveauRepere(content.niveau)}
                        </span>
                    )}
                </div>
                <p className="text-[14px] font-bold text-slate-800 leading-snug truncate">
                    {content.question}
                </p>
            </div>

            <span
                onPointerDown={e => controls.start(e)}
                aria-label={`Déplacer : ${content.question}`}
                className="size-10 flex items-center justify-center text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing touch-none shrink-0 transition-colors"
            >
                <span className="material-symbols-outlined text-[20px]">drag_indicator</span>
            </span>
        </Reorder.Item>
    );
}
