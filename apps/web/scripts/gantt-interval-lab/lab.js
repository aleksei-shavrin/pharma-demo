/**
 * Isolated Community check. Not imported by the app and not a product route.
 * Open via a static server rooted at apps/web so /node_modules resolves.
 */
const SHORT = {
  parent: 'short',
  forecast: 'short-forecast',
  baseline: 'short-baseline',
};
const LONG = {
  parent: 'long',
  forecast: 'long-forecast',
  baseline: 'long-baseline',
  actual: 'long-actual',
};

function child(id, parent, role, start, duration) {
  return {
    id,
    text: role,
    parent,
    start_date: start,
    duration,
    type: 'task',
    split_placement: 'inline',
    color: role === 'forecast' ? '#2f6f7a' : role === 'baseline' ? '#8a8175' : '#a33b32',
  };
}

function splitData() {
  return {
    data: [
      { id: SHORT.parent, text: 'Короткая', render: 'split', type: 'project', open: false },
      child(SHORT.forecast, SHORT.parent, 'forecast', '2027-03-02', 1),
      child(SHORT.baseline, SHORT.parent, 'baseline', '2027-02-26', 1),
      { id: LONG.parent, text: 'Длинная', render: 'split', type: 'project', open: false },
      child(LONG.forecast, LONG.parent, 'forecast', '2027-03-01', 10),
      child(LONG.baseline, LONG.parent, 'baseline', '2027-02-20', 8),
      child(LONG.actual, LONG.parent, 'actual', '2027-03-05', 6),
    ],
    links: [],
  };
}

function overlayData() {
  return {
    data: [
      {
        id: SHORT.forecast,
        text: 'Короткая прогноз',
        start_date: '2027-03-02',
        duration: 1,
        type: 'task',
        color: '#2f6f7a',
      },
      {
        id: LONG.forecast,
        text: 'Длинная прогноз',
        start_date: '2027-03-01',
        duration: 10,
        type: 'task',
        color: '#2f6f7a',
      },
    ],
    links: [{ id: 'fs', source: SHORT.forecast, target: LONG.forecast, type: '0' }],
  };
}

const overlayIntervals = [
  { id: SHORT.baseline, row: SHORT.forecast, start: '2027-02-26', end: '2027-02-27', role: 'baseline' },
  { id: LONG.baseline, row: LONG.forecast, start: '2027-02-20', end: '2027-02-28', role: 'baseline' },
  { id: LONG.actual, row: LONG.forecast, start: '2027-03-05', end: '2027-03-11', role: 'actual' },
];

function bars(gantt) {
  return [...document.querySelectorAll('.gantt_task_line')].map((el) => {
    const rect = el.getBoundingClientRect();
    const id = el.getAttribute('task_id');
    return {
      id,
      text: id ? gantt.getTask(id).text : null,
      left: Math.round(rect.left),
      width: Math.round(rect.width),
      top: Math.round(rect.top),
    };
  });
}

function linkGeometry(gantt) {
  const links = [...document.querySelectorAll('.gantt_task_link')].map((el) => {
    const rect = el.getBoundingClientRect();
    return {
      id: el.getAttribute('link_id'),
      left: Math.round(rect.left),
      top: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };
  });
  let endpoints = null;
  try {
    const link = gantt.getLink('fs');
    endpoints = link ? { source: link.source, target: link.target, type: link.type } : null;
  } catch {
    endpoints = null;
  }
  return { count: links.length, links, endpoints };
}

function rowGroups(items) {
  const groups = new Map();
  for (const bar of items) {
    const key = String(bar.top);
    groups.set(key, (groups.get(key) ?? 0) + 1);
  }
  return [...groups.entries()].map(([top, count]) => ({ top: Number(top), count }));
}

function missingActualHidden(items) {
  return !items.some((bar) => bar.id === SHORT.actual || bar.text === 'actual' && bar.id?.startsWith('short'));
}

