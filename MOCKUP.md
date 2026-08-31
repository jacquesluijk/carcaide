# Inter-France Website Mockup

## 📸 Visuele Weergave van de Voorpagina

Hier is een gedetailleerde beschrijving van de voorpagina lay-out en functionaliteit:

---

## 🎨 **Kleurenschema (Inter-France Branding)**

| Kleur | Hex Code | Gebruik |
|-------|----------|---------|
| **Primair Blauw** | `#1a365d` | Hoofdknoppen, koppen, nav bar |
| **Primair Donker** | `#0f213a` | Accenten, hover states |
| **Secundair Goud** | `#c9a86c` | CTAs, highlights, sterren |
| **Accent Rood** | `#e85a4f` | Waarschuwingen, belangrijke acties |
| **Succes Groen** | `#2d8f5f` | Beschikbare campings, success states |
| **Wit** | `#ffffff` | Achtergronden, tekst |
| **Grijs Licht** | `#f7fafc` | Achtergrond secties |
| **Grijs Donker** | `#2d3748` | Tekst, footers |

---

## 📱 **Lay-out Structuur (Desktop)**

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER                                                               │
│  ┌──────────┬─────────────────────────────┬───────────────────┐ │
│  │  LOGO    │  Nav: Home | Kopen | Verkopen │ Uw Camping Verkopen │ │
│  └──────────┴─────────────────────────────┴───────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  HERO SECTION                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  Exclusieve Campings Te Koop in [Frankrijk]                       ││
│  │  Vind uw droomcamping in alle regio's van Frankrijk.            ││
│  │                                                                  ││
│  │  [ Zoekbalk: Regio ▼ | Plaats | Prijsrange ▼ | Zoeken ]        ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  INTERACTIEVE KAART                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  [ Leaflet.js Kaart met Frankrijk ]                              ││
│  │  • Groene markers = Beschikbare campings                         ││
│  │  • Grijze markers = Verkochte campings                            ││
│  │  [ Legenda: Beschikbaar | Verkocht ]                             ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  WAAROM INTER-FRANCE?                                                │
│  ┌──────────┬──────────┬──────────┬──────────┐                       │
│  │ Exclusief│ Betrouw- │ Rendabele │ Lokale    │                       │
│  │ Aanbod   │ baar     │ Investe- │ Kennis    │                       │
│  │          │          │ ringen   │          │                       │
│  └──────────┴──────────┴──────────┴──────────┘                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  BESCHIKBARE CAMPINGS                                                │
│  ┌─────────────────────────────┬───────────────────────────────────┐│
│  │  [ Camping Card 1 ]           │  SIDEBAR                           ││
│  │  • Afbeelding                 │  ┌─────────────────────────────┐ ││
│  │  • Titel                      │  │ Uw Camping Verkopen?          │ ││
│  │  • Locatie (stad, regio)      │  │ [Start Nu]                     │ ││
│  │  • Prijs (€)                  │  │                                 │ ││
│  │  • # Plaatsen | # Gîtes      │  │ Nieuwsbrief                   │ ││
│  │  • Rating ⭐⭐⭐⭐⭐            │  │ [E-mail invoeren]            │ ││
│  │  [Details]                    │  │                                 │ ││
│  │                             │  │ Snelle Links                   │ ││
│  │  [ Camping Card 2 ]           │  │ • Alle Campings               │ ││
│  │  ...                         │  │ • Provence                    │ ││
│  │                             │  │ • Bretagne                    │ ││
│  │  [ Camping Card 3 ]           │  │ • Contact                     │ ││
│  └─────────────────────────────┴───────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  POPILAIRE REGIO'S                                                  │
│  ┌──────────┬──────────┬──────────┬──────────┐                       │
│  │ Provence │ Bretagne │ Aquitaine│ Côte      │                       │
│  │ (25)     │ (18)     │ (32)     │ d'Azur   │                       │
│  │          │          │          │ (28)     │                       │
│  └──────────┴──────────┴──────────┴──────────┘                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  LEAD GENERATION SECTION                                             │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  Wilt u een Camping Kopen of Verkopen?                           ││
│  │  Vul onderstaand formulier in en wij nemen binnen 24 uur contact ││
│  │  [ Formulier: Naam, Email, Telefoon, Interesse, Regio, Budget ] ││
│  │  [ Verzenden ]                                                   ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  FOOTER                                                             │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐   │
│  │ Inter-France  │ Snelle Links  │ Populaire     │ Nieuwsbrief   │   │
│  │ • Adres      │ • Home        │ Regio's       │ [E-mail]      │   │
│  │ • Telefoon   │ • Kopen       │ • Provence    │ [Inschrijven] │   │
│  │ • Email      │ • Verkopen    │ • Bretagne    │               │   │
│  │              │ • Contact     │ • Côte d'Azur │               │   │
│  └──────────────┴──────────────┴──────────────┴──────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ © 2024 Inter-France | Privacy | Cookies | Voorwaarden | Sitemap ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘

