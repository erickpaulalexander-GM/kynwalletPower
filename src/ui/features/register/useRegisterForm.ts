import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { RegisterUser } from '@/application/registerUser';
import {
  normalizeEmail,
  normalizeFullName,
  validateRegistration,
  type RegistrationErrors,
} from '@/domain/validation';
import { initialRegisterState, registerReducer, type RegisterTextField } from './registerReducer';

export function useRegisterForm(registerUser: RegisterUser, onSuccess?: () => void) {
  const [state, dispatch] = useReducer(registerReducer, initialRegisterState);
  const inFlight = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const change = useCallback((field: RegisterTextField, value: string) => {
    dispatch({ type: 'change', field, value });
  }, []);

  const blur = useCallback((field: RegisterTextField) => {
    dispatch({ type: 'blur', field });
  }, []);

  const toggleTerms = useCallback((checked: boolean) => {
    dispatch({ type: 'toggleTerms', checked });
  }, []);

  const showNotice = useCallback((message: string) => {
    dispatch({ type: 'showNotice', message });
  }, []);

  /** Valida y, si procede, ejecuta el registro simulado. Devuelve los errores para gestionar el foco. */
  const submit = useCallback((): RegistrationErrors => {
    if (inFlight.current) return {};
    const input = {
      ...state.values,
      termsAccepted: state.termsAccepted,
    };
    const errors = validateRegistration(input);
    dispatch({ type: 'submit' });
    if (Object.keys(errors).length > 0) return errors;

    inFlight.current = true;
    void registerUser({
      fullName: normalizeFullName(state.values.fullName),
      email: normalizeEmail(state.values.email),
      password: state.values.password,
      confirmPassword: state.values.confirmPassword,
      termsAccepted: state.termsAccepted,
    }).then((result) => {
      inFlight.current = false;
      if (mounted.current) {
        dispatch({ type: 'result', result });
      }
      if (result.kind === 'success') {
        onSuccess?.();
      }
    });
    return {};
  }, [onSuccess, registerUser, state.termsAccepted, state.values]);

  return { state, change, blur, toggleTerms, showNotice, submit };
}
