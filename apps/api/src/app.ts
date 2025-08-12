/**
 * Initializes and configures the Hono application.
 *
 * This setup includes:
 * - Creating the base Hono app instance via `createApp()`
 * - Registering OpenAPI documentation and Scalar UI via `createOpenAPI()`
 * - Mounting route modules (e.g., `index.route`)
 * - Defining a default root route (`/`) that returns a simple text response
 */
import { createApp } from '@/lib/create-app';
import { createOpenAPI } from '@/lib/open-api/create-open-api';
import { restRouter } from '@/rest/routes';

const app = createApp();

createOpenAPI(app);

app.route('/', restRouter);

app.get('/', (c) => {
  return c.text('Hello!');
});

export default app;
