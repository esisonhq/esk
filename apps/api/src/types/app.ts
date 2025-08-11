import { OpenAPIHono, RouteConfig, RouteHandler } from '@hono/zod-openapi';
import { Schema } from 'hono';
import { Logger } from 'pino';

export type AppBindings = {
  Variables: {
    logger: Logger;
  };
};

export type AppOpenAPI<S extends Schema = {}> = OpenAPIHono<AppBindings, S>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppBindings
>;
