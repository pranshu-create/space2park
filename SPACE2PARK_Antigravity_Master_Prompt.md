# SPACE2PARK: Master Build Prompt for Antigravity

> Save this file in the project root as `SPACE2PARK_PROMPT.md` and start the agent with the kick-off message at the very bottom.

---

## 0. How to work (read first)

You are a senior full-stack engineer and product designer. Build **SPACE2PARK**, an event-aware smart parking marketplace, as a real, runnable product with a clearly separated demo layer.

1. **Plan before coding.** Start in Planning mode. Produce an Implementation Plan and a Task List artifact. Wait for my approval before writing code.
2. **Work in the phases in Section 9.** Finish and verify each phase before the next. After each phase, post a short walkthrough artifact with screenshots from the browser agent.
3. **Never invent facts.** All demo data is synthetic and must be labelled so in the UI. Do not claim real-world impact numbers. Use the line: *"Impact is measured through platform KPIs; final city-level reductions require pilot data."*
4. **Ask me only when blocked.** If something is ambiguous, choose the sensible default, note it in the plan, and continue.
5. **Verify, don't assume.** Run the app, click through every flow with the browser agent, and fix what breaks before reporting done.

---

## 1. Product summary

**Name:** SPACE2PARK. **Tagline:** "Park Smart. Live Events Better." **Secondary line:** "Turn unused spaces into smart, bookable parking."

**Problem:** Large events create a short, intense parking spike that nearby official capacity cannot absorb. Meanwhile, private and commercial spaces (home driveways, shop forecourts, offices, schools, hotels, empty plots) sit idle.

**Solution:** A platform that connects event attendees with verified, temporarily available parking spaces. It estimates event-specific demand, activates and allocates nearby distributed spaces **before** congestion occurs, handles reservations atomically, and tracks occupancy through QR check-in/check-out.

**USP:** Predict event-specific parking demand and dynamically activate and allocate nearby distributed spaces before congestion occurs (proactive, not reactive).

**Purpose:** The first use is a live demo for Smart India Hackathon 2026 judges (Team Syntax Error, PS SIH26205). The second is a later pilot at one venue. So build it production-shaped: migrations, env config, role-based auth, and swappable adapters. Keep the demo features isolated so they can be switched off.

---

## 2. Design source of truth (Google Stitch)

My UI is already designed in **Google Stitch**: https://stitch.withgoogle.com/projects/1731060408748848487

- **Method A (preferred):** Use the **Stitch MCP** if it is connected. List the project's screens and fetch each screen's HTML/CSS and design tokens.
- **Method B (fallback):** If Stitch MCP is not available, look for the exported design in `/design/` (zip contents, HTML files and screenshots) and treat it as the source.
- **If neither is accessible, stop and tell me.** Do not invent a different design.

**Rules for using the design:**
1. First inventory every screen in the Stitch project. Map each to a route and a role in a table (screen name, route, role, components). Show me that table in the plan.
2. Extract design tokens (colours, typography, spacing, radii, shadows, motion feel) into `tailwind.config.js` and a `tokens.css`. Never hardcode ad-hoc colours.
3. Reproduce the design **pixel-faithfully** with reusable React components. Do not "improve" or restyle it.
4. For any required screen the design does not contain (see Section 5), build it **in the same visual language** using the same tokens and components, and list those screens in the plan as "extended screens".
5. Design must be responsive: mobile-first for the Seeker flow, desktop-first for Owner, Host, Admin and Authority dashboards, unless the Stitch design clearly indicates otherwise.
6. Keep every state designed: loading skeletons, empty, error, success, and offline.

---

## 3. Tech stack (fixed, do not substitute)

**Frontend:** React 18, Vite, JavaScript (ES6+), Tailwind CSS, React Router DOM, Context API for global state, Framer Motion, Lucide React.
**Maps:** **Google Maps Platform** (Maps JavaScript API via `@vis.gl/react-google-maps` or the official loader, Places, Geocoding, Routes/Distance Matrix for walking distance). Read the key from `VITE_GOOGLE_MAPS_API_KEY` and the server key from `GOOGLE_MAPS_SERVER_KEY`. If a key is missing, show a friendly setup notice instead of crashing. **Do not use `google.maps.visualization.HeatmapLayer` (deprecated).** Build the heatmap with deck.gl `HeatmapLayer` through `GoogleMapsOverlay`, or a custom canvas/circle overlay.
**Backend:** Node.js, Express.js, JWT with role-based access control (RBAC), Socket.io, Multer, bcrypt, zod (validation), helmet, rate limiting, pino logging.
**Data:** PostgreSQL with PostGIS (primary), Redis (locks, TTL holds, cache, Pub/Sub), file storage behind a `StorageAdapter` (local disk now, S3/GCS later).
**Tooling:** Docker Compose for Postgres+PostGIS and Redis, SQL migrations (node-pg-migrate or Knex), seed script, ESLint, Vitest/Jest and Supertest, Playwright for end-to-end checks.
**Language:** English only for now (but keep all UI strings in one `strings` module so Hindi can be added later).

