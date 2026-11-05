# Supabase Rules

- Use the shared Supabase client from `src/lib/supabase.js`.
- Do not create additional Supabase clients inside components.
- Use the existing environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
- Never expose a Supabase service-role key in frontend code.
- Never commit `.env` or `.env.local` files.
- Always handle loading, success, empty, and error states.
- Check the current user before displaying protected content.
- Respect the project’s role-based access patterns.
- Never bypass Row Level Security.
- Select only the columns required by the page or component.
- Validate user input before inserting or updating records.
- Refresh or update the UI after successful inserts, updates, or deletes.
- Do not change database queries without checking the existing schema and relationships.
