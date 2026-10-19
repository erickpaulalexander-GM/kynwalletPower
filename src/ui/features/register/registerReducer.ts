import type { RegistrationResult } from '@/domain/auth';
import { validateRegistration, type RegistrationErrors } from '@/domain/validation';

export type RegisterTextField = 'fullName' | 'email' | 'password' | 'confirmPassword';
export type RegisterControl = RegisterTextField | 'termsAccepted';

export type RegisterState = {
  status: 'editing' | 'submitting' | 'submitError';
  values: Record<RegisterTextField, string>;
  termsAccepted: boolean;
  touched: Record<RegisterControl, boolean>;
  fieldErrors: RegistrationErrors;
  submitError: 'unavailable' | null;
  notice: string | null;
};

export type RegisterAction =
  | { type: 'change'; field: RegisterTextField; value: string }
  | { type: 'blur'; field: RegisterTextField }
  | { type: 'toggleTerms'; checked: boolean }
  | { type: 'showNotice'; message: string }
  | { type: 'submit' }
  | { type: 'result'; result: RegistrationResult };

export const initialRegisterState: RegisterState = {
  status: 'editing',
  values: {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
  termsAccepted: false,
  touched: {
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
    termsAccepted: false,
  },
  fieldErrors: {},
  submitError: null,
  notice: null,
};

/** Errores visibles: solo los de los controles que ya fueron tocados (FR-006). */
function visibleErrors(
  values: RegisterState['values'],
  termsAccepted: boolean,
  touched: RegisterState['touched'],
): RegistrationErrors {
  const errors = validateRegistration({ ...values, termsAccepted });
  const visible: RegistrationErrors = {};
  if (touched.fullName && errors.fullName) visible.fullName = errors.fullName;
  if (touched.email && errors.email) visible.email = errors.email;
  if (touched.password && errors.password) visible.password = errors.password;
  if (touched.confirmPassword && errors.confirmPassword) {
    visible.confirmPassword = errors.confirmPassword;
  }
  if (touched.termsAccepted && errors.termsAccepted) {
    visible.termsAccepted = errors.termsAccepted;
  }
  return visible;
}

/** Máquina de estados del formulario de registro (FR-002 a FR-006, FR-010). */
export function registerReducer(state: RegisterState, action: RegisterAction): RegisterState {
  switch (action.type) {
    case 'change': {
      const values = { ...state.values, [action.field]: action.value };
      return {
        ...state,
        status: state.status === 'submitError' ? 'editing' : state.status,
        submitError: null,
        values,
        fieldErrors: visibleErrors(values, state.termsAccepted, state.touched),
      };
    }

    case 'blur': {
      const touched = { ...state.touched, [action.field]: true };
      return {
        ...state,
        touched,
        fieldErrors: visibleErrors(state.values, state.termsAccepted, touched),
      };
    }

    case 'toggleTerms': {
      const termsAccepted = action.checked;
      return {
        ...state,
        status: state.status === 'submitError' ? 'editing' : state.status,
        submitError: null,
        termsAccepted,
        fieldErrors: visibleErrors(state.values, termsAccepted, state.touched),
      };
    }

    case 'showNotice':
      return { ...state, notice: action.message };

    case 'submit': {
      if (state.status === 'submitting') return state;
      const touched: RegisterState['touched'] = {
        fullName: true,
        email: true,
        password: true,
        confirmPassword: true,
        termsAccepted: true,
      };
      const fieldErrors = visibleErrors(state.values, state.termsAccepted, touched);
      const status = Object.keys(fieldErrors).length > 0 ? 'editing' : 'submitting';
      return {
        ...state,
        status,
        touched,
        fieldErrors,
        submitError: null,
        notice: null,
      };
    }

    case 'result':
      if (action.result.kind === 'success') {
        return initialRegisterState;
      }
      return {
        ...state,
        status: 'submitError',
        submitError: action.result.kind,
      };
  }
}
