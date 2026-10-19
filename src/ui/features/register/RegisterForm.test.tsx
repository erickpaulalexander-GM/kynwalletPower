import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRegisterStub } from '@/test/registerStub';
import { RegisterForm } from './RegisterForm';

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez');
  await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.test');
  await user.type(screen.getByLabelText('Contraseña'), 'Password123');
  await user.type(screen.getByLabelText('Confirmar contraseña'), 'Password123');
  await user.click(screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }));
}

describe('RegisterForm — US1 (flujo principal de registro simulado)', () => {
  it('US1-1: completar los 4 campos, aceptar términos y enviar invoca registerUser y luego onSuccess', async () => {
    const user = userEvent.setup();
    const stub = createRegisterStub({ kind: 'success' });
    const onSuccess = vi.fn();

    render(<RegisterForm registerUser={stub.registerUser} onSuccess={onSuccess} />);

    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument();
    expect(screen.getByText('Completa tus datos para comenzar')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre completo')).toHaveAttribute(
      'placeholder',
      'Ej: Diego Martínez',
    );
    const termsHighlight = screen.getByText('términos y condiciones');
    expect(termsHighlight.tagName).toBe('SPAN');
    expect(termsHighlight).toHaveClass('termsHighlight');

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(stub.registerUser).toHaveBeenCalledOnce();
    expect(stub.registerUser).toHaveBeenCalledWith({
      fullName: 'Ana Pérez',
      email: 'ana@example.test',
      password: 'Password123',
      confirmPassword: 'Password123',
      termsAccepted: true,
    });
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('US1-2: durante el envío muestra "Creando cuenta…", deshabilita el botón e ignora envíos duplicados', async () => {
    const user = userEvent.setup();
    const stub = createRegisterStub({ kind: 'success' });
    stub.defer();
    const onSuccess = vi.fn();

    render(<RegisterForm registerUser={stub.registerUser} onSuccess={onSuccess} />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    const loadingBtn = screen.getByRole('button', { name: 'Creando cuenta…' });
    expect(loadingBtn).toBeDisabled();
    expect(loadingBtn).toHaveAttribute('aria-busy', 'true');

    await user.click(loadingBtn);
    await user.type(screen.getByLabelText('Correo electrónico'), '{Enter}');
    expect(stub.registerUser).toHaveBeenCalledOnce();
    expect(onSuccess).not.toHaveBeenCalled();

    await act(async () => {
      stub.release();
    });
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('US1-3: normaliza fullName (trim) y email (trim + minúsculas) antes de invocar registerUser', async () => {
    const user = userEvent.setup();
    const stub = createRegisterStub({ kind: 'success' });

    render(<RegisterForm registerUser={stub.registerUser} />);

    await user.type(screen.getByLabelText('Nombre completo'), '  Ana Pérez  ');
    await user.type(screen.getByLabelText('Correo electrónico'), '  ANA.Perez@Example.COM ');
    await user.type(screen.getByLabelText('Contraseña'), 'Password123');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Password123');
    await user.click(screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }));
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(stub.registerUser).toHaveBeenCalledWith({
      fullName: 'Ana Pérez',
      email: 'ana.perez@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      termsAccepted: true,
    });
  });

  it('US1-4: presionar Enter en un campo con datos válidos y términos aceptados envía el formulario', async () => {
    const user = userEvent.setup();
    const stub = createRegisterStub({ kind: 'success' });
    const onSuccess = vi.fn();

    render(<RegisterForm registerUser={stub.registerUser} onSuccess={onSuccess} />);

    await fillValidForm(user);
    await user.type(screen.getByLabelText('Confirmar contraseña'), '{Enter}');

    expect(stub.registerUser).toHaveBeenCalledOnce();
    expect(onSuccess).toHaveBeenCalledOnce();
  });
});

describe('RegisterForm — US2 (validación inline y gestión de foco)', () => {
  it('US2-1, US2-7: enviar vacío muestra los 5 errores obligatorios, los asocia accesiblemente, bloquea registerUser y enfoca "Nombre completo"', async () => {
    const user = userEvent.setup();
    const stub = createRegisterStub();

    render(<RegisterForm registerUser={stub.registerUser} />);

    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(stub.registerUser).not.toHaveBeenCalled();

    const fullName = screen.getByLabelText('Nombre completo');
    const email = screen.getByLabelText('Correo electrónico');
    const password = screen.getByLabelText('Contraseña');
    const confirmPassword = screen.getByLabelText('Confirmar contraseña');
    const terms = screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' });

    expect(fullName).toHaveFocus();
    expect(fullName).toHaveAttribute('aria-invalid', 'true');
    expect(fullName).toHaveAccessibleDescription('Ingresa tu nombre completo');
    expect(email).toHaveAccessibleDescription('Ingresa tu correo electrónico');
    expect(password).toHaveAccessibleDescription('Ingresa tu contraseña');
    expect(confirmPassword).toHaveAccessibleDescription('Confirma tu contraseña');
    expect(terms).toHaveAccessibleDescription('Debes aceptar los términos y condiciones');
  });

  it('US2-2: escribir correo inválido y perder el foco muestra error inline y aria-invalid="true"', async () => {
    const user = userEvent.setup();
    const stub = createRegisterStub();

    render(<RegisterForm registerUser={stub.registerUser} />);

    const email = screen.getByLabelText('Correo electrónico');
    await user.type(email, 'usuario@');
    await user.tab();

    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription('Ingresa un correo electrónico válido');

    await user.clear(screen.getByLabelText('Nombre completo'));
    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez');
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(email).toHaveFocus();
  });

  it('US2-3: contraseña de menos de 8 caracteres muestra error inline y recibe el foco al enviar si nombre y correo son válidos', async () => {
    const user = userEvent.setup();
    const stub = createRegisterStub();

    render(<RegisterForm registerUser={stub.registerUser} />);

    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez');
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.test');
    const password = screen.getByLabelText('Contraseña');
    await user.type(password, '1234567');
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(stub.registerUser).not.toHaveBeenCalled();
    expect(password).toHaveFocus();
    expect(password).toHaveAccessibleDescription('La contraseña debe tener al menos 8 caracteres');
  });

  it('US2-4: confirmación distinta muestra "Las contraseñas no coinciden", enfoca Confirmar contraseña y se reevalúa si cambia Contraseña', async () => {
    const user = userEvent.setup();
    const stub = createRegisterStub();

    render(<RegisterForm registerUser={stub.registerUser} />);

    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez');
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.test');
    const password = screen.getByLabelText('Contraseña');
    const confirmPassword = screen.getByLabelText('Confirmar contraseña');

    await user.type(password, 'Password123');
    await user.type(confirmPassword, 'OtraClave123');
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(stub.registerUser).not.toHaveBeenCalled();
    expect(confirmPassword).toHaveFocus();
    expect(confirmPassword).toHaveAccessibleDescription('Las contraseñas no coinciden');

    // Corregir confirmación limpia el error
    await user.clear(confirmPassword);
    await user.type(confirmPassword, 'Password123');
    expect(screen.queryByText('Las contraseñas no coinciden')).not.toBeInTheDocument();

    // Si después cambia Contraseña, aparece inmediatamente el error en Confirmar contraseña
    await user.type(password, 'X');
    expect(confirmPassword).toHaveAccessibleDescription('Las contraseñas no coinciden');
  });

  it('US2-5: con los 4 campos válidos y términos sin marcar, muestra el error del checkbox, bloquea el envío y mueve el foco al checkbox', async () => {
    const user = userEvent.setup();
    const stub = createRegisterStub();

    render(<RegisterForm registerUser={stub.registerUser} />);

    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez');
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.test');
    await user.type(screen.getByLabelText('Contraseña'), 'Password123');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Password123');
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    const terms = screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' });
    expect(stub.registerUser).not.toHaveBeenCalled();
    expect(terms).toHaveFocus();
    expect(terms).toHaveAttribute('aria-invalid', 'true');
    expect(terms).toHaveAccessibleDescription('Debes aceptar los términos y condiciones');
  });

  it('US2-6: corregir cada campo o marcar el checkbox oculta inmediatamente su error y retira aria-invalid', async () => {
    const user = userEvent.setup();
    const stub = createRegisterStub();

    render(<RegisterForm registerUser={stub.registerUser} />);

    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    const fullName = screen.getByLabelText('Nombre completo');
    const terms = screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' });

    await user.type(fullName, 'Ana Pérez');
    expect(fullName).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByText('Ingresa tu nombre completo')).not.toBeInTheDocument();

    await user.click(terms);
    expect(terms).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByText('Debes aceptar los términos y condiciones')).not.toBeInTheDocument();
  });
});

describe('RegisterForm — US3 (navegación hacia inicio de sesión)', () => {
  it('US3-1: muestra "¿Ya tienes cuenta?" y el botón "Inicia sesión" invoca onNavigateToLogin sin enviar el formulario', async () => {
    const user = userEvent.setup();
    const stub = createRegisterStub();
    const onNavigateToLogin = vi.fn();

    render(<RegisterForm registerUser={stub.registerUser} onNavigateToLogin={onNavigateToLogin} />);

    expect(screen.getByText('¿Ya tienes cuenta?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Inicia sesión' }));

    expect(onNavigateToLogin).toHaveBeenCalledOnce();
    expect(stub.registerUser).not.toHaveBeenCalled();
  });
});

