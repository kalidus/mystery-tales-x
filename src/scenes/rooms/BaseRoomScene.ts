import * as Phaser from 'phaser';
import { DEPTH, GAME_HEIGHT, GAME_WIDTH } from '../../config/gameConfig';
import { EVT, SCENE } from '../../config/constants';
import { ROOMS } from '../../data/rooms';
import { DIALOGUES } from '../../data/dialogues';
import type { HotspotAction, HotspotDef, RoomDef, RoomId } from '../../types/game';
import { Xavier } from '../../entities/Xavier';
import { Hotspot } from '../../entities/Hotspot';
import { DialogueSystem } from '../../systems/DialogueSystem';
import { InventorySystem } from '../../systems/InventorySystem';
import { SaveSystem } from '../../systems/SaveSystem';
import { EventBus } from '../../systems/EventBus';

/**
 * Datos pasados entre rooms al hacer transición.
 */
export interface RoomEnterData {
  spawnX?: number;
  spawnY?: number;
  /** Si es true, fuerza leer del SaveSystem (para "Continuar"). */
  fromSave?: boolean;
}

/**
 * Escena base para cualquier habitación. Subclases sobreescriben:
 *  - `roomId`
 *  - `decorateBackground` (props extras, niebla, etc.)
 */
export abstract class BaseRoomScene extends Phaser.Scene {
  abstract readonly roomId: RoomId;

  protected xavier!: Xavier;
  protected hotspots: Hotspot[] = [];
  protected roomDef!: RoomDef;

  private busy = false;
  private incomingData: RoomEnterData | undefined;

  constructor(sceneKey: string) {
    super(sceneKey);
  }

  init(data: RoomEnterData): void {
    this.incomingData = data;
  }

  create(): void {
    this.roomDef = ROOMS[this.roomId];

    // Fondo principal - estiramos la imagen pintada para ocupar 1920x1080 con filtro lineal.
    this.add
      .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, this.roomDef.bgTextureKey)
      .setDepth(DEPTH.BG)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    // Hook para subclases (props animados, niebla, etc.)
    this.decorateBackground();

    // Spawn de Xavier
    const savedData = SaveSystem.instance.getData();
    let spawnX = this.roomDef.defaultSpawn.x;
    let spawnY = this.roomDef.defaultSpawn.y;

    if (this.incomingData?.fromSave) {
      spawnX = savedData.xavier.x;
      spawnY = savedData.xavier.y;
    } else if (this.incomingData?.spawnX !== undefined && this.incomingData?.spawnY !== undefined) {
      spawnX = this.incomingData.spawnX;
      spawnY = this.incomingData.spawnY;
    }

    spawnY = this.clampWalkY(spawnY);

    this.xavier = new Xavier(this, spawnX, spawnY);

    // Asegura que UIScene está activa
    if (!this.scene.isActive(SCENE.UI)) {
      this.scene.launch(SCENE.UI);
    } else {
      this.scene.bringToTop(SCENE.UI);
    }

