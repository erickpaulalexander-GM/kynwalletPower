import type { RegistrationInput, RegistrationResult } from '@/domain/auth';

/** Caso de uso falso de registro controlable desde las pruebas. */
export function createRegisterStub(result: RegistrationResult = { kind: 'success' }) {
  let resolvePending: (() => void) | null = null;
  let deferred = false;
  const fn = vi.fn<(input: RegistrationInput) => Promise<RegistrationResult>>(
    () =>
      new Promise<RegistrationResult>((resolve) => {
        if (deferred) {
          resolvePending = () => resolve(result);
        } else {
          resolve(result);
        }
      }),
  );
  return {
    registerUser: fn,
    /** Las siguientes llamadas quedan pendientes hasta llamar a release(). */
    defer() {
      deferred = true;
    },
    release() {
      resolvePending?.();
    },
  };
}
