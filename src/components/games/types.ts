export type GameType = 'quizz' | 'triage' | 'mots' | 'dilemme';

export interface GameCardDB {
    id: string;
    type: GameType;
    theme: string;
    related_objective_id?: string;
    data: any;
}

export interface QuizzData {
    question: string;
    answers: string[];
    correctAnswerIndex: number;
    explanation?: string;
}

export interface TriageData {
    statement: string;
    isTrue: boolean;
    explanation?: string;
}

export interface MotsData {
    definition: string;
    answer: string;
}

export interface DilemmeData {
    optionA: string;
    optionB: string;
    explanation: string;
}
