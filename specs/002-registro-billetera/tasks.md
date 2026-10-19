---

description: "Task list for 002-registro-billetera"
---

# Tasks: Pantalla de Registro de Usuarios de KynWallet

**Input**: Design documents from `/specs/002-registro-billetera/` (`spec.md`, `plan.md`)

**Prerequisites**: `specs/002-registro-billetera/spec.md` (aprobado), `specs/002-registro-billetera/plan.md` (aprobado), `.specify/memory/constitution.md`

**Tests**: OBLIGATORIAS. La Constitución (Principio I, TDD) exige crear o actualizar las pruebas automatizadas antes de implementar cada comportamiento, ejecutarlas para comprobar que fallan por el motivo esperado, y luego escribir el código de producción hasta pasar en verde.

**Organization**: Las tareas están agrupadas por fases e historias de usuario (`US1`–`US5`) para permitir la implementación incremental y verificación independiente de cada historia.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias de tareas incompletas).
- **[Story]**: Historia de usuario a la que pertenece la tarea (`[US1]` a `[US5]`); se incluye únicamente en las fases de historias de usuario (Phases 3–7).
- Todas las descripciones incluyen las rutas exactas relativas a la raíz del repositorio y las referencias a los requisitos funcionales (`FR-001`–`FR-013`) o criterios de éxito (`SC-001`–`SC-006`).
- Trazabilidad (Constitución 9.2): cada bloque `it(...)` DEBE comenzar con el identificador del escenario o requisito que verifica (p. ej., `it('US1-1: registro válido redirige a /login…')`).

---

## Phase 1: Setup (Shared Infrastructure & Baseline Verification)

**Purpose**: Confirmar que la línea base del repositorio está limpia y que las herramientas de tipos, linter y pruebas existentes pasan antes de introducir cambios.

- [X] T001 Ejecutar `npm run typecheck`, `npm run lint` y `npm test` sobre la base actual (`package.json`) para confirmar que los 15 archivos de prueba y 111 casos existentes pasan sin errores antes de iniciar `002-registro-billetera`

**Checkpoint**: Línea base en verde (111 pruebas aprobadas, 0 errores de tipos ni de ESLint).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tipos de dominio (`RegistrationInput`, `RegistrationResult`), textos centralizados (`MESSAGES`), extensión accesible de `Checkbox` con soporte de error inline y `ref`, soporte de `hideBrandOnMobile` en `LoginScreen` y stub de pruebas `createRegisterStub`.

**⚠️ CRITICAL**: Ninguna historia de usuario puede comenzar hasta completar esta fase.

### Tests for Foundational Components ⚠️

> **NOTA TDD: Escribir estas pruebas PRIMERO y ejecutar `npx vitest run` para comprobar que FALLAN antes de implementar.**

- [X] T002 [P] Ampliar `src/ui/components/Checkbox/Checkbox.test.tsx` con pruebas (que deben fallar) para las nuevas capacidades de `Checkbox` (`FR-003`, `FR-006`, `FR-012`): cuando recibe `error="Debes aceptar los términos y condiciones"`, el input tiene `aria-invalid="true"`, su descripción accesible (`toHaveAccessibleDescription`) coincide con el mensaje de error y el texto se muestra bajo la casilla; cuando no recibe `error`, no tiene `aria-invalid`; acepta un `ref` (`HTMLInputElement`) que permite invocar `.focus()`; pasa `expectNoA11yViolations` (`axe`) tanto sin error como con error visible
- [X] T003 [P] Crear `src/ui/features/login/LoginScreen.test.tsx` con pruebas (que deben fallar) para `LoginScreen` (`FR-011`, `US5-1`, `US5-2`): por defecto renderiza el `<header>` de `BrandPanel` y el `<main>` con el contenido hijo sin la clase `hideBrandOnMobile`; cuando recibe `hideBrandOnMobile={true}`, el contenedor raíz aplica la clase `hideBrandOnMobile` para ocultar el panel de marca en móvil (`< 960px`) conservando el `<main>` del formulario

### Implementation for Foundational Layer

