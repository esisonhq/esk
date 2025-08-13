import { createRouter } from '@/lib/create-app';

import { list } from './list';

const router = createRouter()
  .basePath('/tasks')
  .openapi(list.route, list.handler);

export default router;
