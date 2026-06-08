# Express Surveillance Engine 🚀

A high-performance, standalone Express server designed to act as a real-time cryptocurrency surveillance engine. It aggregates prices from the CoinGecko API every 30 seconds, maintains an active in-memory cache, and serves a modern developer dashboard alongside developer-friendly JSON feeds.

---

## Key Features

*   **Automated Background Fetching**: Queries the CoinGecko API on a strict 30-second interval to fetch the latest cryptocurrency metrics.
*   **Precision Target Feed**: Monitors 8 top cryptocurrencies by market capitalization:
    *   Bitcoin (`BTC`)
    *   Ethereum (`ETH`)
    *   Solana (`SOL`)
    *   BNB (`BNB`)
    *   XRP (`XRP`)
    *   Cardano (`ADA`)
    *   Dogecoin (`DOGE`)
    *   Polygon (`POL` - fully updated to CoinGecko's new `polygon-ecosystem-token` migration ID)
*   **Robust In-Memory Cache**: All API routes read directly from a thread-safe in-memory cache, ensuring sub-millisecond response times.
*   **Self-Healing Fallback Mechanism**: The public CoinGecko API has strict rate limits (HTTP 429). If the engine is blocked or offline, it enters a fallback state where prices simulate realistic market drift (random walks of ±0.15% to ±0.35%) and outputs warnings rather than returning blank data or crashing.
*   **Interactive Developer Dashboard**: Hosts a gorgeous dark-themed dashboard at `/` crafted with glassmorphism, responsive grid layouts, custom SVG indicators, active countdowns, and on-demand force-refresh triggers.

---

## Tech Stack

*   **Core**: Node.js & Express
*   **Language**: TypeScript (Type-safe routing, data maps, and cache models)
*   **Development Utilities**: `tsx` (TypeScript Execute for fast watch loops), `typescript`
*   **Middlewares**: `cors`, `express.json`

---

## Directory Structure

```text
surveillance-engine/
├── src/
│   ├── index.ts               # Application entrypoint & middlewares
│   ├── cache/
│   │   └── priceCache.ts      # In-memory storage with initial mocks
│   ├── services/
│   │   └── priceFetcher.ts    # Background fetching worker & fallback simulation
│   ├── routes/
│   │   ├── api.ts             # JSON endpoint routing & health checks
│   │   └── dashboard.ts       # HTML developer dashboard route & layout
│   └── types/
│       └── index.ts           # Shared TypeScript interfaces
├── .env                       # Local environment variables
├── .gitignore                 # Directory tracking exclusions
├── tsconfig.json              # TypeScript compilation setup
└── package.json               # Node dependencies and scripts
```

---

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18+ recommended)
*   npm

### Installation

1.  Navigate to the `surveillance-engine` directory:
    ```bash
    cd surveillance-engine
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Configuration

Create a `.env` file in the `surveillance-engine` directory (or use the preconfigured one):

```ini
PORT=3001
FETCH_INTERVAL_MS=30000
COINGECKO_API_URL=https://api.coingecko.com/api/v3
# Optional: Add your API key if you have a CoinGecko Developer Plan
COINGECKO_API_KEY=
```

### Running the Server

#### Development Mode (With Auto-Reload)
Starts the TypeScript engine using `tsx` in watch mode:
```bash
npm run dev
```

#### Production Build & Run
Compile TypeScript to JavaScript, then run the native production build:
```bash
npm run build
npm start
```

---

## API Documentation

| Endpoint | Method | Description | Sample Output |
| :--- | :--- | :--- | :--- |
| `/` | `GET` | HTML Developer Monitor Dashboard | Interactive Web Page |
| `/api/prices` | `GET` | Returns all cached cryptocurrency prices | `{ success: true, data: [...], timestamp: "..." }` |
| `/api/prices/:coinId` | `GET` | Returns details for a specific coin (e.g. `bitcoin`, `solana`, `pol`) | `{ success: true, data: {...}, timestamp: "..." }` |
| `/api/prices/refresh` | `POST` | Forces an immediate manual cache refresh (rate-limited to 5s intervals) | `{ success: true, message: "...", status: {...} }` |
| `/health` | `GET` | Outputs uptime, cache size, scheduler, and CoinGecko API status | `{ status: "UP", uptime: "...", fetcher: {...} }` |
