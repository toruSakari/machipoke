import 'react-router';

declare module 'react-router' {
  interface Register {
    params: Params;
  }
}

type Params = {
  '/': {};
  '/spots': {};
  '/spots/new': {};
  '/spots/:id': {
    id: string;
  };
  '/spots/:id/edit': {
    id: string;
  };
  '/map': {};
  '/profile': {};
  '/auth': {};
  '/about': {};
  '/terms': {};
  '/privacy': {};
};
