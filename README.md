# SmartPark Intelligence

Smart Parking Slot Prediction & Congestion Intelligence dashboard — static front-end (HTML/CSS/JS), no build step needed.

## Folder structure
```
smartpark-intelligence/
├── index.html        # main app (login + 8-page dashboard)
├── app.py             # Python backend server (stdlib only)
├── requirements.txt    # no external packages needed
├── css/
│   └── style.css      # all styling
├── js/
│   └── script.js       # all app logic (login, charts, navigation)
└── README.md
```

## How to run in VS Code

**Option A — Live Server extension (easiest)**
1. Open the `smartpark-intelligence` folder in VS Code (`File → Open Folder`).
2. Install the **"Live Server"** extension (by Ritwick Dey) from the Extensions tab if you don't have it.
3. Right-click `index.html` in the file explorer → **"Open with Live Server"**.
4. It opens automatically at `http://127.0.0.1:5500/index.html`.

**Option B — Terminal (Python's built-in server)**
1. Open the folder in VS Code, then open a terminal: `Terminal → New Terminal`.
2. Run:
   ```bash
   python3 app.py
   ```
3. It auto-opens your browser at:
   ```
   http://localhost:8000
   ```
4. To stop the server, press `Ctrl+C` in the terminal.

No packages to install — `app.py` uses only Python's standard library (see `requirements.txt`). Requires Python 3.7+.

**Option C — Node's http-server**
```bash
cd smartpark-intelligence
npx http-server -p 8000
```
Then open `http://localhost:8000`.

> Don't just double-click `index.html` to open it as a `file://` URL — some browsers block a few features that way. Always serve it through Live Server / `http.server` / `http-server`.

## Login credentials

**Main dashboard**
- Username: `admin`
- Password: `admin123`

**Zone consoles** (Decision Hub → sidebar → Zone Portals)
| Zone | Username | Password |
|---|---|---|
| Zone A — Commercial Hub | `zonea.admin` | `zoneA@120` |
| Zone B — Shopping Mall | `zoneb.admin` | `zoneB@80` |
| Zone C — Metro Transit | `zonec.admin` | `zoneC@150` |

## What's inside
- **Module 1 — Live Slots:** real-time occupancy, predictive +30 min layer, vehicle mix, sensor status
- **Module 2 — ML Predictor:** Random Forest congestion simulator, feature importance, model training details
- **Module 3 — Demand Curve:** 24-hour occupancy chart, weekday vs weekend comparison
- **Module 4 — SQL Engine:** query explorer, schema, data pipeline overview
- **Module 5 — Decision Hub:** Power BI-style heatmap & trend chart, dynamic pricing rules, audit log
- **Zone Portals (Zone A/B/C):** separate per-zone login, occupancy trend, vehicle mix, incident log, pricing history

No external dependencies beyond Google Fonts (loaded via CDN link in `index.html`) — everything else is plain HTML/CSS/JS.
