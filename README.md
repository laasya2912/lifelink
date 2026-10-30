# 🚨 LIFELINK — Intelligent Accident Emergency Response System

LIFELINK is a hackathon prototype that demonstrates an end-to-end **accident
emergency-response workflow** by combining:

- **Real public API data** (device location, real-world hospital locations,
  reverse-geocoded addresses, interactive mapping, and optional weather
  context), with
- **Rule-based logic** (deterministic crash-signal validation and severity
  scoring — no AI/ML), and
- **A clearly-labelled simulated emergency workflow** (crash sensor
  signals, victim responses, responder assignment, and dispatch).

Every piece of data in the UI is labelled as either coming from a **real
public API** or from **simulated / prototype logic**, so it's always clear
what is genuinely live and what is a hackathon simulation.

---

## ✨ Live Demo Flow

1. Open the **Dashboard** and click **"Simulate Accident Signal."**
2. Simulated vehicle/phone sensors generate an **Incoming Incident Signal**.
3. Victim 1 responds **"I'm Safe"**; Victim 2 starts a **15-second response
   timer**.
4. The app runs **rule-based crash detection** and **severity scoring**.
5. It requests the browser's **real GPS location** (falling back to
   simulated coordinates if permission is denied).
6. It calls the **OpenStreetMap Overpass API** to find **real nearby
   hospitals**, and the **Nominatim API** to reverse-geocode a **real
   address**.
7. Hospitals are ranked and the best match is selected.
8. If Victim 2's timer expires without a response (or either victim selects
   "I Need Help"), **simulated escalation** activates: emergency contact
   notification, responder assignment, and dispatch — all clearly labelled
   as simulated.
9. The **Incident** page shows full incident details plus a live **Leaflet
   + OpenStreetMap** map with accident, victim, and hospital markers.
10. The **Tracking** page shows the full emergency-response timeline.

---

## 🔌 Public APIs Used

### Browser Geolocation API
**Purpose:** Obtains the user's real browser/device location after
permission is granted (`navigator.geolocation.getCurrentPosition`).
**Fallback:** If permission is denied, unavailable, or the request times
out, the app uses fixed prototype coordinates and clearly labels the
location as **"Simulated GPS"** — never presented as real GPS data.
**File:** `src/api/locationApi.js`

### OpenStreetMap Overpass API
**Endpoint:** `https://overpass-api.de/api/interpreter`
**Purpose:** Retrieves real-world hospital locations (`amenity=hospital`)
near the accident coordinates, parsed into name, coordinates, and distance.
**Important:** Overpass provides *geographic* data only — it does **not**
provide live bed availability, live ED capacity, ambulance availability, or
any guarantee of treatment. Any "availability" shown in the UI is clearly
labelled **Prototype Data**.
**Fallback:** If the API call fails, clearly-labelled prototype hospital
points are used instead, and the UI shows "Hospital API — Fallback."
**File:** `src/api/hospitalApi.js`

### OpenStreetMap Nominatim (Reverse Geocoding)
**Endpoint:** `https://nominatim.openstreetmap.org/reverse`
**Purpose:** Converts latitude/longitude into a readable address (e.g.
`16.5062, 80.6480` → `Vijayawada, Andhra Pradesh, India`).
**Usage policy:** Called only when an incident is simulated (never on a
polling loop), and results are cached in memory to avoid redundant calls,
in line with Nominatim's public usage policy.
**Fallback:** If the API fails, the raw coordinates are displayed instead.
**File:** `src/api/geocodingApi.js`

### Leaflet + OpenStreetMap Map Tiles
**Purpose:** Renders a real, interactive map (pan/zoom, markers, popups) —
never a static screenshot — showing the accident location, both victims,
the selected hospital, and nearby hospitals.
**Files:** `src/components/IncidentMap.jsx` (uses `react-leaflet`)

### Open-Meteo (Optional)
**Endpoint:** `https://api.open-meteo.com/v1/forecast`
**Purpose:** Displays optional environmental context (temperature,
precipitation, wind, condition) around the accident location. This is
informational only and is **never** used to determine accident severity or
make any medical judgment.
**File:** `src/api/weatherApi.js`

---

## 🧠 Simulated Components

The following are explicitly **simulated** for this prototype and are
labelled as such throughout the UI:

- Accident sensor signals (impact force, deceleration, sudden stop,
  orientation change, airbag trigger)
