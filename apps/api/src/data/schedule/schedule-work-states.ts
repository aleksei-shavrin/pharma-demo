/**
 * Per-snapshot work state overlays on a shared topology.
 * certainty: assumption — demo narrative progression; not forecast→actual.
 */
import type { SnapshotId } from '../../snapshot/snapshot-id';
import type {
  ScheduleWorkFixture,
  ScheduleWorkFixtureStatus,
} from '../fixtures/schedule-works';
import { schedulePhaseIndex } from './schedule-control-progress';

export type WorkStateOverlay = {
  status: ScheduleWorkFixtureStatus;
  progressPct: number;
  actualStart?: string | null;
  actualEnd?: string | null;
};

type Band = 'early' | 'c' | 'mid' | 'late' | 'close';

function bandFor(snapshotId: SnapshotId): Band {
  const i = schedulePhaseIndex(snapshotId);
  if (i <= 1) return 'early'; // A–B
  if (i === 2) return 'c';
  if (i <= 7) return 'mid'; // D–H
  if (i <= 13) return 'late'; // I–N
  return 'close'; // O–S
}

/**
 * Authored state for known demo works. Missing ids keep topology defaults
 * after nestUnscopedWorks, then consistency pass applies.
 */
export function workStateFor(
  workId: string,
  snapshotId: SnapshotId,
): WorkStateOverlay | null {
  const band = bandFor(snapshotId);
  const table = WORK_STATE_TABLE[workId];
  if (!table) return null;
  return table[band];
}

export function applyWorkStates(
  works: readonly ScheduleWorkFixture[],
  snapshotId: SnapshotId,
): ScheduleWorkFixture[] {
  return works.map((work) => {
    const overlay = workStateFor(work.id, snapshotId);
    if (!overlay) return work;
    // WK-* showcase: overlays own the full fact plane (type-gallery bars).
    // Analyst leaves: status/progress may be curated for narrative, but actual
    // start/end stay on the immutable realized timeline (no FS-breaking rewrite).
    if (!work.id.startsWith('WK-')) {
      // Curated narrative may still show Waiting/Delayed @ progress 0 after ALAP
      // frozen a too-early baseline finish — clear actuals so reconcile/FS stay honest.
      if (
        overlay.progressPct === 0 &&
        (overlay.status === 'Waiting' || overlay.status === 'Delayed')
      ) {
        return {
          ...work,
          status: overlay.status,
          progressPct: 0,
          actualStart: null,
          actualEnd: null,
        };
      }
      return {
        ...work,
        status: overlay.status,
        progressPct: overlay.progressPct,
      };
    }
    return {
      ...work,
      status: overlay.status,
      progressPct: overlay.progressPct,
      actualStart:
        overlay.actualStart !== undefined
          ? overlay.actualStart
          : work.actualStart,
      actualEnd:
        overlay.actualEnd !== undefined ? overlay.actualEnd : work.actualEnd,
    };
  });
}

/**
 * After clamp removes future actuals: keep progress/status coherent with facts.
 * - actualStart missing / clamped away ⇒ progress 0, Waiting (unless Completed
 *   still has actualEnd — then treat as incomplete without end).
 * - Completed without actualEnd ⇒ demote.
 * - progress 100 ⇒ require actualEnd; else demote below 100.
 * - Completed with actualEnd ⇒ progress 100.
 */
export function reconcileWorkFacts(
  works: readonly ScheduleWorkFixture[],
): ScheduleWorkFixture[] {
  return works.map((work) => {
    let status = work.status;
    let progressPct = work.progressPct ?? null;
    const actualStart = work.actualStart ?? null;
    const actualEnd = work.actualEnd ?? null;

    // Actual end fact wins over curated status overlays.
    if (actualEnd != null && actualStart != null) {
      status = 'Completed';
      progressPct = 100;
    }

    if (status === 'Completed' && actualEnd == null) {
      const progress =
        typeof progressPct === 'number' && progressPct > 0
          ? Math.min(progressPct, 90)
          : 0;
      status = progress > 0 ? 'OnSchedule' : 'Waiting';
      progressPct = progress;
    }

    if (status === 'Completed' && actualEnd != null) {
      progressPct = 100;
    }

    if (
      typeof progressPct === 'number' &&
      progressPct === 100 &&
      actualEnd == null
    ) {
      progressPct = actualStart != null ? 90 : 0;
      status = progressPct > 0 ? 'OnSchedule' : 'Waiting';
    }

    if (
      (typeof progressPct === 'number' &&
        progressPct > 0 &&
        actualStart == null) ||
      (status !== 'Waiting' &&
        status !== 'Completed' &&
        actualStart == null &&
        typeof progressPct === 'number' &&
        progressPct > 0)
    ) {
      // Positive progress requires a known start fact still present after asOf clamp.
      progressPct = 0;
      status = 'Waiting';
    }

    if (
      status === 'Completed' &&
      typeof progressPct === 'number' &&
      progressPct < 100 &&
      actualEnd != null
    ) {
      progressPct = 100;
    }

    return { ...work, status, progressPct, actualStart, actualEnd };
  });
}

