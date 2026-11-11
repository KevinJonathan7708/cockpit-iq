# WCAG 2.1 Level AA review

## Standard references

- Normative standard: [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/TR/WCAG21/)
- Author checklist: [How to Meet WCAG 2.1 (Quick Reference)](https://www.w3.org/WAI/WCAG21/quickref/)
- WCAG applies to each complete page and its responsive variations. This document is a work record, not a conformance claim.

## Review status

**Status: implementation work started; manual and assistive-technology audits are pending.** No WCAG 2.1 AA conformance is claimed by this project yet.

| Page / state | Automated audit | Keyboard review | Screen-reader review | Contrast / reflow | Result |
| --- | --- | --- | --- | --- | --- |
| `index.html`, light and dark | Pending | Pending | Pending | Pending | Not verified |
| `register.html`, light and dark | Pending | Pending | Pending | Pending | Not verified |
| `signup.html`, light and dark | Pending | Pending | Pending | Pending | Not verified |
| `signin.html`, light and dark | Pending | Pending | Pending | Pending | Not verified |
| `home.html`, light and dark; mobile drawer | Pending | Pending | Pending | Pending | Not verified |
| `trainer.html`, light and dark; checklist and test dialog | Pending | Pending | Pending | Pending | Not verified |

## Required checks

- [ ] Check all applicable Level A and AA criteria in the Quick Reference for every page and responsive state.
- [ ] Confirm normal text contrast is at least 4.5:1 and large text contrast is at least 3:1 in both themes.
- [ ] Confirm non-text controls, boundaries, and focus indicators meet the applicable contrast requirement.
- [ ] Operate every feature using keyboard only; confirm logical order, visible focus, no keyboard trap, and sensible focus return after closing panels and dialogs.
- [ ] Associate each form input with its label, instructions, and error message; verify invalid state and errors are conveyed to assistive technology.
- [ ] Check accessible names, roles, and states for theme and navigation toggles, calculator controls, chatbot, cockpit hotspots, dynamically created controls, and dialogs.
- [ ] Check headings, landmarks, image text alternatives, meaningful reading order, status updates, and error feedback with a screen reader.
- [ ] Check 200% text resizing, 320 CSS-pixel reflow, portrait and landscape, text spacing, and content on hover/focus.
- [ ] Run automated checks and manually review their results; automated results alone do not establish conformance.
- [ ] Record auditor, date, browser/assistive technology versions, viewport/theme, findings, fixes, and retest results below or in a linked report.

## Preliminary token contrast calculation

The following calculations use the current CSS token values and representative text/background pairs. They meet the 4.5:1 normal-text ratio for these pairs only; they do not replace checking every rendered component, state, image, and focus indicator.

| Pair | Dark theme | Light theme | Result for this pair |
| --- | ---: | ---: | --- |
| Main text on page background | 14.92:1 | 14.70:1 | Pass |
| Muted text on surface | 9.28:1 | 8.02:1 | Pass |
| Success text on surface | 10.89:1 | 6.85:1 | Pass |
| Error text on surface | 9.79:1 | 7.19:1 | Pass |
| Focus color on surface | 10.22:1 | 7.76:1 | Pass |
| White text on accent fill | 9.86:1 | 9.86:1 | Pass |

Calculation scope: CSS color tokens in `css/styles.css`, using the WCAG relative-luminance contrast formula. Disabled controls, colored backgrounds, cockpit markers over the photograph, non-text contrast, and all component-specific combinations still need manual verification.

## Implementation notes

- Shared light/dark color values are defined as CSS custom properties in `css/styles.css`; theme state is set on the root element.
- Muted text, status colors, borders, and focus colors must still be checked against each surface with a contrast measurement.
- The form validation script connects error text to fields through `aria-describedby` and sets `aria-invalid`.
- Pages include keyboard-reachable skip links. Invalid form submission moves focus to the first invalid field; closing the cockpit control panel or help panel returns focus to its opener.
- The theme button announces the theme it will switch to. Calculator sections and chatbot controls have accessible group names and explicit button types.
- This record must remain marked “not verified” until all applicable checks above have evidence.
