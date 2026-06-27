import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FichesClient } from './FichesClient';
import { ContentTodo, PedagogicalContent } from '@/types';

export default async function FichesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data } = await supabase
        .from('pedagogical_content')
        .select('*, content_todos(*)')
        .eq('source', 'custom')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    const fiches: (PedagogicalContent & { todos: ContentTodo[] })[] = (data ?? []).map(row => ({
        ...row,
        todos: (row.content_todos ?? []).sort(
            (a: ContentTodo, b: ContentTodo) => a.todo_order - b.todo_order
        ),
    }));

    return <FichesClient initialFiches={fiches} />;
}
