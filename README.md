# 🌌 SPACE2PARK

> **"Park Smart. Live Events Better."**  
> *Turn unused spaces into smart, bookable parking.*  
> **Smart India Hackathon 2026** | **Problem Statement:** SIH26205 | **Team:** Syntax Error (191988)

---

## 📌 Executive Summary

Large events (stadium matches, concerts, expos, cultural fairs) create short, intense parking demand spikes that official venue capacity cannot absorb. Meanwhile, private and commercial spaces (residential driveways, office basements, shop forecourts, institutions, empty plots) sit idle within walking distance.

**SPACE2PARK** connects event attendees with verified, temporarily available parking spaces. It:
1. **Predicts event-specific demand** using the **Hybrid Demand Estimator (Stage A Rule-Based Model)** with P10–P90 confidence bands.
2. **Dynamically activates and allocates** nearby distributed capacity **before** congestion forms subject to $\sum x_i \cdot c_i \ge D$.
3. **Guarantees atomic slot reservations** with a server-authoritative 5-minute Redis TTL hold and database exclusion constraints.
4. **Reserves a 10% hidden reserve pool** for instantaneous automated re-allocation if an owner cancels or a bay is blocked.
5. **Issues tamper-proof HMAC-signed QR passes** that validate seamlessly online or offline at owner gates.

> **Honesty Caveat:**  
> *"Impact is measured through platform KPIs; final city-level reductions require pilot data."*

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Design System** | Google Stitch **Obsidian Orbit** design system (`#121416` base, `#D8A64A` warm gold, `#44E2B1` telemetry emerald, Manrope & Inter typography) |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Three.js (WebGL 3D Slot Allocator), Canvas Confetti, HTML5-QRCode Scanner |
| **Backend** | Node.js, Express.js, Socket.io (Real-Time Telemetry), Pino logging, Helmet, CORS, Zod, JWT RBAC |
| **Data & State** | In-Memory Atomic LockStore / Redis (`SET NX PX 300000`), PostGIS-ready schemas, Swappable Adapters (Payment, Maps, Storage) |
| **Testing** | Node.js test runner (`node --test`), 100% passing concurrency and core logic suite |

---

## 🚀 Quick Start & Local Run

### Prerequisites
- Node.js 18+ (tested on Node v20/v22)
- Docker & Docker Compose (optional for standalone Postgres/Redis containers)

### 1. Installation
```bash
# In the root repository directory
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

### 2. Launch Development Platform (Dual Client + Server)
```bash
# Starts Express server on PORT 5000 and Vite on PORT 5173
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 3. Run Automated Concurrency & Core Logic Tests
```bash
npm test
```
*7 passing unit & acceptance tests validating 50-client race condition, worked demand example (2,400 slots), QR tamper rejection, and reserve pool allocations.*

---

## 👥 Demo Accounts & 1-Click Role Switcher

Use the **1-Click Role Switcher** dropdown in the top-right navbar, or authenticate with these seeded accounts:

| Role | Email | Password | Primary Mission |
|---|---|---|---|
| **Parking Seeker** | `seeker@space2park.in` | `demo123` | Explore Indore grid, view 3D bays, hold 5-min atomic lock, pay, obtain signed QR pass |
| **Space Owner** | `owner@space2park.in` | `demo123` | Add private driveway listing, accept AI-suggested rate, scan seeker QR at gate |
| **Event Host** | `host@space2park.in` | `demo123` | Simulate attendance with Hybrid Demand Estimator, provision event capacity |
| **Admin / Authority** | `admin@space2park.in` | `demo123` | Monitor city KPIs (cruising km saved, CO₂ proxy), verify queue with AI risk flags |

---

## ⏱️ 3-Minute Judge Demo Script

