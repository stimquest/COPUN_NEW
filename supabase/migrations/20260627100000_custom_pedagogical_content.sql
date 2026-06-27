-- Extend pedagogical_content with source and sport-specific fields
ALTER TABLE public.pedagogical_content
    ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'copun'
        CHECK (source IN ('copun', 'custom')),
    ADD COLUMN IF NOT EXISTS ffv_level INTEGER
        CHECK (ffv_level BETWEEN 1 AND 5),
    ADD COLUMN IF NOT EXISTS supports TEXT[] DEFAULT '{}';

-- content_todos: reusable checklist items attached to a pedagogical_content card
-- These are templates — they get copied as step_todos when a card is placed in a session step
CREATE TABLE IF NOT EXISTS public.content_todos (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id   TEXT NOT NULL REFERENCES public.pedagogical_content(id) ON DELETE CASCADE,
    text         TEXT NOT NULL,
    todo_order   INTEGER NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS content_todos_content_id_idx ON public.content_todos(content_id);

ALTER TABLE public.content_todos ENABLE ROW LEVEL SECURITY;

-- Only the owner of the parent pedagogical_content can manage its content_todos
CREATE POLICY "content_todos_select" ON public.content_todos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pedagogical_content pc
            WHERE pc.id = content_todos.content_id
              AND (pc.owner_id = auth.uid() OR pc.source = 'copun')
        )
    );

CREATE POLICY "content_todos_insert" ON public.content_todos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pedagogical_content pc
            WHERE pc.id = content_todos.content_id
              AND pc.owner_id = auth.uid()
        )
    );

CREATE POLICY "content_todos_update" ON public.content_todos
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.pedagogical_content pc
            WHERE pc.id = content_todos.content_id
              AND pc.owner_id = auth.uid()
        )
    );

CREATE POLICY "content_todos_delete" ON public.content_todos
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.pedagogical_content pc
            WHERE pc.id = content_todos.content_id
              AND pc.owner_id = auth.uid()
        )
    );

-- RLS policy for custom pedagogical_content (owner can manage, others can see copun content)
-- Drop and recreate to avoid conflicts with existing policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "custom_content_select" ON public.pedagogical_content;
    DROP POLICY IF EXISTS "custom_content_insert" ON public.pedagogical_content;
    DROP POLICY IF EXISTS "custom_content_update" ON public.pedagogical_content;
    DROP POLICY IF EXISTS "custom_content_delete" ON public.pedagogical_content;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Allow reading: copun content visible to all authenticated, custom content only to owner
CREATE POLICY "custom_content_select" ON public.pedagogical_content
    FOR SELECT USING (
        source = 'copun'
        OR owner_id = auth.uid()
        OR (is_public = true AND club_id IS NOT NULL)
    );

CREATE POLICY "custom_content_insert" ON public.pedagogical_content
    FOR INSERT WITH CHECK (
        source = 'custom' AND owner_id = auth.uid()
    );

CREATE POLICY "custom_content_update" ON public.pedagogical_content
    FOR UPDATE USING (
        source = 'custom' AND owner_id = auth.uid()
    );

CREATE POLICY "custom_content_delete" ON public.pedagogical_content
    FOR DELETE USING (
        source = 'custom' AND owner_id = auth.uid()
    );
