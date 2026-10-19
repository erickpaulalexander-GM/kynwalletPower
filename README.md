# KynWallet · Inicio de sesión y Registro (demo)

Demostración funcional, solo del lado del cliente, de las pantallas de inicio de sesión (`/login`)
y registro de usuarios (`/register`) de la billetera virtual KynWallet. Reproduce el diseño de Figma
([01 · Login](https://www.figma.com/design/f7uDsv8sh6ZOtK2OitTqtg/Billetera-Virtual---Prototipos?node-id=2-2)),
valida los campos inline y simula tanto la autenticación contra cuentas ficticias como el proceso
de creación de cuenta, sin backend ni base de datos.

Especificaciones, planes y tareas:

- Inicio de sesión: [`specs/001-login-billetera/`](specs/001-login-billetera/)
- Registro de usuarios: [`specs/002-registro-billetera/`](specs/002-registro-billetera/)

## Rutas disponibles

- `/login` (y `/` por redirección automática): formulario de inicio de sesión con soporte para mostrar
  el mensaje de éxito tras completar el registro y acceso directo a `/register` mediante el botón
  **«Regístrate»**.
- `/register`: formulario de registro con validación inline (`Nombre completo`, `Correo electrónico`,
  `Contraseña`, `Confirmar contraseña` y casilla `Acepto los términos y condiciones`), simulación de
  envío (`~1 s`), botones sociales (`Google` y `Apple` con aviso **«Próximamente»**), enlace
  **«¿Ya tienes cuenta? Inicia sesión»** hacia `/login` y diseño responsive (dos paneles en
  escritorio `≥ 960 px` y solo formulario en móvil `< 960 px`).

## Requisitos

- Node.js 20 LTS o superior y npm 10 o superior.

## Configuración

```bash
npm install
cp .env.example .env.local
```

Edita `.env.local` y define al menos una cuenta **ficticia** en `VITE_DEMO_USERS`:

```dotenv
VITE_DEMO_USERS=[{"email":"tu.correo@example.com","password":"minimo-8-caracteres","displayName":"Tu Nombre"}]
```

- `password`: de 8 a 128 caracteres. `displayName`: de 1 a 80 caracteres. Los correos no se pueden repetir.
- `.env.local` no se versiona: la Constitución del proyecto (regla 5.3) prohíbe credenciales en el
  código fuente o en archivos versionados.
- ⚠️ Al ser una aplicación solo-cliente, el valor de `VITE_DEMO_USERS` queda incluido en el bundle
  compilado. Usa únicamente cuentas ficticias.
- Si la variable falta o es inválida, la pantalla muestra "Servicio de acceso no disponible".

## Scripts

| Comando                           | Descripción                                                                                                                                           |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                     | Servidor de desarrollo en <http://localhost:5173>                                                                                                     |
| `npm run build`                   | Typecheck y build de producción en `dist/`                                                                                                            |
| `npm run preview`                 | Sirve el build de producción                                                                                                                          |
| `npm test`                        | Ejecuta las pruebas una vez                                                                                                                           |
| `npm run test:watch`              | Pruebas en modo observación                                                                                                                           |
| `npm run test:coverage`           | Pruebas con cobertura (umbral: 80 %)                                                                                                                  |
| `npm run lint` / `npm run format` | ESLint / Prettier                                                                                                                                     |
| `npm run verify`                  | Todos los controles de cumplimiento: lint, formato, tipos, pruebas con cobertura, build, auditoría de dependencias y licencias, y escaneo de secretos |

## Arquitectura

Clean Architecture ligera. Las dependencias apuntan hacia el dominio y ESLint lo verifica:

```text
src/
├── domain/          # Tipos, reglas de validación y textos. Sin React.
├── application/     # Casos de uso `authenticate`, `registerUser` y puerto `AuthGateway`
├── infrastructure/  # `InMemoryAuthGateway` (simulación, 1 s) y `loadDemoAccounts`
├── ui/
│   ├── styles/      # Tokens de Figma (`tokens.css`) y estilos globales
│   ├── components/  # Button, TextField, PasswordField, Checkbox, SocialButton, Divider, Alert
│   ├── layout/      # BrandPanel
│   └── features/
│       ├── login/     # LoginScreen, LoginForm, WelcomeView, reducer y hook
│       └── register/  # RegisterForm, registerReducer y useRegisterForm
├── App.tsx          # Enrutamiento `/login` ↔ `/register` (History API) y estado post-registro
└── main.tsx         # Raíz de composición (inyección de dependencias)
```

Las pruebas viven junto al código (`*.test.ts(x)`). Cada caso se nombra con el escenario o
requisito que verifica (por ejemplo, `US2-1`, `FR-012`) para mantener la trazabilidad.

## Notas de diseño

- **Contraste (pendiente de aprobación de diseño):** varios colores de Figma no alcanzan
  WCAG 2.1 AA (botón 2.83:1, enlaces 3.56:1, textos secundarios 3.28:1, bordes 1.40:1). Se
  usan variantes más oscuras del mismo tono (`--brand-700`, `--neutral-600`, `--neutral-border`
  en `src/ui/styles/tokens.css`). Detalle en `specs/001-login-billetera/research.md` (R3).
- Los iconos de Google, Apple y del control de visibilidad son los marcadores de posición del
  diseño de Figma.
- **Alcance simulado del registro:** el registro en `/register` es una simulación de interfaz que
  valida todos los campos, simula el procesamiento y redirige a `/login` mostrando el mensaje
  **«¡Cuenta creada exitosamente! Inicia sesión para continuar.»**, sin persistir cuentas nuevas en
  backend ni modificar `InMemoryAuthGateway`.
- Fuera de alcance: recuperar contraseña, autenticación OAuth real con Google/Apple, persistencia de
  "Recordarme" y bloqueo por intentos fallidos. Al activarlos se muestra el aviso correspondiente.
