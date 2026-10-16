(() => {
  const WHATSAPP_NUMBER = '529221393994';

  // Configuración de EmailJS
  const EMAILJS_PUBLIC_KEY = 'UQn8jJUoZeA6BpYFi';
  const EMAILJS_SERVICE_ID = 'service_rhlnxnh';
  const EMAILJS_TEMPLATE_ID = 'template_8woo00n';

  document.documentElement.classList.add('js');

  window.addEventListener('DOMContentLoaded', () => {
    /* Año en el footer */
    const year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());

    /* Header con borde al hacer scroll */
    const header = document.getElementById('header');
    const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* Menú móvil */
    const menuBtn = document.getElementById('menuBtn');
    const nav = document.getElementById('nav');
    const setMenu = (open) => {
      if (!menuBtn || !nav) return;
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      nav.classList.toggle('is-open', open);
    };
    if (menuBtn && nav) {
      menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
      nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    }

    /* Aparición al hacer scroll + enlace activo en el menú */
    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      reveals.forEach((el) => io.observe(el));

      const links = document.querySelectorAll('.nav__link');
      const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === `#${entry.target.id}`));
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      document.querySelectorAll('main section[id]').forEach((s) => spy.observe(s));
    } else {
      reveals.forEach((el) => el.classList.add('is-visible'));
    }

    /* Copiar número */
    const copyBtn = document.getElementById('copyPhone');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const label = copyBtn.querySelector('span');
        try {
          await navigator.clipboard.writeText(copyBtn.dataset.phone || '');
          if (label) label.textContent = '¡Copiado!';
        } catch {
          if (label) label.textContent = '922 139 3994';
        }
        setTimeout(() => { if (label) label.textContent = 'Copiar'; }, 2000);
      });
    }

    /* Formulario */
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    if (!form || !status) return;

    const setStatus = (message, type) => {
      status.textContent = message;
      status.classList.remove('is-ok', 'is-err');
      if (type) status.classList.add(type);
    };

    const readForm = () => {
      const data = new FormData(form);
      return {
        name: String(data.get('name') || '').trim(),
        phone: String(data.get('phone') || '').trim(),
        projectType: String(data.get('projectType') || '').trim(),
        message: String(data.get('message') || '').trim(),
      };
    };

    const validate = ({ name, phone, projectType, message }) => {
      if (name.length < 2) return 'Por favor, escribe tu nombre.';
      if (phone.replace(/\D/g, '').length < 10) return 'Escribe tu número a 10 dígitos.';
      if (!projectType) return 'Selecciona qué necesitas.';
      if (message.length < 10) return 'Cuéntame un poco más de tu idea.';
      return '';
    };

    const saveLocally = (values) => {
      try {
        const key = 'atumedidatech_messages';
        const list = JSON.parse(window.localStorage.getItem(key) || '[]');
        list.unshift({ ...values, createdAt: new Date().toISOString() });
        window.localStorage.setItem(key, JSON.stringify(list));
      } catch (err) {
        console.warn('No se pudo guardar localmente el mensaje', err);
      }
    };

    if (window.emailjs) window.emailjs.init(EMAILJS_PUBLIC_KEY);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const values = readForm();
      const error = validate(values);
      if (error) return setStatus(error, 'is-err');

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      setStatus('Enviando tu mensaje…', null);

      try {
        if (!window.emailjs) throw new Error('EmailJS no cargó');
        await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          title: values.projectType,
          name: values.name,
          phone: values.phone,
          message: values.message,
        });
        saveLocally(values);
        setStatus(`Gracias, ${values.name}. Recibí tu solicitud y te contacto en menos de 24 horas.`, 'is-ok');
        form.reset();
      } catch (err) {
        console.error('Error enviando con EmailJS', err);
        setStatus('No se pudo enviar. Usa el botón “Enviar por WhatsApp” o llámame al 922 139 3994.', 'is-err');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    /* Enviar el formulario como mensaje de WhatsApp */
    const sendWa = document.getElementById('sendWa');
    if (sendWa) {
      sendWa.addEventListener('click', () => {
        const values = readForm();
        const error = validate(values);
        if (error) return setStatus(error, 'is-err');
        const text = [
          `Hola, soy ${values.name}.`,
          `Me interesa: ${values.projectType}.`,
          values.message,
          `Mi número: ${values.phone}`,
        ].join('\n');
        setStatus('Abriendo WhatsApp…', 'is-ok');
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
      });
    }
  });
})();
