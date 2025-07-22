import { MigrationInterface, QueryRunner } from "typeorm";

export class FixNullMilestones1753105000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update any null milestone values with a default value
        await queryRunner.query(`
            UPDATE milestones
            SET milestone = 'Unknown milestone'
            WHERE milestone IS NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No need to revert this change as we don't want to set values back to null
    }
}