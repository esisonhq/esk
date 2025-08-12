import { createRouter } from '@/lib/create-app';

import taskRouter from './tasks';

const restRouter = createRouter()
  // API Versioning
  .basePath('/api/v1')

  // Routes
  .route('/', taskRouter);

export { restRouter };
export type RestRoutes = typeof restRouter;
