# CockpitIQ

CockpitIQ is a static Cessna 172S checklist trainer. It has a home page, separate navigation to the takeoff and landing procedures, and a cockpit explorer. No server or build step is required for local use.

## Open it

Double-click `index.html` or open it in a browser. Choose an activity. The procedure pages are normal links to `trainer.html` with a selected procedure, so browser back returns to the home page.

You can also serve the folder during development with `python -m http.server 8000` and open <http://localhost:8000>.

## Use the trainer

- Choose Takeoff, Landing, or Cockpit Explorer on the start screen.
- Open the checklist with **Open checklist**. On desktop, hover the kneeboard to preview it or use the button to pin it open.
- Select cockpit markers to identify controls. Use **Labels** on touch devices to show marker names before selecting one.
- Hover notifications are temporary. Clicking a simulated control opens a separate control panel that stays available while you move across the cockpit.
- Throttle and simulated airspeed use sliders. Flaps use 0°, 10°, 20°, and 30° detents. Mixture, trim, lights, transponder, and parking brake have direct controls.
- Use **Restart** to reset the active procedure. Navigating to another page starts a fresh run. Only the theme preference is saved in this browser.

## Training profile

The profile values live in `data/procedures.js`. Edit that file to change the aircraft label, reference targets, flap settings, or checklist steps. The generic profile has no aircraft serial number, equipment list, or approved POH/AFM revision attached. Add those details and have an instructor review the profile before using it for a specific aircraft.

The airspeed slider is a user-set training indication. It does not model aircraft aerodynamics, engine performance, or flight dynamics. Procedures are abbreviated educational sequences, not aircraft checklists. Always use the aircraft's approved POH/AFM and instructor guidance.

## Assets

`data/cockpit.jpg` is the cockpit image mapped to the hotspots. Before distributing the app, record the image source and license here.
