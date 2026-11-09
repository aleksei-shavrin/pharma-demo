import type { ScheduleItem } from '@/lib/api-client';
import { hrefForUiRouteRef } from '@/lib/entity-routes';
import type { ScheduleComparisonMode } from './schedule-comparison';
import type { ScheduleChartPopoverModel } from '@/components/schedule/schedule-chart-popover';

function formatIsoRu(iso: string | null | undefined): string | null {
  if (!iso || typeof iso !== 'string' || iso.length < 10) return null;
  const [y, m, d] = iso.slice(0, 10).split('-');
  if (!y || !m || !d) return null;
  if (Number.isNaN(Number(y)) || Number.isNaN(Number(m)) || Number.isNaN(Number(d))) {
    return null;
  }
  return `${d}.${m}.${y}`;
}

function pushDate(
  lines: { label: string; value: string }[],
  label: string,
  iso: string | null | undefined,
) {
  const v = formatIsoRu(iso);
  if (v) lines.push({ label, value: v });
}

export type ScheduleChartPopoverDateHints = {
  /** Inclusive group/summary bounds from presentation (not leaf assumption). */
  startIso?: string | null;
  endIso?: string | null;
};

/**
 * Build popover content from an API schedule item + comparison mode.
 * Nullable fields stay omitted — no fake 0 / Invalid Date.
 */
export function buildScheduleChartPopoverModel(
  item: ScheduleItem,
  comparison: ScheduleComparisonMode,
  hints?: ScheduleChartPopoverDateHints,
): ScheduleChartPopoverModel {
  const dateLines: { label: string; value: string }[] = [];
  let kindLabel: string | null = null;
  let statusLabel: string | null = null;
  let progressLabel: string | null = null;
  let href: string | null = null;
  let subtitle: string | null = item.id;

  if (item.kind === 'work') {
    kindLabel = 'Работа';
    statusLabel =
      item.status === 'Delayed'
        ? 'Статус: с задержкой'
        : item.status === 'Completed'
          ? 'Статус: завершено'
          : item.status === 'Waiting'
            ? 'Статус: ожидание'
            : 'Статус: по плану';
    if (typeof item.progressPct === 'number' && Number.isFinite(item.progressPct)) {
      progressLabel = `Прогресс ${Math.round(item.progressPct)}%`;
    }
    if (item.wbs && String(item.wbs) !== item.id) {
      subtitle = `${item.wbs} · ${item.id}`;
    }
    if (comparison === 'baseline') {
      pushDate(dateLines, 'База · начало', item.baselineStart);
      pushDate(dateLines, 'База · окончание', item.baselineEnd);
    } else if (comparison === 'actual') {
      pushDate(dateLines, 'Факт · начало', item.actualStart);
      pushDate(dateLines, 'Факт · окончание', item.actualEnd);
      pushDate(dateLines, 'Прогноз · начало', item.startDate);
      pushDate(dateLines, 'Прогноз · окончание', item.endDate);
    } else {
      pushDate(dateLines, 'Прогноз · начало', item.startDate);
      pushDate(dateLines, 'Прогноз · окончание', item.endDate);
      pushDate(dateLines, 'База · начало', item.baselineStart);
      pushDate(dateLines, 'База · окончание', item.baselineEnd);
    }
  } else if (item.kind === 'milestone') {
    kindLabel =
      item.sourceKind === 'controlpoint' || item.id.startsWith('KT-')
        ? 'Контрольная точка'
        : 'Веха';
    statusLabel =
      item.rag === 'Red' ? 'RAG: красный' : item.rag === 'Green' ? 'RAG: зелёный' : null;
    if (item.wbs) subtitle = `${item.wbs} · ${item.id}`;
    if (comparison === 'baseline') {
      pushDate(dateLines, 'База', item.baselineDate);
    } else {
      pushDate(dateLines, 'Прогноз', item.forecastDate);
      pushDate(dateLines, 'База', item.baselineDate);
    }
    href = hrefForUiRouteRef('milestone', item.id);
  } else if (item.kind === 'equipment_delivery') {
    kindLabel = 'Поставка оборудования';
    statusLabel =
      item.status === 'Delayed' ? 'Статус: задержка' : 'Статус: в срок';
    if (comparison === 'baseline') {
      pushDate(dateLines, 'База', item.baselineDate);
    } else {
      pushDate(dateLines, 'Прогноз', item.forecastDate);
      pushDate(dateLines, 'База', item.baselineDate);
    }
    href = hrefForUiRouteRef('equipment', item.id);
  } else if (item.kind === 'project_group' || item.kind === 'stage_group') {
    kindLabel = item.kind === 'project_group' ? 'Проект' : 'Этап';
    if (item.wbs) subtitle = String(item.wbs);
    if (typeof item.progressPct === 'number' && Number.isFinite(item.progressPct)) {
      progressLabel = `Прогресс ${Math.round(item.progressPct)}%`;
    }
    const label =
      comparison === 'baseline'
        ? 'База'
        : comparison === 'actual'
          ? 'Факт / горизонт'
          : 'Прогноз';
    pushDate(dateLines, `${label} · начало`, hints?.startIso);
    pushDate(dateLines, `${label} · окончание`, hints?.endIso);
  }

  return {
    title: item.name?.trim() || item.id,
    subtitle,
    kindLabel,
    statusLabel,
    progressLabel,
    dateLines,
    href,
    hrefLabel: href ? 'Открыть' : undefined,
  };
}
