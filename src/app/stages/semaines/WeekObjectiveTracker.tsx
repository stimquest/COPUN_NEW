'use client';

import { useState, useTransition } from 'react';
import { Check } from 'lucide-react';
import { saveObjectiveStatus } from '@/actions/stage-actions';
import type { StageObjectiveExecutionStatus } from '@/types';

type Objective = {
    id: string;
    question: string;
    objectif: string;
    action?: string | null;
    initialStatus: StageObjectiveExecutionStatus;
};

/**
 * Un seul geste, et il porte sur le groupe — pas sur le moniteur.
 *
 * Les trois états précédents (À faire / Essayé en partie / Réalisé) demandaient au
 * moniteur de juger sa propre prestation, seul, après sa journée. C'est un suivi de type
 * kanban : on le tient quelques semaines, puis plus du tout — les 9 lignes de
 * `stage_objective_reviews` pour 35 préparations le montrent déjà.
 *
 * Ce qui se constate sans se juger, c'est le geste du groupe : la consigne a été menée
 * avec lui, ou non. D'où un seul bouton, binaire et réversible, dont le sujet est le
 * groupe. La formation mesure ce que le moniteur acquiert ; la semaine mesure ce que ses
 * apprenants ont vécu.
 *
 * `partial` n'est plus proposé mais reste lu : une semaine déjà suivie à l'ancienne
 * continue de s'afficher comme faite, sans réécrire l'historique.
 */
function ObjectiveRow({ stageId, objective, index }: { stageId: string; objective: Objective; index: number }) {
    const [status, setStatus] = useState(objective.initialStatus);
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const fait = status === 'done' || status === 'partial';

    const basculer = () => {
        const previous = status;
        const next: StageObjectiveExecutionStatus = fait ? 'not_done' : 'done';
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
            <p>{objective.objectif}</p>
            {objective.action && <p className="co-week-objective-action"><strong>Avec le groupe</strong>{objective.action}</p>}
            <div className="co-week-objective-status">
                <button type="button" aria-pressed={fait} disabled={pending} onClick={basculer} className={fait ? 'co-week-done' : undefined}>
                    {fait && <Check size={15} strokeWidth={3} aria-hidden/>}
                    {fait ? 'Le groupe l’a fait' : 'Le groupe l’a fait ?'}
                </button>
            </div>
            {error && <p className="co-week-objective-error" role="alert">{error}</p>}
        </div>
    </article>;
}

export function WeekObjectiveTracker({ stageId, objectives }: { stageId: string; objectives: Objective[] }) {
    return <div className="co-week-objectives">{objectives.map((objective, index) => <ObjectiveRow key={objective.id} stageId={stageId} objective={objective} index={index}/>)}</div>;
}
