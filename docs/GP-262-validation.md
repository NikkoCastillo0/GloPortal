# GP-262: Admin dashboard layout

- Route: `/adminportal` (already registered in `src/App.jsx`).
- References: desktop Figma export page 27, mobile export page 8, styling guide.
- Five overview cards; two columns on desktop, one on mobile; centered request
  card on desktop and three-count strip on mobile.
- Uses Inter, existing header/logo, project greys and Tailwind utilities.
- Dashes represent information not loaded. No sample customer/shop data is used.
- The database has no vehicle activity field, so the label is Registered Vehicles.
- Buttons are disabled layout elements. GP-10 owns destinations and navigation;
  GP-8/GP-9 own login routing and general admin route protection.
- GP-64 supplies database summaries, protected data access and request states.

## Review

Open `/adminportal` at 390px, 768px and desktop width. Check all five headings,
readable wrapping, no horizontal overflow, single/two-column layout and disabled
action buttons. No database setup is needed for this layout-only change.

Automated layout check: `npx playwright test --config playwright.admin-dashboard.config.mjs`.
Install Chromium once with `npx playwright install chromium` if necessary.
