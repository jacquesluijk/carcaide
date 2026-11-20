'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 3000);
const INVITE_CODE = process.env.INVITE_CODE || 'BUURT-2025';
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');

for (const d of [DATA_DIR, UPLOAD_DIR]) fs.mkdirSync(d, { recursive: true });

const CATEGORIES = ['Auto', 'Wonen', 'Kleding', 'Speelgoed', 'Elektronica', 'Tuin', 'Sport', 'Overig'];
const TYPES = ['koop', 'gratis', 'ruil'];
const MAX_BODY = 8 * 1024 * 1024;
const SESSION_TTL = 30 * 24 * 3600 * 1000;
const PHOTO_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

function load(name, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), 'utf8'));
  } catch {
    return fallback;
  }
}

function save(name, data) {
  const file = path.join(DATA_DIR, name);
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

let users = load('users.json', []);
let listings = load('listings.json', []);
let messages = load('messages.json', []);
let sessions = load('sessions.json', {});

(function pruneSessions() {
  const now = Date.now();
  let changed = false;
  for (const [token, s] of Object.entries(sessions)) {
    if (!s.createdAt || now - s.createdAt > SESSION_TTL) {
      delete sessions[token];
      changed = true;
    }
  }
  if (changed) save('sessions.json', sessions);
})();

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 32).toString('hex');
}

function publicUser(u) {
  return { id: u.id, username: u.username };
}

function findUserByName(name) {
  const n = String(name || '').toLowerCase();
  return users.find((u) => u.username.toLowerCase() === n);
}

function getSessionUser(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies.sid;
  if (!token || !sessions[token]) return null;
  return users.find((u) => u.id === sessions[token].userId) || null;
}

function parseCookies(header) {
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > -1) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', `sid=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_TTL / 1000}`);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', 'sid=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0');
}

function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error('Body te groot'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function readJson(req) {
  const raw = await readBody(req);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Ongeldige JSON');
  }
}

function threadIdFor(listingId, a, b) {
  const pair = [a, b].sort().join('|');
  return `${listingId}:${pair}`;
}

function listingWithOwner(l) {
  const owner = users.find((u) => u.id === l.ownerId);
  return { ...l, owner: owner ? publicUser(owner) : null };
}

