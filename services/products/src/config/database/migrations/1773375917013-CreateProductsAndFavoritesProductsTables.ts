import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductsAndFavoritesProductsTables1773375917013 implements MigrationInterface {
  name = 'CreateProductsAndFavoritesProductsTables1773375917013';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "products" ("id" SERIAL NOT NULL, "public_id" uuid NOT NULL, "title" character varying(255) NOT NULL, "price" integer NOT NULL, "overview" character varying(255), "description" text NOT NULL, "photos" text NOT NULL, "payments" text NOT NULL, "active" boolean NOT NULL DEFAULT true, "stock" integer NOT NULL DEFAULT '0', "owner" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a9fdc2cfb127916506c619a9a48" UNIQUE ("public_id"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_favorites" ("id" SERIAL NOT NULL, "user_id" uuid NOT NULL, "product_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_731c5d4877a8511f3bd5d7e6c10" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a2f0e6548c4c382c2769ad7658" ON "product_favorites" ("user_id", "product_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "product_favorites" ADD CONSTRAINT "FK_a0b0826f5c155ce481fb0d2017b" FOREIGN KEY ("product_id") REFERENCES "products"("public_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_favorites" DROP CONSTRAINT "FK_a0b0826f5c155ce481fb0d2017b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a2f0e6548c4c382c2769ad7658"`,
    );
    await queryRunner.query(`DROP TABLE "product_favorites"`);
    await queryRunner.query(`DROP TABLE "products"`);
  }
}
