'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, RotateCcw, X } from 'lucide-react';
import { LIBELLES_REPONSE, type ReponseCarton } from '@/data/marqueurs-vote';
import { lireCartons, type LectureCartons } from '@/lib/detection-cartons';

/**
 * La lecture des cartons par la caméra.
 *
 * Une photo sur déclenchement, pas un flux analysé en continu : le moniteur cadre, attend
 * que le groupe soit prêt, et déclenche. Analyser chaque image imposerait une contrainte de
 * performance inutile et ferait défiler des décomptes changeants sous ses yeux.
 *
 * Le résultat lui est montré avant d'être retenu — la caméra propose, il tranche. C'est ce
 * qui permet de reprendre une photo ratée plutôt que d'enregistrer un comptage faux, et ce
 * qui garde la saisie manuelle utilisable à tout moment.
 *
 * La photo ne quitte jamais l'appareil : la détection tourne dans le navigateur, et rien
 * n'est envoyé ni conservé. On photographie des enfants.
 */
export default function CaptureCartons({ onLu, onFermer }: {
    onLu: (lecture: LectureCartons) => void;
    onFermer: () => void;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fluxRef = useRef<MediaStream | null>(null);
    const [pret, setPret] = useState(false);
    const [analyse, setAnalyse] = useState(false);
    const [lecture, setLecture] = useState<LectureCartons | null>(null);
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

    return <div className="co-capture">
        <header className="co-capture-head">
            <p>Photographier les cartons</p>
            <button type="button" onClick={onFermer} aria-label="Fermer la caméra"><X size={20}/></button>
        </header>

        <div className="co-capture-vue">
            <video ref={videoRef} autoPlay playsInline muted className={lecture ? 'co-capture-fige' : undefined}/>
            <canvas ref={canvasRef} hidden/>
        </div>

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
