import type { RegistrationInput, RegistrationResult } from '@/domain/auth';

export type RegisterUser = (input: RegistrationInput) => Promise<RegistrationResult>;

const DEFAULT_DELAY_MS = 1000;

/**
 * Caso de uso: simula el registro de cuenta en interfaz (FR-010).
 * No persiste cuentas ni modifica el almacenamiento de usuarios.
 */
export function createRegisterUser(options?: { delayMs?: number }): RegisterUser {
  const delayMs = options?.delayMs ?? DEFAULT_DELAY_MS;
  return async () => {
    try {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, delayMs);
      });
      return { kind: 'success' };
    } catch {
      return { kind: 'unavailable' };
    }
  };
}
