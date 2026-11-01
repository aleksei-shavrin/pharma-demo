import { Module } from '@nestjs/common';
import { DashboardController } from '../dashboard/dashboard.controller';
import { DashboardService } from '../dashboard/dashboard.service';
import { EntityDetailController } from '../entity-detail/entity-detail.controller';
import { EntityDetailService } from '../entity-detail/entity-detail.service';
import { RegistersController } from '../registers/registers.controller';
import { RegistersService } from '../registers/registers.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  controllers: [
    DashboardController,
    RegistersController,
    EntityDetailController,
    ProjectsController,
  ],
  providers: [
    DashboardService,
    RegistersService,
    EntityDetailService,
    ProjectsService,
  ],
})
export class ProjectsModule {}
