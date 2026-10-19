import { initialRegisterState, registerReducer, type RegisterState } from './registerReducer';

const validState: RegisterState = {
  ...initialRegisterState,
  values: {
    fullName: 'Ana Pérez',
    email: 'ana@example.test',
    password: 'Password123',
    confirmPassword: 'Password123',
  },
  termsAccepted: true,
};

describe('registerReducer', () => {
  it('estado inicial: editing con valores vacíos y termsAccepted en false', () => {
    expect(initialRegisterState.status).toBe('editing');
    expect(initialRegisterState.values).toEqual({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    expect(initialRegisterState.termsAccepted).toBe(false);
    expect(initialRegisterState.fieldErrors).toEqual({});
    expect(initialRegisterState.submitError).toBeNull();
    expect(initialRegisterState.notice).toBeNull();
  });

  it('change actualiza el valor del campo indicado', () => {
    const next = registerReducer(initialRegisterState, {
      type: 'change',
      field: 'fullName',
      value: 'Ana Pérez',
    });
    expect(next.values.fullName).toBe('Ana Pérez');
  });

  it('toggleTerms actualiza termsAccepted', () => {
    const next = registerReducer(initialRegisterState, {
      type: 'toggleTerms',
      checked: true,
    });
    expect(next.termsAccepted).toBe(true);
  });

  it('US1-1, US1-2: submit con datos válidos → status submitting', () => {
    const next = registerReducer(validState, { type: 'submit' });
    expect(next.status).toBe('submitting');
    expect(next.fieldErrors).toEqual({});
  });

  it('US1-2: un segundo submit mientras está en submitting se ignora', () => {
    const submitting = registerReducer(validState, { type: 'submit' });
    expect(registerReducer(submitting, { type: 'submit' })).toBe(submitting);
  });

  it('US1-1: result con success restablece al estado inicial', () => {
    const submitting = registerReducer(validState, { type: 'submit' });
    const next = registerReducer(submitting, {
      type: 'result',
      result: { kind: 'success' },
    });
    expect(next).toEqual(initialRegisterState);
  });

  it('result con unavailable pasa a submitError', () => {
    const submitting = registerReducer(validState, { type: 'submit' });
    const next = registerReducer(submitting, {
      type: 'result',
      result: { kind: 'unavailable' },
    });
    expect(next.status).toBe('submitError');
    expect(next.submitError).toBe('unavailable');
  });

  it('change tras submitError vuelve a editing y limpia submitError', () => {
    const errored: RegisterState = {
      ...validState,
      status: 'submitError',
      submitError: 'unavailable',
    };
    const next = registerReducer(errored, {
      type: 'change',
      field: 'email',
      value: 'otro@example.test',
    });
    expect(next.status).toBe('editing');
    expect(next.submitError).toBeNull();
  });

  it('FR-006: blur marca únicamente el campo indicado como tocado y calcula su error', () => {
    const next = registerReducer(initialRegisterState, { type: 'blur', field: 'email' });
    expect(next.touched.email).toBe(true);
    expect(next.touched.fullName).toBe(false);
    expect(next.fieldErrors.email).toBe('Ingresa tu correo electrónico');
    expect(next.fieldErrors.fullName).toBeUndefined();
  });

  it('US2-1, FR-006: submit con errores marca los 5 controles como tocados, sigue en editing y expone todos los errores', () => {
    const next = registerReducer(initialRegisterState, { type: 'submit' });
    expect(next.status).toBe('editing');
    expect(next.touched).toEqual({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
      termsAccepted: true,
    });
    expect(next.fieldErrors).toEqual({
      fullName: 'Ingresa tu nombre completo',
      email: 'Ingresa tu correo electrónico',
      password: 'Ingresa tu contraseña',
      confirmPassword: 'Confirma tu contraseña',
      termsAccepted: 'Debes aceptar los términos y condiciones',
    });
  });

  it('US2-6: change en un campo tocado limpia su error inmediatamente al corregirse', () => {
    const touched = registerReducer(initialRegisterState, { type: 'blur', field: 'fullName' });
    expect(touched.fieldErrors.fullName).toBe('Ingresa tu nombre completo');
    const fixed = registerReducer(touched, {
      type: 'change',
      field: 'fullName',
      value: 'Ana Pérez',
    });
    expect(fixed.fieldErrors.fullName).toBeUndefined();
  });

  it('US2-4 (caso límite): cambiar password cuando confirmPassword ya fue tocado reevalúa confirmPassword inmediatamente', () => {
    let state = registerReducer(initialRegisterState, {
      type: 'change',
      field: 'password',
      value: 'Password123',
    });
    state = registerReducer(state, {
      type: 'change',
      field: 'confirmPassword',
      value: 'Password123',
    });
    state = registerReducer(state, { type: 'blur', field: 'confirmPassword' });
    expect(state.fieldErrors.confirmPassword).toBeUndefined();

    state = registerReducer(state, {
      type: 'change',
      field: 'password',
      value: 'Password1234',
    });
    expect(state.fieldErrors.confirmPassword).toBe('Las contraseñas no coinciden');
  });

  it('US2-6: marcar termsAccepted limpia inmediatamente el error de términos', () => {
    const submitted = registerReducer(initialRegisterState, { type: 'submit' });
    expect(submitted.fieldErrors.termsAccepted).toBe('Debes aceptar los términos y condiciones');

    const checked = registerReducer(submitted, { type: 'toggleTerms', checked: true });
    expect(checked.fieldErrors.termsAccepted).toBeUndefined();
  });

  it('US4-1, FR-008: showNotice establece notice conservando values, touched y fieldErrors, y submit lo limpia', () => {
    const withError = registerReducer(validState, { type: 'blur', field: 'email' });
    const noticed = registerReducer(withError, {
      type: 'showNotice',
      message: 'Próximamente',
    });
    expect(noticed.notice).toBe('Próximamente');
    expect(noticed.values).toEqual(withError.values);
    expect(noticed.touched).toEqual(withError.touched);
    expect(noticed.fieldErrors).toEqual(withError.fieldErrors);

    const submitted = registerReducer(noticed, { type: 'submit' });
    expect(submitted.notice).toBeNull();
  });
});
