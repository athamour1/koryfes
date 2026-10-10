import { MigrationInterface, QueryRunner } from 'typeorm';

/** Unit gallery: one corner photo and up to 9 activity photos per unit. */
export class UnitPhotos1791700000000 implements MigrationInterface {
    name = 'UnitPhotos1791700000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."unit_photo_kind_enum" AS ENUM('corner', 'activity')`);
        await queryRunner.query(`CREATE TABLE "unit_photo" ("id" SERIAL NOT NULL, "kind" "public"."unit_photo_kind_enum" NOT NULL, "path" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "unitId" integer, CONSTRAINT "PK_unit_photo_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "unit_photo" ADD CONSTRAINT "FK_unit_photo_unit" FOREIGN KEY ("unitId") REFERENCES "unit"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "unit_photo" DROP CONSTRAINT "FK_unit_photo_unit"`);
        await queryRunner.query(`DROP TABLE "unit_photo"`);
        await queryRunner.query(`DROP TYPE "public"."unit_photo_kind_enum"`);
    }
}
