/** Presentation formatting for Demo v1 Russian UI. API dates stay ISO. */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function formatDateRu(isoDate: string): string {
  const m = ISO_DATE.exec(isoDate);
  if (!m) return isoDate;
  return `${m[3]}.${m[2]}.${m[1]}`;
}

export function daysWord(n: number): string {
  const abs = Math.abs(n) % 100;
  const d = abs % 10;
  if (abs > 10 && abs < 20) return 'дней';
  if (d === 1) return 'день';
  if (d >= 2 && d <= 4) return 'дня';
  return 'дней';
}

/** Signed delta for UI, e.g. «+21 день», «без отклонения». */
export function formatDeltaDays(deltaDays: number): string {
  if (deltaDays === 0) return 'без отклонения';
  const sign = deltaDays > 0 ? '+' : '−';
  const n = Math.abs(deltaDays);
  return `${sign}${n} ${daysWord(n)}`;
}
