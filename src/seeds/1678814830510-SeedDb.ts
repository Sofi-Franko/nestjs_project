import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDb1678814830510 implements MigrationInterface {
  name = 'SeedDb1678814830510';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO tags (name) VALUES ('coffee'), ('tea'), ('matcha')`,
    );

    // PASSWORD: 123
    await queryRunner.query(
      `INSERT INTO users (username, email, password) VALUES ('SOFIYA', 's@gmail.com', '$2b$10$fmZqtaIFe7ewZVH1rPSPWO2HZTgZWEOUf1MYRXj/hRR5pVcd4yU4.')`,
    );

    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('article-1-lwgdhc', 'Article 1', 'This is art 1', 'Lorem ipsum dolor sit amet..', 'coffee, matcha', '1')`,
    );
    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('article-2-lwgdhb', 'Article 2', 'This is art 2', 'Lorem ipsum dolor sit amet..', 'coffee, tea', '1')`,
    );
  }

  public async down(): Promise<void> {}
}
