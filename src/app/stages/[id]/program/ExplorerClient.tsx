'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Stage, PedagogicalContent } from '@/types';
import type { HistoriqueMoniteur } from '@/lib/historique-moniteur';
import { resolveCardChoice, type CardChoice, type CardChoices } from '@/lib/card-choice';
import { updateStagePool } from '@/actions/stage-actions';
import { addCardToWeek } from '@/actions/card-week-actions';
import FluxDecouverte from '@/components/explorer/FluxDecouverte';
import AideConditions from '@/components/explorer/AideConditions';
import WeekCardEditor from '@/components/explorer/WeekCardEditor';
import { cartesConnexes, type CarteConnexe } from '@/data/cartes-connexes';
import { addCivilDays, calendarWeek, dateISOAParis, parseStageDateRange } from '@/lib/stage-dates';
import CardDayPicker from '@/components/explorer/CardDayPicker';
import { ajouterMissionPratique } from '@/actions/parcours-formation-actions';


type Props = {
    stage: Stage; copunPool: PedagogicalContent[]; customPool: PedagogicalContent[];
    historique?: HistoriqueMoniteur; initialTheme?: string; initialGroup?: string;
    initialSelection?: string[]; savedIds?: string[]; savedError?: string;
    initialChoices?: CardChoices; initialActionChoices?: Record<string, string>;
    locked?: boolean; initiallyDiscussed?: boolean;
    initiallyPlanned?: boolean;
    initialEntries?: Record<string, { discussed: boolean; day: string | null; status?: 'partial' | 'done' | null }>;
    initialParcours?: string;
};

