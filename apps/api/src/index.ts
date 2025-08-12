/**
 * Entry point for starting the Hono server using the Node.js runtime.
 *
 * This script:
 * - Imports the configured Hono app
 * - Loads environment variables from the `env` module
 * - Logs the server URL to the console
 * - Starts the server using `@hono/node-server` on the specified port
 */
import { serve } from '@hono/node-server';

import app from '@/app';
import env from '@/env';

console.log(`Server is running on port http://localhost:${env.PORT}`);

serve({
  fetch: app.fetch,
  port: env.PORT,
});
