export type Dimension = 'COMPRENDRE' | 'OBSERVER' | 'PROTÉGER';

export type Stage = {
  id: string;
  title: string;
  activity: string;
  level: string;
  dates: string;
  nb_stagiaires?: number | null;
  selected_content?: string[];
  suggested_thematics?: string[];
  closed_at?: string | null;
  closing_notes?: string | null;
};

export type Session = {
  id: string;
  stage_id: string;
  title: string;
  session_order: number;
};

export type SessionStep = {
  id: string;
  session_id: string;
  step_title: string;
  step_duration_minutes: number;
  step_description: string;
  step_order: number;
};

export type StepTodo = {
  id: string;
  session_step_id: string;
  text: string;
  done: boolean;
  todo_order: number;
  created_at: string;
  linked_content_id?: string | null;
  is_content_header?: boolean;
};

export type PedagogicalRessource =
    | { type: 'fiche_memo'; label: string; fiche_memo_id: string }
    | { type: 'url'; label: string; url: string };

export type ContentSource = 'copun' | 'custom';

export type ObservationPillar = 'COMPRENDRE' | 'OBSERVER' | 'PROTÉGER';

export type PedagogicalAction = 'expliquer' | 'montrer' | 'questionner' | 'laisser_decouvrir';

export type WeekObservation = {
  id: string;
  stage_id: string;
  text: string;
  pedagogical_action: PedagogicalAction | null;
  linked_thematic: string | null;
  created_at: string;
};

export type PedagogicalContent = {
  id: string;
  question: string;
  objectif: string;
  tip: string;
  niveau: 1 | 2 | 3;
  dimension: Dimension;
  tags_theme: string[];
  tags_filtre: string[];
  ressources?: PedagogicalRessource[];
  owner_id?: string;
  is_public?: boolean;
  club_id?: string;
  source?: ContentSource;
  ffv_level?: number | null;
  supports?: string[];
};

export type ContentTodo = {
  id: string;
  content_id: string;
  text: string;
  todo_order: number;
  created_at: string;
};

export type StageObjectiveExecutionStatus = 'not_done' | 'partial' | 'done';
export type StageObjectiveImpactLevel = 'low' | 'medium' | 'high';

export type StageObjectiveReviewDraft = {
  pedagogicalContentId: string;
  executionStatus: StageObjectiveExecutionStatus | null;
  impactLevel: StageObjectiveImpactLevel | null;
  note: string;
};

export type StageObjectiveReviewItem = {
  pedagogicalContent: PedagogicalContent;
  review: {
    executionStatus: StageObjectiveExecutionStatus;
    impactLevel: StageObjectiveImpactLevel | null;
    note: string | null;
  } | null;
};

export type Profile = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
  club_id?: string;
  clubs?: {
    name: string;
  };
};

export type Exploit = {
  id: string;
  user_id?: string;
  content_id?: string;
  description: string;
  photo_url: string;
  created_at: string;
};

export type TopicTrackingCategory = 'established' | 'improving' | 'fragile' | 'emerging' | 'dormant';

export type TopicTracking = {
  tag: string;
  category: TopicTrackingCategory;
  occurrences: number;
  lastScore: number;
  previousScore: number | null;
  lastClosedAt: string | null;
};
