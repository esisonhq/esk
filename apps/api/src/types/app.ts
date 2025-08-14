import { OpenAPIHono, RouteConfig, RouteHandler } from '@hono/zod-openapi';
import { Schema } from 'hono';
import { Logger } from 'pino';

import { Database } from '@esk/db/client';

import { auth } from '@/lib/auth/auth';

export type AppBindings = {
  Variables: {
    requestId: string;
    logger: Logger;
    db: Database;
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
};

export type AppOpenAPI<S extends Schema = Record<string, never>> = OpenAPIHono<
  AppBindings,
  S
>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppBindings
>;
