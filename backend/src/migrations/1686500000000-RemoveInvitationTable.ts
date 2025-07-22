import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveInvitationTable1686500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the invitation table exists
    const invitationTableExists = await queryRunner.hasTable('invitation');
    
    if (invitationTableExists) {
      // Check if the invitations table exists
      const invitationsTableExists = await queryRunner.hasTable('invitations');
      
      if (invitationsTableExists) {
        // Copy data from invitation to invitations if there's any data to migrate
        await queryRunner.query(`
          INSERT INTO invitations (id, "familyId")
          SELECT id, "familyId" FROM invitation
          ON CONFLICT (id) DO NOTHING
        `);
      }
      
      // Drop the invitation table
      await queryRunner.dropTable('invitation');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This is a one-way migration, we don't want to recreate the duplicate table
    // But if needed, we could recreate the table structure here
  }
}