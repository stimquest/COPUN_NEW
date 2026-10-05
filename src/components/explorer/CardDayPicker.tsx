'use client';

import { addCivilDays } from '@/lib/stage-dates';

export default function CardDayPicker({ day, onChange, discussed, start, end, today }: {
    day: string; onChange: (day: string) => void; discussed: boolean; start: string; end: string; today: string;
}) {
    const options = discussed
        ? [{ label: 'Aujourd’hui', day: today }, { label: 'Hier', day: addCivilDays(today, -1) }]
        : [{ label: 'Demain', day: addCivilDays(today, 1) }, { label: 'Aujourd’hui', day: today }];
    const min = discussed ? start : (start > today ? start : today);
    const max = discussed && today < end ? today : end;
    return <fieldset className="co-choice-timing">
        <legend>{discussed ? 'Quand en avez-vous parlé ?' : 'Pour quel jour ?'}</legend>
        <div className="flex flex-wrap gap-2">{options.filter(option => option.day >= min && option.day <= max).map(option => <button key={option.label} type="button" aria-pressed={day === option.day} onClick={() => onChange(option.day)} className={`min-h-11 rounded-bloc px-3 text-corps border border-filet ${day === option.day ? 'bg-encre text-carte' : 'bg-carte text-encre'}`}>{option.label}</button>)}</div>
        <label className="mt-3 block text-corps text-encre">Jour de la semaine<input type="date" required min={min} max={max} value={day} onChange={event => onChange(event.target.value)} className="block min-h-11 w-full rounded-bloc border border-filet bg-carte p-3 text-encre"/></label>
    </fieldset>;
}
