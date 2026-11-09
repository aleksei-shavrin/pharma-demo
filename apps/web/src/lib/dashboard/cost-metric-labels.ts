/** Director-facing cost acronym glosses (DOC-PROD cost-control). */

export type CostMetricId = 'EAC' | 'VAC' | 'BAC' | 'reserve';

export const COST_METRIC_GLOSS: Record<
  CostMetricId,
  { short: string; ru: string; en?: string }
> = {
  EAC: {
    short: 'EAC',
    ru: 'Прогноз стоимости по завершении',
    en: 'Estimate at Completion',
  },
  VAC: {
    short: 'VAC',
    ru: 'Отклонение прогноза от утверждённого бюджета (BAC − EAC)',
    en: 'Variance at Completion',
  },
  BAC: {
    short: 'BAC',
    ru: 'Утверждённый бюджет (базовый план стоимости)',
    en: 'Budget at Completion',
  },
  reserve: {
    short: 'Резерв',
    ru: 'Остаток резерва (contingency) внутри утверждённого бюджета',
  },
};

export function costMetricTipText(id: CostMetricId): string {
  const g = COST_METRIC_GLOSS[id];
  return g.en ? `${g.ru} (${g.en})` : g.ru;
}
