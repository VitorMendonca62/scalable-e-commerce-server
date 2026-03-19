import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRating1773842361074 implements MigrationInterface {
  name = 'CreateRating1773842361074';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "product_ratings" ("id" SERIAL NOT NULL, "user_id" uuid NOT NULL, "product_id" uuid NOT NULL, "value" smallint NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f8bd94404fc1d160bdb075dc435" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_728920c8530e2d53c70ae1f695" ON "product_ratings" ("user_id", "product_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" ADD CONSTRAINT "FK_538c9489e98d4874e8db0c4cafd" FOREIGN KEY ("product_id") REFERENCES "products"("public_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_ratings" DROP CONSTRAINT "FK_538c9489e98d4874e8db0c4cafd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_728920c8530e2d53c70ae1f695"`,
    );
    await queryRunner.query(`DROP TABLE "product_ratings"`);
  }
}
