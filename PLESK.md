# BuurtMarkt online zetten op een Plesk-subdomein

Handleiding voor bv. `carcaide.montevia.eu`. De app is een Node-app: de bestanden
moeten in de **document root van het subdomein** staan én **Node.js moet voor dat
subdomein ingeschakeld zijn**, anders serveert de webserver alleen statische
bestanden en krijg je een **404** (want `index.html` zit in `public/`, niet in de root).

## Stap 0 — Vereisten (eenmalig)

- Plesk-extensies **Node.js** en **Git** geïnstalleerd:
  *Extensies → Extensies-catalogus → zoek "Node.js" en "Git" → Installeren*.
  Geen Extensies-menu? Dan heb je een klantlogin — vraag je hostingprovider dit te installeren.
- Een **Node.js-versie ≥ 18** beschikbaar (Extensies → Node.js → versies installeren indien nodig).

## Stap 1 — Repo deployen via Git naar het subdomein

1. Plesk → *Websites & domeinen* → klik op het **subdomein** → icoon **Git**
2. **Remote Git-repository toevoegen**: `https://github.com/jacquesluijk/carcaide.git`
3. Branch: `vibe/buurtmarkt-21f085` (of `main` nadat PR #2 is gemerged)
4. Deploymentsmodus: **Automatisch** (elke push wordt gepulled) of handmatig via *Nu ophalen*
5. Deploy-map: de **document root van het subdomein** (bijv. `.../carcaide.montevia.eu/httpdocs`)

**Controle met File Manager (subdomein → Bestanden):** in `httpdocs` moeten direct staan:
`server.js`, `package.json`, `public/`, `tools/`, `README.md`, `.gitignore`.
Staat alles in een submap (bv. `httpdocs/carcaide/`)? Verplaats de inhoud dan naar `httpdocs`.

## Stap 2 — Node.js inschakelen voor het subdomein

Dit moet **per subdomein** (dus niet alleen voor het hoofddomein):

1. Subdomein → icoon **Node.js** → **Node.js inschakelen** aanzetten
2. **Node.js-versie:** 18 of hoger
3. **Modus:** Production
4. **Application root:** de document root van het subdomein (zelfde map als stap 1)
5. **Startup-bestand:** `server.js`
6. Omgevingsvariabele (optioneel): `INVITE_CODE=jouw-geheime-code`
   (anders gebruikt de app de standaard `BUURT-2025`)
7. **OK** → klik daarna op **App opnieuw starten**

Plesk start de app via Passenger en geeft de poort door via de omgevingsvariabele
`PORT`; `server.js` luistert daarop (`process.env.PORT || 3000`). Er zijn geen
npm-packages nodig. De server bindt standaard op `127.0.0.1` — dat is hier correct,
want de nginx/Apache-proxy van Plesk draait op dezelfde machine.

## Stap 3 — HTTPS aanzetten (verplicht voor de PWA)

Subdomein → **SSL/TLS-certificaten** → **Let's Encrypt** → vink het subdomein aan.
Zonder geldig certificaat werkt "zet op beginscherm" niet in de browser.

## Stap 4 — Testen

- Open `https://carcaide.montevia.eu/` → je ziet de BuurtMarkt-startpagina
- `https://carcaide.montevia.eu/api/me` → hoort `401 {"error":"Niet ingelogd"}` te geven (dat is goed)
- Registreer een testlid met de uitnodigingscode, plaats een advertentie met foto, stuur een bericht

## 404? Troubleshooting-checklist

Ga dit in deze volgorde na:

1. **Is Node.js écht ingeschakeld voor dít subdomein?** (per subdomein apart — controleer bij het subdomein zelf, niet bij het hoofddomein)
2. **Staat `server.js` direct in de document root?** (File Manager → `httpdocs/server.js` moet bestaan)
3. **Staat bij Node.js-instellingen de application root op díezelfde map?** (foutieve root = 404)
4. **Draait de app?** Node.js-pagina → statusbalk → klik **App opnieuw starten**. Bekijk de log via het **Logs**-icoon bij het domein. Een crash bij het aanmaken van `data/` (rechten) is de meest voorkomende oorzaak: zorg dat `httpdocs` beschrijfbaar is voor de abonnementgebruiker.
5. **Wrong folder bij Git-deploy?** Zie stap 1 — alles moet in `httpdocs`, niet in een submap.
6. **Startup-bestand** moet exact `server.js` zijn (geen `public/index.html`).

## Foto-uploads groter dan ~1 MB werken niet

Subdomein → *Apache & nginx-instellingen* (de pagina van het subdomein zelf — **niet** de
serverbrede "Algemene Apache-instellingen") → scroll naar beneden → sectie
**Aanvullende nginx-instructies** → klik in het tekstvak en plak:

```nginx
client_max_body_size 20m;
```

→ OK/Toepassen.

Is er geen nginx-sectie (alleen Apache)? Gebruik dan de sectie **Aanvullende
Apache-instructies** met: `LimitRequestBody 20971520` (20 MB in bytes).

## Na elke nieuwe Git-pull

Node.js → **App opnieuw starten** (of `touch restart.txt` in de app-root), anders
draait Passenger de oude versie door.

## Data back-uppen

`data/` in de app-map bevat leden, advertenties, berichten en foto's (`uploads/`).
Die map is via `.gitignore` uitgesloten van Git, dus die blijft staan bij pulls.
Maak er af en toe een back-up van via Plesk → *Back-up* of File Manager → downloaden.

## Fallback: zonder Node.js-extensie

Als de Node.js-extensie niet beschikbaar is op je abonnement: start de app via SSH
(`cd` naar de app-map, `PORT=3000 INVITE_CODE=... nohup node server.js &`) en zet bij
*Apache & nginx-instellingen → aanvullende nginx-instructies*:

```nginx
location / { proxy_pass http://127.0.0.1:3000; proxy_set_header Host $host; }
```

Let op: dit werkt alleen als SSH-toegang aan staat; de Node.js-extensie (stap 2) is de nettere oplossing.
