export type ScheduleFillTone = 'ok' | 'warn' | 'danger';

/**
 * Map explicit work/equipment status + warning severity to schedule FILL tone.
 * Does not touch status text-contrast tokens.
 */
export function scheduleFillToken(tone: ScheduleFillTone): string {
  if (tone === 'danger') return 'var(--schedule-fill-danger)';
  if (tone === 'warn') return 'var(--schedule-fill-warn)';
  return 'var(--schedule-fill-ok)';
}

export function resolveScheduleFillTone(input: {
  kind: string;
  status?: string | null;
  rag?: string | null;
  warningTone: 'shift' | 'lag' | 'none';
}): ScheduleFillTone {
  if (input.warningTone === 'lag') return 'danger';
  if (input.warningTone === 'shift') return 'warn';

  if (input.kind === 'work') {
    if (input.status === 'Delayed') return 'danger';
    if (input.status === 'Waiting') return 'warn';
    return 'ok';
  }
  if (input.kind === 'equipment_delivery') {
    if (input.status === 'Delayed') return 'danger';
    return 'ok';
  }
  if (input.kind === 'milestone') {
    if (input.rag === 'Red') return 'danger';
    if (input.rag === 'Yellow' || input.rag === 'Amber') return 'warn';
    return 'ok';
  }
  // Groups / unknown: aggregate already folded into warningTone when present.
  return 'ok';
}
