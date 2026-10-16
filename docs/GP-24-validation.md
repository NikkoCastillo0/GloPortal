# GP-24 implementation and validation

The existing appointment components were completed on `feat/GP-24-appointment-filtering`.

## Implemented behavior

- The heading is `All Appointments`, following the supplied design requirement.
- Completed records are queried through Supabase with exact counts and six records per page.
- `by date` sorts earliest first; A–Z and Z–A sort by customer surname then first name.
- Most jobs / Least jobs sort by the customer's lifetime completed appointment count visible under RLS, then name/date/ID for deterministic pagination.
- An optional date input filters by the appointment's calendar day in America/Los_Angeles. PostgreSQL derives the date, including DST; clearing it restores all dates.
- Every sort/date change resets pagination to page one. Pagination is disabled while loading and at its boundaries.
- Superseded requests cannot replace current results. Loading, error and empty states are distinct.
- Narrow screens contain horizontal table scrolling in a keyboard-focusable region.

## Confirmed Jira scope

Jira GP-24, parent GP-11, and sibling tickets GP-22, GP-23, GP-25, GP-26, GP-27 and GP-220 were read after the Atlassian connection became available. GP-24 requires the filter dropdown, applying its selected option to Supabase, resetting pagination on filter changes, and displaying records according to the selected filter. GP-11 confirms completed appointments and six records per page. Neither specifies date direction or a different job-count definition; the choices above document the implementation.

| Element | Ticket ownership | GP-24 handling |
| --- | --- | --- |
| Filter dropdown / Supabase filter / pagination reset | [GP-24](https://nikkocastillo.atlassian.net/browse/GP-24) | Implemented and fixture tested |
| Contains search input and search query | [GP-25](https://nikkocastillo.atlassian.net/browse/GP-25) | Outside GP-24; deliberately left unimplemented |
| Table and its loading/error/empty/responsive behavior | [GP-22](https://nikkocastillo.atlassian.net/browse/GP-22) | Existing uncommitted integration retained and tested |
| Pagination controls and page queries | [GP-23](https://nikkocastillo.atlassian.net/browse/GP-23) | Existing uncommitted integration retained; filter reset verified |
| Edit Appointments button and destination | [GP-26](https://nikkocastillo.atlassian.net/browse/GP-26) | Separate dependency; no navigation implemented |
| Admin authorization and restricted data access | [GP-27](https://nikkocastillo.atlassian.net/browse/GP-27) | Separate dependency; no production route or auth changes |
| Overall page structure and heading | [GP-220](https://nikkocastillo.atlassian.net/browse/GP-220) | Supplied heading corrected at existing page integration point |

Figma is connected, but the file URL/key has not been provided or found in the repository or tickets. The node identifier 201:245 alone does not identify a file. Desktop and mobile nodes remain uninspected pending that locator; no claim of Figma fidelity is made.

## Local preview

```powershell
Set-Location C:\Users\mkghu\Documents\GloPortal
npm install
npm run preview:appointments
```

Open http://127.0.0.1:4174/__gp24/ . The banner and records explicitly identify synthetic fixtures. Use `?state=loading`, `?state=error` or `?state=empty` to inspect those states. This separate Vite server binds only to localhost. Its virtual entry leaves App.jsx, the homepage, production routing and authentication unchanged, and creates no temporary preview HTML/JS files. The retained scripts are a reproducible test harness.

`npm run preview:appointments -- --live` uses the existing Supabase environment and local Supabase session instead of fixtures. This requires the migration and an authorized authenticated session. The preview provides no login mechanism and does not bypass RLS. A customer session can only read its own records; an administrator is required to inspect all customers' records under the existing policies.

## Verification

```powershell
npx playwright install chromium
npm run test:appointments
npx eslint src/components/viewAppointments/AppointmentFilters.jsx src/components/viewAppointments/AppointmentTable.jsx src/components/viewAppointments/AppointmentPagination.jsx src/pages/ViewAppointments.jsx scripts/*.mjs tests/*.mjs playwright.config.mjs eslint.config.js
npm run build
git diff --check
```

The browser suite covers all five sorts, query ordering, displayed records, pagination boundaries/reset, matching and nonmatching dates, clearing the date, loading/error/empty states and viewport containment at 1280px, 768px and 390px. These are fixture tests through the actual React components and Supabase client against a local simulated REST endpoint, not live-data verification. Screenshots are written under ignored `test-results/` for visual inspection.

The repository's existing package-lock.json was malformed before this work (including a missing closing object before the nested content-type entry). npm regenerated it while adding Playwright. The build retains the existing large-chunk warning. npm audit reports seven high-severity findings in the existing shadcn tooling dependency chain; unrelated dependency upgrades were not attempted.

## Database and remaining dependencies

`20261016065500_create_appointment_filter_records_view.sql` was compared with the checked-in core schema and RLS migration. Referenced columns, joins, completed status and grants align with those files. The view uses `security_invoker` and explicitly limits grants to authenticated SELECT, so underlying RLS remains in force. No database was modified or migration applied, including locally.

A read-only zero-row request to the configured Supabase view failed to connect. The actual deployed schema, presence of the view, SQL execution, authenticated RLS behavior, Pacific-date derivation and live counts/order remain unverified. Applying the migration requires separate authorization. Live verification remains blocked by that dependency and reachable authenticated Supabase access.

Before release: inspect desktop/mobile Figma once its file URL is supplied, authorize and validate the migration against the actual schema, then verify real data with the appropriate role. The parent story's search, edit-navigation and authorization requirements remain dependencies on GP-25, GP-26 and GP-27 respectively. No production route was added; protected-route integration remains separate. Jira GP-24 remains In Progress; no Jira issue was edited.
