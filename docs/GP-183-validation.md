# GP-183: Recent Activity validation

## Scope

Reuse the existing RecentActivity component and DashboardCard appearance.
The existing component already displays activity descriptions, appointment and
vehicle details supplied in title, optional timestamps, and the empty-state
message: "No recent activity to show."

The only application change adds the Tailwind utility [overflow-wrap:anywhere]
to the activity list. Browser tests reproduced clipped long unbroken identifiers
before this change and confirm they wrap afterward. Card colors, typography,
spacing, layout, and the className prop are preserved.

The input contract remains { id, title, timestamp }. timestamp is optional and
its supplied text is displayed unchanged. Descriptions and relevant vehicle
information remain in title; no additional fields are required.

## Data availability

CustomerPortal still supplies the existing mockCustomerDashboardData examples.
The committed mock data, customer dashboard, shared card, authentication, and
Supabase code are unchanged. This work does not connect Recent Activity to real
customer records or generate activities when a booking or vehicle is saved.
Live activity integration remains future work.

## Validation results

- Focused ESLint: passed.
- Production build: passed.
- Playwright: 32 tests passed at 320, 390, 768, and 1280 pixels.
- Mixed, appointment-only, and vehicle-only activities: passed.
- Empty arrays, omitted activity data, and null activity data: passed.
- Present, missing, and partially missing timestamps: passed.
- Long descriptions, vehicle identifiers, and ISO timestamps: passed.
- Card appearance, desktop/mobile layout, and horizontal overflow: passed.
- Existing loading, signed-out, denied, admin, and customer access states: passed.
- Default mobile/desktop and long-text screenshots reviewed.

Run these commands from the GP-183 worktree:

```powershell
.\node_modules\.bin\eslint.cmd --no-cache src/components/dashboard/RecentActivity.jsx scripts/preview-recent-activity.mjs tests/recent-activity.mjs tests/recent-activity.playwright.config.mjs
.\node_modules\.bin\playwright.cmd test --config tests/recent-activity.playwright.config.mjs
npm run build
```

Test artifacts are written under ignored test-results/gp183.
Stop any manually running preview before running the browser suite because both
use port 4193.

## Local preview

```powershell
node scripts/preview-recent-activity.mjs
```

Open http://127.0.0.1:4193/customerportal and scroll to Recent Activity.
The default preview uses the existing mixed mock activities. Add an activity
query parameter to inspect individual scenarios:

- ?activity=appointments
- ?activity=vehicles
- ?activity=empty
- ?activity=missing
- ?activity=null
- ?activity=no-timestamps
- ?activity=partial-timestamps
- ?activity=long

Scenario changes apply only to the module served by this local preview; they do
not modify the committed mock file. The preview disables environment-file
loading, substitutes simulated service responses, disables sign-in/sign-up and
email submission, and restricts external connections. Browser tests also block
and fail on external requests. No production Supabase requests are required.

Only existing locked dependencies are used; dependency manifests are unchanged.
