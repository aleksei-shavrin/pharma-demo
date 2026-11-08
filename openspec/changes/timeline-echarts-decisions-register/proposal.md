# Proposal: timeline-echarts-decisions-register

## Why

Шкала вех на дашборде должна быть одной читаемой карточкой с постоянными подписями. Эксперимент 1/2/3 закрыт явным запросом 2026-11-08: оставить только Apache ECharts. «Управленческие решения» — отдельный register в sidebar.

## What Changes

1. **Portfolio timeline = ECharts only:** постоянные phase / program names / filters/189 / month ticks / snapshot date / PS dates+Δ / key shortLabels + tooltip; **удалены** toggle 1/2/3, custom strip, vis-timeline renderer и deps `vis-timeline`/`vis-data` при отсутствии usage.
2. **Decisions register:** `GET /v1/projects/:id/decisions`, page `/decisions`, NAV + crumb, ссылка с dashboard Decision panel (уже сделано; страница вне scope этой волны удаления).

## Capabilities

### Modified Capabilities

- `management-exception-report`: Decision read-model register (list).
- `project-status-overview`: executive timeline presentation = Apache ECharts only.

## Impact

- `apps/web` dashboard timeline
- UX docs / OpenSpec change
- Out of scope this wave: Decision detail, new npm packages, decisions page edits
