---
id: DOC-UX-015
title: "Demo v1 UI Design — foundations"
type: product
status: draft
version: "0.1.2"
created: 2026-10-31
updated: 2026-11-01
owner: "docs-engineering"
related:
  - DOC-UX-014
  - DOC-UX-011
  - DOC-UX-010
  - DOC-UX-007
  - DOC-UX-002
  - DOC-UX-009
  - DOC-UX-018
---

# Demo v1 UI Design — foundations

> **certainty:** hypothesis
>
> Общая визуальная гипотеза документа наследуется от **VD-A** (`approved Visual Direction baseline`): industrial control lattice, cool slate, restrained accent, multi-channel status. **Конкретные Foundation values** (HEX, sizes, contrast targets, mapping) — **`approved UI Design decision`** (human APPROVE UI Design pack Demo v1). Frontmatter `status: draft` = lifecycle документа (не decision status). **Не** apps / implementation. Не переоткрывает VD-A / D1–D11. Не закрывает BA-OQ / HIP / D12.

## 1. Purpose and status

| Item | Status |
|------|--------|
| Scope | Color, type, spacing, radius, elevation, interaction tokens, responsive foundations, shadcn mapping, a11y checklist |
| Decision status of new values | **`approved UI Design decision`** |
| VD-A / D1–D11 | Cite only (`approved Visual Direction baseline` / `approved UX decision`) |
| BA-OQ-006 | Remains **open**; V1 table layout = `assumption` (not specified here) |
| D12 | Remains **`deferred decision`** |
| WCAG product compliance | **Not claimed** — calculated targets for selected pairs only |

**Out of scope:** component anatomy (DOC-UX-016), screen grids (DOC-UX-017), chart series detail beyond token roles (DOC-UX-018), interaction flows (DOC-UX-019).

## 2. Design principles (inherited + foundations)

From VD-A (`approved Visual Direction baseline`): hierarchy over decoration; surface depth 0–2; status multi-channel; dense but scannable; BR-006 honesty; shadcn-native tokens.

Foundations add (`approved UI Design decision`):

1. **One role set, two themes** — Light/Dark change values, not role names or IA.
2. **Accent ≠ status** — steel-teal primary for chrome/actions; status aliases stay semantic and distinct by entity family.
3. **Contrast as design gate** — calculated thresholds locked with pack APPROVE; browser re-check at implementation.
4. **No invented statuses** — only Domain allowlist: Equipment `OnTrack`/`Delayed`; Issue `Open`/`Mitigating` (Closed not Must UI); Risk/Milestone RAG `Green`/`Red`. No Amber.

## 3. Color system overview

### 3.1 Neutral roles

| Role | Purpose |
|------|---------|
| `canvas` | Application background behind shell chrome |
| `surface` | Page Surface plate |
| `surface-raised` | Panels, KPI tiles, Decision panel, popovers |
| `surface-sunken` | Table viewport, inset wells |
| `text` / `text-secondary` / `text-muted` / `text-inverse` | Hierarchy |
| `border` | Structural edges (must meet UI contrast where required) |
| `border-subtle` | Decorative dividers (not relied on alone for meaning) |
| `interactive` / `selected` | Hover wash / selected row wash |

### 3.2 Brand / accent roles

| Role | Purpose |
|------|---------|
| `primary` / `primary-foreground` | Primary actions, nav active fill |
| `secondary` / `secondary-foreground` | Quiet actions |
| `accent` | Alias of primary for shadcn accent wash contexts (= primary hue family) |
| `accent-muted` | Soft hover/selection wash |
| `link` | Inline text links |
| `focus-ring` | `:focus-visible` outline |

Accent is **restrained steel-teal** (VD-A); must not visually dominate RAG/status markers.

### 3.3 Semantic status — shared low-level vs aliases

Shared **low-level** tokens: `status-ok`, `status-danger`, `status-open`, `status-info`.

**Distinct semantic aliases** (do not collapse business models):

