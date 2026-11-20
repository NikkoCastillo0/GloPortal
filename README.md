# GloPortal

React/Vite, Tailwind CSS and Supabase application for Garage Glo.

## Local setup

Use Node.js 24 (matching CI), run `npm ci`, and create an untracked `.env.local`:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Run `npm run dev`. Use `npm run build` and `npm run lint` before review.
The existing contact form also uses `VITE_EMAILJS_SERVICE_ID`,
`VITE_EMAILJS_TEMPLATE_ID` and `VITE_EMAILJS_PUBLIC_KEY` when configured.

## Admin overview (GP-262 / GP-64)

The existing `/adminportal` route displays database summaries for administrators.
Apply `supabase/migrations/20261113170000_admin_dashboard_summary.sql` after the
earlier migrations, using the team's established process. An authorized database
maintainer can also execute the file once in Supabase SQL Editor. Review any
existing live inventory schema before applying it; this migration creates
`public.inventory` because the supplied source snapshot has no inventory table.

No new environment variables or frontend credentials are required. Existing
accounts must have `profiles.role = 'admin'` to load the summary. Inventory starts
empty; the migration does not insert sample shop records or give the frontend
write permissions. Authorized maintainers can enter real stock through Supabase.

Data definitions, access rules and validation: [GP-64](docs/GP-64-validation.md).
Dashboard action buttons already link to the registered admin pages. Several of
those pages remain placeholders and must be completed in their own work items.

```sh
node --test tests/admin-dashboard.test.mjs
npx playwright install chromium
npx playwright test --config playwright.admin-dashboard.config.mjs
```

The browser suite uses isolated synthetic fixtures, never the live database.

## Inventory UI

`/viewinventory` links to `/addinventoryitem` and
`/editinventoryitem?id=valve-stem` (or another mock item's ID). The forms use
local sample records. Edits are temporary; submitting a form displays a preview
notice without saving or changing the inventory listing. Cancel returns to the list.

Run `node --test tests/inventory-forms.mjs` for isolated browser checks. The tests
block external requests and use Playwright's Chromium by default. Set
`GP306_BROWSER_CHANNEL=msedge` to use an already installed Microsoft Edge instead.
