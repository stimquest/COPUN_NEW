import { getGameById } from '@/actions/game-actions';
import { notFound } from 'next/navigation';
import PlayClient from './PlayClient';

export default async function GamePlayPage({ params }: { params: Promise<{ gameId: string }> }) {
    const { gameId } = await params;
    const game = await getGameById(gameId);

    if (!game) {
        notFound();
    }

    return <PlayClient game={game as any} />;
}
