# Feature Specification: Pantalla de Registro de Usuarios de KynWallet

**Feature Branch**: `feature/registro-erick-guerrero`

**Created**: 2026-10-18

**Status**: Draft

**Input**: User description: "Taller de registro de usuarios de KynWallet usando Spec-Driven
Development (SDD). Requisitos funcionales principales: (1) Formulario con nombre completo, correo
electrónico, contraseña y confirmar contraseña. (2) Checkbox de aceptación de términos y
condiciones. (3) Botón 'Crear cuenta' que valide todos los campos antes de enviar. (4) Botones de
Google y Apple que muestren el alert 'Próximamente'. (5) Enlace '¿Ya tienes cuenta? Inicia sesión'
que lleve a /login. (6) Registro exitoso que redirige a /login con mensaje de éxito.
(7) Validaciones inline: correo válido, contraseña de mínimo 8 caracteres, contraseñas coincidentes
y todos los campos obligatorios. (8) Diseño responsive: escritorio con dos paneles y móvil
mostrando solo el formulario. Referencia de diseño en Figma: frame '04 · Registro' (nodo 31:2)."

**Diseño de referencia**: Figma, frame `04 · Registro` (nodo `31:2`, archivo
`f7uDsv8sh6ZOtK2OitTqtg`). Compuesto en escritorio por dos paneles (panel de marca de KynWallet y
panel con el formulario de registro) y en dispositivos móviles únicamente por el formulario de
registro.

## Clarifications

### Session 2026-10-18

- Q: ¿El registro simulado debe almacenar cuentas nuevas en memoria o validar correos duplicados? →
  A: No. El registro es exclusivamente una simulación del flujo de interfaz: no persiste ni agrega
  cuentas ni comprueba correos duplicados; un envío válido muestra un estado de carga, simula el
  procesamiento y redirige a `/login` mostrando el mensaje de éxito.
- Q: ¿Cómo deben comportarse las rutas `/login` y `/register` y el texto de la casilla de términos?
  → A: `/login` y `/register` funcionan como rutas reales del navegador (donde `/` conduce a
  `/login`), y la casilla de aceptación de términos utiliza una etiqueta de texto plano sin enlaces
  internos adicionales.
- Q: ¿Cuáles son los textos literales obligatorios en la interfaz de registro? → A: Se conservan
  literalmente los textos fijados en los requisitos del taller: botón `"Crear cuenta"`, alerta
  `"Próximamente"` para Google y Apple, y pie `"¿Ya tienes cuenta? Inicia sesión"`. El resto de
  textos, etiquetas y mensajes emplea español coherente con la pantalla de inicio de sesión
  existente.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Completar el registro simulado y redirigir al inicio de sesión (Priority: P1)

Como nuevo usuario de la billetera virtual KynWallet, quiero completar el formulario de registro
con mi nombre completo, correo electrónico, contraseña, confirmación de contraseña y aceptación de
términos y condiciones, para crear mi cuenta y ser redirigido al inicio de sesión con confirmación
de éxito.

**Why this priority**: constituye el flujo principal de valor del taller (requisitos 1, 2, 3 y 6);
sin él no es posible demostrar el proceso de alta de usuario de principio a fin.

**Independent Test**: se navega a `/register`, se completan los cuatro campos con valores válidos,
se marca la casilla de aceptación de términos y condiciones, se presiona `"Crear cuenta"` y se
verifica el estado de carga seguido de la redirección a `/login` con el mensaje de éxito visible.

**Acceptance Scenarios**:

1. **Given** la pantalla de registro (`/register`), **When** el usuario ingresa un nombre completo
   válido, un correo electrónico válido, una contraseña de al menos 8 caracteres, una confirmación
   idéntica a la contraseña, marca la casilla `"Acepto los términos y condiciones"` y presiona
   `"Crear cuenta"`, **Then** el sistema simula el procesamiento del registro y, al finalizar,
   redirige a `/login` mostrando el mensaje de éxito `"¡Cuenta creada exitosamente! Inicia sesión
   para continuar."`.
