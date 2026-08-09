'use client';

import clsx from 'clsx';

/**
 * Structure d'une étape de parcours guidé.
 *
 * Remplace les panneaux de filtres et les grilles de cartes : une question à la fois,
 * en titre, avec ses réponses en lignes pleine largeur. Le moniteur lit une phrase et
 * tape — il n'a rien à paramétrer ni à déchiffrer.
 *
 * Barre de progression fine, retour toujours accessible, action ancrée en bas : le
 * squelette est volontairement sobre pour que seule la question porte l'attention.
 */

export function EtapeLayout({
    etape,
    total,
    onRetour,
    question,
    intro,
    children,
    action,
}: {
    etape: number;
    total: number;
    onRetour?: () => void;
    question: string;
    intro?: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
            <div className="px-5 pt-4 pb-2 flex items-center gap-3 shrink-0">
                {onRetour ? (
                    <button
                        onClick={onRetour}
                        className="size-9 -ml-1 flex items-center justify-center text-slate-500 active:scale-90 transition shrink-0"
                        aria-label="Retour"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                ) : (
                    <span className="size-9 shrink-0" />
                )}
                <div className="flex-1 h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-slate-900 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${(etape / total) * 100}%` }}
                    />
                </div>
                <span className="text-[13px] font-semibold text-slate-400 tabular-nums shrink-0">
                    {etape}/{total}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pt-6 pb-32">
                <div className="max-w-lg mx-auto">
                    <h1 className="font-[family-name:var(--font-display)] text-[30px] leading-[1.15] font-semibold text-slate-900 tracking-[-0.01em]">
                        {question}
                    </h1>
                    {intro && (
                        <p className="mt-2.5 text-[15px] leading-relaxed text-slate-500">{intro}</p>
                    )}
                    <div className="mt-7 space-y-2.5">{children}</div>
                </div>
            </div>

            {action && (
                <div className="shrink-0 px-5 pt-3 pb-[max(env(safe-area-inset-bottom),1.25rem)] bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2] to-transparent">
                    <div className="max-w-lg mx-auto">{action}</div>
                </div>
            )}
        </div>
    );
}

/** Réponse possible — pleine largeur, sélection en aplat. */
export function Reponse({
    label,
    detail,
    icon,
    actif,
    onClick,
}: {
    label: string;
    detail?: string;
    icon?: string;
    actif?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                'w-full text-left px-4 py-3.5 rounded-2xl border transition-all active:scale-[0.99] flex items-center gap-3',
                actif
                    ? 'bg-[#E8705F] border-[#E8705F] text-white shadow-sm'
                    : 'bg-white border-slate-200/80 text-slate-800 hover:border-slate-300',
            )}
        >
            {icon && (
                <span className={clsx(
                    'material-symbols-outlined text-[20px] shrink-0',
                    actif ? 'text-white/90' : 'text-slate-400',
                )}>
                    {icon}
                </span>
            )}
            <span className="flex-1 min-w-0">
                <span className="block text-[15px] font-semibold leading-snug">{label}</span>
                {detail && (
                    <span className={clsx(
                        'block text-[13px] leading-snug mt-0.5',
                        actif ? 'text-white/75' : 'text-slate-400',
                    )}>
                        {detail}
                    </span>
                )}
            </span>
            {actif && <span className="material-symbols-outlined text-[19px] shrink-0">check</span>}
        </button>
    );
}

export function BoutonContinuer({
    label = 'Continuer',
    onClick,
    disabled,
    note,
}: {
    label?: string;
    onClick: () => void;
    disabled?: boolean;
    note?: string;
}) {
    return (
        <>
            <button
                onClick={onClick}
                disabled={disabled}
                className="w-full h-[52px] rounded-2xl bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-[15px] font-semibold active:scale-[0.98] transition-all"
            >
                {label}
            </button>
            {note && <p className="text-center text-[12px] text-slate-400 mt-2">{note}</p>}
        </>
    );
}
