import {
  CostReconciliationDto,
  EquipmentCostDto,
  ProjectCostDto,
  ProjectCostsOverviewDto,
  WorkstreamCostDto,
} from './dto/cost.dto';
import {
  DecisionCostImpactDto,
  IssueCostImpactDto,
  RiskCostImpactDto,
} from './dto/entity-cost-impact.dto';
import {
  NotificationDto,
  NotificationEntityRefDto,
  NotificationListDto,
} from './dto/notification.dto';
import { PersonDetailDto, PersonDto, PersonListDto } from './dto/person.dto';
import {
  WorkstreamCatalogItemDto,
  WorkstreamDetailDto,
  WorkstreamListDto,
} from './dto/workstream.dto';

/** Models registered in OpenAPI via extraModels (handlers land in later R2 stages). */
export const R2_CONTRACT_EXTRA_MODELS = [
  PersonDto,
  PersonListDto,
  PersonDetailDto,
  WorkstreamCatalogItemDto,
  WorkstreamListDto,
  WorkstreamDetailDto,
  ProjectCostDto,
  WorkstreamCostDto,
  EquipmentCostDto,
  CostReconciliationDto,
  ProjectCostsOverviewDto,
  RiskCostImpactDto,
  IssueCostImpactDto,
  DecisionCostImpactDto,
  NotificationEntityRefDto,
  NotificationDto,
  NotificationListDto,
] as const;