| Business value | Entity family | Alias token | Low-level |
|----------------|---------------|-------------|-----------|
| OnTrack | Equipment delivery | `equipment-on-track` | `status-ok` |
| Delayed | Equipment delivery | `equipment-delayed` | `status-danger` |
| Open | Issue status | `issue-open` | `status-open` |
| Mitigating | Issue status | `issue-mitigating` | `status-info` |
| Green | Risk RAG | `risk-rag-green` | `status-ok` |
| Red | Risk RAG | `risk-rag-red` | `status-danger` |
| Green | Milestone RAG | `milestone-rag-green` | `status-ok` |
| Red | Milestone RAG | `milestone-rag-red` | `status-danger` |

> **certainty:** assumption
>
> Shared low-level colors are OK. **Four semantic models remain distinct:** Equipment delivery status, Issue status, Risk RAG, Milestone RAG — via alias tokens, labels, and (where specified) marker geometry. Risk vs Milestone **share** RAG marker geometry within Green/Red; they are **not** distinguished by marker shape alone (see §6).

**Not in Must palette:** Amber; Issue `Closed` UI chrome (Domain allows Closed; Demo Must path does not require Closed styling — leave unspecified until decided).

Each applied semantic role specifies: `*-foreground`, `*-background`, `*-border`, `*-marker` (+ hover wash via `interactive` / `selected` when on rows).

**Multi-channel rule:** color + **visible text label** + marker/shape and/or placement context (VD-A). Color alone is insufficient.

### 3.4 Light / Dark parity

| Concern | Rule (`approved UI Design decision`) |
|---------|-------------------|
| Semantics | Same role names and status aliases in both themes |
| Neutrals | Dark is tonal redesign (cool slate), not inverted Light |
| Surfaces | Depth 0→2 preserved via stepwise lift (`canvas` < `surface` < `raised`; `sunken` inset) |
| Status | Badge fg/bg pairs retargeted for each theme; markers remain ≥3:1 vs surface |
| Borders / focus | Structural `border` and `focus-ring` re-tuned per theme; no glow dependency |
| Accent | Light primary darker teal; Dark primary lighter teal — both pass text contrast on their fg |

## 4. Light theme tokens (`approved UI Design decision`)

### 4.1 Neutrals

| Token | HEX | Notes |
|-------|-----|-------|
| `canvas` | `#E8EEF2` | Cool gray-blue app chrome |
| `surface` | `#F7FAFC` | Page Surface |
| `surface-raised` | `#FFFFFF` | Elevated panels |
| `surface-sunken` | `#EEF2F6` | Table / inset |
| `text` | `#1B2430` | Primary |
| `text-secondary` | `#3D4A5C` | Secondary |
| `text-muted` | `#4F5B6A` | Meta / asOf / IDs support |
| `text-inverse` | `#F7FAFC` | On dark fills |
| `border` | `#7A8794` | Structural (≥3:1 vs canvas/surface/raised/sunken; §8.3) |
| `border-subtle` | `#C5D0DA` | Decorative only |
| `interactive` | `#D5E6EA` | Hover wash |
| `selected` | `#C5DCE2` | Selected row wash |

### 4.2 Brand / accent

| Token | HEX |
|-------|-----|
| `primary` | `#2A6573` |
| `primary-foreground` | `#FFFFFF` |
| `secondary` | `#E8EEF2` |
| `secondary-foreground` | `#1B2430` |
| `accent` | `#2A6573` |
| `accent-foreground` | `#FFFFFF` |
| `accent-muted` | `#D5E6EA` |
| `link` | `#1A4F5C` |
| `focus-ring` | `#1A4F5C` |

### 4.3 Semantic status (Light)

| Role | foreground | background | border | marker |
|------|------------|------------|--------|--------|
| `status-ok` | `#1A4D36` | `#E3F2E9` | `#2F6B4F` | `#2F6B4F` |
| `status-danger` | `#7A1710` | `#FCEBEA` | `#B42318` | `#B42318` |
| `status-open` | `#3D4A5C` | `#EEF2F6` | `#5C6B7A` | `#5C6B7A` |
| `status-info` | `#1E3558` | `#E6EEF7` | `#3A5F8A` | `#3A5F8A` |

Aliases map to these four role rows per §3.3.

**Destructive (forms / rare):** use `status-danger` pair; no separate brand red required in Demo v1.

