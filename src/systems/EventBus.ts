import * as Phaser from 'phaser';

/**
 * EventBus global singleton para desacoplar escenas (UI <-> rooms <-> sistemas).
 */
class EventBusClass extends Phaser.Events.EventEmitter {}

export const EventBus = new EventBusClass();
