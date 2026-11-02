import { screen, waitFor, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { expect } from 'vitest';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { snapshotOptionLabel } from '@/lib/snapshot/snapshot-meta';

/** Open compact A–H disclosure and choose a snapshot (E7 listbox pattern). */
export async function selectDemoSnapshot(
  user: UserEvent,
  id: SnapshotId,
): Promise<void> {
  const trigger = screen.getByRole('button', { name: /Снимок/ });
  if (trigger.getAttribute('aria-expanded') !== 'true') {
    await user.click(trigger);
  }
  const list = await screen.findByRole('listbox', { name: 'Демо-снимок' });
  await user.click(
    within(list).getByRole('option', { name: snapshotOptionLabel(id) }),
  );
  await waitFor(() => {
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
}

/** Assert committed/active snapshot on the compact trigger. */
export async function expectActiveSnapshot(id: SnapshotId): Promise<void> {
  await waitFor(() => {
    expect(
      screen.getByRole('button', {
        name: new RegExp(`Снимок ${id}.*активный`),
      }),
    ).toBeInTheDocument();
  });
}
