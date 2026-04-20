/**
 * Nombres de escenas (evita strings mágicos).
 */
export const SCENE = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  TITLE: 'TitleScene',
  UI: 'UIScene',
  MUELLE: 'MuelleScene',
  TABERNA: 'TabernaScene',
  CALLEJON: 'CallejonScene'
} as const;

/**
 * Eventos globales publicados en el EventBus.
 */
export const EVT = {
  DIALOGUE_START: 'dialogue:start',
  DIALOGUE_END: 'dialogue:end',
  DIALOGUE_ADVANCE: 'dialogue:advance',
  INVENTORY_CHANGED: 'inventory:changed',
  ITEM_SELECTED: 'inventory:itemSelected',
  ITEM_DESELECTED: 'inventory:itemDeselected',
  ROOM_ENTER: 'room:enter',
  ROOM_EXIT_REQUEST: 'room:exitRequest',
  SAVE_WRITE: 'save:write',
  SAVE_LOAD: 'save:load',
  HOTSPOT_HOVER: 'hotspot:hover',
  HOTSPOT_BLUR: 'hotspot:blur',
  CURSOR_SET: 'cursor:set',
  FLAG_SET: 'flag:set'
} as const;
