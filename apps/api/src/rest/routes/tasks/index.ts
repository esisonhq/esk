import { createRouter } from '@/app';

import { create } from './create';
import { get } from './get';
import { list } from './list';
import { remove } from './remove';
import { update } from './update';

const router = createRouter()
  .basePath('/tasks')
  .openapi(get.route, get.handler)
  .openapi(list.route, list.handler)
  .openapi(create.route, create.handler)
  .openapi(update.route, update.handler)
  .openapi(remove.route, remove.handler);

export default router;
