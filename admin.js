(() => {
  window.addEventListener('DOMContentLoaded', () => {
    const listEl = document.getElementById('adminList');
    const emptyEl = document.getElementById('adminEmpty');
    if (!listEl || !emptyEl) return;

    const key = 'atumedidatech_messages';
    let items = [];
    try {
      const raw = window.localStorage.getItem(key);
      items = raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error('No se pudieron leer los mensajes de localStorage', err);
      items = [];
    }

    if (!items.length) {
      emptyEl.style.display = 'block';
      return;
    }

    emptyEl.style.display = 'none';

    const formatDate = (iso) => {
      try {
        const d = new Date(iso);
        return d.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
      } catch {
        return iso;
      }
    };

    items.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'card';

      const body = document.createElement('div');
      body.className = 'card__body';

      const title = document.createElement('h3');
      title.textContent = item.name || 'Sin nombre';

      const meta = document.createElement('p');
      meta.className = 'muted';
      meta.textContent = `${item.projectType || 'Sin tipo'} • ${item.phone || 'Sin número'}`;

      const msg = document.createElement('p');
      msg.textContent = item.message || '';

      const tiny = document.createElement('p');
      tiny.className = 'tiny';
      tiny.textContent = `Enviado: ${formatDate(item.createdAt)}`;

      body.appendChild(title);
      body.appendChild(meta);
      body.appendChild(msg);
      body.appendChild(tiny);
      card.appendChild(body);
      listEl.appendChild(card);
    });
  });
})();
