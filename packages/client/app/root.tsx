import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError } from 'react-router';
import ErrorPage from '@/routes/error-page';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import type { Route } from './+types/root';
import './styles/app.css';

export function links() {
  return [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      href: '/logo192.png',
    },
    {
      rel: 'manifest',
      href: '/manifest.json',
    },
  ];
}

export function Layout({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <Meta />
        <Links />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <ErrorPage error={error} />;
}
