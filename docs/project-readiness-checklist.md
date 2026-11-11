# CockpitIQ project readiness checklist

This checklist reflects the supplied SRS and IA-3 project files against the current workspace. **Implemented** means the local source contains the feature; it does not mean the feature passed a live browser or accessibility audit.

## Functional requirements

- [x] **FR-01 Landing page:** project introduction, navigation, theme control, feature sections, and calls to action are present.
- [x] **FR-02 Registration and validation:** required fields, regex checks on blur and submit, inline messages, invalid styling, and submit gating are present.
- [x] **FR-03 Sign-up:** email/password account form and Terms consent are present. Supabase must be configured before an account can actually be created.
- [x] **FR-04 Sign-in:** email/password form, client-side format feedback, and password show/hide control are present. Supabase must be configured before sign-in works.
- [x] **FR-05 Dashboard:** mobile single-column layout and navigation drawer, with desktop three-column grid, are implemented in CSS.
- [x] **FR-06 Help assistant:** floating panel, message log, FAQ buttons, keyword matching, auto-scroll, and local chat persistence are present. It returns fixed answers and works offline.
- [x] **FR-07 Theme:** shared CSS custom properties drive light/dark colors and the preference persists in local storage.
- [x] **FR-08 Calculator:** the replacement calculator is present and counted as accepted per the user's instruction.
- [x] **Test history:** signed-in users can save test outcomes/scores, page through their own history, and delete one or all of their attempts. In-progress checklists and ordinary practice runs are not saved.
- [x] **Privacy/security groundwork:** privacy and terms pages, RLS schema, and API documentation are present.
- [x] **Live backend connection:** the Supabase project URL and publishable key are set in `js/supabase-config.js`; the user reports that Supabase is working.
- [ ] **Backend privacy/history verification:** record checks for email confirmation, sign-in/sign-out, saving a result, history pagination, deleting records, and keeping two accounts' records separate.

## Standards and evidence

- [x] **WCAG references:** the normative WCAG 2.1 standard and Quick Reference are linked in `docs/accessibility/WCAG-2.1-AA.md`.
- [x] **Preliminary contrast check:** representative theme-token text/surface pairs meet 4.5:1; see the ratio table in the accessibility record.
- [ ] **WCAG 2.1 AA conformance:** keyboard-only, screen-reader, reflow/text resizing, all component states, and complete contrast checks are still pending. No conformance claim is made.
- [ ] **Performance:** SRS initial-load target under 2 seconds and Lighthouse Performance 90+ have not been measured.
- [ ] **Browser support:** Chrome 110+, Safari 16+, Firefox 112+, and Edge 110+ have not been verified in their target versions.
- [ ] **Security/runtime audit:** live Auth/RLS behavior, production CORS, console/network errors, and production HTTPS have not been verified.

## Aircraft profile

- [x] The profile is explicitly marked **generic and unverified** in the interface and in `js/procedures.js`.
- [x] Classroom reference values are mapped to pages in a Cessna 172S POH/AFM copy in `docs/aircraft-profile-verification.md` and `js/procedures.js`.
- [x] The project clearly says this old reference copy is not verified for any real airplane. A flight instructor is not required for the Web Technology course demo.
- [x] The profile is not claimed as verified for a particular airplane; real-aircraft verification is outside this software project's scope.

## Submission deliverables

- [ ] Prepare the 20+ page A4 report using the required sequence and formatting. Add actual test results, screenshots, references, source appendices, and deployment evidence; do not present pending checks as passing.
- [ ] Complete the bonafide certificate, declaration/IPR acknowledgment, and faculty/student signatures.
- [ ] Capture the required desktop/mobile, themes, calculator, validation, chatbot, repository, and live-site screenshots; record the actual repository and deployment URLs.
- [ ] Prepare and deliver the presentation/video and complete the course submission/hard-copy steps.

The user has directed that the one-student project requirement be treated as intentional and that chatbot placement not be treated as a defect. The proposal is not used as the current acceptance baseline.
