(() => {
  const CFG = window.SITE_CONFIG;
  const DICT = window.I18N;
  const PROJECTS = window.PROJECTS || [];

  // EmailJS
  const EMAILJS_PUBLIC_KEY = 'UQn8jJUoZeA6BpYFi';
  const EMAILJS_SERVICE_ID = 'service_rhlnxnh';
  const EMAILJS_TEMPLATE_ID = 'template_8woo00n';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } },
  };

  /* ---------------- Estado: idioma y moneda ---------------- */
  const langCodes = CFG.languages.map((l) => l.code);
  const params = new URLSearchParams(location.search);
  const navLang = (navigator.language || 'es').slice(0, 2).toLowerCase();
  const region = ((navigator.language || '').split('-')[1] || '').toUpperCase();

  let lang = [params.get('lang'), store.get('atm_lang'), navLang].find((l) => l && langCodes.includes(l)) || langCodes[0];
  let currency = [params.get('currency'), store.get('atm_currency'), CFG.regionCurrency[region]]
    .find((c) => c && CFG.currencies[c]) || (lang === 'es' ? 'MXN' : 'USD');

  const t = (key, vars = {}) => {
    let s = (DICT[lang] && DICT[lang][key]) ?? DICT.es[key] ?? key;
    Object.entries(vars).forEach(([k, v]) => { s = s.replaceAll(`{${k}}`, v); });
    return s;
  };

  /* ---------------- Precios ---------------- */
  const prettyRound = (v) => {
    if (v <= 0) return 0;
    const sig = v >= 1000 ? 3 : 2;
    const mag = Math.pow(10, Math.floor(Math.log10(v)) - (sig - 1));
    return Math.round(v / mag) * mag;
  };

  const formatPrice = (key) => {
    const base = CFG.prices[key];
    const override = CFG.priceOverrides?.[key]?.[currency];
    const cur = CFG.currencies[currency];
    const value = override ?? (currency === CFG.baseCurrency ? base : prettyRound(base * cur.rate));
    const fmt = new Intl.NumberFormat(cur.locale, { style: 'currency', currency, currencyDisplay: 'narrowSymbol', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    const out = fmt.format(value);
    const symbol = fmt.formatToParts(0).find((p) => p.type === 'currency')?.value;
    return symbol === '$' ? `${out} ${currency}` : out;
  };

  const renderPrices = (animate) => {
    $$('.js-price').forEach((el) => {
      const next = formatPrice(el.dataset.price);
      if (el.textContent === next) return;
      el.textContent = next;
      if (animate && !reduced) { el.classList.remove('price-swap'); void el.offsetWidth; el.classList.add('price-swap'); }
    });
    $$('.js-code-cur').forEach((el) => { el.textContent = `"${currency}"`; });
  };

  const loadLiveRates = async () => {
    if (!CFG.liveRatesUrl) return;
    try {
      const res = await fetch(CFG.liveRatesUrl);
      if (!res.ok) return;
      const data = await res.json();
      const rates = data.rates || {};
      Object.keys(CFG.currencies).forEach((c) => { if (typeof rates[c] === 'number') CFG.currencies[c].rate = rates[c]; });
      renderPrices(false);
    } catch { /* usa los tipos de cambio de respaldo */ }
  };

  /* ---------------- Traducción ---------------- */
  const i18nEls = $$('[data-i18n]');
  const attrEls = $$('[data-i18n-attr]');
  // El español se toma del HTML original
  i18nEls.forEach((el) => { DICT.es[el.dataset.i18n] = el.innerHTML.trim(); });
  attrEls.forEach((el) => {
    el.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':');
      DICT.es[key] = el.getAttribute(attr);
    });
  });

  const splitWords = (el) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const inner = document.createElement('span'); inner.className = 'w__i'; inner.style.setProperty('--i', i++);
            inner.textContent = part; w.appendChild(inner); frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) walk(child);
      });
    };
    walk(el);
  };

  const applyLang = (animate) => {
    document.documentElement.lang = lang;
    i18nEls.forEach((el) => {
      const val = t(el.dataset.i18n);
      if (el.innerHTML !== val) el.innerHTML = val;
    });
    attrEls.forEach((el) => {
      el.dataset.i18nAttr.split(';').forEach((pair) => {
        const [attr, key] = pair.split(':');
        el.setAttribute(attr, t(key));
      });
    });
    document.title = t('meta.title');
    $('meta[name="description"]').setAttribute('content', t('meta.desc'));
    $$('.split').forEach((el) => {
      splitWords(el);
      if (animate && !reduced) {
        $$('.w__i', el).forEach((w, idx) => w.animate(
          [{ transform: 'translateY(110%)' }, { transform: 'none' }],
          { duration: 900, delay: idx * 35, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' },
        ));
      }
    });
    $$('.js-code-lang').forEach((el) => { el.textContent = `"${lang}"`; });
    renderProjects(currentFilter, animate);
    renderPrices(false);
    updateWaLinks();
    updatePrefsUI();
    if (animate && !reduced) {
      $$('main [data-i18n]:not(.split)').forEach((el) => {
        if (el.getBoundingClientRect().top < innerHeight && el.getBoundingClientRect().bottom > 0) {
          el.animate([{ opacity: 0, filter: 'blur(3px)' }, { opacity: 1, filter: 'none' }], { duration: 450, easing: 'ease-out' });
        }
      });
    }
  };

  /* ---------------- Selectores ---------------- */
  const langSelects = $$('.js-lang');
  const curSelects = $$('.js-currency');
  langSelects.forEach((sel) => {
    CFG.languages.forEach((l) => sel.add(new Option(l.label, l.code)));
    sel.addEventListener('change', () => {
      lang = sel.value; store.set('atm_lang', lang);
      applyLang(true);
    });
  });
  curSelects.forEach((sel) => {
    Object.keys(CFG.currencies).forEach((c) => sel.add(new Option(c, c)));
    sel.addEventListener('change', () => {
      currency = sel.value; store.set('atm_currency', currency);
      renderPrices(true); updateWaLinks(); updatePrefsUI();
    });
  });
  function updatePrefsUI() {
    langSelects.forEach((s) => { s.value = lang; s.setAttribute('aria-label', t('prefs.language')); });
    curSelects.forEach((s) => { s.value = currency; s.setAttribute('aria-label', t('prefs.currency')); });
    const fp = $('#footerPrefs'); if (fp) fp.textContent = `${lang.toUpperCase()} · ${currency}`;
  }

  /* ---------------- WhatsApp ---------------- */
  const waUrl = (text) => `https://wa.me/${CFG.contact.whatsapp}?text=${encodeURIComponent(text)}`;
  function updateWaLinks() {
    $$('.js-wa').forEach((a) => {
      const msgKey = a.dataset.waMsg ? `wa.${a.dataset.waMsg}` : 'wa.default';
      a.href = waUrl(t(msgKey, { price: formatPrice('landing') }));
    });
  }

  /* ---------------- Portafolio ---------------- */
  const projectsEl = $('#projects');
  let currentFilter = 'all';
  const host = (url) => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; } };
  const prettyHost = (url) => { const h = host(url); return h.length > 34 ? `${h.slice(0, 31)}…` : h; };

  function renderProjects(filter, animate) {
    if (!projectsEl) return;
    projectsEl.innerHTML = PROJECTS.map((p) => `
      <article class="project${p.featured ? ' project--featured' : ''}" data-cat="${p.cat}">
        <a class="project__media" href="${p.url}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">
          <span class="project__bar"><i></i><i></i><i></i><span>${prettyHost(p.url)}</span></span>
          <img loading="lazy" decoding="async" src="assets/img/projects/${p.id}.webp" alt="" width="960" height="600" />
          <span class="project__overlay"><span>${t('ui.visit')} <svg viewBox="0 0 24 24"><use href="#i-arrow"/></svg></span></span>
        </a>
        <div class="project__body">
          <p class="project__type">${p.type[lang] || p.type.es}</p>
          <h3>${p.name}</h3>
          <p class="project__desc">${p.desc[lang] || p.desc.es}</p>
          <a class="project__link" href="${p.url}" target="_blank" rel="noopener">${prettyHost(p.url)} <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-arrow"/></svg></a>
        </div>
      </article>`).join('');
    applyFilter(filter, animate);
  }

  function applyFilter(filter, animate, animateFrom = 0) {
    currentFilter = filter;
    let n = 0; let i = 0;
    $$('.project', projectsEl).forEach((card) => {
      const match = filter === 'all' || card.dataset.cat === filter;
      const show = match && (expanded || filter !== 'all' || n < PAGE_SIZE);
      const pos = match ? n++ : -1;
      card.classList.toggle('is-hidden', !show);
      card.classList.remove('project-in');
      if (show && animate && !reduced && pos >= animateFrom) {
        void card.offsetWidth;
        card.style.setProperty('--i', Math.min(i++, 8));
        card.classList.add('project-in');
      }
    });
    if (moreBtn) {
      moreBtn.hidden = expanded || filter !== 'all' || PROJECTS.length <= PAGE_SIZE;
      $('span', moreBtn).textContent = t('work.more', { n: PROJECTS.length });
    }
  }

  const PAGE_SIZE = 9;
  let expanded = false;
  const moreBtn = $('#moreProjects');
  moreBtn?.addEventListener('click', () => {
    expanded = true;
    applyFilter(currentFilter, true, PAGE_SIZE);
  });

  $$('.js-count').forEach((el) => {
    const c = el.dataset.cat;
    el.textContent = c === 'all' ? PROJECTS.length : PROJECTS.filter((p) => p.cat === c).length;
  });
  $$('.filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.filter').forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-selected', String(b === btn)); });
      applyFilter(btn.dataset.filter, true);
    });
  });

  /* ---------------- Marquesina y mosaico ---------------- */
  const marquee = $('#marquee');
  if (marquee) {
    const names = PROJECTS.filter((p) => p.cat !== 'ai').map((p) => `<span class="marquee__item">${p.name}</span>`).join('');
    marquee.innerHTML = names + names;
  }
  const mosaic = $('#mosaic');
  if (mosaic) {
    const ids = PROJECTS.map((p) => p.id);
    const cols = [0, 1, 2].map((c) => ids.filter((_, i) => i % 3 === c).slice(0, 6));
    mosaic.innerHTML = cols.map((col) => {
      const imgs = col.map((id) => `<img src="assets/img/projects/${id}.webp" alt="" loading="lazy" decoding="async" />`).join('');
      return `<div class="mosaic__col">${imgs}${imgs}</div>`;
    }).join('');
  }

  /* ---------------- Hero: navegador con proyectos ---------------- */
  const heroScreens = $('#heroScreens');
  const heroUrl = $('#heroUrl');
  const heroSet = ['gestia', 'beautymina', 'denti7', 'hotelmadrid', 'streamly', 'oxford', 'srsburger']
    .map((id) => PROJECTS.find((p) => p.id === id)).filter(Boolean);
  if (heroScreens && heroSet.length) {
    heroScreens.innerHTML = heroSet.map((p, i) => `<img src="assets/img/projects/${p.id}.webp" alt="" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} />`).join('');
    const imgs = $$('img', heroScreens);
    let idx = 0;
    imgs[0].classList.add('is-on');
    heroUrl.textContent = host(heroSet[0].url);

    const typeUrl = async (text) => {
      if (reduced) { heroUrl.textContent = text; return; }
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      while (heroUrl.textContent.length) { heroUrl.textContent = heroUrl.textContent.slice(0, -1); await wait(18); }
      for (const ch of text) { heroUrl.textContent += ch; await wait(42); }
    };

    setInterval(() => {
      if (document.hidden) return;
      imgs[idx].classList.remove('is-on');
      idx = (idx + 1) % imgs.length;
      imgs[idx].classList.add('is-on');
      typeUrl(host(heroSet[idx].url));
    }, 4200);
  }

  /* ---------------- Interacciones con puntero ---------------- */
  if (finePointer && !reduced) {
    // Inclinación 3D del navegador del hero
    const visual = $('.hero__visual');
    const browser = $('.browser--hero');
    if (visual && browser) {
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
      const loop = () => {
        cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
        browser.style.setProperty('--rx', `${cy.toFixed(2)}deg`);
        browser.style.setProperty('--ry', `${cx.toFixed(2)}deg`);
        raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.01 ? requestAnimationFrame(loop) : 0;
      };
      const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
      window.addEventListener('pointermove', (e) => {
        const r = visual.getBoundingClientRect();
        if (r.bottom < 0) return;
        tx = ((e.clientX - (r.left + r.width / 2)) / r.width) * 10;
        ty = -((e.clientY - (r.top + r.height / 2)) / r.height) * 8;
        kick();
      }, { passive: true });
    }

    // Botones magnéticos
    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--tx', `${((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1)}px`);
        el.style.setProperty('--ty', `${((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1)}px`);
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--tx', '0px'); el.style.setProperty('--ty', '0px'); });
    });

    // Luz que sigue al cursor en tarjetas
    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest && e.target.closest('.spotlight');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true });
  }

  /* ---------------- Aparición, contadores y menú activo ---------------- */
  const groups = new Map();
  $$('.reveal').forEach((el) => {
    const list = groups.get(el.parentElement) || [];
    el.style.setProperty('--i', Math.min(list.length, 6));
    list.push(el); groups.set(el.parentElement, list);
  });

  const animateCount = (el) => {
    const to = Number(el.dataset.to);
    if (reduced) { el.textContent = to; return; }
    const start = performance.now(); const dur = 1800;
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(2, -10 * p)));
      if (p < 1) requestAnimationFrame(step); else el.textContent = to;
    };
    el.textContent = 0; requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        $$('.count', entry.target).forEach(animateCount);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    $$('.reveal').forEach((el) => io.observe(el));

    const links = $$('.nav__link');
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach((s) => spy.observe(s));
  } else {
    $$('.reveal').forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------------- Scroll: barra, header, pasos, botón flotante ---------------- */
  const header = $('#header');
  const progress = $('#progress');
  const steps = $('#steps');
  const stepItems = steps ? $$('.step', steps) : [];
  const waFloat = $('.wa-float');
  const hero = $('#inicio');
  let lastY = scrollY; let ticking = false;

  const onScroll = () => {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (header) {
      header.classList.toggle('is-scrolled', y > 10);
      const menuOpen = $('#nav')?.classList.contains('is-open');
      header.classList.toggle('is-hidden', !menuOpen && y > 400 && y > lastY + 4);
      if (y < lastY - 4) header.classList.remove('is-hidden');
    }
    if (steps) {
      const r = steps.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.75 - r.top) / (r.height + innerHeight * 0.25)));
      steps.style.setProperty('--p', p.toFixed(3));
      stepItems.forEach((s, i) => s.classList.toggle('is-reached', p >= (i / Math.max(1, stepItems.length - 1)) * 0.92));
    }
    if (waFloat && hero) waFloat.classList.toggle('is-visible', y > hero.offsetHeight * 0.45);
    lastY = y; ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  /* ---------------- Menú móvil ---------------- */
  const menuBtn = $('#menuBtn');
  const nav = $('#nav');
  const setMenu = (open) => {
    menuBtn.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) header.classList.remove('is-hidden');
  };
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
    $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    window.matchMedia('(min-width: 981px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });
  }

  /* ---------------- FAQ con animación ---------------- */
  $$('.faq details').forEach((d) => {
    const summary = $('summary', d);
    const body = $('.faq__a', d);
    summary.addEventListener('click', (e) => {
      if (reduced) return;
      e.preventDefault();
      if (d.open) {
        const a = body.animate([{ height: `${body.offsetHeight}px`, opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 380, easing: 'cubic-bezier(.65,0,.35,1)' });
        a.onfinish = () => { d.open = false; };
      } else {
        d.open = true;
        body.animate([{ height: '0px', opacity: 0 }, { height: `${body.offsetHeight}px`, opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
    });
  });

  /* ---------------- Copiar número ---------------- */
  const copyBtn = $('#copyPhone');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const label = $('span', copyBtn);
      try { await navigator.clipboard.writeText(CFG.contact.phoneDisplay); label.textContent = t('ui.copied'); }
      catch { label.textContent = CFG.contact.phoneDisplay; }
      setTimeout(() => { label.textContent = t('contact.copy'); }, 2000);
    });
  }

  /* ---------------- Formulario ---------------- */
  const form = $('#contactForm');
  const status = $('#formStatus');
  const setStatus = (msg, type) => {
    status.textContent = msg;
    status.classList.remove('is-ok', 'is-err');
    if (type) status.classList.add(type);
  };
  const readForm = () => {
    const data = new FormData(form);
    const sel = form.elements.projectType;
    return {
      name: String(data.get('name') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      projectType: sel.selectedIndex > 0 ? sel.options[sel.selectedIndex].text : '',
      message: String(data.get('message') || '').trim(),
    };
  };
  const validate = (v) => {
    if (v.name.length < 2) return t('ui.errName');
    if (v.phone.replace(/\D/g, '').length < 8) return t('ui.errPhone');
    if (!v.projectType) return t('ui.errType');
    if (v.message.length < 10) return t('ui.errMsg');
    return '';
  };
  if (form && status) {
    if (window.emailjs) window.emailjs.init(EMAILJS_PUBLIC_KEY);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const v = readForm();
      const err = validate(v);
      if (err) return setStatus(err, 'is-err');
      const btn = $('button[type="submit"]', form);
      btn.disabled = true; setStatus(t('ui.sending'));
      try {
        if (!window.emailjs) throw new Error('EmailJS no cargó');
        await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          title: v.projectType, name: v.name, phone: v.phone,
          message: `${v.message}\n\n[${lang.toUpperCase()} · ${currency}]`,
        });
        setStatus(t('ui.sent', { name: v.name }), 'is-ok');
        form.reset();
      } catch (err2) {
        console.error('Error enviando con EmailJS', err2);
        setStatus(t('ui.failed'), 'is-err');
      } finally { btn.disabled = false; }
    });
    $('#sendWa')?.addEventListener('click', () => {
      const v = readForm();
      const err = validate(v);
      if (err) return setStatus(err, 'is-err');
      setStatus(t('ui.openingWa'), 'is-ok');
      window.open(waUrl(t('wa.form', { name: v.name, type: v.projectType, msg: v.message, phone: v.phone })), '_blank', 'noopener');
    });
  }

  /* ---------------- Arranque ---------------- */
  const year = $('#year'); if (year) year.textContent = String(new Date().getFullYear());
  applyLang(false);
  onScroll();
  loadLiveRates();
  const start = () => requestAnimationFrame(() => document.body.classList.add('is-loaded'));
  if (document.fonts && document.fonts.ready) Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]).then(start);
  else start();
})();
