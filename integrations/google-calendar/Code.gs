/**
 * Dental Nakeji - Solicitudes de cita desde el sitio web -> Google Calendar.
 *
 * Se publica como "Aplicacion web" desde la cuenta de Google de la clinica.
 * Recibe el formulario del homepage (POST, JSON), valida los datos, revisa que el
 * horario este libre y crea un evento "Solicitud de cita" en el calendario indicado.
 */

// Los horarios y servicios deben coincidir con src/config/booking.ts
const CONFIG = {
  /** ID del calendario de citas (Configuracion del calendario -> Integrar calendario). Vacio = calendario principal. */
  CALENDAR_ID: '',
  /** Duracion de cada cita en minutos. */
  DURATION_MINUTES: 60,
  /** Dias sin atencion: 0 = domingo ... 6 = sabado. */
  CLOSED_WEEKDAYS: [0],
  /** Horarios permitidos (24 h). */
  SLOTS: [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  ],
  /** Ultimo horario aceptado en ciertos dias (0 = domingo ... 6 = sabado): los sabados, hasta las 16:00. */
  LAST_SLOT_BY_WEEKDAY: { 6: '16:00' },
  /** Hasta cuantos dias adelante se aceptan solicitudes. */
  DAYS_AHEAD: 60,
  /** Rechazar si el horario ya esta lleno para ese servicio (ver MAX_PER_SERVICE_PER_SLOT). */
  CHECK_CONFLICTS: true,
  /** Citas permitidas del MISMO servicio a la MISMA hora (pendientes y confirmadas cuentan). La siguiente se rechaza como "busy". */
  MAX_PER_SERVICE_PER_SLOT: 5,
  /**
   * Palabras (en minusculas) con las que recepcion suele escribir cada servicio en el titulo de una cita a mano; sirven para contarla
   * en el cupo. Ademas siempre vale el nombre exacto del servicio (lo que escribe el formulario). Agrega aqui las que falten.
   */
  SERVICE_KEYWORDS: {
    'Valoración general': ['valoración', 'valoracion', 'evaluat', 'evaluac'],
    'Limpieza dental': ['limpieza', 'cleaning'],
    'Implantes dentales': ['implante'],
    'All on 4 implants': ['all on 4', 'all-on-4', 'all in 4'],
    'All on 6 implants': ['all on 6', 'all-on-6', 'all in 6'],
    'Coronas': ['corona', 'crown'],
    'Carillas dentales': ['carilla', 'veneer'],
    'Blanqueamiento dental': ['blanqueamiento', 'whitening'],
    'Endodoncias': ['endodoncia', 'root canal'],
    'Ortodoncia': ['ortodoncia', 'brackets', 'braces'],
    'Alineadores': ['alineador', 'invisalign', 'aligner'],
    'Odontopediatría': ['odontopediatr', 'pediatr'],
    'Dentaduras': ['dentadura', 'denture'],
    'Periodoncia': ['periodoncia'],
    'Extracciones simples y de juicio': ['extracci', 'extraction'],
  },
  /** Correos que reciben un aviso por cada solicitud (ventas y recepcion). Vacio = sin aviso. */
  NOTIFY_EMAILS: ['nakejidentalclinic@gmail.com', 'citasnakeji@gmail.com'],
  /** Logo del correo (se carga desde el sitio publicado). */
  LOGO_URL: 'https://www.nakejidental.com/brand/logo-nakeji-animado.gif',
  /** Datos de la clinica para el pie del correo (deben coincidir con src/config/site.ts). */
  CLINIC: {
    site: 'https://www.nakejidental.com',
    address: 'Av. Río Tijuana 2440, Int. PH3, Jose María Velasco, Zona Urbana Río Tijuana, 22010 Tijuana, B.C.',
    mapsUrl: 'https://maps.app.goo.gl/8yYpDMNXzJLRXzhV8',
    phones: [
      { label: 'México', display: '(664) 449 4649', e164: '+526644494649' },
      { label: 'EE. UU.', display: '(619) 730 4612', e164: '+16197304612' },
    ],
    social: [
      { label: '📘 Facebook', href: 'https://www.facebook.com/DentalNakeji/' },
      { label: '📸 Instagram', href: 'https://www.instagram.com/dentalnakeji/' },
      { label: '💬 WhatsApp', href: 'https://wa.me/message/VVH7OKKWM2W7O1' },
    ],
    /** Respuesta del comprobante que recibe el paciente. */
    replyTo: 'citasnakeji@gmail.com',
    privacyUrl: 'https://www.nakejidental.com/es/aviso-de-privacidad/',
  },
  /** Color del evento en Calendar (amarillo = por confirmar). */
  EVENT_COLOR: CalendarApp.EventColor.YELLOW,
  /** Servicios aceptados: deben coincidir, en el mismo orden, con SERVICES de src/config/booking.ts. */
  SERVICES: [
    'Valoración general',
    'Limpieza dental',
    'Implantes dentales',
    'All on 4 implants',
    'All on 6 implants',
    'Coronas',
    'Carillas dentales',
    'Blanqueamiento dental',
    'Endodoncias',
    'Ortodoncia',
    'Alineadores',
    'Odontopediatría',
    'Dentaduras',
    'Periodoncia',
    'Extracciones simples y de juicio',
  ],
  /** Paginas desde donde se acepta el campo "source" (cualquier otra cosa se guarda como "-"). */
  SOURCE_PREFIXES: [
    'https://nakejidental.com/',
    'https://www.nakejidental.com/',
    'https://sistemasdentalnakeji-art.github.io/',
  ],
  /** Limite global de solicitudes por hora (frena que un script llene el calendario). */
  MAX_REQUESTS_PER_HOUR: 30,
  /** Limite de intentos por hora ANTES de verificar la casilla: cada verificacion gasta cuota de UrlFetch. */
  MAX_ATTEMPTS_PER_HOUR: 300,
  /** Tamano maximo del cuerpo recibido (una solicitud real pesa menos de 2 KB). */
  MAX_BODY_CHARS: 10000,
  /** Sitios para los que Cloudflare puede haber emitido el token, y accion del widget (igual que BookingForm.tsx). */
  TURNSTILE_HOSTNAMES: ['nakejidental.com', 'www.nakejidental.com', 'sistemasdentalnakeji-art.github.io'],
  TURNSTILE_ACTION: 'cita',
  /** Solicitudes aceptadas por telefono en una hora (comparando los ultimos 10 digitos). */
  MAX_REQUESTS_PER_PHONE_PER_HOUR: 3,
};

