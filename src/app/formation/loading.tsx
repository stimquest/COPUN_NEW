/**
 * Affiché dès le clic sur « Formation », pendant que le serveur lit la progression : le
 * moniteur voit tout de suite la page se dessiner au lieu d'un écran figé.
 */
export default function ChargementFormation() {
    return <div className="co-page" aria-busy="true" aria-label="Chargement de la formation">
        <header className="co-formation-intro">
            <p className="co-eyebrow">Formation</p>
            <h1>Comment parler d’environnement</h1>
        </header>
        <div className="grid gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map(i => <div key={i} className="h-40 animate-pulse rounded-carte bg-sauge/70"/>)}
        </div>
    </div>;
}