- [X] T004 [P] Ampliar `src/domain/auth.ts` añadiendo el tipo canónico `RegistrationInput = { fullName: string; email: string; password: string; confirmPassword: string; termsAccepted: boolean }` y el tipo `RegistrationResult = { kind: 'success' } | { kind: 'unavailable' }` (Observación O2, `FR-002`, `FR-003`, `FR-010`)
- [X] T005 [P] Ampliar `MESSAGES` en `src/domain/messages.ts` como fuente única de textos (Constitución Principio IV, `FR-005`, `FR-008`, `FR-010`): `FULL_NAME_REQUIRED: 'Ingresa tu nombre completo'`, `FULL_NAME_TOO_LONG: 'El nombre completo no puede superar 80 caracteres'`, `CONFIRM_PASSWORD_REQUIRED: 'Confirma tu contraseña'`, `PASSWORDS_DO_NOT_MATCH: 'Las contraseñas no coinciden'`, `TERMS_REQUIRED: 'Debes aceptar los términos y condiciones'`, `COMING_SOON: 'Próximamente'`, `REGISTER_SUCCESS: '¡Cuenta creada exitosamente! Inicia sesión para continuar.'`
- [X] T006 [P] Implementar en `src/ui/components/Checkbox/Checkbox.tsx` y `src/ui/components/Checkbox/Checkbox.module.css` las props opcionales `error?: string` y `ref?: Ref<HTMLInputElement>` hasta pasar T002 (`FR-003`, `FR-006`, `FR-012`): asociar `errorId = "${id}-error"` con `aria-describedby={error ? errorId : undefined}` y `aria-invalid={error ? true : undefined}`, mostrar `<p id={errorId} className={styles.error}>{error}</p>` en color `var(--danger-600)` (13px) y borde inválido en la casilla, manteniendo 100 % de retrocompatibilidad con `LoginForm`
- [X] T007 [P] Implementar en `src/ui/features/login/LoginScreen.tsx` y `src/ui/features/login/LoginScreen.module.css` la prop opcional `hideBrandOnMobile?: boolean` hasta pasar T003 (`FR-011`, `US5-1`, `US5-2`): cuando `hideBrandOnMobile` es `true`, aplicar en `@media (max-width: 959px)` `display: none` sobre el `<header>` del `BrandPanel`, manteniendo en `≥ 960px` la cuadrícula de dos paneles intacta
- [X] T008 Crear el helper de pruebas `src/test/registerStub.ts` (siguiendo el patrón de `src/test/authStub.ts` y dependiendo de T004) que exporte `createRegisterStub(result: RegistrationResult = { kind: 'success' })` con `registerUser: vi.fn<(input: RegistrationInput) => Promise<RegistrationResult>>()`, `defer()` y `release()`

**Checkpoint**: `npx vitest run src/ui/components/Checkbox/Checkbox.test.tsx src/ui/features/login/LoginScreen.test.tsx` y `npm run typecheck` pasan sin errores.

---

## Phase 3: User Story 1 - Completar el registro simulado y redirigir al inicio de sesión (Priority: P1) 🎯 MVP

**Goal**: Permitir que el usuario complete los cuatro campos del formulario (`Nombre completo`, `Correo electrónico`, `Contraseña`, `Confirmar contraseña`) y la casilla `Acepto los términos y condiciones`, ejecute el registro simulado (`~1 s` con botón en `"Creando cuenta…"` deshabilitado) y reciba confirmación de éxito.

**Independent Test**: Renderizar `RegisterForm` con `createRegisterStub()`, completar datos válidos, marcar términos y enviar; comprobar el estado de carga `"Creando cuenta…"`, la normalización de nombre y correo, el envío con `Enter` y la invocación de `onSuccess`.

### Tests for User Story 1 ⚠️

> **NOTA TDD: Escribir estas pruebas PRIMERO y comprobar que FALLAN antes de implementar.**

- [X] T009 [P] [US1] Ampliar `src/domain/validation.test.ts` con pruebas unitarias de `normalizeFullName` (`'  Ana Pérez  '` → `'Ana Pérez'`) y del caso válido de `validateRegistration` (`RegistrationInput` con `fullName` de 1–80 caracteres, `email` válido, `password` de 8–128 caracteres, `confirmPassword === password` y `termsAccepted: true` devuelve `{}`) (`US1-1`, `US1-3`, `FR-005`)
- [X] T010 [P] [US1] Crear `src/application/registerUser.test.ts` con pruebas unitarias de `createRegisterUser` (`US1-1`, `US1-2`, `FR-010`, Observación O2): recibe `RegistrationInput`, espera `delayMs` (por defecto 1000 ms, verificado con `vi.useFakeTimers()`) y resuelve `{ kind: 'success' }`; no modifica cuentas ni escribe en `Storage`; si ocurre una excepción interna, captura el error y resuelve `{ kind: 'unavailable' }` sin rechazar la promesa
- [X] T011 [P] [US1] Crear `src/ui/features/register/registerReducer.test.ts` con pruebas de la máquina de estados para el flujo de envío válido (`US1-1`, `US1-2`, `FR-010`): estado inicial `editing` con `values` vacíos y `termsAccepted: false`; acciones `change` y `toggleTerms` actualizan `values`; `submit` con datos válidos pasa a `status: 'submitting'`; un segundo `submit` mientras está en `'submitting'` se ignora; `result` con `{ kind: 'success' }` restablece el formulario o completa la transición
- [X] T012 [US1] Crear `src/ui/features/register/RegisterForm.test.tsx` con las pruebas de integración de `US1` usando `createRegisterStub` y `@testing-library/user-event` (`US1-1` a `US1-4`, `FR-001` a `FR-004`, `FR-010`):
  - `US1-1`: completar `"Nombre completo"`, `"Correo electrónico"`, `"Contraseña"`, `"Confirmar contraseña"`, marcar `"Acepto los términos y condiciones"` y presionar `"Crear cuenta"` invoca `registerUser` y al resolver llama a `onSuccess()`.
  - `US1-2`: mientras la promesa está pendiente (`stub.defer()`), el botón muestra `"Creando cuenta…"`, está deshabilitado (`toBeDisabled()`), tiene `aria-busy="true"` e ignora clics o `Enter` adicionales (`expect(stub.registerUser).toHaveBeenCalledOnce()`).
  - `US1-3`: ingresar nombre y correo con espacios periféricos y mayúsculas en el correo envía a `registerUser` el `fullName` recortado (`trim`) y el `email` normalizado en minúsculas.
  - `US1-4`: presionar `{Enter}` en un campo con todos los datos válidos y términos marcados envía el formulario igual que el botón `"Crear cuenta"`.

