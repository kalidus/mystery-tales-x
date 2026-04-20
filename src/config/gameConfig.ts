/**
 * Configuración global del juego.
 * Todas las resoluciones internas son en coordenadas de "mundo" 1920x1080.
 */
export const GAME_WIDTH = 1920;
export const GAME_HEIGHT = 1080;

export const GAME_BACKGROUND_COLOR = '#070910';

/**
 * Velocidad base de Xavier en pixeles/segundo en coordenadas internas.
 */
export const XAVIER_WALK_SPEED = 520;

/** Paleta principal (gabardina marrón, gris fedora, verde ectoplasma) */
export const PALETTE = {
  gabardina: 0x5c3d28,
  gabardinaDark: 0x3a2818,
  fedora: 0x4a4a4a,
  fedoraBand: 0x20202a,
  piel: 0xe8c39e,
  pielSombra: 0xb48a6a,
  bota: 0x1a1520,
  verdeEcto: 0x7cff8a,
  verdeEctoSombra: 0x3fa84a,
  amarilloLuz: 0xf9e58c,
  rojoAcento: 0xb84444,

  cieloNoche: 0x0d1224,
  cieloNocheClaro: 0x1b2340,
  luna: 0xe7ead5,
  lunaSombra: 0xb4b89d,
  nieblaA: 0x2a3244,
  nieblaB: 0x39455c,

  maderaOscura: 0x3a2414,
  maderaMedia: 0x5a3a20,
  maderaClara: 0x7a512a,
  maderaPodrida: 0x44321f,

  piedraOscura: 0x1f2128,
  piedraMedia: 0x343843,
  piedraClara: 0x50566a,

  bronce: 0x8a5a20,

  tabernaOscuro: 0x1a130e,
  tabernaMedio: 0x2d2017,
  tabernaClaro: 0x4a3220,

  amulet1: 0xc83f3f,
  amulet2: 0xc8a93f,
  amulet3: 0x5ac83f,

  basuraMetal: 0x4a5358,
  basuraOxido: 0x6b3a22,

  blanco: 0xeef1f4,
  negro: 0x0b0d14
} as const;

/**
 * Claves de textura (centralizadas para permitir reemplazo por assets reales).
 */
export const TEX = {
  // Sprite sheet procedural heredado (fallback, ya no se usa por defecto).
  XAVIER: 'xavier',
  // Texturas recortadas del personaje (10 frames normalizados).
  XAVIER_IDLE_1: 'xavier_idle_1',
  XAVIER_IDLE_2: 'xavier_idle_2',
  XAVIER_WALK_1: 'xavier_walk_1',
  XAVIER_WALK_2: 'xavier_walk_2',
  XAVIER_WALK_3: 'xavier_walk_3',
  XAVIER_WALK_4: 'xavier_walk_4',
  XAVIER_TALK_1: 'xavier_talk_1',
  XAVIER_TALK_2: 'xavier_talk_2',
  XAVIER_REACH: 'xavier_reach',
  XAVIER_GRAB: 'xavier_grab',
  // Claves crudas, previo al chromakey.
  XAVIER_IDLE_1_RAW: 'xavier_idle_1_raw',
  XAVIER_IDLE_2_RAW: 'xavier_idle_2_raw',
  XAVIER_WALK_1_RAW: 'xavier_walk_1_raw',
  XAVIER_WALK_2_RAW: 'xavier_walk_2_raw',
  XAVIER_WALK_3_RAW: 'xavier_walk_3_raw',
  XAVIER_WALK_4_RAW: 'xavier_walk_4_raw',
  XAVIER_TALK_1_RAW: 'xavier_talk_1_raw',
  XAVIER_TALK_2_RAW: 'xavier_talk_2_raw',
  XAVIER_REACH_RAW: 'xavier_reach_raw',
  XAVIER_GRAB_RAW: 'xavier_grab_raw',

  BG_MUELLE: 'bg_muelle',
  BG_TABERNA: 'bg_taberna',
  BG_CALLEJON: 'bg_callejon',

  MUELLE_CARTEL: 'muelle_cartel',
  MUELLE_ECTOPLASMA: 'muelle_ectoplasma',
  MUELLE_ECTOPLASMA_VACIO: 'muelle_ectoplasma_vacio',
  MUELLE_GUARDIAN: 'muelle_guardian',
  MUELLE_GUARDIAN_IMG: 'muelle_guardian_img',
  MUELLE_GUARDIAN_IMG_RAW: 'muelle_guardian_img_raw',
  MUELLE_BARCO: 'muelle_barco',
  NIEBLA: 'niebla',

  TABERNA_TABERNERO: 'taberna_tabernero',
  TABERNA_TABERNERO_IMG: 'taberna_tabernero_img',
  TABERNA_TABERNERO_IMG_RAW: 'taberna_tabernero_img_raw',
  TABERNA_BOTELLA: 'taberna_botella',

  CALLEJON_BASURA: 'callejon_basura',
  CALLEJON_PUERTA: 'callejon_puerta',
  CALLEJON_FRASCO: 'callejon_frasco',

  ITEM_FRASCO_VACIO: 'item_frasco_vacio',
  ITEM_FRASCO_ECTOPLASMA: 'item_frasco_ectoplasma',
  ITEM_FORMULARIO: 'item_formulario',

  CURSOR_NORMAL: 'cursor_normal',
  CURSOR_INTERACT: 'cursor_interact',
  CURSOR_EXIT: 'cursor_exit',

  LUNA: 'luna',
  DIALOG_BOX: 'dialog_box',
  INVENTORY_SLOT: 'inventory_slot',
  TITLE_BG: 'title_bg',
  TITLE_LOGO: 'title_logo'
} as const;

/**
 * Claves de animación.
 */
export const ANIM = {
  XAVIER_IDLE: 'xavier-idle',
  XAVIER_WALK: 'xavier-walk',
  XAVIER_TALK: 'xavier-talk',
  XAVIER_GRAB: 'xavier-grab'
} as const;

/** z-index (depth) de render */
export const DEPTH = {
  BG: 0,
  BG_PROPS: 10,
  ENTITIES: 100,
  FG_PROPS: 200,
  FOG: 300,
  UI_BG: 900,
  UI: 1000,
  UI_TEXT: 1010,
  CURSOR: 2000
} as const;

export const SAVE_STORAGE_KEY = 'mtx.save.v1';
export const SAVE_VERSION = 1;

export const DIALOGUE_CHARS_PER_SECOND = 45;
