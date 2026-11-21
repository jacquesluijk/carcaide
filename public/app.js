'use strict';

const CATEGORIES = ['Auto', 'Wonen', 'Kleding', 'Speelgoed', 'Elektronica', 'Tuin', 'Sport', 'Overig'];
const TYPE_LABELS = { koop: 'Te koop', gratis: 'Gratis', ruil: 'Te ruil' };

const state = {
  me: null,
  unread: 0,
  filters: { q: '', category: '', type: '' },
  photoDataUrl: null,
};

const app = document.getElementById('app');
const nav = document.getElementById('nav');

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function api(path, opts = {}) {
  const res = await fetch(path, {
    method: opts.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && !path.startsWith('/api/me') && !path.startsWith('/api/login') && !path.startsWith('/api/register')) {
    location.hash = '#/inloggen';
    throw new Error('Niet ingelogd');
  }
  if (!res.ok) throw new Error(data.error || 'Er ging iets mis');
  return data;
}

function timeAgo(ts) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return 'zojuist';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min geleden`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} uur geleden`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} dagen geleden`;
  return new Date(ts).toLocaleDateString('nl-NL');
}

function priceLabel(l) {
  if (l.type === 'gratis') return '<span class="chip gratis">Gratis</span>';
  if (l.type === 'ruil') return '<span class="chip ruil">Te ruil</span>';
  return `<span class="chip koop">€ ${Number(l.price).toLocaleString('nl-NL')}</span>`;
}

function chips(l) {
  return `${priceLabel(l)}<span class="chip pickup">${l.pickup ? 'Af te halen' : 'Bezorgen mogelijk'}</span>${l.status === 'sold' ? '<span class="chip sold">Verkocht</span>' : ''}`;
}

function renderNav() {
  const hash = location.hash || '#/';
  const link = (href, label, active) => `<a href="${href}" class="${active ? 'active' : ''}">${label}</a>`;
  let html = '';
  if (state.me) {
    const unreadBadge = state.unread > 0 ? `<span class="badge">${state.unread}</span>` : '';
    html = link('#/', 'Marktplaats', hash === '#/' || hash.startsWith('#/advertentie'))
      + link('#/plaats', 'Plaats advertentie', hash === '#/plaats')
      + link('#/berichten', `Berichten${unreadBadge}`, hash.startsWith('#/berichten'))
      + `<a href="#" id="logout-link">Uitloggen</a>`;
  } else {
    html = link('#/inloggen', 'Inloggen', hash === '#/inloggen') + link('#/registreren', 'Registreren', hash === '#/registreren');
  }
  nav.innerHTML = html;
  const lo = document.getElementById('logout-link');
  if (lo) lo.addEventListener('click', async (e) => {
    e.preventDefault();
    await api('/api/logout', { method: 'POST', body: {} });
    state.me = null;
    location.hash = '#/inloggen';
    route();
  });
}

function showError(msg) {
  return `<div class="alert">${esc(msg)}</div>`;
}

async function viewFeed() {
  let listings = [];
  let err = '';
  try {
    const params = new URLSearchParams();
    if (state.filters.q) params.set('q', state.filters.q);
    if (state.filters.category) params.set('category', state.filters.category);
    if (state.filters.type) params.set('type', state.filters.type);
    const data = await api('/api/listings?' + params.toString());
    listings = data.listings;
  } catch (e) { err = showError(e.message); }

  const cards = listings.map((l) => `
    <a class="listing-card" href="#/advertentie/${esc(l.id)}">
      ${l.status === 'sold' ? '<span class="sold-overlay">Verkocht</span>' : ''}
      <div class="thumb">${l.photo ? `<img src="/${esc(l.photo)}" alt="" loading="lazy">` : 'Geen foto'}</div>
      <div class="body">
        <div class="title">${esc(l.title)}</div>
        <div class="meta">${chips(l)}<span>${esc(l.category)}</span></div>
        <div class="meta">${esc(l.owner ? l.owner.username : '')} · ${timeAgo(l.createdAt)}</div>
      </div>
    </a>`).join('');

  app.innerHTML = `
    ${err}
    <div class="hero">
      <h1>Welkom op BuurtMarkt</h1>
      <p>Gratis, te koop of te ruil — alles wat je kwijt wilt of zoekt, binnen onze gemeenschap.</p>
      <a class="btn" href="${state.me ? '#/plaats' : '#/registreren'}">${state.me ? 'Plaats een advertentie' : 'Word lid'}</a>
    </div>
    <div class="filters card">
      <input type="text" id="f-q" placeholder="Zoek op titel of tekst…" value="${esc(state.filters.q)}">
      <select id="f-category">
        <option value="">Alle categorieën</option>
        ${CATEGORIES.map((c) => `<option ${state.filters.category === c ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
      <select id="f-type">
        <option value="">Alles</option>
        <option value="gratis" ${state.filters.type === 'gratis' ? 'selected' : ''}>Gratis</option>
        <option value="koop" ${state.filters.type === 'koop' ? 'selected' : ''}>Te koop</option>
        <option value="ruil" ${state.filters.type === 'ruil' ? 'selected' : ''}>Te ruil</option>
      </select>
    </div>
    ${cards ? `<div class="grid">${cards}</div>` : '<div class="empty">Nog geen advertenties. Wees de eerste die iets plaatst!</div>'}
  `;

  const debounce = (fn) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), 250); }; };
  document.getElementById('f-q').addEventListener('input', debounce((e) => { state.filters.q = e.target.value; viewFeed(); }));
  document.getElementById('f-category').addEventListener('change', (e) => { state.filters.category = e.target.value; viewFeed(); });
  document.getElementById('f-type').addEventListener('change', (e) => { state.filters.type = e.target.value; viewFeed(); });
}

