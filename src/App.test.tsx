import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '@/test/a11y';
import { createAuthStub } from '@/test/authStub';
import { TEST_ACCOUNT } from '@/test/fixtures';
import { createRegisterStub } from '@/test/registerStub';
import logoMark from '@/ui/assets/logo-mark.svg';
import logoMarkRegister from '@/ui/assets/logo-mark-register.svg';
import { App } from './App';

beforeEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('App · accesibilidad de la pantalla completa (FR-015, SC-005)', () => {
  it('vista de login sin violaciones', async () => {
    const { container } = render(<App authenticate={createAuthStub().authenticate} />);
    await expectNoA11yViolations(container);
  });

  it('vista de login con errores visibles sin violaciones', async () => {
    const { container } = render(<App authenticate={createAuthStub().authenticate} />);
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await userEvent.click(screen.getByRole('button', { name: 'Google' }));
    await expectNoA11yViolations(container);
  });

  it('vista de bienvenida sin violaciones', async () => {
    const { container } = render(<App authenticate={createAuthStub().authenticate} />);
    await userEvent.type(screen.getByLabelText('Correo electrónico'), TEST_ACCOUNT.email);
    await userEvent.type(screen.getByLabelText('Contraseña'), TEST_ACCOUNT.password);
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await screen.findByRole('heading', { name: /Bienvenido,/ });
    await expectNoA11yViolations(container);
  });

  it('FR-012, SC-004 (a): vista /register en estado inicial sin violaciones de accesibilidad', async () => {
    window.history.replaceState(null, '', '/register');
    const { container } = render(
      <App
        authenticate={createAuthStub().authenticate}
        registerUser={createRegisterStub().registerUser}
      />,
    );
    await expectNoA11yViolations(container);
  });

  it('FR-012, SC-004 (b): vista /register con los 5 errores inline visibles y alerta "Próximamente" activa sin violaciones', async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, '', '/register');
    const { container } = render(
      <App
        authenticate={createAuthStub().authenticate}
        registerUser={createRegisterStub().registerUser}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    await user.click(screen.getByRole('button', { name: 'Google' }));
    await expectNoA11yViolations(container);
  });

  it('FR-012, SC-004 (c): vista /login mostrando el mensaje de éxito tras completar el registro sin violaciones', async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, '', '/register');
    const { container } = render(
      <App
        authenticate={createAuthStub().authenticate}
        registerUser={createRegisterStub({ kind: 'success' }).registerUser}
      />,
    );
    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez');
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.test');
    await user.type(screen.getByLabelText('Contraseña'), 'Password123');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Password123');
    await user.click(screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }));
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(screen.getByRole('status')).toHaveTextContent(
      '¡Cuenta creada exitosamente! Inicia sesión para continuar.',
    );
    await expectNoA11yViolations(container);
  });
});

