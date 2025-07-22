import { MigrationInterface, QueryRunner } from "typeorm";
import { MILESTONES, MilestoneCategory } from "@/interfaces/milestone.interface";

export class SeedMilestones1753104181292 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Prepare values for insertion
        const values: string[] = [];
        
        // Process each milestone category
        for (const category of Object.values(MilestoneCategory)) {
            const milestones = MILESTONES[category];
            
            for (const milestone of milestones) {
                const escapedMilestone = milestone.milestone.replace(/'/g, "''");
                const ageRangeStr = `'{${milestone.ageRangeMonths[0]},${milestone.ageRangeMonths[1]}}'`;
                
                values.push(`('${category}', '${escapedMilestone}', ${milestone.expectedAgeMonths}, ${ageRangeStr})`);
            }
        }
        
        // Insert all milestones in a single query
        if (values.length > 0) {
            await queryRunner.query(`
                INSERT INTO milestones (category, milestone, "expectedAgeMonths", "ageRangeMonths")
                VALUES ${values.join(',')};
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove all seeded milestones
        await queryRunner.query(`TRUNCATE TABLE milestones;`);
    }
}