# Proposal: dashboard-pages-consistency

## Why

После r4b остаются UX/данные gaps: шкала календаря с необъяснённым ранним стартом, executive strip с 12 вехами вместо полного канона 189, Program cost спрятан, ProjectDetail набросок, flash empty на списках, нет deep-link фильтров с дашборда.

## What changes

1. **Dating (assumption, not source fact):** источник без дат. Feasibility: старт всех работ 2027-02-01 **не умещается** в PS 2027-09-15 при source FS + content durations (критический путь ≫ 226д). Demo: минимальный предпроект с epoch ≈ backward-from-PS; исполнение с Feb как phase label. Coherent CPM/backward — без post-slide hard clamp.
2. **Fixed universe 189:** 147 source KT + 42 catalog extras (44−2 alias), стабильный ID/order 01–19; dashboard densify/lanes/scroll/program filter.
3. **Program/Project detail parity** + видимый cost (null honest).
4. **Loading contract** на всех data routes.
5. **List toolbars** + **dashboard query filters** (RAG≠attention).

## Out of scope

Auth/deploy; commit/push; reinvent project budgets; Directions UI.
