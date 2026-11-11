# CockpitIQ account and test-history API contract

## Base services

The front end calls Supabase Auth and the Supabase PostgREST API through `@supabase/supabase-js`. Replace `<project-ref>` with the project reference configured in `js/supabase-config.js` when tracing requests. All account and table calls require HTTPS in the deployed site. Database access uses the browser-safe publishable/anon key plus the signed-in user's session; Row Level Security remains the access boundary.

## Authentication

| User action | SDK operation | Data sent |
| --- | --- | --- |
| Create account | `auth.signUp` | Email, password, `display_name` metadata; confirmation redirects to `signin.html?verified=1` |
| Sign in | `auth.signInWithPassword` | Email and password |
| Sign out | `auth.signOut` | Current user session |
| Check current user | `auth.getSession` | Current browser session token |

The full Register form validates employee/register ID, mobile number, and division for its course requirement, but sends none of those fields to Supabase.

## Display name

The sign-up form sends the display name as Supabase Auth user metadata. The dashboard reads it from the signed-in session. There is no separate profile table.

## Test-attempt table

Table: `public.test_attempts`

| Operation | Request/data | Result |
| --- | --- | --- |
| Save a result | Insert `procedure`, `outcome`, `correct_steps`, `total_steps`, `mistakes`, `duration_seconds` | `user_id` comes from `auth.uid()`; `score_percent` is generated; `completed_at` defaults to database time |
| List history | Select a page of 30 rows ordered by `completed_at` and `id` descending, using an offset range | Returns procedure, outcome, step counts, score, mistakes, duration, and date; the dashboard can load older pages |
| Delete one result | Delete by attempt UUID | RLS restricts the delete to the authenticated owner's row |
| Delete all results | Delete rows where `user_id` is not null | RLS restricts the effective deletion to the authenticated owner's rows |

Allowed values and numeric bounds are enforced by database checks in `supabase/schema.sql`. Results are append-only from the client except for deletion; client updates are not granted.

Account removal is handled by the project owner in Supabase. The browser never receives an administrative key.

## Verification status

The API contract and implementation are present, but no live project is configured in this workspace. Apply the SQL, configure redirect settings, then complete the two-account isolation and history-deletion checks in [the setup guide](supabase-setup.md) before reporting production readiness.
