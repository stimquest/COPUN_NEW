/** Une semaine a une seule destination, quelle que soit la porte d'entrée. */
export function weekHref(stageId: string) {
    return `/stages/semaines?semaine=${encodeURIComponent(stageId)}`;
}
