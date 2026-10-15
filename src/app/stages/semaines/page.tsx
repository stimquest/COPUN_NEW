import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { getPedagogicalPool, getStageObjectiveReviewItems, getStages } from '@/services/data-service';
import { DeleteStageButton } from '@/components/DeleteStageButton';
import { calendarWeek, parseStageDateRange } from '@/lib/stage-dates';
import type { PedagogicalContent, Stage } from '@/types';
import { WeekObjectiveTracker } from './WeekObjectiveTracker';
import { getResumeVote } from '@/actions/vote-actions';
import { getStagePreparations, type StagePreparation } from '@/actions/preparation-actions';
import { formulationsFiche } from '@/data/formulations-fiche';
import { FORMES_ACCROCHE } from '@/data/formes-accroche';
import { ensureCalendarWeek } from '@/lib/calendar-week';
import { notFound, redirect } from 'next/navigation';
import { weekHref } from '@/lib/week-navigation';
import WeekOrganizer from '@/components/explorer/WeekOrganizer';

import { iconeMaterial } from '@/components/ui/Icone';
const ArrowRight = iconeMaterial('arrow_forward');
const Compass = iconeMaterial('explore');
const NotebookPen = iconeMaterial('edit_note');
const Plus = iconeMaterial('add');

type WeekWithCards = Stage & { cards: PedagogicalContent[] };

function WeekRow({ week, state }: { week: WeekWithCards; state: 'future' | 'late' | 'archive' }) {
    const href = state === 'late' || state === 'archive' ? `/stages/${week.id}/bilan` : weekHref(week.id);
    const action = state === 'late' ? 'Revenir sur la semaine' : state === 'archive' ? 'Voir le bilan' : 'Ouvrir la semaine';

    return <article className={`co-week-row co-week-row-${state}`}>
        <Link href={href} className="co-week-row-main">
            <div>
                <span className="co-eyebrow">{week.dates}</span>
                <h3>{week.title}</h3>
                <p>{week.cards.length ? `${week.cards.length} carte${week.cards.length > 1 ? 's' : ''} à faire vivre` : 'Aucune carte choisie'}</p>
            </div>
            <span className="co-week-row-action">{action} <ArrowRight size={16}/></span>
        </Link>
        {state !== 'archive' && <DeleteStageButton stageId={week.id} size="sm"/>}
    </article>;
}

