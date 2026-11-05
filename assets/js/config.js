/* =========================================================
   CONFIGURACIÓN DEL SITIO — edita aquí precios, divisas,
   idiomas y datos de contacto. No hace falta tocar nada más.
   ========================================================= */
window.SITE_CONFIG = {
  contact: {
    whatsapp: '529221393994',          // con código de país, sin + ni espacios
    phoneDisplay: '+52 922 139 3994',
    phoneLink: '+529221393994',
    facebook: 'https://www.facebook.com/profile.php?id=61577393532574',
  },

  /* Precios base en pesos mexicanos (MXN). Se convierten solos a la divisa elegida. */
  baseCurrency: 'MXN',
  prices: {
    landing: 999,                       // Página web — "desde"
  },

  /* Precio fijo por divisa (opcional). Si pones un valor aquí, se usa en lugar de la conversión.
     Ejemplo: landing: { USD: 49, EUR: 45 } */
  priceOverrides: {
    landing: {},
  },

  /* Tipo de cambio de respaldo: cuántas unidades de cada divisa equivalen a 1 MXN.
     Al cargar la página se intenta obtener el tipo de cambio del día (liveRatesUrl);
     si falla, se usan estos valores. */
  liveRatesUrl: 'https://open.er-api.com/v6/latest/MXN',
  currencies: {
    MXN: { rate: 1,       locale: 'es-MX', label: 'Peso mexicano' },
    USD: { rate: 0.054,   locale: 'en-US', label: 'US Dollar' },
    EUR: { rate: 0.047,   locale: 'es-ES', label: 'Euro' },
    GBP: { rate: 0.041,   locale: 'en-GB', label: 'Pound sterling' },
    CAD: { rate: 0.075,   locale: 'en-CA', label: 'Canadian dollar' },
    COP: { rate: 215,     locale: 'es-CO', label: 'Peso colombiano' },
    CLP: { rate: 51,      locale: 'es-CL', label: 'Peso chileno' },
    PEN: { rate: 0.2,     locale: 'es-PE', label: 'Sol peruano' },
    ARS: { rate: 60,      locale: 'es-AR', label: 'Peso argentino' },
    BRL: { rate: 0.3,     locale: 'pt-BR', label: 'Real brasileiro' },
    GTQ: { rate: 0.42,    locale: 'es-GT', label: 'Quetzal' },
  },

  /* Idiomas disponibles (el primero es el predeterminado). */
  languages: [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Português' },
  ],

  /* Divisa sugerida según el país del visitante (si no eligió una antes). */
  regionCurrency: {
    MX: 'MXN', US: 'USD', CA: 'CAD', GB: 'GBP', CO: 'COP', CL: 'CLP', PE: 'PEN',
    AR: 'ARS', BR: 'BRL', GT: 'GTQ', ES: 'EUR', FR: 'EUR', DE: 'EUR', IT: 'EUR', PT: 'EUR', NL: 'EUR',
  },
};
