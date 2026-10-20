# TaylorWorks

TaylorWorks is a local marketplace that connects contractors with small businesses in Abilene, Texas and nearby Big Country towns. Businesses join free, post job requests, and message contractors. Contractors pay for a monthly listing before their profile appears in the public directory.

The product name and the listing plan labels live in [`lib/config.ts`](lib/config.ts). Change `site.name` there and the page titles, header, and footer follow.

## Stack

- Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Prisma with SQLite for local development
- Cookie sessions signed with `jose`, passwords hashed with bcrypt
- Stripe Checkout subscriptions and a webhook that marks a listing active or inactive
- A mock billing mode so the app runs with no Stripe keys

SQLite keeps setup to one file. The Prisma schema is portable to Postgres later by changing the datasource and running a new migration.

## Setup

You need Node.js 20.12 or newer.

```bash
npm install
cp .env.example .env
npx prisma migrate deploy
npm run db:seed
npm run dev
```

The app listens on [http://127.0.0.1:43123](http://127.0.0.1:43123). `http://localhost:43123` works too.

`npm install` also generates the Prisma client, through the `postinstall` script.

The placeholder `AUTH_SECRET` in `.env.example` works on your own machine. Before anyone else can reach the app, replace it with a long random string. One way to make one:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

`npm run db:seed` wipes and recreates the sample data. Every sample account uses the password `taylorworks`.

| Role | Business | Email |
| --- | --- | --- |
| Business | Elm & Pine Cafe | nora@elmpinecafe.example |
| Business | Sayles Street Books | elliot@saylesbooks.example |
| Business | Cedar Creek Dental | priya@cedarcreekdental.example |
| Business | Mockingbird Mini Storage | hank@mockingbirdstorage.example |
| Contractor | Red River Electric | mara@redriverelectric.example |
| Contractor | Catclaw Plumbing Co. | luis@catclawplumbing.example |
| Contractor | Buffalo Gap Air | denise@buffalogapair.example |
| Contractor | Mesa Stone Roofing | grant@mesastoneroofing.example |
| Contractor | Lytle Creek Painters | asha@lytlecreekpainters.example |
| Contractor | Prairie Line Landscaping | caleb@prairielinelandscaping.example |
| Contractor | Sayles General Builders | june@saylesbuilders.example |
| Contractor | Cedar Ridge Electric | pete@cedarridgeelectric.example |

Seeded contractors already have active listings (a mix of Basic and Featured). A contractor who signs up starts unlisted until they activate a plan.

## How billing works

Public search and profile pages include a contractor only when their listing status is `ACTIVE` and the current period has not ended. Tiers are `BASIC` and `FEATURED`. Featured listings sort first and show a badge. The plan list in `lib/config.ts` is the place to add another tier later.

**Mock mode (default).** `BILLING_MODE=mock`, or leave the Stripe keys empty. The listing page shows “Activate Basic” and “Activate Featured”. Those buttons write the listing row directly and do not contact Stripe. Use “Turn listing off” to hide the profile again. Do not use mock mode in production.

**Stripe test mode.** In the Stripe dashboard (test mode), create two recurring monthly prices and set:

```bash
BILLING_MODE="stripe"
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_PRICE_BASIC="price_..."
STRIPE_PRICE_FEATURED="price_..."
```

Checkout does not activate the listing by itself. Forward webhooks so the app can mark the subscription active, past due, or canceled:

```bash
stripe listen --forward-to localhost:43123/api/stripe/webhook
```

Put the CLI signing secret in `STRIPE_WEBHOOK_SECRET`. The webhook handles `checkout.session.completed`, subscription created/updated/deleted, and `invoice.payment_failed`. A past-due or canceled subscription drops the profile out of search.

Update the dollar labels in `listingPlans` inside `lib/config.ts` if you change the Stripe prices. Those labels are what the page shows. The amount Stripe charges comes from the Price object.

## Scripts

- `npm run dev` — local server on port 43123
- `npm run build` — production build
- `npm start` — serve the production build on port 43123
- `npm run db:migrate` — apply Prisma migrations
- `npm run db:seed` — load sample Abilene businesses and contractors
- `npm run db:reset` — drop the database, migrate, and seed. Prisma refuses to run this when an AI coding agent starts it, so run it yourself.
- `npm run lint` — ESLint

## Project configuration

- **`prisma.config.ts`** holds Prisma's settings: where the schema is and the seed command. Once a config file exists, Prisma stops reading `.env` on its own, so this file loads `.env` itself. On a host that sets real environment variables, there's no `.env` and it skips that step.
- **`next.config.ts`** lists `127.0.0.1` in `allowedDevOrigins`. Next.js only trusts `localhost` by default, and without this entry it blocks live reload for anyone who opens the app at `127.0.0.1`.
- **`allowScripts`** in `package.json` lists the dependencies that may run install scripts: Prisma, esbuild, and `unrs-resolver`, which ESLint uses. Each entry is pinned to a version. When one of them is upgraded, npm warns about it again. Check the new version, then run `npm approve-scripts <package>`.
- **`overrides`** in `package.json` pins `deepmerge-ts`, used by Prisma's CLI, to 8.x, which fixes a security advisory in 7.x. Remove it once Prisma depends on 8.x itself.

### Known install warnings

- `eslint@9 ... no longer supported`. ESLint 10 is out, but `eslint-plugin-react`, `eslint-plugin-jsx-a11y` and `eslint-plugin-import`, which `eslint-config-next` uses, don't support it yet. Upgrade once they do.
- `npm audit` reports high-severity advisories for `braces`. It's pulled in by development tools: the shadcn CLI, and Next's ESLint plugin through `fast-glob`. No patched version exists yet. The advisory concerns deeply nested glob patterns, and these tools only use the project's own patterns.