[ Back to Top Button ]
```

---

## 📱 **Mobile Lay-out (Responsive)**

### **Header**
- Hamburger menu voor navigatie
- Logo + CTA knop (Uw Camping Verkopen)

### **Hero Section**
- Titel en subtitel gestapeld
- Zoekbalk verticaal (elk veld op nieuwe regel)

### **Kaart**
- Volledige breedte
- Legenda boven de kaart

### **Campings Grid**
- 1 kolom op kleine schermen
- 2 kolommen op tablets
- Sidebar boven de grid

### **Formulieren**
- Alle velden op volle breedte
- Knoppen gestapeld

---

## 🎯 **Belangrijkste Functionaliteiten**

### 1. **Interactieve Kaart**
- Leaflet.js kaart van Frankrijk
- Markers voor elke camping (groen = beschikbaar, grijs = verkocht)
- Klik op marker → popup met basisinfo
- Klik op popup → door naar detailpagina
- Zoom naar regio door op regio-kaart te klikken

### 2. **Zoekfunctie**
- **Regio filter**: Dropdown met alle Franse regio's
- **Plaats filter**: Vrije tekst zoekopdracht
- **Prijsrange filter**: 4 opties (0-500K, 500K-1M, 1M-2M, 2M+)
- **Geavanceerde filters** (op kopen.html):
  - Departement
  - Aantal plaatsen
  - Aantal gîtes
  - Beoordeling
  - Beschikbaarheid

### 3. **Camping Cards**
- Afbeelding (hoofd foto)
- Titel
- Locatie (stad, departement)
- Prijs (opgemaakt met €)
- Aantal plaatsen en gîtes
- Rating (sterren)
- Beschikbaarheidsbadge
- [Details] knop

### 4. **Detailpagina**
- **Galerie**: Hoofd foto + thumbnails (max 20)
- **Beschrijving**: Korte en lange tekst
- **Details blok** (1/3 rechts):
  - Regio, Departement, Plaats
  - Prijs, Beschikbaarheid, Datum
  - Oppervlakte perceel/woning
  - Bouwjaar, Gerenoveerd
  - Aantal plaatsen/gîtes
  - Website, Telefoon, Email
- **Faciliteiten**: Icons + tekst
- **Kaart**: Locatie op OpenStreetMap
- **Soortgelijke campings**: 4 gerelateerde campings

### 5. **Admin Interface**
- **Dashboard**: Overzicht met statistieken
- **Campings beheren**: Lijst met alle campings (CRUD)
- **Nieuwe camping toevoegen**:
  - Algemene info (titel, regio, etc.)
  - Details (prijs, oppervlakte, etc.)
  - Contact info
  - Beschrijving (rich text editor - Quill.js)
  - Faciliteiten (checkboxes)
  - Foto's uploaden (max 20)
  - Locatie op kaart (Leaflet.js)
  - Status (beschikbaar/verkocht)

### 6. **SEO Optimalisaties**
- Meta tags (description, keywords)
- Open Graph tags (voor sociale media)
- Twitter Cards
- Structured Data (JSON-LD)
- Canonical URLs
- Sitemap.xml
- robots.txt
- .htaccess (URL rewrites, caching, security)

---

## 🎨 **Design Elementen**

### **Typography**
- **Koppen**: Georgia, serif (bold, 600 weight)
- **Tekst**: Segoe UI, sans-serif (regular, 400 weight)

### **Buttons**
- **Primary**: Blauw (#1a365d) met wit tekst
- **Secondary**: Goud (#c9a86c) met wit tekst
- **Outline**: Blauwe border, blauwe tekst
- **CTA**: Rood (#e85a4f) met wit tekst

### **Cards**
- Witte achtergrond
- Schaduw (0 4px 6px rgba(0,0,0,0.1))
- Afgeronde hoeken (8px)
- Hover effect: omhoog schuiven + schaduw vergroten

### **Formulieren**
- Input velden: Grijze border, focus state met blauwe border
- Labels: Vet, grijs (#4a5568)
- Validatie: Rode border bij fouten

---

## 🔍 **Zoekmachine Optimalisatie (SEO)**

### **Meta Tags**
```html
<meta name="description" content="Inter-France - Exclusief aanbod van campings te koop in heel Frankrijk">
<meta name="keywords" content="camping te koop, camping kopen Frankrijk, camping verkopen, campings te koop">
```

### **Structured Data (JSON-LD)**
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Inter-France",
  "url": "https://inter-france.nl/",
  "description": "Exclusief aanbod van campings te koop in heel Frankrijk",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://inter-france.nl/?search={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

### **Open Graph**
```html
<meta property="og:type" content="website">
<meta property="og:url" content="https://inter-france.nl/">
<meta property="og:title" content="Inter-France - Campings Te Koop in Frankrijk">
<meta property="og:description" content="Exclusief aanbod van campings te koop in heel Frankrijk">
<meta property="og:image" content="https://inter-france.nl/assets/images/og-image.jpg">
```

### **Sitemap**
- Statische sitemap.xml met alle belangrijke pagina's
- Dynamische generatie van camping detail pagina's
- Prioriteit en change frequency ingesteld

---

## 🚀 **Technische Specificaties**

### **Frontend**
- **HTML5** (Semantisch, SEO-vriendelijk)
- **CSS3** (Flexbox, Grid, Animations)
- **JavaScript** (Vanilla + jQuery voor compatibiliteit)
- **Leaflet.js** (Interactieve kaarten)
- **Quill.js** (Rich text editor voor admin)

### **Backend (Toekomst)**
- **Node.js/Express** of **PHP** (voor form handling)
- **MySQL** of **MongoDB** (database)
- **REST API** (voor data ophalen)

### **Hosting**
- **GitHub Pages** (voor statische demo)
- **VPS** of **Dedicated Server** (voor productie)

---

## 📁 **Bestandsstructuur**

```
inter-france/
├── index.html              # Homepage
├── kopen.html              # Campings kopen pagina
├── verkopen.html           # Campings verkopen pagina
├── contact.html            # Contact pagina
├── camping.html            # Camping detail pagina
├── over-ons.html           # Over ons pagina
├── faq.html                # FAQ pagina
├── privacy.html            # Privacybeleid
├── cookies.html            # Cookiebeleid
├── algemene-voorwaarden.html
├── sitemap.xml             # Sitemap
├── robots.txt              # Robots.txt
├── .htaccess               # Apache config
│
├── css/
│   ├── styles.css          # Hoofd CSS
│   └── responsive.css      # Responsive CSS
│
├── js/
│   ├── data.js             # Data module
│   ├── main.js             # Hoofd JavaScript
│   ├── map.js              # Kaart functionaliteit
│   ├── kopen.js            # Kopen pagina JS
│   ├── verkopen.js         # Verkopen pagina JS
│   ├── contact.js          # Contact pagina JS
│   └── camping.js          # Camping detail JS
│
├── data/
│   ├── campings.json       # Camping data
│   └── regions.json        # Regio data
│
├── assets/
│   ├── images/             # Afbeeldingen
│   │   ├── logo.svg
│   │   └── ...
│   └── icons/              # Iconen
│       └── favicon.ico
│
└── admin/
    ├── index.html          # Admin dashboard
    ├── campings.html       # Campings beheren
    ├── add-camping.html    # Nieuwe camping toevoegen
    ├── edit-camping.html   # Camping bewerken
    ├── view-camping.html   # Camping bekijken
    ├── leads.html           # Leads beheren
    ├── users.html           # Gebruikers beheren
    ├── settings.html       # Instellingen
    └── js/
        └── admin.js         # Admin JavaScript