export default async function SemainesPage({ searchParams }: { searchParams: Promise<{ semaine?: string; mode?: string; carte?: string }> }) {
    const { semaine, mode, carte } = await searchParams;
    noStore();
    const currentWeek = await ensureCalendarWeek();
    if (!currentWeek) redirect('/login');
    const [stages, pool] = await Promise.all([getStages(), getPedagogicalPool(true)]);
    const cardsById = new Map(pool.map(card => [card.id, card]));
    const weeks: WeekWithCards[] = stages.map(stage => ({
        ...stage,
        cards: (stage.selected_content ?? []).map(id => cardsById.get(id)).filter((card): card is PedagogicalContent => Boolean(card)),
    }));

    const now = new Date();
    const open = weeks.filter(week => !week.closed_at);
    const active = weeks.find(week => week.id === (semaine ?? currentWeek.id)) ?? (!semaine ? { ...currentWeek, cards: [] } : null);
    if (!active) notFound();
    const homeHref = weekHref(active.id);
    const nextWeek = !!active.calendar_week_start && active.calendar_week_start > calendarWeek().start;
    const otherWeek = active.id !== currentWeek.id;
    const remaining = open.filter(week => week.id !== active?.id);
    const late = remaining.filter(week => {
        const range = parseStageDateRange(week.dates, now);
        return range ? range.end.getTime() < now.getTime() && (!week.calendar_week_start || week.cards.length > 0) : false;
    });
    const future = remaining.filter(week => { const range = parseStageDateRange(week.dates, now); return range && range.start > now; });
    const archived = weeks.filter(week => Boolean(week.closed_at) && week.id !== active.id);
    const [activeObjectives, vote, preparations] = active
        ? await Promise.all([getStageObjectiveReviewItems(active.id), getResumeVote(active.id), getStagePreparations(active.id)])
        : [[], null, {} as Record<string, StagePreparation>];
    // Ce que le moniteur déclare avoir abordé — pas ce que le groupe a confirmé, qui ne se
    // mesure qu'au quiz de fin et par la caméra. 'partial' vient de l'ancien suivi à trois
    // états : il compte comme abordé.


    const organizing = mode === 'organiser' && !vote?.done && !active.closed_at;
    const choices = Object.fromEntries(active.cards.map(card => [card.id, { accroche: preparations[card.id]?.accroche_choisie ?? '', actionId: preparations[card.id]?.actions?.[0] ?? null }]));
    const statuses = Object.fromEntries(activeObjectives.map(item => [item.pedagogicalContent.id, item.review?.executionStatus === 'done' || item.review?.executionStatus === 'partial' ? item.review.executionStatus : null]));

    return <main className="co-page co-weeks-page">
        {/* Page d'entrée du second pôle : intégrer l'environnement dans ses séances. La
            semaine en cours d'abord, puis les outils du pôle — explorer, le carnet — puis
            les semaines à venir et passées. */}
        <header className="co-weeks-heading">
            <div className="flex items-start gap-2">
                {/* Retour en flèche seule, comme Formation, Explorer et les parcours. */}
                <Link href="/stages" aria-label="Retour à l’accueil" className="-ml-2 mt-5 flex size-11 shrink-0 items-center justify-center rounded-full text-encre hover:bg-white/60">
                    <span className="material-symbols-outlined" aria-hidden>arrow_back</span>
                </Link>
                <div>
                    <p className="co-eyebrow">Intégrer l’environnement dans mes séances</p>
                    <h1>Mes séances</h1>
                    <p>Partez de ce que vous vivez avec le groupe pour trouver de quoi en parler et prolonger la découverte.</p>
                </div>
            </div>
        </header>

        {!organizing && !otherWeek && <section aria-label="Rebondir sur le terrain" className="mb-6 space-y-4 rounded-carte bg-sauge p-5 text-encre">
            <h2 className="text-intertitre font-semibold">Quelque chose a retenu votre attention ?</h2>
            <p className="text-corps leading-relaxed text-encre-douce">Une rencontre, une question du groupe, un changement sur la plage… Retrouvez des idées pour en parler ou poursuivre le sujet.</p>
            <Link href="/stages/rebondir" className="flex min-h-12 items-center justify-between rounded-bloc bg-encre px-4 text-corps font-semibold text-carte">Retrouver un sujet <ArrowRight size={17}/></Link>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-note font-semibold">
                <Link href="/stages/decouvrir" className="inline-flex min-h-11 items-center underline underline-offset-4">Explorer librement</Link>
                <Link href="/stages/decouvrir?saved=1" className="inline-flex min-h-11 items-center underline underline-offset-4">Mes cartes mises de côté</Link>
            </div>
        </section>}
        {otherWeek && <Link href="/stages/semaines" className="co-field-back">← Revenir à cette semaine</Link>}
        <section className="co-current-week" id="ma-semaine">
            <header>
                <div><p className="co-eyebrow">{nextWeek ? 'La semaine prochaine' : otherWeek ? 'Mes séances' : 'Cette semaine'}</p><h2>{nextWeek ? active.title : 'Des idées pour la suite'}</h2><span>{active.dates}</span></div>
                {/* Les sujets abordés, tels que le moniteur les note. Les actions validées
                    par le groupe sont un autre compte, qui ne se fait qu'au quiz de fin. */}

            </header>

            {organizing ? <section aria-label="Organiser mes cartes" className="mt-5 rounded-carte bg-papier p-4 text-encre">
                <header className="mb-5 space-y-2">
                    <Link href={homeHref} className="inline-flex min-h-11 items-center text-note font-semibold">← Revenir au suivi de ma semaine</Link>
                    <h3 className="text-intertitre font-semibold">Organiser mes cartes</h3>
                    <p className="text-corps text-encre-douce">Retrouvez vos cartes dans l’ordre qui vous convient.</p>
                </header>
                <WeekOrganizer key={active.id} stageId={active.id} cards={active.cards} choices={choices} statuses={statuses}/>
                <Link href={homeHref} className="mt-5 flex min-h-11 items-center justify-center rounded-full bg-encre px-4 text-note font-semibold text-carte">Terminer l’organisation</Link>
            </section> : active.closed_at ? <p>Votre bilan de cette semaine est conservé.</p> : activeObjectives.length ? <WeekObjectiveTracker key={active.id + active.cards.map(card => card.id).join('|') + (carte ?? '')} stageId={active.id} initialCardId={carte} readOnly={!!vote?.done} futureWeek={nextWeek} objectives={activeObjectives.map(item => {
                const formulations = formulationsFiche(item.pedagogicalContent);
                const accroche = preparations[item.pedagogicalContent.id]?.accroche_choisie || formulations[0].texte;
                const formulation = formulations.find(f => f.texte === accroche);
                const forme = formulation && 'forme' in formulation ? FORMES_ACCROCHE.find(f => f.id === formulation.forme)?.nom : undefined;
                return {
                id: item.pedagogicalContent.id,
                question: item.pedagogicalContent.question,
                objectif: item.pedagogicalContent.objectif,
                accroche,
                forme,
                action: item.pedagogicalContent.actions?.filter(action => preparations[item.pedagogicalContent.id]?.actions?.includes(action.id)).map(action => action.consigne).join('\n\n') || item.pedagogicalContent.a_observer || null,
                retenir: preparations[item.pedagogicalContent.id]?.chute || item.pedagogicalContent.a_retenir,
                initialStatus: item.review?.executionStatus ?? 'not_done',
                plannedFor: preparations[item.pedagogicalContent.id]?.planned_for ?? null,
                discussedOn: item.review?.discussedOn ?? null,
            }; })} extra={active.cards.length > 0 ? {
                href: `/stages/${active.id}/quiz/animation`,
                titre: 'Un quiz pour occuper un temps mort',
                detail: 'Des questions prêtes à poser : attente avant d’embarquer, averse, retour en minibus.',
            } : undefined}/> : <div className="co-current-week-empty"><p>Les cartes que vous choisissez de retrouver pendant vos séances apparaîtront ici. Vous pouvez aussi simplement lire et explorer, sans rien noter.</p></div>}

            {/* Noter un sujet abordé est l'entrée principale. Quiz et bilan restent disponibles. */}
            <footer>
                {!vote?.done && !active.closed_at && !organizing && <>
                    {!nextWeek && <Link href={`/stages/${active.id}/program?aborde=1`} className="co-week-secondary">Garder une trace d’un sujet</Link>}
                    {nextWeek && <Link href={`/stages/${active.id}/program?prevoir=1`} className="co-week-secondary">＋ Ajouter une idée</Link>}
                </>}
                {!organizing && !vote?.done && !active.closed_at && active.cards.length > 0 && <Link href={`${homeHref}&mode=organiser`} className="co-week-secondary">Organiser mes cartes</Link>}
                {vote?.done || active.closed_at ? <Link href={`/stages/${active.id}/bilan`} className="co-week-secondary">Voir le bilan</Link> : !organizing && !nextWeek && active.cards.length > 0 && <Link href={`/stages/${active.id}/quiz`} className="co-week-secondary">Un quiz avec le groupe</Link>}
            </footer>
        </section>

        {/* Les outils du pôle, juste après la semaine en cours. */}
        {!organizing && <>
        <nav className="co-seances-outils" aria-label="Outils de mes séances">
            <Link href="/stages/decouvrir"><Compass size={19}/><span><strong>Explorer les cartes</strong><small>Trouver un sujet, une accroche, une action</small></span></Link>
            <Link href="/profil/carnet"><NotebookPen size={19}/><span><strong>Mon carnet</strong><small>Ce que j’ai essayé et ce que j’en retiens</small></span></Link>
        </nav>

        {late.length > 0 && <section className="co-weeks-section">
            <div className="co-weeks-section-title"><div><p className="co-eyebrow">Semaines passées</p><h2>Revenir sur mes séances</h2></div><span>{late.length}</span></div>
            <div className="co-week-list">{late.map(week => <WeekRow key={week.id} week={week} state="late"/>)}</div>
        </section>}

        {future.length > 0 && <section className="co-weeks-section">
            <div className="co-weeks-section-title"><div><p className="co-eyebrow">Si vous aimez anticiper</p><h2>Mes semaines préparées</h2></div><span>{future.length}</span></div>
            <div className="co-week-list">{future.map(week => <WeekRow key={week.id} week={week} state="future"/>)}</div>
        </section>}

        {/* La semaine suivante est une possibilité, après la pratique de cette semaine. */}
        <Link href="/stages/prochaine" prefetch={false} className="co-weeks-new co-weeks-new-inline"><Plus size={17}/> Préparer la semaine prochaine, si vous le souhaitez</Link>

        {archived.length > 0 && <section className="co-weeks-section co-weeks-archives">
            <div className="co-weeks-section-title"><div><p className="co-eyebrow">Historique</p><h2>Semaines terminées</h2></div><span>{archived.length}</span></div>
            <div className="co-week-list">{archived.map(week => <WeekRow key={week.id} week={week} state="archive"/>)}</div>
        </section>}
        </>}
    </main>;
}
