/**
 * Initializes and configures the Hono application.
 *
 * This setup includes:
 * - Creating the base Hono app instance via `createApp()`
 * - Registering OpenAPI documentation and Scalar UI via `createOpenAPI()`
 * - Mounting route modules (e.g., `index.route`)
 * - Defining a default root route (`/`) that returns a simple text response
 *
 * @remarks
 * - The OpenAPI spec is exposed at `/docs`
 * - The Scalar interactive API reference is available at `/reference`
 * - All routes from the `routes` array are mounted at the root path (`/`)
 *
 * @see {@link createApp} for initializing the Hono app
 * @see {@link createOpenAPI} for OpenAPI + Scalar documentation setup
 */
import { createApp } from '@/lib/create-app';
import { createOpenAPI } from '@/lib/open-api/create-open-api';
import index from '@/routes/index.route';

const app = createApp();

// OpenAPI + Scalar Documentation Setup
createOpenAPI(app);

// Register Routes
const routes = [index];
routes.forEach((route) => {
  app.route('/', route);
});

// Root Index Route
app.get('/', (c) => {
  return c.text('Hello!');
});

export default app;
