import { Stage, Session, SessionStep, PedagogicalContent } from "@/types";
import CONTENT_JSON from "./pedagogical_content.json";

export const MOCK_STAGES: Stage[] = [
    {
        id: "stage-1",
        title: "Catamaran Niveau 2",
        activity: "Catamaran",
        level: "Perfectionnement",
        dates: "[2026-07-14, 2026-07-18]",
        selected_content: ["1", "13", "17", "24", "30"], // Using new IDs from CSV
    },
];

export const MOCK_SESSIONS: Session[] = [
    {
        id: "session-1",
        stage_id: "stage-1",
        title: "Jour 3 : Les Allures et le Courant",
        session_order: 3,
    }
];

export const MOCK_SESSION_STEPS: SessionStep[] = [
    {
        id: "step-1",
        session_id: "session-1",
        step_title: "Briefing Terre",
        step_duration_minutes: 15,
        step_description: "Point météo, rappel sécurité, objectifs de la séance.",
        step_order: 1,
    },
    {
        id: "step-2",
        session_id: "session-1",
        step_title: "Navigation : Le Travers",
        step_duration_minutes: 45,
        step_description: "Navigation au travers, réglage des voiles.",
        step_order: 2,
    },
    {
        id: "step-3",
        session_id: "session-1",
        step_title: "Pause & Observation",
        step_duration_minutes: 15,
        step_description: "Observation du courant sur une bouée.",
        step_order: 3,
    },
    {
        id: "step-4",
        session_id: "session-1",
        step_title: "Retour & Rangement",
        step_duration_minutes: 30,
        step_description: "Retour au près, rangement du matériel.",
        step_order: 4,
    }
];

export const MOCK_PEDAGOGICAL_CONTENT: PedagogicalContent[] = CONTENT_JSON as PedagogicalContent[];

export const MOCK_LINKS = [
    { session_step_id: "step-1", pedagogical_content_id: "1" },
    { session_step_id: "step-2", pedagogical_content_id: "13" },
    { session_step_id: "step-3", pedagogical_content_id: "24" },
];
