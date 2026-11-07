import { expect, test, type Page } from '@playwright/test';

/** Full option aria-label = snapshotOptionLabel(id). */
const SNAP_OPTION = {
  A: 'A — 15.02.2027 — Базовый план',
  B: 'B — 28.02.2027 — Локальные отклонения',
  C: 'C — 01.03.2027 — Срыв HVAC / Production Start',
  D: 'D — 20.03.2027 — Каскад готовности',
  F: 'F — 20.04.2027 — Управленческие решения',
} as const;

type NarrativeSnap = keyof typeof SNAP_OPTION;

async function selectSnapshot(page: Page, id: NarrativeSnap) {
  await page.getByRole('button', { name: /Снимок/ }).click();
  await page.getByRole('option', { name: SNAP_OPTION[id] }).click();
  await expect(page.locator('[data-snapshot-trigger]')).toHaveAttribute(
    'aria-label',
    new RegExp(`Снимок ${id}`),
    { timeout: 20_000 },
  );
}

test.describe('Demo v1 narrative readiness (I8)', () => {
  test('A→C→D→F Dashboard honesty + Schedule split + missing entity', async ({
    page,
  }) => {
    await page.goto('/');
    // Explicit A: prior browser sessions may leave another letter in sessionStorage.
    await selectSnapshot(page, 'A');

    // Snapshot A — on track / no recovery wash
    await expect(
      page.getByText('Строительство фармацевтической фабрики (Greenfield)').first(),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('По плану').first()).toBeVisible();
    await expect(
      page.getByText(/Приоритизировать восстановление сроков/),
    ).toHaveCount(0);

    // Snapshot C — needed decision / criticality; no recovery wash
    await selectSnapshot(page, 'C');
    await expect(
      page.getByRole('heading', { name: 'Требуется решение' }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Красный/).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/\+21/).first()).toBeVisible();
    await expect(page.getByText(/06\.10\.2027/).first()).toBeVisible();
    await expect(
      page.getByText(/Критический прогноз сдвига старта производства/),
    ).toBeVisible();
    await expect(
      page.getByText(/восстановлен[ие]* выполнен/i),
    ).toHaveCount(0);
    await expect(page.getByText('PrioritizeRecovery')).toHaveCount(0);

    // Snapshot D — problem focus → project card via UI
    await selectSnapshot(page, 'D');
    await page.getByRole('button', { name: /Строительство/i }).first().click();
    await page.getByRole('link', { name: /Перейти к программе/i }).first().click();
    await page.waitForURL(/\/programs\//, { timeout: 15_000 });
    await page
      .getByRole('link', { name: /Отставание монтажа панелей/i })
      .first()
      .click();
    await page.waitForURL(/focus=AN-08/, { timeout: 15_000 });
    await page
      .getByRole('link', { name: /AN-08 · Внутренняя отделка/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/projects\/AN-08/, { timeout: 15_000 });

    await page.getByRole('link', { name: /^Дашборд$/ }).click();
    await expect(page).toHaveURL(/\/?(?:\?|$)/);
    await expect(page.locator('[data-snapshot-trigger]')).toHaveAttribute(
      'aria-label',
      /Снимок D/,
    );

    // Snapshot F — hard recorded-decision facts
    await selectSnapshot(page, 'F');
    await expect(
      page.getByRole('heading', { name: 'Управленческие решения' }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByText('Решение записано', { exact: true }),
    ).toHaveCount(3);
    await expect(page.getByText(/Соколов/).first()).toBeVisible();
    await expect(page.getByText(/06\.10\.2027/).first()).toBeVisible();
    await expect(page.getByText(/\+21/).first()).toBeVisible();

    // Schedule split is the default presentation
    await page
      .getByRole('navigation', { name: 'Разделы' })
      .getByRole('link', { name: 'Календарный план' })
      .click();
    await expect(
      page.getByRole('button', { name: 'Разделение' }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole('button', { name: 'Разделение' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('Оборудование').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Таблица' })).toBeEnabled();
    await expect(
      page.getByRole('button', { name: 'Временная шкала' }),
    ).toBeEnabled();

    // Missing entity EmptyState
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
