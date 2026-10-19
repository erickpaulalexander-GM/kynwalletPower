import { useCallback, useEffect, useState } from 'react';
import type { Authenticate } from '@/application/authenticate';
import { createRegisterUser, type RegisterUser } from '@/application/registerUser';
import { MESSAGES } from '@/domain/messages';
import { LoginForm } from '@/ui/features/login/LoginForm';
import { LoginScreen } from '@/ui/features/login/LoginScreen';
import { RegisterForm } from '@/ui/features/register/RegisterForm';

type AppRoute = '/login' | '/register';

type AppProps = {
  authenticate: Authenticate;
  registerUser?: RegisterUser;
};

const defaultRegisterUser = createRegisterUser();

function resolveRoute(pathname: string): AppRoute {
  return pathname === '/register' ? '/register' : '/login';
}

export function App({ authenticate, registerUser = defaultRegisterUser }: AppProps) {
  const [route, setRoute] = useState<AppRoute>(() => resolveRoute(window.location.pathname));
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    const syncRouteWithLocation = () => {
      const currentPath = window.location.pathname;
      const normalized = resolveRoute(currentPath);
      if (currentPath !== normalized) {
        window.history.replaceState(null, '', normalized);
      }
      setRoute(normalized);
      if (normalized === '/register') {
        setRegistrationSuccess(false);
      }
    };

    syncRouteWithLocation();
    window.addEventListener('popstate', syncRouteWithLocation);
    return () => {
      window.removeEventListener('popstate', syncRouteWithLocation);
    };
  }, []);

  const navigateToRegister = useCallback(() => {
    setRegistrationSuccess(false);
    window.history.pushState(null, '', '/register');
    setRoute('/register');
  }, []);

  const navigateToLogin = useCallback(() => {
    setRegistrationSuccess(false);
    window.history.pushState(null, '', '/login');
    setRoute('/login');
  }, []);

  const handleRegisterSuccess = useCallback(() => {
    setRegistrationSuccess(true);
    window.history.pushState(null, '', '/login');
    setRoute('/login');
  }, []);

  const clearSuccessMessage = useCallback(() => {
    setRegistrationSuccess(false);
  }, []);

  return (
    <LoginScreen
      variant={route === '/register' ? 'register' : 'login'}
      hideBrandOnMobile={route === '/register'}
    >
      {route === '/register' ? (
        <RegisterForm
          registerUser={registerUser}
          onSuccess={handleRegisterSuccess}
          onNavigateToLogin={navigateToLogin}
        />
      ) : (
        <LoginForm
          authenticate={authenticate}
          onNavigateToRegister={navigateToRegister}
          successMessage={registrationSuccess ? MESSAGES.REGISTER_SUCCESS : null}
          onClearSuccessMessage={clearSuccessMessage}
        />
      )}
    </LoginScreen>
  );
}
