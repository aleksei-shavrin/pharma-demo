---
id: DOC-UX-011
title: "Demo v1 design tokens (Visual Direction)"
type: product
status: draft
version: "0.1.1"
created: 2026-10-31
updated: 2026-10-31
owner: "docs-engineering"
related:
  - DOC-UX-010
  - DOC-UX-007
  - DOC-UX-002
---

# Demo v1 design tokens (Visual Direction)

> **certainty:** hypothesis
>
> Базовая token system под **VD-A** (`proposal`). Роли и принципы важнее HEX. Примерные значения — иллюстрация, не финальная палитра. Не расширяет status allowlist. Не install / не CSS в apps.

## 1. Color roles (`proposal`)

| Role | Purpose |
|------|---------|
| `canvas` | Application background (shell chrome sits on this) |
| `surface` | Page Surface plate |
| `surface-raised` | Working panels / KPI tiles / nested blocks |
| `surface-sunken` | Table body / inset wells |
| `border` / `border-subtle` | Structural edges; avoid boxing everything equally |
| `text` / `text-muted` / `text-inverse` | Hierarchy |
| `accent` | Interactive focus, primary actions, nav active (restrained; not purple) |
| `accent-muted` | Soft selection / hover wash |
| `status-*` | Semantic only for allowlisted statuses (see §4) |
| `chart-*` | Recharts series aligned to neutrals + status where meaningful |
| `focus-ring` | Keyboard focus |

## 2. Light / Dark principles (`proposal`)

- Один набор **ролей**; меняются значения, не структура UI.
- Dark: сохранять контраст текста и status markers; не полагаться на glow.
- Charts/tables читаемы в обеих темах (DOC-UX-007).
- Snapshot control и theme toggle остаются в App Bar (`approved UX decision` для placement).

Нейтральная основа VD-A: **cool slate / steel** (серо-синие нейтрали), не cream paper и не purple brand wash.

Accent: сдержанный **teal-steel или cool blue-gray** (не indigo-purple gradient). Конкретный hue — `proposal` до review.

## 3. Surface depth (`proposal`)

| Level | Token intent | Use |
|-------|--------------|-----|
| 0 | `canvas` | App shell background |
| 1 | `surface` + light elevation | Page Surface |
| 2 | `surface-raised` | Panels, KPI tiles, Decision panel |
| inset | `surface-sunken` | Table viewport, nested lists |

Elevation: **0–2** only; soft single shadow or tonal separation — не multi-layer stacks. Borders: prefer one clear edge per region; не обводить каждый cell-like card.

## 4. Semantic status (`proposal` encoding; values = approved allowlist)

Допустимые значения: Equipment OnTrack / Delayed; Issue Open / Mitigating; Risk/MS rag Green / Red. **Не** вводить Amber / Closed в Must palette без отдельного решения.

| Status | Text label | Color role | Marker / shape | Hierarchy |
|--------|------------|------------|----------------|-----------|
| OnTrack | «On track» | `status-ok` | filled disc / calm | default row |
| Delayed | «Delayed» | `status-danger` | diamond or bold bar | elevate in sort/filter defaults when variance≠0 |
| Open | «Open» | `status-open` | outline badge | exceptions preview |
| Mitigating | «Mitigating» | `status-info` | half-filled / dashed badge | Decision honesty context; **not** «fixed» |
| Green | «Green» | `status-ok` | filled | MS/Risk rag |
| Red | «Red» | `status-danger` | filled + optional left rail on row | high scan priority |

> **certainty:** assumption
>
> Имена `status-open` / `status-info` — **token roles** для кодирования уже allowlisted Issue statuses (Open / Mitigating). Это **не** новые бизнес-статусы и **не** Amber-семантика.

Статус **никогда** не только цветом: всегда видимая текстовая метка (+ marker).

## 5. Typography (`proposal`)

| Step | Use | Notes |
|------|-----|-------|
| `display` | Rare page title on Dashboard | Strong sans; not decorative serif cliché |
| `title` | Section / panel headers | |
| `body` | Default UI | |
| `label` | Field labels, badges | Medium weight |
| `meta` | IDs, asOf, muted | |
| `tabular` | Dates, Δ, variances | Tabular lining figures |

Scale compact (enterprise density): roughly 12 / 13 / 14 / 16 / 20 / 24 px equivalents — exact rem mapping at impl.

## 6. Spacing, radius, motion (`proposal`)

- Spacing base **4**: 4 / 8 / 12 / 16 / 24 / 32.
- Radii: shell chrome small (4–6); Page Surface medium (8–12); badges pill-avoid — prefer soft rectangle (4–6).
- Motion: short (150–200ms) for theme/snapshot; no gratuitous parallax.

## 7. Borders, focus, selection (`proposal`)

- Hover: tonal wash (`accent-muted`), not heavy border flash.
- Selected row: left accent rail + wash.
- Focus: visible `focus-ring` with contrast as a **design principle** (см. §8).

## 8. Accessibility — design principle, not verified claim

> **certainty:** assumption
>
> «WCAG-oriented contrast» здесь означает **принцип проектирования** при выборе ролей и примеров токенов. **Не** означает, что WCAG compliance или accessibility уже измерены/подтверждены в этой docs-волне.

При UI Design / implementation **потребуется** проверить (измерениями, не декларацией):

- text / background;
- status label / badge background;
- markers / table background;
- focus ring;
- Light и Dark themes.

Не заявлять WCAG compliance без таких проверок.

## 9. Illustrative values (`proposal` only — not final)

> **certainty:** hypothesis
>
> Примеры для обсуждения Light theme; Dark — инверсия ролей с проверкой контраста. Human review может заменить HEX целиком.

| Role | Example Light (illustrative) |
|------|------------------------------|
| canvas | cool gray-blue ~ `#E8EEF2` |
| surface | `#F7FAFC` |
| surface-raised | `#FFFFFF` |
| text | `#1B2430` |
| accent | steel-teal ~ `#2F6F7E` |
| status-ok / Green / OnTrack | `#2F6B4F` |
| status-danger / Red / Delayed | `#B42318` |
| status-open / Open | `#5C6B7A` (neutral-steel outline fill; **not** Amber) |
| status-info / Mitigating | `#3A5F8A` |

## 10. shadcn mapping intent (`proposal`)

Map roles → CSS variables (`--background`, `--card`, `--primary`, `--destructive`, `--muted`, `--border`, `--ring`, etc.). Prefer theme extension over forking components. Charts: Recharts stroke/fill from `chart-*` / status roles.

## 11. Out of scope

Figma token export; full chromatic scales; Amber/Closed tokens as Must; package install.
