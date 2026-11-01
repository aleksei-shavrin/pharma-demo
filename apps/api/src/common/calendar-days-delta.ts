/**
 * Calendar-day difference forecast − baseline (UTC date parts).
 * Used for BR-004 derived impact presentation — not a scheduling engine.
 */
export function calendarDaysDelta(
  baselineIsoDate: string,
  forecastIsoDate: string,
): number {
  const b = parseUtcDateOnly(baselineIsoDate);
  const f = parseUtcDateOnly(forecastIsoDate);
  const ms = f.getTime() - b.getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

function parseUtcDateOnly(iso: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) {
    throw new Error(`Invalid ISO date: ${iso}`);
  }
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
}
