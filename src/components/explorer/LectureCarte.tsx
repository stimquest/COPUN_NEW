'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import type { PedagogicalContent } from '@/types';

/** Lecture recto-verso ; tout le contenu reste accessible, sans scroll interne. */
export default function LectureCarte({ fiche, accroche }: { fiche: PedagogicalContent; accroche: string }) {
    const [verso, setVerso] = useState(false);
    const [actionIndex, setActionIndex] = useState(0);
    const reducedMotion = useReducedMotion();
    const hasComplements = !!(fiche.actions?.length || fiche.erreur_frequente || fiche.tip || fiche.objectif || fiche.ressources?.length);
    const labelClass = 'text-xs font-semibold tracking-wide text-slate-500';
    const bodyClass = 'whitespace-pre-line text-base leading-[1.65] text-slate-700';
    return (
        <div className="mt-5 text-[15px] leading-relaxed text-slate-700" onPointerDown={event => {
            if ((event.target as HTMLElement).closest('button, a, summary')) event.stopPropagation();
        }}>
            <div style={{ perspective: 1200 }}>
            <AnimatePresence mode="wait" initial={false}>
            <motion.div key={verso ? 'verso' : 'recto'} className="space-y-5" aria-label={verso ? 'Prolonger l’échange' : 'Comment en parler'}
                initial={{ rotateY: reducedMotion ? 0 : -90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: reducedMotion ? 0 : 90, opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.18 }} style={{ backfaceVisibility: 'hidden' }}>
            {!verso && <>
                <div>
                    <p className={labelClass}>J’ouvre avec</p>
                    <p className="mt-2 text-[19px] font-semibold leading-snug text-slate-900">« {accroche} »</p>
                </div>
                {fiche.explication && <p className={bodyClass}>{fiche.explication}</p>}
                {fiche.a_observer && <div className="rounded-2xl bg-sky-50 px-5 py-4">
                    <p className={labelClass}>À faire observer</p>
                    <p className={`mt-1 ${bodyClass}`}>{fiche.a_observer}</p>
                </div>}
                {fiche.a_retenir && <section className="border-l-2 border-emerald-400 pl-4">
                    <h4 className={labelClass}>L’idée à faire passer</h4>
                    <p className={`mt-1 ${bodyClass}`}>{fiche.a_retenir}</p>
                </section>}
            </>}
            {verso && <>
            <section className="space-y-4">
                {fiche.erreur_frequente && <details>
                    <summary className={`${labelClass} cursor-pointer py-2`}>Un repère pour la discussion</summary>
                    <p className={labelClass}>Ils croient souvent que</p>
                    <p className={`mt-1 ${bodyClass}`}>{fiche.erreur_frequente}</p>
                </details>}
                {!!fiche.actions?.length && <div className="space-y-4 border-t border-slate-100 pt-5">
                    <p className={labelClass}>À faire vivre</p>
                    {fiche.actions.slice(actionIndex, actionIndex + 1).map(action => <div key={action.id}>
                        <h5 className="mt-2 text-base font-semibold text-slate-900">{action.label}</h5>
                        <p className={`mt-1 ${bodyClass}`}>{action.consigne}</p>
                    </div>)}
                    {fiche.actions.length > 1 && <button type="button" className="min-h-11 text-sm font-bold text-indigo-600" onClick={() => setActionIndex(index => (index + 1) % fiche.actions!.length)}>
                        Autre proposition → <span className="font-normal text-slate-500">({actionIndex + 1}/{fiche.actions.length})</span>
                    </button>}
                </div>}
                {(fiche.tip || fiche.objectif) && <details className="border-t border-slate-100 pt-3">
                    <summary className={`${labelClass} cursor-pointer py-2`}>Repères pour l’animation</summary>
                    <div className="mt-3 space-y-4">
                        {fiche.tip && <p className={`border-l-2 border-slate-200 pl-4 ${bodyClass}`}>{fiche.tip}</p>}
                        {fiche.objectif && <p className={bodyClass}><span className="font-semibold">Intention pédagogique — </span>{fiche.objectif}</p>}
                    </div>
                </details>}
            </section>
            </>}
            {verso && !!fiche.ressources?.length && <section className="space-y-2">
                <h4 className={labelClass}>Pour approfondir</h4>
                {fiche.ressources.map((resource, index) => resource.type === 'fiche_memo'
                    ? <Link key={index} href={`/ressources/${encodeURIComponent(resource.fiche_memo_id)}`} className="block py-2 font-semibold text-indigo-600 underline underline-offset-4">{resource.label} →</Link>
                    : /^https?:\/\//i.test(resource.url) && <a key={index} href={resource.url} target="_blank" rel="noopener noreferrer" className="block py-2 font-semibold text-indigo-600 underline underline-offset-4">{resource.label} ↗</a>)}
            </section>}
            </motion.div>
            </AnimatePresence>
            </div>
            {hasComplements && <button type="button" onClick={() => setVerso(value => !value)} className="mt-6 min-h-12 w-full rounded-2xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-600">
                {verso ? '↶ Revenir à la carte' : 'Prolonger l’échange ↷'}
            </button>}
        </div>
    );
}
