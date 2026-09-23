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

type Props = {
    stage: Stage; copunPool: PedagogicalContent[]; customPool: PedagogicalContent[];
    historique?: HistoriqueMoniteur; initialTheme?: string; initialGroup?: string;
    initialSelection?: string[]; savedIds?: string[]; savedError?: string;
    initialChoices?: CardChoices; initialActionChoices?: Record<string, string>;
    locked?: boolean; initiallyDiscussed?: boolean;
};

export default function ExplorerClient({ stage, copunPool, customPool, historique, initialTheme, initialGroup, initialSelection = [], savedIds = [], savedError, initialChoices = {}, initialActionChoices = {}, locked = false, initiallyDiscussed = false }: Props) {
    const router = useRouter();
    const pool = [...copunPool, ...customPool];
    const [ids, setIds] = useState(stage.selected_content ?? []);
    const [choices, setChoices] = useState<CardChoices>(initialChoices);
    const [mode, setMode] = useState<'week' | 'planned' | 'discussed' | 'complete'>(initiallyDiscussed ? 'discussed' : 'week');
    const [source, setSource] = useState<'all' | 'saved' | 'terrain'>('all');
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
    const filtered = pool.filter(card => (source !== 'saved' || savedIds.includes(card.id)) && `${card.question} ${card.objectif} ${(card.tags_filtre ?? []).join(' ')}`.toLocaleLowerCase('fr').includes(search.toLocaleLowerCase('fr')));

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
            if (result.success) { setIds(next); router.refresh(); }
            else setMessage(result.error ?? 'Enregistrement impossible.');
        } catch { setMessage('Connexion interrompue. Réessayez.'); }
        finally { lock.current = false; setPending(false); }
    }

    async function saveCard(card: PedagogicalContent, choice: CardChoice) {
        if (readOnly || lock.current) return { success: false, error: 'Modification indisponible.' };
        lock.current = true; setPending(true);
        try {
            const result = await addCardToWeek(stage.id, card.id, choice, mode === 'discussed');
            if (result.success) {
                setIds(current => current.includes(card.id) ? current : [...current, card.id]);
                setChoices(current => ({ ...current, [card.id]: choice }));
                setMessage(mode === 'discussed' ? 'Sujet ajouté et noté comme abordé. Le groupe pourra confirmer l’action au vote final.' : 'L’accroche et l’action sont enregistrées dans votre semaine.');
                setMode('week'); router.refresh();
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
            <p className="co-eyebrow">{stage.dates}</p><h1>{stage.title}</h1>
            <p>Vos idées à raconter, vos actions à faire vivre.</p>
        </header>}
        {message && <p className="co-field-feedback" role="status">{message}<button aria-label="Fermer le message" onClick={() => setMessage('')}>×</button></p>}
        {mode === 'week' ? <>
            {!readOnly && <div className="co-field-entrypoints">
                <button onClick={() => setMode('planned')}>Prévoir un sujet <span aria-hidden>＋</span></button>
                <button onClick={() => setMode('discussed')}>Ajouter un sujet abordé <span aria-hidden>＋</span></button>
            </div>}
            {initialSelection.some(id => !ids.includes(id)) && !readOnly && <button className="co-choice-secondary" disabled={pending} onClick={() => changeSelection(Array.from(new Set([...ids, ...initialSelection])).slice(0, 5))}>Ajouter les cartes apportées depuis mon parcours</button>}
            {selected.length === 0 ? <section className="co-field-empty"><h2>Les occasions font aussi la semaine.</h2><p>Partez d’une carte mise de côté, prévoyez un sujet ou retrouvez celui que vous avez déjà abordé sur le terrain.</p><Link href="/specialisation">Me former avec un parcours →</Link></section> :
                <div className="co-field-cards">{selected.map((card, index) => {
                    const choice = getChoice(card);
                    const action = card.actions?.find(item => item.id === choice.actionId);
                    return <article className="co-field-card" key={card.id}>
                        <header><p className="co-eyebrow">{card.dimension}</p><span>{String(index + 1).padStart(2, '0')}</span></header>
                        <h2>{card.question}</h2>
                        <div className="co-field-hook"><h3>Je lance le sujet</h3><blockquote>« {choice.accroche} »</blockquote></div>
                        {action ? <div className="co-field-action"><h3>Avec le groupe</h3><strong>{action.label}</strong><p>{action.consigne}</p></div> : card.a_observer && <div className="co-field-action"><h3>À observer</h3><p>{card.a_observer}</p></div>}
                        {card.a_retenir && <div className="co-field-takeaway"><h3>L’idée à retenir</h3><p>{card.a_retenir}</p></div>}
                        {!readOnly && <footer><button disabled={pending} onClick={() => setEditing(card)}>Relire / modifier</button><details><summary>Gérer la carte</summary><div><button disabled={pending || index === 0} onClick={() => move(index, -1)}>Monter</button><button disabled={pending || index === ids.length - 1} onClick={() => move(index, 1)}>Descendre</button><button disabled={pending} onClick={() => changeSelection(ids.filter(id => id !== card.id))}>Retirer de la semaine</button></div></details></footer>}
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
            <h2>{mode === 'discussed' ? 'Quel sujet avez-vous abordé ?' : mode === 'complete' ? 'Pour compléter ce sujet' : 'Choisir les sujets'}</h2>
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
            {source === 'terrain' ? <AideConditions open pool={filteredComplete} retenues={ids} onToggleFiche={id => setEditing(pool.find(card => card.id === id) ?? null)} onFicheInfo={setEditing} historique={historique}/> :
                <FluxDecouverte pool={filteredComplete} mode="catalogue" retenues={ids} onToggleFiche={id => setEditing(pool.find(card => card.id === id) ?? null)} onFicheInfo={setEditing} historique={historique} initialTheme={initialTheme} initialGroup={initialGroup}/>}
            {filteredComplete.length === 0 && <p className="co-field-feedback">Aucune carte ne correspond. Essayez un autre mot ou revenez à toutes les cartes ; ne retenez pas un sujet différent de celui réellement abordé.</p>}
        </section>}
        {editing && <WeekCardEditor key={editing.id} card={editing} initialChoice={getChoice(editing)} label={mode === 'discussed' ? 'Ajouter comme sujet abordé' : ids.includes(editing.id) ? 'Enregistrer mes choix' : 'Ajouter à ma semaine'} onSave={choice => saveCard(editing, choice)} onClose={() => setEditing(null)}/>}
    </main>;
}
