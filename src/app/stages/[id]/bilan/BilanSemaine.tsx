'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import clsx from 'clsx';
import { closeStage, saveObjectiveStatus } from '@/actions/stage-actions';
import { RESSENTI_OPTIONS, RESSENTI_RAISONS, type RessentiNiveau, type StageRessenti } from '@/lib/stage-ressenti';
import type { StageObjectiveExecutionStatus } from '@/types';

export type SujetBilan = { id: string; question: string; statut: StageObjectiveExecutionStatus };
export type ActionBilan = { id: string; label: string; question: string };

const ETATS: { valeur: StageObjectiveExecutionStatus; libelle: string }[] = [
    { valeur: 'not_done', libelle: 'Pas encore' },
    { valeur: 'partial', libelle: 'Effleuré' },
    { valeur: 'done', libelle: 'Abordé' },
];

/**
 * Bilan d'une semaine : la même page sert à clôturer (semaine ouverte) puis à relire
 * (semaine archivée).
 *
 * Il reprend ce que l'application sait déjà au lieu de le redemander : les sujets tels que
 * le moniteur les a notés dans Mes séances, le vote du goûter (affirmations justes, actions
 * confirmées par les enfants à la caméra) et le nombre d'enfants compté par les cartons.
 * Ne reste à saisir que ce que lui seul sait : son ressenti, et un mémo.
 */
