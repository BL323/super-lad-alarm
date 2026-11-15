import Phaser from 'phaser';
import { BOSS, CAMERA, GAME_HEIGHT } from '../config.js';
import { TEX } from '../assets.js';
import Conductor, { BossState } from '../entities/Conductor.js';
import { DEPTH } from '../level/LevelLoader.js';

// The Train Conductor fight in the Parkstone end zone.
//
// Entering the zone starts it: the camera pans to and locks on the arena, a
// wall closes behind the player, and he begins after a short intro. Tickets
// land where their floor markers show. Dying resets the whole encounter (he's
// back to full health, the wall opens, the camera follows again) and the
// player walks back in from the Parkstone checkpoint. Three stomps while he's
// dizzy beat him and unlock the finish.
export default class BossArena {
  /**
   * @param {Phaser.Scene} scene GameScene
   * @param {{ zone: Phaser.Geom.Rectangle, boss: { x: number, y: number }, player, ground, levelWidth: number }} opts
   */
  constructor(scene, { zone, boss, player, ground, levelWidth }) {
    this.scene = scene;
    this.zone = zone;
    this.player = player;
    this.levelWidth = levelWidth;
    this.floorY = boss.y;
    this.status = 'idle'; // idle | intro | fighting | won

    // Wall that closes behind the player once the fight starts.
    this.wall = scene.add.zone(zone.x - 4, GAME_HEIGHT / 2, 8, GAME_HEIGHT);
    scene.physics.add.existing(this.wall, true);
    this.wall.body.enable = false;

    this.tickets = scene.physics.add.group({ allowGravity: true });

    this.boss = new Conductor(
      scene,
      boss,
      { left: zone.x, right: zone.right, floorY: boss.y },
      () => player,
      (x, y, tx) => this.throwTicket(x, y, tx),
    ).setDepth(DEPTH.player - 1);

    const physics = scene.physics.add;
    physics.collider(this.boss, ground);
    physics.collider(this.boss, this.wall);
    physics.collider(player, this.wall);
    physics.overlap(player, this.boss, () => this.onTouchBoss());
    physics.overlap(player, this.tickets, () => {
      if (this.isActive) player.die();
    });

    // Dying anywhere during the fight resets it.
    player.on('died', () => {
      if (this.isActive) this.reset();
    });
  }

  get isActive() {
    return this.status === 'intro' || this.status === 'fighting';
  }

  /** Called by GameScene.onEnterEndZone(). */
  start() {
    if (this.status !== 'idle') return;
    this.status = 'intro';
    this.wall.body.enable = true;

    const cam = this.scene.cameras.main;
    cam.stopFollow();
    cam.pan(this.zone.centerX, GAME_HEIGHT / 2, 500, 'Sine.easeInOut', false, (_c, progress) => {
      if (progress < 1 || this.status === 'idle') return;
      cam.setBounds(this.zone.x, 0, this.zone.width, GAME_HEIGHT);
      cam.startFollow(this.player, true, CAMERA.lerp, CAMERA.lerp);
    });

    this.boss.begin();
    this.status = 'fighting';
    this.scene.events.emit('boss-start', { hits: BOSS.hits });
  }

  reset() {
    this.status = 'idle';
    this.wall.body.enable = false;
    this.clearTickets();
    this.boss.reset();

    const cam = this.scene.cameras.main;
    cam.panEffect.reset();
    cam.setBounds(0, 0, this.levelWidth, GAME_HEIGHT);
    cam.startFollow(this.player, true, CAMERA.lerp, CAMERA.lerp);
    this.scene.events.emit('boss-reset');
  }

  update(time, delta) {
    this.boss.update(time, delta);
    for (const t of this.tickets.getChildren()) {
      if (t.y >= this.floorY - 2) this.landTicket(t);
    }
  }

  onTouchBoss() {
    const p = this.player;
    const boss = this.boss;
    if (p.dead || !this.isActive) return;

    // From above = the player's feet were above his cap last step and falling.
    const prevBottom = p.body.prev.y + p.body.height;
    const fromAbove = p.body.velocity.y >= 0 && prevBottom <= boss.body.top + 6;

    if (fromAbove) {
      if (boss.isVulnerable) {
        p.bounce(BOSS.stompBounce);
        this.scene.events.emit('boss-hit', { hp: boss.hp - 1 });
        if (boss.takeHit()) this.win();
      } else if (boss.state !== BossState.HURT && boss.state !== BossState.DEFEATED) {
        p.bounce(BOSS.stompBounce * 0.8); // harmless bounce off his cap
      }
      return;
    }
    if (boss.isHarmful) p.die();
  }

  win() {
    this.status = 'won';
    this.clearTickets();
    this.wall.body.enable = false;
    this.scene.cameras.main.flash(250, 255, 236, 39);
    this.boss.exit(() => this.boss.setVisible(false));
    this.scene.events.emit('boss-defeated');
  }

  // --- Tickets ---------------------------------------------------------------

  /** Lob a ticket from (x, y) so it lands on the floor at targetX after ticketFlightMs. */
  throwTicket(x, y, targetX) {
    const tx = Phaser.Math.Clamp(targetX, this.zone.x + 8, this.zone.right - 8);
    const T = BOSS.ticketFlightMs / 1000;
    const g = this.scene.physics.world.gravity.y;
    const vy = (this.floorY - 2 - y - 0.5 * g * T * T) / T;
    const vx = (tx - x) / T;

    const marker = this.scene.add
      .image(tx, this.floorY, TEX.TICKET_MARKER)
      .setOrigin(0.5, 1)
      .setAlpha(0.25)
      .setDepth(DEPTH.props);
    this.scene.tweens.add({ targets: marker, alpha: 0.6, duration: 200, yoyo: true, repeat: -1 });

    const ticket = this.tickets.create(x, y, TEX.TICKET).setDepth(DEPTH.player + 1);
    ticket.body.setSize(8, 5).setVelocity(vx, vy);
    ticket.setAngularVelocity(vx > 0 ? 540 : -540);
    ticket.marker = marker;
  }

  landTicket(ticket) {
    ticket.marker?.destroy();
    const { x } = ticket;
    ticket.destroy();
    const puff = this.scene.add.image(x, this.floorY - 2, TEX.TICKET).setDepth(DEPTH.props).setAngle(Phaser.Math.Between(-20, 20));
    this.scene.tweens.add({ targets: puff, alpha: 0, y: puff.y - 4, duration: 300, onComplete: () => puff.destroy() });
  }

  clearTickets() {
    for (const t of [...this.tickets.getChildren()]) {
      t.marker?.destroy();
      t.destroy();
    }
  }
}