2. **Given** el usuario envió el formulario con todos los datos válidos, **When** el registro
   simulado está en curso, **Then** el botón `"Crear cuenta"` muestra un estado de carga
   (`"Creando cuenta…"`), permanece deshabilitado e ignora envíos repetidos.
3. **Given** el usuario ingresa espacios al inicio o al final en el nombre completo o en el correo
   electrónico (o letras mayúsculas en el correo), **When** envía el formulario con el resto de los
   datos válidos, **Then** el sistema acepta los valores tras normalizarlos y completa el registro
   exitosamente.
4. **Given** el usuario se encuentra en un campo del formulario con todos los datos válidos y la
   casilla de términos marcada, **When** presiona la tecla Enter, **Then** el formulario se envía
   igual que al presionar `"Crear cuenta"`.

---

### User Story 2 - Validar los campos inline antes de enviar (Priority: P1)

Como usuario que completa su registro, quiero ver mensajes de validación claros junto a cada campo
cuando algún dato obligatorio falte, el correo no sea válido, la contraseña tenga menos de 8
caracteres, las contraseñas no coincidan o no haya aceptado los términos, para corregir los errores
antes del envío.

**Why this priority**: las validaciones inline previas al envío son obligatorias en los requisitos
del taller (requisitos 2, 3 y 7) y garantizan la validación en el límite del sistema exigida por
la Constitución (Principio V).

**Independent Test**: se intenta enviar el formulario vacío y luego con cada condición inválida por
separado (correo inválido, contraseña de menos de 8 caracteres, confirmación distinta y términos no
aceptados), comprobando que los mensajes aparecen junto a cada control y que no se inicia el envío.

**Acceptance Scenarios**:

1. **Given** el formulario de registro con todos los campos vacíos y la casilla desmarcada,
   **When** el usuario presiona `"Crear cuenta"`, **Then** se muestran los mensajes de
   obligatoriedad junto a cada control (`"Ingresa tu nombre completo"`,
   `"Ingresa tu correo electrónico"`, `"Ingresa tu contraseña"`, `"Confirma tu contraseña"` y
   `"Debes aceptar los términos y condiciones"`), no se ejecuta el registro simulado y el foco se
   sitúa en el primer campo con error.
2. **Given** un correo electrónico sin formato válido (por ejemplo, `"usuario@"`, `"usuario.com"` o
   `"a@b.c"`), **When** el usuario sale del campo o presiona `"Crear cuenta"`, **Then** se muestra
   inline junto al campo el mensaje `"Ingresa un correo electrónico válido"` y no se envía el
   formulario.
3. **Given** una contraseña con menos de 8 caracteres, **When** el usuario sale del campo o
   presiona `"Crear cuenta"`, **Then** se muestra inline junto al campo el mensaje
   `"La contraseña debe tener al menos 8 caracteres"` y no se envía el formulario.
4. **Given** una contraseña ingresada y un valor en `"Confirmar contraseña"` que no coincide
   exactamente con ella, **When** el usuario sale del campo de confirmación o presiona
   `"Crear cuenta"`, **Then** se muestra inline junto al campo de confirmación el mensaje
   `"Las contraseñas no coinciden"` y no se envía el formulario.
5. **Given** todos los campos de texto válidos pero la casilla de términos y condiciones sin
   marcar, **When** el usuario presiona `"Crear cuenta"`, **Then** se muestra inline junto a la
   casilla el mensaje `"Debes aceptar los términos y condiciones"` y no se envía el formulario.
6. **Given** un campo o casilla que muestra un error de validación inline, **When** el usuario
   corrige su valor o marca la casilla, **Then** el mensaje de error de ese control desaparece de
   inmediato.
7. **Given** cualquier control con error de validación visible, **When** es leído por tecnologías
   de asistencia, **Then** el control se identifica como inválido y anuncia el mensaje de error
   asociado.

---

### User Story 3 - Navegar entre Registro e Inicio de Sesión (Priority: P2)

Como usuario de KynWallet, quiero usar el enlace `"¿Ya tienes cuenta? Inicia sesión"` para ir a
`/login` si ya tengo cuenta, y poder llegar a `/register` desde la pantalla de inicio de sesión.

