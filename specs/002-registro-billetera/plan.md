# Implementation Plan: Pantalla de Registro de Usuarios de KynWallet

**Branch**: `feature/registro-erick-guerrero` | **Date**: 2026-10-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-registro-billetera/spec.md`

## Summary

Implementación del flujo de registro de usuarios de KynWallet en el cliente, fiel al frame
`04 · Registro` de Figma (nodo `31:2`) y a los 8 requisitos funcionales del taller. Se construye
sobre la misma base React 19 + TypeScript + Vite y Clean Architecture ligera de `001-login-billetera`,
reutilizando los tokens accesibles, el layout de dos paneles, los componentes de UI (`TextField`,
`PasswordField`, `Button`, `Checkbox`, `Divider`, `SocialButton`, `Alert`) y las reglas de
validación del dominio. Incorpora navegación entre `/login` y `/register` (con `/` conduciendo a
`/login`) mediante la History API nativa sin añadir librerías externas, validación inline de los
cuatro campos y de la casilla de términos, alerta `"Próximamente"` en botones de Google y Apple
conservando los datos del formulario, simulación de registro (~1 s de carga) sin persistencia de
cuentas, redirección a `/login` con mensaje de éxito y diseño responsive (dos paneles en escritorio
y solo formulario en móvil).

## Technical Context

**Language/Version**: TypeScript 5.9 (`strict: true`, `noUncheckedIndexedAccess: true`), Node.js ≥ 20 LTS

**Primary Dependencies**: React 19.3, React DOM 19.3, Vite 8.3, `@fontsource-variable/inter` (sin nuevas dependencias de producción)

**Storage**: N/A (simulación en memoria del estado del formulario; no persiste cuentas ni modifica `InMemoryAuthGateway`)

**Testing**: Vitest 5, React Testing Library, `@testing-library/user-event`, `jsdom`, `axe-core` (`src/test/a11y.ts`), `@vitest/coverage-v8` (umbral ≥ 80 % en líneas, ramas, funciones y sentencias)

**Target Platform**: Navegadores modernos (Chrome, Firefox, Safari, Edge), diseño responsive desde 320 px hasta 1440 px

**Project Type**: Aplicación web de página única (SPA), exclusivamente frontend

**Performance Goals**: transición a `/login` con mensaje de éxito en ≤ 2 s tras enviar datos válidos (`SC-002`), incluyendo ~1 s de espera simulada

**Constraints**: sin backend, base de datos ni persistencia; cumplimiento estricto de WCAG 2.1 AA; cero exposición de contraseñas en DOM de alertas, consola, URL o `Storage`; cero secretos en repositorio; sin desplazamiento horizontal desde 320 px

**Scale/Scope**: 2 rutas (`/login` y `/register`), 1 nueva feature de UI (`src/ui/features/register/`), extensión de `Checkbox` para error inline y ampliación de `src/domain/validation.ts` y `src/domain/messages.ts`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio / Regla | Cumplimiento en el diseño | Estado |
|---|---|---|
| I. TDD (1.1–1.4) | Cada unidad (validación de dominio, caso de uso simulado, `Checkbox` con error, `registerReducer`, `RegisterForm` e integración de rutas en `App`) inicia con pruebas automatizadas que fallan antes de escribir código de producción; ciclo Rojo → Verde → Refactorizar | ✅ |
| II. SOLID (2.1–2.5) | Responsabilidad única por módulo; `RegisterForm` recibe por props el caso de uso simulado (`registerUser`) y callbacks de navegación (`onSuccess`, `onNavigateToLogin`), manteniendo inversión de dependencias desde `main.tsx` / `App.tsx` | ✅ |
| III. Clean Architecture (3.1–3.5) | Reglas de validación (`validateRegistration`) y textos (`MESSAGES`) en `src/domain/`; caso de uso simulado en `src/application/registerUser.ts`; UI en `src/ui/`; verificado automáticamente por ESLint (`no-restricted-imports`) | ✅ |
| IV. DRY, KISS, YAGNI (4.1–4.4) | Se reutilizan `normalizeEmail`, `isValidEmail`, `isValidPasswordLength`, `MESSAGES` y todos los componentes base (`TextField`, `PasswordField`, `Button`, `Checkbox`, `Divider`, `SocialButton`, `Alert`); navegación con History API nativa sin instalar `react-router` | ✅ |
| V. Seguridad por Diseño (5.1–5.6) | Validación en el límite por formato y longitud (nombre 1–80, correo ≤ 254, contraseña 8–128, confirmación exacta, términos obligatorios); contraseñas nunca registradas ni almacenadas; `no-console: error` y `secretlint` activos | ✅ |
| VI. BRD/ARD (6.1–6.5) | No existen BRD/ARD adicionales; el diseño se alinea íntegramente con los 8 requisitos del taller y la spec aprobada | ✅ N/A |
| 7. Dependencias (7.1–7.5) | No se añade ninguna dependencia externa nueva; se conserva el árbol de paquetes auditado (0 vulnerabilidades, licencias aprobadas) | ✅ |
| 8.1 Pruebas automatizadas | Pruebas unitarias, de componentes, de integración y de accesibilidad con cobertura ≥ 80 % en líneas, ramas, funciones y sentencias | ✅ |
| 8.2 Convenciones de código | ESLint 9 (`strict` + `jsx-a11y`), Prettier y `tsc --noEmit` sin errores | ✅ |
| 8.3 Documentación | Actualización de `README.md` y contratos/plan documentados en `specs/002-registro-billetera/` | ✅ |
| 8.4 Accesibilidad WCAG 2.1 AA | Etiquetas asociadas, `aria-invalid`, `aria-describedby` en inputs y `Checkbox`, regiones vivas (`role="alert"` / `role="status"`), navegación por teclado, foco en el primer error y tokens de contraste AA (`--brand-700`, `--neutral-600`, `--neutral-border`, `--danger-600`) | ✅ |
| 8.5 / 8.6 Reutilización y Sistema de Diseño | Reutilización del 100 % de componentes y tokens existentes en `src/ui/components/` y `src/ui/styles/tokens.css` | ✅ |
| 9.2 Trazabilidad | Nombres de pruebas prefijados con el ID del escenario o requisito (`US1-1`, `US2-4`, `FR-008`, etc.) | ✅ |
| 9.4 Controles de cumplimiento | Ejecución completa de `npm run verify` antes de dar por concluida la implementación | ✅ |

**Resultado del gate**: APROBADO sin violaciones ni necesidad de nuevas excepciones.

---

## Architectural & Design Decisions

### D1. Enrutamiento `/login`, `/register` y `/` sin dependencias externas (KISS / YAGNI)

- **Decisión**: Implementar la sincronización de rutas en `src/App.tsx` (apoyada en un helper/hook ligero `src/ui/navigation/useRoute.ts` o integrado en `App.tsx`) usando `window.location.pathname`, `window.history.pushState`, `window.history.replaceState` y el evento `popstate`:
  - Ruta `/register` → renderiza la pantalla de registro (`RegisterForm`).
  - Ruta `/login` → renderiza la pantalla de inicio de sesión (`LoginForm`).
  - Ruta `/` (o cualquier ruta no reconocida) → normaliza la URL a `/login` mediante `window.history.replaceState(null, '', '/login')` y renderiza `LoginForm`.
- **Justificación**: Cumple `FR-009` y `US3-1..3` sin introducir `react-router-dom` (Principio IV y regla 7.4 de la Constitución: toda nueva dependencia debe justificarse frente a alternativas nativas). Además, `App` aceptará una prop opcional `initialRoute?: '/login' | '/register'` para que las pruebas existentes (`<App authenticate={...} />`) sigan funcionando sin cambios en `/login` y las nuevas pruebas puedan iniciar directamente en `/register` o `/login`.

### D2. Conexión del botón «Regístrate» en `LoginForm` y mensaje de éxito tras el registro

- **Decisión**:
  1. Ampliar `LoginFormProps` en `src/ui/features/login/LoginForm.tsx` con dos props opcionales:
     - `onNavigateToRegister?: () => void`: cuando se proporciona (desde `App.tsx`), el botón `"Regístrate"` invoca `onNavigateToRegister()` para navegar a `/register`. Si no se proporciona (en pruebas unitarias aisladas de `LoginForm` que prueban la pantalla de login por separado), mantiene el comportamiento previo (`notAvailable`), preservando la retrocompatibilidad con las pruebas existentes de `001-login-billetera`.
     - `successMessage?: string | null` y `onClearSuccessMessage?: () => void`: cuando el usuario completa el registro en `/register`, `App` guarda el mensaje `MESSAGES.REGISTER_SUCCESS` (`"¡Cuenta creada exitosamente! Inicia sesión para continuar."`), cambia la ruta a `/login` y lo pasa a `LoginForm`.
  2. En `LoginForm`, si `successMessage` está presente, se renderiza un componente `Alert` (`tone="info"`, `role="status"`) encima del formulario para que sea anunciado automáticamente por lectores de pantalla (`US1-1`, `FR-010`, `FR-012`).
  3. Cuando el usuario escribe en cualquier campo de `LoginForm`, envía el formulario de login o navega de vuelta a `/register`, se invoca `onClearSuccessMessage?.()` para limpiar el mensaje de éxito (caso límite de `spec.md`).

### D3. Simulación del registro sin persistencia ni modificación de `InMemoryAuthGateway`

- **Decisión**:
  - Crear el caso de uso `createRegisterUser` en `src/application/registerUser.ts` con el tipo `RegisterUser = (input: RegistrationCredentials) => Promise<RegistrationResult>`.
  - Por defecto realiza una espera simulada configurable (`delayMs = 1000`, igual que `InMemoryAuthGateway`) y devuelve `{ kind: 'success' }` (o `{ kind: 'unavailable' }` ante una excepción inesperada, sin rechazar la promesa).
  - No modifica `InMemoryAuthGateway`, no guarda cuentas en memoria ni en `localStorage`/`sessionStorage`, y no valida correos duplicados (`Clarifications` Q1, `FR-010`).
  - En `src/App.tsx`, la prop `registerUser?: RegisterUser` tendrá como valor por defecto `createRegisterUser()` (con `delayMs: 1000` inyectado desde `main.tsx`) y podrá sustituirse por un stub instantáneo o diferido (`createRegisterStub`) en las pruebas.

### D4. Reutilización de validaciones y mensajes en `src/domain/` (DRY)

- **Decisión**:
  - En `src/domain/auth.ts`: añadir los tipos de dominio de registro:
    ```ts
    export type RegistrationInput = {
      fullName: string;
      email: string;
      password: string;
      confirmPassword: string;
      termsAccepted: boolean;
    };

    export type RegistrationResult = { kind: 'success' } | { kind: 'unavailable' };
    ```
  - En `src/domain/messages.ts`: añadir las constantes de texto de registro en `MESSAGES`:
    - `FULL_NAME_REQUIRED: 'Ingresa tu nombre completo'`
    - `FULL_NAME_TOO_LONG: 'El nombre completo no puede superar 80 caracteres'`
    - `CONFIRM_PASSWORD_REQUIRED: 'Confirma tu contraseña'`
    - `PASSWORDS_DO_NOT_MATCH: 'Las contraseñas no coinciden'`
    - `TERMS_REQUIRED: 'Debes aceptar los términos y condiciones'`
    - `COMING_SOON: 'Próximamente'`
    - `REGISTER_SUCCESS: '¡Cuenta creada exitosamente! Inicia sesión para continuar.'`
  - En `src/domain/validation.ts`:
    - Exportar `FULL_NAME_MAX_LENGTH = 80` y `normalizeFullName(name: string): string` (`name.trim()`).
    - Reutilizar `validateEmail` y `validatePassword` internos para los campos `email` y `password` (cero duplicación de expresiones regulares o límites).
    - Implementar `validateRegistration(input: RegistrationInput): RegistrationErrors` que valida los 5 controles:
      1. `fullName`: vacío tras `trim()` → `MESSAGES.FULL_NAME_REQUIRED`; `> 80` caracteres → `MESSAGES.FULL_NAME_TOO_LONG`.
      2. `email`: delega en la misma validación de correo de `validateCredentials` (`EMAIL_REQUIRED` / `EMAIL_INVALID`).
      3. `password`: delega en la misma validación de contraseña de `validateCredentials` (`PASSWORD_REQUIRED` / `PASSWORD_TOO_SHORT` / `PASSWORD_TOO_LONG`, sin recortar espacios).
      4. `confirmPassword`: vacío (`''`) → `MESSAGES.CONFIRM_PASSWORD_REQUIRED`; distinto de `password` (`confirmPassword !== password`) → `MESSAGES.PASSWORDS_DO_NOT_MATCH`.
      5. `termsAccepted`: `false` → `MESSAGES.TERMS_REQUIRED`.

### D5. Extensión accesible de `Checkbox` para soportar errores inline

- **Decisión**:
  - Extender `src/ui/components/Checkbox/Checkbox.tsx` y `Checkbox.module.css` con las props opcionales `error?: string` y `ref?: Ref<HTMLInputElement>`:
    - Cuando `error` está definido, el `<input type="checkbox">` recibe `aria-invalid={true}` y `aria-describedby={errorId}`, y se muestra debajo un `<p id={errorId} className={styles.error}>{error}</p>` estilizado con `var(--danger-600)` (idéntico al patrón de `TextField`).
    - Es 100 % retrocompatible con el uso de `<Checkbox label="Recordarme" ... />` en `LoginForm`.

### D6. Máquina de estados del formulario de registro, validaciones inline y gestión del foco

- **Decisión**:
  - Crear `src/ui/features/register/registerReducer.ts` y `src/ui/features/register/useRegisterForm.ts` siguiendo el mismo diseño de `loginReducer.ts`:
    - `status: 'editing' | 'submitting'`
    - `values: RegistrationInput` (inicializado con strings vacíos y `termsAccepted: false`)
    - `touched: Record<keyof RegistrationInput, boolean>` (inicializado en `false`)
    - `fieldErrors: RegistrationErrors` (solo expone errores de controles ya `touched`)
    - `notice: string | null` (para el alert `"Próximamente"`)
  - **Regla de sincronización de confirmación de contraseña (caso límite)**: al cambiar `password` cuando `confirmPassword` ya está `touched`, `visibleErrors` reevalúa `confirmPassword` frente al nuevo `password` y actualiza su error inline de inmediato.
  - **Cambio en `termsAccepted`**: al marcar o desmarcar la casilla, se marca `touched.termsAccepted = true` y se recalcula `fieldErrors`, de modo que si tenía el error `"Debes aceptar los términos y condiciones"`, desaparece inmediatamente al marcarla (`US2-6`).
  - **Foco en el primer control inválido (`US2-1`, `FR-006`)**: en `RegisterForm.tsx`, al ejecutar `handleSubmit`, si `submit()` retorna errores, se mueve el foco siguiendo el orden visual y de tabulación del formulario:
    `fullNameRef` → `emailRef` → `passwordRef` → `confirmPasswordRef` → `termsRef`.

### D7. Conservación de datos al pulsar Google y Apple («Próximamente»)

- **Decisión**:
  - En `RegisterForm.tsx`, los botones `<SocialButton provider="Google" />` y `<SocialButton provider="Apple" />` invocan `showNotice(MESSAGES.COMING_SOON)`.
  - La acción `{ type: 'showNotice', message: MESSAGES.COMING_SOON }` en `registerReducer` solo actualiza `state.notice = 'Próximamente'` sin modificar `values`, `touched` ni `fieldErrors`.
  - Se renderiza `<Alert tone="error">` o `<Alert tone="info">` (con `role="alert"` para cumplir literalmente con el alert `"Próximamente"` anunciado de inmediato por tecnologías de asistencia, `FR-008`, `US4-1`).

### D8. Diseño responsive: dos paneles en escritorio y solo formulario en móvil (`FR-011`, `US5-1`, `US5-2`)

- **Decisión**:
  - Actualmente `LoginScreen` renderiza `<BrandPanel />` (que en `< 960px` muestra una barra superior con el logo y en `≥ 960px` muestra el panel izquierdo completo).
  - Para cumplir estrictamente el requisito 8 del taller y `FR-011` / `US5-2` ("en escritorio con dos paneles y en móvil mostrando solo el formulario"), se añade a `LoginScreen` una prop opcional `hideBrandOnMobile?: boolean` (que aplica una clase `.hideBrandOnMobile` en `LoginScreen.module.css` con `@media (max-width: 959px)` ocultando el `<header>` del `BrandPanel`).
  - De este modo:
    - En `/login` no se altera el comportamiento validado en `001-login-billetera`.
    - En `/register` (`<LoginScreen hideBrandOnMobile>`), en escritorio (`≥ 960px`) se muestran los dos paneles (`BrandPanel` + panel del formulario) y en móvil (`< 960px` hasta `320px`) el `BrandPanel` queda oculto (`display: none`) mostrando únicamente el formulario de registro centrado y sin scroll horizontal.

---

## Data Model & UI Contract Summary

### Entidades y Tipos (`src/domain/auth.ts` y `src/domain/validation.ts`)

| Tipo / Función | Definición | Reglas |
|---|---|---|
| `RegistrationInput` | `{ fullName: string; email: string; password: string; confirmPassword: string; termsAccepted: boolean }` | Datos del formulario en memoria |
| `RegistrationErrors` | `Partial<Record<keyof RegistrationInput, string>>` | `{}` indica formulario válido |
| `RegistrationResult` | `{ kind: 'success' } \| { kind: 'unavailable' }` | Resultado del caso de uso simulado |
| `validateRegistration(input)` | Función pura en `src/domain/validation.ts` | Valida los 5 controles según `FR-005` |

### Contrato Observable de la UI (`RegisterForm` en `/register`)

| Elemento | Rol / Nombre accesible | Detalles y atributos |
|---|---|---|
| Título | `heading` nivel 1 `"Crea tu cuenta"` | Subtítulo `"Completa tus datos para comenzar"` |
| Nombre completo | `textbox` `"Nombre completo"` | `type="text"`, `autoComplete="name"`, placeholder `"Tu nombre completo"` |
| Correo electrónico | `textbox` `"Correo electrónico"` | `type="email"`, `autoComplete="email"`, placeholder `"tucorreo@ejemplo.com"` |
| Contraseña | campo con etiqueta `"Contraseña"` | `PasswordField`, `autoComplete="new-password"`, control `"Mostrar contraseña"` / `"Ocultar contraseña"` |
| Confirmar contraseña | campo con etiqueta `"Confirmar contraseña"` | `PasswordField`, `autoComplete="new-password"`, control independiente de visibilidad |
| Términos y condiciones | `checkbox` `"Acepto los términos y condiciones"` | Texto plano; soporta `aria-invalid` y `aria-describedby` cuando hay error |
| Enviar | `button` `"Crear cuenta"` | `type="submit"`; en carga: `aria-busy="true"`, `disabled`, texto `"Creando cuenta…"` |
| Divisor | texto `"o regístrate con"` | `Divider` decorativo |
| Google / Apple | `button` `"Google"`, `button` `"Apple"` | Muestran alert `"Próximamente"` (`role="alert"`) conservando los datos |
| Pie de navegación | texto `"¿Ya tienes cuenta?"` + `button`/enlace `"Inicia sesión"` | Navega a `/login` |

---

## Project Structure

### Documentation (this feature)

```text
specs/002-registro-billetera/
├── spec.md              # Especificación funcional aprobada (Phase 1)
├── plan.md              # Este plan técnico (Phase 2)
└── tasks.md             # Lista de tareas TDD (se generará en la siguiente fase tras aprobación)
```

### Source Code (repository root)

#### Archivos existentes a modificar

```text
src/
├── domain/
│   ├── auth.ts                          # + RegistrationInput, RegistrationResult
│   ├── messages.ts                      # + textos de validación de registro, COMING_SOON, REGISTER_SUCCESS
│   ├── validation.ts                    # + FULL_NAME_MAX_LENGTH, normalizeFullName, validateRegistration
│   └── validation.test.ts               # + pruebas unitarias de validateRegistration y normalizeFullName
├── ui/
│   ├── components/
│   │   └── Checkbox/
│   │       ├── Checkbox.tsx             # + props opcionales error y ref, aria-invalid y aria-describedby
│   │       ├── Checkbox.module.css      # + estilos para mensaje de error inline y borde inválido
│   │       └── Checkbox.test.tsx        # + pruebas de error accesible y ref en Checkbox
│   └── features/
│       └── login/
│           ├── LoginScreen.tsx          # + prop opcional hideBrandOnMobile
│           ├── LoginScreen.module.css   # + regla @media (max-width: 959px) para ocultar BrandPanel cuando aplica
│           ├── LoginForm.tsx            # + props opcionales onNavigateToRegister, successMessage, onClearSuccessMessage
│           └── LoginForm.test.tsx       # + pruebas de banner de éxito y navegación a registro
├── App.tsx                              # + enrutamiento /login, /register y /, estado de mensaje de éxito post-registro
├── App.test.tsx                         # + pruebas de integración de rutas, flujo registro → login con éxito y a11y de /register
└── main.tsx                             # + inyección opcional de registerUser junto a authenticate
```

#### Archivos nuevos a crear

```text
src/
├── application/
│   ├── registerUser.ts                  # Caso de uso simulado createRegisterUser (espera configurable ~1 s)
│   └── registerUser.test.ts             # Pruebas unitarias del caso de uso simulado
├── test/
│   └── registerStub.ts                  # Stub determinista/diferible para pruebas de RegisterForm y App
└── ui/
    └── features/
        └── register/
            ├── RegisterForm.tsx         # Formulario de registro con 4 campos, Checkbox de términos, botones sociales y enlace a /login
            ├── RegisterForm.module.css  # Estilos del formulario de registro reutilizando tokens.css
            ├── RegisterForm.test.tsx    # Pruebas de integración por historia de usuario (US1–US5) y seguridad (FR-013)
            ├── registerReducer.ts       # Máquina de estados pura del formulario de registro
            ├── registerReducer.test.ts  # Pruebas unitarias de transiciones y errores visibles
            └── useRegisterForm.ts       # Hook que conecta registerReducer con el caso de uso registerUser
