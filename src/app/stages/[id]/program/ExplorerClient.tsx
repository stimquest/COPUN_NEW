'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Dimension, Stage, PedagogicalContent } from '@/types';
import type { HistoriqueMoniteur } from '@/lib/historique-moniteur';
import { resolveCardChoice, type CardChoice, type CardChoices } from '@/lib/card-choice';
import { updateStagePool } from '@/actions/stage-actions';
import { addCardToWeek } from '@/actions/card-week-actions';
import ChoisirSujets from '@/components/explorer/ChoisirSujets';
import { prolongementsEssentielle } from '@/data/relations-essentielles';
import ProlongementsEssentiels from '@/components/explorer/ProlongementsEssentiels';
import WeekCardEditor from '@/components/explorer/WeekCardEditor';
import { calendarWeek, dateISOAParis, parseStageDateRange } from '@/lib/stage-dates';
import { weekHref } from '@/lib/week-navigation';
import { ajouterMissionPratique } from '@/actions/parcours-formation-actions';

type Props = {
    stage: Stage; copunPool: PedagogicalContent[]; customPool: PedagogicalContent[]; directorPool?: PedagogicalContent[];
    historique?: HistoriqueMoniteur; initialTheme?: string; initialGroup?: string;
    initialSelection?: string[]; savedIds?: string[]; savedError?: string;
    initialChoices?: CardChoices; initialActionChoices?: Record<string, string>;
    locked?: boolean; initiallyDiscussed?: boolean;
    initiallyPlanned?: boolean;
    initialEntries?: Record<string, { discussed: boolean; day: string | null; status?: 'partial' | 'done' | null }>;
    initialParcours?: string;
};