describe('RegisterForm — US4 (botones de Google y Apple muestran "Próximamente")', () => {
  it.each(['Google', 'Apple'])(
    'US4-1, FR-008, Obs. O2: activar "%s" muestra Alert tone="info" con "Próximamente", conserva los datos y no envía el formulario',
    async (provider) => {
      const user = userEvent.setup();
      const stub = createRegisterStub();

      render(<RegisterForm registerUser={stub.registerUser} />);

      expect(screen.getByText('o regístrate con')).toBeInTheDocument();

      const fullName = screen.getByLabelText('Nombre completo');
      const email = screen.getByLabelText('Correo electrónico');
      await user.type(fullName, 'Ana Pérez');
      await user.type(email, 'ana@example.test');

      await user.click(screen.getByRole('button', { name: provider }));

      expect(screen.getByRole('status')).toHaveTextContent(/^Próximamente$/);
      expect(fullName).toHaveValue('Ana Pérez');
      expect(email).toHaveValue('ana@example.test');
      expect(stub.registerUser).not.toHaveBeenCalled();
    },
  );

  it('el aviso "Próximamente" desaparece al enviar el formulario', async () => {
    const user = userEvent.setup();
    const stub = createRegisterStub();

    render(<RegisterForm registerUser={stub.registerUser} />);

    await user.click(screen.getByRole('button', { name: 'Google' }));
    expect(screen.getByRole('status')).toHaveTextContent('Próximamente');

    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

describe('RegisterForm — US5 (visibilidad independiente de contraseñas y navegación por teclado)', () => {
  it('US5-3, FR-007: alterna la visibilidad de "Contraseña" y "Confirmar contraseña" de forma independiente', async () => {
    const user = userEvent.setup();
    const stub = createRegisterStub();

    render(<RegisterForm registerUser={stub.registerUser} />);

    const password = screen.getByLabelText('Contraseña');
    const confirmPassword = screen.getByLabelText('Confirmar contraseña');
    const [togglePassword, toggleConfirm] = screen.getAllByRole('button', {
      name: 'Mostrar contraseña',
    });
    if (!togglePassword || !toggleConfirm) {
      throw new Error('Se esperaban 2 controles de visibilidad de contraseña');
    }

    expect(password).toHaveAttribute('type', 'password');
    expect(confirmPassword).toHaveAttribute('type', 'password');

    await user.click(togglePassword);
    expect(password).toHaveAttribute('type', 'text');
    expect(togglePassword).toHaveAccessibleName('Ocultar contraseña');
    expect(togglePassword).toHaveAttribute('aria-pressed', 'true');
    expect(confirmPassword).toHaveAttribute('type', 'password');
    expect(toggleConfirm).toHaveAccessibleName('Mostrar contraseña');
    expect(toggleConfirm).toHaveAttribute('aria-pressed', 'false');

    await user.click(toggleConfirm);
    expect(confirmPassword).toHaveAttribute('type', 'text');
    expect(toggleConfirm).toHaveAccessibleName('Ocultar contraseña');
    expect(toggleConfirm).toHaveAttribute('aria-pressed', 'true');

    await user.click(togglePassword);
    expect(password).toHaveAttribute('type', 'password');
    expect(confirmPassword).toHaveAttribute('type', 'text');
  });

  it('FR-012: recorre todos los controles interactivos en orden lógico con Tab', async () => {
    const user = userEvent.setup();
    const stub = createRegisterStub();

    render(<RegisterForm registerUser={stub.registerUser} />);

    const [togglePassword, toggleConfirm] = screen.getAllByRole('button', {
      name: 'Mostrar contraseña',
    });
    if (!togglePassword || !toggleConfirm) {
      throw new Error('Se esperaban 2 controles de visibilidad de contraseña');
    }
    const expectedOrder = [
      screen.getByLabelText('Nombre completo'),
      screen.getByLabelText('Correo electrónico'),
      screen.getByLabelText('Contraseña'),
      togglePassword,
      screen.getByLabelText('Confirmar contraseña'),
      toggleConfirm,
      screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }),
      screen.getByRole('button', { name: 'Crear cuenta' }),
      screen.getByRole('button', { name: 'Google' }),
      screen.getByRole('button', { name: 'Apple' }),
      screen.getByRole('button', { name: 'Inicia sesión' }),
    ];

    for (const element of expectedOrder) {
      await user.tab();
      expect(element).toHaveFocus();
    }
  });

  it('muestra alerta de error si el caso de uso devuelve unavailable', async () => {
    const user = userEvent.setup();
    const stub = createRegisterStub({ kind: 'unavailable' });

    render(<RegisterForm registerUser={stub.registerUser} />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Servicio de acceso no disponible. Intenta más tarde.',
    );
  });
});

describe('RegisterForm — Seguridad (FR-013, SC-006)', () => {
  it('FR-013: ni Contraseña ni Confirmar contraseña aparecen en el DOM, la URL, console.* ni Storage.prototype.setItem', async () => {
    const user = userEvent.setup();
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const consoleSpies = (['log', 'info', 'warn', 'error', 'debug'] as const).map((method) =>
      vi.spyOn(console, method),
    );
    const secretPassword = 'ClaveUltraSecreta#2026';
    const stub = createRegisterStub({ kind: 'success' });

    render(<RegisterForm registerUser={stub.registerUser} />);

    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez');
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.test');
    await user.type(screen.getByLabelText('Contraseña'), secretPassword);
    await user.type(screen.getByLabelText('Confirmar contraseña'), secretPassword);
    await user.click(screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }));
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    const serialized = [
      document.body.textContent ?? '',
      window.location.href,
      ...setItem.mock.calls.flat(),
      ...consoleSpies.flatMap((spy) => spy.mock.calls.flat().map(String)),
    ].join('\n');

    expect(serialized).not.toContain(secretPassword);
    expect(setItem).not.toHaveBeenCalled();

    setItem.mockRestore();
    consoleSpies.forEach((spy) => spy.mockRestore());
  });
});
