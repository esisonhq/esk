import { createRouter } from '@/app';

import { list } from './list';

const router = createRouter()
  .basePath('/tasks')
  .openapi(list.route, list.handler);

export default router;
