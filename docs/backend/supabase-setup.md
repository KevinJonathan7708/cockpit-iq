# Supabase account and test-history setup

## Data stored

- Supabase Auth stores the account email and password credential.
- Supabase Auth stores the display name with the user's account metadata.
- `test_attempts` stores procedure, result, correct steps/total steps, score percent, mistakes, elapsed seconds, and completion time.
- The app does not send employee/register IDs, mobile numbers, division, aircraft identifiers, or chatbot conversations to Supabase.
- A user can read and delete only their own test-attempt rows. Attempt rows are append-only except for deletion. Supabase Auth sessions persist in the browser so the user can sign in again.

## Configure the project

1. Create a Supabase project. Do not add a service-role key to the website.
2. In the Supabase SQL Editor, run `supabase/schema.sql`.
3. In **Authentication → URL Configuration**, set the local development URL (for example `http://localhost:8000`) and add `http://localhost:8000/signin.html` to allowed redirect URLs. Add `https://cockpit-iq.vercel.app` as the deployed site URL and `https://cockpit-iq.vercel.app/signin.html` as an allowed redirect after confirming that is the final deployment domain.
4. In **Authentication → Providers → Email**, keep email/password sign-in enabled. Configure confirmation email delivery and test it before sharing the site.
5. Put the project URL and the browser-safe publishable/anon key in `js/supabase-config.js`. Never put a service-role/secret key in this file or in browser code.
6. Serve the folder over `http://localhost` for local use. Account requests do not work when the project is opened directly as `file://` or when the backend is unconfigured.

The SQL enables Row Level Security on the test table, grants only the required client operations, and ties every attempt to `auth.uid()`. Do not disable RLS to make a query work. The browser key is public by design; RLS is what protects user data.

Official reference: [Supabase JavaScript client setup](https://supabase.com/docs/reference/javascript/installing).

## App behavior

- Sign up creates an account with a display name. When email confirmation is enabled, the page asks the user to confirm before signing in.
- The full Register form validates the course fields, but only full name, email, and password are sent to Supabase. Employee ID, mobile number, and division are not stored.
- A completed or failed test is saved only when the user is signed in. A signed-out user can still use the trainer, but the result is not stored.
- The dashboard pages through the signed-in user's full attempt history in groups of 30 and supports deleting one attempt or all of that user's attempt history.
- The result score is completed checklist steps divided by total steps. Mistakes and elapsed time are stored separately.

## Setup and verification still needed from the project owner

- Provide the project URL and publishable/anon key after creating the Supabase project.
- Run `supabase/schema.sql` in that project and confirm the email confirmation redirect settings.
- Exercise sign-up, email confirmation, sign-in, sign-out, one saved attempt, history loading, single-row deletion, and delete-all with two test accounts to verify isolation.
- Account removal is handled by the project owner in Supabase. Do not give the browser an administrative key.
- The Supabase URL and publishable key are now present in the local config, and the user reports that the connection works. Keep a record of the remaining manual checks above, especially two-account data isolation, before claiming the full privacy behavior has been verified.
