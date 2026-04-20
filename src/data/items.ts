import { TEX } from '../config/gameConfig';
import type { ItemDef, ItemId } from '../types/game';

export const ITEMS: Record<ItemId, ItemDef> = {
  frasco_vacio: {
    id: 'frasco_vacio',
    name: 'Frasco de cristal vacío',
    description: 'Un frasco viejo con tapón de corcho. Perfecto para guardar... algo.',
    textureKey: TEX.ITEM_FRASCO_VACIO
  },
  frasco_ectoplasma: {
    id: 'frasco_ectoplasma',
    name: 'Frasco con ectoplasma',
    description: 'Burbujea y hace bloop. Sospechosamente vivo.',
    textureKey: TEX.ITEM_FRASCO_ECTOPLASMA
  },
  formulario: {
    id: 'formulario',
    name: 'Formulario burocrático',
    description: 'Formulario oficial 28-B. Falta rellenarlo con tinta de calamar espectral.',
    textureKey: TEX.ITEM_FORMULARIO
  }
};
