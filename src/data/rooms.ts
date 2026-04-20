import { TEX } from '../config/gameConfig';
import type { RoomDef, RoomId } from '../types/game';
import { DIALOGUES } from './dialogues';

const ROOM_MUELLE: RoomDef = {
  id: 'muelle',
  name: 'El Muelle',
  bgTextureKey: TEX.BG_MUELLE,
  defaultSpawn: { x: 340, y: 960 },
  walkableBounds: { top: 820, bottom: 1030 },
  hotspots: [
    {
      id: 'cartel',
      x: 560,
      y: 720,
      width: 200,
      height: 230,
      label: 'Cartel desgastado',
      interactX: 620,
      interactY: 960,
      cursor: 'interact',
      action: { kind: 'dialogue', lines: DIALOGUES.muelle.cartel }
    },
    {
      id: 'ectoplasma',
      x: 880,
      y: 980,
      width: 140,
      height: 60,
      label: 'Charco de ectoplasma',
      interactX: 950,
      interactY: 990,
      cursor: 'interact',
      hiddenIfFlag: 'ectoplasma_recogido',
      action: { kind: 'dialogue', lines: DIALOGUES.muelle.ectoplasmaMirar },
      itemUse: {
        frasco_vacio: {
          kind: 'useItem',
          item: 'frasco_vacio',
          lines: DIALOGUES.muelle.ectoplasmaPickup,
          setFlag: 'ectoplasma_recogido',
          givesItem: 'frasco_ectoplasma',
          consumesItem: true
        }
      }
    },
    {
      id: 'ectoplasma_vacio',
      x: 880,
      y: 980,
      width: 140,
      height: 40,
      label: 'Mancha en la madera',
      interactX: 950,
      interactY: 990,
      cursor: 'interact',
      onlyIfFlag: 'ectoplasma_recogido',
      action: { kind: 'dialogue', lines: DIALOGUES.muelle.ectoplasmaVacio }
    },
    {
      id: 'guardian',
      x: 1320,
      y: 600,
      width: 220,
      height: 400,
      label: 'Guardián Espectral',
      interactX: 1220,
      interactY: 960,
      cursor: 'interact',
      hiddenIfFlag: 'visto_guardian',
      action: {
        kind: 'npc',
        lines: DIALOGUES.muelle.guardianPrimera,
        setFlag: 'visto_guardian'
      }
    },
    {
      id: 'guardian_repeat',
      x: 1320,
      y: 600,
      width: 220,
      height: 400,
      label: 'Guardián Espectral',
      interactX: 1220,
      interactY: 960,
      cursor: 'interact',
      onlyIfFlag: 'visto_guardian',
      action: {
        kind: 'dialogue',
        lines: DIALOGUES.muelle.guardianRepetida
      }
    },
    {
      id: 'barco',
      x: 1500,
      y: 540,
      width: 180,
      height: 80,
      label: 'Ferry en la niebla',
      interactX: 1420,
      interactY: 960,
      cursor: 'interact',
      action: { kind: 'dialogue', lines: DIALOGUES.muelle.barco }
    },
    {
      id: 'exit_taberna',
      x: 1720,
      y: 820,
      width: 200,
      height: 260,
      label: 'Taberna El Marinero Ahogado',
      interactX: 1780,
      interactY: 970,
      cursor: 'exit',
      action: { kind: 'exit', to: 'taberna', spawnX: 280, spawnY: 1005 }
    },
    {
      id: 'exit_callejon',
      x: 0,
      y: 820,
      width: 200,
      height: 260,
      label: 'Callejón Vudú',
      interactX: 140,
      interactY: 970,
      cursor: 'exit',
      action: { kind: 'exit', to: 'callejon', spawnX: 1760, spawnY: 940 }
    }
  ]
};

const ROOM_TABERNA: RoomDef = {
  id: 'taberna',
  name: 'Taberna El Marinero Ahogado',
  bgTextureKey: TEX.BG_TABERNA,
  defaultSpawn: { x: 320, y: 1005 },
  // Banda estrecha en Y: el suelo del fondo es casi plano; un `top` bajo permitía
  // caminar “por el aire” al hacer clic arriba (clampWalkY usaba ese mínimo).
  walkableBounds: { top: 968, bottom: 1055 },
  hotspots: [
    {
      id: 'exit_muelle',
      x: 60,
      y: 380,
      width: 220,
      height: 400,
      label: 'Salida al muelle',
      interactX: 280,
      interactY: 1010,
      cursor: 'exit',
      action: { kind: 'exit', to: 'muelle', spawnX: 1780, spawnY: 970 }
    },
    {
      id: 'tabernero',
      x: 920,
      y: 520,
      width: 140,
      height: 130,
      label: 'Tabernero zombi',
      interactX: 960,
      interactY: 1020,
      cursor: 'interact',
      hiddenIfFlag: 'hablado_tabernero',
      action: {
        kind: 'npc',
        lines: DIALOGUES.taberna.tabernero1,
        setFlag: 'hablado_tabernero'
      }
    },
    {
      id: 'tabernero_repeat',
      x: 920,
      y: 520,
      width: 140,
      height: 130,
      label: 'Tabernero zombi',
      interactX: 960,
      interactY: 1020,
      cursor: 'interact',
      onlyIfFlag: 'hablado_tabernero',
      action: {
        kind: 'dialogue',
        lines: DIALOGUES.taberna.tabernero2
      }
    },
    {
      id: 'botella',
      x: 1180,
      y: 600,
      width: 40,
      height: 50,
      label: 'Botella vacía',
      interactX: 1200,
      interactY: 998,
      cursor: 'interact',
      action: { kind: 'dialogue', lines: DIALOGUES.taberna.botella }
    }
  ]
};

const ROOM_CALLEJON: RoomDef = {
  id: 'callejon',
  name: 'Callejón de la Tienda Vudú',
  bgTextureKey: TEX.BG_CALLEJON,
  defaultSpawn: { x: 1760, y: 940 },
  walkableBounds: { top: 820, bottom: 1020 },
  hotspots: [
    {
      id: 'exit_muelle',
      x: 1780,
      y: 700,
      width: 160,
      height: 360,
      label: 'Volver al muelle',
      interactX: 1720,
      interactY: 960,
      cursor: 'exit',
      action: { kind: 'exit', to: 'muelle', spawnX: 200, spawnY: 970 }
    },
    {
      id: 'basura',
      x: 360,
      y: 820,
      width: 160,
      height: 160,
      label: 'Montaña de basura',
      interactX: 440,
      interactY: 990,
      cursor: 'interact',
      action: {
        kind: 'pickup',
        item: 'frasco_vacio',
        lines: DIALOGUES.callejon.frascoPickup,
        alreadyDoneLines: DIALOGUES.callejon.basuraVacia
      }
    },
    {
      id: 'puerta',
      x: 820,
      y: 360,
      width: 280,
      height: 400,
      label: 'Puerta vudú',
      interactX: 960,
      interactY: 960,
      cursor: 'interact',
      action: { kind: 'dialogue', lines: DIALOGUES.callejon.puerta }
    }
  ]
};

export const ROOMS: Record<RoomId, RoomDef> = {
  muelle: ROOM_MUELLE,
  taberna: ROOM_TABERNA,
  callejon: ROOM_CALLEJON
};
