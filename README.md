<p align="center">
	<h1 align="center"><b>esk</b></h1>
<p align="center">
    An open-source starter kit.
    <br />
    <br />
    <a href="https://esk.run"><strong>Website</strong></a> · 
    <a href="https://github.com/esisonhq/esk/issues"><strong>Issues</strong></a> · 
	<a href="https://esk.run/docs"><strong>Documentation</strong></a> ·
    <a href="#whats-included"><strong>What's included</strong></a> ·
	<a href="#getting-started"><strong>Getting Started</strong></a> ·
    <a href="#how-to-use"><strong>How to use</strong></a> ·
  </p>
</p>

Everything you need to build a production ready SaaS; a monorepo with a focus on code reuse and best practices.

## What's included

<table>
  <tr>
    <th>Category</th>
    <th>Tool</th>
    <th>Status</th>
    <th>Docs</th>
    <th>Note</th>
  </tr>
  <tr>
    <td>Build System</td>
    <td><a href="https://turborepo.com/">TurboRepo</a></td>
    <td>:white_check_mark:</td>
    <td>:white_check_mark:</td>
    <td></td>
  </tr>
  <tr>
    <td>Framework</td>
    <td>
      <a href="https://tanstack.com/start/">Tanstack Start</a>
      <br />
      <a href="https://nextjs.org/">Nextjs</a>
    </td>
    <td>:white_check_mark:</td>
    <td>:white_check_mark:</td>
    <td>See docs or esk-nextjs</td>
  </tr>
  <tr>
    <td>Mobile</td>
    <td>
      <a href="https://expo.dev/">React Native using Expo</a>
    </td>
    <td>:arrows_counterclockwise:</td>
    <td>:arrows_counterclockwise:</td>
    <td></td>
  </tr>
  <tr>
    <td>API</td>
    <td>
      <a href="https://hono.dev/">Hono</a>
    </td>
    <td>:arrows_counterclockwise:</td>
    <td>:arrows_counterclockwise:</td>
    <td>REST and tRCP</td>
  </tr>
  <tr>
    <td>Code Formatting</td>
    <td>
      <a href="https://prettier.io/">Prettier</a>
    </td>
    <td>:white_check_mark:</td>
    <td>:white_check_mark:</td>
    <td></td>
  </tr>
    <tr>
    <td>Linting</td>
    <td>
    <a href="https://eslint.org/">ESLint</a>
    </td>
    <td>:white_check_mark:</td>
    <td>:white_check_mark:</td>
    <td></td>
  </tr>
    <tr>
    <td>Type Safety</td>
    <td>TypeScript</td>
    <td>:white_check_mark:</td>
    <td>:white_check_mark:</td>
    <td></td>
  </tr>
  <tr>
    <td>Styling</td>
    <td>
      <a href="https://tailwindcss.com/">TailwindCSS</a>
    </td>
    <td>:white_check_mark:</td>
    <td>:arrows_counterclockwise:</td>
    <td></td>
  </tr>
  <tr>
    <td>UI / Components</td>
    <td>
      <a href="https://ui.shadcn.com/">Shadcn</a>
    </td>
    <td>:white_check_mark:</td>
    <td>:white_check_mark:</td>
    <td></td>
  </tr>
  <tr>
    <td>Authentication</td>
    <td>
      <a href="https://better-auth.com/">BetterAuth</a>
    </td>
    <td>:arrows_counterclockwise:</td>
    <td>:arrows_counterclockwise:</td>
    <td></td>
  </tr>
    <tr>
    <td>Database</td>
    <td>
      <a href="https://supabase.com/" target="_blank">Supabase</a>
    </td>
    <td>:arrows_counterclockwise:</td>
    <td>:arrows_counterclockwise:</td>
    <td></td>
  </tr>
</table>

## Additional Items

<table>
  <tr>
    <th>Package</th>
    <th>Tool</th>
    <th>Status</th>
    <th>Docs</th>
    <th>Note</th>
  </tr>
  <tr>
    <td>UI</td>
    <td>Progress Loader</td>
    <td>:white_check_mark:</td>
    <td>:white_check_mark:</td>
    <td></td>
  </tr>
</table>

## Directory Structure

```
.
├── apps
│    ├── api                     # API, Auth, Storage, Realtime, Edge Functions
│    ├── app                     # Dashboard / App
│    ├── web                     # Landing page
│    └── mobile                  # Mobile apps using Expo
├── packages
│    └── ui                      # UI utils, styling, and components
├── tooling                      # Tooling configuration
│    └── eslint-config
│    └── prettier-config
│    └── typescript-config
├── turbo.json
├── LICENSE
└── README.md
```

## Getting Started

Clone this repo locally with the following command:

```bash
bunx degit esisonhq/esk
```

1. Install dependencies using bun:

```sh
bun i
```

2. Copy `.env.example` to `.env` and update the variables.

```sh
# Copy .env.example to .env for each app
cp apps/api/.env.example apps/api/.env
cp apps/app/.env.example apps/app/.env
cp apps/web/.env.example apps/web/.env
```

4. Start the development server from either bun or turbo:

```ts
bun dev // starts everything in development mode (web, app, api, email)
bun dev:web // starts the web app in development mode
bun dev:app // starts the app in development mode
bun dev:api // starts the api in development mode
bun dev:email // starts the email app in development mode

// Database
bun migrate // run migrations
bun seed // run seed
```

## How to Use

See [Documentation](https://esk.run/docs)
