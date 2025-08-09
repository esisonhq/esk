import { createRouter as createTanStackRouter } from '@tanstack/react-router';

import { DefaultCatchBoundary } from '@/components/default-catch-boundary';
import { DefaultNotFound } from '@/components/default-not-found';
import { routeTree } from '@/routeTree.gen';
import NProgress from '@esk/ui/utils/nprogress';

export function createRouter() {
  // Set up a Router instance
  const router = createTanStackRouter({
    routeTree,
    context: {
      theme: 'dark', // Default theme, will be overridden by server function
    },
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 30_000,
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => <DefaultNotFound />,
  });

  // Subscribe to router events to show loading bar NProgress
  // Run only on client
  if (typeof window !== 'undefined') {
    router.subscribe(
      'onBeforeLoad',
      ({ pathChanged }) => pathChanged && NProgress.start(),
    );
    router.subscribe('onLoad', () => NProgress.done());
  }

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
