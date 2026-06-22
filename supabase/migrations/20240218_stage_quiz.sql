-- Quiz de fin de stage : bilan de transmission des connaissances
-- Le quiz est créé comme un game dans la table games (leGrandQuizz)
-- Ce tableau lie le game au stage et enregistre le résultat final

CREATE TABLE IF NOT EXISTS stage_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
    game_id UUID REFERENCES games(id) ON DELETE SET NULL,
    score_correct INTEGER,
    score_total INTEGER,
    points_awarded INTEGER,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(stage_id) -- un seul quiz par stage
);

ALTER TABLE stage_quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage their stage quiz" ON stage_quizzes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM stages
            WHERE stages.id = stage_quizzes.stage_id
            AND stages.owner_id = auth.uid()
        )
    );

CREATE INDEX stage_quizzes_stage_id_idx ON stage_quizzes(stage_id);
