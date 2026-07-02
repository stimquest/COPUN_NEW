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

    const parseOne = (part: string, year: number): Date | null => {
        const match = part.match(/^(\d{1,2})\s+([a-zûé.]+)$/i);
        if (!match) return null;
        const day = Number(match[1]);
        const month = MONTH_ABBR[match[2].toLowerCase()];
        if (month === undefined) return null;
        return new Date(year, month, day, 12);
    };

    const refYear = referenceDate.getFullYear();
    let start = parseOne(parts[0], refYear);
    let end = parseOne(parts[1], refYear);
    if (!start || !end) return null;

    // Semaine à cheval sur le nouvel an (ex: 29 déc. - 2 janv.)
    if (end < start) end = parseOne(parts[1], refYear + 1);
    if (!end) return null;

    return { start, end };
}

/** Distance (en jours) entre `referenceDate` et l'intervalle [start, end] ; 0 si referenceDate est dedans. */
function distanceToRange(range: { start: Date; end: Date }, referenceDate: Date): number {
    const ref = referenceDate.getTime();
    if (ref >= range.start.getTime() && ref <= range.end.getTime()) return 0;
    if (ref < range.start.getTime()) return range.start.getTime() - ref;
    return ref - range.end.getTime();
}

/**
 * Choisit, parmi une liste de semaines non clôturées, celle qui correspond à aujourd'hui
 * (ou la plus proche si aucune ne couvre la date du jour). Fallback sur la première si le
 * parsing échoue pour toutes.
 */
export function pickCurrentStage<T extends { dates: string }>(stages: T[], referenceDate = new Date()): T | null {
    if (stages.length === 0) return null;

    let best: T | null = null;
    let bestDistance = Infinity;

    for (const stage of stages) {
        const range = parseStageDateRange(stage.dates, referenceDate);
        if (!range) continue;
        const distance = distanceToRange(range, referenceDate);
        if (distance < bestDistance) {
            bestDistance = distance;
            best = stage;
        }
    }

    return best ?? stages[0];
}
