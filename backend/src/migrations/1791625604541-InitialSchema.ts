import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1791625604541 implements MigrationInterface {
    name = 'InitialSchema1791625604541'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Databases created before migrations existed were built by
        // `synchronize: true` and already match this schema; just record
        // this migration as applied for them.
        if (await queryRunner.hasTable('user')) {
            return;
        }

        await queryRunner.query(`CREATE TABLE "unit" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text, "flag" character varying, "locationId" integer, CONSTRAINT "PK_4252c4be609041e559f0c80f58a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."location_type_enum" AS ENUM('guides', 'naval-guides')`);
        await queryRunner.query(`CREATE TABLE "location" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "type" "public"."location_type_enum" NOT NULL DEFAULT 'guides', "latitude" numeric(10,7), "longitude" numeric(10,7), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f0336eb8ccdf8306e270d400cf0" UNIQUE ("name"), CONSTRAINT "PK_876d7bdba03c72251ec4c2dc827" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('super_admin', 'admin', 'user')`);
        await queryRunner.query(`CREATE TYPE "public"."user_unitrole_enum" AS ENUM('leader', 'deputy_leader', 'member')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'user', "isAdmin" boolean NOT NULL DEFAULT false, "unitRole" "public"."user_unitrole_enum" DEFAULT 'member', "profileImage" character varying, "avatarConfig" text, "resetPasswordToken" character varying, "resetPasswordExpires" TIMESTAMP, "locationId" integer, "unitId" integer, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."peaks_type_enum" AS ENUM('promise', 'bronze', 'silver', 'gold')`);
        await queryRunner.query(`CREATE TABLE "peaks" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "type" "public"."peaks_type_enum" NOT NULL, "image" character varying, "description" text, "order" integer NOT NULL, CONSTRAINT "UQ_d7c53bf8da45bc9da8a35ba5b7e" UNIQUE ("type"), CONSTRAINT "PK_4ab7385548683b774519559b141" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."paths_category_enum" AS ENUM('me_and_my_capabilities', 'society_and_volunteering', 'nature', 'arts')`);
        await queryRunner.query(`CREATE TABLE "paths" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "category" "public"."paths_category_enum" NOT NULL, "description" text, CONSTRAINT "PK_3023c8d7a50ae9c50117a94e502" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "guide_diplomas" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "level" integer NOT NULL, "image" character varying, "description" text, CONSTRAINT "UQ_1eb69a9a6203a017c997b840b04" UNIQUE ("level"), CONSTRAINT "PK_ba16c2ce7dbf42e3d10896fbb78" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "elective_diplomas" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "image" character varying, "description" text, CONSTRAINT "PK_7eb651a812976a30601fdbde6ba" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_progress" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "currentPeakId" integer, CONSTRAINT "UQ_b5d0e1b57bc6c761fb49e79bf89" UNIQUE ("userId"), CONSTRAINT "REL_b5d0e1b57bc6c761fb49e79bf8" UNIQUE ("userId"), CONSTRAINT "PK_7b5eb2436efb0051fdf05cbe839" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "UQ_4542dd2f38a61354a040ba9fd57" UNIQUE ("token"), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_completed_paths" ("userProgressId" integer NOT NULL, "pathId" integer NOT NULL, CONSTRAINT "PK_038d5506fd2ecd4a8ada2df6374" PRIMARY KEY ("userProgressId", "pathId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4b1006420cccaf91b4bf5e10b7" ON "user_completed_paths" ("userProgressId") `);
        await queryRunner.query(`CREATE INDEX "IDX_2c90a5d97f799f8480e916c02a" ON "user_completed_paths" ("pathId") `);
        await queryRunner.query(`CREATE TABLE "user_guide_diplomas" ("userProgressId" integer NOT NULL, "guideDiplomaId" integer NOT NULL, CONSTRAINT "PK_2f06583f25d6fe9dcfbc11383a5" PRIMARY KEY ("userProgressId", "guideDiplomaId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f88bd68577f22dd5380b810da2" ON "user_guide_diplomas" ("userProgressId") `);
        await queryRunner.query(`CREATE INDEX "IDX_544b40e735b69ec9926bbee336" ON "user_guide_diplomas" ("guideDiplomaId") `);
        await queryRunner.query(`CREATE TABLE "user_elective_diplomas" ("userProgressId" integer NOT NULL, "electiveDiplomaId" integer NOT NULL, CONSTRAINT "PK_424afd6468b113f14da94805d27" PRIMARY KEY ("userProgressId", "electiveDiplomaId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bb47e82494e8e27d740d03dc20" ON "user_elective_diplomas" ("userProgressId") `);
        await queryRunner.query(`CREATE INDEX "IDX_99d35f44050defa1df8bc5794f" ON "user_elective_diplomas" ("electiveDiplomaId") `);
        await queryRunner.query(`ALTER TABLE "unit" ADD CONSTRAINT "FK_b5ab1bf2110892906ad7c05776b" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_93e37a8413a5745a9b52bc3c0c1" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_856a1f0347b672d3b8bb4693bd8" FOREIGN KEY ("unitId") REFERENCES "unit"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_progress" ADD CONSTRAINT "FK_b5d0e1b57bc6c761fb49e79bf89" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_progress" ADD CONSTRAINT "FK_b3eefb11ed142838548aaaa4836" FOREIGN KEY ("currentPeakId") REFERENCES "peaks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_completed_paths" ADD CONSTRAINT "FK_4b1006420cccaf91b4bf5e10b75" FOREIGN KEY ("userProgressId") REFERENCES "user_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_completed_paths" ADD CONSTRAINT "FK_2c90a5d97f799f8480e916c02ae" FOREIGN KEY ("pathId") REFERENCES "paths"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_guide_diplomas" ADD CONSTRAINT "FK_f88bd68577f22dd5380b810da23" FOREIGN KEY ("userProgressId") REFERENCES "user_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_guide_diplomas" ADD CONSTRAINT "FK_544b40e735b69ec9926bbee3363" FOREIGN KEY ("guideDiplomaId") REFERENCES "guide_diplomas"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_elective_diplomas" ADD CONSTRAINT "FK_bb47e82494e8e27d740d03dc201" FOREIGN KEY ("userProgressId") REFERENCES "user_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_elective_diplomas" ADD CONSTRAINT "FK_99d35f44050defa1df8bc5794f2" FOREIGN KEY ("electiveDiplomaId") REFERENCES "elective_diplomas"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_elective_diplomas" DROP CONSTRAINT "FK_99d35f44050defa1df8bc5794f2"`);
        await queryRunner.query(`ALTER TABLE "user_elective_diplomas" DROP CONSTRAINT "FK_bb47e82494e8e27d740d03dc201"`);
        await queryRunner.query(`ALTER TABLE "user_guide_diplomas" DROP CONSTRAINT "FK_544b40e735b69ec9926bbee3363"`);
        await queryRunner.query(`ALTER TABLE "user_guide_diplomas" DROP CONSTRAINT "FK_f88bd68577f22dd5380b810da23"`);
        await queryRunner.query(`ALTER TABLE "user_completed_paths" DROP CONSTRAINT "FK_2c90a5d97f799f8480e916c02ae"`);
        await queryRunner.query(`ALTER TABLE "user_completed_paths" DROP CONSTRAINT "FK_4b1006420cccaf91b4bf5e10b75"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`);
        await queryRunner.query(`ALTER TABLE "user_progress" DROP CONSTRAINT "FK_b3eefb11ed142838548aaaa4836"`);
        await queryRunner.query(`ALTER TABLE "user_progress" DROP CONSTRAINT "FK_b5d0e1b57bc6c761fb49e79bf89"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_856a1f0347b672d3b8bb4693bd8"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_93e37a8413a5745a9b52bc3c0c1"`);
        await queryRunner.query(`ALTER TABLE "unit" DROP CONSTRAINT "FK_b5ab1bf2110892906ad7c05776b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_99d35f44050defa1df8bc5794f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bb47e82494e8e27d740d03dc20"`);
        await queryRunner.query(`DROP TABLE "user_elective_diplomas"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_544b40e735b69ec9926bbee336"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f88bd68577f22dd5380b810da2"`);
        await queryRunner.query(`DROP TABLE "user_guide_diplomas"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2c90a5d97f799f8480e916c02a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4b1006420cccaf91b4bf5e10b7"`);
        await queryRunner.query(`DROP TABLE "user_completed_paths"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
        await queryRunner.query(`DROP TABLE "user_progress"`);
        await queryRunner.query(`DROP TABLE "elective_diplomas"`);
        await queryRunner.query(`DROP TABLE "guide_diplomas"`);
        await queryRunner.query(`DROP TABLE "paths"`);
        await queryRunner.query(`DROP TYPE "public"."paths_category_enum"`);
        await queryRunner.query(`DROP TABLE "peaks"`);
        await queryRunner.query(`DROP TYPE "public"."peaks_type_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_unitrole_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "location"`);
        await queryRunner.query(`DROP TYPE "public"."location_type_enum"`);
        await queryRunner.query(`DROP TABLE "unit"`);
    }

}