describe('App · Enrutamiento /login ↔ /register y flujo post-registro (US1-1, US3-1 a US3-3, FR-009, FR-010, Obs. O1)', () => {
  it('US3-3: iniciar en "/" normaliza window.location.pathname a "/login" y muestra la vista de inicio de sesión', () => {
    window.history.replaceState(null, '', '/');
    render(<App authenticate={createAuthStub().authenticate} />);

    expect(window.location.pathname).toBe('/login');
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
  });

  it('Obs. O1: iniciar en una ruta desconocida ("/desconocida") normaliza a "/login" y muestra login', () => {
    window.history.replaceState(null, '', '/desconocida');
    render(<App authenticate={createAuthStub().authenticate} />);

    expect(window.location.pathname).toBe('/login');
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
  });

  it('Obs. O1: acceso directo a "/register" mantiene la ruta y muestra el formulario de registro', () => {
    window.history.replaceState(null, '', '/register');
    render(<App authenticate={createAuthStub().authenticate} />);

    expect(window.location.pathname).toBe('/register');
    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument();
  });

  it('US3-2, US3-1: navega de /login a /register con "Regístrate" y regresa a /login con "Inicia sesión"', async () => {
    const user = userEvent.setup();
    render(
      <App
        authenticate={createAuthStub().authenticate}
        registerUser={createRegisterStub().registerUser}
      />,
    );

    await user.type(screen.getByLabelText('Correo electrónico'), 'temporal@example.test');
    await user.click(screen.getByRole('button', { name: 'Regístrate' }));

    expect(window.location.pathname).toBe('/register');
    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('');

    await user.type(screen.getByLabelText('Nombre completo'), 'Temporal');
    await user.click(screen.getByRole('button', { name: 'Inicia sesión' }));

    expect(window.location.pathname).toBe('/login');
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('');
  });

  it('Obs. O1: responde al evento popstate (Atrás/Adelante del navegador) sincronizando la vista activa', async () => {
    const user = userEvent.setup();
    render(
      <App
        authenticate={createAuthStub().authenticate}
        registerUser={createRegisterStub().registerUser}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Regístrate' }));
    expect(window.location.pathname).toBe('/register');
    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument();

    act(() => {
      window.history.replaceState(null, '', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();

    act(() => {
      window.history.replaceState(null, '', '/register');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument();
  });

  it('US1-1: tras completar el registro en /register redirige a /login mostrando el mensaje de éxito y lo limpia al editar', async () => {
    const user = userEvent.setup();
    const registerStub = createRegisterStub({ kind: 'success' });
    window.history.replaceState(null, '', '/register');

    render(
      <App authenticate={createAuthStub().authenticate} registerUser={registerStub.registerUser} />,
    );

    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez');
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.test');
    await user.type(screen.getByLabelText('Contraseña'), 'Password123');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Password123');
    await user.click(screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }));
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(window.location.pathname).toBe('/login');
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      '¡Cuenta creada exitosamente! Inicia sesión para continuar.',
    );

    await user.type(screen.getByLabelText('Correo electrónico'), 'a');
    expect(
      screen.queryByText('¡Cuenta creada exitosamente! Inicia sesión para continuar.'),
    ).not.toBeInTheDocument();
  });
});

describe('App · Diseño responsive según ruta activa (US5-1, US5-2, FR-011)', () => {
  it('US5-1, US5-2: en /register activa hideBrandOnMobile y muestra el mensaje de marca de registro en LoginScreen', () => {
    window.history.replaceState(null, '', '/register');
    const { container } = render(<App authenticate={createAuthStub().authenticate} />);

    expect(container.firstElementChild).toHaveClass('screen');
    expect(container.firstElementChild).toHaveClass('hideBrandOnMobile');
    const banner = screen.getByRole('banner');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveTextContent('Comienza tu camino financiero.');
    expect(banner).toHaveTextContent(
      'Crea tu cuenta en minutos y empieza a enviar, recibir y administrar tu dinero desde cualquier lugar.',
    );
    const logoImg = banner.querySelector('img');
    expect(logoImg).toHaveAttribute('src', logoMarkRegister);
    expect(logoImg).toHaveAttribute('width', '20');
    expect(logoImg).toHaveAttribute('height', '28');
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('en /login no aplica hideBrandOnMobile y conserva el mensaje de marca de inicio de sesión', () => {
    window.history.replaceState(null, '', '/login');
    const { container } = render(<App authenticate={createAuthStub().authenticate} />);

    expect(container.firstElementChild).toHaveClass('screen');
    expect(container.firstElementChild).not.toHaveClass('hideBrandOnMobile');
    const banner = screen.getByRole('banner');
    expect(banner).toHaveTextContent('Tu dinero,sin fronteras.');
    expect(banner).toHaveTextContent(
      'Envía, recibe y paga en segundos. Una billetera pensada para tu día a día.',
    );
    const logoImg = banner.querySelector('img');
    expect(logoImg).toHaveAttribute('src', logoMark);
    expect(logoImg).toHaveAttribute('width', '20');
    expect(logoImg).toHaveAttribute('height', '44');
  });
});
