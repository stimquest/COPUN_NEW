import Link from 'next/link';
import { getAllGames } from '@/actions/game-actions';
import GameLibrary from '@/components/games/GameLibrary';

export default async function JeuxPage() {
    const games = await getAllGames();

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic mb-2">
                        Bibliothèque de Jeux
                    </h1>
                    <p className="text-slate-500 font-medium">
                        {games.length} jeu{games.length > 1 ? 'x' : ''} créé{games.length > 1 ? 's' : ''}
                    </p>
                </div>
                <Link
                    href="/jeux/generateur"
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                >
                    <span className="material-symbols-outlined">add</span>
                    Créer un Jeu
                </Link>
            </header>

            <GameLibrary games={games} />
        </div>
    );
}
