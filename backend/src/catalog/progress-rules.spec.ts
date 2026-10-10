import { PeakType } from '../peaks/peak-type.enum';
import { evaluateProgress } from './progress-rules';

const evaluate = (overrides: Partial<Parameters<typeof evaluateProgress>[0]>) =>
    evaluateProgress({ hasPromise: true, pathCount: 0, guideDiplomaLevels: [], electiveDiplomaCount: 0, ...overrides });

describe('evaluateProgress', () => {
    it('nothing counts before the Promise', () => {
        expect(evaluate({ hasPromise: false, pathCount: 4, guideDiplomaLevels: [1], electiveDiplomaCount: 1 }).peak).toBeNull();
    });

    it('Promise alone', () => {
        expect(evaluate({}).peak).toBe(PeakType.PROMISE);
    });

    it('bronze: 4 paths from any chapter + Guide Α\' + 1 diploma', () => {
        expect(evaluate({ pathCount: 4, guideDiplomaLevels: [1], electiveDiplomaCount: 1 }).peak).toBe(PeakType.BRONZE);
    });

    it('bronze lists what is still missing', () => {
        const result = evaluate({ pathCount: 3, guideDiplomaLevels: [1], electiveDiplomaCount: 1 });
        expect(result.peak).toBe(PeakType.PROMISE);
        expect(result.peaks[1].requirements.filter((r) => !r.met))
            .toEqual([{ key: 'totalPaths', current: 3, required: 4, met: false }]);
    });

    it('silver: 4 more paths + Guide Β\' + 1 more diploma', () => {
        expect(evaluate({ pathCount: 8, guideDiplomaLevels: [1, 2], electiveDiplomaCount: 2 }).peak).toBe(PeakType.SILVER);
    });

    it('gold: 4 more paths + Guide Γ\' + 2 more diplomas', () => {
        expect(evaluate({ pathCount: 12, guideDiplomaLevels: [1, 2, 3], electiveDiplomaCount: 4 }).peak).toBe(PeakType.GOLD);
    });

    it('peaks are earned in order: Guide Β\' without Α\' stops at the Promise', () => {
        expect(evaluate({ pathCount: 8, guideDiplomaLevels: [2], electiveDiplomaCount: 2 }).peak).toBe(PeakType.PROMISE);
    });
});