async function viewDetail(id) {
  let listing;
  try {
    listing = (await api('/api/listings/' + id)).listing;
  } catch (e) {
    app.innerHTML = showError(e.message) + '<a class="btn secondary" href="#/">Terug naar het overzicht</a>';
    return;
  }
  const mine = state.me && listing.ownerId === state.me.id;
  app.innerHTML = `
    <a href="#/" class="muted">← Terug naar het overzicht</a>
    <div class="card" style="margin-top:10px">
      ${listing.photo ? `<img class="detail-photo" src="/${esc(listing.photo)}" alt="${esc(listing.title)}">` : ''}
      <h1>${esc(listing.title)}</h1>
      <div class="detail-meta">${chips(listing)}</div>
      <p class="description">${esc(listing.description) || '<span class="muted">Geen beschrijving.</span>'}</p>
      <p class="muted">Ge adsorbeerd door <strong>${esc(listing.owner ? listing.owner.username : 'onbekend')}</strong> · ${timeAgo(listing.createdAt)}</p>
      ${mine ? `
        <div class="form-actions">
          <button class="btn secondary small" id="toggle-sold">${listing.status === 'sold' ? 'Weer als beschikbaar markeren' : 'Markeren als verkocht'}</button>
          <button class="btn danger small" id="delete-listing">Verwijderen</button>
        </div>` : ''}
    </div>
    ${!mine && state.me ? `
      <div class="card">
        <h2>Stuur een bericht aan ${esc(listing.owner ? listing.owner.username : 'de adverteerder')}</h2>
        <textarea id="msg-text" placeholder="Bijvoorbeeld: is dit nog beschikbaar?"></textarea>
        <div class="form-actions"><button class="btn" id="send-msg">Verstuur</button></div>
      </div>` : ''}
    ${!state.me ? '<div class="notice"><a href="#/inloggen">Log in</a> om contact te leggen met de adverteerder.</div>' : ''}
  `;

  if (mine) {
    document.getElementById('toggle-sold').addEventListener('click', async () => {
      await api('/api/listings/' + id, { method: 'PATCH', body: { status: listing.status === 'sold' ? 'open' : 'sold' } });
      viewDetail(id);
    });
    document.getElementById('delete-listing').addEventListener('click', async () => {
      if (!confirm('Advertentie echt verwijderen?')) return;
      await api('/api/listings/' + id, { method: 'DELETE' });
      location.hash = '#/';
      route();
    });
  }
  const sendBtn = document.getElementById('send-msg');
  if (sendBtn) sendBtn.addEventListener('click', async () => {
    const text = document.getElementById('msg-text').value.trim();
    if (!text) return;
    sendBtn.disabled = true;
    try {
      const r = await api('/api/messages', { method: 'POST', body: { to: listing.ownerId, listingId: id, text } });
      location.hash = '#/berichten/' + r.threadId;
      route();
    } catch (e) {
      sendBtn.disabled = false;
      app.insertAdjacentHTML('afterbegin', showError(e.message));
    }
  });
}

