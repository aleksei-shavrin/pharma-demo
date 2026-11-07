# Design

## Context

Codex final review: kindless clause противоречит позднему «Связь SHALL иметь явный `kind`», `ScheduleLinkDto.kind!` и fixture literals с явным kind. `assertScheduleLink` допускает `kind ?? 'scheduling'` только как внутренний default входного типа — не контракт ответа без kind.

## Goals / Non-Goals

**Goals:** одна MODIFIED-правка заголовка Typed links.

**Non-Goals:** код, rewrite archives, другие requirements.

## Decisions

| Тема | Решение |
|------|---------|
| Kindless | Убрать из living; явный `kind: scheduling` или `cross_project_predecessor` |
| Evidence | DTO `kind!`; fixtures с kind; later Requirement «явный kind» |