function doPost(e) {
  try {
    const body = (e && e.postData && e.postData.contents) || '{}';
    if (body.length > CONFIG.MAX_BODY_CHARS) return json_({ ok: false, error: 'invalid', fields: [] });
    const data = JSON.parse(body);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return json_({ ok: false, error: 'invalid', fields: [] });
    // Los textos se recortan una sola vez: validacion, llaves de cache y evento usan los mismos valores.
    ['firstName', 'lastName', 'phone', 'email', 'service', 'date', 'time', 'comments'].forEach((key) => {
      data[key] = String(data[key] || '').trim();
    });

    // Trampa anti-spam: si el campo oculto viene lleno se responde "ok" sin crear nada.
    if (data.hp_x) return json_({ ok: true });

    const errors = validate_(data);
    if (errors.length) return json_({ ok: false, error: 'invalid', fields: errors });
    // Sin casilla no cuenta como intento: asi un bot que no manda token no puede agotar el tope de todos.
    if (!data.turnstile) return json_({ ok: false, error: 'captcha' });

    // Tope de intentos antes de llamar a Cloudflare, para que un bot no agote la cuota de UrlFetch.
    // shortcut: este conteo va fuera del candado y puede pasarse por unos pocos; basta para frenar un abuso.
    const hour = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMddHH');
    const cache = CacheService.getScriptCache();
    const attemptsKey = 'attempts-' + hour;
    const attempts = Number(cache.get(attemptsKey) || 0);
    if (attempts >= CONFIG.MAX_ATTEMPTS_PER_HOUR) return json_({ ok: false, error: 'limit' });
    cache.put(attemptsKey, String(attempts + 1), 3600);

    // Casilla anti-bots. Va antes de los limites: un bot rechazado no gasta el cupo de los pacientes.
    if (!humanVerified_(data.turnstile)) return json_({ ok: false, error: 'captcha' });

    const start = toDate_(data.date, data.time);
    const end = new Date(start.getTime() + CONFIG.DURATION_MINUTES * 60 * 1000);
    const calendar = CONFIG.CALENDAR_ID
      ? CalendarApp.getCalendarById(CONFIG.CALENDAR_ID)
      : CalendarApp.getDefaultCalendar();
    if (!calendar) throw new Error('Calendario no encontrado: revisa CALENDAR_ID');

    // Los limites se leen y se escriben dentro del candado: dos solicitudes simultaneas no pasan ambas el tope.
    let quota = 0;
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const hourKey = 'count-' + hour;
      const phone = String(data.phone).replace(/\D/g, '').slice(-10);
      const phoneKey = 'phone-' + phone + '-' + hour;
      // Un reintento de la misma solicitud (mismo telefono, fecha y hora; p. ej. por mala senal) responde "ok" sin crear otro evento.
      const sameRequestKey = 'same-' + phone + '-' + data.date + '-' + data.time;
      if (cache.get(sameRequestKey)) return json_({ ok: true });
      const requestsThisHour = Number(cache.get(hourKey) || 0);
      const phoneThisHour = Number(cache.get(phoneKey) || 0);
      if (requestsThisHour >= CONFIG.MAX_REQUESTS_PER_HOUR || phoneThisHour >= CONFIG.MAX_REQUESTS_PER_PHONE_PER_HOUR) {
        return json_({ ok: false, error: 'limit' });
      }
      // Cuentan tambien las solicitudes rechazadas por horario ocupado (si no, se podria insistir sin tope).
      cache.put(hourKey, String(requestsThisHour + 1), 3600);

      // Cupo: cuentan los eventos que empiezan a esa misma hora y nombran el mismo servicio (o una de sus palabras de SERVICE_KEYWORDS)
      // en el titulo o la descripcion. Las solicitudes del formulario siempre lo hacen. Los de todo el dia no cuentan.
      const words = [clean_(data.service).toLowerCase()].concat(CONFIG.SERVICE_KEYWORDS[data.service] || []);
      const sameSlot = calendar.getEvents(start, end).filter((event) => {
        if (event.isAllDayEvent() || event.getStartTime().getTime() !== start.getTime()) return false;
        const text = (event.getTitle() + ' ' + event.getDescription()).toLowerCase();
        return words.some((word) => text.indexOf(word) !== -1);
      });
      if (CONFIG.CHECK_CONFLICTS && sameSlot.length >= CONFIG.MAX_PER_SERVICE_PER_SLOT) {
        return json_({ ok: false, error: 'busy' });
      }

      const source = clean_(data.source);
      const event = calendar.createEvent(`Solicitud de cita: ${clean_(data.service)} - ${fullName_(data)}`, start, end, {
        description: [
          'Solicitud enviada desde el sitio web (pendiente de confirmar).',
          '',
          `Nombre(s): ${clean_(data.firstName)}`,
          `Apellidos: ${clean_(data.lastName)}`,
          `Telefono: ${clean_(data.phone)}`,
          `Correo: ${clean_(data.email) || '-'}`,
          `Servicio: ${clean_(data.service)}`,
          `Primera visita: ${data.firstVisit ? 'Si' : 'No'}`,
          `Comentarios: ${clean_(data.comments) || '-'}`,
          '',
          `Acepto el aviso de privacidad: Si`,
          `Pagina: ${CONFIG.SOURCE_PREFIXES.some((prefix) => source.indexOf(prefix) === 0) ? source : '-'}`,
        ].join('\n'),
      });
      event.setColor(CONFIG.EVENT_COLOR);
      // Un correo por solicitud; si la cuota diaria de la cuenta no alcanza para los destinatarios, solo queda el evento (y el aviso en el calendario).
      quota = MailApp.getRemainingDailyQuota();
      cache.put(phoneKey, String(phoneThisHour + 1), 3600);
      cache.put(sameRequestKey, '1', 3600);
    } finally {
      lock.releaseLock();
    }

    // El aviso por correo es opcional: si falla (cuota, direccion), la cita ya quedo creada.
    if (CONFIG.NOTIFY_EMAILS.length) {
      try {
        if (quota < CONFIG.NOTIFY_EMAILS.length) throw new Error('Sin cuota de correo');
        const origin = originLabel_(clean_(data.source));
        MailApp.sendEmail({
          to: CONFIG.NOTIFY_EMAILS.join(','),
          name: 'Dental Nakeji - Formulario Web',
          subject: `Nuevo lead (por confirmar) · ${clean_(data.service)} · ${fullName_(data)}`,
          body: `Nuevo lead desde la pagina web (por confirmar).\n${fullName_(data)} - ${clean_(data.service)}\n${prettyDate_(data.date)}, ${prettyTime_(data.time)}\nTelefono: ${clean_(data.phone)}\nOrigen: ${origin}\nLos datos completos estan en el evento amarillo de Google Calendar.`,
          htmlBody: mailHtml_(data, origin),
        });
      } catch (mailError) {
        console.error(mailError);
        warnMailFailed_(calendar);
      }
    }

    // Comprobante para el paciente si dejo correo (ya validado). Va despues del aviso interno: este tiene prioridad en la cuota.
    const patientEmail = clean_(data.email);
    if (patientEmail && quota >= CONFIG.NOTIFY_EMAILS.length + 1) {
      try {
        MailApp.sendEmail({
          to: patientEmail,
          replyTo: CONFIG.CLINIC.replyTo,
          name: 'Dental Nakeji',
          subject: `Recibimos tu solicitud de cita · ${clean_(data.service)} · Dental Nakeji`,
          body: `Hola, ${clean_(data.firstName)}. Recibimos tu solicitud de cita en Dental Nakeji (por confirmar).
${clean_(data.service)}
${prettyDate_(data.date)}, ${prettyTime_(data.time)}
Nuestro equipo se comunicara contigo para confirmar tu cita.
${CONFIG.CLINIC.address}
Aviso de privacidad: ${CONFIG.CLINIC.privacyUrl}`,
          htmlBody: patientMailHtml_(data),
        });
      } catch (mailError) {
        console.error(mailError);
      }
    }

    return json_({ ok: true });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, error: 'server' });
  }
}

