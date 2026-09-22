import { ANGLES_REPONSE, LIBELLES_REPONSE, NB_CARTONS, marqueurSvg, type ReponseCarton } from '@/data/marqueurs-vote';

/**
 * Les cartons du vote, à imprimer une fois par le club.
 *
 * Deux pages : les marqueurs, puis les réponses. Imprimées en recto-verso bord à bord,
 * chaque marqueur se retrouve au dos de son trio de réponses.
 *
 * Le verso porte les trois mots disposés en triangle. L'enfant tourne son carton pour lire
 * sa réponse à l'endroit — et le marqueur, de l'autre côté, adopte du même coup
 * l'orientation que la caméra interprétera. Personne n'a de consigne à retenir.
 *
 * Placée sous /login parce que ce préfixe est public : le club doit pouvoir imprimer sans
 * ouvrir de session, souvent depuis le poste de l'accueil.
 */
export const metadata = { title: 'Cartons du vote — à imprimer' };

function Verso() {
    const rayon = 30;
    return <div className="cv-verso">
        {(Object.keys(LIBELLES_REPONSE) as ReponseCarton[]).map(reponse => {
            const angle = ANGLES_REPONSE[reponse];
            // Chaque mot est posé sur le rayon de son angle et tourné d'autant : il se lit à
            // l'endroit quand le carton pointe dans cette direction, et de travers sinon.
            const rad = (angle - 90) * Math.PI / 180;
            return <span key={reponse} className={`cv-mot cv-mot-${reponse}`} style={{
                left: `${50 + Math.cos(rad) * rayon}%`,
                top: `${50 + Math.sin(rad) * rayon}%`,
                transform: `translate(-50%, -50%) rotate(${angle}deg)`,
            }}>{LIBELLES_REPONSE[reponse]}</span>;
        })}
        {/* Repère central : sans lui, un carton tenu presque à plat ne montre pas quel bord
            l'enfant considère comme le haut. */}
        <span className="cv-fleche" aria-hidden="true">▲</span>
    </div>;
}

export default function CartonsVotePage() {
    const cartons = Array.from({ length: NB_CARTONS }, (_, i) => i);
    return <div className="cv-page">
        <header className="cv-intro">
            <h1>Cartons du vote</h1>
            <p>
                Imprimez ces deux pages en <strong>recto-verso, côté long</strong>, sur papier épais.
                Découpez selon les traits, plastifiez si possible : les cartons resservent toute la saison.
            </p>
            <p>
                Chaque enfant en reçoit un. Pour répondre, il le tourne jusqu’à lire sa réponse à l’endroit —
                rien d’autre à expliquer.
            </p>
        </header>

        <section className="cv-planche">
            <p className="cv-planche-titre">Page 1 — les marqueurs</p>
            <div className="cv-grille">
                {cartons.map(i => <div key={i} className="cv-carton">
                    <div className="cv-marqueur" dangerouslySetInnerHTML={{ __html: marqueurSvg(i) }}/>
                    <span className="cv-num">{i + 1}</span>
                </div>)}
            </div>
        </section>

        <section className="cv-planche cv-saut">
            <p className="cv-planche-titre">Page 2 — les réponses</p>
            {/* Colonnes inversées : au recto-verso, la première carte de la rangée se retrouve
                au dos de la dernière. Sans cette inversion, chaque marqueur atterrirait
                derrière les réponses d'un autre carton. */}
            <div className="cv-grille cv-grille-dos">
                {cartons.map(i => <div key={i} className="cv-carton"><Verso/></div>)}
            </div>
        </section>
    </div>;
}
