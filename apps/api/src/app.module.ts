import { Module } from '@nestjs/common';
import { DataModule } from './data/data.module';
import { HealthController } from './health/health.controller';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [DataModule, ProjectsModule],
  controllers: [HealthController],
})
export class AppModule {}
