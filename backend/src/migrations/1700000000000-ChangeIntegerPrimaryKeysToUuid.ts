import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeIntegerPrimaryKeysToUuid1700000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // UserChild entity - check if table exists first
        const userChildTableExists = await queryRunner.hasTable('user_child');
        if (userChildTableExists) {
            await queryRunner.query(`
                ALTER TABLE "user_child" 
                ALTER COLUMN "id" DROP DEFAULT,
                ALTER COLUMN "id" TYPE uuid USING (uuid_generate_v4()),
                ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()
            `);
        }

        // Invitation entity in children module - check if table exists first
        const invitationTableExists = await queryRunner.hasTable('invitation');
        if (invitationTableExists) {
            await queryRunner.query(`
                ALTER TABLE "invitation" 
                ALTER COLUMN "id" DROP DEFAULT,
                ALTER COLUMN "id" TYPE uuid USING (uuid_generate_v4()),
                ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()
            `);
        }

        // MedicalRecord entity - check if table exists first
        const medicalRecordTableExists = await queryRunner.hasTable('medical_record');
        if (medicalRecordTableExists) {
            await queryRunner.query(`
                ALTER TABLE "medical_record" 
                ALTER COLUMN "id" DROP DEFAULT,
                ALTER COLUMN "id" TYPE uuid USING (uuid_generate_v4()),
                ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()
            `);
        }

        // Notification entity - check if table exists first
        const notificationTableExists = await queryRunner.hasTable('notification');
        if (notificationTableExists) {
            await queryRunner.query(`
                ALTER TABLE "notification" 
                ALTER COLUMN "id" DROP DEFAULT,
                ALTER COLUMN "id" TYPE uuid USING (uuid_generate_v4()),
                ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // This is a destructive migration, so the down method would lose data
        // It's better to handle this manually if needed
        throw new Error('This migration cannot be reverted automatically');
    }
}
