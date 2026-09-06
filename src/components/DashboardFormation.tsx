'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ResumeFormation } from '@/actions/formation-actions';

/** Mot-clé affiché sous chaque cercle — court plutôt qu'une icône abstraite (engrenage,
 *  stylo…) qu'il fallait deviner. Un mot se lit directement, une icône se devine. */
const MOT_CLE: Record<string, string> = {
    pourquoi: 'Pourquoi',
    'quoi-dire': 'Quoi dire',
    'faire-vivre': 'Faire vivre',
    methode: 'Méthode',
};

/**
 * Carte de formation, dans la zone colorée de l'accueil `/stages` — au-dessus de la carte
 * « Cette semaine ». Toute cette zone dégradée EST l'accueil ; la formation en est la
 * première carte tant qu'elle n'est pas terminée.
 *
 * Reste dans le même registre translucide que le reste de la zone dégradée (le blanc
 * plein testé pour le CTA détonnait). Le point d'ancrage vient plutôt de la taille : des
 * cercles assez grands pour que leur pourcentage se lise sans paraître compressé.
 */
export function DashboardFormation({ resume }: { resume: ResumeFormation }) {
    if (resume.nbRediges === 0) return null;

    const complet = resume.nbFaits === resume.nbTotal;
    const pctGlobal = resume.nbTotal > 0 ? Math.round((resume.nbFaits / resume.nbTotal) * 100) : 0;

    const libelleCta = complet
        ? 'Revoir la formation'
        : resume.nbFaits === 0
            ? 'Découvrir la formation'
            : 'Continuer la formation';

    return (
        <Link
            href="/formation"
            className="block bg-white/15 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-white/20 active:scale-[0.99] transition-transform"
        >
            <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Formation</p>
                <span className="text-lg font-black text-white leading-none">{pctGlobal}<span className="text-xs text-white/50">%</span></span>
            </div>

            <p className="text-[17px] sm:text-lg font-black text-white leading-tight mt-1">
                {complet ? 'Formation terminée' : 'Apprends à parler d’environnement'}
            </p>
            <p className="hidden sm:block text-xs text-white/60 mt-1 leading-snug">
                {complet
                    ? 'Tout ce qui existe aujourd’hui est acquis.'
                    : 'Les clés pour intégrer la découverte du milieu naturel dans ton encadrement et enrichir tes séances.'}
            </p>

            {/* Les 4 thèmes — cercles agrandis pour que le pourcentage respire au centre
                sans paraître épais ou compressé. Un thème sans contenu rédigé affiche un
                trait plutôt qu'un cercle vide qui a l'air cassé. */}
            <div className="hidden sm:flex justify-between gap-2 mt-4">
                {resume.themes.map(theme => {
                    const aDuContenu = theme.nbRediges > 0;
                    const pct = aDuContenu ? theme.nbFaits / theme.nbRediges : 0;
                    const r = 20;
                    const c = 2 * Math.PI * r;

                    return (
                        <div key={theme.id} className="flex flex-col items-center gap-1.5">
                            <div className="relative size-14">
                                <svg viewBox="0 0 48 48" className="size-14 -rotate-90">
                                    <circle cx={24} cy={24} r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={4} />
                                    {aDuContenu && (
                                        <circle
                                            cx={24} cy={24} r={r} fill="none" stroke="white" strokeWidth={4}
                                            strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
                                        />
                                    )}
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white">
                                    {aDuContenu ? `${Math.round(pct * 100)}%` : '−'}
                                </span>
                            </div>
                            <span className="text-[9.5px] font-bold text-white/60 text-center leading-none">
                                {MOT_CLE[theme.id]}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Sur téléphone, les mêmes quatre repères restent visibles : ils sont plus
                compacts, mais les anneaux conservent la lecture immédiate de progression. */}
            <div className="grid sm:hidden grid-cols-4 gap-1 mt-3">
                {resume.themes.map(theme => {
                    const aDuContenu = theme.nbRediges > 0;
                    const pct = aDuContenu ? theme.nbFaits / theme.nbRediges : 0;
                    const r = 19;
                    const c = 2 * Math.PI * r;
                    return (
                        <div key={theme.id} className="flex flex-col items-center gap-1.5 text-center">
                            <div className="relative size-12">
                                <svg viewBox="0 0 48 48" className="size-12 -rotate-90">
                                    <circle cx={24} cy={24} r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={3.5} />
                                    {aDuContenu && <circle cx={24} cy={24} r={r} fill="none" stroke="white" strokeWidth={3.5} strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round" />}
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">{aDuContenu ? `${Math.round(pct * 100)}%` : '—'}</span>
                            </div>
                            <p className="text-[10px] font-bold leading-tight text-white/80 whitespace-nowrap">{MOT_CLE[theme.id]}</p>
                        </div>
                    );
                })}
            </div>

            {!complet && resume.prochain && (
                <p className="hidden sm:block text-[11px] text-white/50 mt-4 truncate">
                    Suite : <span className="font-bold text-white/80">{resume.prochain.titre}</span>
                </p>
            )}

            {/* Le CTA reste transparent, cohérent avec le reste de la carte — le blanc
                plein testé précédemment produisait un contraste de couleur disgracieux
                sur ce dégradé. */}
            <div className="flex items-center justify-center gap-2 bg-white/15 border border-white/20 rounded-xl py-2.5 sm:py-3 mt-3 sm:mt-2.5 text-[12px] sm:text-[13px] font-black text-white">
                {libelleCta}
                <ArrowRight size={15} strokeWidth={2.5} />
            </div>
        </Link>
    );
}
