'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { PedagogicalContent } from '@/types';
import AccrochesCarousel from './AccrochesCarousel';

/**
 * Lecture d'une seule face : la carte se parcourt par le scroll vertical de la page,
 * comme n'importe quel contenu long sur mobile.
 *
 * Le recto-verso a été retiré. Il servait à éviter le scroll, mais la carte de découverte
 * dépasse déjà volontairement le viewport (`min-h-[680px]` côté pile) : le flip ne
 * supprimait donc pas le scroll, il coupait en deux un contenu qui défile de toute façon.
 * Il coûtait en revanche cher — deux gestes concurrents sur le même objet (le swipe change
 * de fiche, le flip changeait de face), l'action et l'accroche jamais visibles ensemble
 * alors que c'est la situation réelle d'animation, et la moitié de chaque fiche masquée
 * derrière un bouton situé en bas d'une carte qu'il fallait dérouler pour le découvrir.
 *
 * L'ordre suit le déroulé d'une séquence sur le terrain : j'ouvre, j'explique, je fais
 * observer, je fais vivre, je fais retenir. Les repères d'animation (`tip`, `objectif`)
 * et l'idée reçue ferment la carte en retrait typographique : on les consulte quand on
 * les cherche, ils ne coupent pas le déroulé.
 */
export default function LectureCarte({ fiche }: { fiche: PedagogicalContent }) {
    const [actionIndex, setActionIndex] = useState(0);
    const labelClass = 'text-xs font-semibold tracking-wide text-slate-500';
    const bodyClass = 'whitespace-pre-line text-base leading-[1.65] text-slate-700';
    const actions = fiche.actions ?? [];
    const action = actions[actionIndex];
    const aDesReperes = !!(fiche.tip || fiche.objectif || fiche.erreur_frequente);

    return (
        <div className="mt-5 space-y-5 text-[15px] leading-relaxed text-slate-700" onPointerDown={event => {
            if ((event.target as HTMLElement).closest('button, a, summary')) event.stopPropagation();
        }}>
            <AccrochesCarousel fiche={fiche} />

            {fiche.explication && <p className={bodyClass}>{fiche.explication}</p>}

            {fiche.a_observer && <div className="rounded-2xl bg-sky-50 px-5 py-4">
                <p className={labelClass}>À faire observer</p>
                <p className={`mt-1 ${bodyClass}`}>{fiche.a_observer}</p>
            </div>}

            {action && <section className="border-t border-slate-100 pt-5">
                <p className={labelClass}>À faire vivre</p>
                <h4 className="mt-2 text-base font-semibold text-slate-900">{action.label}</h4>
                <p className={`mt-1 ${bodyClass}`}>{action.consigne}</p>
                {actions.length > 1 && <button type="button" className="mt-1 min-h-11 text-sm font-bold text-indigo-600"
                    onClick={() => setActionIndex(index => (index + 1) % actions.length)}>
                    Autre proposition → <span className="font-normal text-slate-500">({actionIndex + 1}/{actions.length})</span>
                </button>}
            </section>}

            {fiche.a_retenir && <section className="border-l-2 border-emerald-400 pl-4">
                <h4 className={labelClass}>L’idée à faire passer</h4>
                <p className={`mt-1 ${bodyClass}`}>{fiche.a_retenir}</p>
            </section>}

            {/* Repères de fond : même contenu qu'avant, en retrait typographique pour ne pas
                peser autant que le déroulé de la séquence. */}
            {aDesReperes && <section className="space-y-3 border-t border-slate-100 pt-5 text-sm leading-relaxed text-slate-500">
                {fiche.erreur_frequente && <p>
                    <span className="font-semibold text-slate-600">Ils croient souvent que </span>
                    <span className="whitespace-pre-line">{fiche.erreur_frequente}</span>
                </p>}
                {fiche.tip && <p className="whitespace-pre-line">{fiche.tip}</p>}
                {fiche.objectif && <p>
                    <span className="font-semibold text-slate-600">Intention pédagogique — </span>
                    <span className="whitespace-pre-line">{fiche.objectif}</span>
                </p>}
            </section>}

            {!!fiche.ressources?.length && <section className="space-y-2 border-t border-slate-100 pt-5">
                <h4 className={labelClass}>Pour approfondir</h4>
                {fiche.ressources.map((resource, index) => resource.type === 'fiche_memo'
                    ? <Link key={index} href={`/ressources/${encodeURIComponent(resource.fiche_memo_id)}`} className="block py-2 font-semibold text-indigo-600 underline underline-offset-4">{resource.label} →</Link>
                    : /^https?:\/\//i.test(resource.url) && <a key={index} href={resource.url} target="_blank" rel="noopener noreferrer" className="block py-2 font-semibold text-indigo-600 underline underline-offset-4">{resource.label} ↗</a>)}
            </section>}
        </div>
    );
}
