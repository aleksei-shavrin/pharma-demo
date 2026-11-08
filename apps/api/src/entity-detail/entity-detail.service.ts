import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { calendarDaysDelta } from '../common/calendar-days-delta';
import { computeDerivedImpact } from '../common/derived-impact';
import { type EntityLink, linksForEntity } from '../common/direct-edges';
import { DEMO_DATA_SOURCE, DemoDataSource } from '../data/demo-data-source';
import type { SnapshotFixture } from '../data/fixtures/types';
import {
  findEquipment,
  findIssue,
  findMilestone,
  findRisk,
} from '../data/snapshot-access';
import { mergeDemoTree } from '../data/schedule/schedule-demo-tree';
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
    const eq = findEquipment(snapshot, entityId);
    if (!eq) {
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
        name: eq.name,
        workstream: eq.workstream,
        critical: eq.critical,
        status: eq.status,
        baselineDelivery: eq.baselineDelivery,
        forecastDelivery: eq.forecastDelivery,
        deliveryVariance: {
          baselineDate: eq.baselineDelivery,
          forecastDate: eq.forecastDelivery,
          deltaDays,
        },
        responsiblePersonId: eq.responsiblePersonId ?? null,
        responsibleFullNameRu: eq.responsiblePersonId
          ? this.dataSource.personFullNameRu(eq.responsiblePersonId)
          : null,
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
    const issue = findIssue(snapshot, entityId);
    if (!issue) {
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
        workstream: issue.workstream,
        ownerPersonId: issue.ownerPersonId,
        ownerFullNameRu: this.dataSource.personFullNameRu(issue.ownerPersonId),
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
    const risk = findRisk(snapshot, entityId);
    if (!risk) {
      throw new NotFoundException(`Risk ${entityId} not found`);
    }
    return {
      snapshotId: snapshot.id,
      scenarioAsOfDate: snapshot.scenarioAsOfDate,
      projectId: snapshot.project.id,
      entity: {
        id: risk.id,
        title: risk.title,
        workstream: risk.workstream,
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
    const ms = findMilestone(snapshot, entityId);
    if (ms) {
      const deltaDays = calendarDaysDelta(ms.baselineDate, ms.forecastDate);
      return {
        snapshotId: snapshot.id,
        scenarioAsOfDate: snapshot.scenarioAsOfDate,
        projectId: snapshot.project.id,
        entity: {
          id: ms.id,
          name: ms.name,
          workstream: ms.workstream,
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

    // Imported KT-* / aliased schedule checkpoints — same date/status lifecycle.
    const base = this.dataSource.getScheduleWorks(snapshotId);
    const asOf = snapshot.scenarioAsOfDate;
    const schedule = mergeDemoTree(base, [], asOf, snapshotId);
    const kt = [
      ...(schedule.importedCheckpoints ?? []),
      ...(schedule.aliasedCheckpoints ?? []),
    ].find((c) => c.id === entityId);
    if (!kt) {
      throw new NotFoundException(`Milestone ${entityId} not found`);
    }
    const rag = kt.status === 'Delayed' ? 'Red' : 'Green';
    const deltaDays = calendarDaysDelta(kt.baselineDate, kt.forecastDate);
    const workstream =
      kt.workstream === null
        ? null
        : (kt.workstream as NonNullable<
            MilestoneDetailDto['entity']['workstream']
          >);
    return {
      snapshotId: snapshot.id,
      scenarioAsOfDate: snapshot.scenarioAsOfDate,
      projectId: snapshot.project.id,
      entity: {
        id: kt.id,
        name: kt.name,
        workstream,
        rag,
        baselineDate: kt.baselineDate,
        forecastDate: kt.forecastDate,
        dateVariance: {
          baselineDate: kt.baselineDate,
          forecastDate: kt.forecastDate,
          deltaDays,
        },
      },
      links: this.mapLinks(linksForEntity(snapshot, 'milestone', kt.id)),
      impact: this.mapImpact(snapshot),
    };
  }

  private mapLinks(links: EntityLink[]): EntityLinkDto[] {
    return links
      .filter((l) => l.targetType !== 'decision')
      .map((l) => ({
        targetType: l.targetType as EntityLinkDto['targetType'],
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
