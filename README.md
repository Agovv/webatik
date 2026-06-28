# Maestro

Maestro is a Laravel + Inertia SaaS boilerplate for building multi-tenant products with isolated tenant databases, domain-based routing, role-based access control, passkeys, two-factor authentication, themes, and internationalization.

The sales and licensing flow lives outside this repository. Customers who receive access to this repo can clone it, configure their environment, and start building their product on top of the included SaaS foundation.

## Demo

<video src="./public/video/maestro-demo.mp4" poster="./public/video/maestro-demo-poster.png" controls></video>

The demo video is rendered with the standalone Remotion project in `remotion/` and committed under `public/video/` so GitHub and the landing page can load the same asset.

## What's Included

- Laravel 13, PHP 8.5, Inertia 3, React 19, TypeScript, and Tailwind CSS 4.
- Central admin for tenants, domains, users, roles, and permissions.
- Tenant isolation powered by stancl/tenancy with per-tenant databases.
- Domain management with automatic central subdomains and custom domains.
- Laravel Fortify authentication with email verification, password reset, passkeys, and TOTP two-factor auth.
- Spatie permission-based RBAC with UI management.
- English and Spanish translations with browser language detection.
- Light, dark, and system appearance modes.
- Pest tests, Pint formatting, PHPStan/Larastan, ESLint, Prettier, and Wayfinder-generated typed routes.

## Requirements

- PHP 8.5+
- Composer
- Node.js and pnpm or npm
- SQLite, MySQL, or another Laravel-supported database

## Installation

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm run build
```

For local development:

```bash
composer run dev
```

This starts the Laravel server, queue listener, log tail, and Vite dev server together.

## Tenancy Setup

Set your central application URL in `.env`:

```env
APP_URL=https://maestro.test
```

Create tenants from the central admin. Each tenant can have one or more domains:

- Auto domains use the central domain suffix, for example `acme.maestro.test`.
- Custom domains can point at your application infrastructure.
- The first domain for a tenant is automatically treated as primary.
- New domains default to active status with verified DNS and SSL values in the admin form.

## Common Commands

```bash
php artisan test --compact
vendor/bin/pint --dirty --format agent
npm run lint:check
npm run types:check
npm run format:check
```

Run the full project check:

```bash
composer run ci:check
```

## Remotion Demo Video

```bash
cd remotion
npm install
npm run build:video
npm run build:poster
```

Rendered videos and posters should be copied to `public/video/` when they need to be committed. Local Remotion dependencies, caches, and scratch renders stay ignored.

## Customization Checklist

- Replace Maestro branding, logo assets, favicon, and marketing copy.
- Update `.env.example` for your preferred database, mail, cache, queue, and session drivers.
- Configure production domains, HTTPS, queues, backups, and file storage.
- Add your billing provider, subscription plans, onboarding flow, and product-specific tenant features.
- Review roles and permissions before shipping a customer-facing product.
- Update legal documents, license terms, privacy policy, and support contact information.