/** Verifica el token de Cloudflare Turnstile. Sin TURNSTILE_SECRET (Propiedades del script) se rechaza todo: falla cerrado. */
function humanVerified_(token) {
  const secret = PropertiesService.getScriptProperties().getProperty('TURNSTILE_SECRET');
  if (!secret) {
    console.error('Falta TURNSTILE_SECRET en las Propiedades del script');
    return false;
  }
  if (!token || String(token).length > 2048) return false;
  try {
    const response = UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'post',
      payload: { secret: secret, response: String(token) },
      muteHttpExceptions: true,
    });
    const result = JSON.parse(response.getContentText());
    // Un token valido emitido para otro sitio o para otra accion tampoco sirve.
    return (
      result.success === true &&
      CONFIG.TURNSTILE_HOSTNAMES.indexOf(result.hostname) !== -1 &&
      result.action === CONFIG.TURNSTILE_ACTION
    );
  } catch (error) {
    console.error(error);
    return false;
  }
}

/** Si el correo falla (cuota o direccion), deja un aviso visible en el calendario; como maximo uno cada 6 horas. */
function warnMailFailed_(calendar) {
  try {
    const cache = CacheService.getScriptCache();
    if (cache.get('mailwarn')) return;
    cache.put('mailwarn', '1', 21600);
    calendar.createAllDayEvent('AVISO: fallo el correo de solicitudes. Revisa las solicitudes en amarillo', new Date());
  } catch (error) {
    console.error(error);
  }
}

