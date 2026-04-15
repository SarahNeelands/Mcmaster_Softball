# Manual Test Cases

## TC-01: Create next series when previous series ends before season end

Setup:
- Create a season with `start_date=2026-05-01` and `end_date=2026-08-31`
- Create `Series 1` with `start_date=2026-05-01` and `end_date=2026-06-15`
- Ensure at least one division exists and teams have standings in that series

Action:
- Call `GET /api/series?season_id=<seasonId>&type=current` on a date after `2026-06-15`

Expected:
- A new series is created automatically
- New series `start_date` is `2026-06-16`
- New series `end_date` is `2026-08-31`
- New series inherits `advance_amount` and `demote_amount` from `Series 1`

## TC-02: Do not create next series on the exact end date

Setup:
- Same as `TC-01`

Action:
- Call current-series lookup on `2026-06-15`

Expected:
- `Series 1` is still considered current
- No new series is created yet

## TC-03: Do not create next series after season end

Setup:
- Season `end_date=2026-06-15`
- `Series 1 end_date=2026-06-15`

Action:
- Call current-series lookup on `2026-06-16`

Expected:
- No follow-up series is created
- The finished series may be returned as previous, but rollover does not occur

## TC-04: Prevent duplicate follow-up series

Setup:
- Complete `TC-01` once so the follow-up series already exists

Action:
- Call current-series lookup again on the same day

Expected:
- No second follow-up series is created
- Existing follow-up series is returned

## TC-05: Divisions are recreated in the new series

Setup:
- `Series 1` contains multiple divisions with teams assigned

Action:
- Trigger rollover

Expected:
- Equivalent divisions are created for the new series
- Division names and points settings carry over
- Division IDs are new and distinct from `Series 1`

## TC-06: Promotion/demotion uses previous series standings

Setup:
- `Series 1` has finalized scores that produce a known standings order
- Example:
  - Division 1 bottom team is `Team D`
  - Division 2 top team is `Team E`

Action:
- Trigger rollover

Expected:
- `Team E` is assigned to Division 1 in the new series
- `Team D` is assigned to Division 2 in the new series
- Movement respects `advance_amount` and `demote_amount`

## TC-07: New-series scores do not change previous-series standings

Setup:
- Trigger rollover so `Series 2` exists
- Record `Series 1` standings and division membership

Action:
- Add several `Series 2` matches
- Enter scores for those matches
- Reload standings for both series

Expected:
- `Series 2` standings update normally
- `Series 1` standings remain unchanged
- `Series 1` team placement remains unchanged

## TC-08: Moving teams in new-series divisions does not rewrite old-series divisions

Setup:
- Trigger rollover so `Series 2` exists
- Record `Series 1` division assignments

Action:
- Move one team between divisions inside `Series 2`

Expected:
- `Series 2` assignment changes
- `Series 1` assignment remains unchanged

## TC-09: Single-division series does not promote or demote

Setup:
- Create a series with only one division

Action:
- Trigger rollover

Expected:
- A new series is created
- The same teams remain grouped in the same single division
- No promotion/demotion movement occurs

## TC-10: Zero advance and zero demote preserves ordering without movement

Setup:
- Set `advance_amount=0` and `demote_amount=0`
- Create multiple divisions and known standings

Action:
- Trigger rollover

Expected:
- New series is created
- Team groupings remain aligned with previous division membership
- No promotion or demotion occurs
