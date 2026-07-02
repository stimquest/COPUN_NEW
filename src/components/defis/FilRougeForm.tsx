'use client';

import { useState, useRef } from 'react';
import clsx from 'clsx';
import { uploadDefiPhoto, completeFilRougeDefi, saveClubObservationTargets } from '@/actions/defi-actions';

type ObservationTarget = { id: string; name: string; categorie: string };
type Abundance = 'absent' | 'quelques' | 'abondant';
type Frequency = 'habituel' | 'peu_commun' | 'inhabituel' | 'exceptionnel' | '';

type FauneEntry = {
    targetId: string;
    name: string;
    count: string;
    frequency: Frequency;
};

type InventaireGroupe = {
    key: string;
    label: string;
    exemple: string;
    abundance: Abundance;
};

const INVENTAIRE_GROUPES: Omit<InventaireGroupe, 'abundance'>[] = [
    { key: 'algues', label: 'Algues', exemple: 'ulves, fucus, laminaires…' },
    { key: 'mollusques', label: 'Mollusques', exemple: 'bigorneaux, moules, huîtres, patelles…' },
    { key: 'crustaces', label: 'Crustacés', exemple: 'crabes, crevettes, balanes…' },
    { key: 'vers', label: 'Vers / invertébrés', exemple: 'annélides, anémones…' },
    { key: 'echinodermes', label: 'Échinodermes', exemple: 'oursins, étoiles de mer…' },
];

type LaisseCategorie = {
    key: string;
    label: string;
    exemple: string;
    abundance: Abundance;
};

const LAISSE_CATEGORIES: Omit<LaisseCategorie, 'abundance'>[] = [
    { key: 'dechets_plastiques', label: 'Déchets plastiques', exemple: 'bouteilles, sacs, mégots, fragments, filets…' },
    { key: 'dechets_autres', label: 'Déchets autres matières', exemple: 'verre, métal, textile, bois traité…' },
    { key: 'algues', label: 'Algues échouées', exemple: 'laminaires, fucales, algues vertes…' },
    { key: 'bois_flotte', label: 'Bois flotté / débris végétaux', exemple: 'branches, troncs, feuilles…' },
    { key: 'coquilles_vides', label: 'Coquilles vides', exemple: 'bivalves, gastéropodes, tests d\'oursins…' },
    { key: 'faune_vivante', label: 'Faune vivante échouée', exemple: 'puces de mer, crustacés, invertébrés actifs…' },
    { key: 'indices_ecologiques', label: 'Indices écologiques particuliers', exemple: 'pontes, œufs, méduses, espèce remarquable…' },
];

const ABUNDANCE_OPTIONS: { value: Abundance; label: string }[] = [
    { value: 'absent', label: 'Absent' },
    { value: 'quelques', label: 'Quelques' },
    { value: 'abondant', label: 'Abondant' },
];

const COVERAGE_OPTIONS = ['0–25%', '25–50%', '50–75%', '75–100%'];
const ETAT_OPTIONS = ['bon', 'moyen', 'dégradé'];
const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
    { value: 'habituel', label: 'Habituel' },
    { value: 'peu_commun', label: 'Peu commun' },
    { value: 'inhabituel', label: 'Inhabituel' },
    { value: 'exceptionnel', label: 'Exceptionnel' },
];
const CATEGORIE_OPTIONS = [
    { value: 'oiseau', label: 'Oiseau' },
    { value: 'mammifere_marin', label: 'Mammifère marin' },
    { value: 'poisson', label: 'Poisson' },
    { value: 'meduse', label: 'Méduse / invertébré' },
    { value: 'autre', label: 'Autre' },
];

type Props = {
    defiId: string;
    defiDescription: string;
    stageId: string;
    clubTargets: ObservationTarget[];
    onClose: () => void;
    onSuccess: () => void;
};

