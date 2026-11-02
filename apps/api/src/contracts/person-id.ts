/**
 * Person reference entity ids (DOC-PROD-025 / DOC-BA-018).
 * R2-P1 performs SH→PER fixture cutover; C1 freezes the contract namespace.
 *
 * Compile-time vs runtime:
 * - `PersonId` is a namespace-level template literal (`PER-${string}`) —
 *   a compile-time guard, not a type-level regex.
 * - Exact Demo form is enforced by `PERSON_ID_PATTERN` / `isPersonId` /
 *   `assertPersonId` at runtime and via OpenAPI `pattern`.
 */

/** OpenAPI / docs pattern source (without delimiters). */
export const PERSON_ID_PATTERN_SOURCE = String.raw`^PER-\d{2,}$`;

/** Runtime validator — exact Demo Person id form. */
export const PERSON_ID_PATTERN = /^PER-\d{2,}$/;

/**
 * Namespace-level Person id. Prefer pairing with `isPersonId` /
 * `assertPersonId` when accepting untrusted input.
 */
export type PersonId = `PER-${string}`;

export function isPersonId(value: string): value is PersonId {
  return PERSON_ID_PATTERN.test(value);
}

export function assertPersonId(value: unknown, field = 'personId'): PersonId {
  if (typeof value !== 'string' || !isPersonId(value)) {
    throw new Error(
      `${field} must match ${PERSON_ID_PATTERN_SOURCE} (got ${String(value)})`,
    );
  }
  return value;
}

/** Shared ApiProperty fragment for Person id fields (OpenAPI pattern). */
export const PERSON_ID_API_PROPERTY = {
  type: String,
  example: 'PER-01',
  pattern: PERSON_ID_PATTERN_SOURCE,
  description:
    'Person id (PER-*). Compile-time: PER-${string}; runtime/OpenAPI: ^PER-\\d{2,}$',
} as const;

/** Legacy OwnerRef SH-* → PER-* (single cutover map; no permanent dual-read). */
export const SH_TO_PER: Readonly<Record<string, PersonId>> = {
  'SH-DIR-01': 'PER-01',
  'SH-PM-01': 'PER-02',
  'SH-ENG-01': 'PER-08',
  'SH-PKG-01': 'PER-11',
  'SH-QC-01': 'PER-12',
};

export function mapShToPer(shRole: string): PersonId | undefined {
  return SH_TO_PER[shRole];
}
