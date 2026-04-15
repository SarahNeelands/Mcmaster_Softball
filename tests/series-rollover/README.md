# Series Rollover Test Cases

This folder contains manual and API-oriented test cases for the series rollover logic.

Scope covered:
- Automatic creation of a follow-up series when a prior series ends before the season ends
- Start/end date rollover behavior
- Division carry-forward
- Promotion/demotion seeding
- Isolation between previous-series standings and next-series standings
- Duplicate-prevention behavior

Notes:
- This repo does not currently include a test runner such as Jest or Vitest.
- These cases are written so they can be executed manually, through API calls, or later converted into automated tests.

Files:
- `parameter-matrix.md`: compact matrix of parameter combinations and expected outcomes
- `manual-test-cases.md`: step-by-step test scenarios with expected results
- `fixtures.json`: sample inputs and expected rollover outputs for future automation