**Adapters (all swappable via env):**
- `PaymentAdapter`: `simulated` now, Razorpay-ready interface later.
- `NotificationAdapter`: in-app plus console log now; SMS/WhatsApp-ready interface later.
- `StorageAdapter`: local now.
- `MapsAdapter` (server-side distance calls with caching so the demo never burns quota).

---

## 4. Roles and portals

| Role | Purpose |
|---|---|
| **Parking Seeker** | Find events, view AI-ranked parking, book, pay, get QR, navigate, check out, review |
| **Space Owner / Vendor** | List spaces, accept AI-suggested price, manage bookings, scan QR, view earnings |
| **Event Host** | Create events, view Hybrid Demand Estimator output, track bookings and footfall |
| **Admin / Authority** | Approve events and listings, risk alerts, utilisation and congestion KPIs |

Demo logins (seeded, shown on the login page behind a "Demo accounts" panel): one per role, plus a few extra seekers and owners.

---

## 5. Features and screens (build all)

### 5.1 Public and shared
- Landing page (hero, how it works, stakeholder value, live demo CTA, KPI teaser with the honesty caveat).
- Sign up / login with role selection, OTP-style verification screen (simulated), JWT sessions, protected routes.
- Notification centre (in-app, real-time via Socket.io).

### 5.2 Parking Seeker
1. Event discovery: search, filter by type, date, area.
2. Event detail: date, venue, expected crowd, a "parking readiness" meter (supply vs predicted demand).
3. **AI parking recommendations** ranked by the allocation score, with a clear "why this space" breakdown (distance, price, availability, capacity, past preference).
4. Map view with real-time availability pins (available / limited / full), walking distance and time, filters (price, distance, type, facility, **accessible space**), space detail with photos and reviews.
5. Booking flow with a **live 5-minute lock countdown** (server-authoritative `expiresAt`), price breakdown, price locked at booking.
6. **Simulated payment checkout** (UPI / card / wallet) with a visible, realistic flow and three outcomes: **success, failure, timeout**. Include a small "demo scenario" selector (Success / Fail / Timeout) shown only in demo mode.
7. Booking confirmation: booking ID, **signed QR**, directions (Google Maps deep link and in-app route), add to calendar.
8. My bookings (upcoming / current / past), cancel with policy shown, report a problem (photo) with instant re-assignment, rate and review.

### 5.3 Space Owner
1. Event-nearby notifications ("new event within 2 km, expected earnings").
2. Add-listing wizard: address with map pin, type (home, shop, office, school/college, hotel, empty plot), capacity, photos (Multer), facilities, availability windows, owner declaration checkbox (right to let the space), accessibility tag.
3. **AI-suggested price** with owner floor and platform cap; show the reasoning.
4. Verification status tracker (Tier 0 OTP, Tier 1 automatic checks, Tier 2 admin sample), trust badge and reliability score.
5. Booking management and **QR scanner screen** for check-in and check-out (camera scanning with a library such as `html5-qrcode`, plus manual code entry fallback; validates the signature server-side, also works with a cached validation when offline and syncs later). Show vehicle number match and optional check-in/out photo evidence.
6. Earnings and reviews: payouts after event completion, per-event breakdown.

### 5.4 Event Host
1. Create event (name, type, venue pin, dates, capacity, expected attendance, pricing requirements, flyer upload).
2. **Hybrid Demand Estimator** results (Section 6.1): predicted demand, peak time, recommended capacity, **confidence range (P10 to P90)**, demand heatmap.
3. Submission status (Pending / Approved / Rejected with reason), edit and resubmit.
4. Live event dashboard: bookings, fill rate, no-show rate, supply vs demand, footfall.

### 5.5 Admin / Authority
1. Event verification queue (approve / reject with reason, rule checks, documents).
2. Listing verification queue with risk score flags (photo GPS far from address, duplicate documents, many listings on one phone number).
3. AI insights: predicted demand, risk alerts, capacity recommendations, reserve pool status.
4. **Authority dashboard:** utilisation, average allocation distance, estimated cruising distance saved, estimated CO2 proxy, no-show and cancellation rates, roadside-parking risk areas. Label every derived figure as an **estimate from the model, not a measurement**.
5. User, listing and dispute management; rejection of listings on public roads or no-parking zones.

