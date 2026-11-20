# GP-64: Database-backed admin dashboard summaries

Depends on GP-262 being merged into `develop` first. No new npm dependencies or
environment variables. Reuses the shared Supabase client.

## Setup

Apply `supabase/migrations/20261113170000_admin_dashboard_summary.sql` after the
earlier migrations. It creates `public.inventory` and the summary RPC. Apply once
through the team's migration process, or execute the file once in the Supabase
SQL Editor as an authorized maintainer. Do not rerun all old migrations in an
existing database. If an inventory table already exists outside this source
snapshot, compare its schema first; do not drop it to make this migration pass.

Inventory columns: `id` UUID, unique nonblank `name`, nonnegative integer
`quantity`, optional `last_restock` DATE and `supplier_url` TEXT. No seeded records
and no frontend write grants. Authorized maintainers can enter actual stock in
the database; the inventory management UI remains a separate feature.

## Summary definitions

| Field | Meaning |
| --- | --- |
| Today's appointments | Confirmed/completed starts on today's Salinas calendar date; earliest two shown, full count retained |
| Customers | All profiles with role `customer`, excluding admins |
| Registered vehicles | All stored vehicles; schema has no active flag |
| Lowest stock | Two lowest quantities, including zero; names break ties |
| Active services | Services with `active = true` |
| Most popular service | Most completed appointments across all history; service name breaks ties; no jobs means no result |
| Pending requests | All appointments with `status = 'pending'`, including requests still pending from earlier dates |

The server computes local midnight boundaries separately in America/Los_Angeles,
so daylight-saving days are handled without assuming a 24-hour day. Counts and
popularity run inside PostgreSQL rather than downloading rows subject to a REST
row cap. The UI formats appointment times in the same timezone.

## Access and refresh

The RPC is SECURITY INVOKER with an empty search path, explicitly checks the
existing private admin role function and respects existing table RLS. Guests
have no EXECUTE grant. Customers receive insufficient privilege, not their own
partial data mislabeled as shop totals. Inventory SELECT is admin-only under RLS.

The page checks the authenticated user before requesting the summary. Protected
data is hidden while loading, after denial, on error and immediately on sign-out
or account change. Earlier responses cannot overwrite newer requests or an
unmounted page. Data loads on page open, session changes and Refresh dashboard;
this is not a real-time subscription. Errors provide a retry button and never
substitute fake zero counts. Successful empty results have specific empty states.

This change preserves the merged admin role check and menu. It adds the database
authorization needed to safely display the summary. The five dashboard actions
already navigate to registered pages in this `develop` snapshot; several target
pages are still placeholders and are outside GP-64.

## Checks

```sh
node --test tests/admin-dashboard.test.mjs
npx playwright test --config playwright.admin-dashboard.config.mjs
```

Browser tests use isolated synthetic data at 320, 390, 768 and 1440 pixels. They
cover all five cards, time formatting, loading/empty/error/retry states, guest and
customer redirects, sign-out, dashboard navigation and responsive layout. The normal
`npm run dev` app always uses the real Supabase client; fixture code is confined
to the preview script.

For database integration, use a **clean disposable local** Supabase database
after migrations, then run:

```sh
psql "$LOCAL_DATABASE_URL" -v ON_ERROR_STOP=1 -f tests/admin-dashboard.sql
```

This transactional script rolls back its synthetic fixtures and checks counts
above 1,000, date/status filtering, preview limits, popularity, inventory order,
customer RLS, guest grants and DST boundaries. It assumes a clean local database
and is not intended for the shared production database.

Finally test `/adminportal` against the shared Supabase project as an admin,
customer and guest after deployment of the migration. Check real counts against
the table editor, and verify errors/recovery by temporarily disconnecting the
network. The SQL migration is not applied by the existing Cloudflare workflow.

## Preparation-environment results

- 39 Node tests passed: 10 new dashboard tests plus 29 existing signup checks.
- Populated, empty and loading components rendered successfully using React's
  server renderer. The isolated dashboard, hook, assets and generated Tailwind
  CSS compiled successfully with cached Vite/React tooling.
- Exact project `npm ci` was blocked by registry HTTP 403. A full project build
  and lint run with its locked dependencies could not be completed here.
- Chromium installation was also blocked by HTTP 403, so the included responsive
  browser suite has not run here. The isolated build is not visual browser QA.
- PostgreSQL/Supabase was unavailable locally; the transactional SQL integration
  checks are included but have not run here. No shared database was changed.