**Why this priority**: cumple el requisito 5 del taller y conecta las rutas `/login` y `/register`
dentro del mismo flujo de acceso.

**Independent Test**: en `/register` se activa `"Inicia sesión"` dentro de
`"¿Ya tienes cuenta? Inicia sesión"` y se comprueba el cambio a `/login`; en `/login` se activa
`"Regístrate"` y se comprueba el cambio a `/register`.

**Acceptance Scenarios**:

1. **Given** la pantalla de registro (`/register`), **When** el usuario activa el enlace
   `"Inicia sesión"` en el texto `"¿Ya tienes cuenta? Inicia sesión"`, **Then** la aplicación
   navega a `/login` y muestra el formulario de inicio de sesión limpio.
2. **Given** la pantalla de inicio de sesión (`/login`), **When** el usuario activa la acción
   `"Regístrate"`, **Then** la aplicación navega a `/register` y muestra el formulario de registro
   limpio.
3. **Given** un usuario que accede a la ruta raíz (`/`), **When** se carga la aplicación, **Then**
   se presenta la vista de inicio de sesión (`/login`).

---

### User Story 4 - Mostrar alerta “Próximamente” en botones de Google y Apple (Priority: P2)

Como usuario en la pantalla de registro, quiero que al pulsar los botones de Google o Apple se me
muestre la alerta `"Próximamente"`, para saber que el registro social aún no está habilitado sin
perder los datos que ya escribí.

**Why this priority**: responde directamente al requisito 4 del taller y preserva la fidelidad al
diseño de Figma sin ampliar el alcance funcional (YAGNI).

**Independent Test**: se ingresan valores en el formulario de registro, se activan los botones
`"Google"` y `"Apple"` y se verifica que se muestra la alerta `"Próximamente"` manteniendo intactos
los valores del formulario.

**Acceptance Scenarios**:

1. **Given** la pantalla de registro (`/register`), **When** el usuario presiona el botón
   `"Google"` o el botón `"Apple"`, **Then** se muestra un mensaje de alerta con el texto exacto
   `"Próximamente"` anunciado por tecnologías de asistencia y se conservan los datos ingresados en
   el formulario.

---

### User Story 5 - Diseño responsive y visibilidad de contraseñas (Priority: P3)

Como usuario desde un computador de escritorio o desde un teléfono móvil, quiero que la pantalla de
registro muestre dos paneles en escritorio y únicamente el formulario en móvil, además de poder
mostrar u ocultar las contraseñas mientras las escribo.

**Why this priority**: cubre el requisito 8 del taller y asegura la experiencia de uso y
accesibilidad en todo rango de pantallas.

**Independent Test**: se inspecciona `/register` en ancho de escritorio (≥ 960 px) verificando la
presencia del panel de marca y del panel de formulario, y en ancho móvil (< 960 px hasta 320 px)
verificando que solo se muestre el formulario sin desplazamiento horizontal; además se prueba
mostrar/ocultar en ambos campos de contraseña.

**Acceptance Scenarios**:

1. **Given** una ventana de escritorio (ancho ≥ 960 px), **When** se visualiza `/register`,
   **Then** la pantalla presenta dos paneles: el panel de marca a la izquierda y el formulario de
   registro a la derecha.
2. **Given** una ventana móvil (ancho < 960 px, desde 320 px), **When** se visualiza `/register`,
   **Then** el panel de marca se oculta y se muestra únicamente el formulario de registro, sin
   desplazamiento horizontal.
3. **Given** los campos `"Contraseña"` y `"Confirmar contraseña"` con sus caracteres ocultos por
   defecto, **When** el usuario activa el control de visibilidad de uno de los campos, **Then** se
   alterna entre mostrar y ocultar únicamente el valor de ese campo.

---

### Edge Cases

- El usuario presiona `"Crear cuenta"` múltiples veces seguidas durante la simulación de envío:
  solo se procesa un único envío.
- El usuario ingresa solo espacios en blanco en `"Nombre completo"`: se trata como vacío y muestra
  `"Ingresa tu nombre completo"`.
