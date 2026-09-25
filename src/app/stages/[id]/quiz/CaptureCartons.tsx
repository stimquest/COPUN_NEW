'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LIBELLES_REPONSE, type ReponseCarton } from '@/data/marqueurs-vote';
import { lireCartons, type LectureCartons } from '@/lib/detection-cartons';

import { iconeMaterial } from '@/components/ui/Icone';
const Camera = iconeMaterial('photo_camera');
const RotateCcw = iconeMaterial('undo');
const X = iconeMaterial('close');

/**
 * La lecture des cartons par la caméra.
 *
 * Deux régimes distincts, et c'est ce qui rend l'écran utilisable :
 *
 *   - un aperçu continu, qui entoure chaque marqueur reconnu sans annoncer sa réponse. Le
 *     moniteur voit AVANT de déclencher combien de cartons sont détectés, sans influencer
 *     le vote en découvrant son résultat pendant que les enfants répondent.
 *   - une photo sur déclenchement, seule retenue. C'est elle qui fige le décompte proposé.
 *
 * L'aperçu tourne volontairement sur une image réduite et à cadence limitée : il sert à
 * cadrer, pas à mesurer. La photo, elle, est analysée en pleine résolution.
 *
 * Rien ne quitte l'appareil : la détection est locale, aucune image n'est envoyée ni
 * conservée. On filme des enfants.
 */

/** Hauteur d'analyse de l'aperçu. Au-delà, la cadence chute sans rien apporter au cadrage. */
const HAUTEUR_APERCU = 480;
/** Intervalle entre deux analyses d'aperçu : au-dessous, le téléphone chauffe pour rien. */
const PERIODE_MS = 350;

type MarqueurApercu = { id: number; points: string };

