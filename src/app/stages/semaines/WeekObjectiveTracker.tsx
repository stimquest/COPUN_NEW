'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { saveObjectiveStatus } from '@/actions/stage-actions';
import type { StageObjectiveExecutionStatus } from '@/types';

type Objective = {
    id: string;
    question: string;
    objectif: string;
    accroche?: string;
    retenir?: string;
    action?: string | null;
    initialStatus: StageObjectiveExecutionStatus;
};

/**
 * Où en est le moniteur sur chaque sujet de sa semaine — son point de vue, pas celui du
 * groupe.
 *
 * Deux choses sont suivies dans l'application, et elles ne viennent pas de la même source :
 *
 *   - avoir abordé un sujet ne se constate que par le moniteur. C'est ce tableau : un
 *     repère personnel, qu'il tient pour lui et complète au bilan.
 *   - avoir mené l'action avec le groupe ne se déclare pas : ce sont les enfants qui la
 *     confirment au quiz de fin, et seule la caméra en fait foi. Un bouton ici ne pourrait
 *     produire qu'une déclaration du moniteur sur lui-même — rien d'opposable au club.
 *
 * D'où trois états et non un : aborder un sujet est graduel. On l'a effleuré en passant,
 * ou on a pris le temps de le traiter — et cette nuance est justement ce que le moniteur
 * veut retrouver en préparant la semaine suivante.
 */
const ETATS: { valeur: StageObjectiveExecutionStatus; libelle: string }[] = [
    { valeur: 'not_done', libelle: 'Pas encore' },
    { valeur: 'partial', libelle: 'Effleuré' },
    { valeur: 'done', libelle: 'Abordé' },
];

function ObjectiveRow({ stageId, objective, index }: { stageId: string; objective: Objective; index: number }) {
    const [status, setStatus] = useState(objective.initialStatus);
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    const choisir = (next: StageObjectiveExecutionStatus) => {
        const previous = status;
        setStatus(next);
        setError(null);
        startTransition(async () => {
            const result = await saveObjectiveStatus(stageId, objective.id, next);
            if (!result.success) {
                setStatus(previous);
                setError('État non enregistré. Réessayez.');
            }
        });
    };

    return <article className="co-week-objective">
        <span className="co-week-objective-number">{String(index + 1).padStart(2, '0')}</span>
        <div className="co-week-objective-body">
            <h3>{objective.question}</h3>
            {objective.accroche && <p className="co-week-objective-action"><strong>Je lance le sujet</strong>« {objective.accroche} »</p>}
            {objective.action && <p className="co-week-objective-action"><strong>Avec le groupe</strong>{objective.action}</p>}
            {objective.retenir && <p className="co-week-objective-action"><strong>L’idée à retenir</strong>{objective.retenir}</p>}
            <div className="co-week-objective-status" aria-label="Où j’en suis sur ce sujet">
                {ETATS.map(etat => (
                    <button key={etat.valeur} type="button" aria-pressed={status === etat.valeur} disabled={pending}
                        onClick={() => choisir(etat.valeur)}>
                        {etat.libelle}
                    </button>
                ))}
            </div>
            {error && <p className="co-week-objective-error" role="alert">{error}</p>}
        </div>
    </article>;
}

/**
 * Une entrée supplémentaire, au même rang que les sujets de la semaine.
 *
 * Le quiz d'animation est une chose de plus à faire vivre avec le groupe, pas un réglage
 * annexe : en lien de bas de page il se lisait comme une option de service, alors que c'est
 * un outil que le moniteur peut sortir aussi souvent que ses cartes. Il n'a pas d'états à
 * cocher — il ne valide rien, et rien ne s'y suit.
 */
export type EntreeLibre = { href: string; titre: string; detail: string };

export function WeekObjectiveTracker({ stageId, objectives, extra }: {
    stageId: string;
    objectives: Objective[];
    extra?: EntreeLibre;
}) {
    return <div className="co-week-objectives">
        {objectives.map((objective, index) => <ObjectiveRow key={objective.id} stageId={stageId} objective={objective} index={index}/>)}
        {extra && <Link href={extra.href} className="co-week-objective co-week-extra">
            <span className="co-week-objective-number" aria-hidden>＋</span>
            <div className="co-week-objective-body">
                <h3>{extra.titre}</h3>
                <p>{extra.detail}</p>
                <span className="co-week-extra-action">Lancer le quiz <ArrowRight size={15}/></span>
            </div>
        </Link>}
    </div>;
}
