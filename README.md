# CallBack AI

A premium, responsive product concept for missed-call recovery. Built with plain HTML, CSS, and JavaScript, with no runtime dependencies, build step, external fonts, or remote assets.

**GitHub Pages:** https://mayorzb.github.io/missed-call-demo/

## Run locally

From `/workspace`, run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open the `/missed-call-demo/` path on that server. Alternatively, serve the repository directory with any static server. All asset paths are relative, preserving GitHub Pages project-site compatibility. No deployment or Pages settings changes are required.

## Explore the demo

1. Customize the business name, quote link, reply template, and caller number. `{business}` and `{link}` personalize the SMS.
2. Select **Simulate missed call**. The call appears immediately; a simulated SMS appears after two seconds.
3. Select **Simulate customer reply** to recover that lead. Each call can recover one lead.
4. Watch session totals and the newest 20 activity entries. Totals include all calls in the session, even after older entries leave the log.
5. Change missed calls per week, reply rate, and average job value to explore monthly opportunity.

All calls, SMS delivery, replies, and leads are simulated. No AI model, telephony service, analytics, backend, or storage is connected. Data exists only in memory and clears on refresh. Preview quote links open the user-entered HTTP(S) destination in a separate tab; other protocols are displayed as text. Input is rendered as text, never HTML.

Monthly opportunity = calls per week × reply rate × average job value × 4.33. It assumes every reply becomes a job and excludes costs; it is an illustration, not a forecast or guarantee. Dashboard lead value = simulated replies × current average job value.

## Browser validation

Node.js, Chromium, and the optional Playwright test tool are needed for tests only. Install Playwright outside the checkout:

```sh
npm install --prefix /tmp/callback-validation playwright --no-audit --no-fund
NODE_PATH=/tmp/callback-validation/node_modules node tests/smoke.cjs
```

Start the static server from `/workspace` first. Override `CALLBACK_TEST_URL` for another server or `CHROMIUM_PATH` for another Chromium installation. The suite tests the complete call/SMS/reply flow, metrics, calculator limits, unsafe input rendering, 20-entry retention, refresh behavior, keyboard skip link, anchor targets, reduced motion, and overflow at 320, 375, 390, 430, 768, and 1440 pixels. Screenshots are written to `/tmp/callback-desktop.png` and `/tmp/callback-mobile.png`. The cap check accelerates the two-second timer only after testing the normal delay.

No framework or production dependency installation is required.
