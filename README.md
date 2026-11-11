# CockpitIQ

CockpitIQ is a browser-based checklist trainer with takeoff and landing practice, a cockpit explorer, calculators, account registration, and saved test history when its Supabase backend is configured. The front end has no build step; account features require the hosted Supabase service.

## Open it

For local account features, serve the folder over HTTP with `python -m http.server 8000` and open <http://localhost:8000>. The basic trainer can also be opened from `index.html`, but `file://` does not support Supabase account requests.

## Use the trainer

- Choose Takeoff, Landing, or Cockpit Explorer on the start screen.
- Open the checklist with **Open checklist**. On desktop, hover the kneeboard to preview it or use the button to pin it open.
- Select cockpit markers to identify controls. Use **Labels** on touch devices to show marker names before selecting one.
- Hover notifications are temporary. Clicking a simulated control opens a separate control panel that stays available while you move across the cockpit.
- Throttle and simulated airspeed use sliders. Flaps use 0°, 10°, 20°, and 30° detents. Mixture, trim, lights, transponder, and parking brake have direct controls.
- Use **Restart** to reset the active procedure. Navigating to another page starts a fresh run. The theme and chatbot conversation stay in this browser. Test attempts are saved only for signed-in users after Supabase is configured.

## Accounts and saved test history

The app uses Supabase Auth and the SQL schema in `supabase/schema.sql`. Follow [the setup guide](docs/backend/supabase-setup.md) to create the project, apply Row Level Security policies, and set sign-in redirect URLs. The [API contract](docs/backend/data-api.md) describes the requests and stored fields. Enter only the project URL and browser-safe publishable/anon key in `js/supabase-config.js`; never put a service-role key in the front end. A signed-in user can page through and delete only their own test attempts. The dashboard records procedure, outcome, completed/total steps, score percentage, mistakes, duration, and completion time.

The chatbot searches a short list of built-in help topics using keywords. It works offline and keeps the last 50 question-and-answer pairs in this browser. Clear the conversation with **Clear chat**.

## Theme colors

Shared colors are CSS custom properties in `css/styles.css`: the default values are in `:root`, and the light palette overrides them under `:root[data-theme="light"]`. Change a token there to update that color across the site. `js/theme-init.js` applies the saved theme before the stylesheet paints; `js/theme.js` handles the switch and saves the preference in this browser.

## Training profile

The profile values live in `js/procedures.js`. Edit that file to change the aircraft label, reference targets, flap settings, or checklist steps. The classroom values are mapped to an archived Cessna 172S POH/AFM copy in the aircraft profile record. The copy is old and is not confirmed current or applicable to a real airplane, so the profile remains unverified and must not be used for flight. No flight-instructor review is needed for this coding project.

The airspeed slider is a user-set training indication. It does not model aircraft aerodynamics, engine performance, or flight dynamics. Procedures are abbreviated educational sequences, not aircraft checklists. For real flying, use the aircraft's current approved POH/AFM and qualified flight instruction.

## Verification records

- [Practicum learning map](docs/learning-map.md) shows which course topics appear in each project feature.
- [WCAG 2.1 AA review checklist](docs/accessibility/WCAG-2.1-AA.md) links the normative standard and Quick Reference. Its status remains unverified until manual and assistive-technology checks are recorded.
- [Aircraft profile source record](docs/aircraft-profile-verification.md) maps the classroom example values to a Cessna 172S POH and explains why the profile stays unverified for real aircraft.
- [Performance and browser verification](docs/quality/performance-browser-verification.md) contains the SRS targets and an evidence matrix. Targets are not claimed as passed until measured.

## Assets

`trainer.html` serves `data/cockpit.webp` where supported and falls back to `data/cockpit.jpg`. Both retain the same dimensions for hotspot positioning. Before distributing the app, record the image source and license here.