### Implementation for User Story 1

- [X] T013 [P] [US1] Implementar `FULL_NAME_MAX_LENGTH = 80`, `normalizeFullName` y la estructura base de `validateRegistration(input: RegistrationInput): RegistrationErrors` en `src/domain/validation.ts` hasta pasar T009 (`FR-005`)
- [X] T014 [P] [US1] Implementar `createRegisterUser(options?: { delayMs?: number }): RegisterUser` en `src/application/registerUser.ts` usando `RegistrationInput` y `RegistrationResult` hasta pasar T010 (`FR-010`, Observación O2)
- [X] T015 [US1] Implementar `src/ui/features/register/registerReducer.ts` con `RegisterState`, `RegisterAction`, `initialRegisterState` y `registerReducer` hasta pasar T011 (`FR-002`, `FR-003`, `FR-010`)
- [X] T016 [US1] Implementar `src/ui/features/register/useRegisterForm.ts` envolviendo `registerReducer`, controlando envíos en vuelo (`inFlight` ref) y desmontaje seguro (`mounted` ref), normalizando `fullName` y `email` al invocar `registerUser` e invocando `onSuccess` cuando el resultado es `{ kind: 'success' }` (`US1-1`, `US1-2`, `US1-3`, `FR-010`)
- [X] T017 [US1] Implementar `src/ui/features/register/RegisterForm.tsx` y `src/ui/features/register/RegisterForm.module.css` con el encabezado `"Crea tu cuenta"` / `"Completa tus datos para comenzar"`, los 4 campos (`TextField` `"Nombre completo"`, `TextField` `"Correo electrónico"`, `PasswordField` `"Contraseña"`, `PasswordField` `"Confirmar contraseña"`), `Checkbox` `"Acepto los términos y condiciones"` y `Button` `"Crear cuenta"` (`loadingLabel="Creando cuenta…"`) hasta pasar T012 (`FR-001` a `FR-004`, `FR-010`)

**Checkpoint**: Todas las pruebas de `US1` (`validation.test.ts`, `registerUser.test.ts`, `registerReducer.test.ts`, `RegisterForm.test.tsx`) pasan en verde.

---

## Phase 4: User Story 2 - Validar los campos inline antes de enviar (Priority: P1)

**Goal**: Mostrar errores de validación inline junto a cada uno de los 5 controles al salir del campo (`blur`) o al presionar `"Crear cuenta"`, impedir el envío mientras existan errores, mover el foco al primer control inválido y limpiar cada error en cuanto el usuario corrige el dato.

**Independent Test**: En `RegisterForm`, enviar el formulario vacío y probar cada regla inválida por separado (nombre vacío/>80, correo inválido/>254, contraseña <8/>128, confirmación vacía/distinta, términos sin marcar); verificar los mensajes inline, el bloqueo de `registerUser`, el traslado del foco y la limpieza inmediata al corregir.

### Tests for User Story 2 ⚠️

> **NOTA TDD: Escribir estas pruebas PRIMERO y comprobar que FALLAN antes de implementar.**

