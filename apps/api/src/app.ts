import { OpenAPIHono } from '@hono/zod-openapi';
import { requestId } from 'hono/request-id';

import logger from '@/middleware/logger';
import notFound from '@/middleware/not-found';
import onError from '@/middleware/on-error';

const app = new OpenAPIHono();
// Set request ID for tracking
app.use(requestId());

// Logger middleware for debugging
app.use(logger);

// Routes
app.get('/', (c) => {
  return c.text('Hello Hono!');
});

// Default Handlers
app.notFound(notFound);
app.onError(onError);

export default app;
