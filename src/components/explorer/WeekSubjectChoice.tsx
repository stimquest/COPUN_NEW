'use client';

export type SubjectStatus = 'partial' | 'done';

/** Le choix de semaine ne demande ni jour de séance ni compte rendu anticipé. */
export default function WeekSubjectChoice({ id, discussed, status, onDiscussedChange, onStatusChange, disabled, futureWeek = false }: {
    id: string;
    discussed: boolean;
    status: SubjectStatus | null;
    onDiscussedChange: (value: boolean) => void;
    onStatusChange: (value: SubjectStatus) => void;
    disabled?: boolean;
    futureWeek?: boolean;
}) {
    return <div className="space-y-4">
        {!futureWeek && <fieldset className="co-choice-timing" disabled={disabled}>
            <legend>Avec votre groupe</legend>
            <label className="w-full"><input type="radio" name={`week-intent-${id}`} checked={discussed} onChange={() => onDiscussedChange(true)}/> Nous en avons déjà parlé</label>
            <label className="w-full"><input type="radio" name={`week-intent-${id}`} checked={!discussed} onChange={() => onDiscussedChange(false)}/> Pour en parler cette semaine</label>
        </fieldset>}
        {discussed && !futureWeek ? <fieldset className="co-choice-timing" disabled={disabled}>
            <legend>Après lecture de la carte, ce sujet a été…</legend>
            {([
                ['partial', 'Effleuré', 'Vous en avez parlé rapidement, sans aller plus loin.'],
                ['done', 'Abordé', 'Vous avez développé le sujet avec le groupe.'],
            ] as const).map(([value, title, detail]) => <label key={value} className={`w-full rounded-bloc border p-4 ${status === value ? 'border-encre bg-sauge' : 'border-filet bg-carte'}`}>
                <input type="radio" name={`week-status-${id}`} checked={status === value} onChange={() => onStatusChange(value)}/>
                <span><strong className="block text-encre">{title}</strong><span className="block text-note text-discret">{detail}</span></span>
            </label>)}
        </fieldset> : <p className="text-corps leading-relaxed text-encre-douce">Gardez cette idée pour {futureWeek ? 'la semaine prochaine' : 'la semaine'}, sans fixer de date. Au bilan, vous indiquerez si le sujet a finalement été effleuré ou abordé.</p>}
    </div>;
}