- [X] T018 [P] [US2] Ampliar `src/domain/validation.test.ts` con todos los casos de error de `validateRegistration` (`US2-1` a `US2-5`, `FR-005`):
  - `fullName` vacío o solo espacios (`'   '`) → `'Ingresa tu nombre completo'`; `> 80` caracteres → `'El nombre completo no puede superar 80 caracteres'`.
  - `email` vacío tras trim → `'Ingresa tu correo electrónico'`; formato inválido (`'usuario@'`, `'usuario.com'`, `'a@b.c'`) o `> 254` caracteres → `'Ingresa un correo electrónico válido'`.
  - `password` vacío → `'Ingresa tu contraseña'`; `< 8` caracteres → `'La contraseña debe tener al menos 8 caracteres'`; `> 128` caracteres → `'La contraseña no puede superar 128 caracteres'`; espacios en `password` no se recortan.
  - `confirmPassword` vacío → `'Confirma tu contraseña'`; distinto de `password` (incluyendo diferencias de mayúsculas o espacios) → `'Las contraseñas no coinciden'`.
  - `termsAccepted: false` → `'Debes aceptar los términos y condiciones'`.
- [X] T019 [P] [US2] Ampliar `src/ui/features/register/registerReducer.test.ts` con las reglas de validación inline (`US2-1` a `US2-6`, `FR-006`): `blur` marca solo ese campo como tocado y expone su error; `submit` con errores marca los 5 controles como tocados, permanece en `'editing'` y calcula todos los errores; `change` en un campo tocado limpia su error al corregirse; cambiar `password` cuando `confirmPassword` ya fue tocado reevalúa inmediatamente `confirmPassword` (caso límite); marcar `termsAccepted` limpia de inmediato su error
- [X] T020 [US2] Ampliar `src/ui/features/register/RegisterForm.test.tsx` con los escenarios `US2-1` a `US2-7` y casos límite (`FR-005`, `FR-006`, `FR-012`):
  - `US2-1`: envío vacío muestra los 5 mensajes de obligatoriedad, no invoca `registerUser` y mueve el foco a `"Nombre completo"`.
  - `US2-2`: escribir `"usuario@"` en correo y tabular muestra `"Ingresa un correo electrónico válido"` y `aria-invalid="true"`.
  - `US2-3`: escribir `"1234567"` en contraseña y enviar/tabular muestra `"La contraseña debe tener al menos 8 caracteres"` y enfoca `"Contraseña"` si los campos previos son válidos.
  - `US2-4`: escribir una confirmación distinta de la contraseña muestra `"Las contraseñas no coinciden"`, no invoca `registerUser` y enfoca `"Confirmar contraseña"` si los anteriores son válidos; además, si coincidían y luego se edita `"Contraseña"`, aparece el error en `"Confirmar contraseña"`.
  - `US2-5`: con los 4 campos de texto válidos y la casilla desmarcada, presionar `"Crear cuenta"` muestra `"Debes aceptar los términos y condiciones"`, no invoca `registerUser` y mueve el foco al `checkbox` de términos.
  - `US2-6`: corregir cualquier campo con error o marcar la casilla oculta inmediatamente su mensaje de error y retira `aria-invalid`.
  - `US2-7`: cada control con error expone su mensaje mediante `toHaveAccessibleDescription`.

### Implementation for User Story 2

- [X] T021 [US2] Completar las reglas de validación de los 5 campos en `validateRegistration` dentro de `src/domain/validation.ts` reutilizando `validateEmail` y `validatePassword` (Constitución Principio IV - DRY) hasta pasar T018 (`FR-005`)
- [X] T022 [US2] Actualizar `visibleErrors` y las transiciones `change`, `blur`, `toggleTerms` y `submit` en `src/ui/features/register/registerReducer.ts` hasta pasar T019 (`FR-006`)
- [X] T023 [US2] Conectar en `src/ui/features/register/RegisterForm.tsx` las referencias (`fullNameRef`, `emailRef`, `passwordRef`, `confirmPasswordRef`, `termsRef`), los manejadores `onBlur`, las props `error` en cada `TextField`, `PasswordField` y `Checkbox`, y el traslado del foco al primer control con error al enviar hasta pasar T020 (`FR-006`, `FR-012`)

**Checkpoint**: `US1` y `US2` pasan íntegramente en `validation.test.ts`, `registerReducer.test.ts` y `RegisterForm.test.tsx`.

---

## Phase 5: User Story 3 - Navegar entre Registro e Inicio de Sesión (Priority: P2)

**Goal**: Habilitar el enlace `"¿Ya tienes cuenta? Inicia sesión"` en `/register` hacia `/login`, el botón `"Regístrate"` en `/login` hacia `/register`, la normalización de `/` y rutas desconocidas a `/login`, el soporte de `popstate` (Atrás/Adelante) y la presentación y limpieza del mensaje de éxito en `/login` tras completar el registro.

