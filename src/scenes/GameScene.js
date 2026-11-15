import Phaser from 'phaser';
import { SCENE } from './keys.js';
import { COLORS, CAMERA, DEBUG, GAME_HEIGHT, PARALLAX, SECRET_REVEAL_ALPHA, FINISH_DELAY_MS } from '../config.js';
import { TEX, DEFAULT_CHARACTER } from '../assets.js';
import { addText } from '../ui/text.js';
import VirtualInput from '../systems/Input.js';
import { createGameState, addPickup, finalTime } from '../systems/GameState.js';
import Audio from '../systems/Audio.js';
import Checkpoints from '../systems/Checkpoints.js';
import BossArena from '../systems/BossArena.js';
import Player from '../entities/Player.js';
import Collectible, { collectibleTypes } from '../entities/Collectible.js';
import { getLevel } from '../level/levels.js';
import { loadLevel, DEPTH } from '../level/LevelLoader.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super(SCENE.GAME);
  }

  init(data) {
    this.levelDef = getLevel(data?.levelId);
    this.characterId = data?.characterId ?? this.registry.get('characterId') ?? DEFAULT_CHARACTER;
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.sky);
    this.gameState = createGameState(this.levelDef.id);
    this.level = loadLevel(this, this.levelDef);

    this.controls = new VirtualInput(this);
    const { spawn } = this.level;
    this.player = new Player(this, spawn.x, spawn.y - 8, this.controls, this.characterId).setDepth(DEPTH.player);
    this.physics.add.collider(this.player, this.level.layers.ground);
    this.physics.add.overlap(this.player, this.level.hazards, () => this.player.die());

    this.checkpoints = new Checkpoints(this, this.level.checkpoints, this.player, this.gameState);
    this.spawnCollectibles();

    // Finish: reaching it completes the level unless `finishLocked` is set
    // (the boss holds it until he is beaten).
    this.finishLocked = false;
    if (this.level.finish) {
      const f = this.level.finish;
      this.finish = this.add.image(f.x, f.y, TEX.FINISH).setOrigin(0.5, 1).setDepth(DEPTH.props);
      const trigger = this.add.zone(f.x, GAME_HEIGHT / 2, 16, GAME_HEIGHT);
      this.physics.add.existing(trigger, true);
      this.physics.add.overlap(this.player, trigger, () => this.completeLevel());
    }

    // Boss: the Train Conductor guards the end zone and holds the finish.
    this.arena = null;
    if (this.level.boss && this.level.endZone) {
      this.arena = new BossArena(this, {
        zone: this.level.endZone,
        boss: this.level.boss,
        player: this.player,
        ground: this.level.layers.ground,
        levelWidth: this.level.width,
      });
      this.setFinishLocked(true);
      this.events.on('boss-reset', () => {
        this.inEndZone = false; // re-arm onEnterEndZone for the next attempt
      });
      this.events.on('boss-defeated', () => this.setFinishLocked(false));
    }

    const cam = this.cameras.main;
    cam.startFollow(this.player, true, CAMERA.lerp, CAMERA.lerp);
    cam.setDeadzone(CAMERA.deadzoneWidth, GAME_HEIGHT);

    this.inEndZone = false;
    this.inSecret = false;

    if (DEBUG) {
      this.debugText = addText(this, 4, 4, '', { color: '#1a1c2c' }).setScrollFactor(0).setDepth(1000);
    }

    // HUD and touch buttons run in their own scene on top of this one.
    this.scene.launch(SCENE.UI, { controls: this.controls, gameState: this.gameState });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scene.stop(SCENE.UI));
  }

  update(time, delta) {
    // Run clock: from level start to the finish, deaths included.
    if (!this.gameState.completed) this.gameState.elapsedMs += delta;
    this.controls.update();
    this.player.update(time, delta);
    this.arena?.update(time, delta);

    this.level.hills.tilePositionX = this.cameras.main.scrollX * PARALLAX.hillsFactor;
    this.updateSecrets();

    const { endZone } = this.level;
    // Fully inside (back edge past the zone edge), so the arena wall can close behind.
    const inside = endZone && this.player.body.left >= endZone.x + 2 && endZone.contains(this.player.x, this.player.y);
    if (inside && !this.inEndZone && !this.player.dead) {
      this.inEndZone = true;
      this.onEnterEndZone();
    }

    if (this.debugText) {
      const b = this.player.body;
      this.debugText.setText(
        `${this.player.moveState} x ${this.player.x.toFixed(0)} (col ${Math.floor(this.player.x / 16)}) ` +
          `vx ${b.velocity.x.toFixed(0)} vy ${b.velocity.y.toFixed(0)} cp ${this.gameState.checkpoint?.name ?? '-'}` +
          (this.arena ? ` boss ${this.arena.status}/${this.arena.boss.state} hp ${this.arena.boss.hp}` : ''),
      );
    }
  }

  spawnCollectibles() {
    this.collectibles = this.physics.add.staticGroup();
    for (const c of this.level.collectibles) {
      const def = collectibleTypes[c.type];
      if (!def) {
        if (import.meta.env.DEV) console.error(`Unknown collectible type "${c.type}"`);
        continue;
      }
      this.collectibles.add(new Collectible(this, c.x, c.y, c.type).setDepth(DEPTH.props));
      if (def.counts) this.gameState.coinsTotal += 1;
      else this.gameState.bonusesTotal += 1;
    }
    this.physics.add.overlap(this.player, this.collectibles, (_p, item) => this.onPickup(item));
  }

  onPickup(item) {
    if (this.player.dead || !item.collect()) return;
    addPickup(this.gameState, item.def);
    Audio.play(item.def.sound);
    this.events.emit('pickup', { type: item.type, def: item.def, x: item.x, y: item.y });
  }

  completeLevel() {
    const s = this.gameState;
    if (s.completed || this.finishLocked || this.player.dead) return;
    s.completed = true; // stops the clock
    this.controls.enabled = false; // the lad coasts to a stop
    Audio.play('finish');
    this.cameras.main.flash(200, 255, 241, 232);
    this.events.emit('level-complete', s);

    const result = { ...s, ...finalTime(s), characterId: this.characterId };
    this.time.delayedCall(FINISH_DELAY_MS, () => this.scene.start(SCENE.COMPLETE, result));
  }

  /** Fade the foreground (station canopy) while the player is in a secret area. */
  updateSecrets() {
    const inside = this.level.secrets.some((r) => r.contains(this.player.x, this.player.y));
    if (inside === this.inSecret) return;
    this.inSecret = inside;
    this.tweens.add({
      targets: this.level.layers.foreground,
      alpha: inside ? SECRET_REVEAL_ALPHA : 1,
      duration: 200,
    });
  }

  setFinishLocked(locked) {
    this.finishLocked = locked;
    this.finish?.setAlpha(locked ? 0.45 : 1);
  }

  /**
   * Called when the player enters the `end-zone` rectangle at Parkstone (and
   * again after each failed boss attempt): starts the Train Conductor fight.
   */
  onEnterEndZone() {
    this.arena?.start();
  }
}
