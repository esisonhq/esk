import { createRouter } from '@/lib/create-app';

import { healthCheck } from './health';
import taskRouter from './tasks';

const restRouter = createRouter()
  // API Versioning
  .basePath('/api/v1')

  // Health check endpoint
  .openapi(healthCheck.route, healthCheck.handler)

  // Routes
  .route('/', taskRouter);

export { restRouter };
export type RestRouter = typeof restRouter;
