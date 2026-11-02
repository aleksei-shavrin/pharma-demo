import { Module } from '@nestjs/common';
import { CostsController } from '../costs/costs.controller';
import { CostsService } from '../costs/costs.service';
import { DashboardController } from '../dashboard/dashboard.controller';
import { DashboardService } from '../dashboard/dashboard.service';
import { EntityDetailController } from '../entity-detail/entity-detail.controller';
import { EntityDetailService } from '../entity-detail/entity-detail.service';
import { RegistersController } from '../registers/registers.controller';
import { RegistersService } from '../registers/registers.service';
import { ScheduleController } from '../schedule/schedule.controller';
import { ScheduleService } from '../schedule/schedule.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  controllers: [
    DashboardController,
    RegistersController,
    EntityDetailController,
    ScheduleController,
    CostsController,
    ProjectsController,
  ],
  providers: [
    DashboardService,
    RegistersService,
    EntityDetailService,
    ScheduleService,
    CostsService,
    ProjectsService,
  ],
})
export class ProjectsModule {}
