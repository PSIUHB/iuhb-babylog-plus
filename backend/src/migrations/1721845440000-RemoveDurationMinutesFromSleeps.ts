import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveDurationMinutesFromSleeps1721845440000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Remove the duration_minutes column from the sleeps table
        await queryRunner.query(`
            ALTER TABLE "sleeps" 
            DROP COLUMN IF EXISTS "duration_minutes";
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add the duration_minutes column back if needed
        await queryRunner.query(`
            ALTER TABLE "sleeps" 
            ADD COLUMN "duration_minutes" integer NULL;
        `);
    }
}