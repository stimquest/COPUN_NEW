// User Ranking System based on completed défis

export interface Rank {
    name: string;
    minDefis: number;
    icon: string;
    color: string;
}

export const RANKS: Rank[] = [
    { name: 'Moussaillon', minDefis: 0, icon: 'anchor', color: '#94a3b8' },
    { name: 'Matelot', minDefis: 5, icon: 'sailing', color: '#cd7f32' },
    { name: 'Gabier', minDefis: 10, icon: 'water', color: '#c0c0c0' },
    { name: 'Quartier-Maître', minDefis: 25, icon: 'military_tech', color: '#ffd700' },
    { name: 'Capitaine', minDefis: 50, icon: 'stars', color: '#8b5cf6' },
    { name: 'Amiral', minDefis: 100, icon: 'workspace_premium', color: '#0ea5e9' },
];

export function getRankForDefis(defiCount: number): Rank {
    // Find the highest rank the user qualifies for
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (defiCount >= RANKS[i].minDefis) {
            return RANKS[i];
        }
    }
    return RANKS[0];
}

export function getNextRank(defiCount: number): { rank: Rank; defisNeeded: number } | null {
    for (const rank of RANKS) {
        if (defiCount < rank.minDefis) {
            return { rank, defisNeeded: rank.minDefis - defiCount };
        }
    }
    return null; // Already at max rank
}

export function getRankProgress(defiCount: number): { current: Rank; next: Rank | null; progress: number } {
    const current = getRankForDefis(defiCount);
    const nextRankInfo = getNextRank(defiCount);

    if (!nextRankInfo) {
        return { current, next: null, progress: 100 };
    }

    const rangeStart = current.minDefis;
    const rangeEnd = nextRankInfo.rank.minDefis;
    const progress = Math.round(((defiCount - rangeStart) / (rangeEnd - rangeStart)) * 100);

    return { current, next: nextRankInfo.rank, progress };
}
