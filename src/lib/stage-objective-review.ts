import { StageObjectiveExecutionStatus, StageObjectiveImpactLevel } from '@/types';

export const STAGE_OBJECTIVE_EXECUTION_OPTIONS: Array<{
    value: StageObjectiveExecutionStatus;
    label: string;
    helper: string;
}> = [
    { value: 'not_done', label: 'Non abordé', helper: "Pas traité pendant ce stage — écarté ou pas eu le temps." },
    { value: 'partial', label: 'Effleuré', helper: "Sujet mentionné ou esquissé, mais pas vraiment installé." },
    { value: 'done', label: 'Travaillé', helper: "Objectif réellement mené avec le groupe, du temps y a été consacré." },
];

export const STAGE_OBJECTIVE_IMPACT_OPTIONS: Array<{
    value: StageObjectiveImpactLevel;
    label: string;
    helper: string;
}> = [
    { value: 'low', label: 'Difficile', helper: "Peu d'adhésion ou transmission fragile." },
    { value: 'medium', label: 'Correct', helper: "Objectif compris, sans grand déclic." },
    { value: 'high', label: 'Très bien', helper: "Bonne accroche et vraie compréhension." },
];

const CONTEXTUAL_IMPACT_OPTIONS: Record<Exclude<StageObjectiveExecutionStatus, 'not_done'>, Array<{
    value: StageObjectiveImpactLevel;
    label: string;
    helper: string;
}>> = {
    partial: [
        { value: 'low', label: "Rien n'a accroché", helper: "Le sujet a été abordé, mais rien ne semble avoir laissé de trace." },
        { value: 'medium', label: 'Quelques repères', helper: "Des éléments ont été retenus, mais restent fragiles ou à consolider." },
        { value: 'high', label: 'Bonne amorce', helper: "Le lien avec la pratique est compris, le groupe a envie d'aller plus loin." },
    ],
    done: [
        { value: 'low', label: 'Peu retenu', helper: "L'objectif a été mené, mais les stagiaires peinent à restituer l'essentiel." },
        { value: 'medium', label: 'Saisi dans les grandes lignes', helper: "Le groupe a compris l'essentiel, même sans encore l'appliquer spontanément." },
        { value: 'high', label: 'Bien intégré', helper: "Le groupe a assimilé le contenu et fait le lien avec sa pratique." },
    ],
};

export function isStageObjectiveExecutionStatus(value: string): value is StageObjectiveExecutionStatus {
    return STAGE_OBJECTIVE_EXECUTION_OPTIONS.some(option => option.value === value);
}

export function isStageObjectiveImpactLevel(value: string): value is StageObjectiveImpactLevel {
    return STAGE_OBJECTIVE_IMPACT_OPTIONS.some(option => option.value === value);
}

export function getStageObjectiveImpactOptions(executionStatus: StageObjectiveExecutionStatus | null) {
    if (!executionStatus || executionStatus === 'not_done') return [];
    return CONTEXTUAL_IMPACT_OPTIONS[executionStatus];
}

export function getStageObjectiveImpactMeta(
    executionStatus: StageObjectiveExecutionStatus | null,
    impactLevel: StageObjectiveImpactLevel | null,
) {
    if (!impactLevel) return null;
    return getStageObjectiveImpactOptions(executionStatus).find(option => option.value === impactLevel) ?? null;
}

export function getStageObjectiveImpactPrompt(executionStatus: StageObjectiveExecutionStatus | null) {
    if (executionStatus === 'partial') {
        return {
            label: "Ce qui a retenu l'attention",
            helper: "Même effleuré, quelque chose a pu laisser une trace. Comment le groupe a-t-il réagi ?",
        };
    }

    if (executionStatus === 'done') {
        return {
            label: "Ce que le groupe a retenu",
            helper: "L'objectif a été travaillé — qu'est-ce que le groupe en gardera ?",
        };
    }

    return {
        label: "Ce que le groupe a retenu",
        helper: "Choisissez d'abord ce qui s'est passé.",
    };
}

export function formatStageObjectiveTheme(tag: string) {
    return tag
        .split('_')
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
