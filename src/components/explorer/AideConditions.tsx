'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { CoeffType, MeteoType } from '@/data/seasonal-context';
import { groupesDeLaSemaine } from '@/data/intentions-semaine';
import { GROUPES } from '@/data/groupes';
import { PILLARS } from '@/data/etages';
import { niveauRepere } from '@/data/niveaux';
import { PedagogicalContent, Dimension } from '@/types';
import { HistoriqueMoniteur } from '@/lib/historique-moniteur';

/**
 * Le chemin de l'intention : « cette semaine, je veux aborder ça » — pris comme on
 * accepte un défi, jamais rempli comme un formulaire.
 *
 * Repensé à zéro (précédente version : 774 lignes, 8 états, trois écrans imbriqués —
 * coefficient, météo, niveau, intention, chacun bloquant le suivant). Règle unique ici :
 * une question groupée au plus, puis directement des sujets concrets à accepter.
 *
 * Le calcul (`intentions-semaine.ts`) reste volontairement simple : saison, coefficient
 * et météo contribuent chacun indépendamment, jamais en score cumulé — c'est ce qui
 * évite de reproduire le non-sens du système précédent (« gros coefficient + vent →
 * repères spatio-temporels »).
 */

type Props = {
    open: boolean;
    onClose: () => void;
    pool: PedagogicalContent[];
    retenues: string[];
    onToggleFiche: (id: string) => void;
    onFicheInfo?: (fiche: PedagogicalContent) => void;
    historique?: HistoriqueMoniteur;
};

const COEFF_OPTIONS: { value: CoeffType; label: string; icon: string }[] = [
    { value: 'morte_eau', label: 'Petit coef', icon: 'water' },
    { value: 'entre_deux', label: 'Moyen', icon: 'waves' },
    { value: 'vive_eau', label: 'Gros coef', icon: 'tsunami' },
];

const METEO_OPTIONS: { value: MeteoType; label: string; icon: string }[] = [
    { value: 'beau_fixe', label: 'Beau fixe', icon: 'wb_sunny' },
    { value: 'vent', label: 'Venteux', icon: 'air' },
    { value: 'instable', label: 'Instable', icon: 'cloud' },
    { value: 'tempete', label: 'Agité', icon: 'thunderstorm' },
];

