import { unstable_noStore as noStore } from 'next/cache';
import { notFound } from 'next/navigation';
import { ReopenConfirmSheet } from '@/components/ReopenConfirmSheet';
import { StageObservationsReview } from '@/components/StageObservationsReview';
import { getStageById, getStageObjectiveReviewItems, getStages } from '@/services/data-service';
import { getActionsConfirmees, getResumeVote } from '@/actions/vote-actions';
import { getObservationsForStage } from '@/actions/observation-actions';
import { isRessentiNiveau } from '@/lib/stage-ressenti';
import { civilDay, parseStageDateRange } from '@/lib/stage-dates';
import { BilanSemaine } from './BilanSemaine';

/**
 * Bilan de semaine, aligné sur l'app actuelle : les sujets tels que notés dans Mes séances,
 * le vote du goûter, le ressenti et un mémo. Les anciens défis terrain et points cumulés
 * ne sont plus affichés (défis individuels retirés, voir la mémoire projet).
 */
export default async function StageBilanPage({ params }: { params: Promise<{ id: string }> }) {
    noStore();
    const { id } = await params;

    const [stage, items, vote, actionsConfirmees, observations, semaines] = await Promise.all([
        getStageById(id),
        getStageObjectiveReviewItems(id),
        getResumeVote(id),
        getActionsConfirmees(id),
        getObservationsForStage(id),
        getStages(),
    ]);
    if (!stage) return notFound();

    const clos = !!stage.closed_at;
    const dateCloture = stage.closed_at ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(stage.closed_at)) : null;

    // Prévenir d'une clôture prématurée, sans l'empêcher.
    let avertissement: string | null = null;
    if (!clos) {
        const range = parseStageDateRange(stage.dates, new Date());
        if (range) {
            const jours = civilDay(range.end) - civilDay(range.start) + 1;
            const ecart = civilDay(new Date()) - civilDay(range.start);
            if (ecart < 0) avertissement = 'Cette semaine n’a pas encore commencé.';
            else if (ecart < jours - 1) avertissement = `Jour ${ecart + 1} sur ${jours} : le bilan se fait normalement le dernier jour.`;
        }
    }

    const sujets = items.map(item => ({
        id: item.pedagogicalContent.id,
        question: item.pedagogicalContent.question,
        statut: item.review?.executionStatus ?? 'not_done',
    }));
    const cartes = new Map(items.map(item => [item.pedagogicalContent.id, item.pedagogicalContent]));
    const actions = actionsConfirmees.map(action => {
        const carte = cartes.get(action.contentId);
        return {
            id: `${action.contentId}:${action.actionId}`,
            label: carte?.actions?.find(a => a.id === action.actionId)?.label ?? 'Action confirmée',
            question: carte?.question ?? '',
        };
    });

    // Badge « Carnet » : le premier bilan fait. On le signale sur la semaine qui l'a apporté.
    const closes = semaines.filter(s => s.closed_at).sort((a, b) => String(a.closed_at).localeCompare(String(b.closed_at)));
    const badge = clos && closes[0]?.id === stage.id ? 'Carnet' : null;

    const niveau = stage.ressenti?.niveau;
    const ressenti = stage.ressenti && isRessentiNiveau(niveau) ? { ...stage.ressenti, niveau } : null;

    return <BilanSemaine
        stageId={stage.id}
        titre={stage.title}
        dates={stage.dates}
        clos={clos}
        dateCloture={dateCloture}
        avertissement={avertissement}
        sujets={sujets}
        vote={{ fait: vote.done, score: vote.score, total: vote.total, participants: vote.participants }}
        actions={actions}
        ressenti={ressenti}
        nbStagiaires={stage.nb_stagiaires ?? null}
        memo={stage.closing_notes ?? ''}
        badge={badge}
    >
        {observations.length > 0 && <section className="mb-10">
            <h2 className="mb-3 text-intertitre font-semibold text-encre">Retours terrain</h2>
            <StageObservationsReview observations={observations}/>
        </section>}
        {clos && <div className="mb-10"><ReopenConfirmSheet stageId={stage.id}/></div>}
    </BilanSemaine>;
}
