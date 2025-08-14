import { createRouter } from '@/app';
import { auth } from './auth';
import { configuredProviders } from './providers';

export const authRouter = createRouter();

authRouter.on(['GET'], '/auth/providers', (c) => {
  return c.json(Object.keys(configuredProviders));
});

authRouter.on(['POST', 'GET'], '/auth/*', (c) => auth.handler(c.req.raw));