export default function FilRougeForm({ defiId, defiDescription, stageId, clubTargets, onClose, onSuccess }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Inventaire du m²
    const [groupes, setGroupes] = useState<InventaireGroupe[]>(
        INVENTAIRE_GROUPES.map(g => ({ ...g, abundance: 'absent' }))
    );
    const [coverage, setCoverage] = useState('');
    const [etat, setEtat] = useState('');

    // Laisse du jour
    const [laisseCategories, setLaisseCategories] = useState<LaisseCategorie[]>(
        LAISSE_CATEGORIES.map(c => ({ ...c, abundance: 'absent' }))
    );

    // Évolution de la côte
    const [changeVisible, setChangeVisible] = useState<boolean | null>(null);
    const [erosionNotes, setErosionNotes] = useState('');

    // Faune observée
    const [fauneEntries, setFauneEntries] = useState<FauneEntry[]>(
        clubTargets.map(t => ({ targetId: t.id, name: t.name, count: '', frequency: '' }))
    );
    const [fauneFreeText, setFauneFreeText] = useState('');

    // Config targets
    const [configMode, setConfigMode] = useState(defiId === 'defi_faune_1' && clubTargets.length === 0);
    const [newTargets, setNewTargets] = useState([{ name: '', categorie: 'oiseau' }]);
    const [isSavingTargets, setIsSavingTargets] = useState(false);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const result = await uploadDefiPhoto(formData);
            if (result.success && result.url) setPhotoUrl(result.url);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSaveTargets = async () => {
        const valid = newTargets.filter(t => t.name.trim());
        if (!valid.length) return;
        setIsSavingTargets(true);
        const result = await saveClubObservationTargets(valid);
        setIsSavingTargets(false);
        setConfigMode(false);
        const saved = result.success && result.targets ? result.targets : [];
        setFauneEntries(saved.map(t => ({ targetId: t.id, name: t.name, count: '', frequency: '' as Frequency })));
    };

    const canSubmit = () => {
        if (defiId === 'defi_bio_2') return !!photoUrl && !!coverage && !!etat;
        if (defiId === 'defi_laisse_1') {
            return !!photoUrl && laisseCategories.some(c => c.abundance !== 'absent');
        }
        if (defiId === 'defi_erosion_1') return !!photoUrl && changeVisible !== null;
        if (defiId === 'defi_faune_1') return fauneEntries.some(e => e.count !== '') || !!fauneFreeText.trim();
        return false;
    };

    const handleSubmit = async () => {
        if (!canSubmit()) return;
        setIsSubmitting(true);

        let structuredData: Record<string, unknown> = {};

        if (defiId === 'defi_bio_2') {
            const groupesData: Record<string, Abundance> = {};
            groupes.forEach(g => { groupesData[g.key] = g.abundance; });
            structuredData = { coverage, etat, groupes: groupesData };
        } else if (defiId === 'defi_laisse_1') {
            const categories: Record<string, Abundance> = {};
            laisseCategories.forEach(c => { categories[c.key] = c.abundance; });
            structuredData = { categories };
        } else if (defiId === 'defi_erosion_1') {
            structuredData = { change_visible: changeVisible, notes: erosionNotes || null };
        } else if (defiId === 'defi_faune_1') {
            structuredData = {
                observations: fauneEntries
                    .filter(e => e.count !== '')
                    .map(e => ({ name: e.name, count: Number(e.count), frequency: e.frequency || null })),
                free_text: fauneFreeText || null,
            };
        }

        await completeFilRougeDefi(stageId, defiId, structuredData, photoUrl ?? undefined);
        setIsSubmitting(false);
        onSuccess();
    };

    if (configMode) {
        return (
            <FormShell title="Configurer les observations" onClose={onClose}>
                <p className="text-sm text-slate-500 mb-4">
                    Ajoutez les espèces ou phénomènes à surveiller sur votre spot.
                </p>
                <div className="space-y-2 mb-4">
                    {newTargets.map((t, i) => (
                        <div key={i} className="flex gap-2">
                            <input
                                value={t.name}
                                onChange={e => setNewTargets(p => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                                placeholder="Ex : Grands dauphins"
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                            />
                            <select
                                value={t.categorie}
                                onChange={e => setNewTargets(p => p.map((x, j) => j === i ? { ...x, categorie: e.target.value } : x))}
                                className="px-2 py-2 border border-slate-200 rounded-lg text-sm text-slate-600"
                            >
                                {CATEGORIE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            {newTargets.length > 1 && (
                                <button onClick={() => setNewTargets(p => p.filter((_, j) => j !== i))} className="text-slate-300 hover:text-red-400">
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <button onClick={() => setNewTargets(p => [...p, { name: '', categorie: 'oiseau' }])}
                    className="text-sm text-indigo-600 font-bold mb-6 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">add</span>Ajouter
                </button>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm">Annuler</button>
                    <button onClick={handleSaveTargets} disabled={isSavingTargets || !newTargets.some(t => t.name.trim())}
                        className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm disabled:opacity-50">
                        {isSavingTargets ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </div>
            </FormShell>
        );
    }

    return (
        <FormShell title={defiDescription} onClose={onClose}>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handlePhotoUpload} />

            {/* Inventaire du m² */}
            {defiId === 'defi_bio_2' && (
                <div className="space-y-5">
                    <PhotoField photoUrl={photoUrl} isUploading={isUploading} onCapture={() => fileInputRef.current?.click()} required />

                    <div>
                        <p className="text-sm font-bold text-slate-700 mb-2">Taux de recouvrement du vivant</p>
                        <div className="grid grid-cols-4 gap-2">
                            {COVERAGE_OPTIONS.map(v => (
                                <button key={v} onClick={() => setCoverage(v)}
                                    className={clsx("py-2 rounded-lg text-xs font-bold border-2 transition",
                                        coverage === v ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500"
                                    )}>
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-bold text-slate-700 mb-2">Groupes présents</p>
                        <div className="space-y-2">
                            {groupes.map((g, i) => (
                                <div key={g.key} className="p-3 bg-slate-50 rounded-xl">
                                    <p className="text-sm font-bold text-slate-800 mb-0.5">{g.label}</p>
                                    <p className="text-xs text-slate-400 mb-2">{g.exemple}</p>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {ABUNDANCE_OPTIONS.map(opt => (
                                            <button key={opt.value} onClick={() => setGroupes(p => p.map((x, j) => j === i ? { ...x, abundance: opt.value } : x))}
                                                className={clsx("py-1.5 rounded-lg text-xs font-bold border-2 transition",
                                                    g.abundance === opt.value ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-500"
                                                )}>
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-bold text-slate-700 mb-2">État général de la zone</p>
                        <div className="grid grid-cols-3 gap-2">
                            {ETAT_OPTIONS.map(v => (
                                <button key={v} onClick={() => setEtat(v)}
                                    className={clsx("py-2 rounded-lg text-sm font-bold border-2 transition capitalize",
                                        etat === v
                                            ? v === 'bon' ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                                                : v === 'moyen' ? "border-amber-500 bg-amber-50 text-amber-700"
                                                    : "border-red-400 bg-red-50 text-red-600"
                                            : "border-slate-200 text-slate-500"
                                    )}>
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Laisse du jour */}
            {defiId === 'defi_laisse_1' && (
                <div className="space-y-4">
                    <PhotoField photoUrl={photoUrl} isUploading={isUploading} onCapture={() => fileInputRef.current?.click()} required />
                    <div>
                        <p className="text-sm font-bold text-slate-700 mb-2">Ce que vous trouvez</p>
                        <div className="space-y-2">
                            {laisseCategories.map((cat, i) => (
                                <div key={cat.key} className="p-3 bg-slate-50 rounded-xl">
                                    <p className="text-sm font-bold text-slate-800 mb-0.5">{cat.label}</p>
                                    <p className="text-xs text-slate-400 mb-2">{cat.exemple}</p>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {ABUNDANCE_OPTIONS.map(opt => (
                                            <button key={opt.value} onClick={() => setLaisseCategories(p => p.map((x, j) => j === i ? { ...x, abundance: opt.value } : x))}
                                                className={clsx("py-1.5 rounded-lg text-xs font-bold border-2 transition",
                                                    cat.abundance === opt.value ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-500"
                                                )}>
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Évolution de la côte */}
            {defiId === 'defi_erosion_1' && (
                <div className="space-y-4">
                    <PhotoField photoUrl={photoUrl} isUploading={isUploading} onCapture={() => fileInputRef.current?.click()} required />
                    <div>
                        <p className="text-sm font-bold text-slate-700 mb-2">Changement visible depuis la dernière observation ?</p>
                        <div className="flex gap-3">
                            {[{ v: true, l: 'Oui' }, { v: false, l: 'Non' }].map(({ v, l }) => (
                                <button key={l} onClick={() => setChangeVisible(v)}
                                    className={clsx("flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition",
                                        changeVisible === v ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600"
                                    )}>
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>
                    {changeVisible && (
                        <textarea value={erosionNotes} onChange={e => setErosionNotes(e.target.value)}
                            placeholder="Décrivez ce que vous observez…"
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm resize-none h-20"
                        />
                    )}
                </div>
            )}

            {/* Faune observée */}
            {defiId === 'defi_faune_1' && (
                <div className="space-y-4">
                    {fauneEntries.length === 0 ? (
                        <p className="text-sm text-slate-500 italic">Aucune cible configurée.</p>
                    ) : (
                        <div className="space-y-3">
                            {fauneEntries.map((entry, i) => (
                                <div key={entry.targetId} className="p-3 bg-slate-50 rounded-xl space-y-2">
                                    <p className="text-sm font-bold text-slate-800">{entry.name}</p>
                                    <div className="flex gap-2">
                                        <input type="number" min="0" placeholder="Nombre"
                                            value={entry.count}
                                            onChange={e => setFauneEntries(p => p.map((x, j) => j === i ? { ...x, count: e.target.value } : x))}
                                            className="w-24 px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                                        />
                                        <select value={entry.frequency}
                                            onChange={e => setFauneEntries(p => p.map((x, j) => j === i ? { ...x, frequency: e.target.value as Frequency } : x))}
                                            className="flex-1 px-2 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600"
                                        >
                                            <option value="">Fréquence…</option>
                                            {FREQUENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <textarea value={fauneFreeText} onChange={e => setFauneFreeText(e.target.value)}
                        placeholder="Autre observation ou précision (espèce, comportement, direction…)"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm resize-none h-20"
                    />
                    <PhotoField photoUrl={photoUrl} isUploading={isUploading} onCapture={() => fileInputRef.current?.click()} required={false} />
                    <button onClick={() => setConfigMode(true)} className="text-xs text-slate-400 underline">
                        Modifier les cibles d&apos;observation du club
                    </button>
                </div>
            )}

            <div className="flex gap-3 mt-6">
                <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm">Annuler</button>
                <button onClick={handleSubmit} disabled={!canSubmit() || isSubmitting}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm disabled:opacity-40">
                    {isSubmitting ? 'Enregistrement…' : 'Valider le défi'}
                </button>
            </div>
        </FormShell>
    );
}

function FormShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4 pt-4 pb-20">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <p className="font-black text-slate-900">{title}</p>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="overflow-y-auto px-6 py-4 flex-1">{children}</div>
            </div>
        </div>
    );
}

function PhotoField({ photoUrl, isUploading, onCapture, required }: {
    photoUrl: string | null; isUploading: boolean; onCapture: () => void; required: boolean;
}) {
    return (
        <div>
            <p className="text-sm font-bold text-slate-700 mb-2">
                Photo {required ? <span className="text-red-400">*</span> : <span className="text-slate-400 font-normal">(optionnelle)</span>}
            </p>
            {photoUrl ? (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200">
                    <img src={photoUrl} alt="Observation" className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1">
                        <span className="material-symbols-outlined text-sm">check</span>
                    </div>
                </div>
            ) : (
                <button onClick={onCapture} disabled={isUploading}
                    className="w-full h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-400 text-sm font-medium hover:border-slate-300 transition disabled:opacity-50">
                    {isUploading
                        ? <><span className="animate-spin inline-block size-4 border-2 border-slate-200 border-t-slate-500 rounded-full" />Upload...</>
                        : <><span className="material-symbols-outlined">photo_camera</span>Prendre une photo</>
                    }
                </button>
            )}
        </div>
    );
}
