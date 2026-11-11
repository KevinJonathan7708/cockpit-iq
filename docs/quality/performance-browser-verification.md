# Performance and browser verification

## SRS targets

- Initial load: under 2.0 seconds. Before marking this passed, record the exact measure used for “initial load” and the device, network, cache, and test conditions.
- Lighthouse Performance: at least 90.
- Browser support: Chrome 110+, Safari 16+, Firefox 112+, and Edge 110+.

## Status

**Not measured.** The current source has not been tested in deployed production browsers or audited with Lighthouse as part of this change. Do not treat code changes or this checklist as proof that the targets pass.

## Pages and states to measure

| Route / state | Lighthouse score | Initial-load measure | Browser matrix | Notes |
| --- | --- | --- | --- | --- |
| `index.html` | Pending | Pending | Pending | |
| `register.html` | Pending | Pending | Pending | |
| `signup.html` | Pending | Pending | Pending | |
| `signin.html` | Pending | Pending | Pending | |
| `home.html` | Pending | Pending | Pending | Include drawer and both responsive layouts |
| `trainer.html?procedure=takeoff` | Pending | Pending | Pending | Include cockpit image and controls |
| `trainer.html?procedure=landing&mode=test` | Pending | Pending | Pending | Include test panel and result dialog |

## Test record template

For each run, record date, URL, browser and version, operating system, device/CPU, viewport, network and throttling, cold/warm cache, Lighthouse version, score, chosen load metric, result, and evidence file. Repeat lab runs and report the run values and median; do not hide a failing run.

Check at least the SRS minimum browser versions where available and current stable versions. Exercise navigation, all form flows, theme persistence, calculator, dashboard drawer, hotspots, controls, checklist progression/restart, test mode, and dialogs. Include touch-sized screens and widths around the 760/768px layout breakpoint.
