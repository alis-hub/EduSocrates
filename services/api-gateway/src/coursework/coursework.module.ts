import { Module } from '@nestjs/common';
import { CourseworkController, PublicCourseworkController } from './coursework.controller';
import { CourseworkService } from './coursework.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CourseworkController, PublicCourseworkController],
  providers: [CourseworkService],
})
export class CourseworkModule {}