const MONTHS_ = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const WEEKDAYS_ = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/** "2026-11-05" -> "jueves 5 de noviembre de 2026". */
function prettyDate_(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  return `${WEEKDAYS_[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]} ${d} de ${MONTHS_[m - 1]} de ${y}`;
}

/** "15:30" -> "3:30 p. m.". */
function prettyTime_(time) {
  const [h, min] = String(time).split(':').map(Number);
  return `${h % 12 || 12}:${String(min).padStart(2, '0')} ${h < 12 ? 'a. m.' : 'p. m.'}`;
}

/** De donde viene el lead: la pagina del sitio desde la que se envio el formulario (SOURCE_PREFIXES) o "-". */
function originLabel_(source) {
  const prefix = CONFIG.SOURCE_PREFIXES.filter((p) => source.indexOf(p) === 0)[0];
  if (!prefix) return '-';
  const path = source.slice(prefix.length).split(/[?#]/)[0].replace(/\/$/, '');
  return 'Formulario web · ' + (path ? '/' + path : 'Inicio');
}

function esc_(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const MAIL_FONT_ = "font-family:'Segoe UI',Helvetica,Arial,sans-serif;";

/** Boton redondo de los correos. */
function mailButton_(href, label, bg, color, border) {
  return `<a href="${esc_(href)}" style="${MAIL_FONT_}display:inline-block;margin:4px 3px;padding:12px 20px;border-radius:999px;background:${bg};color:${color};border:1px solid ${border};font-size:14px;font-weight:700;text-decoration:none">${label}</a>`;
}

/**
 * Marco comun de los dos correos (aviso interno y comprobante del paciente): tablas y estilos en linea, porque los
 * clientes de correo ignoran casi todo lo demas. Logo, franja "por confirmar", tarjeta con nombre y servicio,
 * fecha y hora, el contenido propio (`middle`) y el pie con los datos de la clinica.
 */
function mailFrame_(data, opts) {
  const font = MAIL_FONT_;
  const clinic = CONFIG.CLINIC;
  return (
    `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc_(opts.preheader)}</div>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef3fa"><tr><td align="center" style="padding:28px 12px">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 30px rgba(31,58,104,.12)">` +
    // Banda azul marino con el logo animado (GIF); bgcolor y alt visibles si el correo bloquea imagenes.
    `<tr><td align="center" bgcolor="#1b335c" style="background:#1b335c;padding:14px 12px"><img src="${esc_(CONFIG.LOGO_URL)}" width="314" alt="Dental Nakeji" style="display:block;width:314px;max-width:100%;height:auto;border:0;${font}color:#ffffff;font-size:22px;font-weight:700"></td></tr>` +
    // Franja amarilla = igual que el evento del calendario (por confirmar).
    `<tr><td style="${font}background:#fbbc04;padding:10px 24px;text-align:center;font-size:12px;font-weight:800;letter-spacing:.14em;color:#4a3500">● ${opts.strip}</td></tr>` +
    `<tr><td style="padding:24px 32px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1f3a68,#3d73c4);background-color:#1f3a68;border-radius:14px"><tr><td style="${font}padding:24px 26px;color:#ffffff">` +
    `<div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.8">${opts.heroLabel}</div>` +
    `<div style="font-size:26px;font-weight:700;margin:6px 0 4px">${esc_(opts.heroName)}</div>` +
    `<div style="font-size:16px;opacity:.95">${esc_(clean_(data.service))}</div></td></tr></table></td></tr>` +
    `<tr><td style="padding:16px 32px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e1;border:1px solid #f6d36b;border-radius:14px"><tr><td style="${font}padding:16px 22px;color:#4a3500">` +
    `<div style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;font-weight:700">Fecha y hora solicitadas</div>` +
    `<div style="font-size:19px;font-weight:700;margin-top:4px">${esc_(prettyDate_(data.date))} · ${esc_(prettyTime_(data.time))}</div></td></tr></table></td></tr>` +
    opts.middle +
    // Pie: datos de la clinica, redes y aviso de privacidad.
    `<tr><td bgcolor="#1b335c" style="${font}background:#1b335c;padding:24px 28px;text-align:center;font-size:13px;line-height:1.6;color:#d6e0f2">` +
    `<div style="font-size:15px;font-weight:700;color:#ffffff;margin-bottom:6px">Clínica Dental Nakeji</div>` +
    `<a href="${esc_(clinic.mapsUrl)}" style="color:#d6e0f2;text-decoration:none">📍 ${esc_(clinic.address)}</a><br>` +
    clinic.phones.map((p) => `📞 ${p.label}: <a href="tel:${p.e164}" style="color:#ffffff;text-decoration:none;font-weight:600">${p.display}</a>`).join(' &nbsp;·&nbsp; ') +
    `<div style="margin:14px 0 4px">` +
    clinic.social.map((s) => `<a href="${esc_(s.href)}" style="display:inline-block;margin:3px;padding:7px 14px;border:1px solid #5d7bb0;border-radius:999px;color:#ffffff;font-size:12px;font-weight:700;text-decoration:none">${s.label}</a>`).join('') +
    `</div>` +
    `<a href="${esc_(clinic.site)}" style="color:#9fc0f2;font-weight:600;text-decoration:none">🌐 nakejidental.com</a>` +
    `<div style="border-top:1px solid #34507f;margin-top:16px;padding-top:14px;font-size:11px;line-height:1.55;color:#a9b8d4">` +
    `${opts.footerNote} <a href="${esc_(clinic.privacyUrl)}" style="color:#d6e0f2">Aviso de privacidad</a>.</div></td></tr>` +
    `</table></td></tr></table>`
  );
}

/** Correo de aviso para la clinica. */
function mailHtml_(data, origin) {
  const font = MAIL_FONT_;
  const digits = String(data.phone).replace(/\D/g, '');
  const wa = digits.length === 10 ? '52' + digits : digits;
  const [y, m, d] = String(data.date).split('-').map(Number);
  const calendarUrl = `https://calendar.google.com/calendar/u/0/r/day/${y}/${m}/${d}`;
  const row = (label, value) =>
    `<tr><td style="${font}padding:12px 0;border-bottom:1px solid #e6ecf5;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#6b7a99;width:38%">${label}</td>` +
    `<td style="${font}padding:12px 0;border-bottom:1px solid #e6ecf5;font-size:15px;font-weight:600;color:#1f3a68">${value}</td></tr>`;
  return mailFrame_(data, {
    preheader: `Nuevo lead por confirmar: ${fullName_(data)}, ${clean_(data.service)}`,
    strip: 'POR CONFIRMAR · NUEVO LEAD DE LA PÁGINA WEB',
    heroLabel: 'Nueva solicitud de cita',
    heroName: fullName_(data),
    middle:
      `<tr><td style="padding:10px 32px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">` +
      row('Teléfono', `<a href="tel:+${wa}" style="color:#1f3a68;text-decoration:none">${esc_(clean_(data.phone))}</a>`) +
      row('Primera visita', data.firstVisit ? 'Sí' : 'No') +
      row('Correo', clean_(data.email) ? `<a href="mailto:${esc_(clean_(data.email))}" style="color:#1f3a68;text-decoration:none">${esc_(clean_(data.email))}</a>` : '—') +
      row('Origen', esc_(origin)) +
      row('Comentarios', clean_(data.comments) ? esc_(clean_(data.comments)) : '—') +
      `</table></td></tr>` +
      `<tr><td align="center" style="padding:22px 24px 6px">` +
      mailButton_('tel:+' + wa, 'Llamar', '#1f3a68', '#ffffff', '#1f3a68') +
      mailButton_('https://wa.me/' + wa, 'WhatsApp', '#25a55a', '#ffffff', '#25a55a') +
      mailButton_(calendarUrl, 'Abrir calendario', '#ffffff', '#1f3a68', '#1f3a68') +
      `</td></tr>` +
      `<tr><td style="padding:14px 32px 28px"><div style="${font}background:#f4f7fc;border-radius:12px;padding:14px 18px;font-size:13px;line-height:1.55;color:#4a5878"><b style="color:#1f3a68">Siguiente paso:</b> llamar a la persona, confirmar la cita y avisar a recepción. El evento amarillo en Google Calendar tiene todos los datos; al confirmarlo, cámbiale el color.</div></td></tr>`,
    footerNote: 'Aviso automático del formulario de citas. Contiene datos personales del paciente: úsalos solo para dar seguimiento a su cita, no reenvíes este correo y trátalo conforme a nuestro',
  });
}

/** Comprobante para el paciente: mismos datos de su cita, sin datos internos (origen, comentarios, telefono). */
function patientMailHtml_(data) {
  const font = MAIL_FONT_;
  const clinic = CONFIG.CLINIC;
  return mailFrame_(data, {
    preheader: `Recibimos tu solicitud de cita: ${clean_(data.service)}, ${prettyDate_(data.date)}`,
    strip: 'POR CONFIRMAR · SOLICITUD RECIBIDA',
    heroLabel: 'Tu solicitud de cita',
    heroName: fullName_(data),
    middle:
      `<tr><td style="${font}padding:22px 32px 0;font-size:15px;line-height:1.6;color:#33415c">` +
      `<p style="margin:0 0 10px">Hola, <b style="color:#1f3a68">${esc_(clean_(data.firstName))}</b>. Gracias por elegir Dental Nakeji. ✨</p>` +
      `<p style="margin:0">Recibimos tu solicitud. <b style="color:#1f3a68">Nuestro equipo se comunicará contigo para confirmar tu cita</b> por teléfono o WhatsApp. La cita queda sujeta a disponibilidad hasta que la confirmemos.</p></td></tr>` +
      `<tr><td align="center" style="padding:22px 24px 6px">` +
      mailButton_(clinic.social.filter((s) => s.href.indexOf('wa.me') !== -1)[0].href, '💬 Escríbenos por WhatsApp', '#25a55a', '#ffffff', '#25a55a') +
      mailButton_(clinic.mapsUrl, '📍 Cómo llegar', '#ffffff', '#1f3a68', '#1f3a68') +
      `</td></tr>` +
      `<tr><td style="padding:14px 32px 28px"><div style="${font}background:#f4f7fc;border-radius:12px;padding:14px 18px;font-size:13px;line-height:1.55;color:#4a5878"><b style="color:#1f3a68">¿Necesitas cambiar la fecha?</b> Responde a este correo o escríbenos por WhatsApp y con gusto te ayudamos.</div></td></tr>`,
    footerNote: 'Recibes este correo porque solicitaste una cita en nakejidental.com. Tus datos se usan solo para atender tu solicitud, conforme a nuestro',
  });
}

/** Permite comprobar en el navegador que la aplicacion web esta publicada. */
function doGet() {
  return json_({ ok: true, service: 'dental-nakeji-citas' });
}

function validate_(data) {
  const errors = [];
  const text = (value) => String(value || '').trim();

  // Mismas reglas que la web (src/features/booking/BookingForm.tsx): nombre solo con letras Unicode; telefono solo digitos con "+" opcional al inicio.
  if (!/^\p{L}{2,}(?: \p{L}+)*$/u.test(text(data.firstName)) || text(data.firstName).length > 50) errors.push('firstName');
  if (!/^\p{L}{2,}(?: \p{L}+)*$/u.test(text(data.lastName)) || text(data.lastName).length > 50) errors.push('lastName');
  if (!/^\+?\d{10,15}$/.test(text(data.phone))) errors.push('phone');
  if (text(data.email) && (text(data.email).length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text(data.email)))) {
    errors.push('email');
  }
  if (CONFIG.SERVICES.indexOf(text(data.service)) === -1) errors.push('service');
  if (typeof data.firstVisit !== 'boolean') errors.push('firstVisit');
  if (text(data.comments).length > 500) errors.push('comments');
  if (/https?:\/\/|www\./i.test(text(data.comments))) errors.push('comments');
  if (data.consent !== true) errors.push('consent');
  if (CONFIG.SLOTS.indexOf(text(data.time)) === -1) errors.push('time');

  // La fecha de hoy se toma en la zona horaria del proyecto (no la del servidor) y las fechas inexistentes (31 de febrero) se rechazan.
  const requested = dayNumber_(text(data.date));
  const today = dayNumber_(Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'));
  if (requested === null) {
    errors.push('date');
  } else {
    const diffDays = requested - today;
    const weekday = new Date(requested * 86400000).getUTCDay();
    if (diffDays < 1 || diffDays > CONFIG.DAYS_AHEAD) errors.push('date');
    else if (CONFIG.CLOSED_WEEKDAYS.indexOf(weekday) !== -1) errors.push('date');
    else if (CONFIG.LAST_SLOT_BY_WEEKDAY[weekday] && text(data.time) > CONFIG.LAST_SLOT_BY_WEEKDAY[weekday]) errors.push('time');
  }

  return errors;
}

/** Numero de dia (desde 1970) de una fecha "AAAA-MM-DD", o null si el formato o la fecha no existen. */
function dayNumber_(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const time = Date.UTC(y, m - 1, d);
  const back = new Date(time);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== m - 1 || back.getUTCDate() !== d) return null;
  return time / 86400000;
}

/** Fecha y hora en la zona horaria del proyecto (appsscript.json -> America/Tijuana). */
function toDate_(date, time) {
  const [y, m, d] = String(date).split('-').map(Number);
  const [h, min] = String(time).split(':').map(Number);
  return new Date(y, m - 1, d, h, min, 0);
}

/** Nombre completo para el titulo del evento y el aviso por correo (en los datos van separados). */
function fullName_(data) {
  return clean_(data.firstName) + ' ' + clean_(data.lastName);
}

/** Quita caracteres de control y "<" ">" (Calendar muestra HTML en la descripcion) y acota el largo. */
function clean_(value) {
  return String(value || '').replace(/[\u0000-\u001f<>]/g, ' ').trim().slice(0, 500);
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
