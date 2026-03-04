export type Dimension = 'COMPRENDRE' | 'OBSERVER' | 'PROTÉGER';

export type Stage = {
  id: string;
  title: string;
  activity: string;
  level: string;
  dates: string;
  selected_content?: string[]; // IDs of PedagogicalContent
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

export type PedagogicalContent = {
  id: string;
  question: string;
  objectif: string;
  tip: string;
  niveau: 1 | 2 | 3;
  dimension: Dimension;
  tags_theme: string[];
  tags_filtre: string[];
  owner_id?: string;
  is_public?: boolean;
  club_id?: string;
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
