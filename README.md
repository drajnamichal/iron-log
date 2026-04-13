# Iron Log – Tréningový denník

PWA aplikácia pre sledovanie silového tréningu s **Push / Pull / Legs** splitom.

Program je zostavený podľa princípov **Jeff Cavaliere** (Athlean-X) a **Andrew Huberman**:
- Compound lifty prvé, izolácia na záver
- 6–8 reps na hlavné cviky (mechanické napätie), 10–15 na izoláciu (metabolický stres)
- Tréning blízko zlyhania (RPE 8–9)
- Progressive overload – keď zvládneš max reps vo všetkých setoch, pridaj váhu

## Tech stack

- React 18 + TypeScript
- Vite + vite-plugin-pwa
- Tailwind CSS
- localStorage (offline, bez servera)
- Recharts (grafy)

## Spustenie

```bash
npm install
npm run dev
```

Otvor [http://localhost:5173](http://localhost:5173)

## Build + PWA

```bash
npm run build
npm run preview
```

Na mobile otvor URL a pridaj na plochu ("Add to Home Screen").

## Štruktúra

```
src/
├── components/    # UI komponenty (Navigation, ExerciseBlock, RestTimer, ...)
├── data/          # Tréningový program (PPL split definícia)
├── hooks/         # React hooks (workouts, body weight)
├── lib/           # localStorage helper, TypeScript typy
├── pages/         # Dashboard, Workout, History, BodyWeight
└── App.tsx        # Router
```

## Funkcie

- **Dashboard** – prehľad týždňa, streak, posledné tréningy, aktuálna váha
- **Tréning** – výber Push/Pull/Legs, checklist setov s váhou a reps, rest timer
- **História** – všetky dokončené tréningy, detail setov, graf progresu na cvik
- **Telesná váha** – záznam váhy, graf priebehu, štatistiky zmien
- **PWA** – funguje offline, inštalovateľná na mobil

## Dáta

Všetky dáta sú uložené v `localStorage` prehliadača. Export/import nie je zatiaľ implementovaný.