## 5. Dark theme tokens (`approved UI Design decision`)

### 5.1 Neutrals

| Token | HEX |
|-------|-----|
| `canvas` | `#0F1419` |
| `surface` | `#161C24` |
| `surface-raised` | `#1E2630` |
| `surface-sunken` | `#12181F` |
| `text` | `#E8EEF2` |
| `text-secondary` | `#B8C2CE` |
| `text-muted` | `#9AA6B4` |
| `text-inverse` | `#0F1419` |
| `border` | `#6B7785` |
| `border-subtle` | `#3A4654` |
| `interactive` | `#243840` |
| `selected` | `#2C4A52` |

### 5.2 Brand / accent

| Token | HEX |
|-------|-----|
| `primary` | `#5BB3C4` |
| `primary-foreground` | `#0A1216` |
| `secondary` | `#2A3440` |
| `secondary-foreground` | `#E8EEF2` |
| `accent` | `#5BB3C4` |
| `accent-foreground` | `#0A1216` |
| `accent-muted` | `#243840` |
| `link` | `#8FD0DE` |
| `focus-ring` | `#8FD0DE` |

### 5.3 Semantic status (Dark)

| Role | foreground | background | border | marker |
|------|------------|------------|--------|--------|
| `status-ok` | `#B5E3C2` | `#1A2E24` | `#4AAE78` | `#4AAE78` |
| `status-danger` | `#F7B4AC` | `#3A1A18` | `#E56B60` | `#E56B60` |
| `status-open` | `#C5CED8` | `#1E2630` | `#9AA6B4` | `#9AA6B4` |
| `status-info` | `#B4CDE6` | `#1A2434` | `#6B9BC4` | `#6B9BC4` |

## 6. Semantic status usage notes

| Family | Label text (EN UI) | Marker shape (`approved UI Design decision`) | How the model stays distinct |
|--------|--------------------|---------------------------|------------------------------|
| Equipment OnTrack | On track | Filled disc | Equipment delivery family + delivery columns/context |
| Equipment Delayed | Delayed | **Diamond** (locked; DOC-UX-018) | Distinct geometry from RAG Red; variance-aware sort |
| Issue Open | Open | **Outline badge** (locked; DOC-UX-018) | Issue status family; neutral-steel; **not** Amber |
| Issue Mitigating | Mitigating | **Half-filled badge** (locked; DOC-UX-018) | Issue status family; **not** «fixed» / recovery done (BR-006) |
| Risk Green | Green | Filled disc (RAG) | Risk RAG alias + Risk entity chrome / column / Type |
| Risk Red | Red | Filled disc + optional row left rail | Risk RAG alias + Risk context (not Equipment Delayed diamond) |
| Milestone Green | Green | Filled disc (RAG) | Milestone RAG alias + Milestone entity chrome / column |
| Milestone Red | Red | Filled disc + optional row left rail | Milestone RAG alias + Milestone context |

**Risk vs Milestone RAG (`approved UI Design decision`):** same Green/Red **colors** and **marker geometry**. Differentiation is by **entity context** (register/section/column header, detail entity type, Type/name field), **text label**, and placement — **not** by inventing separate marker shapes for Risk vs Milestone. This keeps VD-A simple and avoids a fourth geometry set.

**Equipment Delayed vs RAG Red:** different marker geometry (**diamond** vs filled disc+rail) so delivery delay is not visually identical to Risk/Milestone Red even when both use `status-danger` color. Concrete shapes: DOC-UX-018.

**BR-006:** Mitigating label/marker must not imply recovery execution, improved forecast, or RAG upgrade.

Hover/selected on status rows: use `interactive` / `selected` washes; do not recolor status marker to accent teal.

## 7. Contrast calculation methodology

### 7.1 Formula (WCAG 2.x relative luminance)

For sRGB channel \(C \in [0,1]\) (8-bit channel / 255):

