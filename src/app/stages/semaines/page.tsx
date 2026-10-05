import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { getPedagogicalPool, getStageObjectiveReviewItems, getStages } from '@/services/data-service';
import { DeleteStageButton } from '@/components/DeleteStageButton';
import { parseStageDateRange } from '@/lib/stage-dates';
import type { PedagogicalContent, Stage } from '@/types';
import { WeekObjectiveTracker } from './WeekObjectiveTracker';
import { getResumeVote } from '@/actions/vote-actions';
import { getStagePreparations, type StagePreparation } from '@/actions/preparation-actions';
import { formulationsFiche } from '@/data/formulations-fiche';
import { FORMES_ACCROCHE } from '@/data/formes-accroche';
import { ensureCalendarWeek } from '@/lib/calendar-week';
import { redirect } from 'next/navigation';

import { iconeMaterial } from '@/components/ui/Icone';
const ArrowRight = iconeMaterial('arrow_forward');
const Compass = iconeMaterial('explore');
const NotebookPen = iconeMaterial('edit_note');
const Plus = iconeMaterial('add');

type WeekWithCards = Stage & { cards: PedagogicalContent[] };

function WeekRow({ week, state }: { week: WeekWithCards; state: 'future' | 'late' | 'archive' }) {
    const href = state === 'late' || state === 'archive' ? `/stages/${week.id}/bilan` : `/stages/${week.id}/program`;
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

export default async function SemainesPage() {
    noStore();
    const currentWeek = await ensureCalendarWeek();
    if (!currentWeek) redirect('/login');
    const [stages, pool] = await Promise.all([getStages(), getPedagogicalPool()]);
    const cardsById = new Map(pool.map(card => [card.id, card]));
    const weeks: WeekWithCards[] = stages.map(stage => ({
        ...stage,
        cards: (stage.selected_content ?? []).map(id => cardsById.get(id)).filter((card): card is PedagogicalContent => Boolean(card)),
    }));

    const now = new Date();
    const open = weeks.filter(week => !week.closed_at);
    const active = weeks.find(week => week.id === currentWeek.id) ?? { ...currentWeek, cards: [] };
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
    const abordes = activeObjectives.filter(item => item.review?.executionStatus === 'done' || item.review?.executionStatus === 'partial').length;

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
                    <p>Un sujet abordé avec votre groupe ou une idée pour demain ? Vous pouvez les retrouver ici, au fil de vos séances.</p>
                </div>
            </div>
        </header>

        <section className="co-current-week">
            <header>
                <div><p className="co-eyebrow">Cette semaine</p><h2>{active.title}</h2><span>{active.dates}</span></div>
                {/* Les sujets abordés, tels que le moniteur les note. Les actions validées
                    par le groupe sont un autre compte, qui ne se fait qu'au quiz de fin. */}
                {abordes > 0 && <strong>{abordes}<small>sujet{abordes > 1 ? 's' : ''} abordé{abordes > 1 ? 's' : ''}</small></strong>}
            </header>

            {active.closed_at ? <p>Votre bilan de cette semaine est conservé.</p> : activeObjectives.length ? <WeekObjectiveTracker stageId={active.id} objectives={activeObjectives.map(item => {
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
            } : undefined}/> : <div className="co-current-week-empty"><p>Vous avez parlé d’un sujet avec votre groupe ? Retrouvez la carte et notez ce sujet dans votre semaine. Votre semaine se construit au fil des séances.</p></div>}

            {/* Noter un sujet abordé est l'entrée principale. Quiz et bilan restent disponibles. */}
            <footer>
                {!vote?.done && !active.closed_at && <>
                    <Link href={`/stages/${active.id}/program?aborde=1`} className="co-week-primary">Noter ce qu’on a fait <ArrowRight size={17}/></Link>
                    <Link href={`/stages/${active.id}/program?prevoir=1`} className="co-week-secondary">＋ Prévoir un sujet</Link>
                </>}
                <Link href={`/stages/${active.id}/program`} className="co-week-secondary">Retrouver mes cartes</Link>
                {vote?.done || active.closed_at ? <Link href={`/stages/${active.id}/bilan`} className="co-week-secondary">Voir le bilan</Link> : active.cards.length > 0 && <Link href={`/stages/${active.id}/quiz`} className="co-week-secondary">Un quiz avec le groupe</Link>}
            </footer>
        </section>

        {/* Les outils du pôle, juste après la semaine en cours. */}
        <nav className="co-seances-outils" aria-label="Outils de mes séances">
            <Link href="/stages/decouvrir"><Compass size={19}/><span><strong>Explorer les cartes</strong><small>Trouver un sujet, une accroche, une action</small></span></Link>
            <Link href="/profil/carnet"><NotebookPen size={19}/><span><strong>Mon carnet</strong><small>Ce que j’ai essayé et ce que j’en retiens</small></span></Link>
        </nav>

        {late.length > 0 && <section className="co-weeks-section">
            <div className="co-weeks-section-title"><div><p className="co-eyebrow">Semaines passées</p><h2>Revenir sur mes séances</h2></div><span>{late.length}</span></div>
            <div className="co-week-list">{late.map(week => <WeekRow key={week.id} week={week} state="late"/>)}</div>
        </section>}

        {future.length > 0 && <section className="co-weeks-section">
            <div className="co-weeks-section-title"><div><p className="co-eyebrow">À venir</p><h2>Prochaines mises en pratique</h2></div><span>{future.length}</span></div>
            <div className="co-week-list">{future.map(week => <WeekRow key={week.id} week={week} state="future"/>)}</div>
        </section>}

        {/* La semaine suivante est une possibilité, après la pratique de cette semaine. */}
        <Link href="/stages/prochaine" prefetch={false} className="co-weeks-new co-weeks-new-inline"><Plus size={17}/> Préparer la semaine prochaine, si vous le souhaitez</Link>

        {archived.length > 0 && <section className="co-weeks-section co-weeks-archives">
            <div className="co-weeks-section-title"><div><p className="co-eyebrow">Historique</p><h2>Semaines terminées</h2></div><span>{archived.length}</span></div>
            <div className="co-week-list">{archived.map(week => <WeekRow key={week.id} week={week} state="archive"/>)}</div>
        </section>}
    </main>;
}
