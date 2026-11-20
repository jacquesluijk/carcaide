'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(OUT, { recursive: true });

const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0;
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

function makeCanvas(size) {
  const data = Buffer.alloc(size * size * 4);
  return {
    size,
    data,
    set(x, y, r, g, b, a) {
      if (x < 0 || y < 0 || x >= size || y >= size) return;
      const i = (y * size + x) * 4;
      data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = a;
    },
    fillRect(x0, y0, x1, y1, r, g, b, a) {
      for (let y = Math.max(0, Math.round(y0)); y < Math.min(size, Math.round(y1)); y++)
        for (let x = Math.max(0, Math.round(x0)); x < Math.min(size, Math.round(x1)); x++) this.set(x, y, r, g, b, a);
    },
    roundedRect(x0, y0, x1, y1, rad, r, g, b, a) {
      for (let y = Math.round(y0); y < Math.round(y1); y++) {
        for (let x = Math.round(x0); x < Math.round(x1); x++) {
          const cx = Math.max(x0 + rad, Math.min(x, x1 - rad));
          const cy = Math.max(y0 + rad, Math.min(y, y1 - rad));
          const dx = x - cx, dy = y - cy;
          if (dx * dx + dy * dy <= rad * rad) this.set(x, y, r, g, b, a);
        }
      }
    },
  };
}

function drawBag(c, s, inset) {
  const u = s / 64;
  const ox = (s - (s - inset * 2)) / 2;
  const oy = ox;
  c.fillRect(ox + 17 * u, oy + 26 * u, ox + 47 * u, oy + 50 * u, 255, 255, 255, 255);
  c.fillRect(ox + 24 * u, oy + 22 * u, ox + 28 * u, oy + 30 * u, 255, 255, 255, 255);
  c.fillRect(ox + 36 * u, oy + 22 * u, ox + 40 * u, oy + 30 * u, 255, 255, 255, 255);
  c.fillRect(ox + 24 * u, oy + 22 * u, ox + 40 * u, oy + 26 * u, 255, 255, 255, 255);
  c.fillRect(ox + 27 * u, oy + 34 * u, ox + 37 * u, oy + 44 * u, 21, 128, 61, 255);
}

function makeIcon(size, maskable) {
  const c = makeCanvas(size);
  const bg = [21, 128, 61];
  if (maskable) {
    c.fillRect(0, 0, size, size, ...bg, 255);
    drawBag(c, size, size * 0.18);
  } else {
    const rad = size * 0.22;
    c.roundedRect(0, 0, size, size, rad, ...bg, 255);
    drawBag(c, size, 0);
  }
  return encodePng(size, size, c.data);
}

fs.writeFileSync(path.join(OUT, 'icon-192.png'), makeIcon(192, false));
fs.writeFileSync(path.join(OUT, 'icon-512.png'), makeIcon(512, false));
fs.writeFileSync(path.join(OUT, 'icon-maskable-512.png'), makeIcon(512, true));
console.log('Iconen gegenereerd in public/icons/');
