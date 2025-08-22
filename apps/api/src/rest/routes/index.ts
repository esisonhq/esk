import { createRouter } from '@/app';
import { authRouter } from '@/lib/auth/routes';
import { withRateLimiter } from '@/middleware/rate-limiter';
import { withRESTReadAfterWrite } from '@/rest/middleware/read-after-write';

import healthRouter from './health';
import tasksRouter from './tasks';

// Public Routes
const baseRouter = createRouter()
  .use(withRateLimiter)
  .use(withRESTReadAfterWrite)
  .route('/', authRouter)
  .route('/', healthRouter);

// Protected Routes
// .use(requireAuth)
const protectedRestRouter = createRouter()
  .basePath('/v1')
  .route('/', tasksRouter);

// Mount both routers
const restRouter = baseRouter.route('/', protectedRestRouter);

export { restRouter };
export type RestRouter = typeof restRouter;
