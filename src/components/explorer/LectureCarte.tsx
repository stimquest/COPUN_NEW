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
    const labelClass = 'text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#56706a]';
    const bodyClass = 'whitespace-pre-line text-[15px] leading-[1.65] text-[#405653]';
    const actions = fiche.actions ?? [];
    const action = actions[actionIndex];
    const aDesReperes = !!(fiche.tip || fiche.objectif || fiche.erreur_frequente);

    return (
        <div className="mt-5 space-y-7 text-[15px] leading-relaxed text-[#405653]" onPointerDown={event => {
            if ((event.target as HTMLElement).closest('button, a, summary')) event.stopPropagation();
        }}>
            <AccrochesCarousel fiche={fiche} />

            {fiche.explication && <section className="border-t border-[#193d3b1a] pt-6"><p className={labelClass}>Pour l’expliquer simplement</p><p className={`mt-2 ${bodyClass}`}>{fiche.explication}</p></section>}

            {fiche.a_observer && <section className="border-l-[3px] border-[#87b7b0] pl-4">
                <p className={labelClass}>À faire observer</p>
                <p className={`mt-2 ${bodyClass}`}>{fiche.a_observer}</p>
            </section>}

            {action && <section className="rounded-[1.35rem] bg-[#e8eee8] px-5 py-5 ring-1 ring-[#193d3b14]">
                <div className="flex items-baseline justify-between gap-3"><p className={labelClass}>À faire vivre avec le groupe</p>{actions.length > 1 && <span className="text-[11px] font-semibold tabular-nums text-[#6f817d]">{actionIndex + 1} / {actions.length}</span>}</div>
                <h4 className="mt-3 text-[17px] font-bold leading-snug text-[#173d3a]">{action.label}</h4>
                <p className={`mt-2 ${bodyClass}`}>{action.consigne}</p>
                {actions.length > 1 && <button type="button" className="mt-5 flex min-h-12 w-full items-center justify-between rounded-xl border border-[#193d3b38] bg-[#fffdf8] px-4 text-left text-[13px] font-bold text-[#173d3a] transition active:scale-[.98]"
                    onClick={() => setActionIndex(index => (index + 1) % actions.length)}>
                    Voir l’action suivante <span aria-hidden>→</span>
                </button>}
            </section>}

            {fiche.a_retenir && <section className="border-t border-[#193d3b1a] pt-6">
                <h4 className={labelClass}>L’idée à faire passer</h4>
                <p className="mt-2 text-[17px] font-semibold leading-[1.55] text-[#173d3a]">{fiche.a_retenir}</p>
            </section>}

            {/* Repères de fond : même contenu qu'avant, en retrait typographique pour ne pas
                peser autant que le déroulé de la séquence. */}
            {aDesReperes && <section className="space-y-5 border-t border-[#193d3b1a] pt-6 text-[13px] leading-[1.6] text-[#647773]">
                {fiche.erreur_frequente && <div><p className={labelClass}>Idée reçue fréquente</p><p className="mt-1.5 whitespace-pre-line">{fiche.erreur_frequente}</p></div>}
                {fiche.tip && <div><p className={labelClass}>Repère d’animation</p><p className="mt-1.5 whitespace-pre-line">{fiche.tip}</p></div>}
                {fiche.objectif && <div><p className={labelClass}>Intention pédagogique</p><p className="mt-1.5 whitespace-pre-line">{fiche.objectif}</p></div>}
            </section>}

            {!!fiche.ressources?.length && <section className="space-y-2 border-t border-[#193d3b1a] pt-6">
                <h4 className={labelClass}>Pour approfondir</h4>
                {fiche.ressources.map((resource, index) => resource.type === 'fiche_memo'
                    ? <Link key={index} href={`/ressources/${encodeURIComponent(resource.fiche_memo_id)}`} className="flex min-h-11 items-center justify-between rounded-xl border border-[#193d3b24] px-4 font-semibold text-[#173d3a]">{resource.label} <span>→</span></Link>
                    : /^https?:\/\//i.test(resource.url) && <a key={index} href={resource.url} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-between rounded-xl border border-[#193d3b24] px-4 font-semibold text-[#173d3a]">{resource.label} <span>↗</span></a>)}
            </section>}
        </div>
    );
}
