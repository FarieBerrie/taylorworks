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

```bash
npm install
cp .env.example .env
npx prisma migrate deploy
npm run db:seed
npm run dev
```

The app listens on [http://127.0.0.1:43123](http://127.0.0.1:43123).

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
- `npm run db:migrate` — apply Prisma migrations
- `npm run db:seed` — load sample Abilene businesses and contractors
- `npm run db:reset` — drop the database, migrate, and seed
- `npm run lint` — ESLint
