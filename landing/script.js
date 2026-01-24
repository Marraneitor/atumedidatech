(() => {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    });
  });

  window.addEventListener('DOMContentLoaded', () => {
    if (window.AOS && !prefersReduced) {
      window.AOS.init({
        duration: 650,
        easing: 'ease-out-cubic',
        once: true,
        offset: 70,
      });
    }

    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    if (!form || !status) return;

    // Configuración de EmailJS (reemplaza estos valores por los tuyos)
    const EMAILJS_PUBLIC_KEY = 'UQn8jJUoZeA6BpYFi';
    const EMAILJS_SERVICE_ID = 'service_rhlnxnh';
    const EMAILJS_TEMPLATE_ID = 'template_8woo00n';

    if (window.emailjs && EMAILJS_PUBLIC_KEY !== 'TU_PUBLIC_KEY_EMAILJS') {
      window.emailjs.init(EMAILJS_PUBLIC_KEY);
    }

    const setStatus = (message, type) => {
      status.textContent = message;
      status.classList.remove('form__status--ok', 'form__status--err');
      if (type) status.classList.add(type);
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const phone = String(data.get('phone') || '').trim();
      const projectType = String(data.get('projectType') || '').trim();
      const message = String(data.get('message') || '').trim();

      if (name.length < 2) return setStatus('Por favor, escribe tu nombre.', 'form__status--err');
      if (phone.length < 8) return setStatus('Por favor, escribe tu número de contacto.', 'form__status--err');
      if (!projectType) return setStatus('Selecciona un tipo de proyecto.', 'form__status--err');
      if (message.length < 10) return setStatus('Cuéntame un poco más de tu idea.', 'form__status--err');

      setStatus('Enviando tu mensaje…', null);

      const canUseEmailJS =
        window.emailjs &&
        EMAILJS_PUBLIC_KEY !== 'TU_PUBLIC_KEY_EMAILJS' &&
        EMAILJS_SERVICE_ID !== 'TU_SERVICE_ID_EMAILJS' &&
        EMAILJS_TEMPLATE_ID !== 'TU_TEMPLATE_ID_EMAILJS';

      const saveLocally = () => {
        try {
          const key = 'atumedidatech_messages';
          const raw = window.localStorage.getItem(key);
          const list = raw ? JSON.parse(raw) : [];
          list.unshift({
            name,
            phone,
            projectType,
            message,
            createdAt: new Date().toISOString(),
          });
          window.localStorage.setItem(key, JSON.stringify(list));
        } catch (err) {
          console.warn('No se pudo guardar localmente el mensaje', err);
        }
      };

      try {
        if (canUseEmailJS) {
          await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            title: projectType,
            name,
            phone,
            message,
          });

          saveLocally();
          const summaryOk = `Gracias, ${name}. Ya recibí tu solicitud (${projectType}). Te contacto en 24–48h.`;
          setStatus(summaryOk, 'form__status--ok');
          form.reset();
        } else {
          saveLocally();
          const summary = `Gracias, ${name}. Recibí tu solicitud (${projectType}). Configura EmailJS en script.js para recibirla también en tu correo.`;
          setStatus(summary, 'form__status--ok');
          form.reset();
        }
      } catch (err) {
        console.error('Error enviando con EmailJS', err);
        setStatus('Hubo un problema al enviar. Intenta de nuevo en unos minutos.', 'form__status--err');
      }

      // Pequeña señal visual (sin librerías)
      status.animate(
        [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: prefersReduced ? 0 : 220, easing: 'ease-out' }
      );
    });
  });
})();
