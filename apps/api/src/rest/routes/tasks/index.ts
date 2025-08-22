import { createRouter } from '@/app';

import { create } from './create';
import { get } from './get';
import { list } from './list';

const router = createRouter()
  .basePath('/tasks')
  .openapi(get.route, get.handler)
  .openapi(list.route, list.handler)
  .openapi(create.route, create.handler);

export default router;