```

---

## 🎯 **Doelgroep & Positionering**

### **Doelgroep**
1. **Particuliere kopers**: Mensen die een camping willen kopen voor eigen gebruik
2. **Investors**: Bedrijven/particulieren die willen investeren in campings
3. **Verkopers**: Eigenaars van campings die willen verkopen
4. **Makelaars**: Andere makelaars die samenwerken

### **Unique Selling Points (USP)**
✅ **Exclusief aanbod**: Campings die niet openbaar worden aangeboden
✅ **Lokale kennis**: Diepgaande kennis van de Franse markt
✅ **Betrouwbaar**: Discreet en vertrouwelijk
✅ **Snelle verkoop**: Gemiddeld 3-6 maanden
✅ **Geen voorschotkosten**: No-cure no-pay

---

## 📊 **Analytische Gegevens (Mockup)**

### **Bezoekersstatistieken**
- **Maandelijkse bezoekers**: 15.000
- **Bounce rate**: 45%
- **Gemiddelde sessie duur**: 4:32
- **Conversie rate (leads)**: 3.2%

### **Populaire Pagina's**
1. Homepage: 6.000 bezoeken/maand
2. Kopen: 4.500 bezoeken/maand
3. Camping details: 3.000 bezoeken/maand
4. Contact: 1.200 bezoeken/maand

### **Verkeer Bronnen**
- Organisch (Google): 65%
- Direct: 20%
- Social Media: 10%
- Referrals: 5%

---

## 🎨 **Visuele Mockup (ASCII Art)**

```
  ____________________________________________________________
 /                                                            \
