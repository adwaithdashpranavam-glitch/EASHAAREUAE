# Appointment Check Companion

A privacy-friendly, installable assistant for **manually** checking appointment availability. It provides a countdown, a preparation checklist, reminders, and a local attempt log.

> **Manual-use assistant only.** No automated booking, no CAPTCHA solving, no bot actions. Users must complete all searches and bookings on the official site.

## Run

The service worker requires HTTP rather than a `file://` URL:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Test

```bash
npm test
```

No third-party packages are required; tests use Node's built-in test runner.
