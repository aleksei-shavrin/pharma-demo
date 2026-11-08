import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DataModule } from './data/data.module';
import { HealthController } from './health/health.controller';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [AuthModule, DataModule, ProjectsModule],
  controllers: [HealthController],
})
export class AppModule {}
