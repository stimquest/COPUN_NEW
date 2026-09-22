import { ANGLES_REPONSE, LIBELLES_REPONSE, marqueurSvg, MOTIFS_4X4, type ReponseCarton } from '@/data/marqueurs-vote';

/**
 * Planche de test : douze marqueurs déjà orientés, comme le serait un groupe ayant répondu.
 *
 * Elle sert à vérifier la lecture sans réunir d'enfants — on l'affiche sur un écran ou on
 * l'imprime, on la photographie depuis l'écran de vote, et le décompte attendu est écrit
 * en bas de page. Un écart signale immédiatement d'où vient le problème : marqueur non
 * reconnu, angle mal lu, ou carton compté deux fois.
 *
 * Les orientations sont fixées ici, pas tirées au hasard : un tirage différent à chaque
 * affichage rendrait le décompte attendu inutilisable pour comparer deux essais.
 */
export const metadata = { title: 'Test de lecture — cartons du vote' };

/** Douze réponses mêlées, dont deux volontairement de travers. */
const SCENARIO: { reponse: ReponseCarton | 'travers'; angle: number }[] = [
    { reponse: 'vrai', angle: 0 },
    { reponse: 'faux', angle: 120 },
    { reponse: 'vrai', angle: 12 },        // légèrement penché, doit rester VRAI
    { reponse: 'incertain', angle: 240 },
    { reponse: 'vrai', angle: 350 },       // penché dans l'autre sens
    { reponse: 'travers', angle: 60 },     // entre deux réponses : doit être refusé
    { reponse: 'faux', angle: 108 },
    { reponse: 'vrai', angle: 33 },        // limite haute de la tolérance
    { reponse: 'incertain', angle: 228 },
    { reponse: 'faux', angle: 134 },
    { reponse: 'travers', angle: 180 },    // à 60° des trois positions
    { reponse: 'vrai', angle: 0 },
];

export default function CartonsTestPage() {
    const attendu = SCENARIO.reduce((acc, item) => {
        if (item.reponse === 'travers') acc.travers += 1;
        else acc[item.reponse] += 1;
        return acc;
    }, { vrai: 0, faux: 0, incertain: 0, travers: 0 });

    return <div className="cv-page">
        <header className="cv-intro">
            <h1>Test de lecture</h1>
            <p>
                Douze marqueurs déjà orientés, comme un groupe qui aurait répondu. Ouvrez la caméra
                depuis un vote et photographiez cette page — à l’écran ou imprimée.
            </p>
            <p>
                Deux cartons sont volontairement tenus de travers : ils doivent être signalés
                « mal orientés », pas rattachés à une réponse.
            </p>
        </header>

        <div className="ct-grille">
            {SCENARIO.map((item, i) => (
                <div key={i} className="ct-case">
                    <div className="ct-marqueur" style={{ transform: `rotate(${item.angle}deg)` }}
                        dangerouslySetInnerHTML={{ __html: marqueurSvg(i % MOTIFS_4X4.length, 160) }}/>
                    <span className="ct-legende">
                        #{i} · {item.angle}°
                        <br/>
                        {item.reponse === 'travers' ? 'mal orienté' : LIBELLES_REPONSE[item.reponse]}
                    </span>
                </div>
            ))}
        </div>

        <section className="ct-attendu">
            <p className="cv-planche-titre">Décompte attendu</p>
            <div className="ct-attendu-grille">
                {(Object.keys(LIBELLES_REPONSE) as ReponseCarton[]).map(reponse => (
                    <div key={reponse}>
                        <span>{LIBELLES_REPONSE[reponse]}</span>
                        <strong>{attendu[reponse]}</strong>
                        <small>cible {ANGLES_REPONSE[reponse]}°</small>
                    </div>
                ))}
                <div>
                    <span>MAL ORIENTÉS</span>
                    <strong>{attendu.travers}</strong>
                    <small>hors tolérance</small>
                </div>
            </div>
            <p className="ct-note">
                12 marqueurs distincts : si la caméra en compte davantage, un reflet a été lu deux fois.
            </p>
        </section>
    </div>;
}