**Independent Test**: Montar `App` en `/`, `/login`, `/register` y `/desconocida`; navegar entre `/login` y `/register` con `"Regístrate"` e `"Inicia sesión"` y con `popstate`; completar un registro en `/register` y verificar la redirección a `/login` mostrando el mensaje de éxito y su limpieza al editar o reenviar.

### Tests for User Story 3 ⚠️

> **NOTA TDD: Escribir estas pruebas PRIMERO y comprobar que FALLAN antes de implementar.**

- [X] T024 [P] [US3] Ampliar `src/ui/features/register/RegisterForm.test.tsx` con la prueba `US3-1` (`FR-009`): muestra al pie el texto `"¿Ya tienes cuenta?"` junto al botón/enlace `"Inicia sesión"`, y al activarlo invoca `onNavigateToLogin()` sin enviar el formulario
- [X] T025 [P] [US3] Ampliar `src/ui/features/login/LoginForm.test.tsx` con pruebas para las nuevas props de integración (`US1-1`, `US3-2`, `FR-009`, `FR-010`):
  - Cuando recibe `onNavigateToRegister`, activar `"Regístrate"` invoca `onNavigateToRegister()` sin mostrar el aviso de función no disponible (mientras que sin esa prop conserva el comportamiento anterior para no romper `US5-1`).
  - Cuando recibe `successMessage="¡Cuenta creada exitosamente! Inicia sesión para continuar."`, muestra un `Alert` con `role="status"` y ese texto exacto.
  - Cuando el usuario escribe en un campo o envía el formulario de login o pulsa `"Regístrate"`, invoca `onClearSuccessMessage()`.
- [X] T026 [US3] Ampliar `src/App.test.tsx` con pruebas de integración de enrutamiento y flujo completo registro → login (`US1-1`, `US3-1` a `US3-3`, `FR-009`, `FR-010`, Observación O1):
  - En `beforeEach`, restablecer `window.history.replaceState(null, '', '/')`.
  - `US3-3`: iniciar en `/` normaliza `window.location.pathname` a `'/login'` y muestra el encabezado `"Bienvenido de nuevo"`.
  - Observación O1 (ruta desconocida): iniciar en `'/desconocida'` normaliza `window.location.pathname` a `'/login'` y muestra la vista de login.
  - Observación O1 (acceso directo): iniciar en `'/register'` mantiene `window.location.pathname === '/register'` y muestra el encabezado `"Crea tu cuenta"`.
  - `US3-2`: en `/login`, activar `"Regístrate"` cambia `window.location.pathname` a `'/register'` y renderiza el formulario de registro limpio.
  - `US3-1`: en `/register`, activar `"Inicia sesión"` dentro de `"¿Ya tienes cuenta? Inicia sesión"` cambia `window.location.pathname` a `'/login'` y renderiza el formulario de login limpio.
  - Observación O1 (`popstate` Atrás/Adelante): tras navegar de `/login` a `/register`, cambiar el historial y despachar `window.dispatchEvent(new PopStateEvent('popstate'))` actualiza la vista mostrada acorde a `window.location.pathname`.
  - `US1-1` (flujo de punta a punta): completar el registro en `/register` con datos válidos redirige a `/login` (`window.location.pathname === '/login'`) y muestra el mensaje de éxito `"¡Cuenta creada exitosamente! Inicia sesión para continuar."` (`role="status"`), el cual desaparece cuando el usuario escribe en el correo de `/login`.

### Implementation for User Story 3

- [X] T027 [P] [US3] Añadir al pie de `src/ui/features/register/RegisterForm.tsx` y `src/ui/features/register/RegisterForm.module.css` el bloque `"¿Ya tienes cuenta?"` seguido de `<Button variant="link" onClick={onNavigateToLogin}>Inicia sesión</Button>` hasta pasar T024 (`FR-009`)
- [X] T028 [P] [US3] Actualizar `src/ui/features/login/LoginForm.tsx` añadiendo las props opcionales `onNavigateToRegister?: () => void`, `successMessage?: string | null` y `onClearSuccessMessage?: () => void` hasta pasar T025 (`FR-009`, `FR-010`): renderizar `<Alert tone="info">{successMessage}</Alert>` cuando exista `successMessage`, limpiar `successMessage` al editar campos o enviar, y delegar el clic de `"Regístrate"` en `onNavigateToRegister` cuando esté definido
- [X] T029 [US3] Implementar en `src/App.tsx` y `src/main.tsx` la gestión de rutas (`/login`, `/register`, normalización de `/` y rutas desconocidas a `/login` con `replaceState`, navegación con `pushState`, suscripción a `popstate`) y el estado `registrationSuccess` hasta pasar T026 (`FR-009`, `FR-010`, Observación O1)

