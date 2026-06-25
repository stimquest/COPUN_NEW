-- Défi fil rouge : flag sur les défis d'observation long terme
ALTER TABLE defis ADD COLUMN IF NOT EXISTS fil_rouge BOOLEAN NOT NULL DEFAULT false;

-- Lien entre un moniteur et son défi de saison choisi
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS defi_fil_rouge_id TEXT REFERENCES defis(id) ON DELETE SET NULL;

-- Notes de terrain sur chaque validation (observation libre du moniteur)
ALTER TABLE stage_exploits ADD COLUMN IF NOT EXISTS notes TEXT;

-- Les 4 défis d'observation récurrente à valeur scientifique (même spot, même protocole)
UPDATE defis SET fil_rouge = true WHERE id IN (
    'defi_bio_2',
    'defi_laisse_1',
    'defi_erosion_1',
    'defi_faune_1'
);
