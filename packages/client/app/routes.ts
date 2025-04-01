import { type RouteConfig, route, layout, index } from '@react-router/dev/routes';

export default [
  layout('./layouts/RootLayout.tsx', [
    index('./routes/home/_index.tsx'),
    route('/spots', './routes/spots/_index.tsx'),
    route('/spots/:id', './routes/spots/$id/_index.tsx'),
    route('/map', './routes/map/_index.tsx'),
    route('/profile', './routes/profile/_index.tsx'),
    route('/auth', './routes/auth/_index.tsx'),
    route('/about', './routes/about/_index.tsx'),
    route('/terms', './routes/terms/_index.tsx'),
    route('/privacy', './routes/privacy/_index.tsx'),
  ]),
] satisfies RouteConfig;