**Checkpoint**: La navegación `/login` ↔ `/register`, el acceso directo, el evento `popstate` y la redirección con mensaje de éxito funcionan de punta a punta y todas las pruebas de `App.test.tsx`, `LoginForm.test.tsx` y `RegisterForm.test.tsx` pasan.

---

## Phase 6: User Story 4 - Mostrar alerta “Próximamente” en botones de Google y Apple (Priority: P2)

**Goal**: Mostrar el divisor `"o regístrate con"` y los botones `"Google"` y `"Apple"` en `RegisterForm`; al activar cualquiera de ellos, mostrar un `Alert` con `tone="info"` (`role="status"`) con el texto exacto `"Próximamente"` conservando intactos los datos del formulario (Observación O2).

**Independent Test**: Escribir valores en los campos de `RegisterForm`, pulsar `"Google"` y `"Apple"`, y verificar que se anuncia `"Próximamente"` (`role="status"`) sin alterar los valores ingresados ni ejecutar `registerUser`.

### Tests for User Story 4 ⚠️

> **NOTA TDD: Escribir estas pruebas PRIMERO y comprobar que FALLAN antes de implementar.**

- [X] T030 [P] [US4] Ampliar `src/ui/features/register/registerReducer.test.ts` con pruebas para la acción `showNotice` (`US4-1`, `FR-008`, Observación O2): establece `notice: 'Próximamente'` conservando intactos `values`, `touched` y `fieldErrors`, y `submit` limpia `notice: null`
- [X] T031 [US4] Ampliar `src/ui/features/register/RegisterForm.test.tsx` con las pruebas de `US4` (`US4-1`, `FR-008`, Observación O2):
  - `US4-1`: al escribir datos en los campos y activar `"Google"` o `"Apple"`, se renderiza `<Alert tone="info">` (`getByRole('status')`) con el texto exacto `"Próximamente"`, se conservan todos los valores del formulario y no se invoca `registerUser`.
  - El aviso `"Próximamente"` desaparece al enviar el formulario.

### Implementation for User Story 4

- [X] T032 [US4] Incorporar en `src/ui/features/register/RegisterForm.tsx` y `src/ui/features/register/RegisterForm.module.css` el componente `<Divider>o regístrate con</Divider>`, la fila de botones `<SocialButton provider="Google" />` y `<SocialButton provider="Apple" />` que despachan `showNotice(MESSAGES.COMING_SOON)` y el renderizado condicional `{state.notice && <Alert tone="info">{state.notice}</Alert>}` hasta pasar T030 y T031 (`FR-008`, Observación O2)

**Checkpoint**: Los botones sociales de `RegisterForm` muestran `"Próximamente"` de forma accesible y conservan los datos ingresados.

---

## Phase 7: User Story 5 - Diseño responsive y visibilidad de contraseñas (Priority: P3)

**Goal**: Garantizar que los controles de visibilidad (`"Mostrar contraseña"` / `"Ocultar contraseña"`) funcionen de manera independiente en `"Contraseña"` y `"Confirmar contraseña"`, que el orden de tabulación por teclado sea completo y lógico, y que `/register` muestre dos paneles en escritorio (`≥ 960 px`) y únicamente el formulario en móvil (`< 960 px`).

**Independent Test**: En `/register`, alternar la visibilidad de `"Contraseña"` sin afectar `"Confirmar contraseña"` y viceversa (con ratón y teclado); recorrer todos los controles con `Tab`; verificar que `App` en `/register` activa `hideBrandOnMobile` en `LoginScreen`.

### Tests for User Story 5 ⚠️

> **NOTA TDD: Escribir estas pruebas PRIMERO y comprobar que FALLAN antes de implementar.**

- [X] T033 [P] [US5] Ampliar `src/ui/features/register/RegisterForm.test.tsx` con las pruebas de visibilidad independiente de contraseñas y navegación por teclado (`US5-3`, `FR-007`, `FR-012`):
  - `US5-3`: inicialmente ambos campos (`"Contraseña"` y `"Confirmar contraseña"`) tienen `type="password"`; al activar el primer botón `"Mostrar contraseña"`, solo `"Contraseña"` pasa a `type="text"` (`"Ocultar contraseña"` con `aria-pressed="true"`) mientras `"Confirmar contraseña"` sigue en `type="password"`; al activar el segundo botón `"Mostrar contraseña"`, `"Confirmar contraseña"` pasa a `type="text"` de forma independiente.
  - `FR-012`: verificar el orden completo de tabulación con `user.tab()`: `"Nombre completo"` → `"Correo electrónico"` → `"Contraseña"` → botón visibilidad 1 → `"Confirmar contraseña"` → botón visibilidad 2 → casilla `"Acepto los términos y condiciones"` → `"Crear cuenta"` → `"Google"` → `"Apple"` → `"Inicia sesión"`.
