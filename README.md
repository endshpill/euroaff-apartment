# EuroAFF Apartment

A minimal black and white booking app for the EuroAFF company apartment.

## GitHub Pages website

The prebuilt website is in `docs/`. In this repository, open **Settings → Pages**, choose **Deploy from a branch**, then **main** and **/docs**, and save.

GitHub will show the website URL after publishing. Private-repository Pages requires a GitHub plan that supports it.

The website uses the existing booking service to keep everyone’s reservations synchronized. It has a shared password screen; colleagues do not need ChatGPT accounts. The browser address remains on GitHub Pages.

## Features

- Shared monthly calendar and list view with visible check-out days
- Two independently bookable rooms with room selection
- Colleague names, dates, notes, and personal cancellations
- Atomic double-booking prevention per room; same-day arrival and departure supported
- Wi-Fi information with reveal/copy controls
- Shared password, signed sessions, and login attempt limits
- Responsive EuroAFF design

## Source and build

React, TypeScript, Vite/Vinext, Cloudflare Workers, D1, and Drizzle. Node.js 22.13+ and pnpm are required.

```sh
pnpm install --frozen-lockfile
pnpm run build:pages
```

Commit the regenerated `docs/` directory after frontend changes. GitHub Pages serves this directory directly.

The full-stack service is under `app/`, `db/`, and `worker/`. Its normal build is `pnpm run build`. The GitHub Pages entry point is `github-pages/main.tsx`; `vite.pages.config.ts` sets the repository base path.

## Backend and access

GitHub Pages serves static files; the booking API and database run separately on the existing hosted service. The backend permits cross-origin requests only from `https://endshpill.github.io`. Bookings and Wi-Fi details require a valid signed access token. The website keeps its signed identity in the browser so guests can manage their own bookings on that browser.

Changing the shared password invalidates existing access sessions. People using another browser or clearing browser storage receive a new guest identity.

The original hosted app can still use secure HTTP-only session cookies. ChatGPT identity headers are trusted only behind the existing Sites platform. An independent backend migration must replace that platform-dependent identity handling.

## Secrets

Production secrets are configured on the backend, never in GitHub:

- `APARTMENT_ACCESS_PASSWORD`: shared apartment password
- `APARTMENT_SESSION_SECRET`: random key for signed sessions
- `APARTMENT_WIFI`: JSON array of objects containing `label`, `name`, and `password`

The database, real Wi-Fi credentials, shared password, runtime state, and access tokens are excluded from this repository. `.env.example` documents the keys without values.

Uploading code does not automatically redeploy the backend. Frontend assets are published through Pages after Pages is enabled; backend changes must be deployed to the existing service separately.

## Rooms and check-out dates

Room 1 and Room 2 can be booked independently for the same dates. A room is reserved for nights from check-in up to, but excluding, check-out. Check-out days are still shown with an Out marker so the full visit is visible. Another guest may arrive in that room on its check-out day. Existing reservations created before two-room support are preserved and assigned to Room 1.

## Booking ownership

Colleagues use the shared apartment password and their full name. The normalized login name has a stable, signed identity across browsers. Legacy bookings reconnect by their recorded guest name or an existing signed identity. This is a trusted team calendar, not individually verified accounts: someone who knows the shared password can enter another colleague’s name. Bookings already assigned to a stable identity are not reassigned by changing a booking’s guest name.
