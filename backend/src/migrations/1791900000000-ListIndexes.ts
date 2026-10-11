import { MigrationInterface, QueryRunner } from 'typeorm';

/** Postgres doesn't index foreign keys: the paged lists filter by these. */
export class ListIndexes1791900000000 implements MigrationInterface {
    name = 'ListIndexes1791900000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_user_locationId" ON "user" ("locationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_user_unitId" ON "user" ("unitId") `);
        await queryRunner.query(`CREATE INDEX "IDX_unit_locationId" ON "unit" ("locationId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_unit_locationId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_unitId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_locationId"`);
    }
}
