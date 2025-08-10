/// <reference types="vite/client" />
import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import * as React from 'react';

import { DefaultCatchBoundary } from '@/components/default-catch-boundary';
import { DefaultNotFound } from '@/components/default-not-found';
import { ThemeToggle } from '@/components/theme-toggle';
import { siteConfig } from '@/config/site-config';
import {
  getThemeServerFn,
  Theme,
  ThemeProvider,
  useTheme,
} from '@/providers/theme-provider';
import { seo } from '@/utils/seo';

import appCss from '@/config/app.css?url';

export interface RootRouteContext {
  theme: Theme;
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
  beforeLoad: async () => {
    const theme = await getThemeServerFn();

    return {
      theme,
    };
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      ...seo({
        title: siteConfig.seo.title,
        description: siteConfig.seo.description,
        keywords: siteConfig.seo.keywords,
        image: siteConfig.seo.image,
        twitter: siteConfig.seo.twitter,
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '96x96',
        href: '/favicon-96x96.png',
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        sizes: 'any',
        href: '/favicon.svg',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
    scripts: [
      {
        type: 'text/javascript',
        children: `
          (function() {
            try {
              var theme = document.cookie.match(/esk-ui-theme=([^;]+)/)?.[1] || 'light';
              document.documentElement.className = theme;
            } catch (e) {
              document.documentElement.className = 'light';
            }
          })();
        `,
      },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <DefaultNotFound />,
  shellComponent: RootComponent,
});

function RootComponent() {
  const context = Route.useRouteContext();
  const theme = context.theme as Theme;

  return (
    <ThemeProvider theme={theme}>
      <RootDocument>
        <Outlet />
      </RootDocument>
    </ThemeProvider>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <html className={theme}>
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="p-2 flex gap-2 text-lg">
          <Link
            to="/"
            activeProps={{
              className: 'font-bold',
            }}
            activeOptions={{ exact: true }}
          >
            Home
          </Link>
          <Link
            // @ts-expect-error This route intentionally does not exist
            to="/this-route-does-not-exist"
            activeProps={{
              className: 'font-bold',
            }}
          >
            This Route Does Not Exist
          </Link>
          <ThemeToggle />
        </div>
        <hr />
        <main>{children}</main>
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
