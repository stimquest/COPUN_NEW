-- Add linked_content_id to step_todos to support "fiche sportive" blocks in step content
-- A row with linked_content_id is either:
--   is_content_header = true  → the fiche title (non-checkable header)
--   is_content_header = false → a sub-todo of that fiche (checkable)
-- Rows without linked_content_id are plain text todos (existing behavior)

ALTER TABLE public.step_todos
    ADD COLUMN IF NOT EXISTS linked_content_id TEXT REFERENCES public.pedagogical_content(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS is_content_header BOOLEAN NOT NULL DEFAULT false;
