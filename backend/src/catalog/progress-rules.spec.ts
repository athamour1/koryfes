import { PathCategory } from '../paths/path-category.enum';
import { PeakType } from '../peaks/peak-type.enum';
import { evaluateProgress } from './progress-rules';

const { ME_AND_MY_CAPABILITIES: SELF, SOCIETY_AND_VOLUNTEERING: SOCIETY, NATURE, ARTS } = PathCategory;
const oneEach = [SELF, SOCIETY, NATURE, ARTS];

const evaluate = (overrides: Partial<Parameters<typeof evaluateProgress>[0]>) =>
    evaluateProgress({ hasPromise: true, pathCategories: [], guideDiplomaLevels: [], electiveDiplomaCount: 0, ...overrides });

describe('evaluateProgress (book p. 9)', () => {
    it('nothing counts before the Promise', () => {
        const result = evaluate({ hasPromise: false, pathCategories: oneEach, guideDiplomaLevels: [1], electiveDiplomaCount: 1 });
        expect(result.peak).toBeNull();
    });

    it('Promise alone', () => {
        expect(evaluate({}).peak).toBe(PeakType.PROMISE);
    });

    it('bronze: one path from each chapter + Guide Α\' + 1 diploma', () => {
        expect(evaluate({ pathCategories: oneEach, guideDiplomaLevels: [1], electiveDiplomaCount: 1 }).peak).toBe(PeakType.BRONZE);
    });

    it('bronze needs every chapter, not just four paths', () => {
        const result = evaluate({ pathCategories: [SELF, SELF, NATURE, ARTS], guideDiplomaLevels: [1], electiveDiplomaCount: 1 });
        expect(result.peak).toBe(PeakType.PROMISE);
        const missing = result.peaks[1].requirements.filter((r) => !r.met);
        expect(missing).toEqual([expect.objectContaining({ key: 'chapterPaths', category: SOCIETY, current: 0, required: 1 })]);
    });

    it('silver: a second path in every chapter + Guide Β\' + 2 diplomas', () => {
        const result = evaluate({ pathCategories: [...oneEach, ...oneEach], guideDiplomaLevels: [1, 2], electiveDiplomaCount: 2 });
        expect(result.peak).toBe(PeakType.SILVER);
    });

    it('gold: 4 more paths from any chapter + Guide Γ\' + 4 diplomas', () => {
        const result = evaluate({
            pathCategories: [...oneEach, ...oneEach, ARTS, ARTS, ARTS, ARTS],
            guideDiplomaLevels: [1, 2, 3],
            electiveDiplomaCount: 4,
        });
        expect(result.peak).toBe(PeakType.GOLD);
    });

    it('peaks are earned in order: Guide Β\' without Α\' stops at the Promise', () => {
        const result = evaluate({ pathCategories: [...oneEach, ...oneEach], guideDiplomaLevels: [2], electiveDiplomaCount: 2 });
        expect(result.peak).toBe(PeakType.PROMISE);
    });
});
