import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeCategoryForeingKeyOnProducts1773843988431 implements MigrationInterface {
  name = 'ChangeCategoryForeingKeyOnProducts1773843988431';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_9a5f6868c96e0069e699f33e124"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" RENAME COLUMN "publicID" TO "public_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" RENAME CONSTRAINT "UQ_13e7df690356ca8ae3c2555fb84" TO "UQ_2508c6862cd49a41826f77e23e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "public_id" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "public_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_728920c8530e2d53c70ae1f695"`,
    );
    await queryRunner.query(`DROP TABLE "product_ratings"`);
    await queryRunner.query(
      `ALTER TABLE "categories" RENAME CONSTRAINT "UQ_2508c6862cd49a41826f77e23e2" TO "UQ_13e7df690356ca8ae3c2555fb84"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" RENAME COLUMN "public_id" TO "publicID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
