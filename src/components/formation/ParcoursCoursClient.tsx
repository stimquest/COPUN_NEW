'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { SequenceProgress } from '@/actions/parcours-formation-actions';
import { marquerSequenceParcourue, verifierAcquisSequence } from '@/actions/parcours-formation-actions';
import type { ParcoursFormation } from '@/data/parcours-formation';
import { getOccasionsTerrain } from '@/data/parcours-terrain';
import { parcoursTermine, type ResultatQuiz } from '@/lib/parcours-cours';

export function ParcoursCoursClient({ sequence, progression, vueInitiale }: { sequence: ParcoursFormation; progression: SequenceProgress; vueInitiale?: 'quiz' }) {
    const router = useRouter();
    const [vue, setVue] = useState<'intro' | 'cours' | 'quiz' | 'bilan'>(() => vueInitiale ?? (parcoursTermine(progression) ? 'bilan' : 'intro'));
    const [ficheIndex, setFicheIndex] = useState(0);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [resultat, setResultat] = useState<ResultatQuiz | null>(null);
    const [termine, setTermine] = useState(() => parcoursTermine(progression));
    const [retourBilan, setRetourBilan] = useState(false);
    const [error, setError] = useState('');
    const [isPending, startTransition] = useTransition();
    const titreRef = useRef<HTMLHeadingElement>(null);
    const fiche = sequence.fiches[ficheIndex];
    const occasionsTerrain = getOccasionsTerrain(sequence.id, fiche.titre);
    const question = sequence.questions[questionIndex];
    const total = sequence.fiches.length + sequence.questions.length;
    const position = vue === 'intro' ? 0 : vue === 'cours' ? ficheIndex + 1 : vue === 'quiz' ? sequence.fiches.length + questionIndex + 1 : total;
    useEffect(() => {
        window.scrollTo({ top: 0 });
        titreRef.current?.focus({ preventScroll: true });
    }, [vue, ficheIndex, questionIndex]);

    function revoir(index = 0, depuisBilan = false) {
        setError(''); setFicheIndex(index); setRetourBilan(depuisBilan); setVue('cours');
    }
    function commencerQuiz() {
        startTransition(async () => {
            setError('');
            try {
                const response = await marquerSequenceParcourue(sequence.id);
                if (response.error) { setError('La lecture n’a pas pu être enregistrée. Réessayez.'); return; }
                setAnswers({}); setResultat(null); setQuestionIndex(0); setRetourBilan(false); setVue('quiz');
            } catch { setError('Connexion interrompue. Réessayez.'); }
        });
    }
    function verifier() {
        startTransition(async () => {
            setError('');
            try {
                const response = await verifierAcquisSequence({ sequenceId: sequence.id, answers });
                if ('error' in response) { setError(response.error ?? 'Le quiz n’a pas pu être enregistré.'); return; }
                setResultat(response); setTermine(previous => previous || response.valide); setVue('bilan');
                router.refresh();
            } catch { setError('Connexion interrompue. Vos réponses sont conservées ; réessayez.'); }
        });
    }
    function precedent() {
        setError('');
        if (vue === 'cours') {
            if (ficheIndex > 0) setFicheIndex(index => index - 1);
            else setVue(retourBilan ? 'bilan' : 'intro');
        } else if (vue === 'quiz') {
            if (questionIndex > 0) setQuestionIndex(index => index - 1);
            else { setRetourBilan(false); setFicheIndex(sequence.fiches.length - 1); setVue('cours'); }
        }
    }
    return <div className="co-pro-lesson co-course-reader">
        <header className="co-pro-lesson-head">
            {vue === 'intro' || vue === 'bilan'
                ? <Link href="/specialisation" aria-label="Retour aux parcours" className="co-pro-back"><span className="material-symbols-outlined" aria-hidden>arrow_back</span></Link>
                : <button type="button" disabled={isPending} onClick={precedent} aria-label="Revenir en arrière" className="co-pro-back"><span className="material-symbols-outlined" aria-hidden>arrow_back</span></button>}
            <div><p>Parcours environnement</p><strong>{sequence.titre}</strong></div>
            <span>{vue === 'cours' ? `${ficheIndex + 1} / ${sequence.fiches.length}` : vue === 'quiz' ? `${questionIndex + 1} / ${sequence.questions.length}` : sequence.duree}</span>
        </header>
        <div className="co-pro-progress" role="progressbar" aria-label="Avancement de la lecture et du quiz" aria-valuemin={0} aria-valuemax={total} aria-valuenow={position}><span style={{ width: `${position / total * 100}%` }}/></div>
        {error && <p role="alert" className="co-pro-feedback">{error}</p>}

        {vue === 'intro' && <section className="co-pro-intro">
            <p className="co-pro-kicker">Des clés pour transmettre · {sequence.duree}</p>
            <h1 ref={titreRef} tabIndex={-1}>{sequence.titre}</h1>
            <p className="co-pro-lead">{sequence.objectif}</p>
            <ol className="co-course-plan">{sequence.fiches.map((item, index) => <li key={item.titre}><span>{index + 1}</span>{item.titre}</li>)}</ol>
            <p className="co-course-note">Vos bases de pratique sont le point de départ. Ces {sequence.fiches.length} fiches proposent des angles et des formulations à adapter à votre groupe, puis {sequence.questions.length} situations pour choisir comment aborder le sujet. Vous pouvez réessayer le quiz.</p>
            <button type="button" className="co-pro-action" onClick={() => revoir()}>Lire les fiches <span className="material-symbols-outlined" aria-hidden>arrow_forward</span></button>
            {progression.parcouru && <button type="button" className="co-pro-quiet" disabled={isPending} onClick={commencerQuiz}>Reprendre le quiz</button>}
        </section>}

        {vue === 'cours' && <article className="co-pro-study">
            <p className="co-pro-kicker">Fiche {ficheIndex + 1} / {sequence.fiches.length}</p>
            <h1 ref={titreRef} tabIndex={-1}>{fiche.titre}</h1>
            <p className="co-pro-lead">{fiche.angle}</p>
            <div className="co-course-terrain"><h2>Une formulation possible</h2><blockquote><p>« {fiche.formulation} »</p></blockquote></div>
            <section key={`${sequence.id}-${ficheIndex}`} className="co-course-terrain" aria-label="Sur le terrain">
                <h2>Sur le terrain</h2>
                <p className="co-terrain-principal">{fiche.terrain}</p>
                {occasionsTerrain.length > 0 && <>
                    <p>{occasionsTerrain.length === 1 ? 'Une autre occasion, selon votre séance :' : 'D’autres occasions, selon votre séance :'}</p>
                    {occasionsTerrain.map(occasion => <div key={occasion.moment} className="co-terrain-occasion mt-4">
                        <h3 className="text-corps font-semibold text-encre">{occasion.moment}</h3>
                        <p>{occasion.proposition}</p>
                    </div>)}
                </>}
            </section>
            <section className="co-course-terrain co-course-explication" aria-label="Un appui pour l’explication">
                <h2>Un appui pour l’explication</h2>
                <p>{fiche.texte}</p>
            </section>
            <aside><strong>L’idée à faire passer</strong><p>{fiche.retenir}</p></aside>
            <button type="button" className="co-pro-action" disabled={isPending} onClick={() => {
                if (retourBilan) { setVue('bilan'); setRetourBilan(false); }
                else if (ficheIndex < sequence.fiches.length - 1) setFicheIndex(index => index + 1);
                else commencerQuiz();
            }}>{isPending ? 'Enregistrement…' : retourBilan ? 'Revenir à la correction' : ficheIndex === sequence.fiches.length - 1 ? 'Passer au quiz' : 'Fiche suivante'}<span className="material-symbols-outlined" aria-hidden>arrow_forward</span></button>
        </article>}

        {vue === 'quiz' && <section className="co-pro-study">
            <p className="co-pro-kicker">Quiz final · {questionIndex + 1} / {sequence.questions.length}</p>
            <h1 ref={titreRef} tabIndex={-1}>{question.question}</h1>
            <fieldset className="co-pro-options"><legend className="sr-only">Choisissez une réponse</legend>{question.options.map((option, index) => <label key={option.id}>
                <input type="radio" name={question.id} disabled={isPending} checked={answers[question.id] === option.id} onChange={() => setAnswers(previous => ({ ...previous, [question.id]: option.id }))}/>
                <span aria-hidden>{String.fromCharCode(65 + index)}</span><p>{option.texte}</p>
            </label>)}</fieldset>
            <p className="co-course-note">La correction sera affichée à la fin. Vous pouvez revenir sur vos réponses.</p>
            <button type="button" className="co-pro-action" disabled={isPending || !answers[question.id]} onClick={questionIndex === sequence.questions.length - 1 ? verifier : () => setQuestionIndex(index => index + 1)}>{isPending ? 'Vérification…' : questionIndex === sequence.questions.length - 1 ? 'Voir mon résultat' : 'Question suivante'}<span className="material-symbols-outlined" aria-hidden>arrow_forward</span></button>
        </section>}

        {vue === 'bilan' && <section className="co-pro-study">
            <p className="co-pro-kicker">{resultat && !resultat.valide ? 'Correction du quiz' : 'Parcours terminé'}</p>
            <h1 ref={titreRef} tabIndex={-1}>{resultat ? `${resultat.score} / ${resultat.total} réponses justes` : 'Des clés pour parler d’environnement sur le terrain'}</h1>
            <p className="co-pro-lead">{resultat && !resultat.valide
                ? termine ? 'Votre parcours reste terminé. Cet essai vous indique les notions à revoir.' : 'Quelques notions restent à revoir. Lisez les corrections, puis retentez le quiz pour terminer le parcours.'
                : 'Vous avez travaillé des façons de relier votre pratique sportive au milieu. Choisissez une formulation ou une question à essayer avec votre groupe pendant une prochaine séance.'}</p>
            {resultat && <div className="co-course-corrections">{resultat.corrections.map((correction, index) => {
                const item = sequence.questions[index];
                return <article key={correction.id} className={`co-pro-correction ${correction.correct ? 'is-juste' : 'is-faux'}`}>
                    <h2>{index + 1}. {item.question}</h2><p className="co-pro-correction-verdict">{correction.correct ? 'Bonne réponse' : 'À revoir'}</p>
                    <p>Votre réponse : {item.options.find(option => option.id === answers[item.id])?.texte}</p>
                    {!correction.correct && <p><strong>Réponse juste : </strong>{item.options.find(option => option.id === item.correct)?.texte}</p>}
                    <p>{correction.retour}</p>
                    {!correction.correct && <button type="button" onClick={() => revoir(correction.ficheIndex, true)}>Relire la fiche concernée</button>}
                </article>;
            })}</div>}
            {resultat && !resultat.valide && <button type="button" className="co-pro-action" disabled={isPending} onClick={commencerQuiz}>{isPending ? 'Enregistrement…' : 'Retenter le quiz'}<span className="material-symbols-outlined" aria-hidden>refresh</span></button>}
            {termine && <Link href="/stages/decouvrir" className="co-pro-action">Explorer les cartes pour en parler<span className="material-symbols-outlined" aria-hidden>arrow_forward</span></Link>}
            <button type="button" className="co-pro-quiet" onClick={() => revoir()}>Relire le cours</button>
            {termine && (!resultat || resultat.valide) && <button type="button" className="co-pro-quiet" disabled={isPending} onClick={commencerQuiz}>Refaire le quiz</button>}
            <div className="co-course-resources"><h2>Pour approfondir dans le wiki</h2>{sequence.ressources.map(ressource => <Link key={ressource.id} href={`/ressources/${ressource.id}?retour=${encodeURIComponent(`/specialisation/parcours/${sequence.id}`)}`}>{ressource.titre}<span className="material-symbols-outlined" aria-hidden>arrow_forward</span></Link>)}
                {sequence.sources?.map(source => <a key={source.href} href={source.href} target="_blank" rel="noopener noreferrer">{source.titre}<span className="material-symbols-outlined" aria-hidden>open_in_new</span></a>)}
            </div>
            <Link href="/specialisation" className="co-pro-quiet">Retour aux parcours</Link>
        </section>}
    </div>;
}
