import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { calendarDaysDelta } from '../common/calendar-days-delta';
import { computeDerivedImpact } from '../common/derived-impact';
import {
  type EntityLink,
  linksForEntity,
} from '../common/direct-edges';
import { DEMO_DATA_SOURCE, DemoDataSource } from '../data/demo-data-source';
import type { SnapshotFixture } from '../data/fixtures/types';
import type { SnapshotId } from '../snapshot/snapshot-id';
import type {
  EntityImpactDto,
  EntityLinkDto,
  EquipmentDetailDto,
  IssueDetailDto,
  MilestoneDetailDto,
  RiskDetailDto,
} from './dto/entity-detail.dto';

/**
 * Typed Entity Detail read models. Links = DOC-BA-015 only; Impact = derived.
 * Does not import fixture constants.
 */
@Injectable()
export class EntityDetailService {
  constructor(
    @Inject(DEMO_DATA_SOURCE) private readonly dataSource: DemoDataSource,
  ) {}

  getEquipment(
    projectId: string,
    entityId: string,
    snapshotId: SnapshotId,
  ): EquipmentDetailDto {
    const snapshot = this.requireProjectSnapshot(projectId, snapshotId);
    const eq = snapshot.equipment;
    if (eq.id !== entityId) {
      throw new NotFoundException(`Equipment ${entityId} not found`);
    }
    const deltaDays = calendarDaysDelta(
      eq.baselineDelivery,
      eq.forecastDelivery,
    );
    return {
      snapshotId: snapshot.id,
      scenarioAsOfDate: snapshot.scenarioAsOfDate,
      projectId: snapshot.project.id,
      entity: {
        id: eq.id,
        critical: eq.critical,
        status: eq.status,
        baselineDelivery: eq.baselineDelivery,
        forecastDelivery: eq.forecastDelivery,
        deliveryVariance: {
          baselineDate: eq.baselineDelivery,
          forecastDate: eq.forecastDelivery,
          deltaDays,
        },
      },
      links: this.mapLinks(linksForEntity(snapshot, 'equipment', eq.id)),
      impact: this.mapImpact(snapshot),
    };
  }

  getIssue(
    projectId: string,
    entityId: string,
    snapshotId: SnapshotId,
  ): IssueDetailDto {
    const snapshot = this.requireProjectSnapshot(projectId, snapshotId);
    const issue = snapshot.issue;
    if (!issue || issue.id !== entityId) {
      throw new NotFoundException(`Issue ${entityId} not found`);
    }
    return {
      snapshotId: snapshot.id,
      scenarioAsOfDate: snapshot.scenarioAsOfDate,
      projectId: snapshot.project.id,
      entity: {
        id: issue.id,
        title: issue.title,
        status: issue.status,
        owner: issue.owner,
      },
      links: this.mapLinks(linksForEntity(snapshot, 'issue', issue.id)),
      impact: this.mapImpact(snapshot),
    };
  }

  getRisk(
    projectId: string,
    entityId: string,
    snapshotId: SnapshotId,
  ): RiskDetailDto {
    const snapshot = this.requireProjectSnapshot(projectId, snapshotId);
    const risk = snapshot.risk;
    if (risk.id !== entityId) {
      throw new NotFoundException(`Risk ${entityId} not found`);
    }
    return {
      snapshotId: snapshot.id,
      scenarioAsOfDate: snapshot.scenarioAsOfDate,
      projectId: snapshot.project.id,
      entity: {
        id: risk.id,
        rag: risk.rag,
      },
      links: this.mapLinks(linksForEntity(snapshot, 'risk', risk.id)),
      impact: this.mapImpact(snapshot),
    };
  }

  getMilestone(
    projectId: string,
    entityId: string,
    snapshotId: SnapshotId,
  ): MilestoneDetailDto {
    const snapshot = this.requireProjectSnapshot(projectId, snapshotId);
    const ms = snapshot.milestone;
    if (ms.id !== entityId) {
      throw new NotFoundException(`Milestone ${entityId} not found`);
    }
    const deltaDays = calendarDaysDelta(ms.baselineDate, ms.forecastDate);
    return {
      snapshotId: snapshot.id,
      scenarioAsOfDate: snapshot.scenarioAsOfDate,
      projectId: snapshot.project.id,
      entity: {
        id: ms.id,
        name: ms.name,
        rag: ms.rag,
        baselineDate: ms.baselineDate,
        forecastDate: ms.forecastDate,
        dateVariance: {
          baselineDate: ms.baselineDate,
          forecastDate: ms.forecastDate,
          deltaDays,
        },
      },
      links: this.mapLinks(linksForEntity(snapshot, 'milestone', ms.id)),
      impact: this.mapImpact(snapshot),
    };
  }

  private mapLinks(links: EntityLink[]): EntityLinkDto[] {
    return links.map((l) => ({
      targetType: l.targetType,
      targetId: l.targetId,
      displayName: l.displayName,
    }));
  }

  private mapImpact(snapshot: SnapshotFixture): EntityImpactDto {
    return computeDerivedImpact(snapshot);
  }

  private requireProjectSnapshot(projectId: string, snapshotId: SnapshotId) {
    const snapshot = this.dataSource.getSnapshot(snapshotId);
    const project = this.dataSource.getProject(snapshot.id, projectId);
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }
    return snapshot;
  }
}