function savePhoto(dataUrl) {
  if (!dataUrl) return null;
  const m = /^data:(image\/(jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/.exec(dataUrl);
  if (!m) throw new Error('Ongeldig afbeeldingsformaat (alleen JPEG, PNG of WebP)');
  const mime = m[1];
  const buf = Buffer.from(m[3], 'base64');
  if (buf.length < 100 || buf.length > 6 * 1024 * 1024) throw new Error('Foto moet tussen 100 bytes en 6 MB zijn');
  const file = crypto.randomUUID() + PHOTO_TYPES[mime];
  fs.writeFileSync(path.join(UPLOAD_DIR, file), buf);
  return 'uploads/' + file;
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function serveFile(res, filePath) {
  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Niet gevonden');
      return;
    }
    const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': st.size,
      'Cache-Control': filePath.includes(UPLOAD_DIR) ? 'public, max-age=86400' : 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

function serveStatic(res, urlPath) {
  let rel = decodeURIComponent(urlPath);
  if (rel === '/') rel = '/index.html';
  const base = rel.startsWith('/uploads/') ? UPLOAD_DIR : PUBLIC_DIR;
  const sub = rel.startsWith('/uploads/') ? rel.slice('/uploads/'.length) : rel.slice(1);
  const filePath = path.normalize(path.join(base, sub));
  if (!filePath.startsWith(base)) {
    res.writeHead(403);
    res.end('Verboden');
    return;
  }
  serveFile(res, filePath);
}

async function handleApi(req, res, url) {
  let p;
  try {
    p = decodeURIComponent(url.pathname);
  } catch {
    return json(res, 400, { error: 'Ongeldig pad' });
  }
  const method = req.method;

  if (method === 'POST' && p === '/api/register') {
    const body = await readJson(req);
    const username = String(body.username || '').trim();
    const password = String(body.password || '');
    const invite = String(body.invite || '').trim();
    if (!/^[a-zA-Z0-9_.-]{3,24}$/.test(username)) throw new Error('Kies een gebruikersnaam van 3-24 tekens (letters, cijfers, _ . -)');
    if (password.length < 6) throw new Error('Wachtwoord moet minimaal 6 tekens zijn');
    if (invite !== INVITE_CODE) throw new Error('Ongeldige uitnodigingscode');
    if (findUserByName(username)) throw new Error('Deze gebruikersnaam is al in gebruik');
    const salt = crypto.randomBytes(16).toString('hex');
    const user = { id: crypto.randomUUID(), username, salt, passHash: hashPassword(password, salt), createdAt: Date.now() };
    users.push(user);
    save('users.json', users);
    const token = crypto.randomBytes(32).toString('hex');
    sessions[token] = { userId: user.id, createdAt: Date.now() };
    save('sessions.json', sessions);
    setSessionCookie(res, token);
    return json(res, 201, { user: publicUser(user) });
  }

  if (method === 'POST' && p === '/api/login') {
    const body = await readJson(req);
    const user = findUserByName(body.username);
    const ok = user && crypto.timingSafeEqual(Buffer.from(hashPassword(String(body.password || ''), user.salt)), Buffer.from(user.passHash));
    if (!ok) throw new Error('Onjuiste gebruikersnaam of wachtwoord');
    const token = crypto.randomBytes(32).toString('hex');
    sessions[token] = { userId: user.id, createdAt: Date.now() };
    save('sessions.json', sessions);
    setSessionCookie(res, token);
    return json(res, 200, { user: publicUser(user) });
  }

  if (method === 'POST' && p === '/api/logout') {
    const cookies = parseCookies(req.headers.cookie || '');
    if (cookies.sid && sessions[cookies.sid]) {
      delete sessions[cookies.sid];
      save('sessions.json', sessions);
    }
    clearSessionCookie(res);
    return json(res, 200, { ok: true });
  }

  if (method === 'GET' && p === '/api/me') {
    const user = getSessionUser(req);
    if (!user) return json(res, 401, { error: 'Niet ingelogd' });
    return json(res, 200, { user: publicUser(user) });
  }

  if (method === 'GET' && p === '/api/listings') {
    const q = (url.searchParams.get('q') || '').toLowerCase().trim();
    const category = url.searchParams.get('category') || '';
    const type = url.searchParams.get('type') || '';
    const mine = url.searchParams.get('mine') === '1';
    const me = getSessionUser(req);
    let out = listings.slice();
    if (mine) {
      if (!me) return json(res, 401, { error: 'Niet ingelogd' });
      out = out.filter((l) => l.ownerId === me.id);
    }
    if (category && CATEGORIES.includes(category)) out = out.filter((l) => l.category === category);
    if (type && TYPES.includes(type)) out = out.filter((l) => l.type === type);
    if (q) out = out.filter((l) => (l.title + ' ' + l.description + ' ' + l.category).toLowerCase().includes(q));
    out.sort((a, b) => b.createdAt - a.createdAt);
    return json(res, 200, { listings: out.map(listingWithOwner) });
  }

  if (method === 'POST' && p === '/api/listings') {
    const me = getSessionUser(req);
    if (!me) return json(res, 401, { error: 'Log in om een advertentie te plaatsen' });
    const body = await readJson(req);
    const title = String(body.title || '').trim();
    const description = String(body.description || '').trim();
    const category = String(body.category || '');
    const type = String(body.type || '');
    const pickup = body.pickup === true || body.pickup === 'true';
    let price = null;
    if (!title || title.length < 3 || title.length > 80) throw new Error('Titel moet 3-80 tekens zijn');
    if (description.length > 2000) throw new Error('Beschrijving mag maximaal 2000 tekens zijn');
    if (!CATEGORIES.includes(category)) throw new Error('Kies een categorie');
    if (!TYPES.includes(type)) throw new Error('Kies een type (te koop, gratis of te ruil)');
    if (type === 'koop') {
      price = Number(body.price);
      if (!Number.isFinite(price) || price < 0 || price > 10000000) throw new Error('Vul een geldige prijs in');
    }
    const photo = savePhoto(body.photo || null);
    const listing = {
      id: crypto.randomUUID(),
      title,
      description,
      category,
      type,
      price,
      pickup,
      photo,
      status: 'open',
      ownerId: me.id,
      createdAt: Date.now(),
    };
    listings.push(listing);
    save('listings.json', listings);
    return json(res, 201, { listing: listingWithOwner(listing) });
  }

  const listingMatch = p.match(/^\/api\/listings\/([0-9a-f-]{36})$/);
  if (listingMatch) {
    const listing = listings.find((l) => l.id === listingMatch[1]);
    if (!listing) return json(res, 404, { error: 'Advertentie niet gevonden' });
    if (method === 'GET') return json(res, 200, { listing: listingWithOwner(listing) });
    const me = getSessionUser(req);
    if (!me) return json(res, 401, { error: 'Niet ingelogd' });
    if (listing.ownerId !== me.id) return json(res, 403, { error: 'Alleen de eigenaar mag dit wijzigen' });
    if (method === 'PATCH') {
      const body = await readJson(req);
      if (body.status === 'sold') listing.status = 'sold';
      else if (body.status === 'open') listing.status = 'open';
      save('listings.json', listings);
      return json(res, 200, { listing: listingWithOwner(listing) });
    }
    if (method === 'DELETE') {
      listings = listings.filter((l) => l.id !== listing.id);
      save('listings.json', listings);
      if (listing.photo) {
        const f = path.join(UPLOAD_DIR, path.basename(listing.photo));
        fs.promises.unlink(f).catch(() => {});
      }
      return json(res, 200, { ok: true });
    }
  }

  if (method === 'GET' && p === '/api/threads') {
    const me = getSessionUser(req);
    if (!me) return json(res, 401, { error: 'Niet ingelogd' });
    const byThread = new Map();
    for (const m of messages) {
      if (m.from !== me.id && m.to !== me.id) continue;
      if (!byThread.has(m.threadId)) byThread.set(m.threadId, []);
      byThread.get(m.threadId).push(m);
    }
    const threads = [];
    for (const [threadId, msgs] of byThread) {
      msgs.sort((a, b) => a.createdAt - b.createdAt);
      const last = msgs[msgs.length - 1];
      const otherId = last.from === me.id ? last.to : last.from;
      const other = users.find((u) => u.id === otherId);
      const listing = listings.find((l) => l.id === last.listingId);
      threads.push({
        threadId,
        other: other ? publicUser(other) : null,
        listingTitle: listing ? listing.title : '(verwijderde advertentie)',
        lastText: last.text,
        lastAt: last.createdAt,
        unread: msgs.filter((m) => m.to === me.id && !m.read).length,
      });
    }
    threads.sort((a, b) => b.lastAt - a.lastAt);
    return json(res, 200, { threads });
  }

  const threadMatch = p.match(/^\/api\/threads\/([0-9a-f-]{36}:[0-9a-f-|]{36,80})(\/messages)?$/);
  if (threadMatch) {
    const me = getSessionUser(req);
    if (!me) return json(res, 401, { error: 'Niet ingelogd' });
    const threadId = threadMatch[1];
    const msgs = messages.filter((m) => m.threadId === threadId && (m.from === me.id || m.to === me.id));
    if (!msgs.length) return json(res, 404, { error: 'Gesprek niet gevonden' });
    msgs.sort((a, b) => a.createdAt - b.createdAt);
    if (method === 'GET') {
      let changed = false;
      for (const m of msgs) {
        if (m.to === me.id && !m.read) {
          m.read = true;
          changed = true;
        }
      }
      if (changed) save('messages.json', messages);
      const last = msgs[msgs.length - 1];
      const otherId = last.from === me.id ? last.to : last.from;
      const other = users.find((u) => u.id === otherId);
      const listing = listings.find((l) => l.id === last.listingId);
      return json(res, 200, {
        threadId,
        other: other ? publicUser(other) : null,
        listingTitle: listing ? listing.title : '(verwijderde advertentie)',
        messages: msgs.map((m) => ({ ...m, fromMe: m.from === me.id })),
      });
    }
    if (method === 'POST' && threadMatch[2] === '/messages') {
      const body = await readJson(req);
      const text = String(body.text || '').trim();
      if (!text || text.length > 2000) throw new Error('Bericht moet 1-2000 tekens zijn');
      const last = msgs[msgs.length - 1];
      const to = last.from === me.id ? last.to : last.from;
      const msg = {
        id: crypto.randomUUID(),
        threadId,
        from: me.id,
        to,
        listingId: last.listingId,
        text,
        createdAt: Date.now(),
        read: false,
      };
      messages.push(msg);
      save('messages.json', messages);
      return json(res, 201, { message: { ...msg, fromMe: true } });
    }
  }

  if (method === 'POST' && p === '/api/messages') {
    const me = getSessionUser(req);
    if (!me) return json(res, 401, { error: 'Niet ingelogd' });
    const body = await readJson(req);
    const to = String(body.to || '');
    const listingId = String(body.listingId || '');
    const text = String(body.text || '').trim();
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) throw new Error('Advertentie niet gevonden');
    if (listing.ownerId !== to) throw new Error('Je kunt alleen de adverteerder berichten');
    if (to === me.id) throw new Error('Je kunt jezelf geen bericht sturen');
    if (!text || text.length > 2000) throw new Error('Bericht moet 1-2000 tekens zijn');
    const threadId = threadIdFor(listingId, me.id, to);
    const msg = {
      id: crypto.randomUUID(),
      threadId,
      from: me.id,
      to,
      listingId,
      text,
      createdAt: Date.now(),
      read: false,
    };
    messages.push(msg);
    save('messages.json', messages);
    return json(res, 201, { message: { ...msg, fromMe: true }, threadId });
  }

  return json(res, 404, { error: 'Niet gevonden' });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) {
      await handleApi(req, res, url);
    } else if (req.method === 'GET' || req.method === 'HEAD') {
      serveStatic(res, url.pathname);
    } else {
      json(res, 405, { error: 'Methode niet toegestaan' });
    }
  } catch (err) {
    const msg = err.message === 'Body te groot' ? err.message : (err.message || 'Interne fout');
    json(res, 400, { error: msg });
  }
});

server.listen(PORT, () => {
  console.log(`BuurtMarkt draait op http://localhost:${PORT}`);
  console.log(`Uitnodigingscode: ${INVITE_CODE} (zet INVITE_CODE in de omgeving om te wijzigen)`);
});
