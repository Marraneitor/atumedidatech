/* =========================================================
   CONFIGURACIÓN DEL SITIO — edita aquí precios, divisas,
   idiomas y datos de contacto.
   ========================================================= */

export type Lang = 'es' | 'en' | 'pt';

export const SITE = {
  url: 'https://atumedidatech.online',
  contact: {
    whatsapp: '529223220389', // WhatsApp de Sofía, quien contesta los mensajes (código de país, sin + ni espacios)
    waDisplay: '+52 922 322 0389',
    waAgent: 'Sofía',
    phoneDisplay: '+52 922 139 3994', // teléfono para llamadas
    phoneLink: '+529221393994',
    facebook: 'https://www.facebook.com/profile.php?id=61577393532574',
  },

  /* EmailJS (formulario por correo) */
  emailjs: {
    publicKey: 'UQn8jJUoZeA6BpYFi',
    serviceId: 'service_rhlnxnh',
    templateId: 'template_8woo00n',
  },

  /* Precios base en pesos mexicanos (MXN). Se convierten solos a la divisa elegida. */
  baseCurrency: 'MXN',
  prices: {
    landing: 1500, // Página web (landing), + IVA
    web_db: 2300, // Página con base de datos y calendario, + IVA
    chatbot: 5400, // Chatbot de WhatsApp, pago único, + IVA
    chatbot_month: 1000, // Chatbot: mensualidad sin plazos forzosos, + IVA
    social: 2000, // Redes sociales Instagram y Facebook, al mes, + IVA
    reel: 200, // Reel de 1 minuto, IVA incluido
    nfc: 100, // Tarjeta NFC personalizada, + IVA (mínimo 10, envío aparte)
    course: 1500, // Curso de IA para empresas, por hora, IVA incluido
    plus: 9000, // Paquete Plus: implementación, pago único, + IVA
    plus_month: 7000, // Paquete Plus: operación mensual, + IVA
    /* Paquetes para empezar (+ IVA): pago inicial y mensualidad */
    start: 5400, start_month: 1000, // Arranque digital
    growth: 5400, growth_month: 3000, // Crecimiento
    full: 6200, full_month: 3000, // Negocio completo
  } as Record<string, number>,

  /* Promoción de Fin de año: descuento sobre el pago único del chatbot y de todos los paquetes (las mensualidades van a precio normal).
     Se muestra el precio anterior tachado. Se apaga sola después de `until` (fin del día, hora de CDMX),
     o antes si pones active: false. Los precios de arriba son los normales; no los cambies por la promo. */
  promo: {
    active: true,
    pct: 25,
    until: '2026-12-31',
    keys: ['chatbot', 'plus', 'start', 'growth', 'full'],
  },

  /* Precio fijo por divisa (opcional). Si pones un valor aquí se usa en lugar de la conversión.
     Ejemplo: landing: { USD: 49, EUR: 45 } */
  priceOverrides: {
    landing: {},
  } as Record<string, Partial<Record<string, number>>>,

  /* Tipo de cambio de respaldo (unidades por 1 MXN). Al cargar se pide el del día a liveRatesUrl. */
  liveRatesUrl: 'https://open.er-api.com/v6/latest/MXN',
  currencies: {
    MXN: { rate: 1, locale: 'es-MX', label: 'Peso mexicano' },
    USD: { rate: 0.054, locale: 'en-US', label: 'US Dollar' },
    EUR: { rate: 0.047, locale: 'es-ES', label: 'Euro' },
    GBP: { rate: 0.041, locale: 'en-GB', label: 'Pound sterling' },
    CAD: { rate: 0.075, locale: 'en-CA', label: 'Canadian dollar' },
    COP: { rate: 215, locale: 'es-CO', label: 'Peso colombiano' },
    CLP: { rate: 51, locale: 'es-CL', label: 'Peso chileno' },
    PEN: { rate: 0.2, locale: 'es-PE', label: 'Sol peruano' },
    ARS: { rate: 60, locale: 'es-AR', label: 'Peso argentino' },
    BRL: { rate: 0.3, locale: 'pt-BR', label: 'Real brasileiro' },
    GTQ: { rate: 0.42, locale: 'es-GT', label: 'Quetzal' },
  } as Record<string, { rate: number; locale: string; label: string }>,

  languages: [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Português' },
  ] as { code: Lang; label: string }[],

  /* Divisa según el país de la IP del visitante (si no eligió una antes). Otros países ven USD. */
  regionCurrency: {
    MX: 'MXN', US: 'USD', CA: 'CAD', GB: 'GBP', CO: 'COP', CL: 'CLP', PE: 'PEN',
    AR: 'ARS', BR: 'BRL', GT: 'GTQ', ES: 'EUR', FR: 'EUR', DE: 'EUR', IT: 'EUR', PT: 'EUR', NL: 'EUR',
    BE: 'EUR', AT: 'EUR', IE: 'EUR', FI: 'EUR', GR: 'EUR', LU: 'EUR',
  } as Record<string, string>,
};

/** ¿La promoción está vigente ahora? Termina al final del día `until` en hora de la Ciudad de México (UTC-6). */
export function promoOn(now: Date = new Date()) {
  const p = SITE.promo;
  return p.active && now.getTime() < Date.parse(`${p.until}T23:59:59-06:00`);
}

/** ¿Esta clave de precio tiene descuento ahora? */
export function onSale(key: string, now?: Date) {
  return promoOn(now) && SITE.promo.keys.includes(key);
}

/** Precio vigente en MXN (con descuento si aplica) y precio normal. */
export function priceMXN(key: string, now?: Date) {
  const base = SITE.prices[key] ?? 0;
  return onSale(key, now) ? Math.round((base * (100 - SITE.promo.pct)) / 100) : base;
}
