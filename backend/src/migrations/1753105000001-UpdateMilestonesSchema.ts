import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMilestonesSchema1753105000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, ensure there are no null values in the milestone column
        // This is a safety check in case the previous migration didn't run
        await queryRunner.query(`
            UPDATE milestones
            SET milestone = 'Unknown milestone'
            WHERE milestone IS NULL;
        `);

        // Rename the enum type
        await queryRunner.query(`
            ALTER TYPE "public"."milestone_category_enum" RENAME TO "milestone_category_enum_old";
        `);

        // Create the new enum type
        await queryRunner.query(`
            CREATE TYPE "public"."milestones_category_enum" AS ENUM(
                'motorDevelopment', 
                'communicationLanguage', 
                'cognitiveDevelopment', 
                'socialEmotional', 
                'selfCare', 
                'physicalGrowth'
            );
        `);

        // Alter the category column to use the new enum type
        await queryRunner.query(`
            ALTER TABLE "milestones" 
            ALTER COLUMN "category" TYPE "public"."milestones_category_enum" 
            USING "category"::"text"::"public"."milestones_category_enum";
        `);

        // Drop the old enum type
        await queryRunner.query(`
            DROP TYPE "public"."milestone_category_enum_old";
        `);

        // Create a temporary column with the NOT NULL constraint
        await queryRunner.query(`
            ALTER TABLE "milestones" 
            ADD COLUMN "milestone_new" character varying NOT NULL DEFAULT 'Unknown milestone';
        `);

        // Copy data from the old column to the new one
        await queryRunner.query(`
            UPDATE "milestones" 
            SET "milestone_new" = "milestone" 
            WHERE "milestone" IS NOT NULL;
        `);

        // Drop the old column
        await queryRunner.query(`
            ALTER TABLE "milestones" 
            DROP COLUMN "milestone";
        `);

        // Rename the new column to the original name
        await queryRunner.query(`
            ALTER TABLE "milestones" 
            RENAME COLUMN "milestone_new" TO "milestone";
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Rename the enum type back
        await queryRunner.query(`
            ALTER TYPE "public"."milestones_category_enum" RENAME TO "milestones_category_enum_old";
        `);

        // Create the old enum type
        await queryRunner.query(`
            CREATE TYPE "public"."milestone_category_enum" AS ENUM(
                'motorDevelopment', 
                'communicationLanguage', 
                'cognitiveDevelopment', 
                'socialEmotional', 
                'selfCare', 
                'physicalGrowth'
            );
        `);

        // Alter the category column to use the old enum type
        await queryRunner.query(`
            ALTER TABLE "milestones" 
            ALTER COLUMN "category" TYPE "public"."milestone_category_enum" 
            USING "category"::"text"::"public"."milestone_category_enum";
        `);

        // Drop the new enum type
        await queryRunner.query(`
            DROP TYPE "public"."milestones_category_enum_old";
        `);

        // For the milestone column, we can't revert the NOT NULL constraint safely
        // So we'll just keep it as is
    }
}