import { getAllGameCards } from '@/actions/game-actions';
import GeneratorClient from './GeneratorClient';

export default async function GenerateurPage() {
    const cards = await getAllGameCards();

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <header className="mb-10">
                <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic mb-2">
                    Générateur de Jeux
                </h1>
                <p className="text-slate-500 font-medium max-w-2xl">
                    Créez un jeu personnalisé en quelques clics. Choisissez le mode automatique pour un mélange aléatoire,
                    ou le mode manuel pour sélectionner vos cartes une par une.
                </p>
            </header>

            <GeneratorClient initialCards={cards as any} />
        </div>
    );
}
