ALTER TABLE stages
ADD COLUMN IF NOT EXISTS suggested_thematics text[] DEFAULT '{}';
