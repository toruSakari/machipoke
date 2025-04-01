import 'react-router';

declare module 'react-router' {
  interface Register {
    params: Params;
  }
}

type Params = {
  '/': {};
  '/spots': {};
  '/spots/:id': {
    id: string;
  };
  '/map': {};
  '/profile': {};
  '/auth': {};
  '/about': {};
  '/terms': {};
  '/privacy': {};
};
