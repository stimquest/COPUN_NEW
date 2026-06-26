export type StageClosingMemoDraft = {
    whatWorked: string;
    blockers: string;
    nextTime: string;
    extraNote: string;
};

type StageClosingMemoSectionKey = keyof StageClosingMemoDraft;

const STRUCTURED_SECTIONS: Array<{ key: StageClosingMemoSectionKey; title: string }> = [
    { key: 'whatWorked', title: 'À garder :' },
    { key: 'blockers', title: 'À ajuster :' },
    { key: 'nextTime', title: 'Prochaine fois :' },
    { key: 'extraNote', title: 'Note libre :' },
];

const LEGACY_SECTIONS = [
    'Ce qui a bien marché :',
    'Dynamique du groupe :',
    'Méthodes / formulations qui ont aidé :',
    'Ce que je referais :',
    'Ce que j’ajusterais la prochaine fois :',
];

export function createEmptyStageClosingMemo(): StageClosingMemoDraft {
    return {
        whatWorked: '',
        blockers: '',
        nextTime: '',
        extraNote: '',
    };
}

function extractLabeledSections(note: string, labels: string[]) {
    const indexed = labels
        .map(label => ({ label, index: note.indexOf(label) }))
        .filter(entry => entry.index >= 0)
        .sort((a, b) => a.index - b.index);

    if (indexed.length !== labels.length) return null;

    const sections: Record<string, string> = {};
    indexed.forEach((entry, idx) => {
        const start = entry.index + entry.label.length;
        const end = idx + 1 < indexed.length ? indexed[idx + 1].index : note.length;
        sections[entry.label] = note.slice(start, end).trim();
    });

    return sections;
}

export function parseStageClosingMemo(note?: string | null): StageClosingMemoDraft {
    const normalized = note?.trim() ?? '';
    if (!normalized) return createEmptyStageClosingMemo();

    const structured = extractLabeledSections(normalized, STRUCTURED_SECTIONS.map(section => section.title));
    if (structured) {
        return {
            whatWorked: structured['À garder :'] ?? '',
            blockers: structured['À ajuster :'] ?? '',
            nextTime: structured['Prochaine fois :'] ?? '',
            extraNote: structured['Note libre :'] ?? '',
        };
    }

    const previousStructured = extractLabeledSections(normalized, [
        'Ce qui a aidé le groupe :',
        'Ce qui a freiné certains objectifs :',
        'Ce que je veux refaire / ajuster :',
        'Autre détail à retenir :',
    ]);
    if (previousStructured) {
        return {
            whatWorked: previousStructured['Ce qui a aidé le groupe :'] ?? '',
            blockers: previousStructured['Ce qui a freiné certains objectifs :'] ?? '',
            nextTime: previousStructured['Ce que je veux refaire / ajuster :'] ?? '',
            extraNote: previousStructured['Autre détail à retenir :'] ?? '',
        };
    }

    const legacy = extractLabeledSections(normalized, LEGACY_SECTIONS);
    if (legacy) {
        const whatWorked = [
            legacy['Ce qui a bien marché :'],
            legacy['Méthodes / formulations qui ont aidé :'],
        ].filter(Boolean).join('\n\n');

        const nextTime = [
            legacy['Ce que je referais :'],
            legacy['Ce que j’ajusterais la prochaine fois :'],
        ].filter(Boolean).join('\n\n');

        return {
            whatWorked,
            blockers: '',
            nextTime,
            extraNote: legacy['Dynamique du groupe :'] ?? '',
        };
    }

    return {
        whatWorked: '',
        blockers: '',
        nextTime: '',
        extraNote: normalized,
    };
}

export function serializeStageClosingMemo(memo: StageClosingMemoDraft): string {
    const normalized = {
        whatWorked: memo.whatWorked.trim(),
        blockers: memo.blockers.trim(),
        nextTime: memo.nextTime.trim(),
        extraNote: memo.extraNote.trim(),
    };

    if (!normalized.whatWorked && !normalized.blockers && !normalized.nextTime && !normalized.extraNote) {
        return '';
    }

    return STRUCTURED_SECTIONS.map(section => `${section.title}\n${normalized[section.key]}`).join('\n\n').trim();
}

export function getStageClosingMemoSections(memo: StageClosingMemoDraft) {
    return [
        {
            key: 'whatWorked',
            title: 'À garder',
            helper: 'Ce qui mérite d’être repris tel quel.',
            value: memo.whatWorked.trim(),
        },
        {
            key: 'blockers',
            title: 'À ajuster',
            helper: 'Ce qui a moins bien pris ou demande un autre angle.',
            value: memo.blockers.trim(),
        },
        {
            key: 'nextTime',
            title: 'Prochaine fois',
            helper: 'L’idée concrète à tester avec le prochain groupe.',
            value: memo.nextTime.trim(),
        },
        {
            key: 'extraNote',
            title: 'Note libre',
            helper: 'Un repère personnel à conserver.',
            value: memo.extraNote.trim(),
        },
    ].filter(section => section.value.length > 0);
}