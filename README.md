# 3Play - Media & Sharing Platform

A modern, full-stack video management platform built with Next.js 16, TypeScript, Tailwind CSS, and SQLite. Designed for media hosting, community sharing, and content management.

---

## ⚠️ Právní doložka a Disclaimer / Legal Notice

**Tento projekt slouží jako platforma pro hosting a sdílení obsahu.**

1.  **Monetizace a Reklamy:** Tato platforma může obsahovat reklamní systémy (např. AdSense, AdFly) za účelem pokrytí nákladů na provoz serveru a další vývoj infrastruktury. Reklamy nejsou přímo vázány na konkrétní autorsky chráněná díla.
2.  **Autorská práva a DMCA:** Provozovatel platformy 3Play plně respektuje autorská práva (Copyright). Naším cílem není profitovat z nelegálního sdílení chráněného obsahu. 
3.  **Odpovědnost za obsah:** Veškerý obsah je nahráván uživateli. Provozovatel platformy neprovádí předběžnou kontrolu každého souboru, ale zavazuje se k rychlému odstranění jakéhokoli obsahu, který porušuje autorská práva, na základě řádného nahlášení (DMCA request).
4.  **Uživatelská smlouva:** Nahráním obsahu uživatel potvrzuje, že k němu vlastní práva nebo má svolení k jeho sdílení. Jakékoli zneužití platformy k distribuci nelegálního obsahu je v rozporu s našimi pravidly.
5.  **Sdílení vs. Prodej:** Platforma slouží ke sdílení obsahu v rámci komunity, nikoliv k přímému prodeji autorských děl.

---

## Funkce

- **Media Library**: Pokročilá správa filmů, seriálů a uživatelských videí.
- **Ad System Integration**: Podpora pro vkládání reklamních skriptů.
- **Zabezpečený přístup**: Robustní autentizace přes NextAuth.js.
- **Admin Dashboard**: Kompletní správa uživatelů a nahraného obsahu.
- **Moderní UI**: Responzivní tmavý režim (Shadcn/ui).

## Instalace

### Požadavky

- Node.js 18+

### Postup

1. Nainstalujte závislosti:
```bash
npm install
```

2. Nastavte proměnné prostředí:
```bash
cp .env.example .env
```

3. Nastavte databázi (SQLite):
```bash
npm run db:generate
npx prisma db push --force-reset
npm run db:seed
```

4. Spusťte vývojový server:
```bash
npm run dev
```

### Výchozí Admin údaje

- **Email**: `admin@3play.com`
- **Heslo**: `admin123`

## Licence

Zdrojový kód aplikace je licencován pod MIT licencí. Tato licence se nevztahuje na mediální obsah hostovaný na platformě.
