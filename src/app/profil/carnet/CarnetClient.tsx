'use client';

import { useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import type { PracticeJournal, JournalWeek, FormationPracticeNote, EvolutionBilans } from '@/services/practice-journal';
import type { RessentiNiveau } from '@/lib/stage-ressenti';

/*
 * Le carnet ne garde que ce qui s'appuie sur des données encore collectées : l'évolution
 * des bilans (ressenti et raisons), le fil des semaines avec leur mémo, et les essais
 * notés pendant les parcours. Les anciennes sections « fort impact », « Ça résiste » et
 * « notes de bilan » reposaient sur la notation fiche par fiche, supprimée du bilan.
 */

function dateCourte(date: string) {
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function EssaiParcours({ entry }: { entry: FormationPracticeNote }) {
    const titre = entry.sequenceId === 'laisse-de-mer' ? 'La laisse de mer' : entry.sequenceId;
    return <article className="rounded-carte bg-carte px-5 py-4 ring-1 ring-filet">
        <div className="flex items-baseline justify-between gap-3">
            <p className="text-corps font-semibold text-encre">{titre}</p>
            <p className="shrink-0 text-note text-discret">{dateCourte(entry.createdAt)}</p>
        </div>
        <p className="mt-2 text-corps italic text-encre-douce">« {entry.note} »</p>
    </article>;
}

function SemaineDuFil({ week }: { week: JournalWeek }) {
    return <article className="rounded-carte bg-carte px-5 py-4 ring-1 ring-filet">
        <div className="flex items-baseline justify-between gap-3">
            <Link href={`/stages/${week.id}/bilan`} className="min-w-0 truncate text-corps font-semibold text-encre underline-offset-4 hover:underline">{week.title}</Link>
            <p className="shrink-0 text-note text-discret">{dateCourte(week.closedAt)}</p>
        </div>
        <p className="mt-1 text-note text-discret">{week.workedCount} sujet{week.workedCount > 1 ? 's' : ''} abordé{week.workedCount > 1 ? 's' : ''} sur {week.totalCount}</p>
        {week.closingNote && <p className="mt-3 border-l-2 border-sable pl-3 text-corps italic text-encre-douce">{week.closingNote}</p>}
    </article>;
}

// ── Évolution des bilans ─────────────────────────────────────────────────────

const NIVEAUX_BILAN: Record<RessentiNiveau, { libelle: string; hauteur: string; couleur: string; score: number }> = {
    largement: { libelle: 'Oui, largement', hauteur: 'h-14', couleur: 'bg-encre', score: 2 },
    en_partie: { libelle: 'En partie', hauteur: 'h-9', couleur: 'bg-sable', score: 1 },
    pas_vraiment: { libelle: 'Pas vraiment', hauteur: 'h-4', couleur: 'bg-terracotta/60', score: 0 },
};

/** Compare les dernières semaines aux premières, pour dire la tendance en une phrase. */
function tendance(semaines: EvolutionBilans['semaines']): string | null {
    if (semaines.length < 4) return null;
    const moitie = Math.floor(semaines.length / 2);
    const moyenne = (liste: typeof semaines) => liste.reduce((t, s) => t + NIVEAUX_BILAN[s.niveau].score, 0) / liste.length;
    const avant = moyenne(semaines.slice(0, moitie)), apres = moyenne(semaines.slice(-moitie));
    if (apres - avant >= 0.4) return 'Vos dernières semaines se passent mieux que les premières.';
    if (avant - apres >= 0.4) return 'Vos dernières semaines ont été plus difficiles que les premières.';
    return 'Vos semaines se passent de façon assez régulière.';
}

/**
 * Ce que les bilans racontent dans la durée : le ressenti de chaque semaine, puis les
 * raisons cochées, comptées. Un frein qui revient au moins deux fois est mis en avant
 * avec une piste pour la prochaine préparation.
 */
function EvolutionDesBilans({ bilans }: { bilans: EvolutionBilans }) {
    const phrase = tendance(bilans.semaines);
    const freinPrincipal = bilans.freins.find(f => f.fois >= 2 && f.conseil);
    return <section className="space-y-6">
        <div>
            <h2 className="mb-1 text-intertitre font-semibold text-encre">Mes bilans, semaine après semaine</h2>
            <p className="mb-4 text-note text-discret">Avez-vous pu raconter ce que vous aviez prévu ?</p>
            <div className="rounded-carte bg-carte p-4 ring-1 ring-filet">
                <div className="flex h-16 items-end gap-1.5 overflow-x-auto">
                    {bilans.semaines.map(s => <span key={s.id} title={`${s.titre} : ${NIVEAUX_BILAN[s.niveau].libelle}`}
                        className={clsx('w-5 shrink-0 rounded-t-md', NIVEAUX_BILAN[s.niveau].hauteur, NIVEAUX_BILAN[s.niveau].couleur)}/>)}
                </div>
                <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-note text-discret">
                    {(Object.keys(NIVEAUX_BILAN) as RessentiNiveau[]).map(n => <span key={n} className="inline-flex items-center gap-1.5">
                        <span className={clsx('size-2.5 rounded-sm', NIVEAUX_BILAN[n].couleur)}/>{NIVEAUX_BILAN[n].libelle}
                    </span>)}
                </p>
                {phrase && <p className="mt-3 border-t border-filet pt-3 text-corps text-encre">{phrase}</p>}
            </div>
        </div>

        {freinPrincipal && <div className="rounded-carte bg-sable px-5 py-4">
            <p className="text-note font-semibold text-encre">Revient {freinPrincipal.fois} fois : {freinPrincipal.raison.toLowerCase()}</p>
            <p className="mt-1 text-corps text-encre">{freinPrincipal.conseil}</p>
        </div>}

        {(bilans.leviers.length > 0 || bilans.freins.length > 0) && <div className="grid gap-4 sm:grid-cols-2">
            {bilans.leviers.length > 0 && <div>
                <h3 className="co-intertitre mb-2">Ce qui vous aide</h3>
                <ul className="space-y-1.5">{bilans.leviers.map(l => <li key={l.raison} className="flex items-baseline justify-between gap-3 text-corps text-encre">
                    <span>{l.raison}</span><span className="shrink-0 text-note font-semibold text-discret">× {l.fois}</span>
                </li>)}</ul>
            </div>}
            {bilans.freins.length > 0 && <div>
                <h3 className="co-intertitre mb-2">Ce qui vous freine</h3>
                <ul className="space-y-1.5">{bilans.freins.map(f => <li key={f.raison} className="flex items-baseline justify-between gap-3 text-corps text-encre">
                    <span>{f.raison}</span><span className="shrink-0 text-note font-semibold text-discret">× {f.fois}</span>
                </li>)}</ul>
            </div>}
        </div>}
    </section>;
}


export function CarnetClient({ journal }: { journal: PracticeJournal }) {
    const [toutes, setToutes] = useState(false);
    const semaines = toutes ? journal.weeks : journal.weeks.slice(0, 5);
    return <div className="space-y-10">
        {journal.bilans && <EvolutionDesBilans bilans={journal.bilans}/>}

        {journal.weeks.length > 0 && <section>
            <h2 className="mb-3 text-intertitre font-semibold text-encre">Le fil de mes semaines</h2>
            <div className="space-y-2.5">{semaines.map(week => <SemaineDuFil key={week.id} week={week}/>)}</div>
            {!toutes && journal.weeks.length > 5 && <button type="button" onClick={() => setToutes(true)}
                className="mt-2 w-full py-2.5 text-note font-semibold text-discret hover:text-encre">
                Voir les {journal.weeks.length - 5} semaines plus anciennes
            </button>}
        </section>}

        {journal.formationNotes.length > 0 && <section>
            <h2 className="mb-3 text-intertitre font-semibold text-encre">Mes essais pendant les parcours</h2>
            <div className="space-y-2.5">{journal.formationNotes.map(entry => <EssaiParcours key={entry.id} entry={entry}/>)}</div>
        </section>}
    </div>;
}
