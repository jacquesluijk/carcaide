# Carcaide - Marktplaats voor Carcassonne

Een gesloten marktplaats-app voor intern gebruik in Carcassonne. Gebruikers kunnen zich registreren (na goedkeuring door admin), vacatures plaatsen, spullen aanbieden, hulp vragen, en meer.

## Functionaliteiten

- **Gebruikersbeheer**: Registratie met admin-goedkeuring
- **Categorieën**:
  - Vacatures (voor ondernemers)
  - Ondernemers (bedrijfspresentaties met reclame)
  - Vraag & Aanbod (met subcategorieën: auto's, meubels, kleding, etc.)
  - Evenementen
  - Samen Reizen
  - Diensten (exclusief voor admin)
- **Media**: Meerdere foto's en video's per advertentie
- **Profielen**: Gebruikersprofielen met profielfoto, contactgegevens, en voor ondernemers: bedrijfsinfo
- **Admin Dashboard**: Gebruikers goedkeuren, posts modereren, exclusieve diensten beheren

## Technologie

- **Frontend**: SvelteKit + TypeScript + Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Hosting**: Vercel (aanbevolen)

## Opzetten

### 1. Voorbereiding

1. Clone dit project:
   ```bash
   git clone <repository-url>
   cd carcaide
   ```

2. Installeer dependencies:
   ```bash
   npm install
   ```

### 2. Supabase opzetten

1. Maak een nieuw project aan op [Supabase](https://supabase.com/)

2. Ga naar **SQL Editor** en voer het script uit in `supabase_init.sql`

3. Maak de volgende storage buckets aan:
   - `profiles` (voor profielfoto's)
   - `posts` (voor post media)
   - `business` (voor bedrijfslogo's en cover foto's)
   - `ads` (voor reclame media)

4. Ga naar **Authentication > Settings** en voeg de volgende redirect URLs toe:
   - `http://localhost:5173` (voor lokale ontwikkeling)
   - `https://<je-vercel-domein>.vercel.app` (voor productie)

5. Ga naar **Project Settings > API** en kopieer:
   - Project URL
   - anon public key

6. Maak een `.env` bestand in de root van het project:
   ```env
   VITE_SUPABASE_URL=je-supabase-url
   VITE_SUPABASE_ANON_KEY=je-supabase-anon-key
   ```

### 3. Admin gebruiker aanmaken

1. Ga naar **Authentication > Users** in Supabase
2. Maak een nieuwe gebruiker aan met je email en wachtwoord
3. Voer de volgende SQL uit in **SQL Editor**:
   ```sql
   INSERT INTO users (id, email, name, role, is_approved)
   VALUES (
     'je-user-id',
     'je@email.com',
     'Admin',
     'admin',
     true
   );
   ```
   (Vervang `je-user-id` met de UUID van de gebruiker die je hebt aangemaakt)

### 4. Lokale ontwikkeling

Start de ontwikkelserver:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in je browser.

### 5. Deployen naar Vercel

1. Installeer de Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Log in bij Vercel:
   ```bash
   vercel login
   ```

3. Deploy het project:
   ```bash
   vercel
   ```

4. Voeg de omgevingsvariabelen toe in het Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

5. Herdeploy het project

## Gebruikersrollen

| Rol | Beschrijving | Toegestane acties |
|-----|--------------|-------------------|
| admin | Beheerder | Alle gebruikers goedkeuren, alle posts modereren, exclusieve diensten beheren |
| ondernemer | Bedrijf | Vacatures posten, bedrijfsprofiel aanmaken, reclame maken |
| werkzoekende | Werkzoekende | Vacatures bekijken, reageren |
| particulier | Gewone gebruiker | Vraag/aanbod posts, evenementen, samen reizen |

## Categorieën

| Categorie | Subcategorieën | Wie mag posten |
|-----------|-----------------|-----------------|
| Vacatures | - | Ondernemers |
| Ondernemers | - | Ondernemers |
| Vraag & Aanbod | Auto's, Meubels, Kleding, Computers, Telefoons, TV's, Speelgoed, Kinder & Baby | Particulieren |
| Evenementen | - | Particulieren |
| Samen Reizen | - | Particulieren |
| Diensten | Financiering, Woning Aankoop, Woning Verkoop, Verhuur Vakantiewoningen | **Alleen Admin** |

## Projectstructuur

```
carcaide/
├── src/
│   ├── lib/
│   │   ├── supabaseClient.ts  # Supabase client configuratie
│   │   ├── types.ts            # TypeScript types
│   │   └── utils.ts            # Hulp functies
│   ├── app.css                 # Tailwind CSS
│   ├── app.html                # Basis HTML template
│   ├── app.d.ts                # App types
│   └── routes/
│       ├── +layout.svelte     # Basis layout
│       ├── +page.svelte        # Home pagina
│       ├── auth/
│       │   ├── login/
│       │   │   └── +page.svelte # Inlog pagina
│       │   └── register/
│       │       └── +page.svelte # Registratie pagina
│       ├── admin/
│       │   └── +page.svelte    # Admin dashboard
│       ├── profile/
│       │   └── +page.svelte    # Profiel pagina
│       └── posts/
│           ├── create/
│           │   └── +page.svelte # Nieuwe post maken
│           └── [id]/
│               └── +page.svelte # Post detail pagina
├── supabase_init.sql           # Database schema
├── .env.example                # Voorbeeld omgevingsvariabelen
└── README.md                   # Deze file
```

## Kleurenpalet

- **Primair Oranje**: `#FF6B35`
- **Primair Blauw**: `#2E86C1`
- **Licht**: `#F8F9FA`
- **Donker**: `#2C3E50`

## Licentie

MIT
