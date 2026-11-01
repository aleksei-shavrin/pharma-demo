import { Module } from '@nestjs/common';
import { DashboardController } from '../dashboard/dashboard.controller';
import { DashboardService } from '../dashboard/dashboard.service';
import { RegistersController } from '../registers/registers.controller';
import { RegistersService } from '../registers/registers.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  controllers: [DashboardController, RegistersController, ProjectsController],
  providers: [DashboardService, RegistersService, ProjectsService],
})
export class ProjectsModule {}
