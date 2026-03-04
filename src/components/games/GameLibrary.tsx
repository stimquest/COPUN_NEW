'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import Link from 'next/link';
import { deleteGame } from '@/actions/game-actions';

type GameSection = { items?: unknown[] };
type Game = {
    id: string;
    title: string;
    theme: string | null;
    created_at: string;
    game_data: {
        triageCotier?: GameSection;
        motsEnRafale?: GameSection;
        dilemmeDuMarin?: GameSection;
        leGrandQuizz?: GameSection;
    };
};

export default function GameLibrary({ games }: { games: Game[] }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleDelete = (gameId: string, gameTitle: string) => {
        if (!confirm(`Supprimer le jeu "${gameTitle}" ?`)) return;

        startTransition(async () => {
            await deleteGame(gameId);
            router.refresh();
        });
    };

    if (games.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">sports_esports</span>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Aucun jeu créé</h2>
                <p className="text-slate-500 mb-6">Commencez par créer votre premier jeu pédagogique</p>
                <Link
                    href="/jeux/generateur"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
                >
                    <span className="material-symbols-outlined">add</span>
                    Créer un Jeu
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => {
                const gd = game.game_data || {};
                const cardCount =
                    (gd.triageCotier?.items?.length || 0) +
                    (gd.motsEnRafale?.items?.length || 0) +
                    (gd.dilemmeDuMarin?.items?.length || 0) +
                    (gd.leGrandQuizz?.items?.length || 0);

                return (
                    <div
                        key={game.id}
                        className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-indigo-500 transition-all relative"
                    >
                        {/* Action buttons */}
                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                            <Link
                                href={`/jeux/generateur?edit=${game.id}`}
                                className="size-8 rounded-lg bg-slate-100 hover:bg-blue-100 flex items-center justify-center text-slate-500 hover:text-blue-600 transition"
                                title="Modifier"
                            >
                                <span className="material-symbols-outlined text-lg">edit</span>
                            </Link>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleDelete(game.id, game.title);
                                }}
                                disabled={isPending}
                                className="size-8 rounded-lg bg-slate-100 hover:bg-red-100 flex items-center justify-center text-slate-500 hover:text-red-600 transition disabled:opacity-50"
                                title="Supprimer"
                            >
                                <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                        </div>

                        <Link href={`/jeux/${game.id}`} className="block">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                                    <span className="material-symbols-outlined text-2xl">sports_esports</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition">
                                        {game.title}
                                    </h3>
                                    <p className="text-sm text-slate-500">{cardCount} cartes</p>
                                </div>
                            </div>

                            {game.theme && (
                                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full mb-4">
                                    {game.theme}
                                </span>
                            )}

                            <div className="flex gap-2 flex-wrap">
                                {(gd.triageCotier?.items?.length ?? 0) > 0 && (
                                    <span className="size-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                        <span className="material-symbols-outlined text-sm">rule</span>
                                    </span>
                                )}
                                {(gd.leGrandQuizz?.items?.length ?? 0) > 0 && (
                                    <span className="size-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <span className="material-symbols-outlined text-sm">quiz</span>
                                    </span>
                                )}
                                {(gd.motsEnRafale?.items?.length ?? 0) > 0 && (
                                    <span className="size-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                        <span className="material-symbols-outlined text-sm">edit_note</span>
                                    </span>
                                )}
                                {(gd.dilemmeDuMarin?.items?.length ?? 0) > 0 && (
                                    <span className="size-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                        <span className="material-symbols-outlined text-sm">call_split</span>
                                    </span>
                                )}
                            </div>

                            <p className="text-xs text-slate-400 mt-4">
                                Créé le {new Date(game.created_at).toLocaleDateString('fr-FR')}
                            </p>
                        </Link>
                    </div>
                );
            })}
        </div>
    );
}
