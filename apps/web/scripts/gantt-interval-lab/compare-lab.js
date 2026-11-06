/**
 * Isolated comparison track. Not imported by the schedule adapter.
 * Expects window.BaselineOverlay from baseline-overlay.ts (injected by run-compare.mjs).
 * Does not exercise split tasks or render_mode.
 */
const ROW_HEIGHT = 72;
const BAR_HEIGHT = 18;

const GROUP = 'group';
const CHILD = 'child';
const NO_BASELINE = 'no-baseline';
const LINK_SOURCE = 'B-src';
const LINK_TARGET = 'B-base';
const LINK_ID = 'lab-fs';

const catalog = [
  {
    id: GROUP,
    text: 'Группа',
    type: 'project',
    open: true,
    start: '2027-03-04',
    end: '2027-03-18',
  },
  {
    id: CHILD,
    text: 'Работа с базой',
    parent: GROUP,
    type: 'task',
    start: '2027-03-04',
    end: '2027-03-18',
    baselineStart: '2027-02-26',
    baselineEnd: '2027-03-08',
  },
  {
    id: NO_BASELINE,
    text: 'Работа без базы',
    type: 'task',
    start: '2027-03-08',
    end: '2027-03-14',
  },
  {
    id: LINK_SOURCE,
    text: 'B-src',
    type: 'task',
    start: '2027-03-01',
    end: '2027-03-06',
  },
  {
    id: LINK_TARGET,
    text: 'B-base',
    type: 'task',
    start: '2027-03-12',
    end: '2027-03-22',
    baselineStart: '2027-03-10',
    baselineEnd: '2027-03-16',
  },
];

function inclusiveDays(start, end) {
  const a = Date.parse(`${start}T00:00:00Z`);
  const b = Date.parse(`${end}T00:00:00Z`);
  return Math.round((b - a) / 86400000) + 1;
}

function exclusiveIso(inclusive) {
  const [year, month, day] = inclusive.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + 1);
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${date.getUTCFullYear()}-${m}-${d}`;
}

function taskPayload(item) {
  return {
    id: item.id,
    text: item.text,
    parent: item.parent,
    type: item.type,
    open: item.open,
    start_date: item.start,
    duration: inclusiveDays(item.start, item.end),
    color: '#2f6f7a',
  };
}

function rectOf(el) {
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    top: Math.round(rect.top * 10) / 10,
    left: Math.round(rect.left * 10) / 10,
    width: Math.round(rect.width * 10) / 10,
    height: Math.round(rect.height * 10) / 10,
    bottom: Math.round(rect.bottom * 10) / 10,
  };
}

function centerY(rect) {
  if (!rect || rect.height <= 0) return null;
  return rect.top + rect.height / 2;
}

function forecastNode(id) {
  return document.querySelector(`#gantt .gantt_task_line[task_id="${id}"]`);
}

function baselineNode(id) {
  return document.querySelector(`[data-baseline-task="${id}"]`);
}

function visibleIds(gantt) {
  return catalog.filter((item) => gantt.isTaskVisible(item.id)).map((item) => item.id);
}

function taskRows() {
  return [...document.querySelectorAll('#gantt .gantt_task_row')].map((el) => ({
    id: el.getAttribute('task_id'),
    height: Math.round(el.getBoundingClientRect().height * 10) / 10,
  }));
}

function paint(gantt, overlay) {
  const host = gantt.$task_data;
  if (!host) return 0;
  const tasks = [];
  for (const item of catalog) {
    if (!gantt.isTaskVisible(item.id)) continue;
    const task = gantt.getTask(item.id);
    const row = gantt.getTaskPosition(task);
    let left = 0;
    let width = 0;
    if (overlay.shouldPaintBaseline(item.baselineStart, item.baselineEnd)) {
      const interval = gantt.getTaskPosition(
        task,
        gantt.date.parseDate(item.baselineStart, '%Y-%m-%d'),
        gantt.date.parseDate(exclusiveIso(item.baselineEnd), '%Y-%m-%d'),
      );
      left = interval.left;
      width = interval.width;
    }
    tasks.push({
      taskId: item.id,
      forecastTop: row.top,
      barHeight: row.height,
      rowHeight: row.rowHeight,
      baselineStart: item.baselineStart ?? null,
      baselineEnd: item.baselineEnd ?? null,
      left,
      width,
    });
  }
  return {
    painted: overlay.paintBaselineOverlay(host, tasks),
    tasks,
  };
}

