/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  PeopleFocusPanel,
  presentReasonText,
  resolvePeopleFocusCardState,
} from './people-focus-panel';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import type { DashboardOverview, PersonId } from '@/lib/api-client';

afterEach(() => cleanup());

function withPeopleFocus(
  overrides: Partial<DashboardOverview['peopleFocus']>,
  snapshotId: DashboardOverview['snapshotId'] = '03',
): DashboardOverview {
  const base = dashboardOverviewFixture(snapshotId);
  return {
    ...base,
    peopleFocus: {
      ...base.peopleFocus,
      ...overrides,
    },
  };
}

function personRow(
  partial: Partial<DashboardOverview['peopleFocus']['people'][number]> & {
    personId: PersonId;
    fullNameRu: string;
  },
): DashboardOverview['peopleFocus']['people'][number] {
  return {
    roleTitleRu: 'Инженер',
    primaryWorkstreamId: 'WS-HVAC',
    criticalIncidentCount: 0,
    otherActiveIssueCount: 0,
    hasNewCritical: false,
    incidentGrowth: 0,
    criticalSignalsRemoved: 0,
    reasons: [],
    criticalIncidentKeys: [],
    activeIssueIds: [],
    delayedCriticalEquipmentIds: [],
    ...partial,
  };
}

describe('resolvePeopleFocusCardState', () => {
  it('maps quiet / attention / active without impossible critical=0∧new', () => {
    expect(
      resolvePeopleFocusCardState({
        totalPeopleInFocus: 0,
        summary: { criticalQuestionCount: 0 },
      }),
    ).toBe('quiet');
    expect(
      resolvePeopleFocusCardState({
        totalPeopleInFocus: 3,
        summary: { criticalQuestionCount: 2 },
      }),
    ).toBe('attention');
    expect(
      resolvePeopleFocusCardState({
        totalPeopleInFocus: 2,
        summary: { criticalQuestionCount: 0 },
      }),
    ).toBe('active');
  });
});

describe('presentReasonText', () => {
  it('shortens redundant critical phrasing when badge present', () => {
    expect(
      presentReasonText('Критичный вопрос по поставке', true),
    ).toBe('По поставке');
    expect(
      presentReasonText('Критичный вопрос по поставке', false),
    ).toBe('Критичный вопрос по поставке');
  });
});

