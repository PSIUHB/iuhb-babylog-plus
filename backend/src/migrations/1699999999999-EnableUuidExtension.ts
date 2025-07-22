import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnableUuidExtension1699999999999 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // We don't want to drop the extension as it might be used by other parts of the system
    }
}