export type GameCardType = 'triage' | 'mots' | 'dilemme' | 'quizz';

export interface BaseGameCard {
    id: string;
    type: GameCardType;
    theme: string;
    related_objective_id?: string;
}

export interface QuizzCard extends BaseGameCard {
    type: 'quizz';
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
}

export interface TriageCard extends BaseGameCard {
    type: 'triage';
    statement: string;
    isTrue: boolean;
}

export interface MotsEnRafaleCard extends BaseGameCard {
    type: 'mots';
    definition: string;
    answer: string;
}

export interface DilemmeDuMarinCard extends BaseGameCard {
    type: 'dilemme';
    optionA: string;
    optionB: string;
    explanation: string;
}

export type AnyGameCard = QuizzCard | TriageCard | MotsEnRafaleCard | DilemmeDuMarinCard;

export const GAME_CARDS: AnyGameCard[] = [
    {
        id: 'gc_1',
        type: 'quizz',
        theme: 'marée',
        related_objective_id: '1', // Pourquoi y a-t-il plusieurs marées par jour ?
        question: "Quelle est la cause principale des marées ?",
        options: ["Le vent", "La rotation de la Terre", "L'attraction de la Lune", "Les courants marins"],
        correctAnswer: 2,
        explanation: "C'est principalement l'attraction gravitationnelle de la Lune qui attire les masses d'eau."
    },
    {
        id: 'gc_2',
        type: 'triage',
        theme: 'marée',
        related_objective_id: '4', // Comment s'appelle la zone qui se couvre et se découvre...
        statement: "L'estran est la zone toujours recouverte par la mer.",
        isTrue: false
    },
    {
        id: 'gc_3',
        type: 'mots',
        theme: 'marée',
        definition: "Le moment de pause entre la marée montante et la marée descendante.",
        answer: "L'étale",
        related_objective_id: '5'
    }
];
