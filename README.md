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

Online zetten op een Plesk-subdomein (incl. 404-troubleshooting): zie [PLESK.md](PLESK.md).

### Veilig lokaal testen op je eigen computer

Standaard bindt de server alleen op `127.0.0.1` — dan is de app **alleen op jouw
computer** bereikbaar, niet via het netwerk of internet. Zo test je veilig:

```bash
git clone -b vibe/buurtmarkt-21f085 https://github.com/jacquesluijk/carcaide.git
cd carcaide && npm start    # draait op http://localhost:3000
```

Alleen vanaf een ander apparaat in je eigen Wi-Fi (bv. je telefoon) testen?
Zet dan expres `HOST=0.0.0.0` en gebruik het interne IP van je computer:

```bash
HOST=0.0.0.0 npm start      # Windows: ipconfig | Mac/Linux: ip addr
# telefoon opzelfde Wi-Fi: http://<intern-ip>:3000
```

Waarschuwing: doe dit alleen op een vertrouwd thuisnetwerk met je firewall aan,
forward nooit poort 3000 in je router, en gebruik het niet op openbare Wi-Fi.
Let op: de PWA ("zet op beginscherm") werkt alleen via HTTPS, dus voor het testen
van de app-installatie op je telefoon heb je het Plesk-subdomein met Let's Encrypt nodig.

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
