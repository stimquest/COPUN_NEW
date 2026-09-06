const MONTH_ABBR: Record<string, number> = {
    'janv.': 0, 'févr.': 1, 'mars': 2, 'avr.': 3, 'mai': 4, 'juin': 5,
    'juil.': 6, 'août': 7, 'sept.': 8, 'oct.': 9, 'nov.': 10, 'déc.': 11,
};

/** Fuseau de référence de l'app — les moniteurs sont en France, pas là où tourne le serveur. */
const FUSEAU_APP = 'Europe/Paris';

/**
 * Année, mois, jour d'une date TELS QU'ON LES LIRAIT À PARIS, quel que soit le fuseau du
 * process qui exécute ce code.
 *
 * `new Date(y, m, d, h)` construit un instant dans le fuseau du serveur. En local
 * (Windows/Europe), ça coïncide avec Paris ; sur Vercel (UTC), minuit Paris devient 22h ou
 * 23h la veille en UTC — un décalage suffisant pour faire déborder les bornes de semaine
 * d'un jour et afficher la mauvaise semaine comme "en cours". `Intl.DateTimeFormat` avec
 * `timeZone` lit la date indépendamment du fuseau du process, donc ce bug ne peut pas s'y
 * nicher.
 */
export function ymdAParis(date: Date): { year: number; month: number; day: number } {
    const parts = new Intl.DateTimeFormat('fr-FR', {
        timeZone: FUSEAU_APP, year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(date);
    const get = (type: string) => Number(parts.find(p => p.type === type)?.value);
    return { year: get('year'), month: get('month') - 1, day: get('day') };
}

/** Heure (0-23) d'un instant, telle qu'on la lirait à Paris — même raison que {@link ymdAParis}. */
export function heureAParis(date: Date): number {
    const parts = new Intl.DateTimeFormat('fr-FR', {
        timeZone: FUSEAU_APP, hour: '2-digit', hour12: false,
    }).formatToParts(date);
    return Number(parts.find(p => p.type === 'hour')?.value);
}

/**
 * Instant UTC correspondant à une date/heure civile donnée À PARIS.
 *
 * On mesure le décalage réel du fuseau à cet instant — en relisant la date ET l'heure
 * complètes, puis en comparant à ce qu'on visait — et on l'applique.
 *
 * L'implémentation précédente itérait en ne comparant que la DATE (`ymdAParis`), jamais
 * l'heure : elle convergeait donc sur un instant du bon jour mais pouvant être à
 * n'importe quelle heure. Concrètement, « 6 sept. 23:59:59 » produisait un instant qui se
 * lisait « 6 sept. 01:59 » à Paris — la semaine se terminait 22 h trop tôt, et une semaine
 * courant jusqu'au dimanche basculait en « bilan en attente » dès le dimanche matin.
 */
function instantAParis(year: number, month: number, day: number, hours: number, minutes: number, seconds: number): Date {
    const vise = Date.UTC(year, month, day, hours, minutes, seconds);
    // Ce que l'instant « naïf » (mêmes chiffres, lus en UTC) donne réellement à Paris.
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: FUSEAU_APP, hour12: false,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(new Date(vise));
    const get = (type: string) => Number(parts.find(p => p.type === type)?.value);
    // `hour` peut valoir 24 à minuit selon l'implémentation — ramené à 0.
    const luUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'));
    // L'écart entre lecture et instant naïf EST le décalage du fuseau : on le retranche.
    return new Date(vise - (luUtc - vise));
}

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
        return instantAParis(year, month, day, hours, minutes, seconds);
    };

    const refYear = ymdAParis(referenceDate).year;
    // Bornes larges (00:00 à 23:59:59, heure de Paris) pour que la semaine couvre toute la
    // journée du premier au dernier jour, quelle que soit l'heure de consultation — un
    // stage qui commence "aujourd'hui" doit être actif dès 00:00, pas seulement à midi.
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
