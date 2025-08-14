import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from 'hono';
import SuperJSON from 'superjson';

import { AppBindings } from '@/types/app';
import { withRPCReadAfterWrite } from './middleware/read-after-write';

/**
 * Creates the tRPC context from the Hono request context.
 *
 * @remarks
 * Extracts shared bindings such as `requestId`, `logger`, `db`, `session`, and `user`
 * from the Hono context and returns them as the tRPC context.
 *
 * @param _ - Unused first argument required by tRPC context signature
 * @param c - Hono context containing application bindings
 * @returns A typed context object for use in tRPC procedures
 */
export async function createTRPCContext(
  _: unknown,
  c: Context<AppBindings>,
): Promise<AppBindings['Variables']> {
  return {
    requestId: c.get('requestId'),
    logger: c.get('logger'),
    db: c.get('db'),
    session: c.get('session'),
    user: c.get('user'),
  };
}

// Initializes the tRPC instance with the application context and SuperJSON transformer.
const t = initTRPC.context<AppBindings['Variables']>().create({
  transformer: SuperJSON,
});

// Factory for creating tRPC routers.
export const trpcRouter = t.router;

//Factory for creating tRPC callers.
export const trpcCallerFactory = t.createCallerFactory;

/**
 * Public tRPC procedure with read-after-write middleware.
 *
 * @remarks
 * This procedure does not enforce authentication and can be used for open endpoints.
 * The `withRPCReadAfterWrite` middleware ensures consistency for read-after-write operations.
 *
 * @example
 * ```ts
 * export const hello = publicProcedure.query(() => 'Hello world');
 * ```
 */
export const publicProcedure = t.procedure.use(withRPCReadAfterWrite);

/**
 * Protected tRPC procedure requiring authentication.
 *
 * @remarks
 * Combines `withRPCReadAfterWrite` with an authentication guard.
 * Throws a `TRPCError` with code `'UNAUTHORIZED'` if session or user is missing.
 *
 * @example
 * ```ts
 * export const getProfile = protectedProcedure.query(({ ctx }) => {
 *   return ctx.user;
 * });
 * ```
 */
export const protectedProcedure = t.procedure
  .use(withRPCReadAfterWrite)
  .use(async ({ ctx, next }) => {
    const { session, user } = ctx;

    if (!session || !user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next();
  });
