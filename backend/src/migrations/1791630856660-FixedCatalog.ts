import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Switch to the fixed catalog from the book (src/catalog), synced on startup
 * by CatalogService.
 *
 * The old admin-managed paths/diplomas don't map onto the book's catalog, so
 * awarded progress is reset; Guides who had given their Promise keep it.
 */
export class FixedCatalog1791630856660 implements MigrationInterface {
    name = 'FixedCatalog1791630856660'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. reset awarded progress, keeping the Promise
        await queryRunner.query(`DELETE FROM "user_completed_paths"`);
        await queryRunner.query(`DELETE FROM "user_guide_diplomas"`);
        await queryRunner.query(`DELETE FROM "user_elective_diplomas"`);
        await queryRunner.query(`UPDATE "user_progress" SET "currentPeakId" = (SELECT "id" FROM "peaks" WHERE "type" = 'promise') WHERE "currentPeakId" IS NOT NULL`);

        // 2. drop the old catalog rows (peaks are kept and adopted by type)
        await queryRunner.query(`DELETE FROM "peaks" WHERE "type" <> 'promise'`);
        await queryRunner.query(`DELETE FROM "paths"`);
        await queryRunner.query(`DELETE FROM "guide_diplomas"`);
        await queryRunner.query(`DELETE FROM "elective_diplomas"`);

        // 3. schema
        await queryRunner.query(`ALTER TABLE "peaks" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "peaks" ADD "code" character varying`);
        await queryRunner.query(`UPDATE "peaks" SET "code" = "type"`);
        await queryRunner.query(`ALTER TABLE "peaks" ALTER COLUMN "code" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "peaks" ADD CONSTRAINT "UQ_ce96b6752692ad59d83bce4eb81" UNIQUE ("code")`);
        await queryRunner.query(`ALTER TABLE "guide_diplomas" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "guide_diplomas" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "elective_diplomas" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "elective_diplomas" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "paths" ADD "code" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "paths" ADD CONSTRAINT "UQ_3a30199f633ebf28e3711cf8a37" UNIQUE ("code")`);
        await queryRunner.query(`ALTER TABLE "paths" ADD "number" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "guide_diplomas" ADD "code" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "guide_diplomas" ADD CONSTRAINT "UQ_955327f1d3b45cf43971f70a1a6" UNIQUE ("code")`);
        await queryRunner.query(`ALTER TABLE "guide_diplomas" ADD "requirements" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "elective_diplomas" ADD "code" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "elective_diplomas" ADD CONSTRAINT "UQ_90e1a4ec23aeaafe234f863331f" UNIQUE ("code")`);
        await queryRunner.query(`ALTER TABLE "elective_diplomas" ADD "number" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "elective_diplomas" ADD "intro" text`);
        await queryRunner.query(`ALTER TABLE "elective_diplomas" ADD "requirements" text NOT NULL`);
    }

    // Schema only: the progress reset in up() can't be undone
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "user_completed_paths"`);
        await queryRunner.query(`DELETE FROM "user_guide_diplomas"`);
        await queryRunner.query(`DELETE FROM "user_elective_diplomas"`);
        await queryRunner.query(`DELETE FROM "paths"`);
        await queryRunner.query(`DELETE FROM "guide_diplomas"`);
        await queryRunner.query(`DELETE FROM "elective_diplomas"`);
        await queryRunner.query(`ALTER TABLE "elective_diplomas" DROP COLUMN "requirements"`);
        await queryRunner.query(`ALTER TABLE "elective_diplomas" DROP COLUMN "intro"`);
        await queryRunner.query(`ALTER TABLE "elective_diplomas" DROP COLUMN "number"`);
        await queryRunner.query(`ALTER TABLE "elective_diplomas" DROP CONSTRAINT "UQ_90e1a4ec23aeaafe234f863331f"`);
        await queryRunner.query(`ALTER TABLE "elective_diplomas" DROP COLUMN "code"`);
        await queryRunner.query(`ALTER TABLE "guide_diplomas" DROP COLUMN "requirements"`);
        await queryRunner.query(`ALTER TABLE "guide_diplomas" DROP CONSTRAINT "UQ_955327f1d3b45cf43971f70a1a6"`);
        await queryRunner.query(`ALTER TABLE "guide_diplomas" DROP COLUMN "code"`);
        await queryRunner.query(`ALTER TABLE "paths" DROP COLUMN "number"`);
        await queryRunner.query(`ALTER TABLE "paths" DROP CONSTRAINT "UQ_3a30199f633ebf28e3711cf8a37"`);
        await queryRunner.query(`ALTER TABLE "paths" DROP COLUMN "code"`);
        await queryRunner.query(`ALTER TABLE "elective_diplomas" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "elective_diplomas" ADD "image" character varying`);
        await queryRunner.query(`ALTER TABLE "guide_diplomas" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "guide_diplomas" ADD "image" character varying`);
        await queryRunner.query(`ALTER TABLE "peaks" DROP CONSTRAINT "UQ_ce96b6752692ad59d83bce4eb81"`);
        await queryRunner.query(`ALTER TABLE "peaks" DROP COLUMN "code"`);
        await queryRunner.query(`ALTER TABLE "peaks" ADD "image" character varying`);
    }

}
