# BuurtMarkt

Een mini marktplaats voor een besloten gemeenschap, als web-app die je op je telefoon
als app op het beginscherm kunt zetten (PWA). Geen native app nodig.

Leden kunnen advertenties plaatsen (gratis, te koop of te ruil — auto's, huizen,
kleding, speelgoed, van alles), met één foto en een stukje tekst, en berichten
sturen aan elkaar over een advertentie.

## Starten

Vereist: Node.js 18 of hoger. Geen externe packages nodig.

```bash
npm start
# of: PORT=8080 INVITE_CODE=jouw-geheime-code node server.js
```

Open daarna `http://localhost:3000` in je browser.

Omgevingenvariabelen:

- `PORT` — poort (standaard 3000)
- `INVITE_CODE` — uitnodigingscode waarmee nieuwe leden zich registreren (standaard `BUURT-2025`)
- `DATA_DIR` — map voor data (standaard `./data`)

## Als app op je telefoon

1. Zet de app online (bijvoorbeeld op een server of Raspberry Pi in je netwerk).
2. Open de URL in de browser van je telefoon.
3. **Android/Chrome:** menu (⋮) → "App installeren" of "Toevoegen aan beginscherm".
   **iPhone/Safari:** deel-knop (□↑) → "Zet op beginscherm".
4. De app verschijnt als pictogram en opent zonder browserbalk.

## Gebruik

- Registreer met de uitnodigingscode van de beheerder → zo blijft de
  gemeenschap besloten.
- Plaats een advertentie: foto kiezen (wordt automatisch verkleind), titel,
  categorie, gratis/te koop/te ruil, prijs, beschrijving en "af te halen".
- Reageer op een advertentie via "Stuur een bericht" → je krijgt een
  gespreksvenster in "Berichten".
- Als verkoper kun je je advertentie markeren als verkocht of verwijderen.

## Technisch

- `server.js` — HTTP-server zonder dependencies (Node `http`, `crypto`, `fs`).
  Sessies via httpOnly-cookie, wachtwoorden met scrypt gehasht.
- `public/` — single-page app (vanilla JS), manifest + service worker voor de
  PWA-installatie.
- `data/` — runtime data: `users.json`, `listings.json`, `messages.json`,
  `sessions.json`, `uploads/` (foto's). Wordt automatisch aangemaakt.
- `tools/make-icons.js` — genereert de PWA-iconen (`npm run icons`).
