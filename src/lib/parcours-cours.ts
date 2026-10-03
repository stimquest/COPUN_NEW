import type { SequenceProgress } from '@/actions/parcours-formation-actions';
import type { ParcoursFormation } from '@/data/parcours-formation';

/** Les anciens essais terminés restent reconnus ; les nouveaux cours finissent au quiz. */
export function parcoursTermine(progression?: SequenceProgress) {
    return !!(progression?.acquisVerifie || progression?.mission?.completed);
}

export function corrigerQuiz(sequence: ParcoursFormation, answers: Record<string, string>) {
    const corrections = sequence.questions.map(question => ({
        id: question.id,
        correct: answers[question.id] === question.correct,
        retour: question.retour,
        ficheIndex: question.ficheIndex,
    }));
    const complet = sequence.questions.every(question => question.options.some(option => option.id === answers[question.id]));
    const score = corrections.filter(correction => correction.correct).length;
    return { score, total: corrections.length, corrections, complet, valide: complet && score === corrections.length };
}
export type ResultatQuiz = ReturnType<typeof corrigerQuiz>;
