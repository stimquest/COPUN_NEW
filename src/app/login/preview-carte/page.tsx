import fiches from '@/data/__preview-fiches.json';
import LectureCarte from '@/components/explorer/LectureCarte';
import type { PedagogicalContent } from '@/types';

/** Page temporaire : juger le rendu d'une carte en face unique sans se connecter.
 *  Placée sous /login car ce préfixe est public (voir PUBLIC_PATHS du middleware).
 *  Fiche 7 = pire cas du catalogue (1355 car.), fiche 11 = cas médian (1028 car.).
 *  À supprimer une fois la mise en page validée. */
export default function PreviewCarte() {
    return (
        <div className="min-h-screen bg-slate-100 py-6">
            <div className="mx-auto max-w-[420px] space-y-8 px-4">
                {(fiches as unknown as PedagogicalContent[]).map(fiche => (
                    <div key={fiche.id}>
                        <p className="mb-2 text-xs font-bold text-slate-500">Fiche {fiche.id}</p>
                        <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-lg">
                            <div className="bg-amber-600 px-5 py-4">
                                <h3 className="text-[17px] font-bold leading-snug text-white">{fiche.question}</h3>
                            </div>
                            <div className="px-5 pb-6 pt-5">
                                <LectureCarte fiche={fiche} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