```

**Structure Decision**: Se mantiene la arquitectura monolítica por capas en `src/` (`domain`,
`application`, `infrastructure`, `ui`, `test`) con pruebas co-localizadas (`*.test.ts(x)`). La
nueva funcionalidad de interfaz se encapsula en `src/ui/features/register/` en simetría exacta con
`src/ui/features/login/`.

---

## Testing Strategy (TDD & Quality Gates)

Siguiendo el Principio I de la Constitución (TDD no negociable), cada bloque de implementación se
precede de sus pruebas automatizadas:

1. **Pruebas Unitarias de Dominio (`src/domain/validation.test.ts`)**:
   - `normalizeFullName`: recorte de espacios periféricos.
   - `validateRegistration`: nombre vacío/espacios, nombre > 80 caracteres, correo vacío/inválido/> 254, contraseña vacía/< 8/> 128, confirmación vacía/distinta, términos `false`, y caso válido completo (`{}`).
2. **Pruebas Unitarias de Aplicación (`src/application/registerUser.test.ts`)**:
   - `createRegisterUser`: resuelve `{ kind: 'success' }` tras `delayMs` configurable (verificado con `vi.useFakeTimers()`); captura errores inesperados devolviendo `{ kind: 'unavailable' }`.
3. **Pruebas de Componente Base (`src/ui/components/Checkbox/Checkbox.test.tsx`)**:
   - Renderizado sin error (retrocompatibilidad), renderizado con `error` (`aria-invalid="true"`, `aria-describedby` vinculado al mensaje de error), soporte de `ref` y 0 violaciones de `axe`.
4. **Pruebas Unitarias de Reducer (`src/ui/features/register/registerReducer.test.ts`)**:
   - Estado inicial `editing`, transición `blur` por campo, `change` limpiando error y reevaluando `confirmPassword` cuando cambia `password`, cambio en `termsAccepted`, `submit` con errores (queda en `editing` y marca todos como `touched`), `submit` válido (`submitting` e ignora reenvíos), `showNotice` (`"Próximamente"` conservando `values`).
5. **Pruebas de Integración de `RegisterForm` (`src/ui/features/register/RegisterForm.test.tsx`)**:
   - **US1**: envío válido → estado ocupado `"Creando cuenta…"` (`aria-busy="true"`, `disabled`, ignora doble clic) → invoca callback de éxito; normalización de nombre/correo; envío con tecla `Enter`.
   - **US2**: envío vacío muestra los 5 errores y enfoca `"Nombre completo"`; correo inválido en `blur`; contraseña < 8 caracteres; confirmación distinta (y cambio posterior de contraseña); casilla de términos sin marcar; corrección limpia el error inline; descripción accesible en cada control inválido.
   - **US3**: clic en `"Inicia sesión"` dentro de `"¿Ya tienes cuenta? Inicia sesión"` invoca navegación a `/login`.
   - **US4**: clic en `"Google"` y `"Apple"` muestra alert `"Próximamente"` y conserva todos los valores escritos.
   - **US5**: controles independientes de `"Mostrar contraseña"` / `"Ocultar contraseña"` en ambos campos de contraseña.
   - **Seguridad (`FR-013`, `SC-006`)**: verifica que ni `password` ni `confirmPassword` aparezcan en `document.body.textContent`, `window.location.href`, `console.*` ni `Storage.prototype.setItem`.
6. **Pruebas de Integración de Rutas y Accesibilidad Global (`src/App.test.tsx`)**:
   - Ruta `/` redirige/muestra `/login`.
   - Clic en `"Regístrate"` desde `/login` navega a `/register` (`window.location.pathname === '/register'`).
   - Completar el registro en `/register` redirige a `/login` (`window.location.pathname === '/login'`) y muestra `"¡Cuenta creada exitosamente! Inicia sesión para continuar."`.
   - Editar un campo en `/login` oculta el mensaje de éxito previo.
   - Auditoría `expectNoA11yViolations` (`axe-core`) sobre `/register` en estado inicial, con los 5 errores inline visibles y con la alerta `"Próximamente"`.
7. **Verificación de Cumplimiento (`npm run verify`)**:
   - `lint`, `format`, `typecheck`, `test:coverage` (≥ 80 %), `build`, `audit:deps`, `audit:licenses` y `scan:secrets`.

---

## Technical Risks, Trade-offs & Task Dependencies

### Riesgos Técnicos y Mitigaciones

1. **Riesgo R1 — Ruptura de pruebas existentes en `LoginForm.test.tsx` al cambiar el botón `"Regístrate"`**:
   - *Contexto*: `LoginForm.test.tsx` tiene un test parametrizado `it.each(['¿Olvidaste tu contraseña?', 'Google', 'Apple', 'Regístrate'])` que verifica el aviso cuando `LoginForm` se monta aislado sin props de navegación.
   - *Mitigación*: Hacer que `onNavigateToRegister` sea opcional en `LoginFormProps`. Cuando `App` monta `LoginForm`, pasa `onNavigateToRegister={() => navigate('/register')}`; cuando `LoginForm` se monta sin esa prop en los tests unitarios antiguos de `001-login-billetera`, conserva el fallback `notAvailable`, y añadimos un test específico en `LoginForm.test.tsx` y `App.test.tsx` con `onNavigateToRegister` definido. Así los 111 tests existentes siguen pasando al 100 %.
2. **Riesgo R2 — Ambigüedad de selectores en pruebas al existir dos campos de contraseña en `RegisterForm`**:
   - *Contexto*: En `LoginForm` solo había un botón `"Mostrar contraseña"`. En `RegisterForm` hay dos instancias de `PasswordField` (`"Contraseña"` y `"Confirmar contraseña"`), por lo que `getByRole('button', { name: 'Mostrar contraseña' })` encontrará 2 elementos (`getAllByRole`).
   - *Mitigación*: Las etiquetas de los inputs son únicas (`getByLabelText('Contraseña')` y `getByLabelText('Confirmar contraseña')`), y para los botones de visibilidad en `RegisterForm.test.tsx` se usará `getAllByRole('button', { name: 'Mostrar contraseña' })` (o acotado por contenedor), manteniendo `PasswordField` simple y sin cambios invasivos.
3. **Riesgo R3 — Estado de `window.location.pathname` compartido entre tests de `App.test.tsx` en `jsdom`**:
   - *Contexto*: Si una prueba cambia `window.location.pathname` a `/register` con `pushState`, el siguiente test en el mismo archivo vería `/register` si no se restablece.
   - *Mitigación*: En `App.test.tsx`, restablecer `window.history.replaceState(null, '', '/')` en `beforeEach` y permitir además `initialRoute` opcional en `AppProps`.

### Orden y Dependencias entre Bloques de Trabajo (para la futura fase `tasks.md`)

```text
Bloque 1 (Dominio: tipos, mensajes y validateRegistration + tests)
   │
   ├──▶ Bloque 2 (Aplicación: createRegisterUser + stub de pruebas + tests)
   │
   ├──▶ Bloque 3 (UI Base: extensión accesible de Checkbox con error/ref + layout hideBrandOnMobile en LoginScreen + tests)
   │
   └──▶ Bloque 4 (Estado UI: registerReducer + useRegisterForm + tests)
           │
           ▼
        Bloque 5 (Componente Feature: RegisterForm + estilos + tests US1–US5 y seguridad)
           │
           ▼
        Bloque 6 (Integración de Rutas y Flujo Completo: App.tsx + LoginForm.tsx + main.tsx + tests de integración y a11y)
           │
           ▼
        Bloque 7 (Documentación y Verificación final: README.md + npm run verify)
```

## Complexity Tracking

> No existen violaciones a la Constitución en este plan. Se mantienen las dos desviaciones de la
> línea base ya documentadas en `001-login-billetera/plan.md` (uso de tokens accesibles `--brand-700`,
> `--neutral-600`, `--neutral-border` para cumplir WCAG 2.1 AA obligatorio, y cuentas de demo de
> login en `.env.local`).
