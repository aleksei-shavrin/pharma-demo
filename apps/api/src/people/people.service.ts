import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  PersonDetailDto,
  PersonDto,
  PersonListDto,
} from '../contracts/dto/person.dto';
import { assertPersonId, type PersonId } from '../contracts/person-id';
import { DEMO_DATA_SOURCE, DemoDataSource } from '../data/demo-data-source';
import type { SnapshotId } from '../snapshot/snapshot-id';

@Injectable()
export class PeopleService {
  constructor(
    @Inject(DEMO_DATA_SOURCE) private readonly dataSource: DemoDataSource,
  ) {}

  list(projectId: string, snapshotId: SnapshotId): PersonListDto {
    const snapshot = this.requireProjectSnapshot(projectId, snapshotId);
    return {
      snapshotId: snapshot.id,
      scenarioAsOfDate: snapshot.scenarioAsOfDate,
      projectId: snapshot.project.id,
      items: this.dataSource.listPeople().map((p) => this.toDto(p.id)),
    };
  }

  getDetail(
    projectId: string,
    personIdRaw: string,
    snapshotId: SnapshotId,
  ): PersonDetailDto {
    const snapshot = this.requireProjectSnapshot(projectId, snapshotId);
    let personId: PersonId;
    try {
      personId = assertPersonId(personIdRaw, 'personId');
    } catch {
      throw new NotFoundException(`Person ${personIdRaw} not found`);
    }
    if (!this.dataSource.getPerson(personId)) {
      throw new NotFoundException(`Person ${personId} not found`);
    }

    const issueIds = snapshot.issues
      .filter((i) => i.ownerPersonId === personId)
      .map((i) => i.id)
      .sort();
    const decisionIds = snapshot.decisions
      .filter((d) => d.ownerPersonId === personId)
      .map((d) => d.id)
      .sort();
    const equipmentIds = snapshot.equipment
      .filter((e) => e.responsiblePersonId === personId)
      .map((e) => e.id)
      .sort();

    return {
      snapshotId: snapshot.id,
      scenarioAsOfDate: snapshot.scenarioAsOfDate,
      projectId: snapshot.project.id,
      person: this.toDto(personId),
      issueIds,
      decisionIds,
      equipmentIds,
      leadWorkstreamIds: this.dataSource.leadWorkstreamIdsForPerson(personId),
    };
  }

  private toDto(id: PersonId): PersonDto {
    const p = this.dataSource.getPerson(id);
    if (!p) throw new Error(`Unknown Person ${id}`);
    return {
      id: p.id,
      fullNameRu: p.fullNameRu,
      roleTitleRu: p.roleTitleRu,
      primaryWorkstreamId: p.primaryWorkstreamId,
      active: p.active,
    };
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