export function BilanSemaine({
    stageId, titre, dates, clos, dateCloture, avertissement, sujets, vote, actions,
    ressenti, nbStagiaires, memo, badge, children,
}: {
    /** Blocs complémentaires rendus par le serveur (retours terrain, réouverture). */
    children?: React.ReactNode;
    stageId: string;
    titre: string;
    dates: string;
    clos: boolean;
    dateCloture: string | null;
    avertissement: string | null;
    sujets: SujetBilan[];
    vote: { fait: boolean; score: number; total: number; participants: number | null };
    actions: ActionBilan[];
    ressenti: StageRessenti | null;
    nbStagiaires: number | null;
    memo: string;
    badge: string | null;
}) {
    const router = useRouter();
    const [statuts, setStatuts] = useState(() => Object.fromEntries(sujets.map(s => [s.id, s.statut])));
    const [niveau, setNiveau] = useState<RessentiNiveau | null>(ressenti?.niveau ?? null);
    const [raisons, setRaisons] = useState<string[]>(ressenti?.raisons ?? []);
    // Prérempli par les cartons lus au quiz ; le moniteur corrige si un enfant manquait.
    const [stagiaires, setStagiaires] = useState(String(nbStagiaires ?? vote.participants ?? ''));
    const [note, setNote] = useState(memo);
    const [erreur, setErreur] = useState<string | null>(null);
    const [envoi, setEnvoi] = useState(false);
    const [, startTransition] = useTransition();

    const abordes = sujets.filter(s => statuts[s.id] !== 'not_done').length;
    const stagiairesValide = Number(stagiaires) >= 1;

    const changerStatut = (id: string, valeur: StageObjectiveExecutionStatus) => {
        const avant = statuts[id];
        setStatuts(courant => ({ ...courant, [id]: valeur }));
        startTransition(async () => {
            const resultat = await saveObjectiveStatus(stageId, id, valeur);
            if (!resultat.success) setStatuts(courant => ({ ...courant, [id]: avant }));
        });
    };

    const cloturer = async () => {
        if (!niveau) { setErreur('Dites en un mot comment s’est passée la semaine.'); return; }
        if (!stagiairesValide) { setErreur('Indiquez le nombre de stagiaires.'); return; }
        setEnvoi(true); setErreur(null);
        try {
            const resultat = await closeStage(stageId, { closingNotes: note, ressenti: { niveau, raisons, note: '' }, nbStagiaires: Number(stagiaires) });
            if (!resultat.success) { setErreur(resultat.error ?? 'Clôture impossible.'); return; }
            router.refresh();
        } catch { setErreur('Clôture impossible. Réessayez.'); } finally { setEnvoi(false); }
    };

    const optionRessenti = RESSENTI_OPTIONS.find(o => o.value === niveau);

    return <main className="co-page mx-auto max-w-2xl pb-36">
        <Link href="/stages/semaines" className="co-field-back">← Mes séances</Link>
        <header className="mt-4 mb-8">
            <p className="co-surtitre">Bilan de la semaine</p>
            <h1 className="mt-2 text-titre font-semibold tracking-[-.04em] text-encre">{titre}</h1>
            <p className="mt-1 text-note text-discret">{dates}{clos && dateCloture ? ` · clôturée le ${dateCloture}` : ''}</p>
            {avertissement && !clos && <p className="mt-4 rounded-bloc bg-sable/60 px-4 py-3 text-note font-semibold text-encre">{avertissement}</p>}
            {badge && <p className="mt-4 rounded-bloc bg-sable px-4 py-3 text-note text-encre"><strong>Badge obtenu : {badge}</strong> — il apparaît dans votre profil.</p>}
        </header>

        {/* Les sujets, tels que notés dans Mes séances — modifiables tant que la semaine est ouverte. */}
        {sujets.length > 0 && <section className="mb-10">
            <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-intertitre font-semibold text-encre">Ce qui a été abordé</h2>
                <span className="text-note font-semibold text-discret">{abordes} sur {sujets.length}</span>
            </div>
            <ul className="divide-y divide-filet rounded-carte bg-carte px-4 ring-1 ring-filet">
                {sujets.map(sujet => <li key={sujet.id} className="py-4">
                    <p className="text-corps font-semibold leading-snug text-encre">{sujet.question}</p>
                    {clos
                        ? <span className={clsx('mt-2 inline-block rounded-full px-2.5 py-0.5 text-note font-semibold',
                            statuts[sujet.id] === 'done' ? 'bg-sable text-encre' : statuts[sujet.id] === 'partial' ? 'ring-1 ring-sable text-encre' : 'text-discret ring-1 ring-filet')}>
                            {ETATS.find(e => e.valeur === statuts[sujet.id])?.libelle}
                        </span>
                        : <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Où j’en suis sur ce sujet">
                            {ETATS.map(etat => <button key={etat.valeur} type="button" aria-pressed={statuts[sujet.id] === etat.valeur}
                                onClick={() => changerStatut(sujet.id, etat.valeur)}
                                className={clsx('min-h-8 rounded-full px-3 text-note font-semibold transition',
                                    statuts[sujet.id] === etat.valeur ? 'bg-encre text-carte' : 'text-discret ring-1 ring-filet hover:bg-papier')}>
                                {etat.libelle}
                            </button>)}
                        </div>}
                </li>)}
            </ul>
        </section>}

        {/* Le vote du goûter : la seule preuve qui vient du groupe lui-même. */}
        <section className="mb-10">
            <h2 className="mb-3 text-intertitre font-semibold text-encre">Ce que le groupe a confirmé</h2>
            {vote.fait ? <div className="rounded-carte bg-encre px-5 py-5 text-carte">
                {vote.total > 0 && <p className="text-corps"><strong className="text-[26px] font-semibold tracking-[-.03em]">{vote.score} / {vote.total}</strong> affirmations justes</p>}
                {vote.participants && <p className="mt-1 text-note text-carte/70">{vote.participants} enfants ont voté, comptés par la caméra</p>}
                {actions.length > 0 ? <ul className="mt-4 space-y-2.5 border-t border-carte/15 pt-4">
                    {actions.map(action => <li key={action.id}>
                        <p className="text-corps font-semibold leading-snug">✓ {action.label}</p>
                        <p className="text-note text-carte/60">{action.question}</p>
                    </li>)}
                </ul> : <p className="mt-4 border-t border-carte/15 pt-4 text-note text-carte/70">Aucune action confirmée par le groupe cette semaine.</p>}
            </div> : <div className="rounded-carte bg-carte px-5 py-5 ring-1 ring-filet">
                <p className="text-corps text-encre-douce">Le quiz de fin n’a pas encore été fait. C’est lui qui fait confirmer les actions par les enfants, au goûter.</p>
                {!clos && <Link href={`/stages/${stageId}/quiz`} className="mt-4 inline-flex min-h-11 items-center rounded-full bg-encre px-5 text-note font-bold text-carte">Faire le quiz de fin</Link>}
            </div>}
        </section>

        {/* Ce que seul le moniteur sait. */}
        <section className="mb-10">
            <h2 className="mb-1 text-intertitre font-semibold text-encre">Dans l’ensemble</h2>
            <p className="mb-3 text-corps text-encre-douce">Avez-vous pu raconter ce que vous aviez prévu ?</p>
            {clos
                ? <div className="rounded-carte bg-carte px-5 py-4 ring-1 ring-filet">
                    <p className="text-corps font-semibold text-encre">{optionRessenti?.label ?? 'Non renseigné'}</p>
                    {raisons.length > 0 && <p className="mt-1 text-note text-discret">{raisons.join(' · ')}</p>}
                </div>
                : <>
                    <div className="grid gap-2">
                        {RESSENTI_OPTIONS.map(option => <button key={option.value} type="button" aria-pressed={niveau === option.value}
                            onClick={() => { setNiveau(option.value); setRaisons([]); }}
                            className={clsx('rounded-carte px-4 py-3.5 text-left transition',
                                niveau === option.value ? 'bg-encre text-carte' : 'bg-carte text-encre ring-1 ring-filet hover:bg-white')}>
                            <span className="block text-corps font-semibold">{option.label}</span>
                            <span className={clsx('block text-note', niveau === option.value ? 'text-carte/70' : 'text-discret')}>{option.helper}</span>
                        </button>)}
                    </div>
                    {niveau && <div className="mt-4">
                        <p className="co-intertitre mb-2">Pourquoi, en quelques mots ? (facultatif)</p>
                        <div className="flex flex-wrap gap-1.5">
                            {RESSENTI_RAISONS[niveau].map(raison => <button key={raison} type="button" aria-pressed={raisons.includes(raison)}
                                onClick={() => setRaisons(courant => courant.includes(raison) ? courant.filter(r => r !== raison) : [...courant, raison])}
                                className={clsx('min-h-9 rounded-full px-3 text-note font-semibold transition',
                                    raisons.includes(raison) ? 'bg-sable text-encre' : 'bg-carte text-encre-douce ring-1 ring-filet')}>
                                {raison}
                            </button>)}
                        </div>
                    </div>}
                </>}
        </section>

        <section className="mb-10">
            <h2 className="mb-1 text-intertitre font-semibold text-encre">Stagiaires</h2>
            {clos
                ? <p className="text-corps text-encre-douce">{nbStagiaires ?? '—'} stagiaires cette semaine</p>
                : <>
                    <p className="mb-3 text-note text-discret">{vote.participants ? 'Compté par la caméra au quiz de fin. Corrigez si un enfant était absent.' : 'Combien d’enfants avaient votre groupe cette semaine ?'}</p>
                    <input type="number" inputMode="numeric" min={1} max={999} value={stagiaires} onChange={e => setStagiaires(e.target.value)} placeholder="ex. 12"
                        className="h-12 w-32 rounded-bloc bg-carte px-4 text-corps font-semibold text-encre ring-1 ring-filet focus:outline-none focus:ring-2 focus:ring-encre"/>
                </>}
        </section>

        <section className="mb-10">
            <h2 className="mb-3 text-intertitre font-semibold text-encre">Mémo</h2>
            {clos
                ? <p className="whitespace-pre-wrap rounded-carte bg-carte px-5 py-4 text-corps text-encre-douce ring-1 ring-filet">{note.trim() || 'Pas de mémo pour cette semaine.'}</p>
                : <textarea value={note} onChange={e => setNote(e.target.value)} rows={4}
                    placeholder="Ce qui a bien marché, ce qui a bloqué, une idée pour la prochaine fois…"
                    className="w-full resize-none rounded-carte bg-carte px-5 py-4 text-corps text-encre ring-1 ring-filet placeholder:text-discret/60 focus:outline-none focus:ring-2 focus:ring-encre"/>}
        </section>

        {children}

        {erreur && <p role="alert" className="mb-4 text-note font-semibold text-terracotta">{erreur}</p>}

        {!clos && <div className="fixed above-nav inset-x-0 z-30 px-4 pb-3">
            <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-carte bg-carte/95 p-3 shadow-flottant ring-1 ring-filet backdrop-blur">
                <p className="flex-1 text-note text-discret">{!niveau ? 'Un mot sur la semaine avant de clôturer' : !stagiairesValide ? 'Indiquez le nombre de stagiaires' : !vote.fait ? 'Quiz pas fait : clôture possible quand même' : 'Prêt à clôturer'}</p>
                <button type="button" onClick={cloturer} disabled={envoi || !niveau || !stagiairesValide}
                    className="min-h-11 rounded-full bg-encre px-5 text-note font-bold text-carte transition disabled:opacity-40">
                    {envoi ? 'Clôture…' : 'Clôturer la semaine'}
                </button>
            </div>
        </div>}
    </main>;
}
