import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMilestonesTable1753104181291 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create milestone_category enum type if it doesn't exist
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'milestone_category_enum') THEN
                    CREATE TYPE milestone_category_enum AS ENUM (
                        'motorDevelopment',
                        'communicationLanguage',
                        'cognitiveDevelopment',
                        'socialEmotional',
                        'selfCare',
                        'physicalGrowth'
                    );
                END IF;
            END
            $$;
        `);

        // Create milestones table
        await queryRunner.query(`
            CREATE TABLE milestones (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                category milestone_category_enum NOT NULL,
                milestone VARCHAR(255) NOT NULL,
                "expectedAgeMonths" INTEGER NOT NULL,
                "ageRangeMonths" INTEGER[] NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop milestones table
        await queryRunner.query(`DROP TABLE IF EXISTS milestones;`);
        
        // Drop milestone_category enum type
        await queryRunner.query(`
            DROP TYPE IF EXISTS milestone_category_enum;
        `);
    }

}
