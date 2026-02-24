import { Link, Outlet, useRouterState } from '@tanstack/react-router';
import { Users, UserPlus, Settings } from 'lucide-react';
import { LoginButton } from './LoginButton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';

export function Layout() {
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();

  const isAuthenticated = !!identity;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/assets/generated/pesron-logo.dim_200x200.png" 
                alt="PESRON Logo" 
                className="h-12 w-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">PESRON</h1>
                <p className="text-sm text-muted-foreground">Pendaftaran Ahli</p>
              </div>
            </div>
            <nav className="flex items-center gap-2">
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPath === '/'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Pendaftaran</span>
              </Link>
              {isAuthenticated && isAdmin && (
                <>
                  <Link
                    to="/admin"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPath === '/admin'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Senarai Ahli</span>
                  </Link>
                  <Link
                    to="/admin/form-builder"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPath === '/admin/form-builder'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Urus Borang</span>
                  </Link>
                </>
              )}
              <LoginButton />
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} PESRON. Hak Cipta Terpelihara.</p>
            <p>
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
