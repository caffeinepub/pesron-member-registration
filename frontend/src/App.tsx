import { createRouter, createRoute, createRootRoute, RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InternetIdentityProvider } from './hooks/useInternetIdentity';
import { Layout } from './components/Layout';
import { ProfileSetup } from './components/ProfileSetup';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import FormBuilderPage from './pages/FormBuilderPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function LayoutWithProfileSetup() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      <Layout />
      {showProfileSetup && <ProfileSetup open={true} />}
    </>
  );
}

const rootRoute = createRootRoute({
  component: LayoutWithProfileSetup,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: RegisterPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});

const formBuilderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/form-builder',
  component: FormBuilderPage,
});

const routeTree = rootRoute.addChildren([indexRoute, adminRoute, formBuilderRoute]);

const router = createRouter({ routeTree });

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InternetIdentityProvider>
        <RouterProvider router={router} />
      </InternetIdentityProvider>
    </QueryClientProvider>
  );
}

export default App;
