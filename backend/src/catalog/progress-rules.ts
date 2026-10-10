import { PathCategory } from '../paths/path-category.enum';
import { PeakType } from '../peaks/peak-type.enum';

/**
 * Peak rules from the book (p. 9, "Οι Κορυφές και η Πρόοδός σου"):
 *
 *   Α' Κορυφή (bronze): 1 path from each chapter, Guide diploma Α', 1 diploma
 *   Β' Κορυφή (silver): 1 path from each chapter, Guide diploma Β', 1 diploma
 *   Γ' Κορυφή (gold):   4 paths from any chapter, Guide diploma Γ', 2 diplomas
 *
 * Peaks are cumulative and earned in order, so in totals: bronze needs >=1 path
 * per chapter and 1 diploma; silver >=2 per chapter and 2 diplomas; gold 12
 * paths (still >=2 per chapter) and 4 diplomas. Nothing counts before the
 * Promise.
 */

const CHAPTERS = Object.values(PathCategory);

export interface ProgressInput {
    hasPromise: boolean;
    pathCategories: PathCategory[]; // one entry per completed path
    guideDiplomaLevels: number[];
    electiveDiplomaCount: number;
}

export interface Requirement {
    key: string;
    current: number;
    required: number;
    met: boolean;
    category?: PathCategory;
}

export interface PeakStatus {
    type: PeakType;
    met: boolean;
    requirements: Requirement[];
}

export interface ProgressEvaluation {
    peak: PeakType | null; // highest peak reached (promise counts as a peak)
    peaks: PeakStatus[];
}

const PEAK_RULES = [
    { type: PeakType.BRONZE, perChapter: 1, totalPaths: 4, guideLevel: 1, diplomas: 1 },
    { type: PeakType.SILVER, perChapter: 2, totalPaths: 8, guideLevel: 2, diplomas: 2 },
    { type: PeakType.GOLD, perChapter: 2, totalPaths: 12, guideLevel: 3, diplomas: 4 },
];

const req = (key: string, current: number, required: number, category?: PathCategory): Requirement => ({
    key,
    current: Math.min(current, required),
    required,
    met: current >= required,
    ...(category ? { category } : {}),
});

export function evaluateProgress(input: ProgressInput): ProgressEvaluation {
    const perChapter = new Map<PathCategory, number>(CHAPTERS.map((c) => [c, 0]));
    for (const category of input.pathCategories) {
        perChapter.set(category, (perChapter.get(category) ?? 0) + 1);
    }
    const totalPaths = input.pathCategories.length;

    const peaks: PeakStatus[] = [
        { type: PeakType.PROMISE, met: input.hasPromise, requirements: [req('promise', input.hasPromise ? 1 : 0, 1)] },
    ];
    let reached: PeakType | null = input.hasPromise ? PeakType.PROMISE : null;
    let previousMet = input.hasPromise;

    for (const rule of PEAK_RULES) {
        const requirements = [
            ...CHAPTERS.map((c) => req('chapterPaths', perChapter.get(c), rule.perChapter, c)),
            req('totalPaths', totalPaths, rule.totalPaths),
            req('guideDiploma', input.guideDiplomaLevels.includes(rule.guideLevel) ? 1 : 0, 1),
            req('electiveDiplomas', input.electiveDiplomaCount, rule.diplomas),
        ];
        const met = previousMet && requirements.every((r) => r.met);
        peaks.push({ type: rule.type, met, requirements });
        if (met) {
            reached = rule.type;
        }
        previousMet = met;
    }

    return { peak: reached, peaks };
}
