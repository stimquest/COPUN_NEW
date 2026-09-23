'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { SequenceProgress } from '@/actions/parcours-formation-actions';
import { ajouterMissionPratique, marquerSequenceParcourue, verifierAcquisSequence } from '@/actions/parcours-formation-actions';
import type { ParcoursFormation } from '@/data/parcours-formation';
import type { PedagogicalContent, Stage } from '@/types';
import FluxDecouverte from '@/components/explorer/FluxDecouverte';
import { setCardSaved } from '@/actions/saved-card-actions';
import { useRouter } from 'next/navigation';
import { resolveCardChoice, type CardChoice, type CardChoices } from '@/lib/card-choice';

export function ParcoursLaisseDeMerClient({ sequence, progression, cards, stages, savedIds, initialChoices = {} }: { sequence: ParcoursFormation; progression: SequenceProgress; cards: PedagogicalContent[]; stages: Stage[]; savedIds: string[]; initialChoices?: CardChoices }) {
    const router = useRouter();
    const [choices, setChoices] = useState<CardChoices>(initialChoices);
    // Une validation théorique est conservée en base : en revenant sur le parcours,
    // le moniteur reprend sa mise en pratique au lieu de repasser le quiz.
    const [etape, setEtape] = useState(() => progression.acquisVerifie ? 4 : 0);
    const [repereIndex, setRepereIndex] = useState(0);
    const [choixEntrainement, setChoixEntrainement] = useState<string | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [questionIndex, setQuestionIndex] = useState(0);
    const [resultat, setResultat] = useState<Awaited<ReturnType<typeof verifierAcquisSequence>> | null>(null);
    const [quizStatus, setQuizStatus] = useState<string | null>(null);
    const [cardIds, setCardIds] = useState<string[]>(() => progression.mission?.cardIds ?? []);
    const [stageId, setStageId] = useState(() => progression.mission?.stageId ?? '');
    const [practiceView, setPracticeView] = useState<'cards' | 'recap'>('cards');
    const [missionEnregistree, setMissionEnregistree] = useState(false);
    const [error, setError] = useState('');
    const [isPending, startTransition] = useTransition();
    const repere = sequence.reperes[repereIndex];
    const question = sequence.questions[questionIndex];
    const choix = sequence.entrainement.options.find(option => option.id === choixEntrainement);
    const cartesProposees = useMemo(() => {
        const motif = sequence.id === 'laisse-de-mer' ? /laisse|plage|déchet|algue|estran/i : /eau|vague|courant|marée|sable|rivage|érosion/i;
        // Le parcours oriente l'ordre sans réduire le corpus à une poignée de tags :
        // une carte utile peut avoir été classée sous un autre phénomène.
        return [...cards].sort((a, b) => {
            const aLiee = motif.test(`${a.question} ${a.tags_theme.join(' ')} ${a.tags_filtre.join(' ')}`);
            const bLiee = motif.test(`${b.question} ${b.tags_theme.join(' ')} ${b.tags_filtre.join(' ')}`);
            const aSaved = savedIds.includes(a.id);
            const bSaved = savedIds.includes(b.id);
            return Number(bLiee) - Number(aLiee) || Number(bSaved) - Number(aSaved);
        });
    }, [cards, savedIds, sequence.id]);
    const cartesChoisies = useMemo(() => cardIds.map(id => cards.find(card => card.id === id)).filter((card): card is PedagogicalContent => !!card), [cardIds, cards]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [etape, repereIndex, questionIndex]);

    const precedent = () => {
        if (etape > 0) { setEtape(value => value - 1); setError(''); }
    };
    const passerALaVerification = () => startTransition(async () => {
        setError('');
        try { const response = await marquerSequenceParcourue(sequence.id); if (response.error) { setError('La progression n’a pas pu être enregistrée. Réessaie.'); return; } setEtape(3); }
        catch { setError('La connexion a été interrompue. Réessaie.'); }
    });
    const verifier = () => startTransition(async () => {
        setError('');
        try {
            const response = await verifierAcquisSequence({ sequenceId: sequence.id, answers });
            if ('error' in response) { setError('Les réponses n’ont pas pu être enregistrées. Réessaie.'); return; }
            setResultat(response);
            if (response.valide) {
                setQuizStatus(null);
                setEtape(4);
            } else {
                setAnswers({});
                setQuestionIndex(0);
                setQuizStatus('Vos réponses ne permettent pas encore de valider ce parcours. Le quiz recommence à la première question : reprenez les repères et répondez à nouveau.');
            }
        }
        catch { setError('La connexion a été interrompue. Réessaie.'); }
    });
    const ajouterMission = () => startTransition(async () => {
        setError('');
        try { const response = await ajouterMissionPratique({ sequenceId: sequence.id, stageId, actionId: 'carte-question', cardIds, choices }); if (response.error) { setError(response.error); return; } setMissionEnregistree(true); }
        catch { setError('La connexion a été interrompue. Réessaie.'); }
    });
    const choisirCarte = (id: string, choice?: CardChoice) => {
        if (cardIds.includes(id)) {
            setCardIds(ids => ids.filter(cardId => cardId !== id));
            return;
        }
        if (cardIds.length >= 3) return;

        setCardIds(ids => [...ids, id]);
        if (choice) setChoices(current => ({ ...current, [id]: choice }));
        {
            void setCardSaved(id, true, choice).then(response => {
                if (!response.success) setError(response.error ?? 'La carte n’a pas pu être mise de côté.');
            }).catch(() => setError('Connexion interrompue. La carte n’a pas été mise de côté.'));
        }
    };
    const creerSemaine = () => startTransition(async () => {
        setError('');
        try {
            const results = await Promise.all(cartesChoisies.map(card => setCardSaved(card.id, true, resolveCardChoice(card, choices[card.id]))));
            if (results.some(result => !result.success)) { setError('Les choix n’ont pas tous été conservés. Réessayez.'); return; }
            router.push(`/stages/new?selection=${encodeURIComponent(cardIds.join(','))}&parcours=${encodeURIComponent(sequence.id)}`);
        } catch { setError('Connexion interrompue. Réessayez.'); }
    });
    return <div className="co-pro-lesson">
        <header className="co-pro-lesson-head">
            {etape === 0 || etape === 4 ? <Link href="/specialisation" aria-label="Fermer le parcours" className="co-pro-back"><ArrowLeft size={19}/></Link> : <button type="button" onClick={precedent} aria-label="Étape précédente" className="co-pro-back"><ArrowLeft size={19}/></button>}
            <div><p>Parcours littoral</p><strong>{sequence.titre}</strong></div>
            <span>{etape + 1} / {sequence.etapes.length}</span>
        </header>
        <div className="co-pro-progress" aria-label={`Étape ${etape + 1} sur ${sequence.etapes.length}`}><span style={{ width: `${((etape + 1) / sequence.etapes.length) * 100}%` }}/></div>
        {error && <p role="alert" className="co-pro-feedback">{error}</p>}

        {etape === 0 && <section className="co-pro-intro">
            <p className="co-pro-kicker">Module professionnel · {sequence.duree}</p>
            <h1>{sequence.titre}</h1>
            <p className="co-pro-lead">{sequence.objectif}</p>
            <dl className="co-pro-brief"><div><dt>Vous allez travailler</dt><dd>Une posture d’animation, une méthode d’observation et un cadre d’action.</dd></div><div><dt>À la fin du module</dt><dd>Vous saurez mener une intervention courte, contextualisée et utile au groupe.</dd></div></dl>
            <button className="co-pro-action" onClick={() => setEtape(1)}>Commencer le module <ArrowRight size={18}/></button>
            {progression.acquisVerifie && <button className="co-pro-quiet" onClick={() => setEtape(4)}>Tenter un nouvel essai</button>}
        </section>}

        {etape === 1 && <article className="co-pro-study">
            <p className="co-pro-kicker">{repere.repere} · {repereIndex + 1} / {sequence.reperes.length}</p>
            <h1>{repere.titre}</h1><p className="co-pro-lead">{repere.texte}</p>
            <div role="img" aria-label={sequence.id === 'laisse-de-mer'
                ? ['Éléments naturels et déchet humain observables dans une laisse de mer.', 'Un moniteur conduit une observation de la laisse de mer avec son groupe.', 'Un déchet d’origine humaine est retiré tandis que les éléments naturels restent en place.'][repereIndex]
                : ['Ligne de rivage, dépôts et sédiments visibles à marée basse.', 'L’eau déplace le sable et les galets le long du rivage.', 'Un moniteur fait comparer des indices de transformation du littoral avec son groupe.'][repereIndex]}
                className={`co-pro-visual co-pro-visual-${sequence.id} co-pro-visual-${repereIndex}`}/>
            <aside><strong>Repère métier</strong><p>{repere.pratique}</p></aside>
            <button className="co-pro-action" onClick={() => repereIndex === sequence.reperes.length - 1 ? setEtape(2) : setRepereIndex(index => index + 1)}>{repereIndex === sequence.reperes.length - 1 ? 'Passer à la mise en situation' : 'Repère suivant'} <ArrowRight size={18}/></button>
        </article>}

        {etape === 2 && <section className="co-pro-study">
            <p className="co-pro-kicker">Mise en situation</p><h1>Choisir sa posture d’intervention</h1><p className="co-pro-lead">{sequence.entrainement.situation}</p>
            <div className="co-pro-options">{sequence.entrainement.options.map((option, index) => <button key={option.id} aria-pressed={choixEntrainement === option.id} onClick={() => setChoixEntrainement(option.id)}><span>{String.fromCharCode(65 + index)}</span><p>{option.texte}</p></button>)}</div>
            {choix && <p className="co-pro-feedback" role="status">{choix.retour}</p>}
            <button className="co-pro-action" disabled={!choixEntrainement || isPending} onClick={passerALaVerification}>{isPending ? 'Enregistrement…' : 'Passer à la validation'} <ArrowRight size={18}/></button>
        </section>}

        {etape === 3 && <section className="co-pro-study">
            <p className="co-pro-kicker">Validation · {questionIndex + 1} / {sequence.questions.length}</p><h1>{question.question}</h1>
            {quizStatus && <p className="co-pro-feedback" role="status">{quizStatus}</p>}
            <div className="co-pro-options">{question.options.map((option, index) => <label key={option.id}><input type="radio" name={question.id} checked={answers[question.id] === option.id} onChange={() => setAnswers(previous => ({ ...previous, [question.id]: option.id }))}/><span>{String.fromCharCode(65 + index)}</span><p>{option.texte}</p></label>)}</div>
            {resultat && !('error' in resultat) && <p className="co-pro-feedback" role="status">{resultat.corrections.find(c => c.id === question.id)?.retour}</p>}
            <button className="co-pro-action" disabled={!answers[question.id] || isPending} onClick={questionIndex === sequence.questions.length - 1 ? verifier : () => setQuestionIndex(index => index + 1)}>{isPending ? 'Vérification…' : questionIndex === sequence.questions.length - 1 ? 'Valider mes réponses' : 'Question suivante'} <ArrowRight size={18}/></button>
        </section>}

        {etape === 4 && <section className="co-pro-study">
            {progression.mission?.completed ? <>
                <p className="co-pro-kicker">Parcours terminé</p><h1>Vous l’avez fait vivre</h1><p className="co-pro-lead">Vous avez mené cette situation avec un groupe. Ce sujet fait maintenant partie de ce que vous savez transmettre.</p>
                <div className="co-practice-end-actions"><Link href="/specialisation" className="co-pro-action">Choisir un autre parcours <ArrowRight size={18}/></Link><Link href="/stages/decouvrir" className="co-pro-secondary">Revoir les cartes de ce sujet</Link></div>
            </> : progression.mission || missionEnregistree ? <>
                {/* Plus de bouton « Je l'ai fait avec mon groupe » : personne ne revenait le
                    cliquer, et le parcours restait ouvert indéfiniment même après la sortie.
                    Le geste qui compte se fait sur la carte elle-même, dans la semaine — au
                    même endroit que le suivi de tous les autres sujets. */}
                <p className="co-pro-kicker">Votre essai</p><h1>C’est noté, à vous de jouer</h1><p className="co-pro-lead">Tentez-le lors d’une prochaine sortie. Une fois fait, marquez le sujet « Abordé » dans votre semaine : c’est ce qui termine le parcours.</p>
                <div className="co-practice-end-actions"><Link href={`/stages/${progression.mission?.stageId ?? stageId}/program`} className="co-pro-action">Marquer le sujet abordé <ArrowRight size={18}/></Link><Link href="/specialisation" className="co-pro-secondary">Fermer le parcours</Link></div>
            </> : practiceView === 'cards' ? <>
                <p className="co-pro-kicker">Votre essai</p><h1>Quel angle allez-vous prendre ?</h1><p className="co-pro-lead">Ces cartes-questions sont autant de manières d’entrer dans le sujet. Retenez-en une à trois à tenter lors d’une prochaine sortie.</p>
                <div className="co-practice-toolbar"><div><strong>{cardIds.length} / 3</strong><span>à essayer</span></div><button type="button" disabled={!cardIds.length} onClick={() => { setPracticeView('recap'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Voir ce que je vais essayer <ArrowRight size={16}/></button></div>
                {cartesProposees.length ? <FluxDecouverte pool={cartesProposees} mode="lecture" savedIds={cardIds} onToggleSaved={choisirCarte} initialChoices={choices} onChoiceChange={(id, choice) => setChoices(current => ({ ...current, [id]: choice }))} allowUse={false} /> : <p className="co-pro-feedback">Aucune carte n’est disponible pour le moment.</p>}
                <div className="co-practice-footer"><button type="button" className="co-pro-secondary" disabled={!cardIds.length} onClick={() => { setPracticeView('recap'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Continuer avec {cardIds.length || 0} carte{cardIds.length > 1 ? 's' : ''}</button><Link href="/specialisation" className="co-pro-quiet">Fermer le parcours</Link></div>
            </> : <>
                <p className="co-pro-kicker">Votre essai</p><h1>Ce que vous allez tenter</h1><p className="co-pro-lead">Voici, pour chaque carte, ce que vous cherchez à faire passer et comment le lancer sur le terrain.</p>
                <div className="co-practice-objectives">{cartesChoisies.map(card => {
                    const choice = resolveCardChoice(card, choices[card.id]);
                    const action = card.actions?.find(item => item.id === choice.actionId);
                    return <article key={card.id}>
                        <span>{card.dimension}</span><h2>{card.question}</h2>
                        <p><strong>Je lance le sujet</strong>« {choice.accroche} »</p>
                        {action && <p><strong>{action.label}</strong>{action.consigne}</p>}
                        {card.a_retenir && <p><strong>L’idée à retenir</strong>{card.a_retenir}</p>}
                    </article>;
                })}</div>
                <button type="button" className="co-pro-secondary" onClick={() => { setPracticeView('cards'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Changer de carte</button>
                <label className="co-pro-note-label" htmlFor="practice-stage">Avec quel groupe ?</label><select id="practice-stage" className="co-pro-stage-select" value={stageId} onChange={event => setStageId(event.target.value)}><option value="">Choisir une semaine</option>{stages.filter(stage => !stage.closed_at).map(stage => <option key={stage.id} value={stage.id}>{stage.title}</option>)}</select>
                <button className="co-pro-action" disabled={!stageId || !cardIds.length || isPending} onClick={ajouterMission}>{isPending ? 'Enregistrement…' : 'Noter cet essai'} <ArrowRight size={18}/></button><Link href="/specialisation" className="co-pro-quiet">Fermer le parcours</Link>
                {cardIds.length > 0 && <button type="button" disabled={isPending} onClick={creerSemaine} className="co-pro-secondary">Créer une semaine pour cet essai</button>}
            </>}
        </section>}
    </div>;
}
