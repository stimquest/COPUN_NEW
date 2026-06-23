import Link from 'next/link';
import { getAllGames } from '@/actions/game-actions';
import GameLibrary from '@/components/games/GameLibrary';

export default async function RessourcesJeuxPage() {
    const games = await getAllGames();

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32">
            {/* Header */}
            <header className="mb-10">
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic mb-2">
                            Ressources
                        </h1>
                        <p className="text-slate-500 font-medium">
                            {games.length} jeu{games.length > 1 ? 'x' : ''} créé{games.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    <Link
                        href="/jeux/generateur"
                        className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 shrink-0"
                    >
                        <span className="material-symbols-outlined">add</span>
                        <span className="hidden sm:inline">Créer un jeu</span>
                    </Link>
                </div>

                {/* Onglets */}
                <div className="flex gap-2">
                    <Link
                        href="/ressources"
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:border-teal-300 hover:text-teal-600 transition"
                    >
                        Fiches mémo
                    </Link>
                    <span className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm">
                        Jeux
                    </span>
                </div>
            </header>

            <GameLibrary games={games} />
        </div>
    );
}
