import { Module } from '@nestjs/common';
import { DashboardController } from '../dashboard/dashboard.controller';
import { DashboardService } from '../dashboard/dashboard.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  controllers: [DashboardController, ProjectsController],
  providers: [DashboardService, ProjectsService],
})
export class ProjectsModule {}
