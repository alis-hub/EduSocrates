import { Module } from '@nestjs/common';
import { ParentController } from './parent.controller';
import { ParentInvitationsController } from './parent-invitations.controller';
import { ParentService } from './parent.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ParentController, ParentInvitationsController],
  providers: [ParentService],
  exports: [ParentService],
})
export class ParentModule {}
