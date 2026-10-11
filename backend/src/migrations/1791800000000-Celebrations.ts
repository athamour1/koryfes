import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Remember which milestones each Guide has been congratulated on. Existing
 * Guides start "up to date" (their current peak and elective diplomas), so only
 * milestones awarded from now on are celebrated.
 */
export class Celebrations1791800000000 implements MigrationInterface {
    name = 'Celebrations1791800000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_progress" ADD "celebratedPeakOrder" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user_progress" ADD "celebratedElectiveIds" text`);
        await queryRunner.query(`
            UPDATE "user_progress" up SET
                "celebratedPeakOrder" = COALESCE((SELECT p."order" FROM "peaks" p WHERE p."id" = up."currentPeakId"), 0),
                "celebratedElectiveIds" = COALESCE(
                    (SELECT json_agg(ued."electiveDiplomaId" ORDER BY ued."electiveDiplomaId")::text
                       FROM "user_elective_diplomas" ued WHERE ued."userProgressId" = up."id"),
                    '[]')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_progress" DROP COLUMN "celebratedElectiveIds"`);
        await queryRunner.query(`ALTER TABLE "user_progress" DROP COLUMN "celebratedPeakOrder"`);
    }
}
