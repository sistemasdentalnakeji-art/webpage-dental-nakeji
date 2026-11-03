# Formulario de citas → Google Calendar

El formulario del homepage (sección **Agenda tu visita**) envía cada solicitud a una
**aplicación web de Google Apps Script** que vive en la cuenta de Google de la clínica.
El script valida los datos, revisa que el horario esté libre y crea un evento amarillo
"Solicitud de cita" en Google Calendar. La clínica confirma después por teléfono o WhatsApp.

No hace falta servidor propio ni claves secretas.

## 1. Preparar el calendario (recomendado)
1. Entra a Google Calendar con la cuenta de la clínica.
2. **Otros calendarios → + → Crear calendario**, por ejemplo "Citas web". Déjalo **privado**:
   los eventos incluyen nombre, teléfono y servicio del paciente.
3. En la configuración de ese calendario, copia el **ID del calendario** (sección "Integrar calendario").

## 2. Crear el script
1. Abre <https://script.google.com> con la misma cuenta → **Nuevo proyecto**. Nómbralo "Dental Nakeji – Citas".
2. Borra el contenido de `Código.gs` y pega el de [`Code.gs`](Code.gs).
3. **Configuración del proyecto (⚙)** → activa *Mostrar el archivo de manifiesto "appsscript.json"*.
   Abre `appsscript.json` y reemplázalo con [`appsscript.json`](appsscript.json) (zona horaria `America/Tijuana`).
4. En `CONFIG` (arriba de `Code.gs`) ajusta:
   - `CALENDAR_ID`: el ID del paso 1 (vacío = calendario principal).
   - `CLOSED_WEEKDAYS`, `SLOTS`, `DURATION_MINUTES`: **horario real de la clínica**.
   - `NOTIFY_EMAILS`: lista de correos que reciben un aviso (con diseño, teléfono y origen) por cada solicitud. Vacía = sin aviso.

> Los horarios deben coincidir con `src/config/booking.ts` del sitio.

## 3. Publicar
1. **Implementar → Nueva implementación → Tipo: Aplicación web**.
2. *Ejecutar como*: **Yo**. *Quién tiene acceso*: **Cualquier usuario**.
3. Autoriza los permisos (Calendar y envío de correo). Si aparece "Google no verificó esta app",
   entra en *Configuración avanzada → Ir a Dental Nakeji – Citas*: es tu propio script.
4. Copia la **URL de la aplicación web** (termina en `/exec`).
   Para comprobarla, ábrela en el navegador: debe responder `{"ok":true,"service":"dental-nakeji-citas"}`.

## 4. Conectar el sitio
1. En la raíz del proyecto, copia `.env.example` como `.env.local` (desarrollo) y/o `.env.production` (build).
2. Pega la URL: `VITE_BOOKING_ENDPOINT=https://script.google.com/macros/s/XXXX/exec`
3. Reinicia `npm run dev` o vuelve a compilar con `npm run build:prod`.

Si la variable está vacía, el formulario se muestra pero avisa que aún no está conectado y ofrece WhatsApp.

## 5. Casilla anti-bots (Cloudflare Turnstile)
La URL `/exec` es pública, así que cualquiera podría mandarle solicitudes sin pasar por la web. Turnstile (gratis) lo evita:
1. En <https://dash.cloudflare.com> → **Turnstile → Add site**, con el dominio del sitio. Copia la **llave del sitio** (pública) y la **llave secreta**.
2. En el sitio: `VITE_TURNSTILE_SITE_KEY=<llave del sitio>` en `.env.production` (y en las variables de Vercel).
3. En el Apps Script: **Configuración del proyecto (⚙) → Propiedades de la secuencia de comandos → Añadir** `TURNSTILE_SECRET` = la llave secreta.
4. Al guardar `Code.gs` y `appsscript.json`, vuelve a implementar (nueva versión) y autoriza el permiso nuevo (conexión a servicios externos).

**La casilla es obligatoria:** sin `TURNSTILE_SECRET` el script rechaza todas las solicitudes (falla cerrado), así que
configura primero la llave secreta y la del sitio, y después publica la nueva versión. El script también exige que el
token venga de `TURNSTILE_HOSTNAMES` y de la acción `cita` (`CONFIG` en `Code.gs`); si agregas un dominio, agrégalo ahí.
Para pruebas, Cloudflare publica llaves de prueba, pero devuelven otro `hostname`: no sirven contra el script real.

## Cambios posteriores
Cada vez que edites `Code.gs`: **Implementar → Administrar implementaciones → ✏ → Versión: Nueva versión → Implementar**.
La URL `/exec` no cambia.

## Respuestas del script
| Respuesta | Significado | Lo que ve el paciente |
|---|---|---|
| `{"ok":true}` | Evento creado | Confirmación con resumen |
| `{"ok":false,"error":"busy"}` | El horario ya tiene el cupo lleno para ese servicio (`MAX_PER_SERVICE_PER_SLOT`, 5 por defecto) | "Ese horario ya está ocupado" |
| `{"ok":false,"error":"invalid"}` | Datos fuera de reglas | "Revisa los datos" |
| `{"ok":false,"error":"server"}` | Error del script | Mensaje + enlace a WhatsApp |
| `{"ok":false,"error":"limit"}` | Límite anti-abuso (por hora o mismo teléfono) | Mensaje + enlace a WhatsApp |
| `{"ok":false,"error":"captcha"}` | Falta o falló la casilla anti-bots | "Completa la verificación de seguridad" |

## Cupos y colores
- **Cupo:** se aceptan hasta `MAX_PER_SERVICE_PER_SLOT` citas (5) del **mismo servicio** que empiecen a la **misma hora**; la siguiente
  responde `busy`. Cuentan las solicitudes del formulario (pendientes y confirmadas) y las citas puestas a mano **si el título o la
  descripción nombran el servicio** (por eso recepción y ventas deben escribir el servicio en el título). Los eventos de todo el día no cuentan.
- **Colores** (solo una convención del personal; el script no depende de ellos): amarillo = solicitud nueva del formulario (el script
  lo pone solo); al confirmarla se cambia a otro color (azul = citas de `info`, gris = recepción).

## Privacidad y seguridad
- El formulario exige aceptar el **aviso de privacidad** (`/aviso-de-privacidad/`). Falta publicar el texto legal de la clínica (LFPDPPP).
- La URL `/exec` es pública por diseño. Protecciones incluidas: casilla anti-bots Turnstile (ver sección 5), validación en el
  servidor (incluida la lista de servicios), campo trampa `hp_x`, tope de 300 intentos por hora antes de verificar la
  casilla (cuida la cuota de `UrlFetch`; las solicitudes sin casilla se rechazan antes de contarlas), cuerpos de máximo 10 000 caracteres,
  rechazo de enlaces en los comentarios, límite de solicitudes por hora (`MAX_REQUESTS_PER_HOUR`, cuentan también las rechazadas por
  horario ocupado) y por teléfono (`MAX_REQUESTS_PER_PHONE_PER_HOUR`: 3 por hora, comparando los últimos 10 dígitos) y bloqueo para evitar dobles reservas.
- Correo de aviso: solo se envía el de la primera solicitud de cada hora, para no agotar la cuota diaria de la cuenta
  (≈100 en Gmail). Las demás están en Calendar. Si el correo falla, el script deja un evento "AVISO" de todo el día.
- Alternativa sin código: **Google Calendar → Agenda de citas** genera una página de reservas propia
  que se puede enlazar o insertar. Tiene menos control del diseño y de los campos.
