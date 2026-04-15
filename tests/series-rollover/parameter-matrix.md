# Parameter Matrix

## Date-driven rollover

| Case ID | Season Start | Season End | Previous Series Start | Previous Series End | Today | Expected |
|---|---|---|---|---|---|---|
| DR-01 | 2026-05-01 | 2026-08-31 | 2026-05-01 | 2026-06-15 | 2026-06-16 | Create new series |
| DR-02 | 2026-05-01 | 2026-08-31 | 2026-05-01 | 2026-06-15 | 2026-06-15 | Do not create new series yet |
| DR-03 | 2026-05-01 | 2026-06-15 | 2026-05-01 | 2026-06-15 | 2026-06-16 | Do not create new series because season also ended |
| DR-04 | 2026-05-01 | 2026-08-31 | 2026-05-01 | 2026-06-15 | 2026-06-20 | Reuse already-created follow-up series, do not duplicate |

## Follow-up series values

| Case ID | Previous End | Season End | Expected New Start | Expected New End |
|---|---|---|---|---|
| FV-01 | 2026-06-15 | 2026-08-31 | 2026-06-16 | 2026-08-31 |
| FV-02 | 2026-07-30 | 2026-08-01 | 2026-07-31 | 2026-08-01 |

## Promotion and demotion seeding

| Case ID | Divisions | Advance | Demote | Expected |
|---|---|---|---|---|
| PD-01 | 2 divisions | 1 | 1 | Top team from lower division promoted, bottom team from upper division demoted |
| PD-02 | 3 divisions | 2 | 1 | Top 2 teams move up where applicable, bottom 1 team moves down where applicable |
| PD-03 | 1 division | 1 | 1 | No movement across divisions because only one division exists |
| PD-04 | 3 divisions | 0 | 0 | Divisions copied exactly, no movement |

## Isolation guarantees

| Case ID | Action in Series 2 | Expected impact on Series 1 |
|---|---|---|
| IG-01 | Add future match | No change |
| IG-02 | Enter scores | No change |
| IG-03 | Recalculate standings | No change |
| IG-04 | Move teams in Series 2 divisions | No change to Series 1 division membership |

## Duplicate-prevention checks

| Case ID | Existing follow-up series start | Previous end | Expected |
|---|---|---|---|
| DP-01 | 2026-06-16 | 2026-06-15 | Return existing follow-up series |
| DP-02 | none | 2026-06-15 | Create one follow-up series |