- Rule-based crash detection (**not** AI/ML)
- Rule-based severity classification (**not** a medical diagnosis)
- Victim responses and the 15-second Victim 2 response timer
- Hospital "availability" (real hospital *locations* come from OpenStreetMap;
  availability status is prototype data only)
- Responder availability and assignment
- Emergency contact notification
- Emergency dispatch and ETA (**"Simulated ETA"**)

LIFELINK **never** contacts real emergency services and **never** claims
live hospital bed/ED availability, ambulance status, or guaranteed
response.

---

## 🗂 Project Structure

```
src/
├── api/
│   ├── locationApi.js       # Browser Geolocation API
│   ├── hospitalApi.js       # OpenStreetMap Overpass API
│   ├── geocodingApi.js      # OpenStreetMap Nominatim
│   └── weatherApi.js        # Open-Meteo (optional)
│
├── components/
│   ├── Navbar.jsx
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── StatusBadge.jsx
│   ├── Timeline.jsx
│   ├── Modal.jsx
│   ├── IncidentMap.jsx      # React Leaflet map
│   └── ApiStatusPanel.jsx
│
├── data/
│   ├── incidents.json
│   └── responders.json
│
├── logic/
│   ├── crashDetection.js    # Rule-based signal validation
│   ├── severityEngine.js    # Rule-based severity scoring
│   ├── hospitalMatcher.js   # Ranks real hospitals + prototype metadata
│   └── escalation.js        # Simulated escalation workflow
│
├── state/
│   └── IncidentContext.jsx  # Shared app state + localStorage persistence
│
├── pages/
│   ├── Dashboard.jsx
│   ├── Incident.jsx
│   └── Tracking.jsx
│
├── App.jsx
├── main.jsx
└── index.css

vercel.json
package.json
```

---

## 🚀 Getting Started

### Install

```bash
npm install
```

### Run the dev server

```bash
npm run dev
```

Then open the URL Vite prints (typically `http://localhost:5173`).

### Build for production

```bash
npm run build
npm run preview
```

---

## ☁️ Deploying to Vercel

This repo includes a `vercel.json` configured for a Vite SPA:

```bash
npm install -g vercel
vercel
```

Or connect the repository in the Vercel dashboard — it will auto-detect the
Vite framework, run `npm run build`, and serve `dist/`.

---

## 🧪 Testing Instructions

1. Run `npm install && npm run dev`.
2. On the **Dashboard**, click **"Simulate Accident Signal."**
3. Allow (or deny) the browser's location permission prompt to see both the
   **real GPS** and **Simulated GPS** code paths.
4. Watch the **API Status** panel update: `Connected` (real API succeeded)
   vs. `Fallback` (API failed / permission denied).
5. Respond as Victim 1 ("I'm Safe") and let Victim 2's 15-second timer
   expire (or pick "I Need Help") to trigger escalation.
6. Visit the **Incident** page to confirm real hospital data, a real
   address, and an interactive Leaflet map.
7. Visit the **Tracking** page to confirm the timeline reflects escalation
   state correctly.
8. Click **"Reset Demo"** on the Dashboard to clear `localStorage` and
   re-run the flow.

---

## 🎤 Hackathon Demo Script (≈2 minutes)

1. **(0:00)** Open the Dashboard — point out the API Status panel (all
   idle/ready).
2. **(0:10)** Click "Simulate Accident Signal" — narrate: *"This triggers
   simulated crash sensors, but from here on, location, hospitals, address,
   and the map are real public API calls."*
3. **(0:25)** Show Victim 1 marking "I'm Safe"; let Victim 2's timer run
   down on screen.
4. **(0:45)** Point out the API Status panel flipping to "Connected" as
   Overpass/Nominatim respond.
5. **(1:00)** Navigate to the Incident page — show the real hospital name,
   real distance, real address, and the live Leaflet map with markers.
6. **(1:30)** Navigate to Tracking — show escalation activating because
   Victim 2 didn't respond, with all escalation fields clearly labelled
   "Simulated" / "Prototype Data."
7. **(1:50)** Close with the safety notice: LIFELINK is a prototype and
   never contacts real emergency services.

---

## ⚠️ Safety Notice

> LIFELINK is a hackathon prototype. Accident signals, victim responses,
> responder availability, hospital availability, emergency notifications
> and dispatch are simulated. Public APIs provide geographic and
> environmental information only. This system does not provide medical
> diagnosis, contact emergency services, or guarantee emergency response.

---

## 📄 License

Built for hackathon demonstration purposes.
