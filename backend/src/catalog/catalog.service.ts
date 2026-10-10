import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource, EntityManager, In, IsNull, Not, ObjectLiteral, Repository } from 'typeorm';
import { Peak } from '../peaks/peak.entity';
import { PeakType } from '../peaks/peak-type.enum';
import { Path } from '../paths/path.entity';
import { GuideDiploma } from '../guide-diplomas/guide-diploma.entity';
import { ElectiveDiploma } from '../elective-diplomas/elective-diploma.entity';
import { UserProgress } from '../user-progress/user-progress.entity';
import { ELECTIVE_DIPLOMAS, GUIDE_DIPLOMAS, PATHS, PEAKS } from './catalog.data';

/**
 * Keeps the catalog tables identical to the fixed catalog in catalog.data.ts.
 * Rows are matched by `code`, so ids (and the progress referencing them) stay
 * stable across restarts. Rows that are not part of the catalog are removed
 * together with any progress that referenced them.
 */
@Injectable()
export class CatalogService implements OnApplicationBootstrap {
    private readonly logger = new Logger(CatalogService.name);

    constructor(private readonly dataSource: DataSource) { }

    async onApplicationBootstrap() {
        await this.dataSource.transaction((manager) => this.sync(manager));
    }

    async sync(manager: EntityManager) {
        // Legacy peak rows have no code yet: adopt them by type to keep ids
        await this.upsert(manager.getRepository(Peak), PEAKS, (row, item) => row.code === item.code || row.type === item.type);
        await this.upsert(manager.getRepository(GuideDiploma), GUIDE_DIPLOMAS, (row, item) => row.code === item.code);
        await this.upsert(manager.getRepository(ElectiveDiploma), ELECTIVE_DIPLOMAS, (row, item) => row.code === item.code);
        await this.upsert(manager.getRepository(Path), PATHS, (row, item) => row.code === item.code);

        const removed =
            (await this.removeStale(manager, Path, PATHS, 'user_completed_paths', 'pathId')) +
            (await this.removeStale(manager, GuideDiploma, GUIDE_DIPLOMAS, 'user_guide_diplomas', 'guideDiplomaId')) +
            (await this.removeStale(manager, ElectiveDiploma, ELECTIVE_DIPLOMAS, 'user_elective_diplomas', 'electiveDiplomaId'));

        if (removed > 0) {
            // Awarded progress was wiped: nobody can hold a peak above the Promise anymore
            const promise = await manager.getRepository(Peak).findOneByOrFail({ type: PeakType.PROMISE });
            await manager.getRepository(UserProgress).update(
                { currentPeakId: Not(IsNull()) },
                { currentPeakId: promise.id },
            );
            this.logger.warn(`Removed ${removed} catalog entries that are no longer in the book; progress reset to the Promise`);
        }
    }

    private async upsert<T extends ObjectLiteral & { code: string }, C extends { code: string }>(
        repo: Repository<T>,
        catalog: C[],
        matches: (row: T, item: C) => boolean,
    ) {
        const rows = await repo.find();
        for (const item of catalog) {
            const existing = rows.find((row) => matches(row, item));
            await repo.save({ ...(existing ?? {}), ...item } as unknown as T);
        }
    }

    private async removeStale(
        manager: EntityManager,
        entity: typeof Path | typeof GuideDiploma | typeof ElectiveDiploma,
        catalog: { code: string }[],
        joinTable: string,
        joinColumn: string,
    ): Promise<number> {
        const repo = manager.getRepository<{ id: number; code: string }>(entity);
        const codes = catalog.map((item) => item.code);
        const stale = (await repo.find()).filter((row) => !codes.includes(row.code));
        if (stale.length === 0) {
            return 0;
        }
        const ids = stale.map((row) => row.id);
        await manager.createQueryBuilder().delete().from(joinTable).where(`"${joinColumn}" IN (:...ids)`, { ids }).execute();
        await repo.delete({ id: In(ids) });
        return stale.length;
    }
}
