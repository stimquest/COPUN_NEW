'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { CardChoice, CardChoices } from '@/lib/card-choice';

const Context = createContext<{ choices: CardChoices; allowUse: boolean; savedChoices?: CardChoices; saveChoice?: (id: string, choice: CardChoice) => Promise<void>; change: (id: string, choice: CardChoice) => void } | null>(null);

export function CardChoicesProvider({ initialChoices = {}, value, savedChoices, saveChoice, onChange, children, allowUse = true }: { initialChoices?: CardChoices; value?: CardChoices; savedChoices?: CardChoices; saveChoice?: (id: string, choice: CardChoice) => Promise<void>; onChange?: (id: string, choice: CardChoice) => void; children: ReactNode; allowUse?: boolean }) {
    const [choices, setChoices] = useState(initialChoices);
    function change(id: string, choice: CardChoice) {
        setChoices(previous => ({ ...previous, [id]: choice }));
        onChange?.(id, choice);
    }
    return <Context.Provider value={{ choices: value ?? choices, change, allowUse, savedChoices, saveChoice }}>{children}</Context.Provider>;
}

export function useCardChoices() { return useContext(Context); }
