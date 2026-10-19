import { MESSAGES } from './messages';
import {
  normalizeEmail,
  normalizeFullName,
  validateCredentials,
  validateRegistration,
} from './validation';

describe('normalizeEmail', () => {
  it('US1-3: recorta espacios periféricos y convierte a minúsculas', () => {
    expect(normalizeEmail('  Demo@Example.COM ')).toBe('demo@example.com');
  });

  it('no altera el contenido interior', () => {
    expect(normalizeEmail('a.b+c@d.com')).toBe('a.b+c@d.com');
  });
});

describe('normalizeFullName', () => {
  it('US1-3: recorta espacios periféricos y conserva el interior', () => {
    expect(normalizeFullName('  Ana Pérez  ')).toBe('Ana Pérez');
  });
});

describe('validateCredentials (data-model.md)', () => {
  const valid = { email: 'ana@example.test', password: 'secreto-123' };

  it('credenciales válidas → {}', () => {
    expect(validateCredentials(valid)).toEqual({});
  });

  it.each(['', '   '])('correo vacío tras trim (%j) → EMAIL_REQUIRED', (email) => {
    expect(validateCredentials({ ...valid, email }).email).toBe(MESSAGES.EMAIL_REQUIRED);
  });

  it.each(['usuario@', 'usuario.com', 'a@b.c', 'a b@c.com'])(
    'US3-2: correo sin formato válido (%s) → EMAIL_INVALID',
    (email) => {
      expect(validateCredentials({ ...valid, email }).email).toBe(MESSAGES.EMAIL_INVALID);
    },
  );

  it('correo de > 254 caracteres → EMAIL_INVALID', () => {
    const email = `${'a'.repeat(245)}@example.test`;
    expect(email.length).toBeGreaterThan(254);
    expect(validateCredentials({ ...valid, email }).email).toBe(MESSAGES.EMAIL_INVALID);
  });

  it('acepta el correo con espacios periféricos', () => {
    expect(validateCredentials({ ...valid, email: '  Ana@Example.test ' })).toEqual({});
  });

  it('contraseña vacía → PASSWORD_REQUIRED', () => {
    expect(validateCredentials({ ...valid, password: '' }).password).toBe(
      MESSAGES.PASSWORD_REQUIRED,
    );
  });

  it('US3-3: contraseña de < 8 caracteres → PASSWORD_TOO_SHORT', () => {
    expect(validateCredentials({ ...valid, password: '1234567' }).password).toBe(
      MESSAGES.PASSWORD_TOO_SHORT,
    );
  });

  it('contraseña de > 128 caracteres → PASSWORD_TOO_LONG', () => {
    expect(validateCredentials({ ...valid, password: 'x'.repeat(129) }).password).toBe(
      MESSAGES.PASSWORD_TOO_LONG,
    );
  });

  it('la contraseña no se recorta: 7 caracteres + espacios cuenta los espacios', () => {
    expect(validateCredentials({ ...valid, password: ' 123456 ' })).toEqual({});
    expect(validateCredentials({ ...valid, password: '        ' })).toEqual({});
  });
});

describe('validateRegistration', () => {
  const validRegistration = {
    fullName: 'Ana Pérez',
    email: 'ana@example.test',
    password: 'Password123',
    confirmPassword: 'Password123',
    termsAccepted: true,
  };

  it('US1-1: datos de registro válidos → {}', () => {
    expect(validateRegistration(validRegistration)).toEqual({});
  });

  it.each(['', '   '])(
    'US2-1: nombre completo vacío o solo espacios (%j) → FULL_NAME_REQUIRED',
    (fullName) => {
      expect(validateRegistration({ ...validRegistration, fullName }).fullName).toBe(
        MESSAGES.FULL_NAME_REQUIRED,
      );
    },
  );

  it('nombre completo de > 80 caracteres → FULL_NAME_TOO_LONG', () => {
    const fullName = 'A'.repeat(81);
    expect(validateRegistration({ ...validRegistration, fullName }).fullName).toBe(
      MESSAGES.FULL_NAME_TOO_LONG,
    );
  });

  it('nombre completo de exactamente 80 caracteres tras trim → válido', () => {
    const fullName = `  ${'A'.repeat(80)}  `;
    expect(validateRegistration({ ...validRegistration, fullName })).toEqual({});
  });

  it.each(['', '   '])('US2-1: correo vacío tras trim (%j) → EMAIL_REQUIRED', (email) => {
    expect(validateRegistration({ ...validRegistration, email }).email).toBe(
      MESSAGES.EMAIL_REQUIRED,
    );
  });

  it.each(['usuario@', 'usuario.com', 'a@b.c', 'a b@c.com'])(
    'US2-2: correo con formato inválido (%s) → EMAIL_INVALID',
    (email) => {
      expect(validateRegistration({ ...validRegistration, email }).email).toBe(
        MESSAGES.EMAIL_INVALID,
      );
    },
  );

  it('correo de > 254 caracteres → EMAIL_INVALID', () => {
    const email = `${'a'.repeat(245)}@example.test`;
    expect(validateRegistration({ ...validRegistration, email }).email).toBe(
      MESSAGES.EMAIL_INVALID,
    );
  });

  it('US2-1: contraseña vacía → PASSWORD_REQUIRED', () => {
    expect(
      validateRegistration({ ...validRegistration, password: '', confirmPassword: '' }).password,
    ).toBe(MESSAGES.PASSWORD_REQUIRED);
  });

  it('US2-3: contraseña de < 8 caracteres → PASSWORD_TOO_SHORT', () => {
    expect(validateRegistration({ ...validRegistration, password: '1234567' }).password).toBe(
      MESSAGES.PASSWORD_TOO_SHORT,
    );
  });

  it('contraseña de > 128 caracteres → PASSWORD_TOO_LONG', () => {
    expect(validateRegistration({ ...validRegistration, password: 'x'.repeat(129) }).password).toBe(
      MESSAGES.PASSWORD_TOO_LONG,
    );
  });

  it('los espacios en password no se recortan', () => {
    expect(
      validateRegistration({
        ...validRegistration,
        password: ' 123456 ',
        confirmPassword: ' 123456 ',
      }),
    ).toEqual({});
  });

  it('US2-1: confirmar contraseña vacía → CONFIRM_PASSWORD_REQUIRED', () => {
    expect(
      validateRegistration({ ...validRegistration, confirmPassword: '' }).confirmPassword,
    ).toBe(MESSAGES.CONFIRM_PASSWORD_REQUIRED);
  });

  it.each(['OtraClave123', 'password123', 'Password123 '])(
    'US2-4: confirmar contraseña distinta de password (%j) → PASSWORDS_DO_NOT_MATCH',
    (confirmPassword) => {
      expect(validateRegistration({ ...validRegistration, confirmPassword }).confirmPassword).toBe(
        MESSAGES.PASSWORDS_DO_NOT_MATCH,
      );
    },
  );

  it('US2-5: termsAccepted en false → TERMS_REQUIRED', () => {
    expect(validateRegistration({ ...validRegistration, termsAccepted: false }).termsAccepted).toBe(
      MESSAGES.TERMS_REQUIRED,
    );
  });
});
