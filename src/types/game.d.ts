export type RoomId = 'muelle' | 'taberna' | 'callejon';

export type ItemId =
  | 'frasco_vacio'
  | 'frasco_ectoplasma'
  | 'formulario';

export type FlagId =
  | 'ectoplasma_recogido'
  | 'hablado_tabernero'
  | 'visto_guardian'
  | 'acto1_completo';

export interface SaveData {
  version: number;
  roomId: RoomId;
  xavier: { x: number; y: number };
  inventory: ItemId[];
  flags: FlagId[];
  timestamp: number;
}

export type HotspotAction =
  | { kind: 'dialogue'; lines: string[] }
  | {
      kind: 'pickup';
      item: ItemId;
      lines: string[];
      alreadyDoneLines?: string[];
      setFlag?: FlagId;
    }
  | {
      kind: 'useItem';
      item: ItemId;
      lines: string[];
      setFlag?: FlagId;
      givesItem?: ItemId;
      consumesItem?: boolean;
    }
  | { kind: 'exit'; to: RoomId; spawnX: number; spawnY: number }
  | { kind: 'npc'; lines: string[]; setFlag?: FlagId };

export interface HotspotDef {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  interactX: number;
  interactY: number;
  cursor?: 'interact' | 'exit';
  hiddenIfFlag?: FlagId;
  onlyIfFlag?: FlagId;
  /** Acción por defecto al hacer clic sin item seleccionado. */
  action: HotspotAction;
  /** Mapa de item -> acción cuando ese item está seleccionado en el inventario. */
  itemUse?: Partial<Record<ItemId, HotspotAction>>;
}

export interface RoomDef {
  id: RoomId;
  name: string;
  bgTextureKey: string;
  defaultSpawn: { x: number; y: number };
  walkableBounds: { top: number; bottom: number };
  hotspots: HotspotDef[];
}

export interface ItemDef {
  id: ItemId;
  name: string;
  description: string;
  textureKey: string;
}

export type CursorKind = 'normal' | 'interact' | 'exit';
