/**
 * Entry point for starting the Hono server using the Node.js runtime.
 *
 * This script:
 * - Imports the configured Hono app
 * - Loads environment variables from the `env` module
 * - Logs the server URL to the console
 * - Starts the server using `@hono/node-server` on the specified port
 *
 * @remarks
 * - The server uses the `fetch` handler from the Hono app for request processing.
 * - Port configuration is sourced from the `env` module.
 *
 * @example
 * ```bash
 * bun run src/server.ts
 * ```
 *
 * @see {@link https://hono.dev} for Hono framework documentation
 * @see {@link https://github.com/honojs/node-server} for Node server integration
 */
import { serve } from '@hono/node-server';

import app from '@/app';
import env from '@/env';

console.log(`Server is running on port http://localhost:${env.PORT}`);

serve({
  fetch: app.fetch,
  port: env.PORT,
});