function paintOverlay(gantt) {
  const host = gantt.$task_data;
  if (!host) return 0;
  let layer = host.querySelector('[data-lab-overlay]');
  if (!layer) {
    layer = document.createElement('div');
    layer.setAttribute('data-lab-overlay', 'true');
    layer.style.position = 'absolute';
    layer.style.inset = '0';
    layer.style.pointerEvents = 'none';
    host.appendChild(layer);
  }
  layer.replaceChildren();
  let painted = 0;
  for (const interval of overlayIntervals) {
    const row = gantt.getTask(interval.row);
    const pos = gantt.getTaskPosition(
      row,
      gantt.date.parseDate(interval.start, '%Y-%m-%d'),
      gantt.date.parseDate(interval.end, '%Y-%m-%d'),
    );
    const el = document.createElement('div');
    el.setAttribute('data-lab-bar', interval.id);
    el.style.position = 'absolute';
    el.style.left = `${pos.left}px`;
    el.style.top = `${pos.top + (interval.role === 'baseline' ? 4 : 18)}px`;
    el.style.width = `${Math.max(pos.width, 2)}px`;
    el.style.height = '8px';
    el.style.background = interval.role === 'baseline' ? '#8a8175' : '#a33b32';
    layer.appendChild(el);
    painted += 1;
  }
  return painted;
}

function themeSample() {
  const line = document.querySelector('.gantt_task_line');
  const body = getComputedStyle(document.body);
  return {
    theme: document.documentElement.getAttribute('data-theme'),
    body: body.backgroundColor,
    barWidth: line ? Math.round(line.getBoundingClientRect().width) : 0,
  };
}

function renderSplit(gantt) {
  gantt.clearAll();
  gantt.config.open_split_tasks = true;
  gantt.parse(splitData());
  gantt.render();
}

function renderOverlay(gantt) {
  gantt.clearAll();
  gantt.config.open_split_tasks = false;
  gantt.parse(overlayData());
  gantt.render();
  return paintOverlay(gantt);
}

function run() {
  const root = window.Gantt;
  const gantt = root.getGanttInstance();
  const probe = {
    license: gantt.license,
    addTaskLayer: typeof gantt.addTaskLayer,
  };
  if (probe.license !== 'mit' || probe.addTaskLayer === 'function') {
    return { probe, stopped: true };
  }
  gantt.config.date_format = '%Y-%m-%d';
  gantt.config.readonly = true;
  gantt.config.show_links = true;
  gantt.config.drag_move = false;
  gantt.config.autosize = false;
  gantt.i18n.setLocale('ru');
  gantt.init('gantt');
  gantt.config.start_date = new Date(2027, 1, 15);
  gantt.config.end_date = new Date(2027, 2, 25);
  renderSplit(gantt);
  const splitBars = bars(gantt);
  const splitRows = rowGroups(splitBars);
  const splitHasTwoOnOneRow = splitRows.some((row) => row.count >= 2);
  let splitLinkError = null;
  try {
    gantt.addLink({ id: 'fs', source: SHORT.forecast, target: LONG.forecast, type: '0' });
    gantt.render();
  } catch (error) {
    splitLinkError = String(error);
  }
  let mode = 'split';
  let overlayPainted = 0;
  if (!splitHasTwoOnOneRow || splitLinkError) {
    try {
      gantt.clearAll();
    } catch {
      /* split link render can leave the instance mid-draw */
    }
    overlayPainted = renderOverlay(gantt);
    mode = 'overlay';
  }
  const shown = bars(gantt);
  const overlayNodes = [...document.querySelectorAll('[data-lab-bar]')].map((el) => {
    const rect = el.getBoundingClientRect();
    return { id: el.getAttribute('data-lab-bar'), left: Math.round(rect.left), width: Math.round(rect.width), top: Math.round(rect.top) };
  });
  document.documentElement.setAttribute('data-theme', 'light');
  gantt.render();
  if (mode === 'overlay') paintOverlay(gantt);
  const light = themeSample();
  document.documentElement.setAttribute('data-theme', 'dark');
  gantt.render();
  if (mode === 'overlay') paintOverlay(gantt);
  const dark = themeSample();
  return {
    probe,
    mode,
    splitBars,
    splitRows,
    splitHasTwoOnOneRow,
    splitLinkError,
    overlayPainted,
    shown,
    shownRows: rowGroups(shown),
    overlayNodes,
    shortHasNoActualBar: !shown.some((bar) => String(bar.id).includes('short') && String(bar.text) === 'actual') && !overlayNodes.some((node) => node.id === 'short-actual'),
    link: linkGeometry(gantt),
    light,
    dark,
    ownLogic: mode === 'split' ? 'parse render split and inline placement' : 'forecast tasks plus positioned overlay nodes',
  };
}

try {
  document.getElementById('report').textContent = JSON.stringify(run(), null, 2);
} catch (error) {
  document.getElementById('report').textContent = JSON.stringify(
    { error: String(error), stack: error.stack },
    null,
    2,
  );
}