export default function AideConditions({
    open, onClose, pool, retenues, onToggleFiche, onFicheInfo, historique,
}: Props) {
    const [coeff, setCoeff] = useState<CoeffType | null>(null);
    const [meteo, setMeteo] = useState<MeteoType | null>(null);
    const [groupeOuvertId, setGroupeOuvertId] = useState<string | null>(null);

    const parGroupe = useMemo(() => groupesDeLaSemaine({ coeff, meteo }), [coeff, meteo]);

    // Les groupes désignés, dans l'ordre du catalogue — jamais triés par un score, pour
    // ne jamais laisser croire qu'un calcul plus fin se cache derrière l'ordre affiché.
    const proposes = GROUPES.filter(g => parGroupe.has(g.id));
    const autres = GROUPES.filter(g => !parGroupe.has(g.id));

    const groupeOuvert = GROUPES.find(g => g.id === groupeOuvertId) ?? null;

    const dejaVues = historique?.dejaVues ?? {};

    const fichesDuGroupe = (groupe: typeof GROUPES[number]) => {
        const ids = new Set(groupe.fiches.map(String));
        return pool.filter(f => ids.has(f.id));
    };

    if (!open) return null;

    // ── Un groupe ouvert : ses questions, rangées par pilier ────────────────────────────
    if (groupeOuvert) {
        const fiches = fichesDuGroupe(groupeOuvert);
        const parPilier = (['COMPRENDRE', 'OBSERVER', 'PROTÉGER'] as Dimension[])
            .map(pilier => ({
                pilier,
                fiches: fiches.filter(f => {
                    const d = (f.dimension ?? '').toUpperCase();
                    const cle = d.startsWith('COMPR') ? 'COMPRENDRE' : d.startsWith('OBSERV') ? 'OBSERVER' : 'PROTÉGER';
                    return cle === pilier;
                }),
            }))
            .filter(g => g.fiches.length > 0);

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <button
                    onClick={() => setGroupeOuvertId(null)}
                    className="inline-flex items-center gap-1.5 text-[12px] font-black text-slate-500 hover:text-slate-800 transition-colors px-1"
                >
                    <span className="material-symbols-outlined text-[17px]">arrow_back</span>
                    Une autre porte d&apos;entrée
                </button>

                <div className="px-1">
                    <h2 className="text-[17px] font-black text-slate-900 leading-tight">{groupeOuvert.label}</h2>
                    <p className="text-[12px] text-slate-400 mt-0.5">{groupeOuvert.accroche}</p>
                </div>

                {parPilier.map(({ pilier, fiches: fs }) => {
                    const p = PILLARS.find(x => x.id === pilier);
                    return (
                        <div key={pilier} className="space-y-1">
                            <div className="flex items-center gap-2 px-1 pt-3">
                                <span className={clsx('size-2 rounded-full shrink-0', p?.bg)} />
                                <span className={clsx('text-[10px] font-black uppercase tracking-widest', p?.color)}>
                                    {p?.label}
                                </span>
                            </div>
                            {fs.map(f => (
                                <LigneFiche
                                    key={f.id}
                                    fiche={f}
                                    retenue={retenues.includes(f.id)}
                                    onToggle={() => onToggleFiche(f.id)}
                                    onInfo={() => onFicheInfo?.(f)}
                                />
                            ))}
                        </div>
                    );
                })}
            </motion.div>
        );
    }

    // ── L'accueil : la question groupée, puis les intentions à accepter ─────────────────
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="px-1">
                <h2 className="text-[16px] font-black text-slate-900 leading-tight">
                    Qu&apos;as-tu envie de faire émerger cette semaine&nbsp;?
                </h2>
                <p className="mt-1 text-[12px] leading-snug text-slate-500">
                    Regarde ce que le milieu rend possible, puis choisis la porte d&apos;entrée qui te parle.
                </p>
            </div>

            {/* Une seule question, groupée : coefficient ET météo sur le même écran,
                jamais deux étapes successives. Facultative — sans réponse, la saison
                seule alimente déjà des propositions. */}
            <div className="space-y-2.5">
                <div className="grid grid-cols-3 gap-1.5">
                    {COEFF_OPTIONS.map(o => (
                        <BoutonCondition
                            key={o.value}
                            {...o}
                            actif={coeff === o.value}
                            onClick={() => setCoeff(coeff === o.value ? null : o.value)}
                        />
                    ))}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                    {METEO_OPTIONS.map(o => (
                        <BoutonCondition
                            key={o.value}
                            {...o}
                            actif={meteo === o.value}
                            onClick={() => setMeteo(meteo === o.value ? null : o.value)}
                        />
                    ))}
                </div>
            </div>

            <p className="text-[12.5px] text-slate-500 px-1">
                Des portes d&apos;entrée possibles&nbsp;:
            </p>

            {proposes.map(g => (
                <CarteIntention
                    key={g.id}
                    groupe={g}
                    raisons={parGroupe.get(g.id) ?? []}
                    fiches={fichesDuGroupe(g)}
                    dejaVues={dejaVues}
                    onAccepter={() => setGroupeOuvertId(g.id)}
                />
            ))}

            <details className="pt-1">
                <summary className="text-[12px] font-bold text-slate-400 hover:text-slate-600 transition-colors px-1 cursor-pointer">
                    Voir d&apos;autres portes d&apos;entrée
                </summary>
                <div className="space-y-2 pt-2">
                    {autres.map(g => (
                        <CarteIntention
                            key={g.id}
                            groupe={g}
                            raisons={[]}
                            fiches={fichesDuGroupe(g)}
                            dejaVues={dejaVues}
                            onAccepter={() => setGroupeOuvertId(g.id)}
                        />
                    ))}
                </div>
            </details>
        </motion.div>
    );
}

