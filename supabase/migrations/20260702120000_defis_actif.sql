ALTER TABLE public.defis
ADD COLUMN IF NOT EXISTS actif boolean NOT NULL DEFAULT true;

UPDATE public.defis SET actif = false
WHERE id IN ('defi_jeu_1', 'defi_dechets_1', 'defi_collectif_5');
