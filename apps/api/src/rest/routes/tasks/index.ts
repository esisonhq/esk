import { createRouter } from '@/lib/create-app';

import { listHandler, listRoute } from './list';

const router = createRouter()
  .basePath('/tasks')
  .openapi(listRoute, listHandler);

export default router;
