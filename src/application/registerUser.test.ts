import type { RegistrationInput } from '@/domain/auth';
import { createRegisterUser } from './registerUser';

const validInput: RegistrationInput = {
  fullName: 'Ana Pérez',
  email: 'ana@example.test',
  password: 'Password123',
  confirmPassword: 'Password123',
  termsAccepted: true,
};

describe('createRegisterUser', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('US1-1, US1-2: espera el retardo por defecto (1000 ms) y resuelve { kind: "success" } sin escribir en Storage', async () => {
    vi.useFakeTimers();
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const registerUser = createRegisterUser();

    let resolved = false;
    const promise = registerUser(validInput).then((res) => {
      resolved = true;
      return res;
    });

    await vi.advanceTimersByTimeAsync(999);
    expect(resolved).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    const result = await promise;
    expect(resolved).toBe(true);
    expect(result).toEqual({ kind: 'success' });
    expect(setItemSpy).not.toHaveBeenCalled();
  });

  it('acepta un delayMs personalizado', async () => {
    const registerUser = createRegisterUser({ delayMs: 0 });
    await expect(registerUser(validInput)).resolves.toEqual({ kind: 'success' });
  });

  it('FR-010: si ocurre una excepción interna, devuelve { kind: "unavailable" } sin rechazar la promesa', async () => {
    vi.spyOn(globalThis, 'setTimeout').mockImplementation(() => {
      throw new Error('fallo de temporizador');
    });
    const registerUser = createRegisterUser({ delayMs: 10 });
    await expect(registerUser(validInput)).resolves.toEqual({ kind: 'unavailable' });
  });
});
