# Chat Activity Tracker

Self-hostable Next.js dashboard for exploring message volume and engagement metrics across your Whop chat experiences. This repository powers the app requested in [Linear issue SPARK-545](https://linear.app/whop/issue/SPARK-545) and tracks the GitHub project at [Osis-AI-LLC/Chat-Activity-Tracker](https://github.com/Osis-AI-LLC/Chat-Activity-Tracker).

## Features

- Fetches chat experiences from the Whop API for the authenticated company
- Tracks daily message counts with detailed message previews
- Saves frequently-used channel/date combinations locally
- Provides standalone Node.js scripts for bulk message export

## Prerequisites

- [Node.js 20+](https://nodejs.org/) and [pnpm 9+](https://pnpm.io/)
- A Whop app with access to the `chat:read` permission
- Whop API credentials (see Environment Variables)

## Environment Variables

Copy `.env.example` to `.env.local` (or export the values in your deployment target) and fill in the real credentials from the [Whop developer dashboard](https://whop.com/dashboard/developer/):

```bash
cp .env.example .env.local
# edit .env.local with your real keys
```

| Variable | Description |
| --- | --- |
| `WHOP_API_KEY` | Server-side API key with `chat:read` |
| `NEXT_PUBLIC_WHOP_APP_ID` | App ID, used for install/deep links |
| `NEXT_PUBLIC_WHOP_AGENT_USER_ID` | Optional user to impersonate when calling the API |
| `NEXT_PUBLIC_WHOP_COMPANY_ID` | Company scope for API calls |

> See `MESSAGE_FETCHING.md` for deeper details about message pagination and the debugging scripts.

## Installation

```bash
pnpm install
cp .env.example .env.local
# update .env.local with your API key and IDs
```

## Local Development

- **Standard Next.js dev server (recommended for self-hosting):**

  ```bash
  pnpm dev:local
  ```

- **Whop-proxy mode (matches the hosted Whop runtime):**

  ```bash
  pnpm dev
  ```

The dashboard is available at `http://localhost:3000/dashboard/<yourCompanyId>` after authentication. When developing outside of Whop, you can stub or bypass authentication by providing valid headers/tokens.

## Message Export Utilities

The repository includes helper scripts for offline exploration. See `fetch_messages.js`, `fetch_messages_advanced.js`, and the documentation in `MESSAGE_FETCHING.md` for usage examples.

## Deployment

1. Push your fork or clone to GitHub (or another Git remote).
2. Deploy to your hosting provider of choice (e.g. Vercel, Fly, Render, self-managed server).
3. Provide the same environment variables from `.env.local` in your hosting platform.
4. Update the Whop developer dashboard with the deployed URLs (`Base URL`, `App path`, `Dashboard path`, `Discover path`) if you still want to offer the app through Whop.

## Troubleshooting

- Confirm every environment variable in `.env.local` is present; missing values cause 401/403 errors.
- Ensure your Whop app has `chat:read` permission and is installed in the target community.
- Rate limiting warnings usually clear after a few seconds; scripts include small backoffs to help.

For more help, open an issue in [Osis-AI-LLC/Chat-Activity-Tracker](https://github.com/Osis-AI-LLC/Chat-Activity-Tracker) or contact Whop support.*** End Patch