function pairMeasure(id) {
  const forecast = rectOf(forecastNode(id));
  const baseline = rectOf(baselineNode(id));
  return {
    id,
    forecast,
    baseline,
    baselineAbove:
      Boolean(forecast && baseline) &&
      baseline.top < forecast.top &&
      baseline.bottom <= forecast.top + 1 &&
      baseline.height > 0 &&
      forecast.height > 0,
    shorter: Boolean(forecast && baseline) && baseline.width + 1 < forecast.width,
    shiftedLeft: Boolean(forecast && baseline) && baseline.left + 1 < forecast.left,
  };
}

function rowAlignment(gantt) {
  const visible = visibleIds(gantt);
  const rows = taskRows();
  const owned = rows.filter((row) => row.id !== 'timeline_placeholder_task');
  return {
    visible,
    visibleCount: visible.length,
    taskRowCount: rows.length,
    ownedRowCount: owned.length,
    ownedIds: owned.map((row) => row.id),
    placeholderCount: rows.filter((row) => row.id === 'timeline_placeholder_task').length,
    matchesVisibleList:
      owned.length === visible.length &&
      owned.every((row, index) => row.id === visible[index]),
  };
}

function arrowMeasure() {
  const link = document.querySelector(`#gantt .gantt_task_link[link_id="${LINK_ID}"]`);
  const arrow = link?.querySelector('.gantt_link_arrow') ?? null;
  const forecast = rectOf(forecastNode(LINK_TARGET));
  const baseline = rectOf(baselineNode(LINK_TARGET));
  const arrowRect = rectOf(arrow);
  const arrowCenter = centerY(arrowRect);
  const forecastCenter = centerY(forecast);
  const baselineCenter = centerY(baseline);
  const yReliable =
    arrowCenter !== null &&
    forecastCenter !== null &&
    baselineCenter !== null &&
    arrowRect.height > 0;
  const distanceToForecast = yReliable ? Math.abs(arrowCenter - forecastCenter) : null;
  const distanceToBaseline = yReliable ? Math.abs(arrowCenter - baselineCenter) : null;
  return {
    arrowExists: Boolean(arrow),
    linkExists: Boolean(link),
    arrowClass: arrow?.className ?? null,
    arrowRect,
    forecast,
    baseline,
    distanceToForecast,
    distanceToBaseline,
    yReliable,
    closerToForecast:
      yReliable && distanceToForecast < distanceToBaseline ? true : yReliable ? false : null,
    linkHtml: link ? link.outerHTML.slice(0, 700) : null,
  };
}

function separationPass(child, rows) {
  const childRow = rows.ownedIds.includes(CHILD)
    ? taskRows().find((row) => row.id === CHILD)
    : null;
  const rowTaller = Boolean(childRow) && childRow.height >= ROW_HEIGHT - 1;
  const barShorter =
    Boolean(child.forecast) &&
    child.forecast.height <= BAR_HEIGHT + 1 &&
    childRow &&
    child.forecast.height < childRow.height - 8;
  return Boolean(child.baselineAbove && rowTaller && barShorter);
}

