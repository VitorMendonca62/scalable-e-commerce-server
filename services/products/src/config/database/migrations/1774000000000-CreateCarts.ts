import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCarts1774000000000 implements MigrationInterface {
  name = 'CreateCarts1774000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "carts" ("id" SERIAL NOT NULL, "public_id" uuid NOT NULL, "user_id" uuid NOT NULL, "items" jsonb NOT NULL DEFAULT '[]', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3f5ad801fb9e14e0b1f2cc0e74b" UNIQUE ("public_id"), CONSTRAINT "PK_37aadcf0b3f3d5d458fc3b3549c" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "carts"`);
  }
}
