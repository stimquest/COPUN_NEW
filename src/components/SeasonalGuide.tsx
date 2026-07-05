'use client';

import { useState, useRef, useEffect } from 'react';
import {
    getPeriodForMonth,
    getSuggestedThematics,
    THEMATIC_LABELS,
    CoeffType,
    MeteoType,
    ThematicTag,
} from '@/data/seasonal-context';
import { OBJECTIFS, ObjectifId, IntentionSuggestion, getSuggestedIntentions } from '@/data/objectifs';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const COEFF_OPTIONS: { value: CoeffType; label: string; icon: string }[] = [
    { value: 'morte_eau', label: 'Morte-eau', icon: 'water' },
    { value: 'entre_deux', label: 'Entre-deux', icon: 'waves' },
    { value: 'vive_eau', label: 'Vive-eau', icon: 'tsunami' },
];

const METEO_OPTIONS: { value: MeteoType; label: string; icon: string }[] = [
    { value: 'beau_fixe', label: 'Beau fixe', icon: 'wb_sunny' },
    { value: 'vent', label: 'Majoritairement venteux', icon: 'air' },
    { value: 'instable', label: 'Mitigé', icon: 'cloud' },
    { value: 'tempete', label: 'Agité', icon: 'thunderstorm' },
];

const THEMATIC_COLORS: Record<'C' | 'O' | 'P', string> = {
    C: 'bg-amber-100 text-amber-700 border-amber-200',
    O: 'bg-blue-100 text-blue-700 border-blue-200',
    P: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const DIMENSION_COLORS: Record<'C' | 'O' | 'P', string> = {
    C: 'text-amber-500',
    O: 'text-blue-500',
    P: 'text-emerald-500',
};

function IntentionDropdown({ intentionId, setIntentionId, suggestions }: { intentionId: ObjectifId | null, setIntentionId: (v: ObjectifId | null) => void, suggestions: IntentionSuggestion[] }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const selected = OBJECTIFS.find(o => o.id === intentionId);

    // Les intentions favorisées par les conditions remontent en tête, avec leur raison —
    // le choix reste entièrement au moniteur, mais il choisit informé.
    const suggestedIds = suggestions.map(s => s.id);
    const orderedObjectifs = [
        ...suggestions.map(s => OBJECTIFS.find(o => o.id === s.id)).filter((o): o is typeof OBJECTIFS[number] => Boolean(o)),
        ...OBJECTIFS.filter(o => !suggestedIds.includes(o.id)),
    ];
    const reasonOf = (id: ObjectifId) => suggestions.find(s => s.id === id)?.reason ?? null;

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className={clsx(
                    "w-full flex items-center gap-3 px-4 h-14 rounded-2xl border-2 text-left transition-all",
                    selected ? `${selected.border} ${selected.bg}` : "border-slate-100 bg-slate-50 hover:border-slate-200"
                )}
            >
                <span className={clsx("material-symbols-outlined text-lg shrink-0", selected ? selected.color : "text-slate-300")}>
                    {selected ? selected.icon : 'flag'}
                </span>
                <span className={clsx("text-xs font-bold flex-1", selected ? selected.color : "text-slate-400")}>
                    {selected ? selected.label : 'Choisir un objectif…'}
                </span>
                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="material-symbols-outlined text-slate-400 text-lg shrink-0"
                >
                    expand_more
                </motion.span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="mt-2 bg-white rounded-2xl border-2 border-slate-100 shadow-2xl overflow-hidden"
                    >
                        {selected && (
                            <button
                                type="button"
                                onClick={() => { setIntentionId(null); setOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-400 hover:bg-slate-50 border-b border-slate-100 transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">close</span>
                                <span className="text-xs font-bold">Aucun objectif</span>
                            </button>
                        )}
                        {orderedObjectifs.map(obj => {
                            const isActive = intentionId === obj.id;
                            const reason = reasonOf(obj.id);
                            return (
                                <button
                                    key={obj.id}
                                    type="button"
                                    onClick={() => { setIntentionId(obj.id); setOpen(false); }}
                                    className={clsx(
                                        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                                        isActive ? `${obj.bg}` : "hover:bg-slate-50"
                                    )}
                                >
                                    <div className={clsx("size-8 rounded-full flex items-center justify-center shrink-0", isActive ? obj.activeBg : "bg-slate-100")}>
                                        <span className={clsx("material-symbols-outlined text-sm", isActive ? "text-white" : "text-slate-400")}>{obj.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={clsx("text-xs font-black leading-snug flex items-center gap-1.5", isActive ? obj.color : "text-slate-700")}>
                                            {obj.label}
                                            {reason && (
                                                <span className="shrink-0 text-[9px] font-black uppercase tracking-wide bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
                                                    Suggéré
                                                </span>
                                            )}
                                        </p>
                                        <p className={clsx("text-[10px] mt-0.5", reason ? "text-indigo-500 font-semibold" : "text-slate-400")}>
                                            {reason ?? obj.description}
                                        </p>
                                    </div>
                                    {isActive && <span className={clsx("material-symbols-outlined text-base shrink-0", obj.color)}>check</span>}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

type Props = {
    startDate: string;
    activities?: string[];
    level?: string;
    initialIntention?: ObjectifId | null;
    initialCoeff?: CoeffType | null;
    initialMeteo?: MeteoType | null;
    onSuggestions: (thematics: ThematicTag[], intentionId: ObjectifId | null, coeff: CoeffType | null, meteo: MeteoType | null) => void;
    onSkip: (intentionId: ObjectifId | null, coeff: CoeffType | null, meteo: MeteoType | null) => void;
    isSaving?: boolean;
};

export default function SeasonalGuide({ startDate, activities = [], level = '', initialIntention = null, initialCoeff = null, initialMeteo = null, onSuggestions, onSkip, isSaving = false }: Props) {
    const month = startDate ? new Date(startDate).getMonth() + 1 : new Date().getMonth() + 1;
    const period = getPeriodForMonth(month);

    const [coeff, setCoeff] = useState<CoeffType | null>(initialCoeff);
    const [meteo, setMeteo] = useState<MeteoType | null>(initialMeteo);
    const [intentionId, setIntentionId] = useState<ObjectifId | null>(initialIntention);

    const suggestions = coeff && meteo
        ? getSuggestedThematics({ periodId: period.id, coeff, meteo, activities, level })
        : null;

    // Intentions favorisées par les conditions choisies — se mettent à jour dès qu'on
    // touche au coefficient ou à la météo. Le seed hebdomadaire fait tourner les
    // suggestions saisonnières d'une semaine à l'autre.
    const weekSeed = startDate ? Math.floor(new Date(startDate + 'T12:00:00').getTime() / 604_800_000) : 0;
    const intentionSuggestions = getSuggestedIntentions({ periodId: period.id, coeff, meteo, weekSeed });

    const handleValidate = () => {
        if (suggestions && !isSaving) onSuggestions(suggestions, intentionId, coeff, meteo);
    };

    return (
        <div className="space-y-6">
            {/* Period context */}
            <div className="bg-slate-900 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-400 text-lg">calendar_month</span>
                    <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">{period.label}</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{period.description}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                    {period.phenomena.map(p => (
                        <span key={p} className="text-[10px] font-bold bg-white/10 text-white px-2 py-1 rounded-full">
                            {p}
                        </span>
                    ))}
                </div>
            </div>

            {/* Coefficient */}
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                    Coefficient de marée prévu
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {COEFF_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setCoeff(opt.value)}
                            className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all font-bold text-xs ${
                                coeff === opt.value
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                            }`}
                        >
                            <span className="material-symbols-outlined text-xl">{opt.icon}</span>
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Météo */}
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                    Tendance météo de la semaine
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {METEO_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setMeteo(opt.value)}
                            className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all font-bold text-xs ${
                                meteo === opt.value
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                            }`}
                        >
                            <span className="material-symbols-outlined text-xl">{opt.icon}</span>
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Intention / objectif de la semaine */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                    Mon objectif pour cette semaine
                    <span className="font-semibold normal-case tracking-normal text-slate-300 ml-1">— optionnel</span>
                </label>
                <IntentionDropdown intentionId={intentionId} setIntentionId={setIntentionId} suggestions={intentionSuggestions} />
                {!intentionId && intentionSuggestions.length > 0 && (
                    <p className="text-[10px] text-indigo-500 font-semibold px-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                        Vu tes conditions : {intentionSuggestions.map(s => OBJECTIFS.find(o => o.id === s.id)?.label).filter(Boolean).join(' · ')}
                    </p>
                )}
                {intentionId && (
                    <p className="text-[10px] text-slate-400 px-1">
                        Les fiches correspondantes seront marquées ★ dans le programme.
                    </p>
                )}
            </div>

            {/* Suggestions */}
            {suggestions && (
                <div className="bg-indigo-50 border-2 border-indigo-100 rounded-2xl p-4 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
                        Thématiques suggérées
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map(tag => {
                            const info = THEMATIC_LABELS[tag];
                            return (
                                <span
                                    key={tag}
                                    className={`text-xs font-bold px-3 py-1.5 rounded-full border ${THEMATIC_COLORS[info.dimension]}`}
                                >
                                    <span className={`font-black mr-1 ${DIMENSION_COLORS[info.dimension]}`}>
                                        {info.dimension}
                                    </span>
                                    {info.label}
                                </span>
                            );
                        })}
                    </div>
                    <p className="text-[10px] text-indigo-400">
                        Ces thématiques seront pré-sélectionnées dans votre programme. Vous pourrez les modifier à tout moment.
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={() => onSkip(intentionId, coeff, meteo)}
                    disabled={isSaving}
                    className="flex-1 h-12 border-2 border-slate-200 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-wider hover:bg-slate-50 transition-all disabled:opacity-40"
                >
                    Passer cette étape
                </button>
                <button
                    type="button"
                    onClick={handleValidate}
                    disabled={!suggestions || isSaving}
                    className="flex-1 h-12 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider disabled:opacity-40 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                    {isSaving ? (
                        <>
                            <span className="animate-spin material-symbols-outlined text-lg">progress_activity</span>
                            Création…
                        </>
                    ) : (
                        'Valider'
                    )}
                </button>
            </div>
        </div>
    );
}
