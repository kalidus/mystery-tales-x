# Mystery Tales X

Aventura gráfica point-and-click 2D desarrollada con Vite + TypeScript + Phaser 4 + Howler.js.
Esta es la **v1 base funcional** del Acto 1 en Isla Bruma.

## Stack

- Vite
- TypeScript (strict)
- Phaser 4
- Howler.js
- localStorage (sin backend)

## Instalación y ejecución

```bash
npm install
npm run dev
```

Abre `http://localhost:5173` (Vite lo abre automáticamente).

### Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Arranca el servidor de desarrollo |
| `npm run build` | Compila y construye el bundle de producción en `dist/` |
| `npm run preview` | Sirve el build de producción |
| `npm run typecheck` | Validación TypeScript sin emitir |

## Estructura

```
src/
├── main.ts                  Arranque Phaser.Game
├── config/                  Constantes, keys, resolución
├── scenes/                  Boot, Preload, Title, UI + rooms/
├── entities/                Xavier, NPC, Hotspot
├── systems/                 EventBus, SaveSystem, Inventory, Dialogue, Audio
├── ui/                      DialogueBox, InventoryBar, Cursor
├── data/                    Rooms, diálogos e ítems declarativos
├── utils/                   Generación de placeholders pixel art
└── types/                   Tipos compartidos
```

## Flujo jugable v1

1. Pantalla de título (Nueva partida / Continuar si hay save).
2. Spawn en el **Muelle** bajo la luna.
3. Navegar a **Callejón Vudú** y recoger el **Frasco de cristal vacío** de la basura.
4. Volver al **Muelle** y usar el frasco sobre el charco de **ectoplasma**.
5. Visita opcional a la **Taberna "El Marinero Ahogado"**.

El progreso se autoguarda en `localStorage` bajo la key `mtx.save.v1`.

## Personaje

**Xavier** — Detective de fenómenos paranormales. Gabardina morado oscuro, fedora gris,
Espectrómetro de Bolsillo con luz verde parpadeante. Sarcástico, rompe la cuarta pared.

Animaciones: `idle`, `walk`, `talk`, `grab`.

## Pixel art

Todos los assets son **placeholders generados en runtime** vía `Phaser.Graphics`.
Para sustituirlos por pixel art real:

1. Colocar los PNG/atlas en `public/assets/`.
2. En `src/scenes/PreloadScene.ts` reemplazar las llamadas a `generate*` por
   `this.load.image(TEX.XXX, 'assets/xxx.png')`.
3. Mantener los IDs de `src/config/gameConfig.ts` (`TEX.*`) para no tocar el resto del código.

## Resolución

- Interna: **1920×1080** (pixel art HD moderno).
- Escala `FIT` + `CENTER_BOTH` con `pixelArt: true` y `roundPixels: true`.
- `image-rendering: pixelated` forzado en CSS.

## Licencia

Proyecto privado. Todos los textos y diseño pertenecen a sus autores.
