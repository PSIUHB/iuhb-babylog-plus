import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveStatusFromSleeps1753200000000 implements MigrationInterface {
    name = 'RemoveStatusFromSleeps1753200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Remove the status column from sleeps table
        await queryRunner.query(`ALTER TABLE "sleeps" DROP COLUMN "status"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add the status column back (for rollback)
        await queryRunner.query(`ALTER TABLE "sleeps" ADD "status" character varying`);

        // Re-add the enum constraint if needed
        await queryRunner.query(`ALTER TABLE "sleeps" ADD CONSTRAINT "CHK_sleeps_status" CHECK ("status" IN ('start', 'end'))`);
    }
}
