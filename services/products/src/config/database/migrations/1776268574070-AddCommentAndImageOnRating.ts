import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommentAndImageOnRating1776268574070 implements MigrationInterface {
  name = 'AddCommentAndImageOnRating1776268574070';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product_ratings" ADD "comment" text`);
    await queryRunner.query(`ALTER TABLE "product_ratings" ADD "images" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_ratings" DROP COLUMN "images"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" DROP COLUMN "comment"`,
    );
  }
}