async function settle() {
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

async function run() {
  const overlay = window.BaselineOverlay;
  if (!overlay?.baselineBox || !overlay.shouldPaintBaseline || !overlay.paintBaselineOverlay) {
    return { error: 'BaselineOverlay module was not injected' };
  }
  const gantt = window.Gantt.getGanttInstance();
  const probe = {
    license: gantt.license,
    version: gantt.version,
    addTaskLayer: typeof gantt.addTaskLayer,
  };
  if (probe.license !== 'mit') {
    return { probe, stopped: true };
  }
  gantt.config.date_format = '%Y-%m-%d';
  gantt.config.duration_unit = 'day';
  gantt.config.readonly = true;
  gantt.config.show_links = true;
  gantt.config.drag_move = false;
  gantt.config.drag_links = false;
  gantt.config.autosize = false;
  gantt.config.fit_tasks = false;
  gantt.config.smart_rendering = false;
  gantt.config.row_height = ROW_HEIGHT;
  gantt.config.bar_height = BAR_HEIGHT;
  gantt.config.min_column_width = 28;
  gantt.config.grid_width = 220;
  gantt.config.scales = [
    { unit: 'month', step: 1, format: '%F %Y' },
    { unit: 'day', step: 1, format: '%j' },
  ];
  gantt.config.start_date = new Date(2027, 1, 18);
  gantt.config.end_date = new Date(2027, 2, 26);
  gantt.i18n.setLocale('ru');
  gantt.init('gantt');
  gantt.parse({
    data: catalog.map(taskPayload),
    links: [{ id: LINK_ID, source: LINK_SOURCE, target: LINK_TARGET, type: '0' }],
  });
  gantt.render();
  const expandedPaint = paint(gantt, overlay);
  await settle();

  const expandedRows = rowAlignment(gantt);
  const child = pairMeasure(CHILD);
  const plain = pairMeasure(NO_BASELINE);
  const target = pairMeasure(LINK_TARGET);
  const link = gantt.getLink(LINK_ID);
  const arrow = arrowMeasure();
  const childBaselineTopBefore = child.baseline?.top ?? null;
  const targetGapBefore =
    target.forecast && target.baseline ? target.forecast.top - target.baseline.top : null;

  gantt.close(GROUP);
  const closedPaint = paint(gantt, overlay);
  await settle();
  const collapsedRows = rowAlignment(gantt);
  const childAfter = pairMeasure(CHILD);
  const targetAfter = pairMeasure(LINK_TARGET);
  const staleChildNode = baselineNode(CHILD);
  const collapsedArrow = arrowMeasure();

  gantt.open(GROUP);
  paint(gantt, overlay);
  await settle();
  const reopened = pairMeasure(CHILD);
  const reopenedRows = rowAlignment(gantt);

  const vertical = separationPass(child, expandedRows);
  const interval =
    child.shorter &&
    child.shiftedLeft &&
    child.baselineAbove;
  const missingBaseline = plain.forecast !== null && plain.baseline === null && !baselineNode(NO_BASELINE);
  const targetGapAfter =
    targetAfter.forecast && targetAfter.baseline
      ? targetAfter.forecast.top - targetAfter.baseline.top
      : null;
  const expandAlignment =
    collapsedRows.visible.includes(LINK_TARGET) &&
    !collapsedRows.visible.includes(CHILD) &&
    childAfter.baseline === null &&
    !staleChildNode &&
    childAfter.forecast === null &&
    targetAfter.baselineAbove &&
    targetGapBefore !== null &&
    targetGapAfter !== null &&
    Math.abs(targetGapBefore - targetGapAfter) <= 1 &&
    reopened.baselineAbove &&
    reopenedRows.visible.includes(CHILD);
  const rowMatch =
    expandedRows.matchesVisibleList &&
    collapsedRows.matchesVisibleList &&
    reopenedRows.matchesVisibleList;
  const endpoints =
    link &&
    String(link.source) === LINK_SOURCE &&
    String(link.target) === LINK_TARGET &&
    String(link.type) === '0';
  const arrowAttached = Boolean(endpoints && arrow.arrowExists);

  return {
    probe,
    config: { rowHeight: ROW_HEIGHT, barHeight: BAR_HEIGHT },
    vertical,
    interval,
    missingBaseline,
    expandAlignment,
    rowMatch,
    arrowAttached,
    arrowY: arrow.yReliable ? (arrow.closerToForecast ? 'pass' : 'fail') : 'not-proven',
    productGate: Boolean(vertical && missingBaseline && expandAlignment),
    expanded: {
      paint: expandedPaint,
      rows: expandedRows,
      child,
      plain,
      target,
      link: link ? { source: link.source, target: link.target, type: link.type } : null,
      arrow,
    },
    collapsed: {
      paint: closedPaint,
      rows: collapsedRows,
      child: childAfter,
      target: targetAfter,
      childBaselineTopBefore,
      targetGapBefore,
      targetGapAfter,
      arrow: collapsedArrow,
    },
    reopened: { child: reopened, rows: reopenedRows },
  };
}

run()
  .then((result) => {
    document.getElementById('report').textContent = JSON.stringify(result, null, 2);
  })
  .catch((error) => {
    document.getElementById('report').textContent = JSON.stringify(
      { error: String(error), stack: error.stack },
      null,
      2,
    );
  });
