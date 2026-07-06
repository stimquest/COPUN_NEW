const MONTH_ABBR: Record<string, number> = {
    'janv.': 0, 'févr.': 1, 'mars': 2, 'avr.': 3, 'mai': 4, 'juin': 5,
    'juil.': 6, 'août': 7, 'sept.': 8, 'oct.': 9, 'nov.': 10, 'déc.': 11,
};

/**
 * Parse le champ texte `dates` (ex: "20 juil. - 24 juil."), généré par
 * toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), en un intervalle réel.
 * L'année n'est pas stockée : on prend l'année courante, ou l'année précédente si la
 * date obtenue serait dans le futur de plus de 6 mois (semaine à cheval sur le nouvel an).
 */
export function parseStageDateRange(dates: string, referenceDate = new Date()): { start: Date; end: Date } | null {
    const parts = dates.split('-').map(s => s.trim());
    if (parts.length !== 2) return null;

    const parseOne = (part: string, year: number, hours: number, minutes: number, seconds: number): Date | null => {
        const match = part.match(/^(\d{1,2})\s+([a-zûé.]+)$/i);
        if (!match) return null;
        const day = Number(match[1]);
        const month = MONTH_ABBR[match[2].toLowerCase()];
        if (month === undefined) return null;
        return new Date(year, month, day, hours, minutes, seconds);
    };

    const refYear = referenceDate.getFullYear();
    // Bornes larges (00:00 à 23:59:59) pour que la semaine couvre toute la journée du
    // premier au dernier jour, quelle que soit l'heure de consultation — un stage qui
    // commence "aujourd'hui" doit être actif dès 00:00, pas seulement à partir de midi.
    let start = parseOne(parts[0], refYear, 0, 0, 0);
    let end = parseOne(parts[1], refYear, 23, 59, 59);
    if (!start || !end) return null;

    // Semaine à cheval sur le nouvel an (ex: 29 déc. - 2 janv.)
    if (end < start) end = parseOne(parts[1], refYear + 1, 23, 59, 59);
    if (!end) return null;

    return { start, end };
}

/**
 * Choisit, parmi une liste de semaines non clôturées, celle dont l'intervalle de dates
 * couvre exactement aujourd'hui. Retourne `null` si aucune ne correspond — pas de fallback
 * sur "la plus proche", ce qui serait trompeur (afficher une semaine passée ou future comme
 * si elle était en cours).
 */
export function pickCurrentStage<T extends { dates: string }>(stages: T[], referenceDate = new Date()): T | null {
    const ref = referenceDate.getTime();

    for (const stage of stages) {
        const range = parseStageDateRange(stage.dates, referenceDate);
        if (!range) continue;
        if (ref >= range.start.getTime() && ref <= range.end.getTime()) return stage;
    }

    return null;
}
