# 3Play - Global Media Infrastructure Platform

A high-performance, full-stack media management architecture built with Next.js 16, TypeScript, and Tailwind CSS. 3Play is designed as a neutral technical intermediary for content indexing, distribution, and community-driven media networks.

---

## ⚖️ Legal Framework & Risk Mitigation (Global Standards)

**Tato sekce definuje právní postavení platformy 3Play jako technického zprostředkovatele (Service Provider) v souladu s mezinárodními standardy (DMCA, EU Copyright Directive, Safe Harbor).**

### 1. Právní imunita (Neutral Intermediary)
3Play funguje výhradně jako poskytovatel technických nástrojů. V souladu s principem "Safe Harbor" (USA) a "Article 17" (EU) platforma nenese odpovědnost za obsah nahraný třetími stranami (providery), pokud:
- Sama obsah nevybírá ani neupravuje.
- Neprovádí aktivní vyhledávání nelegálního obsahu (není její zákonnou povinností).
- Neprodleně reaguje na nahlášení porušení práv.

### 2. DMCA & Copyright Policy (Standard pro streaming)
Všechny subjekty využívající tuto infrastrukturu musí dodržovat politiku "Zero Tolerance" vůči vědomému porušování autorských práv:
- **Takedown Notice:** Platforma obsahuje mechanismus pro okamžité odstranění obsahu na základě validního nahlášení držitelem práv.
- **Repeat Infringer Policy:** Uživatelé nebo provideři, kteří opakovaně porušují autorská práva, budou trvale zablokováni.

### 3. Monetizace a Reklamní systémy
Integrace reklamních sítí (AdSense, AdFly, atd.) slouží výhradně k:
- Pokrytí nákladů na hosting, CDN a šířku pásma (bandwidth).
- Vývoji bezpečnostních prvků a údržbě kódu.
Reklamní příjmy jsou odděleny od samotného obsahu a jsou účtovány za poskytování technické služby platformy.

### 4. Odpovědnost Providerů (Sharing Providers)
Administrátoři instancí (provideři) vystupují jako nezávislí správci obsahu. Nahráním jakéhokoliv materiálu potvrzují, že disponují příslušnými licencemi nebo jednají v rámci zákonných výjimek (např. Fair Use, Private Sharing).

---

## Klíčové vlastnosti

- **Enterprise Infrastructure**: Škálovatelný systém pro distribuci velkoobjemových dat.
- **Neutral Core**: Architektura oddělující technickou vrstvu od obsahu.
- **Advanced Access Control**: Šifrované přístupy pro autorizované providery.
- **Global Compliance Ready**: Připraveno pro implementaci lokálních právních požadavků.

## Instalace a Provoz

### Postup

```bash
npm install
npm run db:generate
npx prisma db push
npm run build
npm start
```

## Bezpečnost a Ochrana dat

- **Strict Admin Policy**: Přístup k nahrávání je povolen pouze po manuálním ověření administrátorem.
- **Data Isolation**: Každý provider spravuje svou izolovanou knihovnu obsahu.

---

## Licence

Zdrojový kód (engine) je šířen pod MIT licencí. Tato licence se vztahuje na logiku aplikace a UI prvky. Autorská práva k médiím přenášeným systémem zůstávají původním vlastníkům.