- El usuario escribe una contraseña y su confirmación idéntica, y luego modifica el campo
  `"Contraseña"`: la validación de `"Confirmar contraseña"` se actualiza y, si dejan de coincidir,
  muestra `"Las contraseñas no coinciden"`.
- Las contraseñas contienen espacios iniciales o finales: no se recortan al validar longitud ni al
  comparar coincidencia entre `"Contraseña"` y `"Confirmar contraseña"`.
- El usuario supera los límites máximos de entrada (nombre > 80 caracteres, correo > 254
  caracteres, contraseña > 128 caracteres): se rechaza con el mensaje de validación correspondiente
  sin iniciar el envío.
- Tras ser redirigido a `/login` con el mensaje de éxito de registro, el usuario comienza a editar
  las credenciales de login, envía el formulario de login o navega de nuevo a `/register`: el
  mensaje de éxito previo desaparece.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La pantalla de registro (`/register`) DEBE reproducir la estructura y jerarquía
  visual del diseño de referencia de Figma (`04 · Registro`, nodo `31:2`), reutilizando los
  componentes y lineamientos visuales existentes en el proyecto (Constitución 8.5, 8.6).
- **FR-002**: El formulario de registro DEBE contener los campos `"Nombre completo"`,
  `"Correo electrónico"`, `"Contraseña"` y `"Confirmar contraseña"` (requisito 1).
- **FR-003**: El formulario DEBE incluir una casilla de verificación obligatoria con etiqueta de
  texto plano (`"Acepto los términos y condiciones"`) para aceptar los términos y condiciones
  (requisito 2).
- **FR-004**: El formulario DEBE contar con un botón principal con el texto exacto `"Crear cuenta"`
  que valide todos los campos y la casilla de términos antes de iniciar el envío (requisito 3).
- **FR-005**: El sistema DEBE validar inline y como obligatorios todos los controles del formulario
  (requisito 7):
  - **Nombre completo**: obligatorio (no vacío tras recortar espacios periféricos) y de 1 a 80
    caracteres.
  - **Correo electrónico**: obligatorio, con formato de correo válido y máximo 254 caracteres
    (ignorando espacios periféricos y diferencias de mayúsculas/minúsculas).
  - **Contraseña**: obligatoria y con longitud entre 8 y 128 caracteres (sin recortar espacios).
  - **Confirmar contraseña**: obligatoria y exactamente igual al valor ingresado en `"Contraseña"`.
  - **Aceptación de términos y condiciones**: obligatoriamente marcada.
- **FR-006**: Los mensajes de error de validación DEBEN mostrarse inline junto a cada campo o
  casilla correspondiente al salir del campo o al presionar `"Crear cuenta"`, y DEBEN ocultarse
  automáticamente cuando el usuario corrija el dato. Mientras exista al menos un error de
  validación, el sistema NO DEBE ejecutar el registro simulado y, tras intentar enviar, DEBE mover
  el foco al primer control inválido (requisitos 3 y 7).
- **FR-007**: Los campos `"Contraseña"` y `"Confirmar contraseña"` DEBEN ocultar los caracteres por
  defecto y ofrecer un control accesible independiente para mostrarlos u ocultarlos.
- **FR-008**: La pantalla de registro DEBE mostrar los botones de proveedores `"Google"` y
  `"Apple"` separados por el divisor `"o regístrate con"` (o equivalente del diseño); al activar
  cualquiera de los dos botones, el sistema DEBE mostrar un alert con el texto exacto
  `"Próximamente"`, conservando los valores ingresados en el formulario (requisito 4).
- **FR-009**: La pantalla de registro DEBE incluir al pie el texto y enlace
  `"¿Ya tienes cuenta? Inicia sesión"` que lleve a la ruta `/login` (requisito 5), y la pantalla
  de inicio de sesión (`/login`) DEBE llevar a `/register` cuando el usuario active `"Regístrate"`.
  La ruta raíz `/` DEBE conducir a `/login`.