---

## 6. Core logic (implement on the server, with unit tests)

### 6.1 Hybrid Demand Estimator (label it exactly this in the UI)
Implement **Stage A**, rule-based:

```
D = Attendance × PrivateVehicleShare ÷ PersonsPerVehicle × PeakFactor − ExistingOfficialCapacity
```

- `PrivateVehicleShare`, `PersonsPerVehicle`, `PeakFactor` come from a lookup table by event type (stadium match, concert, college fest, exhibition, food bazaar, religious/cultural gathering). Store it in the DB so it can be tuned.
- Produce a **confidence range (P10 to P90)** by perturbing the assumption parameters within documented bounds. Show it as a range band with a confidence score, and label it "rule-based baseline".
- Show the estimator roadmap in the UI as a small info tooltip: *rule-based baseline → gradient boosting after 20 to 50 events → LSTM as data grows.* Do not implement Stage B or C now, but structure the code with a `DemandEstimator` interface so they can be added.
- Worked example for tests (illustrative): 20,000 × 0.45 ÷ 2.5 = 3,600; minus 1,200 official = 2,400 slots to supply.

### 6.2 Smart Allocation Engine
```
Score(i) = w_d·norm(1/(1+d_i)) + w_p·norm(1/p_i) + w_a·a_i + w_c·(c_i / c_max) + w_h·h_i
```
- **Normalise every term to 0 to 1** before weighting. Weights are set per event type (stored in DB, e.g. stadium weights distance more).
- `d_i` is **real walking distance** (Google Routes/Distance Matrix, cached; the seed script precomputes it).
- **Two levels:** (1) *supply activation*, choosing which spaces to switch on for the event by taking the top-k scores subject to `Σ x_i · c_i ≥ D` (capacity covers predicted demand), `x_i ∈ {0,1}`; (2) *per-user ranking*, the order each driver sees. (Note: the constraint is `≥ D`, not `≤ D`.)
- Keep a **10% reserve pool** of activated capacity hidden from the public, used only for automatic re-allocation.
- Dynamic pricing: AI-suggested price within the owner floor and platform cap. The price is locked at booking. Show a transparent fee breakdown.

### 6.3 Booking and concurrency (the part judges will probe)
Atomic flow: check availability, lock the slot, process payment, confirm, release lock on failure or timeout.
- Redis lock with `SET key value NX PX 300000` (5-minute TTL), extended when the payment page opens.
- A PostgreSQL **exclusion constraint** on `(space_id, time_range)` using `btree_gist`, so the database rejects overlapping bookings even if Redis fails.
- Slot state machine: `Available → Locked (5 min TTL) → Booked`; on failure or timeout `Locked → Available`; after the event end it is released automatically.
- **Idempotent** payment confirmation (idempotency key), plus a periodic reconciliation job for stuck payments.
- Emit Socket.io events for every state change (`slot:locked`, `slot:released`, `slot:booked`, `occupancy:update`, `allocation:activated`, `reallocation`).
- Write a **concurrency test**: 50 simultaneous attempts on the last slot must produce exactly one booking.

### 6.4 QR
Signed QR payload (booking ID, space ID, time window, vehicle number hash, HMAC or JWT signature). Validate on the server; the owner scanner caches a signed validation key so it can verify offline and sync check-in/out logs later.

### 6.5 Failure handling (visible in the UI)
- Owner cancels: automatic re-allocation to the next-best space at the same or lower price, driver notified, owner reliability score drops.
- Space occupied on arrival: "Report problem" with photo, instant re-assignment, refund or credit, owner flagged.
- Overstay: reminders, grace period, overstay fee, repeat-offender warning.
- No-show: cancellation window, owner keeps a share after it closes.

---

## 7. Demo layer (clearly separated, toggled by `DEMO_MODE=true`)

Show a "SYNTHETIC DEMO DATA" badge in the footer and on every dashboard when demo mode is on.

### 7.1 Seed data: Indore (synthetic)
Seed **5 to 7 venues** with different event types, each with **40 to 60 nearby spaces** within about 1 to 2 km walking distance, plus sample events (past, live, upcoming) and past booking history. Use real Indore landmarks as locations and verify the coordinates with Google Geocoding at seed time; fall back to approximate hard-coded coordinates if the key is missing. Suggested set (adjust if a location does not resolve):

