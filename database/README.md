# Database

Apply the migration in `migrations/001_initial_schema.sql` to a Supabase project using the Supabase SQL Editor or Supabase CLI.

Use Supabase Auth for identities. The profiles table uses the same UUID as `auth.users`.

Never apply the migration to a live system before reviewing RLS and roles.
