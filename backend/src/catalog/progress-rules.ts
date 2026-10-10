import { PeakType } from '../peaks/peak-type.enum';

/**
 * Peak rules (book p. 9, "Οι Κορυφές και η Πρόοδός σου", as currently applied:
 * the book's "1 path from each chapter" for the first two peaks no longer
 * holds, every peak takes 4 paths from any chapter):
 *
 *   Α' Κορυφή (bronze): 4 paths, Guide diploma Α', 1 diploma
 *   Β' Κορυφή (silver): 4 paths, Guide diploma Β', 1 diploma
 *   Γ' Κορυφή (gold):   4 paths, Guide diploma Γ', 2 diplomas
 *
 * Peaks are cumulative and earned in order, so in totals: bronze 4 paths and
 * 1 diploma, silver 8 and 2, gold 12 and 4. Nothing counts before the Promise.
 */

export interface ProgressInput {
    hasPromise: boolean;
    pathCount: number;
    guideDiplomaLevels: number[];
    electiveDiplomaCount: number;
}

export interface Requirement {
    key: string;
    current: number;
    required: number;
    met: boolean;
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
    { type: PeakType.BRONZE, totalPaths: 4, guideLevel: 1, diplomas: 1 },
    { type: PeakType.SILVER, totalPaths: 8, guideLevel: 2, diplomas: 2 },
    { type: PeakType.GOLD, totalPaths: 12, guideLevel: 3, diplomas: 4 },
];

const req = (key: string, current: number, required: number): Requirement => ({
    key,
    current: Math.min(current, required),
    required,
    met: current >= required,
});

export function evaluateProgress(input: ProgressInput): ProgressEvaluation {
    const peaks: PeakStatus[] = [
        { type: PeakType.PROMISE, met: input.hasPromise, requirements: [req('promise', input.hasPromise ? 1 : 0, 1)] },
    ];
    let reached: PeakType | null = input.hasPromise ? PeakType.PROMISE : null;
    let previousMet = input.hasPromise;

    for (const rule of PEAK_RULES) {
        const requirements = [
            req('totalPaths', input.pathCount, rule.totalPaths),
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
