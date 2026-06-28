-- Modèles de stage créés par les moniteurs
CREATE TABLE IF NOT EXISTS stage_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    activity TEXT NOT NULL,
    level TEXT NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 5,
    tags_conditions TEXT[] DEFAULT '{}',   -- ex: vent_fort, mer_calme, pluie
    tags_periode TEXT[] DEFAULT '{}',      -- ex: juillet, aout, printemps
    tags_support TEXT[] DEFAULT '{}',      -- ex: catamaran_adulte, sup, kite_surf
    tags_type_stage TEXT[] DEFAULT '{}',   -- ex: decouverte, teambuilding, secourisme_bnssa
    tags_public TEXT[] DEFAULT '{}',       -- ex: enfants_7_10, adultes, entreprises
    sessions_snapshot JSONB NOT NULL DEFAULT '[]',
    defis_snapshot TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE stage_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'stage_templates' AND policyname = 'owner_all'
    ) THEN
        CREATE POLICY "owner_all" ON stage_templates
            FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
    END IF;
END $$;

-- Ajouter les colonnes de tags si elles n'existent pas encore
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stage_templates' AND column_name='tags_support') THEN
        ALTER TABLE stage_templates ADD COLUMN tags_support TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stage_templates' AND column_name='tags_type_stage') THEN
        ALTER TABLE stage_templates ADD COLUMN tags_type_stage TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stage_templates' AND column_name='tags_public') THEN
        ALTER TABLE stage_templates ADD COLUMN tags_public TEXT[] DEFAULT '{}';
    END IF;
END $$;
