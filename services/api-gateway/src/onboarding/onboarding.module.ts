import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OnboardingService } from './onboarding.service';
import { TeacherClassesService } from './teacher-classes.service';
import { OnboardingController, StudentJoinController, TeacherClassesController } from './onboarding.controller';

@Module({
  imports: [AuthModule],
  providers: [OnboardingService, TeacherClassesService],
  controllers: [OnboardingController, StudentJoinController, TeacherClassesController],
  exports: [OnboardingService],
})
export class OnboardingModule {}