export default function ExplorerClient({ stage, copunPool, customPool, historique, initialTheme, initialGroup, initialSelection = [], savedIds = [], savedError, initialChoices = {}, initialActionChoices = {}, locked = false, initiallyDiscussed = false, initiallyPlanned = false, initialEntries = {}, initialParcours }: Props) {
    const router = useRouter();
    const pool = [...copunPool, ...customPool];
    const [ids, setIds] = useState(stage.selected_content ?? []);
    const [choices, setChoices] = useState<CardChoices>(initialChoices);
    const [mode, setMode] = useState<'week' | 'planned' | 'discussed' | 'complete'>(initiallyDiscussed ? 'discussed' : initiallyPlanned ? 'planned' : 'week');
    const { today, start: currentStart } = calendarWeek();
    const range = parseStageDateRange(stage.dates);
    const start = stage.calendar_week_start ?? (range ? dateISOAParis(range.start) : currentStart);
    const end = addCivilDays(start, 6);
    const nextWeek = start > currentStart;
    const [day, setDay] = useState(initiallyDiscussed ? today : nextWeek ? start : addCivilDays(today, 1) <= end ? addCivilDays(today, 1) : today);
    const [entries, setEntries] = useState<Record<string, { discussed: boolean; day: string | null; status?: 'partial' | 'done' | null }>>(initialEntries);
    const [source, setSource] = useState<'all' | 'saved' | 'terrain'>(initiallyDiscussed ? 'terrain' : 'all');
    const [search, setSearch] = useState('');
    /** En mode « compléter », repasse du filtre suggestions au catalogue complet. */
    const [elargi, setElargi] = useState(false);
    const [editing, setEditing] = useState<PedagogicalContent | null>(null);
    const [pending, setPending] = useState(false);
    const [message, setMessage] = useState('');
    const lock = useRef(false);
    const readOnly = locked || !!stage.closed_at;
    const selected = ids.map(id => pool.find(card => card.id === id)).filter((card): card is PedagogicalContent => !!card);
    const getChoice = (card: PedagogicalContent) => resolveCardChoice(card, choices[card.id] ?? (initialActionChoices[card.id] ? { actionId: initialActionChoices[card.id] } : undefined));
    const normalizeSearch = (text: string) => text.toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const filtered = pool.filter(card => (source !== 'saved' || savedIds.includes(card.id)) && normalizeSearch(`${card.question} ${card.objectif} ${(card.tags_filtre ?? []).join(' ')}`).includes(normalizeSearch(search)));

    /**
     * Les mots-clés qu'on peut effectivement chercher, plutôt qu'un champ texte à
     * l'aveugle : taper un terme absent du catalogue (« méduse » écrit autrement que
     * le tag qui l'indexe) renvoie zéro résultat sans jamais dire pourquoi. Triés par
     * fréquence : les plus utiles — donc les plus susceptibles de correspondre à ce que
     * cherche le moniteur — en premier.
     *
     * Sur `pool` entier, pas `filtered` : la liste doit aider à corriger une recherche
     * qui échoue, pas rétrécir avec elle.
     */
    const motsCles = [...pool.reduce((compte, card) => {
        for (const mot of card.tags_filtre ?? []) compte.set(mot, (compte.get(mot) ?? 0) + 1);
        return compte;
    }, new Map<string, number>()).entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([mot]) => mot);

    /**
     * Ce qui compléterait les sujets déjà retenus — visible en permanence, pas seulement
     * dans la seconde qui suit un ajout : le moniteur revient sur cette page pour préparer,
     * et c'est là qu'il décide d'étoffer.
     *
     * Les suggestions partent de la dernière carte retenue, en écartant les doublons : deux
     * cartes du même groupe proposeraient sinon les mêmes compléments.
     */
    const suggestions: CarteConnexe[] = readOnly || ids.length >= 5 ? [] : (() => {
        const vues = new Set<string>();
        return [...selected].reverse()
            .flatMap(card => cartesConnexes(card, pool, ids))
            .filter(item => !vues.has(item.carte.id) && vues.add(item.carte.id))
            .slice(0, 2);
    })();
    const suggestionIds = new Set(suggestions.map(item => item.carte.id));
    // En mode « compléter », le catalogue s'ouvre déjà réduit aux suggestions : le
    // moniteur y accède d'un tap, sans repasser par une recherche. « elargi » (ou changer
    // de source, ou chercher) repasse au catalogue complet — il n'est jamais coincé
    // devant deux cartes s'il veut finalement naviguer plus large.
    const restreintAuxSuggestions = mode === 'complete' && source === 'all' && !search && !elargi;
    const filteredComplete = restreintAuxSuggestions ? filtered.filter(card => suggestionIds.has(card.id)) : filtered;

    async function changeSelection(next: string[]) {
        if (lock.current || readOnly) return;
        lock.current = true; setPending(true); setMessage('');
        try {
            const result = await updateStagePool(stage.id, next);
            if (result.success) {
                setIds(next);
                if (initialParcours && initialSelection.length && initialSelection.every(id => next.includes(id))) {
                    const mission = await ajouterMissionPratique({ sequenceId: initialParcours, stageId: stage.id, actionId: 'carte-question', cardIds: initialSelection.slice(0, 3) });
                    if ('error' in mission) setMessage(mission.error ?? 'Les cartes sont enregistrées, mais le lien avec le parcours reste à réessayer.');
                }
                router.refresh();
            }
            else setMessage(result.error ?? 'Enregistrement impossible.');
        } catch { setMessage('Connexion interrompue. Réessayez.'); }
        finally { lock.current = false; setPending(false); }
    }

    async function saveCard(card: PedagogicalContent, choice: CardChoice, executionStatus?: 'partial' | 'done') {
        if (readOnly || lock.current) return { success: false, error: 'Modification indisponible.' };
        lock.current = true; setPending(true);
        try {
            const discussed = mode === 'discussed';
            const result = await addCardToWeek(stage.id, card.id, choice, discussed, mode === 'week' || discussed ? null : day, executionStatus);
            if (result.success) {
                setIds(current => current.includes(card.id) ? current : [...current, card.id]);
                setChoices(current => ({ ...current, [card.id]: choice }));
                if (mode !== 'week') setEntries(current => ({ ...current, [card.id]: { discussed, day: discussed ? null : day, ...(executionStatus ? { status: executionStatus } : {}) } }));
                setMessage(discussed ? 'Ce sujet est noté dans votre semaine. Retrouvez ci-dessous des idées pour continuer à en parler.' : mode === 'week' && entries[card.id]?.discussed ? 'Vos propositions pour la suite sont conservées.' : 'Votre idée est conservée dans la semaine.');
                setMode('week');
                if (mode === 'week') router.refresh();
                else router.replace(`/stages/${stage.id}/program`);
            }
            return result;
        } finally { lock.current = false; setPending(false); }
    }

    function move(index: number, offset: number) {
        const next = [...ids];
        [next[index], next[index + offset]] = [next[index + offset], next[index]];
        void changeSelection(next);
    }

    return <main className="co-field-week">
        {/* Masqué en mode catalogue : celui-ci porte déjà son propre retour et son propre
            titre (ligne « ← Revenir à ma semaine » + h2 juste en dessous). Les deux
            empilés répétaient la même navigation avant tout contenu utile. */}
        {mode === 'week' && <header className="co-field-heading">
            <Link href="/stages/semaines" className="co-field-back">← Mes semaines</Link>
            <p className="co-eyebrow">{stage.dates}</p><h1>{nextWeek ? 'La semaine prochaine' : start === currentStart ? 'Cette semaine' : stage.title}</h1>
            <p>{nextWeek ? 'Quelques idées pour vos prochaines séances, si vous le souhaitez.' : 'Retrouvez les sujets abordés avec le groupe et des idées pour la suite.'}</p>
        </header>}
        {message && <p className="co-field-feedback" role="status">{message}<button aria-label="Fermer le message" onClick={() => setMessage('')}>×</button></p>}
        {mode === 'week' ? <>
            {!readOnly && <div className="co-field-entrypoints">
                {!nextWeek && <button onClick={() => { setSource('terrain'); setSearch(''); setMode('discussed'); }}>Noter ce qu’on a fait <span aria-hidden>＋</span></button>}
                <button onClick={() => { setDay(nextWeek ? start : addCivilDays(today, 1) <= end ? addCivilDays(today, 1) : today); setMode('planned'); }}>{nextWeek ? 'Ajouter une idée' : 'Prévoir un sujet'} <span aria-hidden>＋</span></button>
            </div>}
            {initialSelection.some(id => !ids.includes(id)) && !readOnly && <button className="co-choice-secondary" disabled={pending} onClick={() => changeSelection(Array.from(new Set([...ids, ...initialSelection])).slice(0, 5))}>Ajouter les cartes apportées depuis mon parcours</button>}
            {selected.length === 0 ? <section className="co-field-empty"><h2>{nextWeek ? 'Une idée pour la semaine prochaine ?' : 'Un sujet abordé avec le groupe ?'}</h2><p>{nextWeek ? 'Ajoutez les sujets qui vous inspirent. Vous les retrouverez ici lorsque la semaine commencera.' : 'Vous avez parlé d’un sujet avec votre groupe ? Retrouvez la carte correspondante. Vous pouvez aussi garder une idée pour une prochaine séance.'}</p><Link href="/stages/decouvrir">Explorer les cartes →</Link></section> :
                <div className="co-field-cards">{selected.map((card, index) => {
                    const choice = getChoice(card);
                    const action = card.actions?.find(item => item.id === choice.actionId);
                    const discussed = entries[card.id]?.discussed;
                    return <article className="co-field-card" key={card.id}>
                        <header><p className="co-eyebrow">{card.dimension}</p><span>{String(index + 1).padStart(2, '0')}</span></header>
                        <h2>{card.question}</h2>
                        {entries[card.id] && <p className="co-eyebrow">{entries[card.id].discussed ? entries[card.id].status === 'partial' ? 'Effleuré cette semaine' : 'Abordé cette semaine' : 'Prévu'}{!entries[card.id].discussed && entries[card.id].day ? ` le ${new Date(`${entries[card.id].day}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' })}` : ''}</p>}
                        {discussed && <p className="my-4 text-corps text-encre-douce">Pour continuer à en parler lors d’une prochaine séance, voici une accroche et une proposition à essayer avec le groupe.</p>}
                        <div className="co-field-hook"><h3>{discussed ? 'Une autre façon d’en parler' : 'Je lance le sujet'}</h3><blockquote>« {choice.accroche} »</blockquote></div>
                        {action ? <div className="co-field-action"><h3>{discussed ? 'Une idée pour la suite' : 'Avec le groupe'}</h3><strong>{action.label}</strong><p>{action.consigne}</p></div> : card.a_observer && <div className="co-field-action"><h3>{discussed ? 'Une observation pour aller plus loin' : 'À observer'}</h3><p>{card.a_observer}</p></div>}
                        {card.a_retenir && <div className="co-field-takeaway"><h3>L’idée à retenir</h3><p>{card.a_retenir}</p></div>}
                        {!readOnly && <footer><button disabled={pending} onClick={() => setEditing(card)}>{discussed ? 'Voir les autres propositions de la carte' : 'Relire / modifier'}</button><details><summary>Gérer la carte</summary><div><button disabled={pending || index === 0} onClick={() => move(index, -1)}>Monter</button><button disabled={pending || index === ids.length - 1} onClick={() => move(index, 1)}>Descendre</button><button disabled={pending} onClick={() => changeSelection(ids.filter(id => id !== card.id))}>Retirer de la semaine</button></div></details></footer>}
                    </article>;
                })}</div>}
            {/* Après les cartes, pas avant : on complète ce qu'on voit déjà retenu, pas ce
                qu'on s'apprête à choisir. Ouvre le même écran catalogue que « Prévoir un
                sujet », déjà réduit aux suggestions — accès direct, tout en restant dans le
                catalogue complet où recherche et sources fonctionnent normalement.

                Pas de bloc « À jouer avec le groupe » ici : le quiz d'animation et le vote
                de fin sont déjà les actions principales de « Mes semaines », d'où on arrive
                toujours sur cet écran. Le dupliquer casserait la hiérarchie — cette page sert
                à préparer le contenu, pas à lancer une activité live. */}
            {suggestions.length > 0 && <button className="co-field-complete-entry" onClick={() => setMode('complete')}>Pour compléter ce sujet <span aria-hidden>＋</span></button>}
        </> : <section className="co-field-catalogue">
            <button className="co-field-back" onClick={() => setMode('week')}>← Revenir à ma semaine</button>
            <h2>{mode === 'discussed' ? 'Qu’avez-vous fait avec le groupe ?' : mode === 'complete' ? 'Pour compléter ce sujet' : 'Choisir les sujets'}</h2>
            {mode === 'discussed' && <p className="mb-4 text-corps text-encre-douce">Choisissez la carte qui se rapproche de votre séance. Elle vous aidera à préciser si le sujet a été effleuré ou abordé, et à trouver une piste pour la suite.</p>}
            <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Marée, laisse de mer, oiseaux…" aria-label="Rechercher un sujet"/>
            {/* Les mots-clés qui existent réellement dans le catalogue : sans eux, taper un
                terme absent renvoie zéro résultat sans dire s'il faut chercher autrement ou
                si le sujet n'y est tout simplement pas. Un tap complète la recherche, il ne
                la remplace pas — on peut préciser en tapant à la suite. */}
            <details className="co-field-tags">
                <summary>Voir les mots-clés du catalogue</summary>
                <div>{motsCles.map(mot => <button key={mot} type="button" aria-pressed={search.toLocaleLowerCase('fr') === mot.toLocaleLowerCase('fr')} onClick={() => setSearch(mot)}>{mot}</button>)}</div>
            </details>
            <div className="co-field-sources">{(['all', 'saved', 'terrain'] as const).map(item => <button key={item} aria-pressed={source === item} onClick={() => setSource(item)}>{item === 'all' ? (mode === 'complete' ? 'Suggestions' : 'Toutes les cartes') : item === 'saved' ? 'Mises de côté' : 'Partir du terrain'}</button>)}</div>
            {restreintAuxSuggestions && <p className="co-field-feedback">Deux idées pour aller plus loin sur ce que vous avez déjà retenu. <button className="co-field-widen" onClick={() => setElargi(true)}>Voir tout le catalogue</button></p>}
            {source === 'saved' && savedError && <p role="alert">{savedError}</p>}
            {source === 'terrain' ? <AideConditions open allThemes={mode === 'discussed'} pool={filteredComplete} retenues={ids} onToggleFiche={id => setEditing(pool.find(card => card.id === id) ?? null)} onFicheInfo={setEditing} historique={historique}/> :
                <FluxDecouverte pool={filteredComplete} mode="catalogue" retenues={ids} onToggleFiche={id => setEditing(pool.find(card => card.id === id) ?? null)} onFicheInfo={setEditing} historique={historique} initialTheme={initialTheme} initialGroup={initialGroup}/>}
            {filteredComplete.length === 0 && <p className="co-field-feedback">Aucune carte ne correspond. Essayez un autre mot ou revenez à toutes les cartes ; ne retenez pas un sujet différent de celui réellement abordé.</p>}
        </section>}
        {editing && <WeekCardEditor key={editing.id} card={editing} initialChoice={getChoice(editing)} purpose={mode === 'discussed' ? 'record' : entries[editing.id]?.discussed && mode === 'week' ? 'continue' : 'prepare'} label={mode === 'discussed' ? 'Noter ce sujet dans ma semaine' : ids.includes(editing.id) ? 'Enregistrer mes choix' : 'Ajouter à ma semaine'} onSave={(choice, status) => saveCard(editing, choice, status)} onClose={() => setEditing(null)}>
            {mode !== 'week' && mode !== 'discussed' && <CardDayPicker day={day} onChange={setDay} discussed={false} start={start} end={end} today={today}/>}
        </WeekCardEditor>}
    </main>;
}
