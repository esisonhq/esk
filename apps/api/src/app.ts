import { trpcServer } from '@hono/trpc-server';
import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';
import { timeout } from 'hono/timeout';

import { env } from '@esk/utils/env';

import { createOpenAPI } from '@/lib/open-api/create-open-api';
import defaultHook from '@/lib/open-api/default-hook';
import { withAuth } from '@/middleware/auth';
import { withDatabase } from '@/middleware/db';
import { withLogger } from '@/middleware/logger';
import notFound from '@/middleware/not-found';
import onError from '@/middleware/on-error';
import { restRouter } from '@/rest/routes';
import { createTRPCContext } from '@/rpc';
import { appRouter } from '@/rpc/routes';
import { AppBindings } from '@/types/app';

const allowedOrigins = env.ALLOWED_ORIGINS?.split(',') || [];

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
}

const app = createRouter();

// Security middleware
app.use(secureHeaders());

// CORS configuration
app.use(
  '*',
  cors({
    origin: (origin) => {
      if (allowedOrigins.includes(origin)) {
        return origin;
      }
      return undefined;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowHeaders: [
      'Authorization',
      'Content-Type',
      'Accept',
      'Accept-Language',
      'X-API-Version',
      'X-User-Locale',
      'X-User-Timezone',
      'X-User-Country',
      'X-TRPC-Source',
      'X-Request-ID',
    ],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  }),
);

// Request timeout (30 seconds)
app.use(timeout(30000));

// Request ID for tracking
app.use(requestId());

// Logger middleware for debugging
app.use(withLogger);

// Database middleware
app.use(withDatabase);

// Authentication middleware, this only sets session/user
app.use(withAuth);

// Default Handlers
app.notFound(notFound);
app.onError(onError);

// RPC EndPoints
app.use(
  '/rpc/*',
  trpcServer({
    router: appRouter,
    createContext: createTRPCContext,
  }),
);

// OpenAPI EndPoints
createOpenAPI(app);

// Rest EndPoints
app.route('/', restRouter);

app.get('/', (c) => {
  return c.text('Hello!');
});

export default app;
