import { Module } from '@nestjs/common';
import { ParentController } from './parent.controller';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ParentController],
})
export class ParentModule {}