    // Hotspots (tras Xavier para que reciban clics aunque el sprite esté encima)
    this.buildHotspots();

    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);

    EventBus.on(EVT.FLAG_SET, this.onFlagSet, this);

    // Guarda al entrar
    SaveSystem.instance.setRoom(this.roomId, spawnX, spawnY);
    EventBus.emit(EVT.ROOM_ENTER, this.roomId);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);

    // Fade in desde negro para suavizar la transición.
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // Introducción automática la primera vez que se entra a la room.
    this.onFirstEnter();

    // Si tras entrar se cumple la condición de final, disparar diálogo final.
    this.checkEndGame();
  }

  protected decorateBackground(): void {
    /* override en subclases */
  }

  protected onFirstEnter(): void {
    /* override opcional - diálogo de entrada la primera vez. */
  }

  private buildHotspots(): void {
    for (const def of this.roomDef.hotspots) {
      if (this.isHotspotHidden(def)) continue;
      const hs = new Hotspot(this, def);
      hs.on('pointerdown', (pointer: Phaser.Input.Pointer, _lx: number, _ly: number, evt: Phaser.Types.Input.EventData) => {
        evt.stopPropagation();
        this.handleHotspotClick(hs);
      });
      hs.on('pointerover', () => {
        EventBus.emit(EVT.HOTSPOT_HOVER, def.label);
        if (def.cursor) EventBus.emit(EVT.CURSOR_SET, def.cursor);
      });
      hs.on('pointerout', () => {
        EventBus.emit(EVT.HOTSPOT_BLUR);
        EventBus.emit(EVT.CURSOR_SET, 'normal');
      });
      this.hotspots.push(hs);
    }
  }

  private isHotspotHidden(def: HotspotDef): boolean {
    if (def.hiddenIfFlag && SaveSystem.instance.hasFlag(def.hiddenIfFlag)) return true;
    if (def.onlyIfFlag && !SaveSystem.instance.hasFlag(def.onlyIfFlag)) return true;
    return false;
  }

  private refreshHotspots(): void {
    for (const hs of this.hotspots) {
      hs.destroy();
    }
    this.hotspots = [];
    this.buildHotspots();
  }

  private onFlagSet(): void {
    this.refreshHotspots();
    this.checkEndGame();
  }

  private onPointerMove(_pointer: Phaser.Input.Pointer): void {
    /* noop - reservado para lógicas futuras */
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.busy) return;
    if (DialogueSystem.instance.isActive) return;

    const wx = pointer.worldX;
    const wy = pointer.worldY;

    // Los slots/iconos del inventario son interactivos y capturan el clic; el
    // fondo de la barra no lo es, así que esos clics llegan aquí. Antes se
    // descartaba todo wy > 960 “por la UI”, pero el suelo del bar está ~970+,
    // dejando casi ninguna zona clicable. Solo ignoramos el borde inferior.
    if (wy > GAME_HEIGHT - 6) return;

    // Deselecciona item al clicar suelo vacío.
    if (InventorySystem.instance.getSelected()) {
      InventorySystem.instance.deselect();
    }

    const tx = Phaser.Math.Clamp(wx, 40, GAME_WIDTH - 40);
    const ty = this.clampWalkY(wy);

    this.xavier.walkTo(tx, ty, () => {
      SaveSystem.instance.updateXavierPos(this.xavier.x, this.xavier.y);
    });
  }

  private clampWalkY(y: number): number {
    const { top, bottom } = this.roomDef.walkableBounds;
    return Phaser.Math.Clamp(y, top, bottom);
  }

  private async handleHotspotClick(hs: Hotspot): Promise<void> {
    if (this.busy) return;
    if (DialogueSystem.instance.isActive) return;
    this.busy = true;

    const def = hs.def;
    const selectedItem = InventorySystem.instance.getSelected();
    let action: HotspotAction = def.action;

    if (selectedItem) {
      const itemAction = def.itemUse?.[selectedItem];
      if (itemAction) {
        action = itemAction;
      } else {
        // No hay combinación definida - diálogo genérico.
        InventorySystem.instance.deselect();
        await DialogueSystem.instance.say(DIALOGUES.generic.cantUseItem);
        this.busy = false;
        return;
      }
      InventorySystem.instance.deselect();
    }

    // Camina al punto de interacción.
    await this.xavier.walkToAsync(def.interactX, def.interactY);
    SaveSystem.instance.updateXavierPos(this.xavier.x, this.xavier.y);

    await this.executeAction(action);

    this.busy = false;
  }

  private async executeAction(action: HotspotAction): Promise<void> {
    switch (action.kind) {
      case 'dialogue': {
        this.xavier.setAnimState('talk');
        await DialogueSystem.instance.say(action.lines);
        this.xavier.setAnimState('idle');
        break;
      }
      case 'npc': {
        this.xavier.setAnimState('talk');
        await DialogueSystem.instance.say(action.lines);
        this.xavier.setAnimState('idle');
        if (action.setFlag) SaveSystem.instance.setFlag(action.setFlag);
        break;
      }
      case 'pickup': {
        if (InventorySystem.instance.has(action.item)) {
          if (action.alreadyDoneLines) {
            this.xavier.setAnimState('talk');
            await DialogueSystem.instance.say(action.alreadyDoneLines);
            this.xavier.setAnimState('idle');
          }
          break;
        }
        await this.xavier.performGrab();
        InventorySystem.instance.add(action.item);
        await DialogueSystem.instance.say(action.lines);
        if (action.setFlag) SaveSystem.instance.setFlag(action.setFlag);
        break;
      }
      case 'useItem': {
        await this.xavier.performGrab();
        if (action.consumesItem) {
          InventorySystem.instance.remove(action.item);
        }
        if (action.givesItem) {
          InventorySystem.instance.add(action.givesItem);
        }
        if (action.setFlag) SaveSystem.instance.setFlag(action.setFlag);
        await DialogueSystem.instance.say(action.lines);
        break;
      }
      case 'exit': {
        this.transitionTo(action.to, action.spawnX, action.spawnY);
        break;
      }
    }
  }

  private transitionTo(target: RoomId, spawnX: number, spawnY: number): void {
    const key = {
      muelle: SCENE.MUELLE,
      taberna: SCENE.TABERNA,
      callejon: SCENE.CALLEJON
    }[target];

    const cam = this.cameras.main;
    cam.fadeOut(300, 0, 0, 0);
    cam.once('camerafadeoutcomplete', () => {
      this.scene.start(key, { spawnX, spawnY } as RoomEnterData);
    });
  }

  private checkEndGame(): void {
    if (
      SaveSystem.instance.hasFlag('ectoplasma_recogido') &&
      !SaveSystem.instance.hasFlag('acto1_completo')
    ) {
      SaveSystem.instance.setFlag('acto1_completo');
      // Diálogo final tras un pequeño delay para no pisar el diálogo actual.
      this.time.delayedCall(500, async () => {
        while (DialogueSystem.instance.isActive) {
          await new Promise((r) => this.time.delayedCall(100, () => r(null)));
        }
        this.xavier.setAnimState('talk');
        await DialogueSystem.instance.say(DIALOGUES.generic.final);
        this.xavier.setAnimState('idle');
      });
    }
  }

  private cleanup(): void {
    this.input.off('pointerdown', this.onPointerDown, this);
    this.input.off('pointermove', this.onPointerMove, this);
    EventBus.off(EVT.FLAG_SET, this.onFlagSet, this);
    for (const hs of this.hotspots) hs.destroy();
    this.hotspots = [];
  }

  override update(_time: number, _delta: number): void {
    // Mantener cámara suave si en el futuro queremos scroll. Por ahora estática.
    if (this.xavier.isWalking()) {
      SaveSystem.instance.updateXavierPos(this.xavier.x, this.xavier.y);
    }
  }
}
