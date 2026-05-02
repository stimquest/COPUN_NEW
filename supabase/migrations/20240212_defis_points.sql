-- Add points column to defis table
ALTER TABLE defis ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 2;
