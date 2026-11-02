import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  NotificationDto,
  NotificationListDto,
} from '../contracts/dto/notification.dto';
import { DEMO_DATA_SOURCE, DemoDataSource } from '../data/demo-data-source';
import type { SnapshotId } from '../snapshot/snapshot-id';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(DEMO_DATA_SOURCE) private readonly dataSource: DemoDataSource,
  ) {}

  list(projectId: string, snapshotId: SnapshotId): NotificationListDto {
    const project = this.dataSource.getProject(snapshotId, projectId);
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }
    const snapshot = this.dataSource.getSnapshot(snapshotId);
    const items: NotificationDto[] = this.dataSource
      .listNotifications(snapshotId)
      .map((n) => ({
        id: n.id,
        snapshotId: n.snapshotId,
        severity: n.severity,
        taxonomy: n.taxonomy,
        titleRu: n.titleRu,
        bodyRu: n.bodyRu,
        href: n.href,
        entityRefs: n.entityRefs.map((r) => ({ type: r.type, id: r.id })),
      }));
    return {
      snapshotId: snapshot.id,
      scenarioAsOfDate: snapshot.scenarioAsOfDate,
      projectId: project.id,
      items,
    };
  }
}