const WORK_STATE_TABLE: Record<string, Record<Band, WorkStateOverlay>> = {
  'WK-01': {
    // A asOf 2027-02-15 is before authored start 2027-02-18 → Waiting/0 on early.
    early: {
      status: 'Waiting',
      progressPct: 0,
      actualStart: null,
      actualEnd: null,
    },
    c: {
      status: 'Completed',
      progressPct: 100,
      actualStart: '2027-02-18',
      actualEnd: '2027-02-23',
    },
    mid: {
      status: 'Completed',
      progressPct: 100,
      actualStart: '2027-02-18',
      actualEnd: '2027-02-23',
    },
    late: {
      status: 'Completed',
      progressPct: 100,
      actualStart: '2027-02-18',
      actualEnd: '2027-02-23',
    },
    close: {
      status: 'Completed',
      progressPct: 100,
      actualStart: '2027-02-18',
      actualEnd: '2027-02-23',
    },
  },
  'WK-02': {
    early: {
      status: 'Waiting',
      progressPct: 0,
      actualStart: null,
      actualEnd: null,
    },
    c: {
      status: 'Completed',
      progressPct: 100,
      actualStart: '2027-02-20',
      actualEnd: '2027-02-22',
    },
    mid: {
      status: 'Completed',
      progressPct: 100,
      actualStart: '2027-02-20',
      actualEnd: '2027-02-22',
    },
    late: {
      status: 'Completed',
      progressPct: 100,
      actualStart: '2027-02-20',
      actualEnd: '2027-02-22',
    },
    close: {
      status: 'Completed',
      progressPct: 100,
      actualStart: '2027-02-20',
      actualEnd: '2027-02-22',
    },
  },
  'WK-03': {
    early: {
      status: 'Waiting',
      progressPct: 0,
      actualStart: null,
      actualEnd: null,
    },
    c: {
      status: 'Delayed',
      progressPct: 55,
      actualStart: '2027-02-27',
      actualEnd: null,
    },
    mid: {
      status: 'Delayed',
      progressPct: 70,
      actualStart: '2027-02-27',
      actualEnd: null,
    },
    late: {
      status: 'Completed',
      progressPct: 100,
      actualStart: '2027-02-27',
      actualEnd: '2027-03-12',
    },
    close: {
      status: 'Completed',
      progressPct: 100,
      actualStart: '2027-02-27',
      actualEnd: '2027-03-12',
    },
  },
  'WK-04': {
    early: {
      status: 'Waiting',
      progressPct: 0,
      actualStart: null,
      actualEnd: null,
    },
    // C asOf 2027-03-01 is before authored start 2027-03-06 → still Waiting/0.
    c: {
      status: 'Waiting',
      progressPct: 0,
      actualStart: null,
      actualEnd: null,
    },
    mid: {
      status: 'OnSchedule',
      progressPct: 60,
      actualStart: '2027-03-06',
      actualEnd: null,
    },
    late: {
      status: 'Completed',
      progressPct: 100,
      actualStart: '2027-03-06',
      actualEnd: '2027-03-15',
    },
    close: {
      status: 'Completed',
      progressPct: 100,
      actualStart: '2027-03-06',
      actualEnd: '2027-03-15',
    },
  },
  'WK-05': {
    early: {
      status: 'Waiting',
      progressPct: 0,
      actualStart: null,
      actualEnd: null,
    },
    c: {
      status: 'Waiting',
      progressPct: 0,
      actualStart: null,
      actualEnd: null,
    },
    mid: {
      status: 'OnSchedule',
      progressPct: 20,
      actualStart: '2027-03-13',
      actualEnd: null,
    },
    late: {
      status: 'Completed',
      progressPct: 100,
      actualStart: '2027-03-13',
      actualEnd: '2027-03-13',
    },
    close: {
      status: 'Completed',
      progressPct: 100,
      actualStart: '2027-03-13',
      actualEnd: '2027-03-13',
    },
  },
  '8.2.1': {
    early: {
      status: 'Waiting',
      progressPct: 0,
      actualStart: null,
      actualEnd: null,
    },
    c: {
      status: 'Delayed',
      progressPct: 0,
      actualStart: null,
      actualEnd: null,
    },
    mid: {
      status: 'Delayed',
      progressPct: 25,
      actualStart: '2027-02-25',
      actualEnd: null,
    },
    late: {
      status: 'Completed',
      progressPct: 100,
      actualStart: '2027-02-25',
      actualEnd: '2027-03-20',
    },
    close: {
      status: 'Completed',
      progressPct: 100,
      actualStart: '2027-02-25',
      actualEnd: '2027-03-20',
    },
  },
  '8.2.2': {
    early: {
      status: 'Waiting',
      progressPct: 0,
      actualStart: null,
      actualEnd: null,
    },
    c: {
      // Integrity/storyline: floors waiting behind delayed 8.2.1 at C asOf.
      status: 'Waiting',
      progressPct: 0,
      actualStart: null,
      actualEnd: null,
    },
    mid: {
      status: 'OnSchedule',
      progressPct: 75,
      actualStart: '2027-03-01',
      actualEnd: null,
    },
    late: {
      status: 'Completed',
      progressPct: 100,
      actualStart: '2027-03-01',
      actualEnd: '2027-03-25',
    },
    close: {
      status: 'Completed',
      progressPct: 100,
      actualStart: '2027-03-01',
      actualEnd: '2027-03-25',
    },
  },
  '24.1.1': {
    early: {
      status: 'OnSchedule',
      progressPct: 15,
      actualStart: '2027-02-08',
      actualEnd: null,
    },
    c: {
      status: 'Delayed',
      progressPct: 35,
      actualStart: '2027-02-08',
      actualEnd: null,
    },
    mid: {
      status: 'Delayed',
      progressPct: 55,
      actualStart: '2027-02-08',
      actualEnd: null,
    },
    late: {
      status: 'Completed',
      progressPct: 100,
      actualStart: '2027-02-08',
      actualEnd: '2027-04-01',
    },
    close: {
      status: 'Completed',
      progressPct: 100,
      actualStart: '2027-02-08',
      actualEnd: '2027-04-01',
    },
  },
  '24.1.2': {
    early: {
      status: 'OnSchedule',
      progressPct: 20,
      actualStart: '2027-02-15',
      actualEnd: null,
    },
    c: {
      status: 'OnSchedule',
      progressPct: 50,
      actualStart: '2027-02-15',
      actualEnd: null,
    },
    mid: {
      status: 'OnSchedule',
      progressPct: 80,
      actualStart: '2027-02-15',
      actualEnd: null,
    },
    late: {
      status: 'Completed',
      progressPct: 100,
      actualStart: '2027-02-15',
      actualEnd: '2027-03-28',
    },
    close: {
      status: 'Completed',
      progressPct: 100,
      actualStart: '2027-02-15',
      actualEnd: '2027-03-28',
    },
  },
  '9.3.1': {
    early: {
      status: 'Waiting',
      progressPct: 0,
      actualStart: null,
      actualEnd: null,
    },
    c: {
      status: 'OnSchedule',
      progressPct: 45,
      actualStart: '2027-02-22',
      actualEnd: null,
    },
    mid: {
      status: 'Delayed',
      progressPct: 60,
      actualStart: '2027-02-22',
      actualEnd: null,
    },
    late: {
      status: 'Completed',
      progressPct: 100,
      actualStart: '2027-02-22',
      actualEnd: '2027-05-01',
    },
    close: {
      status: 'Completed',
      progressPct: 100,
      actualStart: '2027-02-22',
      actualEnd: '2027-05-01',
    },
  },
  '9.3.2': {
    early: { status: 'Waiting', progressPct: 0 },
    c: { status: 'Waiting', progressPct: 0 },
    mid: { status: 'Waiting', progressPct: 0 },
    late: {
      status: 'OnSchedule',
      progressPct: 40,
      actualStart: '2027-04-16',
      actualEnd: null,
    },
    close: {
      status: 'Completed',
      progressPct: 100,
      actualStart: '2027-04-16',
      actualEnd: '2027-05-10',
    },
  },
  // Collision synthetic WBS overlays retired (analyst import owns those ids).
};
