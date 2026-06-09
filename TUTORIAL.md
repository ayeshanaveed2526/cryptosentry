# 🛰️ Crypto Sentry - System Tutorial & Operator Manual

Welcome to **Crypto Sentry**, a professional crypto security monitoring system designed with a production-first mindset. This manual provides a step-by-step guide on how the system works, how to run it, and how to operate the different modules.

---

## 1. System Architecture & Concept

Unlike typical crypto applications that retrieve prices only when a user requests them, **Crypto Sentry** is built like an automated security guard:
- **Continuous Monitoring**: Runs a 24/7 background query loop checking prices every **30 seconds**.
- **Crash Detection**: Computes drop percentages in real-time. If any watchlisted coin drops **2% or more** within a 30-second window, the detector triggers a flash crash alert.
- **Alert Deduplication**: Prevents spamming alerts. If a coin triggers an alert, any subsequent alerts for that coin are suppressed (deduplicated) for the next **60 seconds**.
- **Observability**: Logs every action and warning in a standardized format for easy log parsing.

---

## 2. Quick Start: Launching the Sentry Guards

To run the complete system, you need to launch both the **Surveillance Backend** and the **Next.js Frontend**:

### Step 1: Start the Surveillance Engine (Backend)
Open a terminal, navigate to the backend directory, and start the engine:
```bash
cd surveillance-engine
npm install
npm run dev
```
*This starts the background fetch scheduler, initializes the price cache, and launches the Express server on **http://localhost:3001**.*

### Step 2: Start the Next.js Web App (Frontend)
Open a second terminal in the root directory and start the Next.js server:
```bash
npm run dev
```
*This launches the user interface on **http://localhost:3000**.*

---

## 3. Interactive HUD Tutorial Guide

When you log in for the first time and visit **[http://localhost:3000/dashboard](http://localhost:3000/dashboard)**, the interactive **HUD Onboarding Guide** automatically initializes:

1. **Step 1: Sentry Guard Core** - Introduces the continuous 30-second loop concept.
2. **Step 2: Live Surveillance Cards** - Details the Price Cards. Normal state is indicated by a **Green** glow, while active flash crash alerts flash **Neon Red**.
3. **Step 3: Command Sentry Log** - Explains the scrollable system console log at the bottom of the screen.
4. **Step 4: Watchlist Tuning** - Guides you to the Watchlist tab where you can choose which of the 8 major assets to monitor.

*Note: You can replay this interactive tutorial at any time by clicking the **📖 Launch Tutorial** button in the dashboard header.*

---

## 4. Custom Watchlist Management

To configure which assets the sentry guards should focus on:
1. Navigate to the **Watchlist** tab (or go to **http://localhost:3000/watchlist**).
2. Toggle the switches for the assets you want to monitor (e.g., Bitcoin, Ethereum, Solana).
3. Switch an asset **ON** to add it to the active surveillance grid, or **OFF** to stand down the guard and save memory resources.
4. Click **📈 View Chart** on any asset to open a simulated candlestick chart analysis modal.

---

## 5. Simulating a Flash Crash (Manual Verification)

To verify that the flash crash detection and deduplication are working exactly as specified, you can manually trigger a mock crash event:

1. Open your terminal or an API client (like Postman or curl).
2. Send a `POST` request to the backend:
   ```bash
   curl -X POST http://localhost:3001/api/test/crash -H "Content-Type: application/json" -d "{\"coinId\": \"bitcoin\"}"
   ```
3. **Verify Alert Logs**: Check the backend console output. You should see a formatted observability log:
   `[YYYY-MM-DD] BTC dropped 3.0% Price = $66,445 AlertID = 001`
4. **Verify Deduplication**: Send the same request immediately. The backend console will log:
   `ℹ️ [Fetcher] Flash crash detected... but alert deduplicated.` (no duplicate `AlertID` is created within 60 seconds).
5. **Verify Visual Indicator**: Open the Dashboard HUD. The Bitcoin card will turn **Red** and show `⚠️ ALERT ACTIVE`, and the Terminal widget at the bottom will log the glowing red alert.
6. **Watch Recovery**: Wait 30 seconds for the next scheduled loop. The baseline will update, and the card will normalize back to **Green** (`🟢 NORMAL`).
