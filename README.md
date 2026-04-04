# 3Play - Media Indexing & Sharing Network

A high-performance, full-stack media management infrastructure built with Next.js 16, TypeScript, and Tailwind CSS. 3Play acts as a decentralized hub for content providers to share and index media collections.

---

## ⚠️ Právní doložka a Disclaimer / Legal & DMCA Compliance

**Tato platforma funguje jako poskytovatel technické infrastruktury pro sdílení obsahu mezi nezávislými providery a uživateli.**

1.  **Model sdílení (Content Providers):** 3Play slouží jako nástroj pro správce (providery), kteří nahrávají a sdílejí obsah v rámci uzavřené nebo otevřené komunity. Platforma sama o sobě nevlastní ani neprodukuje žádný mediální obsah.
2.  **Omezení přístupu:** Registrace a přístup do administrátorského rozhraní jsou striktně omezeny a nejsou veřejně přístupné. Platforma je chráněna proti neoprávněným změnám a přístupům třetích stran.
3.  **Monetizace a infrastruktura:** Systém může obsahovat reklamní moduly (např. AdSense, AdFly). Tyto příjmy jsou využívány výhradně na údržbu serverů, škálování úložiště a zajištění nepřetržitého provozu infrastruktury. Reklamy nejsou platbou za obsah, ale za využívání technických služeb platformy.
4.  **Ochrana autorských práv (DMCA):** Provozovatel platformy 3Play jedná v souladu s mezinárodními standardy pro poskytovatele hostingových služeb. Pokud zjistíte, že obsah nahraný jedním z providerů porušuje vaše autorská práva, zašlete prosím řádné oznámení o odstranění (Takedown Notice) na kontaktní e-mail administrátora. Obsah bude po ověření neprodleně odstraněn.
5.  **Právní imunita:** Platforma je navržena tak, aby splňovala podmínky pro "Safe Harbor" ochranu poskytovatelů služeb. Veškerá odpovědnost za legálnost a původ nahraného obsahu leží na konkrétním providerovi, který obsah do systému vložil.

---

## Klíčové vlastnosti

- **Provider Infrastructure**: Robustní systém pro nahrávání a distribuci médií.
- **Access Control**: Zabezpečené rozhraní s víceúrovňovým oprávněním.
- **Ad-Network Ready**: Integrované sloty pro reklamní systémy na pokrytí nákladů.
- **Dynamic Indexing**: Automatické generování metadat pro filmy a seriály.
- **Scalable Architecture**: Navrženo pro trvalý provoz s vysokou zátěží.

## Instalace a Provoz

### Požadavky

- Node.js 18+
- SQLite / PostgreSQL (pro produkční nasazení)

### Instalace

```bash
npm install
npm run db:generate
npx prisma db push
npm run build
npm start
```

## Bezpečnost a Údržba

- **Zákaz veřejné registrace**: Přístup k nahrávání obsahu je povolen pouze autorizovaným providerům.
- **Ochrana proti změnám**: Zdrojový kód a konfigurační soubory jsou chráněny proti modifikaci neautorizovanými uživateli.

---

## Licence

Software 3Play je šířen pod MIT licencí. Tato licence se vztahuje na technické řešení a kód, nikoliv na obsah přenášený přes tuto platformu.
