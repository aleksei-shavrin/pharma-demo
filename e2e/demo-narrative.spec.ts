import { expect, test, type Page } from '@playwright/test';

async function selectSnapshot(page: Page, id: 'A' | 'B' | 'C') {
  // Accessible name becomes "Снимок X, активный" when selected — use prefix match.
  const radio = page.getByRole('radio', { name: new RegExp(`Снимок ${id}`) });
  await radio.click();
  await expect(radio).toHaveAttribute('aria-checked', 'true', {
    timeout: 15_000,
  });
}

test.describe('Demo v1 narrative readiness (I8)', () => {
  test('A→B→C Dashboard honesty + Schedule table + missing entity', async ({
    page,
  }) => {
    await page.goto('/');

    // Snapshot A — on track (success heading is project name)
    await expect(
      page.getByRole('heading', {
        name: 'Строительство фармацевтической фабрики (Greenfield)',
      }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('По плану').first()).toBeVisible();
    await expect(
      page.getByText(/Приоритизировать восстановление сроков/),
    ).toHaveCount(0);

    // Snapshot B — delay / exceptions appear
    await selectSnapshot(page, 'B');
    await expect(page.getByText('Задержка').first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/Риск:\s*красный/).first()).toBeVisible();
    await expect(page.getByText(/\+21/).first()).toBeVisible();

    // Snapshot C — Decision present; Risk/Milestone remain Red; no recovery wash
    await selectSnapshot(page, 'C');
    await expect(
      page.getByText(/Приоритизировать восстановление сроков/).first(),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Риск:\s*красный/).first()).toBeVisible();
    await expect(
      page.getByText(/восстановлен[ие]* выполнен/i),
    ).toHaveCount(0);
    await expect(page.getByText('PrioritizeRecovery')).toHaveCount(0);

    // Schedule table primary path
    await page.getByRole('link', { name: 'Календарный план' }).click();
    await expect(page.getByRole('button', { name: 'Таблица' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('button', { name: 'Таблица' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByText('Оборудование').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Разделение' })).toBeEnabled();
    await expect(
      page.getByRole('button', { name: 'Временная шкала' }),
    ).toBeEnabled();

    // Missing entity EmptyState (same route)
    await page.goto('/issues/ISS-DOES-NOT-EXIST');
    await expect(
      page.getByText(/Проблема отсутствует в снимке/),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('Issues & Risks unified register + Type (BA-OQ-006)', async ({
    page,
  }) => {
    await page.goto('/issues-risks');
    await expect(
      page.getByRole('heading', { name: 'Проблемы и риски' }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('columnheader', { name: 'Тип' })).toBeVisible();
    await selectSnapshot(page, 'B');
    await expect(
      page.getByText('Проблема', { exact: true }).first(),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Риск', { exact: true }).first()).toBeVisible();
  });
});
