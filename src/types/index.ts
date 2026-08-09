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
  /** Rituels tenus sur toute la semaine (`src/data/actions-semaine.ts`). */
  actions_semaine?: string[] | null;
  closed_at?: string | null;
  closing_notes?: string | null;
  /** Bilan global de clôture (`src/lib/stage-ressenti.ts`), null tant que non clôturé. */
  ressenti?: { niveau: string; raisons: string[]; note: string } | null;
};

export type PedagogicalRessource =
    | { type: 'fiche_memo'; label: string; fiche_memo_id: string }
    | { type: 'url'; label: string; url: string };

export type ContentSource = 'copun' | 'custom';

/**
 * Action de terrain proposée pour une fiche.
 *
 * `id` est stable et référencé par `stage_preparations.actions` : le renommer orpheline
 * les choix déjà enregistrés par les moniteurs.
 */
export type ActionFiche = {
  id: string;
  /** Ce qu'on fait, nommé simplement. */
  label: string;
  /** La consigne, reprenable telle quelle devant le groupe. */
  consigne: string;
};

export type ObservationPillar = 'COMPRENDRE' | 'OBSERVER' | 'PROTÉGER';

export type PedagogicalAction = 'expliquer' | 'montrer' | 'questionner' | 'laisser_decouvrir';

export type ObservationType = 'faune' | 'flore' | 'meteo_mer' | 'pollution' | 'activite_humaine' | 'autre';

export type WeekObservation = {
  id: string;
  stage_id: string;
  text: string;
  pedagogical_action: PedagogicalAction | null;
  linked_thematic: string | null;
  observation_type: ObservationType | null;
  target_id: string | null;
  species_label: string | null;
  species_uncertain: boolean;
  individual_count: number | null;
  location_note: string | null;
  observed_at: string | null;
  created_at: string;
};

export type PedagogicalContent = {
  id: string;
  question: string;
  objectif: string;
  explication?: string;
  tip: string;
  // Couche « comment en parler aux enfants » — rédigée au fil de l'eau, donc
  // absente sur la plupart des fiches (l'UI n'affiche le bloc que si accroche existe).
  accroche?: string;
  accroches_variantes?: string[];
  a_observer?: string;
  a_retenir?: string;
  erreur_frequente?: string;
  /** Actions de terrain propres à cette fiche. Repli sur le groupe si absent. */
  actions?: ActionFiche[] | null;
  /** Cible de public (voir src/data/niveaux.ts) : pas une échelle de difficulté du texte. */
  niveau: 1 | 2 | 3 | 4;
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

/** Capsule environnement fabriquée par le moniteur à partir des questions retenues. */
export type Sujet = {
  id: string;
  stage_id: string | null;
  titre: string;
  accroche: string | null;
  points_cles: string | null;
  a_retenir: string | null;
  notes_perso: string | null;
  acquis: boolean;
  sources?: string[];
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

// État complet d'un objectif tel que saisi à chaud depuis l'accueil — le bilan de fin de
// semaine reprend ces valeurs telles quelles plutôt que de les redemander.
export type ObjectiveReviewState = {
  status: StageObjectiveExecutionStatus;
  impactLevel: StageObjectiveImpactLevel | null;
  reasons: string[];
};

export type StageObjectiveReviewDraft = {
  pedagogicalContentId: string;
  executionStatus: StageObjectiveExecutionStatus | null;
  impactLevel: StageObjectiveImpactLevel | null;
  // Raisons cochées parmi une liste prédéfinie (dépend du statut + du niveau d'impact) —
  // mesurable et agrégeable, contrairement au texte libre seul.
  reasons: string[];
  note: string;
};

export type StageObjectiveReviewItem = {
  pedagogicalContent: PedagogicalContent;
  review: {
    executionStatus: StageObjectiveExecutionStatus;
    impactLevel: StageObjectiveImpactLevel | null;
    reasons: string[] | null;
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