- [X] T034 [P] [US5] Ampliar `src/App.test.tsx` con las pruebas de layout responsive según la ruta activa (`US5-1`, `US5-2`, `FR-011`):
  - En `/register`, `LoginScreen` recibe `hideBrandOnMobile={true}` (el contenedor raíz tiene la clase `hideBrandOnMobile` que oculta el `BrandPanel` en `< 960px` y muestra los dos paneles en `≥ 960px`).
  - En `/login`, `LoginScreen` no aplica `hideBrandOnMobile`.

### Implementation for User Story 5

- [X] T035 [US5] Verificar y ajustar en `src/ui/features/register/RegisterForm.tsx` y `src/App.tsx` el paso de `hideBrandOnMobile={route === '/register'}` a `LoginScreen` y el orden de elementos enfocables hasta pasar T033 y T034 (`FR-007`, `FR-011`, `FR-012`)

**Checkpoint**: Todas las historias de usuario (`US1` a `US5`) están implementadas y sus pruebas pasan de forma independiente.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Pruebas de seguridad (`FR-013`, `SC-006`), auditoría de accesibilidad `axe-core` en todos los estados de `/register` (`FR-012`, `SC-004`), actualización de documentación en `README.md` (Observación O3, Constitución 8.3) y ejecución completa del pipeline de cumplimiento `npm run verify` (Constitución 9.4, `SC-003`).

- [X] T036 [P] Añadir en `src/ui/features/register/RegisterForm.test.tsx` la prueba de seguridad de `FR-013` y `SC-006`: comprobar que tras rellenar y enviar el formulario de registro, ni el valor de `"Contraseña"` ni el de `"Confirmar contraseña"` aparecen en `document.body.textContent`, `window.location.href`, llamadas a `console.*` (`log`, `info`, `warn`, `error`, `debug`) ni en `Storage.prototype.setItem`
- [X] T037 [P] Añadir en `src/App.test.tsx` las pruebas de accesibilidad de pantalla completa (`expectNoA11yViolations` con `axe-core`) sobre `/register` en tres estados (`FR-012`, `SC-004`): (a) formulario de registro en estado inicial, (b) formulario de registro con los 5 errores inline visibles y la alerta `"Próximamente"` activa, y (c) vista `/login` mostrando el mensaje de éxito tras completar el registro
- [X] T038 [P] Actualizar `README.md` (Observación O3, Constitución 8.3) para documentar la pantalla y ruta de registro (`/register` y `/login`), el enlace a `specs/002-registro-billetera/`, la arquitectura actualizada con `src/application/registerUser.ts` y `src/ui/features/register/`, y el alcance simulado del registro
- [X] T039 Ejecutar `npm run verify` (`lint`, `format`, `typecheck`, `test:coverage` con umbral ≥ 80 % en líneas, ramas, funciones y sentencias, `build`, `audit:deps`, `audit:licenses` y `scan:secrets`) y corregir cualquier desviación de formato o estilo hasta que todos los controles terminen con código 0 (`SC-003`, `SC-006`, Constitución 8.1, 9.4)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Sin dependencias; verifica la línea base actual.
- **Phase 2 (Foundational)**: Depende de Phase 1. Bloquea todas las historias de usuario (`T002`–`T003` antes de `T006`–`T007`; `T004` antes de `T008`).
- **Phase 3 (US1 - P1 🎯 MVP)**: Depende de Phase 2. Construye el flujo principal de registro simulado.
- **Phase 4 (US2 - P1)**: Depende de Phase 3 (amplía `validation.ts`, `registerReducer.ts` y `RegisterForm.tsx` con todas las reglas de validación inline y gestión de foco).
- **Phase 5 (US3 - P2)**: Depende de Phase 3 y Phase 4 (conecta `RegisterForm` y `LoginForm` mediante el enrutamiento en `App.tsx` y el mensaje de éxito post-registro).
- **Phase 6 (US4 - P2)**: Depende de Phase 3 (añade los botones de Google y Apple y el aviso `"Próximamente"` en `RegisterForm.tsx`).
- **Phase 7 (US5 - P3)**: Depende de Phase 5 y Phase 6 (verifica visibilidad independiente, orden completo de tabulación incluyendo botones sociales y pie, y `hideBrandOnMobile` en `/register`).
- **Phase 8 (Polish)**: Depende de todas las fases anteriores (Phases 1–7).

### Traceability Matrix (`spec.md` → `tasks.md`)