function viewNewListing() {
  if (!state.me) { location.hash = '#/inloggen'; return; }
  app.innerHTML = `
    <h1>Nieuwe advertentie</h1>
    <div class="card">
      <label for="nl-photo">Foto (optioneel)</label>
      <input type="file" id="nl-photo" accept="image/*">
      <img id="nl-preview" class="photo-preview" hidden>

      <label for="nl-title">Titel</label>
      <input type="text" id="nl-title" maxlength="80" placeholder="Bijvoorbeeld: Kinderfiets, maat 26">

      <label>Soort</label>
      <div class="type-picker">
        <label><input type="radio" name="nl-type" value="koop" checked> Te koop</label>
        <label><input type="radio" name="nl-type" value="gratis"> Gratis</label>
        <label><input type="radio" name="nl-type" value="ruil"> Te ruil</label>
      </div>

      <div id="nl-price-row">
        <label for="nl-price">Prijs (€)</label>
        <input type="number" id="nl-price" min="0" step="0.01" placeholder="0,00">
      </div>

      <label for="nl-category">Categorie</label>
      <select id="nl-category">
        ${CATEGORIES.map((c) => `<option>${c}</option>`).join('')}
      </select>

      <label for="nl-desc">Beschrijving</label>
      <textarea id="nl-desc" maxlength="2000" placeholder="Vertel kort waar het over gaat, in welke staat het is, enz."></textarea>

      <div class="checkbox-row">
        <input type="checkbox" id="nl-pickup" checked>
        <label for="nl-pickup">Alleen af te halen bij mij</label>
      </div>

      <div class="form-actions"><button class="btn" id="nl-submit">Plaats advertentie</button></div>
    </div>
  `;

  const priceRow = document.getElementById('nl-price-row');
  document.querySelectorAll('input[name="nl-type"]').forEach((r) => r.addEventListener('change', () => {
    priceRow.style.display = document.querySelector('input[name="nl-type"]:checked').value === 'koop' ? '' : 'none';
  }));

  document.getElementById('nl-photo').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById('nl-preview');
    state.photoDataUrl = null;
    if (!file) { preview.hidden = true; return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1400;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        state.photoDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        preview.src = state.photoDataUrl;
        preview.hidden = false;
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('nl-submit').addEventListener('click', async () => {
    const btn = document.getElementById('nl-submit');
    btn.disabled = true;
    try {
      const body = {
        title: document.getElementById('nl-title').value.trim(),
        description: document.getElementById('nl-desc').value.trim(),
        category: document.getElementById('nl-category').value,
        type: document.querySelector('input[name="nl-type"]:checked').value,
        pickup: document.getElementById('nl-pickup').checked,
        photo: state.photoDataUrl,
      };
      if (body.type === 'koop') body.price = document.getElementById('nl-price').value;
      const r = await api('/api/listings', { method: 'POST', body });
      state.photoDataUrl = null;
      location.hash = '#/advertentie/' + r.listing.id;
      route();
    } catch (e) {
      btn.disabled = false;
      app.insertAdjacentHTML('afterbegin', showError(e.message));
    }
  });
}

function viewLogin() {
  app.innerHTML = `
    <h1>Inloggen</h1>
    <div class="card" style="max-width:420px">
      <label for="li-user">Gebruikersnaam</label>
      <input type="text" id="li-user" autocomplete="username">
      <label for="li-pass">Wachtwoord</label>
      <input type="password" id="li-pass" autocomplete="current-password">
      <div class="form-actions"><button class="btn" id="li-submit">Inloggen</button></div>
      <p class="muted">Nog geen lid? <a href="#/registreren">Registreren met uitnodigingscode</a></p>
    </div>
  `;
  document.getElementById('li-submit').addEventListener('click', async () => {
    try {
      const r = await api('/api/login', { method: 'POST', body: {
        username: document.getElementById('li-user').value,
        password: document.getElementById('li-pass').value,
      } });
      state.me = r.user;
      await refreshUnread();
      location.hash = '#/';
      route();
    } catch (e) { app.insertAdjacentHTML('afterbegin', showError(e.message)); }
  });
}

function viewRegister() {
  app.innerHTML = `
    <h1>Registreren</h1>
    <div class="card" style="max-width:420px">
      <label for="rg-user">Gebruikersnaam</label>
      <input type="text" id="rg-user" autocomplete="username" placeholder="3-24 tekens">
      <label for="rg-pass">Wachtwoord</label>
      <input type="password" id="rg-pass" autocomplete="new-password" placeholder="minimaal 6 tekens">
      <label for="rg-invite">Uitnodigingscode</label>
      <input type="text" id="rg-invite" placeholder="Vraag de beheerder van de gemeenschap">
      <div class="form-actions"><button class="btn" id="rg-submit">Account aanmaken</button></div>
      <p class="muted">Heb je al een account? <a href="#/inloggen">Inloggen</a></p>
    </div>
  `;
  document.getElementById('rg-submit').addEventListener('click', async () => {
    try {
      const r = await api('/api/register', { method: 'POST', body: {
        username: document.getElementById('rg-user').value,
        password: document.getElementById('rg-pass').value,
        invite: document.getElementById('rg-invite').value,
      } });
      state.me = r.user;
      location.hash = '#/';
      route();
    } catch (e) { app.insertAdjacentHTML('afterbegin', showError(e.message)); }
  });
}

async function viewInbox() {
  if (!state.me) { location.hash = '#/inloggen'; return; }
  let threads = [];
  let err = '';
  try {
    threads = (await api('/api/threads')).threads;
  } catch (e) { err = showError(e.message); }
  app.innerHTML = `
    <h1>Berichten</h1>
    ${err}
    ${threads.length ? threads.map((t) => `
      <a class="thread-item" href="#/berichten/${esc(t.threadId)}">
        <span class="who">${esc(t.other ? t.other.username : 'onbekend')}${t.unread > 0 ? `<span class="unread-dot">${t.unread}</span>` : ''}</span>
        <div class="about">over: ${esc(t.listingTitle)}</div>
        <div class="last">${esc(t.lastText)} · ${timeAgo(t.lastAt)}</div>
      </a>`).join('') : '<div class="empty">Nog geen berichten. Reageer op een advertentie om contact te leggen.</div>'}
  `;
}

async function viewThread(threadId) {
  if (!state.me) { location.hash = '#/inloggen'; return; }
  let data;
  try {
    data = await api('/api/threads/' + encodeURIComponent(threadId));
  } catch (e) {
    app.innerHTML = showError(e.message) + '<a class="btn secondary" href="#/berichten">Terug naar berichten</a>';
    return;
  }
  await refreshUnread();
  app.innerHTML = `
    <a href="#/berichten" class="muted">← Terug naar berichten</a>
    <h1>${esc(data.other ? data.other.username : 'Gesprek')}</h1>
    <p class="muted">Over: ${esc(data.listingTitle)}</p>
    <div class="chat">
      ${data.messages.map((m) => `
        <div class="bubble ${m.fromMe ? 'mine' : 'theirs'}">${esc(m.text)}<span class="time">${timeAgo(m.createdAt)}</span></div>`).join('')}
    </div>
    <div class="card">
      <div class="chat-form">
        <input type="text" id="chat-input" placeholder="Typ je bericht…" maxlength="2000">
        <button class="btn" id="chat-send">Stuur</button>
      </div>
    </div>
  `;
  const send = async () => {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    input.disabled = true;
    try {
      await api('/api/threads/' + encodeURIComponent(threadId) + '/messages', { method: 'POST', body: { text } });
      viewThread(threadId);
    } catch (e) {
      input.disabled = false;
      app.insertAdjacentHTML('afterbegin', showError(e.message));
    }
  };
  document.getElementById('chat-send').addEventListener('click', send);
  document.getElementById('chat-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
}

async function refreshUnread() {
  if (!state.me) { state.unread = 0; return; }
  try {
    const { threads } = await api('/api/threads');
    state.unread = threads.reduce((n, t) => n + t.unread, 0);
  } catch { state.unread = 0; }
}

function showInstallHint() {
  const el = document.getElementById('install-hint');
  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (standalone) { el.hidden = true; return; }
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  el.innerHTML = `<button id="hint-close" aria-label="Sluiten">✕</button>
    <strong>Zet BuurtMarkt op je beginscherm:</strong> ${ios
      ? 'tik op de deel-knop (□↑) en kies “Zet op beginscherm”.'
      : 'open het menu (⋮) en kies “App installeren” of “Zet op beginscherm”.'}`;
  el.hidden = false;
  document.getElementById('hint-close').addEventListener('click', () => { el.hidden = true; });
}

async function route() {
  renderNav();
  showInstallHint();
  const hash = location.hash || '#/';
  const parts = hash.slice(2).split('/');
  try {
    if (parts[0] === '' || parts[0] === undefined) await viewFeed();
    else if (parts[0] === 'plaats') viewNewListing();
    else if (parts[0] === 'advertentie' && parts[1]) await viewDetail(parts[1]);
    else if (parts[0] === 'inloggen') viewLogin();
    else if (parts[0] === 'registreren') viewRegister();
    else if (parts[0] === 'berichten' && parts[1]) await viewThread(decodeURIComponent(parts.slice(1).join('/')));
    else if (parts[0] === 'berichten') await viewInbox();
    else await viewFeed();
  } catch (e) {
    if (e.message !== 'Niet ingelogd') app.innerHTML = showError(e.message);
  }
  renderNav();
}

async function init() {
  try {
    const r = await api('/api/me');
    state.me = r.user;
    await refreshUnread();
  } catch { state.me = null; }
  window.addEventListener('hashchange', route);
  await route();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

init();