describe('PeopleFocusPanel visual states', () => {
  it('quiet 01: ok state, no removed history, no danger metric tint', () => {
    render(<PeopleFocusPanel data={dashboardOverviewFixture('01')} />);
    expect(
      document.querySelector('[data-people-focus-state="quiet"]'),
    ).toBeTruthy();
    expect(screen.getByText(/Без активных вопросов/i)).toBeInTheDocument();
    expect(screen.queryByText(/Снято критичных/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Требует внимания/i)).not.toBeInTheDocument();
  });

  it('quiet 19: removed green + quiet state; unassigned amber if present', () => {
    render(
      <PeopleFocusPanel
        data={withPeopleFocus(
          {
            previousSnapshotId: '18',
            summary: {
              peopleWithQuestions: 0,
              criticalQuestionCount: 0,
              newCriticalQuestionCount: 0,
              removedCriticalSignalCount: 1,
              otherActiveIssueCount: 0,
            },
            people: [],
            totalPeopleInFocus: 0,
            unassignedDelayedCriticalEquipmentIds: ['EQ-HVAC-01'],
          },
          '19',
        )}
      />,
    );
    expect(
      document.querySelector('[data-people-focus-state="quiet"]'),
    ).toBeTruthy();
    expect(screen.getByText(/Снято критичных сигналов: 1/)).toBeInTheDocument();
    const unassigned = document.querySelector(
      '[data-people-focus="unassigned-eq"]',
    );
    expect(unassigned).toBeTruthy();
    expect(unassigned?.className).toMatch(/status-warn/);
  });

  it('attention + new>0: danger critical cell, warn new cell, row badges', () => {
    render(
      <PeopleFocusPanel
        data={withPeopleFocus({
          previousSnapshotId: '04',
          summary: {
            peopleWithQuestions: 2,
            criticalQuestionCount: 3,
            newCriticalQuestionCount: 2,
            removedCriticalSignalCount: 0,
            otherActiveIssueCount: 1,
          },
          people: [
            personRow({
              personId: 'PER-02',
              fullNameRu: 'Морозова Елена Сергеевна',
              criticalIncidentCount: 2,
              hasNewCritical: true,
              otherActiveIssueCount: 0,
              reasons: [
                {
                  text: 'Новый критичный вопрос по поставке',
                  links: [
                    { type: 'issue', id: 'ISS-001' },
                    { type: 'equipment', id: 'EQ-HVAC-01' },
                  ],
                },
              ],
              criticalIncidentKeys: ['eq:EQ-HVAC-01'],
            }),
            personRow({
              personId: 'PER-08',
              fullNameRu: 'Смирнов',
              otherActiveIssueCount: 1,
              reasons: [
                {
                  text: 'Активные проблемы (1)',
                  links: [{ type: 'issue', id: 'ISS-X' }],
                },
              ],
            }),
          ],
          totalPeopleInFocus: 2,
        })}
      />,
    );

    expect(
      document.querySelector('[data-people-focus-state="attention"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-people-focus-state="new"]'),
    ).toBeTruthy();
    expect(
      document.querySelector(
        '[data-people-focus-stat-tone="danger"]',
      ),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-people-focus-stat-tone="warn"]'),
    ).toBeTruthy();
    expect(screen.getByText('2 критичных')).toBeInTheDocument();
    expect(screen.getByText('Новый сигнал')).toBeInTheDocument();
    expect(screen.getByText(/Новый вопрос по поставке/)).toBeInTheDocument();
    expect(screen.queryByText(/Новый критичный вопрос по поставке/)).toBeNull();
  });

  it('critical=0 people>0 → active state; new=0 metric stays neutral', () => {
    render(
      <PeopleFocusPanel
        data={withPeopleFocus({
          previousSnapshotId: '05',
          summary: {
            peopleWithQuestions: 2,
            criticalQuestionCount: 0,
            newCriticalQuestionCount: 0,
            removedCriticalSignalCount: 0,
            otherActiveIssueCount: 3,
          },
          people: [
            personRow({
              personId: 'PER-01',
              fullNameRu: 'Активный',
              otherActiveIssueCount: 2,
              reasons: [
                {
                  text: 'Активные проблемы (2)',
                  links: [{ type: 'issue', id: 'ISS-A' }],
                },
              ],
            }),
          ],
          totalPeopleInFocus: 1,
        })}
      />,
    );
    expect(
      document.querySelector('[data-people-focus-state="active"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-people-focus-stat="Критичных вопросов"]'),
    ).toHaveAttribute('data-people-focus-stat-tone', 'neutral');
    expect(
      document.querySelector('[data-people-focus-stat="Новых критичных"]'),
    ).toHaveAttribute('data-people-focus-stat-tone', 'neutral');
    expect(screen.getByText('2 прочих')).toBeInTheDocument();
  });

  it('renders all 8 people in DOM; no show-more; no left accent; critical-first summary', () => {
    const people = Array.from({ length: 8 }, (_, i) =>
      personRow({
        personId: `PER-${String(i + 1).padStart(2, '0')}` as PersonId,
        fullNameRu: `Участник ${i + 1}`,
        criticalIncidentCount: i < 3 ? 1 : 0,
        otherActiveIssueCount: i >= 3 ? 1 : 0,
        hasNewCritical: i === 0,
        reasons: [
          {
            text: i < 3 ? 'Критичный вопрос по поставке' : 'Активные проблемы (1)',
            links: [{ type: 'issue', id: `ISS-${i}` }],
          },
        ],
      }),
    );
    const { container } = render(
      <PeopleFocusPanel
        data={withPeopleFocus({
          previousSnapshotId: '04',
          summary: {
            peopleWithQuestions: 8,
            criticalQuestionCount: 3,
            newCriticalQuestionCount: 1,
            removedCriticalSignalCount: 0,
            otherActiveIssueCount: 5,
          },
          people,
          totalPeopleInFocus: 8,
        })}
      />,
    );
    const card = container.querySelector(
      '[data-dashboard-block="people-focus"]',
    );
    expect(card?.className).toMatch(/max-h-\[32rem\]/);
    expect(document.querySelectorAll('[data-people-focus-person]')).toHaveLength(
      8,
    );
    expect(screen.queryByRole('button', { name: /Показать ещё/i })).toBeNull();
    expect(screen.getByText(/Показано 8 из 8/)).toBeInTheDocument();
    expect(
      document.querySelector('[data-people-focus-summary-order="critical-new-people"]'),
    ).toBeTruthy();
    const summary = document.querySelector('[data-people-focus="summary"]');
    const stats = [...(summary?.children ?? [])].map((el) =>
      el.getAttribute('data-people-focus-stat'),
    );
    expect(stats).toEqual([
      'Критичных вопросов',
      'Новых критичных',
      'Ответственных с вопросами',
    ]);
    for (const row of document.querySelectorAll('[data-people-focus-person]')) {
      expect(row.className).not.toMatch(/border-l-/);
    }
    expect(document.body.textContent ?? '').not.toMatch(
      /score|algorithm|normalization|fixture|demo|synthetic/i,
    );
  });

  it('dedup MetricAbbrTip remains on critical count', () => {
    render(
      <PeopleFocusPanel
        data={withPeopleFocus({
          previousSnapshotId: '02',
          summary: {
            peopleWithQuestions: 1,
            criticalQuestionCount: 2,
            newCriticalQuestionCount: 0,
            removedCriticalSignalCount: 0,
            otherActiveIssueCount: 0,
          },
          people: [
            personRow({
              personId: 'PER-02',
              fullNameRu: 'X',
              criticalIncidentCount: 1,
              reasons: [
                {
                  text: 'Критичный вопрос по поставке',
                  links: [{ type: 'issue', id: 'ISS-001' }],
                },
              ],
            }),
          ],
          totalPeopleInFocus: 1,
        })}
      />,
    );
    expect(
      screen.getByRole('button', {
        name: /Уникальные вопросы; один может затрагивать нескольких/i,
      }),
    ).toBeInTheDocument();
  });
});