export default function CaptureCartons({ onLu, onFermer }: {
    onLu: (lecture: LectureCartons) => void;
    onFermer: () => void;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const apercuRef = useRef<HTMLCanvasElement>(null);
    const fluxRef = useRef<MediaStream | null>(null);
    const [pret, setPret] = useState(false);
    const [analyse, setAnalyse] = useState(false);
    const [lecture, setLecture] = useState<LectureCartons | null>(null);
    const [marqueurs, setMarqueurs] = useState<MarqueurApercu[]>([]);
    const [dimensionsApercu, setDimensionsApercu] = useState({ largeur: 1, hauteur: 1 });
    const [erreur, setErreur] = useState('');

    useEffect(() => {
        let annule = false;
        navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 } } })
            .then(flux => {
                if (annule) { flux.getTracks().forEach(p => p.stop()); return; }
                fluxRef.current = flux;
                if (videoRef.current) { videoRef.current.srcObject = flux; setPret(true); }
            })
            .catch(() => setErreur('La caméra n’est pas accessible. Vous pouvez saisir les réponses à la main.'));
        return () => {
            annule = true;
            fluxRef.current?.getTracks().forEach(piste => piste.stop());
        };
    }, []);

    /** Une passe d'aperçu : détecte sur une image réduite et positionne les cadres. */
    const scruter = useCallback(async () => {
        const video = videoRef.current, canvas = apercuRef.current;
        if (!video || !canvas || !video.videoWidth) return;
        const echelle = HAUTEUR_APERCU / video.videoHeight;
        canvas.width = Math.round(video.videoWidth * echelle);
        canvas.height = HAUTEUR_APERCU;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const vue = await lireCartons(ctx.getImageData(0, 0, canvas.width, canvas.height));
        setDimensionsApercu({ largeur: canvas.width, hauteur: canvas.height });
        setMarqueurs(vue.cartons.map(carton => ({
            id: carton.id,
            points: carton.coins.map(coin => `${coin.x},${coin.y}`).join(' '),
        })));
    }, []);

    // L'aperçu s'arrête dès qu'une photo est prise : les cadres doivent correspondre à
    // l'image figée, pas continuer à bouger derrière un décompte arrêté.
    useEffect(() => {
        if (!pret || lecture) return;
        let actif = true;
        let minuteur: number;
        const boucle = async () => {
            if (!actif) return;
            try { await scruter(); } catch { /* une passe ratée n'interrompt pas le cadrage */ }
            if (actif) minuteur = window.setTimeout(boucle, PERIODE_MS);
        };
        boucle();
        return () => { actif = false; window.clearTimeout(minuteur); };
    }, [pret, lecture, scruter]);

    const photographier = async () => {
        const video = videoRef.current, canvas = canvasRef.current;
        if (!video || !canvas) return;
        setAnalyse(true);
        setErreur('');
        try {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) throw new Error('canvas');
            ctx.drawImage(video, 0, 0);
            setLecture(await lireCartons(ctx.getImageData(0, 0, canvas.width, canvas.height)));
        } catch {
            setErreur('La lecture a échoué. Reprenez la photo ou saisissez à la main.');
        } finally {
            setAnalyse(false);
        }
    };

    const total = lecture ? Object.values(lecture.decompte).reduce((s, n) => s + n, 0) : 0;
    const vus = marqueurs.length;

    return <div className="co-capture">
        <header className="co-capture-head">
            <p>{lecture ? 'Comptage' : 'Cadrez le groupe'}</p>
            <button type="button" onClick={onFermer} aria-label="Fermer la caméra"><X size={20}/></button>
        </header>

        <div className="co-capture-vue">
            <video ref={videoRef} autoPlay playsInline muted className={lecture ? 'co-capture-fige' : undefined}/>
            {/* Le SVG partage le cadrage `cover` de la vidéo. Les quatre coins réels
                restent superposés au code même lorsque le mobile rogne l'image. */}
            {!lecture && <svg className="co-detection-layer"
                viewBox={`0 0 ${dimensionsApercu.largeur} ${dimensionsApercu.hauteur}`}
                preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                {marqueurs.map(marqueur => <polygon key={marqueur.id} points={marqueur.points}/>) }
            </svg>}
            <canvas ref={canvasRef} hidden/>
            <canvas ref={apercuRef} hidden/>
        </div>

        {!lecture && <p className="co-capture-note">
            {vus === 0
                ? 'Aucun code détecté pour l’instant.'
                : `${vus} code${vus > 1 ? 's' : ''} détecté${vus > 1 ? 's' : ''}`}
        </p>}

        {erreur && <p role="alert" className="co-capture-erreur">{erreur}</p>}

        {lecture ? <>
            <div className="co-capture-resultat">
                {(Object.keys(LIBELLES_REPONSE) as ReponseCarton[]).map(reponse => (
                    <div key={reponse}>
                        <span>{LIBELLES_REPONSE[reponse]}</span>
                        <strong>{lecture.decompte[reponse]}</strong>
                    </div>
                ))}
            </div>
            <p className="co-capture-note">
                {total === 0
                    ? 'Aucun carton reconnu. Rapprochez-vous ou vérifiez la lumière.'
                    : `${total} carton${total > 1 ? 's' : ''} lu${total > 1 ? 's' : ''}`}
                {lecture.malOrientes > 0 && ` · ${lecture.malOrientes} mal orienté${lecture.malOrientes > 1 ? 's' : ''}, à faire relever`}
            </p>
            <div className="co-capture-actions">
                <button type="button" className="co-vote-secondary" onClick={() => setLecture(null)}>
                    <RotateCcw size={17}/> Reprendre
                </button>
                <button type="button" className="co-vote-primary" disabled={total === 0} onClick={() => onLu(lecture)}>
                    Utiliser ce comptage
                </button>
            </div>
        </> : <div className="co-capture-actions">
            <button type="button" className="co-vote-primary" disabled={!pret || analyse} onClick={photographier}>
                <Camera size={18}/> {analyse ? 'Lecture…' : 'Photographier'}
            </button>
        </div>}
    </div>;
}