export default function ExplorerClient({ stage, copunPool, customPool, directorPool = [], historique, initialTheme, initialGroup, initialSelection = [], initialChoices = {}, initialActionChoices = {}, locked = false, initiallyDiscussed = false, initialEntries = {}, initialParcours }: Props) {
    const router = useRouter();
    const details = [...copunPool, ...customPool];
    const ids = stage.selected_content ?? [];
    const [choices, setChoices] = useState<CardChoices>(initialChoices);
    const { start: currentStart } = calendarWeek();
    const range = parseStageDateRange(stage.dates);
    const start = stage.calendar_week_start ?? (range ? dateISOAParis(range.start) : currentStart);
    const nextWeek = start > currentStart;
    const returnHref = weekHref(stage.id);
    const [editing, setEditing] = useState<PedagogicalContent | null>(null);
    const [selectionOnly, setSelectionOnly] = useState(false);
    const [editingParent, setEditingParent] = useState<PedagogicalContent | null>(null);
    const [activeDirectorId, setActiveDirectorId] = useState<string | null>(null);
    const [activeDirectorPillar, setActiveDirectorPillar] = useState<Dimension | null>(null);
    const [pending, setPending] = useState(false);
    const [message, setMessage] = useState('');
    const lock = useRef(false);
    const readOnly = locked || !!stage.closed_at;
    const record = initiallyDiscussed && !nextWeek;
    const getChoice = (card: PedagogicalContent) => resolveCardChoice(card, choices[card.id] ?? (initialActionChoices[card.id] ? { actionId: initialActionChoices[card.id] } : undefined));

    async function linkParcours(next: string[]) {
        if (initialParcours && initialSelection.length && initialSelection.every(id => next.includes(id))) {
            const mission = await ajouterMissionPratique({ sequenceId: initialParcours, stageId: stage.id, actionId: 'carte-question', cardIds: initialSelection.slice(0, 3) });
            if ('error' in mission) return mission.error ?? 'Les cartes sont enregistrées, mais le lien avec le parcours reste à réessayer.';
        }
    }
    async function addFromParcours() {
        if (lock.current || readOnly) return;
        lock.current = true; setPending(true); setMessage('');
        try {
            const next = Array.from(new Set([...ids, ...initialSelection])).slice(0, 5);
            const result = await updateStagePool(stage.id, next);
            if (!result.success) { setMessage(result.error ?? 'Enregistrement impossible.'); return; }
            const error = await linkParcours(next);
            if (error) setMessage(error); else router.replace(returnHref);
        } catch { setMessage('Connexion interrompue. Réessayez.'); }
        finally { lock.current = false; setPending(false); }
    }
    async function saveCard(card: PedagogicalContent, choice: CardChoice, executionStatus?: 'partial' | 'done') {
        if (readOnly || lock.current) return { success: false, error: 'Modification indisponible.' };
        lock.current = true; setPending(true);
        try {
            const status = executionStatus ?? initialEntries[card.id]?.status ?? undefined;
            const result = await addCardToWeek(stage.id, card.id, choice, !!status, null, status);
            if (result.success) {
                const error = await linkParcours(Array.from(new Set([...ids, card.id])));
                if (error) return { success: false, error };
                router.replace(returnHref + '&carte=' + encodeURIComponent(card.id));
            }
            return result;
        } finally { lock.current = false; setPending(false); }
    }
    const associated = editing ? prolongementsEssentielle(editing.id, details) : [];

    return <main className="co-field-week">
        <header className="mb-6 space-y-2">
            <Link href={returnHref} className="co-field-back">← Revenir à ma semaine</Link>
            <p className="text-note text-discret">Mes séances · {nextWeek ? 'La semaine prochaine' : start === currentStart ? 'Cette semaine' : stage.title}</p>
            <p className="text-note text-discret">{stage.dates}</p>
            <h1 className="text-titre font-semibold leading-snug text-encre">Choisir les sujets</h1>
            <p className="text-corps leading-relaxed text-encre-douce">{record ? 'Retrouvez une question qui correspond à ce dont vous avez parlé avec le groupe.' : 'Trouvez une question et des idées pour en parler avec le groupe.'}</p>
        </header>
        {message && <p role="alert" className="co-choice-error">{message}</p>}
        {initialSelection.some(id => !ids.includes(id)) && !readOnly && <button className="co-choice-secondary mb-5" disabled={pending} onClick={addFromParcours}>Ajouter les cartes apportées depuis mon parcours</button>}
        <ChoisirSujets directors={directorPool} details={details} selected={ids} entries={initialEntries} record={record} historique={historique} initialTheme={initialTheme} initialGroup={initialGroup} choices={choices} onChoiceChange={(id, choice) => setChoices(current => ({ ...current, [id]: choice }))} activeDirectorId={activeDirectorId} activeDirectorPillar={activeDirectorPillar} onDirectorChange={(id, dimension) => { setActiveDirectorId(id); setActiveDirectorPillar(dimension ?? null); }} onOpen={(card, alreadyRead = false) => { setSelectionOnly(alreadyRead); setEditingParent(directorPool.find(item => item.id === activeDirectorId) ?? null); setEditing(card); }}/>
        {editing && <WeekCardEditor key={editing.id} card={editing} selectionOnly={selectionOnly} futureWeek={nextWeek} initialChoice={getChoice(editing)} initialStatus={initialEntries[editing.id]?.status ?? undefined} purpose={record ? 'record' : 'prepare'} label={ids.includes(editing.id) ? 'Enregistrer' : 'Ajouter à ma semaine'} onSave={(choice, status) => saveCard(editing, choice, status)} onClose={() => { setEditing(null); setEditingParent(null); }} afterContent={associated.length > 0 ? <ProlongementsEssentiels cards={associated} onSelect={dimension => { setActiveDirectorId(editing.id); setActiveDirectorPillar(dimension); setEditing(null); setEditingParent(null); }}/> : undefined}>
            {editingParent && <button type="button" onClick={() => { setEditing(editingParent); setEditingParent(null); }} className="min-h-11 text-note font-semibold text-encre">← Revenir à la question essentielle</button>}
        </WeekCardEditor>}
    </main>;
}