- **FR-010**: Cuando todos los campos sean válidos y la casilla de términos esté marcada, al
  presionar `"Crear cuenta"` el sistema DEBE simular el registro en el cliente (mostrando un estado
  de carga de aproximadamente 1 segundo con el botón deshabilitado) y, al concluir, redirigir a
  `/login` mostrando un mensaje de éxito de creación de cuenta (requisito 6). El registro simulado
  no almacena cuentas nuevas ni valida correos duplicados.
- **FR-011**: El diseño DEBE ser responsive sin desplazamiento horizontal desde 320 px hasta
  escritorio: en escritorio (≥ 960 px) DEBE mostrar dos paneles (panel de marca y panel de
  formulario) y en móvil (< 960 px) DEBE mostrar únicamente el formulario de registro
  (requisito 8).
- **FR-012**: La interfaz DEBE cumplir WCAG 2.1 nivel AA (Constitución 8.4): etiquetas asociadas a
  cada control, errores inline vinculados mediante descripción accesible y estado inválido, alertas
  anunciadas automáticamente, navegación completa con teclado y contraste suficiente.
- **FR-013**: El sistema NO DEBE exponer, registrar en consola ni almacenar la contraseña ni su
  confirmación en URLs, mensajes visibles ni almacenamiento del navegador (Constitución,
  Principio V).

### Key Entities

- **Datos del Formulario de Registro**: conjunto de valores ingresados por el usuario durante el
  intento de alta: nombre completo, correo electrónico, contraseña, confirmación de contraseña y
  estado de aceptación de términos. Vive únicamente mientras el formulario está activo y se
  descarta al redirigir a `/login`.
- **Resultado de Validación de Registro**: asociación de mensajes de error inline por cada control
  del formulario (`fullName`, `email`, `password`, `confirmPassword`, `termsAccepted`); un
  resultado vacío habilita la ejecución del registro simulado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario puede completar el formulario de registro con datos válidos y ser
  redirigido a `/login` viendo el mensaje de éxito en menos de 60 segundos.
- **SC-002**: Tras presionar `"Crear cuenta"` con datos válidos, la redirección a `/login` y la
  visualización del mensaje de éxito ocurren en un máximo de 2 segundos (incluyendo ~1 segundo de
  procesamiento simulado).
- **SC-003**: El 100 % de los escenarios de aceptación de las historias US1–US5 y de los 8
  requisitos funcionales del taller están verificados mediante pruebas automatizadas que pasan,
  manteniendo la cobertura global del proyecto ≥ 80 % (Constitución 8.1).
- **SC-004**: La pantalla de registro (en estado inicial, con errores inline visibles y con el
  alert `"Próximamente"`) registra 0 incumplimientos en auditorías automatizadas de accesibilidad
  WCAG 2.1 AA y puede completarse utilizando únicamente el teclado.
- **SC-005**: La pantalla se visualiza sin desplazamiento horizontal entre 320 px y 1440 px,
  presentando dos paneles en anchos de escritorio (≥ 960 px) y exclusivamente el formulario en
  anchos móviles (< 960 px).
- **SC-006**: Las contraseñas ingresadas no aparecen en registros de consola, URLs ni almacenamiento
  del navegador en ningún flujo de prueba, y el análisis de secretos del repositorio finaliza con
  0 hallazgos.

## Assumptions

- El alcance se limita a una demostración funcional del lado del cliente: no existe servicio
  backend, base de datos, envío de correos ni persistencia de cuentas registradas; las cuentas
  preconfiguradas de inicio de sesión permanecen sin cambios.
- Las reglas de formato de correo electrónico (máx. 254 caracteres), longitud de contraseña (8 a
  128 caracteres) y longitud de nombre (1 a 80 caracteres) son idénticas a las ya vigentes en el
  dominio de `001-login-billetera` para mantener una fuente única de validación (Principio IV).
- Se emplean los mismos tokens de color accesibles aprobados en la base del proyecto para cumplir
  el contraste mínimo WCAG 2.1 AA (Constitución 8.4).
- El idioma de toda la interfaz y de los mensajes al usuario es español.
- No existen documentos BRD ni ARD específicos para esta funcionalidad; prevalece la Constitución
  del proyecto (v1.0.0).