### Minute 1: Seeker Discovery & 3D Bay Allocator (WebGL)
1. Navigate to **Home** (`/`) and tap **"Find Parking"** or go to **[Find Parking](/explore)**.
2. Select **Phoenix Citadel** or **Holkar Stadium**. Notice the interactive vector radar sweep and real-time bay availability counters.
3. Switch vehicle modes between **Car / SUV** and **Bike / Moto**; see split capacities and rates update.
4. Click **"Select & View 3D Deck"**. Orbit the interactive 3D WebGL garage with your mouse. Select **Bay A-12**.
5. Click **"Confirm Bay A-12 & Pay"**.

### Minute 2: Concurrency, 5-Minute Lock & Signed QR Pass
1. On the **Booking Checkout** page, highlight the **Live 5-Minute Lock Countdown** banner. Explain that this slot is locked in Redis via `SET NX PX` and visible to other drivers as locked via Socket.io.
2. Under **"SIH Judge Test Scenario Selector"**, demonstrate that judges can select **Success**, **Failure**, or **Timeout** to observe atomic rollback.
3. Select **Success**, enter your vehicle registration (`MP 09 AB 4021`), and click **"Pay & Generate Signed Pass"**.
4. You are routed to **My Booking Passes** (`/my-bookings`) displaying the **HMAC-SHA256 signed QR pass**, gate navigation HUD, and lane ingress directions.

### Minute 3: Failsafe Re-Allocation & Authority Dashboard
1. On the active pass, click **"Report Space Occupied"**.
2. Watch the **10% Reserve Pool** instantaneously re-allocate you to Reserve Bay `RES-01` at an adjacent facility with a newly regenerated cryptographic QR signature.
3. Open the **Judge Demo Controls** floating HUD at the bottom left:
   - Click **"Flood Synthetic Bookings"** to watch bookings stream in with real-time socket updates.
   - Click **"Live Demand Heatmap"** to toggle demand intensity overlays on the city map.
4. Switch to the **Admin / Municipal Authority** role (`/admin/authority`):
   - Review city-level KPIs: **Network Utilisation %**, **Cruising Distance Saved (km)**, and **CO₂ Emissions Mitigated (kg)**.
   - Inspect the **Verification Queue** with AI Risk Flags (GPS distance mismatch flags).
5. Click **"1-Click Reset Demo"** to restore seed state at any time.

---

## 🔬 Core Algorithms & Formulations

### 1. Hybrid Demand Estimator (Stage A)
$$D = \text{Attendance} \times \frac{\text{PrivateVehicleShare}}{\text{PersonsPerVehicle}} \times \text{PeakFactor} - \text{ExistingOfficialCapacity}$$

- **Worked Example:** $20,000 \times 0.45 \div 2.5 \times 1.0 - 1,200 = 2,400\text{ slots to supply}$.
- Confidence interval calculated via perturbation bounds ($P_{10}$ to $P_{90}$).
- **Roadmap:** *Rule-based baseline $\rightarrow$ Gradient Boosting after 20–50 events $\rightarrow$ LSTM as data grows.*

### 2. Smart Allocation Engine
$$\text{Score}(i) = w_d \cdot \text{norm}\left(\frac{1}{1 + d_i}\right) + w_p \cdot \text{norm}\left(\frac{1}{p_i}\right) + w_a \cdot a_i + w_c \cdot \left(\frac{c_i}{c_{\max}}\right) + w_h \cdot h_i$$

- Subject to $\sum x_i \cdot c_i \ge D$ where $x_i \in \{0, 1\}$.
- Allocates top-$k$ spaces to public pool and reserves the top 10% overflow for the automated reserve pool.

---

## 🏛️ City Edition: Indore, Madhya Pradesh (Synthetic Pilot)
1. **Holkar Cricket Stadium** (Stadium Match)
2. **Brilliant Convention Centre** (Concert / Expo)
3. **Chappan Dukan** (Food Bazaar)
4. **Sarafa Bazaar** (Night Market)
5. **Rajwada** (Cultural Gathering)
6. **IIT Indore Campus** (College Fest)
7. **Lalbagh Palace** (Exhibition)

---

## 🛡️ License & Acknowledgements
Built by **Team Syntax Error** for **Smart India Hackathon 2026**.  
*All rights reserved.*