function BoutonCondition({
    label, icon, actif, onClick,
}: { label: string; icon: string; actif: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            aria-pressed={actif}
            className={clsx(
                'flex flex-col items-center gap-1 rounded-xl px-1.5 py-2.5 text-center transition-all active:scale-[0.97]',
                actif ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-500 shadow-sm hover:shadow',
            )}
        >
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
            <span className="text-[10px] font-bold leading-tight">{label}</span>
        </button>
    );
}

/** Une intention à accepter — jamais une case parmi d'autres : chaque carte se lit comme
 * une proposition à part entière. */
function CarteIntention({
    groupe, raisons, fiches, dejaVues, onAccepter,
}: {
    groupe: typeof GROUPES[number]; raisons: string[]; fiches: PedagogicalContent[];
    dejaVues: Record<string, number>; onAccepter: () => void;
}) {
    const nbNeuves = fiches.filter(f => !dejaVues[f.id]).length;

    return (
        <button
            onClick={onAccepter}
            className="w-full text-left px-4 py-3.5 rounded-2xl bg-white shadow-[var(--shadow-soft)] active:scale-[0.99] hover:-translate-y-0.5 transition-all"
        >
            <div className="flex items-start gap-3">
                <span className="size-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px] text-indigo-600">{groupe.icon}</span>
                </span>
                <span className="flex-1 min-w-0">
                    <span className="block text-[14px] font-black text-slate-900 leading-snug">{groupe.label}</span>
                    <span className="block text-[11.5px] text-slate-400 mt-0.5">{groupe.accroche}</span>
                </span>
            </div>

            <div className="flex items-center gap-2 mt-2 flex-wrap pl-[52px]">
                <span className="text-[11px] font-bold text-slate-400">
                    {fiches.length} question{fiches.length > 1 ? 's' : ''}
                </span>
                {nbNeuves > 0 && (
                    <span className="text-[10px] font-black uppercase tracking-wide text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
                        {nbNeuves === fiches.length ? 'Jamais abordé' : `${nbNeuves} nouvelle${nbNeuves > 1 ? 's' : ''}`}
                    </span>
                )}
            </div>

            {raisons.length > 0 && (
                <p className="text-[11.5px] text-slate-500 leading-snug mt-1.5 pl-[52px]">
                    {raisons.join(' · ')}
                </p>
            )}
        </button>
    );
}

/** Une question dans un sujet ouvert. */
function LigneFiche({
    fiche, retenue, onToggle, onInfo,
}: {
    fiche: PedagogicalContent; retenue: boolean; onToggle: () => void; onInfo: () => void;
}) {
    return (
        <div className={clsx(
            'flex items-start gap-2 rounded-xl overflow-hidden transition-colors',
            retenue ? 'bg-indigo-50' : 'bg-white',
        )}>
            <button onClick={onInfo} className="flex-1 min-w-0 text-left pl-4 py-2.5">
                <span className="block text-[12.5px] font-bold text-slate-800 leading-snug">
                    {fiche.question}
                </span>
                {niveauRepere(fiche.niveau) && (
                    <span className="mt-1 inline-flex rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-400">
                        {niveauRepere(fiche.niveau)}
                    </span>
                )}
            </button>
            <button
                onClick={onToggle}
                aria-label={retenue ? 'Retirer' : 'Retenir'}
                className={clsx(
                    'size-7 my-2 mr-2 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90',
                    retenue ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 shadow-sm',
                )}
            >
                <span className="material-symbols-outlined text-[16px]">{retenue ? 'check' : 'add'}</span>
            </button>
        </div>
    );
}
