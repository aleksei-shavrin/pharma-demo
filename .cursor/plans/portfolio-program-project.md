# Портфель → программа → проект

Статус: S0 согласован 2026-11-06. Сборка B01–B03, B07–B09, D01–D07, E01 и E03 прошла приёмку. E02 открыт до репетиции с другим участником.

Объём: B01–B03, B07–B09, D01–D07, E01–E03. Вне объёма: E04–E05, F07, полный WBS, критический путь.

## Контракт

Не дублируется здесь. Источники:

- Change: [openspec/changes/portfolio-program-project/](../../openspec/changes/portfolio-program-project/)
- [ADR-0006](../../docs/06-architecture/decisions/0006-portfolio-program-project-read-model.md)
- [UX дашборда](../../docs/05-ux-ui/demo-v1-dashboard.md)
- [UX навигации](../../docs/05-ux-ui/demo-v1-shell-navigation.md)
- [Narrative](../../docs/03-product/demo-v1-mock-narrative-data.md)
- [Walkthrough E01–E03](../../docs/03-product/demo-v1-acceptance-walkthrough.md)

## Владельцы после review

| Трек | Общие файлы только этого владельца | Готовность |
|------|--------------------------------------|------------|
| API и fixtures | `apps/api/src/data/fixtures/**`, модуль программ | C/D/F даты прежние; `AN-08` без ребра оборудование → веха; пустая `PRG-DSN` |
| Дашборд | `apps/web/src/components/dashboard/**`, `apps/web/src/app/page.tsx` | 12 вех, выбор программы, три рендерера на одном списке, «Перейти к программе» |
| Страницы | `apps/web/src/app/programs/**`, `apps/web/src/app/projects/**`, `apps/web/src/lib/navigation.ts` | Списки, состав, фильтр, карточка `AN-08`, отказ на неизвестный ID |
| Сценарий | walkthrough и отчёт расхождений | E01 сверить с экраном; E03 обновить только после проверки `reference platform` |
| Интегратор | `docs/07-delivery/pharma-demo-call-work-plan.md` | Браузерный маршрут, регрессия C → D → F, отметки пунктов. E02 не отмечать до другого участника |

UX-документы этой волны после review не правят треки. Расхождение с контрактом возвращается интегратору.
