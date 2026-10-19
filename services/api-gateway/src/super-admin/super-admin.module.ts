import { Module } from '@nestjs/common';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminService } from './super-admin.service';
import { DatabaseModule } from '../database/database.module';
import { DatabaseService } from '../database/database.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SuperAdminController],
  providers: [SuperAdminService],
})
export class SuperAdminModule {}