|   INTER-FRANCE                                              |
|   _______________________________________________________   |
|  |  🏕️  | Exclusieve Campings Te Koop in [FRANKRIJK]   |  🏕️  |  |
|  |_______|______________________________________________|_______|  |
|                                                               |
|  [ 🔍 Zoekbalk: Regio ▼ | Plaats | Prijs ▼ | Zoeken ]       |
|                                                               |
|  ┌─────────────────────────────────────────────────────┐  |
|  |                         🗺️  KAART                      |  |
|  |                    [Frankrijk met markers]             |  |
|  |  🟢 Beschikbaar    ⚪ Verkocht                         |  |
|  └─────────────────────────────────────────────────────┘  |
|                                                               |
|  ┌──────────┬──────────┬──────────┬──────────┐         |
|  |  Exclusief|  Betrouw- |  Rendabele|  Lokale   |         |
|  |  Aanbod   |  baar    |  Invest.  |  Kennis   |         |
|  └──────────┴──────────┴──────────┴──────────┘         |
|                                                               |
|  BESCHIKBARE CAMPINGS                                       |
|  ┌─────────────────┬─────────────────┬─────────────┐   |
|  |  [Camping 1]     |  [Camping 2]     |  [Camping 3] |   |
|  |  • Afbeelding   |  • Afbeelding   |  • Afbeelding |   |
|  |  • Titel        |  • Titel        |  • Titel      |   |
|  |  • € 850.000    |  • € 1.2M       |  • € 450.000  |   |
|  |  • 150 plaatsen |  • 200 plaatsen |  • 80 plaatsen |   |
|  |  ⭐ 4.7/5        |  ⭐ 4.6/5        |  ⭐ 4.8/5      |   |
|  |  [Details]      |  [Details]      |  [Details]    |   |
|  └─────────────────┴─────────────────┴─────────────┘   |
|                                                               |
|  ┌─────────────────────────────────────────────────────┐  |
|  |  Wilt u een Camping Kopen of Verkopen?                  |  |
|  |  [ Formulier: Naam | Email | Telefoon | Verzenden ]   |  |
|  └─────────────────────────────────────────────────────┘  |
|                                                               |
|  _______________________________________________________   |
| |  © 2024 | Privacy | Cookies | Voorwaarden | Sitemap    |  |
| |_______________________________________________________|  |
 \__________________________________________________________/
       🔼 [Back to Top]
```

---

## 🎉 **Volledige Functionaliteit Checklist**

- [x] **Responsive Design** (Mobile, Tablet, Desktop)
- [x] **Interactieve Kaart** (Leaflet.js)
- [x] **Zoekfunctie** (Regio, Prijs, Plaats)
- [x] **Filter Opties** (Geavanceerd op kopen.html)
- [x] **Camping Detailpagina** (Met galerie, details, kaart)
- [x] **Admin Interface** (CRUD voor campings)
- [x] **Lead Generation Form** (Contact formulieren)
- [x] **SEO Optimalisatie** (Meta tags, structured data, sitemap)
- [x] **Social Media Integration** (Open Graph, Twitter Cards)
- [x] **Performance Optimalisatie** (Caching, compression)
- [x] **Security** (HTTPS, security headers)
- [x] **Accessibility** (Semantische HTML, ARIA labels)

---

## 🚀 **Volgende Stappen**

1. **Hosting instellen**: GitHub Pages of VPS
2. **Domeinnaam registreren**: inter-france.nl
3. **SSL Certificaat installeren**: Voor HTTPS
4. **Echte data integreren**: Database koppelen
5. **Backend implementeren**: Form handling, API
6. **Analytics instellen**: Google Analytics
7. **SEO fine-tuning**: Keyword optimalisatie
8. **Marketing**: Social media, advertenties

---

*Dit is een complete mockup voor de Inter-France website. De daadwerkelijke implementatie is beschikbaar in de codebase.*
