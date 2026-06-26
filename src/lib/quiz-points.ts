export const POINTS_PER_CORRECT = 2;
export const FULL_QUIZ_SIZE = 10;
export const PERFECT_FULL_BONUS = 5;

export function computeQuizPoints(scoreCorrect: number, scoreTotal: number): number {
    let points = scoreCorrect * POINTS_PER_CORRECT;
    if (scoreTotal >= FULL_QUIZ_SIZE && scoreCorrect === scoreTotal) {
        points += PERFECT_FULL_BONUS;
    }
    return points;
}