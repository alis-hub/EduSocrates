import { Module } from '@nestjs/common';
import { CourseworkController } from './coursework.controller';
import { CourseworkService } from './coursework.service';
import { DatabaseModule } from '../database/database.module';
import { DatabaseService } from '../database/database.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CourseworkController],
  providers: [CourseworkService],
})
export class CourseworkModule {}