- if \(C \le 0.04045\) then \(C' = C / 12.92\)
- else \(C' = ((C + 0.055) / 1.055)^{2.4}\)

\[
L = 0.2126 R' + 0.7152 G' + 0.0722 B'
\]

Contrast ratio:

\[
(L_\mathrm{lighter} + 0.05) / (L_\mathrm{darker} + 0.05)
\]

> Note: older drafts sometimes cited \(0.03928\); this pack uses the **WCAG 2.x** sRGB linearization cutoff **\(0.04045\)**. Recomputed ratios for the published HEX set are unchanged at two-decimal precision versus the prior published table (no channel in this palette sits on the cutoff boundary in a way that alters rounded results).

### 7.2 Thresholds applied

| Use | Threshold |
|-----|-----------|
| Normal text (labels, body, badge text) | **4.5:1** (WCAG AA) |
| Large text (≥18pt / ≥14pt bold) | 3:1 (not relied on for Demo defaults) |
| Non-text UI / graphical indicators (markers, focus, structural border, primary control vs surface) | **3:1** (WCAG 1.4.11 where applicable) |

### 7.3 Scope / non-claims

- Results below are **design-time calculated targets** for listed pairs.
- **Not** a full WCAG audit; **not** product compliance claim.
- Browser measurement + keyboard testing remain **implementation**.
- `border-subtle` is decorative — **not** required to meet 3:1; meaning must not depend on it alone.
- Disabled controls may intentionally reduce contrast; they are not in the PASS table (implementation pattern: opacity / muted; still expose name to AT).

### 7.4 Reproducibility

Any Node/Python/tool implementing §7.1 should match ratios in §8 within ±0.02. Initial tuning: Light structural border darkened from `#8A96A4` (2.87:1 FAIL vs surface) → `#7A8794` (PASS on all four surfaces; §8.3).

## 8. Contrast results (`approved UI Design decision` targets)

### 8.1 Light theme

| Pair | FG | BG | Ratio | Thr | Result |
|------|----|----|-------|-----|--------|
| Primary text / surface | `#1B2430` | `#F7FAFC` | 14.93 | 4.5 | PASS |
| Primary text / raised | `#1B2430` | `#FFFFFF` | 15.65 | 4.5 | PASS |
| Primary text / canvas | `#1B2430` | `#E8EEF2` | 13.37 | 4.5 | PASS |
| Secondary text / surface | `#3D4A5C` | `#F7FAFC` | 8.59 | 4.5 | PASS |
| Muted text / surface | `#4F5B6A` | `#F7FAFC` | 6.60 | 4.5 | PASS |
| Muted text / raised | `#4F5B6A` | `#FFFFFF` | 6.91 | 4.5 | PASS |
| Muted text / sunken | `#4F5B6A` | `#EEF2F6` | 6.15 | 4.5 | PASS |
| Primary btn fg / primary | `#FFFFFF` | `#2A6573` | 6.55 | 4.5 | PASS |
| Secondary btn fg / secondary | `#1B2430` | `#E8EEF2` | 13.37 | 4.5 | PASS |
| Link / surface | `#1A4F5C` | `#F7FAFC` | 8.65 | 4.5 | PASS |
| status-ok label / badge bg | `#1A4D36` | `#E3F2E9` | 8.40 | 4.5 | PASS |
| status-danger label / badge bg | `#7A1710` | `#FCEBEA` | 9.30 | 4.5 | PASS |
| status-open label / badge bg | `#3D4A5C` | `#EEF2F6` | 8.00 | 4.5 | PASS |
| status-info label / badge bg | `#1E3558` | `#E6EEF7` | 10.52 | 4.5 | PASS |
| ok marker / surface | `#2F6B4F` | `#F7FAFC` | 6.00 | 3.0 | PASS |
| danger marker / surface | `#B42318` | `#F7FAFC` | 6.27 | 3.0 | PASS |
| open marker / surface | `#5C6B7A` | `#F7FAFC` | 5.22 | 3.0 | PASS |
| info marker / surface | `#3A5F8A` | `#F7FAFC` | 6.29 | 3.0 | PASS |
| Focus ring / surface | `#1A4F5C` | `#F7FAFC` | 8.65 | 3.0 | PASS |
| Primary / surface (UI) | `#2A6573` | `#F7FAFC` | 6.25 | 3.0 | PASS |

### 8.2 Dark theme

| Pair | FG | BG | Ratio | Thr | Result |
|------|----|----|-------|-----|--------|
| Primary text / surface | `#E8EEF2` | `#161C24` | 14.64 | 4.5 | PASS |
| Primary text / raised | `#E8EEF2` | `#1E2630` | 13.05 | 4.5 | PASS |
| Primary text / canvas | `#E8EEF2` | `#0F1419` | 15.82 | 4.5 | PASS |
| Secondary text / surface | `#B8C2CE` | `#161C24` | 9.50 | 4.5 | PASS |
| Muted text / surface | `#9AA6B4` | `#161C24` | 6.92 | 4.5 | PASS |
| Muted text / raised | `#9AA6B4` | `#1E2630` | 6.17 | 4.5 | PASS |
| Muted text / sunken | `#9AA6B4` | `#12181F` | 7.22 | 4.5 | PASS |
| Primary btn fg / primary | `#0A1216` | `#5BB3C4` | 7.82 | 4.5 | PASS |
| Secondary btn fg / secondary | `#E8EEF2` | `#2A3440` | 10.79 | 4.5 | PASS |
| Link / surface | `#8FD0DE` | `#161C24` | 9.99 | 4.5 | PASS |
| status-ok label / badge bg | `#B5E3C2` | `#1A2E24` | 10.09 | 4.5 | PASS |
| status-danger label / badge bg | `#F7B4AC` | `#3A1A18` | 9.01 | 4.5 | PASS |
| status-open label / badge bg | `#C5CED8` | `#1E2630` | 9.59 | 4.5 | PASS |
| status-info label / badge bg | `#B4CDE6` | `#1A2434` | 9.52 | 4.5 | PASS |
| ok marker / surface | `#4AAE78` | `#161C24` | 6.21 | 3.0 | PASS |
| danger marker / surface | `#E56B60` | `#161C24` | 5.39 | 3.0 | PASS |
| open marker / surface | `#9AA6B4` | `#161C24` | 6.92 | 3.0 | PASS |
| info marker / surface | `#6B9BC4` | `#161C24` | 5.80 | 3.0 | PASS |
| Focus ring / surface | `#8FD0DE` | `#161C24` | 9.99 | 3.0 | PASS |
| Primary / surface (UI) | `#5BB3C4` | `#161C24` | 7.09 | 3.0 | PASS |

### 8.3 Structural border vs four surfaces (thr 3.0)

Where `border` defines a UI component edge or state boundary, require ≥3:1 against the adjacent surface. `border-subtle` remains decorative-only (not in this table).

**Light** (`border` = `#7A8794`):

| Pair | FG | BG | Ratio | Thr | Result |
|------|----|----|-------|-----|--------|
| border / canvas | `#7A8794` | `#E8EEF2` | 3.14 | 3.0 | PASS |
| border / surface | `#7A8794` | `#F7FAFC` | 3.50 | 3.0 | PASS |
| border / surface-raised | `#7A8794` | `#FFFFFF` | 3.67 | 3.0 | PASS |
| border / surface-sunken | `#7A8794` | `#EEF2F6` | 3.26 | 3.0 | PASS |

**Dark** (`border` = `#6B7785`):

| Pair | FG | BG | Ratio | Thr | Result |
|------|----|----|-------|-----|--------|
| border / canvas | `#6B7785` | `#0F1419` | 4.06 | 3.0 | PASS |
| border / surface | `#6B7785` | `#161C24` | 3.76 | 3.0 | PASS |
| border / surface-raised | `#6B7785` | `#1E2630` | 3.35 | 3.0 | PASS |
| border / surface-sunken | `#6B7785` | `#12181F` | 3.91 | 3.0 | PASS |

**Unresolved contrast pairs:** none among the required checklist (including §8.3). No token retune required for the \(0.04045\) formula refresh or four-surface border expansion.

## 9. Typography (`approved UI Design decision`)

### 9.1 Family

| Role | Stack |
|------|-------|
| UI / body | `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif` |
| Tabular / numeric | Same family + `font-variant-numeric: tabular-nums lining-nums` |
| Monospace (IDs optional) | `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` |

> **certainty:** assumption
>
> System stack keeps shadcn-native delivery and VD-A «strong sans» without locking a webfont in Demo v1. Optional later webfont (e.g. industrial grotesque) needs separate decision — **not** required here.

### 9.2 Scale

| Token | Size | Weight | Line-height | Letter-spacing | Use |
|-------|------|--------|-------------|----------------|-----|
| `display` | 24px / 1.5rem | 600 | 1.25 | -0.01em | Rare Dashboard page title |
| `title` | 20px / 1.25rem | 600 | 1.3 | -0.005em | Page / panel headers |
| `title-sm` | 16px / 1rem | 600 | 1.35 | 0 | Section headers |
| `body` | 14px / 0.875rem | 400 | 1.45 | 0 | Default UI |
| `body-strong` | 14px | 600 | 1.45 | 0 | Emphasized body |
| `label` | 13px / 0.8125rem | 500 | 1.3 | 0.01em | Field labels, badges |
| `meta` | 12px / 0.75rem | 400 | 1.35 | 0.01em | asOf, IDs, muted |
| `tabular` | 13px | 500 | 1.3 | 0 | Dates, Δ, variances, KPI numbers |

### 9.3 Table / KPI notes

- Table headers: `label` + `text-secondary`.
- Table cells: `body` / `tabular` for dates and deltas.
- Long Equipment / Risk / Milestone names: 1–2 line clamp with tooltip at component layer; do not shrink below 12px.
- KPI value: `tabular` 20px/600; KPI caption: `meta`.
- Δ values: `tabular`; color only with sign/label (not color-alone).

## 10. Spacing and sizing (`approved UI Design decision`)

### 10.1 Spacing scale (base 4)

| Token | px |
|-------|----|
| `space-1` | 4 |
| `space-2` | 8 |
| `space-3` | 12 |
| `space-4` | 16 |
| `space-5` | 24 |
| `space-6` | 32 |
| `space-7` | 48 |

### 10.2 Shell / layout

| Token | Value | Use |
|-------|-------|-----|
| `sidebar-width` | 240px | Expanded nav |
| `sidebar-width-collapsed` | 64px | Icon rail |
| `topbar-height` | 52px | App Bar |
| `page-gutter` | 24px | Page Surface padding (≥1280) |
| `page-gutter-sm` | 16px | 1024–1279 |
| `content-max` | 1440px | Optional max for narrative columns |
| `panel-padding` | 16px | Raised panels |
| `section-gap` | 24px | Between major Dashboard zones |
| `table-cell-x` | 12px | Cell horizontal padding |
| `table-cell-y` | 8px | Cell vertical padding |

### 10.3 Control / row heights

| Token | Value |
|-------|-------|
| `control-h-sm` | 28px |
| `control-h-md` | 32px |
| `control-h-lg` | 36px |
| `table-row-h` | 40px |
| `table-row-h-compact` | 36px |
| `kpi-min-h` | 88px |

Density: enterprise-compact; avoid sub-32px interactive targets for primary controls (icon-only tools ≥28px with clear hit area).

## 11. Radius, borders, elevation (`approved UI Design decision`)

### 11.1 Radius

| Token | px | Use |
|-------|-----|-----|
| `radius-sm` | 4 | Badges, inputs, chips (soft rectangle; avoid pills) |
| `radius-md` | 6 | Buttons, small panels |
| `radius-lg` | 10 | Page Surface / large panels |
| `radius-full` | 9999 | **Avoid** for status badges in Demo v1 |

### 11.2 Borders

| Token | Width | Role |
|-------|-------|------|
| `border-w` | 1px | Default structural |
| `border-w-strong` | 2px | Focus ring offset companion / selected rail |
| `rail-w` | 3px | Selected / Red row left rail |

### 11.3 Elevation / surface depth (VD-A 0–2)

| Level | Token intent | Light treatment | Dark treatment |
|-------|--------------|-----------------|----------------|
| 0 | `canvas` | Flat `#E8EEF2` | Flat `#0F1419` |
| 1 | `surface` | Tonal lift; optional hairline border | Tonal lift + `border-subtle` |
| 2 | `surface-raised` | `#FFFFFF` + soft shadow `0 1px 2px rgb(15 20 25 / 0.06), 0 1px 3px rgb(15 20 25 / 0.04)` | `#1E2630` + softer shadow `0 1px 2px rgb(0 0 0 / 0.35)` |
| inset | `surface-sunken` | Recess via darker fill, no heavy inner shadow | Darker fill |

No multi-layer marketing shadows. Prefer tonal separation over decoration.

## 12. Interaction state tokens (`approved UI Design decision`)

| State | Visual rule | Not to confuse with |
|-------|-------------|---------------------|
| default | Base tokens | — |
| hover | `interactive` wash; links use darker/lighter link tone | Status color change |
| active/pressed | Slightly deeper wash than hover; primary button darken/lighten 6–8% | Business status |
| focus-visible | 2px `focus-ring` outline + 2px offset (canvas/surface contrast) | Selected |
| selected | `selected` wash + `rail-w` accent or status rail | Focus |
| disabled | 40–50% opacity **or** muted fg on muted bg; not focusable | Loading |
| read-only | Full contrast text; no hover chrome; caret/selection limited | Disabled |

**Data states** (loading / empty / error): separate patterns in DOC-UX-016/019 — use `text-muted` + non-status icons; error messages may use `status-danger` text **without** implying Issue/Risk RAG.

## 13. Responsive foundations (`approved UI Design decision`)

Desktop-first Demo v1 (from DOC-UX-012 / VD-A):

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| `xl` | ≥1280px | Full shell: sidebar 240 + Page Surface |
| `lg` | 1024–1279 | Sidebar → icons/drawer; gutters 16; tables keep horizontal scroll |
| `md` | 768–1023 | Best-effort; drawer nav; Snapshot remains reachable in App Bar |
| `<768` | — | **Not** a product target; no dedicated mobile IA |

| Concern | Rule |
|---------|------|
| Tables | Prefer horizontal scroll over crushing columns |
| Dense data | Do not hide critical Δ / status columns before `lg` |
| Min work area | **Target** content width ≥720px when full shell is shown — design target for table/Dashboard readability, **not** a guarantee on every device/viewport |
| Gantt | Secondary; may hide earlier than table (D12 look only) |

## 14. shadcn/ui token mapping (`approved UI Design decision`)

Spec only — **no** CSS/Tailwind files in this iteration.

| Design token | shadcn CSS variable | Light | Dark | Usage |
|--------------|---------------------|-------|------|-------|
| `canvas` | *(app shell; optional `--canvas`)* | `#E8EEF2` | `#0F1419` | Outside card |
| `surface` | `--background` | `#F7FAFC` | `#161C24` | App/page bg in shadcn theme scope |
| `text` | `--foreground` | `#1B2430` | `#E8EEF2` | Default text |
| `surface-raised` | `--card` | `#FFFFFF` | `#1E2630` | Panels / cards |
| `text` | `--card-foreground` | `#1B2430` | `#E8EEF2` | Card text |
| `surface-raised` | `--popover` | `#FFFFFF` | `#1E2630` | Popover |
| `text` | `--popover-foreground` | `#1B2430` | `#E8EEF2` | Popover text |
| `primary` | `--primary` | `#2A6573` | `#5BB3C4` | Primary button / active |
| `primary-foreground` | `--primary-foreground` | `#FFFFFF` | `#0A1216` | On primary |
| `secondary` | `--secondary` | `#E8EEF2` | `#2A3440` | Secondary button |
| `secondary-foreground` | `--secondary-foreground` | `#1B2430` | `#E8EEF2` | On secondary |
| `surface-sunken` / muted wash | `--muted` | `#EEF2F6` | `#12181F` | Muted surfaces |
| `text-muted` | `--muted-foreground` | `#4F5B6A` | `#9AA6B4` | Muted text |
| `accent-muted` | `--accent` | `#D5E6EA` | `#243840` | Accent wash |
| `text` | `--accent-foreground` | `#1B2430` | `#E8EEF2` | On accent wash |
| `status-danger` bg/fg | `--destructive` / `--destructive-foreground` | `#B42318` / `#FFFFFF`* | `#E56B60` / `#0A1216`* | Form destructive; **≠** automatic Risk RAG |
| `border` | `--border` | `#7A8794` | `#6B7785` | Borders |
| `border` | `--input` | `#7A8794` | `#6B7785` | Input chrome |
| `focus-ring` | `--ring` | `#1A4F5C` | `#8FD0DE` | Focus |

\*Destructive solid controls (`approved UI Design decision`): Light `#FFFFFF` on `#B42318` = **6.57:1**; Dark `#0A1216` on `#E56B60` = **5.94:1**. Badge RAG still uses §4.3/§5.3. Re-measure computed styles at implementation.

### Extra semantic CSS variables (`approved UI Design decision`)

| Variable | Maps to |
|----------|---------|
| `--status-ok` / `-foreground` / `-bg` | `status-ok` |
| `--status-danger` / `-foreground` / `-bg` | `status-danger` |
| `--status-open` / `-foreground` / `-bg` | `status-open` |
| `--status-info` / `-foreground` / `-bg` | `status-info` |
| `--surface-sunken` | `surface-sunken` |
| `--canvas` | `canvas` |

Chart series (`chart-*`): neutrals + status markers; exact series table deferred to DOC-UX-018.

## 15. Accessibility checklist

| Check | Design-time (this doc) | Browser impl | Manual |
|-------|------------------------|--------------|--------|
| Text contrast pairs | Calculated §8 | Re-measure computed styles | Spot-check |
| UI component / marker contrast | Calculated §8 | Re-measure | Spot-check |
| Focus visibility | Token + rule §12 | Verify `:focus-visible` | Keyboard tour |
| Keyboard navigation principles | Rules only | Implement tab order | Full pass |
| Status not color-alone | Labels + markers specified | Components enforce | Review |
| Text scaling / readability | Min 12px meta | Zoom 200% | Review tables |
| Reduced motion | Prefer ≤200ms; honor `prefers-reduced-motion` at impl | CSS | Spot-check |
| Light/Dark consistency | Parity §3.4 + dual tables | Theme toggle | Both themes |
| Table readability | Density tokens | Virtualize later if needed | Director scan |
| Icon-only control labeling | Principle: accessible name required | `aria-label` | Audit |

**Do not claim** accessibility audit passed.

## 16. Open decisions and implementation notes

| Item | Status |
|------|--------|
| UI Design pack APPROVE (locks HEX) | **APPROVED** (human); Implementation NOT STARTED |
| BA-OQ-006 layout | Open; V1 assumption elsewhere |
| D12 Gantt library | Deferred |
| Issue Closed / Amber tokens | Not Must — unspecified |
| Webfont choice beyond system stack | Open; system stack default |
| Exact `--destructive` fg pairing in CSS | Verify at impl (§14 note) |
| Chart series HEX | DOC-UX-018 |
| Filter persistence | MVP assumption elsewhere; not foundations |

**Implementation notes:** map tokens via shadcn theme CSS variables; prefer extension over forks; do not import mock modules into FE; FE data via API later (REQ-NFR-001).

## 17. Related documents

- [demo-v1-ui-design-overview.md](./demo-v1-ui-design-overview.md) (DOC-UX-014)
- [demo-v1-design-tokens.md](./demo-v1-design-tokens.md) (DOC-UX-011) — VD roles; illustrative superseded by this doc for HEX
- [demo-v1-visual-direction.md](./demo-v1-visual-direction.md) (DOC-UX-010)
- [demo-v1-screen-compositions.md](./demo-v1-screen-compositions.md) (DOC-UX-012)
- [demo-v1-data-viz-and-components.md](./demo-v1-data-viz-and-components.md) (DOC-UX-007)
- [demo-v1-shell-navigation.md](./demo-v1-shell-navigation.md) (DOC-UX-002)
- [demo-v1-ux-traceability.md](./demo-v1-ux-traceability.md) (DOC-UX-009)
- Domain / BR: `docs/02-business-analysis/domain-model-demo-v1.md`, `business-rules-demo-v1.md`
- Plan: `.cursor/plans/ui-design-spec-demo-v1.md`
