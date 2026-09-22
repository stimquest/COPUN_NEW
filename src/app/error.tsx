'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
    return <div role="alert" className="p-8 space-y-4">
        <h1 className="text-xl font-bold">Le chargement a échoué</h1>
        <p>Vos données n’ont pas pu être chargées. Réessayez dans un instant.</p>
        <button onClick={reset} className="rounded-xl bg-teal-700 px-4 py-2 text-white">Réessayer</button>
    </div>;
}
