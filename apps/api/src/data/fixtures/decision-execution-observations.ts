/**
 * Illustrative Demo v1 decision-execution observations.
 * certainty: assumption — authored demo scenario, not GMP evidence / discovered facts.
 */
import type { SnapshotId } from '../../snapshot/snapshot-id';
import type { DecisionId } from './catalog';

export type DecisionExecutionStatusValue =
  'not_started' | 'in_progress' | 'completed';

export type DecisionExecutionObservationFixture = {
  id: string;
  decisionId: DecisionId;
  status: DecisionExecutionStatusValue;
  /** Observation calendar date — must be ≤ scenarioAsOf when visible. */
  asOfDate: string;
  /** First SnapshotId where this observation may appear. */
  effectiveFromSnapshot: SnapshotId;
  source: {
    kind: 'demo';
    label: string;
  };
  evidenceNote: string;
  updatedAt: string;
};

const DEMO_SOURCE = {
  kind: 'demo' as const,
  label: 'Демонстрационный отчёт исполнителя',
};

/**
 * Only DEC-001 has authored observations. All other decisions stay unknown.
 * Arc: F not_started → G in_progress → O completed (I remains in_progress).
 */
export const DECISION_EXECUTION_OBSERVATIONS: readonly DecisionExecutionObservationFixture[] =
  [
    {
      id: 'DEXO-001-F',
      decisionId: 'DEC-001',
      status: 'not_started',
      asOfDate: '2027-04-20',
      effectiveFromSnapshot: '06',
      source: DEMO_SOURCE,
      evidenceNote: 'Действия не начаты',
      updatedAt: '2027-04-20',
    },
    {
      id: 'DEXO-001-G',
      decisionId: 'DEC-001',
      status: 'in_progress',
      asOfDate: '2027-05-15',
      effectiveFromSnapshot: '07',
      source: DEMO_SOURCE,
      evidenceNote: 'Действия начаты',
      updatedAt: '2027-05-15',
    },
    {
      id: 'DEXO-001-O',
      decisionId: 'DEC-001',
      status: 'completed',
      asOfDate: '2027-09-01',
      effectiveFromSnapshot: '15',
      source: DEMO_SOURCE,
      evidenceNote: 'Действия закрыты',
      updatedAt: '2027-09-01',
    },
  ];
