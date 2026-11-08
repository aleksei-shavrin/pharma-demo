/**
 * Human role copy for Participants UI.
 * Strips internal fixture/leak markers without rewriting API IDs.
 */
export function presentRoleTitleRu(raw: string | null | undefined): string {
  if (!raw) return '';
  return raw
    .replace(/\s*\(legacy tag\)\s*/gi, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
