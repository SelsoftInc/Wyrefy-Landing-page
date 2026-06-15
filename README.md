Client (frontend)
=================

Overview
--------

This directory contains the Next.js frontend for Wyrefy. It uses the App Router, TypeScript, Tailwind CSS, and bun as the primary runtime/toolchain. The client implements the public web UI, authentication flows, and sandbox previews.

Structure
---------

- `app/` — Next.js app routes and server components.
- `src/` — shared UI components, features, and client-only utilities.
- `public/` — static assets and scripts.
- `styles/` or `globals.css` — global styling and Tailwind setup.

Developer flow
--------------

1. Install dependencies

```bash
cd client
bun install
# or: yarn install (project supports yarn for contributors)
```

2. Environment

```bash
cp .env.example .env.local
# Edit .env.local for local backend URL and feature flags
```

3. Run dev server

```bash
yarn dev
# or: bun dev (if your environment supports bun run scripts)
```

4. Build for production

```bash
yarn build
yarn start
```

Lint & formatting
-----------------

- `yarn lint` — run ESLint rules.
- `yarn format` — run Prettier if configured.

Testing
-------

Unit and integration tests (if present) live under `src/` or `tests/`. Use your preferred test runner configured in the repo (Jest/Playwright/Vitest).

Conventions
-----------

- Prefer server components for data fetching; use client components only when interactivity is required.
- Wrap major UI building blocks as small, focused components under `src/components/`.
- Use Tailwind utility classes and centralize common tokens in `globals.css` or a theme provider.

Deployment notes
----------------

- The frontend is built into a static or server-rendered bundle depending on Next.js configuration.
- Serve via a CDN + edge or an app server (Vercel, Netlify, or containerized node server).

Further tasks
-------------

- Add component library README and storybook if desired.
- Document design token usage and theme switching in a separate `docs/` file.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
