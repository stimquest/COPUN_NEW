-- Tags libres (mots-clés) sur les fiches mémo, en complément des tags thématiques fixes
ALTER TABLE fiches_memo
    ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

-- Index pour filtrage rapide par tag libre
CREATE INDEX IF NOT EXISTS idx_fiches_memo_tags ON fiches_memo USING GIN (tags);
