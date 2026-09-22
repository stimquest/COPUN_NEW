export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      club_observation_targets: {
        Row: {
          categorie: string
          club_id: string
          created_at: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          categorie?: string
          club_id: string
          created_at?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          categorie?: string
          club_id?: string
          created_at?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      club_spots: {
        Row: {
          bearing: number | null
          club_id: string
          created_at: string | null
          defi_id: string
          gps_lat: number
          gps_lng: number
          id: string
        }
        Insert: {
          bearing?: number | null
          club_id: string
          created_at?: string | null
          defi_id: string
          gps_lat: number
          gps_lng: number
          id?: string
        }
        Update: {
          bearing?: number | null
          club_id?: string
          created_at?: string | null
          defi_id?: string
          gps_lat?: number
          gps_lng?: number
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_spots_defi_id_fkey"
            columns: ["defi_id"]
            isOneToOne: false
            referencedRelation: "defis"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string | null
        }
        Relationships: []
      }
      content_todos: {
        Row: {
          content_id: string
          created_at: string
          id: string
          text: string
          todo_order: number
        }
        Insert: {
          content_id: string
          created_at?: string
          id?: string
          text: string
          todo_order?: number
        }
        Update: {
          content_id?: string
          created_at?: string
          id?: string
          text?: string
          todo_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_todos_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "pedagogical_content"
            referencedColumns: ["id"]
          },
        ]
      }
      defis: {
        Row: {
          actif: boolean
          created_at: string
          description: string
          fil_rouge: boolean
          icon: string
          id: string
          instruction: string
          points: number
          spot_fixe: boolean
          stage_type: string[] | null
          tags_theme: string[] | null
          terrain_temps_reel: boolean
          type_preuve: Database["public"]["Enums"]["defi_preuve_type"]
        }
        Insert: {
          actif?: boolean
          created_at?: string
          description: string
          fil_rouge?: boolean
          icon: string
          id: string
          instruction: string
          points?: number
          spot_fixe?: boolean
          stage_type?: string[] | null
          tags_theme?: string[] | null
          terrain_temps_reel?: boolean
          type_preuve: Database["public"]["Enums"]["defi_preuve_type"]
        }
        Update: {
          actif?: boolean
          created_at?: string
          description?: string
          fil_rouge?: boolean
          icon?: string
          id?: string
          instruction?: string
          points?: number
          spot_fixe?: boolean
          stage_type?: string[] | null
          tags_theme?: string[] | null
          terrain_temps_reel?: boolean
          type_preuve?: Database["public"]["Enums"]["defi_preuve_type"]
        }
        Relationships: []
      }
      fiches_memo: {
        Row: {
          auteur_id: string | null
          contenu: string
          created_at: string
          id: string
          resume: string | null
          statut: Database["public"]["Enums"]["fiche_statut"]
          tags: string[]
          tags_saisons: string[]
          tags_thematiques: string[]
          titre: string
          updated_at: string
        }
        Insert: {
          auteur_id?: string | null
          contenu?: string
          created_at?: string
          id?: string
          resume?: string | null
          statut?: Database["public"]["Enums"]["fiche_statut"]
          tags?: string[]
          tags_saisons?: string[]
          tags_thematiques?: string[]
          titre: string
          updated_at?: string
        }
        Update: {
          auteur_id?: string | null
          contenu?: string
          created_at?: string
          id?: string
          resume?: string | null
          statut?: Database["public"]["Enums"]["fiche_statut"]
          tags?: string[]
          tags_saisons?: string[]
          tags_thematiques?: string[]
          titre?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fiches_memo_auteur_id_fkey"
            columns: ["auteur_id"]
            isOneToOne: false
            referencedRelation: "activite_par_moniteur"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fiches_memo_auteur_id_fkey"
            columns: ["auteur_id"]
            isOneToOne: false
            referencedRelation: "profile_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiches_memo_auteur_id_fkey"
            columns: ["auteur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      formation_progression: {
        Row: {
          id: string
          lecon_id: string
          termine_le: string
          user_id: string
        }
        Insert: {
          id?: string
          lecon_id: string
          termine_le?: string
          user_id: string
        }
        Update: {
          id?: string
          lecon_id?: string
          termine_le?: string
          user_id?: string
        }
        Relationships: []
      }
      formation_practice_notes: {
        Row: {
          created_at: string
          id: string
          note: string
          prompt: string
          sequence_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note: string
          prompt: string
          sequence_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string
          prompt?: string
          sequence_id?: string
          user_id?: string
        }
        Relationships: []
      }
      formation_sequence_progress: {
        Row: {
          acquis_verifie_le: string | null
          created_at: string
          id: string
          mise_en_pratique_le: string | null
          parcouru_le: string | null
          sequence_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          acquis_verifie_le?: string | null
          created_at?: string
          id?: string
          mise_en_pratique_le?: string | null
          parcouru_le?: string | null
          sequence_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          acquis_verifie_le?: string | null
          created_at?: string
          id?: string
          mise_en_pratique_le?: string | null
          parcouru_le?: string | null
          sequence_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      formation_practice_missions: {
        Row: {
          action_id: string
          assigned_at: string
          card_ids: string[]
          completed_at: string | null
          id: string
          sequence_id: string
          stage_id: string
          user_id: string
        }
        Insert: {
          action_id: string
          assigned_at?: string
          card_ids: string[]
          completed_at?: string | null
          id?: string
          sequence_id: string
          stage_id: string
          user_id: string
        }
        Update: {
          action_id?: string
          assigned_at?: string
          card_ids?: string[]
          completed_at?: string | null
          id?: string
          sequence_id?: string
          stage_id?: string
          user_id?: string
        }
        Relationships: []
      }
      game_cards: {
        Row: {
          created_at: string
          data: Json
          id: string
          related_objective_id: string | null
          theme: string | null
          type: Database["public"]["Enums"]["game_type"]
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          related_objective_id?: string | null
          theme?: string | null
          type: Database["public"]["Enums"]["game_type"]
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          related_objective_id?: string | null
          theme?: string | null
          type?: Database["public"]["Enums"]["game_type"]
        }
        Relationships: [
          {
            foreignKeyName: "game_cards_related_objective_id_fkey"
            columns: ["related_objective_id"]
            isOneToOne: false
            referencedRelation: "pedagogical_content"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string
          game_data: Json
          id: string
          owner_id: string | null
          stage_id: string | null
          theme: string | null
          title: string
        }
        Insert: {
          created_at?: string
          game_data: Json
          id?: string
          owner_id?: string | null
          stage_id?: string | null
          theme?: string | null
          title: string
        }
        Update: {
          created_at?: string
          game_data?: Json
          id?: string
          owner_id?: string | null
          stage_id?: string | null
          theme?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard_points: {
        Row: {
          club_id: string | null
          created_at: string | null
          defi_id: string | null
          id: string
          monitor_id: string | null
          points: number
          reason: string | null
          stage_id: string | null
        }
        Insert: {
          club_id?: string | null
          created_at?: string | null
          defi_id?: string | null
          id?: string
          monitor_id?: string | null
          points?: number
          reason?: string | null
          stage_id?: string | null
        }
        Update: {
          club_id?: string | null
          created_at?: string | null
          defi_id?: string | null
          id?: string
          monitor_id?: string | null
          points?: number
          reason?: string | null
          stage_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_points_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaderboard_points_defi_id_fkey"
            columns: ["defi_id"]
            isOneToOne: false
            referencedRelation: "defis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaderboard_points_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          chemin: string
          id: string
          session_id: string | null
          user_id: string
          vue_le: string
        }
        Insert: {
          chemin: string
          id?: string
          session_id?: string | null
          user_id: string
          vue_le?: string
        }
        Update: {
          chemin?: string
          id?: string
          session_id?: string | null
          user_id?: string
          vue_le?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_views_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      pedagogical_content: {
        Row: {
          a_observer: string | null
          a_retenir: string | null
          accroche: string | null
          accroches_formes: Json | null
          accroches_variantes: string[] | null
          actions: Json | null
          club_id: string | null
          created_at: string
          dimension: string | null
          erreur_frequente: string | null
          vote_vrai: string | null
          vote_faux: string | null
          explication: string | null
          ffv_level: number | null
          id: string
          is_public: boolean | null
          niveau: number | null
          objectif: string
          owner_id: string | null
          question: string
          ressources: Json
          source: string
          supports: string[] | null
          tags_filtre: string[] | null
          tags_theme: string[] | null
          tip: string | null
        }
        Insert: {
          a_observer?: string | null
          a_retenir?: string | null
          accroche?: string | null
          accroches_formes?: Json | null
          accroches_variantes?: string[] | null
          actions?: Json | null
          club_id?: string | null
          created_at?: string
          dimension?: string | null
          erreur_frequente?: string | null
          vote_vrai?: string | null
          vote_faux?: string | null
          explication?: string | null
          ffv_level?: number | null
          id: string
          is_public?: boolean | null
          niveau?: number | null
          objectif: string
          owner_id?: string | null
          question: string
          ressources?: Json
          source?: string
          supports?: string[] | null
          tags_filtre?: string[] | null
          tags_theme?: string[] | null
          tip?: string | null
        }
        Update: {
          a_observer?: string | null
          a_retenir?: string | null
          accroche?: string | null
          accroches_formes?: Json | null
          accroches_variantes?: string[] | null
          actions?: Json | null
          club_id?: string | null
          created_at?: string
          dimension?: string | null
          erreur_frequente?: string | null
          vote_vrai?: string | null
          vote_faux?: string | null
          explication?: string | null
          ffv_level?: number | null
          id?: string
          is_public?: boolean | null
          niveau?: number | null
          objectif?: string
          owner_id?: string | null
          question?: string
          ressources?: Json
          source?: string
          supports?: string[] | null
          tags_filtre?: string[] | null
          tags_theme?: string[] | null
          tip?: string | null
        }
        Relationships: []
      }
      pending_profiles: {
        Row: {
          club_id: string | null
          created_at: string | null
          email: string
          full_name: string | null
          role: string
        }
        Insert: {
          club_id?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          role?: string
        }
        Update: {
          club_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_profiles_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          club_id: string | null
          created_at: string | null
          defi_fil_rouge_id: string | null
          email: string | null
          full_name: string | null
          id: string
          password_set: boolean
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          club_id?: string | null
          created_at?: string | null
          defi_fil_rouge_id?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          password_set?: boolean
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          club_id?: string | null
          created_at?: string | null
          defi_fil_rouge_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          password_set?: boolean
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_defi_fil_rouge_id_fkey"
            columns: ["defi_fil_rouge_id"]
            isOneToOne: false
            referencedRelation: "defis"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          attempted_at: string
          id: string
          score: number
          theme: string | null
          total_questions: number
          user_id: string
        }
        Insert: {
          attempted_at?: string
          id?: string
          score: number
          theme?: string | null
          total_questions: number
          user_id: string
        }
        Update: {
          attempted_at?: string
          id?: string
          score?: number
          theme?: string | null
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      saved_pedagogical_cards: {
        Row: {
          content_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_pedagogical_cards_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "pedagogical_content"
            referencedColumns: ["id"]
          },
        ]
      }
      session_step_pedagogical_links: {
        Row: {
          pedagogical_content_id: string
          session_step_id: string
        }
        Insert: {
          pedagogical_content_id: string
          session_step_id: string
        }
        Update: {
          pedagogical_content_id?: string
          session_step_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_step_pedagogical_links_pedagogical_content_id_fkey"
            columns: ["pedagogical_content_id"]
            isOneToOne: false
            referencedRelation: "pedagogical_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_step_pedagogical_links_session_step_id_fkey"
            columns: ["session_step_id"]
            isOneToOne: false
            referencedRelation: "session_structure"
            referencedColumns: ["id"]
          },
        ]
      }
      session_structure: {
        Row: {
          created_at: string
          id: string
          session_id: string
          step_description: string | null
          step_duration_minutes: number | null
          step_order: number
          step_title: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_id: string
          step_description?: string | null
          step_duration_minutes?: number | null
          step_order: number
          step_title: string
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string
          step_description?: string | null
          step_duration_minutes?: number | null
          step_order?: number
          step_title?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_structure_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          id: string
          session_order: number
          stage_id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_order: number
          stage_id: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          session_order?: number
          stage_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      stage_exploits: {
        Row: {
          completed_at: string | null
          created_at: string
          exploit_id: string
          id: string
          notes: string | null
          preuves_url: string[] | null
          stage_id: string
          status: string | null
          structured_data: Json | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          exploit_id: string
          id?: string
          notes?: string | null
          preuves_url?: string[] | null
          stage_id: string
          status?: string | null
          structured_data?: Json | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          exploit_id?: string
          id?: string
          notes?: string | null
          preuves_url?: string[] | null
          stage_id?: string
          status?: string | null
          structured_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "stage_exploits_exploit_id_fkey"
            columns: ["exploit_id"]
            isOneToOne: false
            referencedRelation: "defis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_exploits_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      stage_game_history: {
        Row: {
          created_at: string
          game_id: string
          id: string
          percentage: number
          results: Json | null
          score: number
          stage_id: string
          total: number
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          percentage: number
          results?: Json | null
          score: number
          stage_id: string
          total: number
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          percentage?: number
          results?: Json | null
          score?: number
          stage_id?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "stage_game_history_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_game_history_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      stage_objective_reviews: {
        Row: {
          created_at: string
          execution_status: string
          id: string
          impact_level: string | null
          note: string | null
          pedagogical_content_id: string
          reasons: string[]
          stage_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          execution_status: string
          id?: string
          impact_level?: string | null
          note?: string | null
          pedagogical_content_id: string
          reasons?: string[]
          stage_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          execution_status?: string
          id?: string
          impact_level?: string | null
          note?: string | null
          pedagogical_content_id?: string
          reasons?: string[]
          stage_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stage_objective_reviews_pedagogical_content_id_fkey"
            columns: ["pedagogical_content_id"]
            isOneToOne: false
            referencedRelation: "pedagogical_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_objective_reviews_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      stage_preparations: {
        Row: {
          accroche_choisie: string | null
          actions: string[] | null
          chute: string | null
          created_at: string
          id: string
          pedagogical_content_id: string
          raconte: boolean | null
          stage_id: string
          updated_at: string
        }
        Insert: {
          accroche_choisie?: string | null
          actions?: string[] | null
          chute?: string | null
          created_at?: string
          id?: string
          pedagogical_content_id: string
          raconte?: boolean | null
          stage_id: string
          updated_at?: string
        }
        Update: {
          accroche_choisie?: string | null
          actions?: string[] | null
          chute?: string | null
          created_at?: string
          id?: string
          pedagogical_content_id?: string
          raconte?: boolean | null
          stage_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stage_preparations_pedagogical_content_id_fkey"
            columns: ["pedagogical_content_id"]
            isOneToOne: false
            referencedRelation: "pedagogical_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_preparations_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      stage_vote_results: {
        Row: {
          action_id: string | null
          affirmation_id: string
          attendu: boolean | null
          content_id: string
          created_at: string
          id: string
          participants: number | null
          stage_id: string
          updated_at: string
          votes_faux: number
          votes_incertain: number
          votes_vrai: number
        }
        Insert: {
          action_id?: string | null
          affirmation_id: string
          attendu?: boolean | null
          content_id: string
          created_at?: string
          id?: string
          participants?: number | null
          stage_id: string
          updated_at?: string
          votes_faux?: number
          votes_incertain?: number
          votes_vrai?: number
        }
        Update: {
          action_id?: string | null
          affirmation_id?: string
          attendu?: boolean | null
          content_id?: string
          created_at?: string
          id?: string
          participants?: number | null
          stage_id?: string
          updated_at?: string
          votes_faux?: number
          votes_incertain?: number
          votes_vrai?: number
        }
        Relationships: [
          {
            foreignKeyName: "stage_vote_results_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      stage_quizzes: {
        Row: {
          completed_at: string | null
          created_at: string
          game_id: string | null
          id: string
          points_awarded: number | null
          score_correct: number | null
          score_total: number | null
          stage_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          game_id?: string | null
          id?: string
          points_awarded?: number | null
          score_correct?: number | null
          score_total?: number | null
          stage_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          game_id?: string | null
          id?: string
          points_awarded?: number | null
          score_correct?: number | null
          score_total?: number | null
          stage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stage_quizzes_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_quizzes_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: true
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      stage_templates: {
        Row: {
          activity: string
          created_at: string
          defis_snapshot: string[] | null
          duration_days: number
          id: string
          level: string
          name: string
          owner_id: string
          sessions_snapshot: Json
          tags_conditions: string[] | null
          tags_periode: string[] | null
          tags_public: string[] | null
          tags_support: string[] | null
          tags_type_stage: string[] | null
          updated_at: string
        }
        Insert: {
          activity: string
          created_at?: string
          defis_snapshot?: string[] | null
          duration_days?: number
          id?: string
          level: string
          name: string
          owner_id: string
          sessions_snapshot?: Json
          tags_conditions?: string[] | null
          tags_periode?: string[] | null
          tags_public?: string[] | null
          tags_support?: string[] | null
          tags_type_stage?: string[] | null
          updated_at?: string
        }
        Update: {
          activity?: string
          created_at?: string
          defis_snapshot?: string[] | null
          duration_days?: number
          id?: string
          level?: string
          name?: string
          owner_id?: string
          sessions_snapshot?: Json
          tags_conditions?: string[] | null
          tags_periode?: string[] | null
          tags_public?: string[] | null
          tags_support?: string[] | null
          tags_type_stage?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      stages: {
        Row: {
          actions_semaine: string[] | null
          activity: string
          closed_at: string | null
          closing_notes: string | null
          created_at: string
          dates: string
          id: string
          level: string
          nb_stagiaires: number | null
          owner_id: string | null
          ressenti: Json | null
          selected_content: string[] | null
          suggested_thematics: string[] | null
          title: string
        }
        Insert: {
          actions_semaine?: string[] | null
          activity: string
          closed_at?: string | null
          closing_notes?: string | null
          created_at?: string
          dates: string
          id?: string
          level: string
          nb_stagiaires?: number | null
          owner_id?: string | null
          ressenti?: Json | null
          selected_content?: string[] | null
          suggested_thematics?: string[] | null
          title: string
        }
        Update: {
          actions_semaine?: string[] | null
          activity?: string
          closed_at?: string | null
          closing_notes?: string | null
          created_at?: string
          dates?: string
          id?: string
          level?: string
          nb_stagiaires?: number | null
          owner_id?: string | null
          ressenti?: Json | null
          selected_content?: string[] | null
          suggested_thematics?: string[] | null
          title?: string
        }
        Relationships: []
      }
      step_todos: {
        Row: {
          created_at: string
          done: boolean
          id: string
          is_content_header: boolean
          linked_content_id: string | null
          session_step_id: string
          text: string
          todo_order: number
        }
        Insert: {
          created_at?: string
          done?: boolean
          id?: string
          is_content_header?: boolean
          linked_content_id?: string | null
          session_step_id: string
          text: string
          todo_order?: number
        }
        Update: {
          created_at?: string
          done?: boolean
          id?: string
          is_content_header?: boolean
          linked_content_id?: string | null
          session_step_id?: string
          text?: string
          todo_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "step_todos_linked_content_id_fkey"
            columns: ["linked_content_id"]
            isOneToOne: false
            referencedRelation: "pedagogical_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "step_todos_session_step_id_fkey"
            columns: ["session_step_id"]
            isOneToOne: false
            referencedRelation: "session_structure"
            referencedColumns: ["id"]
          },
        ]
      }
      sujet_sources: {
        Row: {
          pedagogical_content_id: string
          sujet_id: string
        }
        Insert: {
          pedagogical_content_id: string
          sujet_id: string
        }
        Update: {
          pedagogical_content_id?: string
          sujet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sujet_sources_pedagogical_content_id_fkey"
            columns: ["pedagogical_content_id"]
            isOneToOne: false
            referencedRelation: "pedagogical_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sujet_sources_sujet_id_fkey"
            columns: ["sujet_id"]
            isOneToOne: false
            referencedRelation: "sujets"
            referencedColumns: ["id"]
          },
        ]
      }
      sujets: {
        Row: {
          a_retenir: string | null
          accroche: string | null
          acquis: boolean
          created_at: string
          id: string
          notes_perso: string | null
          owner_id: string
          points_cles: string | null
          stage_id: string | null
          titre: string
          updated_at: string
        }
        Insert: {
          a_retenir?: string | null
          accroche?: string | null
          acquis?: boolean
          created_at?: string
          id?: string
          notes_perso?: string | null
          owner_id: string
          points_cles?: string | null
          stage_id?: string | null
          titre: string
          updated_at?: string
        }
        Update: {
          a_retenir?: string | null
          accroche?: string | null
          acquis?: boolean
          created_at?: string
          id?: string
          notes_perso?: string | null
          owner_id?: string
          points_cles?: string | null
          stage_id?: string | null
          titre?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sujets_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_defi_validations: {
        Row: {
          defi_id: string
          id: string
          proof_url: string | null
          user_id: string
          validated_at: string
        }
        Insert: {
          defi_id: string
          id?: string
          proof_url?: string | null
          user_id: string
          validated_at?: string
        }
        Update: {
          defi_id?: string
          id?: string
          proof_url?: string | null
          user_id?: string
          validated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_defi_validations_defi_id_fkey"
            columns: ["defi_id"]
            isOneToOne: false
            referencedRelation: "defis"
            referencedColumns: ["id"]
          },
        ]
      }
      user_game_progress: {
        Row: {
          game_card_id: string
          id: string
          played_at: string
          result: Json | null
          user_id: string
        }
        Insert: {
          game_card_id: string
          id?: string
          played_at?: string
          result?: Json | null
          user_id: string
        }
        Update: {
          game_card_id?: string
          id?: string
          played_at?: string
          result?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_game_progress_game_card_id_fkey"
            columns: ["game_card_id"]
            isOneToOne: false
            referencedRelation: "game_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          demarree_le: string
          est_mobile: boolean | null
          est_pwa: boolean | null
          id: string
          nb_pages: number
          user_agent: string | null
          user_id: string
          vue_le: string
        }
        Insert: {
          demarree_le?: string
          est_mobile?: boolean | null
          est_pwa?: boolean | null
          id?: string
          nb_pages?: number
          user_agent?: string | null
          user_id: string
          vue_le?: string
        }
        Update: {
          demarree_le?: string
          est_mobile?: boolean | null
          est_pwa?: boolean | null
          id?: string
          nb_pages?: number
          user_agent?: string | null
          user_id?: string
          vue_le?: string
        }
        Relationships: []
      }
      user_validations: {
        Row: {
          content_id: string | null
          id: string
          session_id: string | null
          user_id: string | null
          validated_at: string | null
        }
        Insert: {
          content_id?: string | null
          id?: string
          session_id?: string | null
          user_id?: string | null
          validated_at?: string | null
        }
        Update: {
          content_id?: string | null
          id?: string
          session_id?: string | null
          user_id?: string | null
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_validations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      week_observations: {
        Row: {
          created_at: string
          id: string
          individual_count: number | null
          linked_thematic: string | null
          location_note: string | null
          observation_type: string | null
          observed_at: string | null
          pedagogical_action: string | null
          pillar: string | null
          species_label: string | null
          species_uncertain: boolean
          stage_id: string
          target_id: string | null
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          individual_count?: number | null
          linked_thematic?: string | null
          location_note?: string | null
          observation_type?: string | null
          observed_at?: string | null
          pedagogical_action?: string | null
          pillar?: string | null
          species_label?: string | null
          species_uncertain?: boolean
          stage_id: string
          target_id?: string | null
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          individual_count?: number | null
          linked_thematic?: string | null
          location_note?: string | null
          observation_type?: string | null
          observed_at?: string | null
          pedagogical_action?: string | null
          pillar?: string | null
          species_label?: string | null
          species_uncertain?: boolean
          stage_id?: string
          target_id?: string | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "week_observations_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "week_observations_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "club_observation_targets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      activite_evenements: {
        Row: {
          genre: string | null
          stage_id: string | null
          survenu_le: string | null
          user_id: string | null
        }
        Relationships: []
      }
      activite_par_jour: {
        Row: {
          derniere_action: string | null
          genres: string[] | null
          jour: string | null
          nb_actions: number | null
          nb_genres: number | null
          nb_semaines: number | null
          premiere_action: string | null
          user_id: string | null
        }
        Relationships: []
      }
      activite_par_moniteur: {
        Row: {
          club_id: string | null
          dernier_jour: string | null
          email: string | null
          full_name: string | null
          inscrit_le: string | null
          jours_actifs: number | null
          jours_actifs_30j: number | null
          premier_jour: string | null
          regularite_pct: number | null
          role: string | null
          total_actions: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_directory: {
        Row: {
          club_id: string | null
          club_name: string | null
          full_name: string | null
          id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_activite_journaliere: {
        Args: { p_depuis?: string }
        Returns: {
          jour: string
          nb_actions: number
          nb_moniteurs: number
        }[]
      }
      admin_activite_moniteurs: {
        Args: never
        Returns: {
          club_id: string
          dernier_jour: string
          email: string
          full_name: string
          inscrit_le: string
          jours_actifs: number
          jours_actifs_30j: number
          last_sign_in_at: string
          premier_jour: string
          regularite_pct: number
          role: string
          total_actions: number
          user_id: string
        }[]
      }
      admin_activite_par_genre: {
        Args: { p_depuis?: string }
        Returns: {
          genre: string
          nb_actions: number
          nb_moniteurs: number
        }[]
      }
      admin_delete_user: { Args: { p_user_id: string }; Returns: undefined }
      admin_list_last_sign_in: {
        Args: never
        Returns: {
          id: string
          last_sign_in_at: string
        }[]
      }
      admin_pages_vues: {
        Args: { p_depuis?: string }
        Returns: {
          chemin: string
          nb_moniteurs: number
          nb_vues: number
        }[]
      }
      admin_sessions_moniteurs: {
        Args: { p_depuis?: string }
        Returns: {
          derniere_session: string
          duree_moyenne_min: number
          duree_totale_min: number
          email: string
          full_name: string
          nb_pages: number
          nb_sessions: number
          part_mobile_pct: number
          user_id: string
        }[]
      }
      admin_set_pending_profile: {
        Args: {
          p_club_id?: string
          p_email: string
          p_full_name: string
          p_role: string
        }
        Returns: undefined
      }
      admin_update_profile: {
        Args: {
          p_club_id: string
          p_full_name: string
          p_role: string
          p_user_id: string
        }
        Returns: undefined
      }
      admin_update_role: {
        Args: { p_role: string; p_user_id: string }
        Returns: undefined
      }
      admin_upsert_profile: {
        Args: {
          p_club_id?: string
          p_email: string
          p_full_name: string
          p_role: string
        }
        Returns: undefined
      }
      award_verified_points: {
        Args: { p_kind: string; p_reference: string; p_stage_id: string }
        Returns: number
      }
      revoke_verified_points: {
        Args: { p_kind: string; p_reference: string; p_stage_id: string }
        Returns: boolean
      }
      complete_stage_quiz: {
        Args: { p_answers: Json; p_game_id: string; p_stage_id: string }
        Returns: number
      }
      enregistrer_navigation: {
        Args: {
          p_chemin: string
          p_est_mobile?: boolean
          p_est_pwa?: boolean
          p_user_agent?: string
        }
        Returns: string
      }
    }
    Enums: {
      defi_preuve_type: "photo" | "checkbox" | "action" | "quiz"
      fiche_statut: "brouillon" | "publie"
      game_type: "quizz" | "triage" | "mots" | "dilemme"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      defi_preuve_type: ["photo", "checkbox", "action", "quiz"],
      fiche_statut: ["brouillon", "publie"],
      game_type: ["quizz", "triage", "mots", "dilemme"],
    },
  },
} as const
