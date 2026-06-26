import { StageObjectiveExecutionStatus, StageObjectiveImpactLevel, StageObjectiveReviewItem } from '@/types';

const EXECUTION_WEIGHTS: Record<StageObjectiveExecutionStatus, number> = {
    not_done: 0,
    partial: 0.5,
    done: 1,
};

const IMPACT_WEIGHTS: Record<StageObjectiveImpactLevel, number> = {
    low: 0.25,
    medium: 0.65,
    high: 1,
};

function percent(value: number) {
    return Math.round(value * 100);
}

export type ObjectiveAnalyticsInput = {
    executionStatus: StageObjectiveExecutionStatus | null;
    impactLevel: StageObjectiveImpactLevel | null;
};

export type StageObjectiveAnalyticsSummary = {
    totalObjectives: number;
    reviewedObjectives: number;
    doneCount: number;
    partialCount: number;
    notDoneCount: number;
    breakthroughCount: number;
    wellTransmittedCount: number;
    toConsolidateCount: number;
    highImpactCount: number;
    promisingPartialCount: number;
    completionRate: number;
    pedagogicalScore: number;
};

export function scoreObjectiveReview(review: ObjectiveAnalyticsInput) {
    if (!review.executionStatus) return { executionScore: 0, impactScore: 0, finalScore: 0 };

    const executionScore = EXECUTION_WEIGHTS[review.executionStatus];
    const impactScore = review.executionStatus === 'not_done'
        ? 0
        : review.impactLevel ? IMPACT_WEIGHTS[review.impactLevel] : 0;

    return {
        executionScore,
        impactScore,
        finalScore: executionScore * impactScore,
    };
}

export function summarizeObjectiveReviews(reviews: ObjectiveAnalyticsInput[]): StageObjectiveAnalyticsSummary {
    const reviewed = reviews.filter(review => review.executionStatus);
    const totalObjectives = reviews.length;

    if (totalObjectives === 0) {
        return {
            totalObjectives: 0,
            reviewedObjectives: 0,
            doneCount: 0,
            partialCount: 0,
            notDoneCount: 0,
            breakthroughCount: 0,
            wellTransmittedCount: 0,
            toConsolidateCount: 0,
            highImpactCount: 0,
            promisingPartialCount: 0,
            completionRate: 0,
            pedagogicalScore: 0,
        };
    }

    const finalScoreSum = reviews.reduce((sum, review) => sum + scoreObjectiveReview(review).finalScore, 0);
    const completionSum = reviews.reduce((sum, review) => (
        review.executionStatus ? sum + EXECUTION_WEIGHTS[review.executionStatus] : sum
    ), 0);

    return {
        totalObjectives,
        reviewedObjectives: reviewed.length,
        doneCount: reviewed.filter(review => review.executionStatus === 'done').length,
        partialCount: reviewed.filter(review => review.executionStatus === 'partial').length,
        notDoneCount: reviewed.filter(review => review.executionStatus === 'not_done').length,
        breakthroughCount: reviewed.filter(review => review.executionStatus === 'done' && review.impactLevel === 'high').length,
        wellTransmittedCount: reviewed.filter(review => review.executionStatus === 'done' && review.impactLevel === 'high').length,
        toConsolidateCount: reviewed.filter(review => (
            review.executionStatus === 'not_done'
            || review.executionStatus === 'partial'
            || (review.executionStatus === 'done' && review.impactLevel === 'low')
        )).length,
        highImpactCount: reviewed.filter(review => review.impactLevel === 'high').length,
        promisingPartialCount: reviewed.filter(review => review.executionStatus === 'partial' && review.impactLevel === 'high').length,
        completionRate: percent(completionSum / totalObjectives),
        pedagogicalScore: percent(finalScoreSum / totalObjectives),
    };
}

export function summarizeStageObjectiveItems(items: StageObjectiveReviewItem[]) {
    return summarizeObjectiveReviews(items.map(item => ({
        executionStatus: item.review?.executionStatus ?? null,
        impactLevel: item.review?.impactLevel ?? null,
    })));
}