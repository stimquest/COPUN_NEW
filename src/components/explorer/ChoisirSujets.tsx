'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import type { Dimension, PedagogicalContent } from '@/types';
import type { HistoriqueMoniteur } from '@/lib/historique-moniteur';
import { directriceDe } from '@/data/cartes-directrices';
import { idsLiesEssentielle, prolongementsEssentielle } from '@/data/relations-essentielles';
import type { CardChoice, CardChoices } from '@/lib/card-choice';
import FluxDecouverte, { PileCartesSujets } from './FluxDecouverte';
import ProlongementsEssentiels from './ProlongementsEssentiels';
import { pistesTerrain } from '@/data/situations-terrain';

export default function ChoisirSujets({ directors, details, selected, entries, record, historique, onOpen, initialTheme, initialGroup, choices, onChoiceChange, activeDirectorId, activeDirectorPillar, onDirectorChange, cardActions, terrain = false }: {
    directors: PedagogicalContent[];
    details: PedagogicalContent[];
    selected: string[];
    entries: Record<string, { status?: 'partial' | 'done' | null }>;
    record: boolean;
    historique?: HistoriqueMoniteur;
    onOpen: (card: PedagogicalContent, alreadyRead?: boolean) => void;
    initialTheme?: string;
    initialGroup?: string;
    choices: CardChoices;
    onChoiceChange: (id: string, choice: CardChoice) => void;
    activeDirectorId: string | null;
    activeDirectorPillar?: Dimension | null;
    onDirectorChange: (id: string | null, dimension?: Dimension) => void;
    cardActions?: (card: PedagogicalContent) => React.ReactNode;
    terrain?: boolean;
}) {
    const [byMainQuestions, setByMainQuestions] = useState(terrain);
    const [search, setSearch] = useState('');
    const [cataloguePillar, setCataloguePillar] = useState<Dimension | null>(null);
    const [returnCardId, setReturnCardId] = useState<string | undefined>();
    const viewStart = useRef<HTMLDivElement>(null);
    const previousView = useRef<string | null>(null);
    const normalize = (text: string) => text.toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const terms = normalize(search).trim().split(/\s+/).filter(Boolean);
    const pistes = terrain ? pistesTerrain(search) : { ids: new Set<string>(), pistes: [] };
    const linkedDetails = new Set([...pistes.ids].flatMap(idsLiesEssentielle));
    const matches = (card: PedagogicalContent) => {
        const text = normalize([card.question, card.accroche, card.explication, directriceDe(card.id)?.sujet, ...(card.tags_filtre ?? [])].join(' '));
        return pistes.ids.has(card.id) || linkedDetails.has(card.id) || terms.every(term => text.includes(term));
    };
    const mainCards = directors.filter(matches);
    const preciseCards = details.filter(matches);
    const activeDirector = activeDirectorId ? directors.find(card => card.id === activeDirectorId) : undefined;
    const extensions = activeDirector ? prolongementsEssentielle(activeDirector.id, details) : [];
    const showMainQuestions = byMainQuestions || !!activeDirector;
    const cards = activeDirector ? extensions.filter(card => matches(card) && (!activeDirectorPillar || card.dimension === activeDirectorPillar)) : mainCards;
    const view = activeDirector ? 'details:' + activeDirector.id + ':' + (activeDirectorPillar ?? 'all') : showMainQuestions ? 'main' : 'catalogue';

    useLayoutEffect(() => {
        const previous = previousView.current;
        previousView.current = view;
        if (previous === view || (previous === null && !view.startsWith('details:'))) return;
        viewStart.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
        viewStart.current?.focus({ preventScroll: true });
    }, [view]);

    const showDetails = (card: PedagogicalContent, dimension: Dimension) => {
        setReturnCardId(card.id);
        setSearch('');
        onDirectorChange(card.id, dimension);
    };

    const presentation = {
        continuation: record,
        actions: cardActions ?? ((card: PedagogicalContent) => <button type="button" onClick={() => onOpen(card, true)} className="flex min-h-11 flex-1 items-center justify-center rounded-full bg-encre px-3 text-note font-semibold text-carte">{selected.includes(card.id) ? entries[card.id]?.status === 'partial' ? 'Effleuré · Revoir' : entries[card.id]?.status === 'done' ? 'Abordé · Revoir' : 'Dans ma semaine · Revoir' : record ? 'Noter ce sujet' : 'Choisir cette carte'}</button>),
        extra: (card: PedagogicalContent) => directriceDe(card.id) ? <div className="mt-6"><ProlongementsEssentiels cards={prolongementsEssentielle(card.id, details)} onSelect={dimension => showDetails(card, dimension)}/></div> : null,
    };

    return <div className={terrain ? 'space-y-3' : 'space-y-5'}>
        <input type="search" value={search} onChange={event => { setSearch(event.target.value); if (terrain && activeDirectorId) { setByMainQuestions(true); onDirectorChange(null); } }} placeholder={terrain ? 'Un dauphin, une méduse, la mer très basse…' : 'Marée, oiseaux, méduses…'} aria-label={terrain ? 'Qu’avez-vous vu ou de quoi avez-vous parlé ?' : 'Quel sujet cherchez-vous ?'} className="min-h-12 w-full rounded-bloc border border-filet bg-carte px-4 text-corps text-encre placeholder:text-discret"/>
        {terrain && pistes.pistes.length > 0 && <div role="status" className="space-y-2 rounded-bloc bg-sauge p-4 text-corps leading-relaxed text-encre">{pistes.pistes.slice(0, 2).map(piste => <p key={piste}>{piste}</p>)}</div>}
        <div ref={viewStart} tabIndex={-1} aria-label={activeDirector ? 'Prolongements du sujet' : showMainQuestions ? 'Questions essentielles' : 'Catalogue détaillé'} className={`${terrain ? 'space-y-3' : 'space-y-5'} scroll-mt-4 outline-none`}>
            <div role="group" aria-label="Affichage des sujets" className="flex rounded-full border border-filet bg-sauge p-1">
                {([{ main: true, label: 'Questions essentielles' }, { main: false, label: 'Toutes les cartes' }] as const).map(option => <button key={option.label} type="button" aria-pressed={showMainQuestions === option.main} onClick={() => { setByMainQuestions(option.main); onDirectorChange(null); }} className={`min-h-11 min-w-0 flex-1 rounded-full px-3 text-note font-semibold transition-colors ${showMainQuestions === option.main ? 'bg-encre text-carte' : 'text-encre'}`}>{option.label}</button>)}
            </div>
            {!showMainQuestions ? <FluxDecouverte pool={preciseCards} mode="catalogue" cardLayout="pile" presentation={presentation} choices={choices} onChoiceChange={onChoiceChange} allowUse={false} pillar={cataloguePillar} onPillarChange={setCataloguePillar} retenues={selected} historique={historique} initialTheme={initialTheme} initialGroup={initialGroup}/> : <>
                {activeDirector && <section aria-label="Sujet approfondi" className="space-y-3 rounded-bloc border border-filet bg-sauge p-4">
                    <button type="button" onClick={() => { setReturnCardId(activeDirector.id); setByMainQuestions(true); onDirectorChange(null); setSearch(''); }} className="min-h-11 text-note font-semibold text-encre">← Questions essentielles</button>
                    <h3 className="text-intertitre font-semibold leading-snug text-encre">{activeDirector.question}</h3>
                    <ProlongementsEssentiels heading={false} cards={extensions} selected={activeDirectorPillar ?? null} onSelect={dimension => showDetails(activeDirector, dimension)}/>
                </section>}
                {cards.length > 0 ? <PileCartesSujets pool={cards} relatedPool={details} startCardId={activeDirector ? undefined : returnCardId} choices={choices} onChoiceChange={onChoiceChange} presentation={presentation}/> : <div className="space-y-3 rounded-bloc bg-sauge p-4 text-corps text-encre">
                    <p>{terms.length ? 'Aucun lien trouvé avec ces mots.' : 'Aucune carte pour cet angle.'}</p>
                    {terms.length > 0 && <button type="button" onClick={() => { setSearch(''); setByMainQuestions(true); onDirectorChange(null); }} className="min-h-11 text-note font-semibold underline underline-offset-4">Revoir les questions essentielles</button>}
                </div>}
            </>}
        </div>
    </div>;
}