| Requisito / Historia / Observación | Tareas de Prueba (TDD) | Tareas de Implementación / Verificación |
|---|---|---|
| **Req 1 / `FR-001`, `FR-002`** (4 campos: nombre, correo, contraseña, confirmar) | `T009`, `T011`, `T012` | `T004`, `T015`, `T017` |
| **Req 2 / `FR-003`** (Checkbox obligatorio de términos en texto plano) | `T002`, `T012`, `T020` | `T006`, `T017`, `T023` |
| **Req 3 / `FR-004`, `FR-006`** (Botón `"Crear cuenta"` valida antes de enviar y mueve foco) | `T012`, `T019`, `T020` | `T017`, `T022`, `T023` |
| **Req 4 / `FR-008`, `US4`, Obs. O2** (Google y Apple muestran `Alert` `tone="info"` `"Próximamente"` conservando datos) | `T030`, `T031` | `T005`, `T032` |
| **Req 5 / `FR-009`, `US3`, Obs. O1** (Enlace `"¿Ya tienes cuenta? Inicia sesión"`, rutas `/login`, `/register`, `/`, desconocidas y `popstate`) | `T024`, `T025`, `T026` | `T027`, `T028`, `T029` |
| **Req 6 / `FR-010`, `US1`, Obs. O2** (Registro simulado con `RegistrationInput` redirige a `/login` con mensaje de éxito) | `T010`, `T011`, `T012`, `T025`, `T026` | `T004`, `T008`, `T014`, `T016`, `T028`, `T029` |
| **Req 7 / `FR-005`, `FR-006`, `US2`** (Validaciones inline: correo válido, contraseña ≥ 8, coincidencia y todos obligatorios) | `T018`, `T019`, `T020` | `T005`, `T013`, `T021`, `T022`, `T023` |
| **Req 8 / `FR-011`, `US5`** (Responsive: 2 paneles en escritorio y solo formulario en móvil; visibilidad de contraseñas `FR-007`) | `T003`, `T033`, `T034` | `T007`, `T035` |
| **`FR-012`, `SC-004`** (Accesibilidad WCAG 2.1 AA y operación con teclado) | `T002`, `T020`, `T033`, `T037` | `T006`, `T023`, `T035`, `T039` |
| **`FR-013`, `SC-006`** (Seguridad: no exposición de contraseñas ni secretos) | `T036` | `T014`, `T016`, `T039` |
| **Obs. O3 / Constitución 8.3, 9.4** (Actualización de `README.md` y `npm run verify` con cobertura ≥ 80 %) | `T001`, `T036`, `T037` | `T038`, `T039` |

---

## Parallel Opportunities

- **Phase 2 (Foundational)**: `T002` y `T003` en paralelo; `T004`, `T005`, `T006` y `T007` en paralelo.
- **Phase 3 (US1)**: `T009`, `T010` y `T011` en paralelo; `T013` y `T014` en paralelo.
- **Phase 4 (US2)**: `T018` y `T019` en paralelo.
- **Phase 5 (US3)**: `T024` y `T025` en paralelo; `T027` y `T028` en paralelo.
- **Phase 7 (US5)**: `T033` y `T034` en paralelo.
- **Phase 8 (Polish)**: `T036`, `T037` y `T038` en paralelo antes de `T039`.

---

## Parallel Example: User Story 1

```bash
# Lanzar pruebas unitarias de US1 en paralelo (archivos independientes):
Task: "T009 [P] [US1] Pruebas de normalizeFullName y caso válido de validateRegistration en src/domain/validation.test.ts"
Task: "T010 [P] [US1] Pruebas unitarias de createRegisterUser en src/application/registerUser.test.ts"
Task: "T011 [P] [US1] Pruebas de registerReducer en src/ui/features/register/registerReducer.test.ts"

# Implementar dominio y caso de uso de US1 en paralelo:
Task: "T013 [P] [US1] Implementar normalizeFullName y base de validateRegistration en src/domain/validation.ts"
Task: "T014 [P] [US1] Implementar createRegisterUser en src/application/registerUser.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 + Routing Integration)

1. Completar **Phase 1 (Setup)** y **Phase 2 (Foundational)**.
2. Completar **Phase 3 (US1)** y **Phase 4 (US2)** siguiendo estrictamente TDD (Rojo → Verde → Refactorizar).
3. Completar **Phase 5 (US3)** para enlazar `/register` y `/login` con el mensaje de éxito.
4. **DETENERSE Y VALIDAR**: comprobar el flujo principal de registro y validaciones inline.

### Complete Delivery

1. Añadir **Phase 6 (US4)** para el aviso `"Próximamente"` en Google y Apple.
2. Añadir **Phase 7 (US5)** para validar visibilidad independiente de contraseñas, orden de tabulación y ocultación móvil del `BrandPanel` en `/register`.
3. Cerrar con **Phase 8 (Polish)**: pruebas de seguridad, auditoría `axe-core`, actualización de `README.md` y ejecución limpia de `npm run verify`.