| Venue | Event type |
|---|---|
| Holkar Cricket Stadium | Stadium match |
| Brilliant Convention Centre | Concert / expo |
| Chappan Dukan | Food bazaar |
| Sarafa Bazaar | Night food market |
| Rajwada | Cultural festival |
| IIT Indore (or a large college campus) | College fest |
| Lalbagh Palace | Exhibition |

All events, owners, spaces, reviews and bookings are **fictional** (Indian-sounding names and plausible prices, accessibility tags, mixed space types). Never present them as real businesses' listings.

### 7.2 Judge-wow features (all four are required)
1. **Live demand-vs-supply heatmap** on the map for an event (demand intensity vs activated supply), updating in real time, plus an **allocation-in-action animation**: when "Activate event" is pressed, spaces light up in score order with pulses and connecting lines to the venue, and a counter shows capacity covering predicted demand.
2. **Simulated event-day mode** (a floating Demo Control panel, available to Admin and visible on the Host dashboard): play / pause / speed control. Phases: pre-event ramp, bookings flooding in (synthetic seekers booking through the real booking API so locks and constraints are truly exercised), **reserve pool kicking in** as public supply fills, an **owner cancels** and the system **re-allocates** affected bookings automatically with visible notifications, then check-ins and check-outs. Show live KPIs changing.
3. **Live 5-minute lock countdown** everywhere a lock is held (booking flow, my bookings, and as a visible lock icon on the map pin for other viewers via Socket.io).
4. **QR check-in/out** end to end: seeker QR to owner scanner screen to state change to live occupancy update on the map and dashboards.

Also include a **"Reset demo" button** that restores seed state in one click.

---

## 8. Quality bar and acceptance criteria

- `docker compose up -d`, `npm run migrate`, `npm run seed`, `npm run dev` brings up the whole app. Write a clear `README.md` with prerequisites, env variables (`.env.example`), demo logins and a **3-minute judge demo script**.
- No console errors in any main flow. No placeholder lorem ipsum. No broken images (use generated or royalty-free placeholders stored locally).
- Accessibility basics: semantic HTML, focus states, colour contrast, ARIA labels on map controls, keyboard-operable booking flow.
- Security basics: validated inputs, parameterised queries, hashed passwords, JWT expiry and refresh, RBAC on every route, file-type and size limits on uploads, rate limiting on auth and booking endpoints, secrets only from env.
- Performance basics: indexed PostGIS queries (GIST), cached distance lookups, lazy-loaded routes, debounced map queries.
- **Acceptance tests (must pass):** concurrency test (exactly one winner), lock expiry releases the slot, payment failure releases the lock, payment timeout releases the lock, owner cancel triggers re-allocation, signed QR tamper is rejected, allocation constraint `Σ x_i · c_i ≥ D` holds, RBAC denies cross-role access.
- Visual fidelity to the Stitch design is reviewed per screen with browser-agent screenshots side by side with the design.

---

## 9. Phases (verify each before moving on)

1. **Foundation:** repo structure, Docker Compose, migrations, env config, design token extraction from Stitch, shared components, auth and RBAC.
2. **Data and core logic:** schema, seed script (Indore), demand estimator, allocation engine, pricing, unit tests.
3. **Booking engine:** Redis locks, exclusion constraint, simulated payments (success / failure / timeout), idempotency, signed QR, Socket.io events, concurrency tests.
4. **Seeker portal:** discovery, map (Google Maps), recommendations, booking, payment, QR, my bookings.
5. **Owner portal:** listing wizard, pricing, verification tiers, QR scanner, earnings.
6. **Host and Admin/Authority portals:** event creation and estimator UI, verification queues, KPI dashboards.
7. **Demo layer:** heatmap, allocation animation, event-day simulator, lock countdown polish, reset button, demo control panel.
8. **Hardening and polish:** end-to-end Playwright run of all four roles, visual QA against Stitch, README, demo script, final walkthrough artifact.

---

## 10. Things not to do

- Do not change the Stitch design or invent a new look.
- Do not use localStorage as the source of truth for bookings or locks; the server is authoritative.
- Do not hardcode API keys or secrets.
- Do not present synthetic data or estimates as real measurements.
- Do not add features beyond this spec without noting them in the plan first.
- Do not skip tests or verification to finish faster.

---

## Kick-off message to paste into Antigravity

```
Read SPACE2PARK_PROMPT.md fully. Then:
1) Connect to my Stitch project (via Stitch MCP, or use the exported design in /design) and inventory every screen.
2) Produce the Implementation Plan and Task List artifacts, including the screen-to-route mapping table, extended screens, assumptions, and risks.
3) Stop and wait for my approval before writing any code.
```
