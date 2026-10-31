# Tasks

Задачи **только** этапа формализации OpenSpec / синхронизации docs / проверок. Реализация apps, scaffold Next/Nest, API/UI/DB — **вне** этого списка.

## 1. OpenSpec change artifacts

- [x] 1.1 Создать `proposal.md` с Must C-01…C-05, constraints capability и out of scope; verify: файл в change root
- [x] 1.2 Создать delta specs для шести paths из proposal; verify: `specs/*/spec.md` существуют
- [x] 1.3 Создать `design.md` (EQ mechanism deferred; AcceptDateSlip boundary; constraints ≠ feature); verify: файл в change root
- [x] 1.4 Создать `tasks.md` (этот файл) без implementation/scaffold задач; verify: нет checkbox на apps scaffold
- [x] 1.5 Прогнать OpenSpec validate/status для change; verify: validation PASS / artifacts done

## 2. Документация и трассируемость

- [x] 2.1 Обновить [traceability-matrix.md](../../../docs/02-business-analysis/traceability-matrix.md): колонка/секция OpenSpec capability; verify: каждый Must REQ → capability
- [x] 2.2 Синхронизировать C-01 BR mapping в [demo-v1-capabilities.md](../../../docs/03-product/demo-v1-capabilities.md) без изменения текста BR; verify: C-01 ссылается на BR-004/006 согласованно с REQ-PROJ-001
- [x] 2.3 Обновить [docs/04-requirements/README.md](../../../docs/04-requirements/README.md): убрать устаревший «OpenSpec только после human review»; verify: указаны BA-OQ-001 freeze и active change
- [x] 2.4 Добавить handoff `docs/07-delivery/handoffs/2026-10-31-req-openspec.md` и строку в handoffs README; verify: файлы существуют и ссылаются на change
- [x] 2.5 Создать Stage 1 report `docs/07-delivery/reports/2026-10-31-req-openspec-stage1.md` и ссылку в delivery README; verify: map REQ→OpenSpec и open questions присутствуют
- [x] 2.6 Сохранить согласованный plan в `.cursor/plans/` (ссылки, без дублирования ADR); verify: файл plan в workspace plans

## 3. Quality gates

- [x] 3.1 Запустить `npm run test:docs`; verify: exit 0
- [x] 3.2 Semantic checklist: Snapshots A/B/C; Issue≠Risk; delivery≠PS; no CPM/recovery exec/auto-reforecast/RAG engine; AcceptDateSlip без Must SM; BA-OQ still open; EQ mechanism not mandated; verify: отмечено в Stage 1 report
- [x] 3.3 Подтвердить отсутствие `apps/**` и новых ADR в diff; verify: `git status` / tree без apps и без новых ADR файлов

## Workflow follow-up

- Human review OpenSpec change (AI не auto-approve).
- После review: apply delta в living `openspec/specs/` и archive — отдельная волна.
- Implementation / scaffold apps — только после явного старта apply/implementation phase.
