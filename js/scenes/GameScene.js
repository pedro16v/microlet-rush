class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.lanesY = [];
    this.player = null;
    this.cursors = null;
    this.swipe = { startX: 0, startY: 0, active: false };
    this.score = 0;
    this.lives = 3;
    this.targetKey = 'microlet_silver';
    this.laneCar = [null, null, null];
    this.speedMultiplier = 1.0; // Microlet speed ramp (player speed unchanged)
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    // Background composition per design
    const buildingsH = h * 0.35;
    const sidewalkH = h * 0.12;
    const roadTop = buildingsH;
    const roadBottom = h - sidewalkH;
    const roadH = Math.max(10, roadBottom - roadTop);

    // Far background: buildings at the top
    this.add.image(w / 2, 0, 'buildings')
      .setOrigin(0.5, 0)
      .setDisplaySize(w, buildingsH)
      .setDepth(0);
    // Road area filling the middle where lanes reside
    this.add.image(w / 2, roadTop, 'road')
      .setOrigin(0.5, 0)
      .setDisplaySize(w, roadH)
      .setDepth(1);
    // Sidewalk strip at the very bottom
    this.add.image(w / 2, h, 'roadside')
      .setOrigin(0.5, 1)
      .setDisplaySize(w, sidewalkH)
      .setDepth(2);

    // Lanes positions derived from road area
    const sidewalkY = h - sidewalkH * 0.5;
    // Evenly distributed lane centers with equal top/bottom margins
    this.lanesY = [1/6, 0.5, 5/6].map((t) => roadTop + roadH * t);

    // Player (passenger character). Scale to ~7.7% of screen height (~10% larger)
    this.player = this.physics.add.image(w * 0.5, sidewalkY, 'pickup_pass')
      .setDepth(10)
      .setCollideWorldBounds(true)
      .setImmovable(true);
    this.scaleToDisplayHeight(this.player, h * 0.077);
    this.setBodyFraction(this.player, 0.6);

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.addPointer(2);
    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointerup', this.onPointerUp, this);

    // Traffic group
    this.traffic = this.physics.add.group();

    // Collisions
    this.physics.add.overlap(this.player, this.traffic, this.onHit, null, this);

    // Spawners
    this.time.addEvent({ delay: 900, loop: true, callback: () => this.spawnCar(0) });
    this.time.addEvent({ delay: 1100, loop: true, callback: () => this.spawnCar(1) });
    this.time.addEvent({ delay: 1400, loop: true, callback: () => this.spawnCar(2) });

    // Target + HUD wiring
    this.microletKeys = ['microlet_silver', 'microlet_esperansa', 'microlet_kuitadu', 'microlet_realize'];
    this.pickNewTarget();
    this.updateHUD();
  }

  onPointerDown(pointer) {
    this.swipe.startX = pointer.x;
    this.swipe.startY = pointer.y;
    this.swipe.active = true;
  }

  onPointerUp(pointer) {
    if (!this.swipe.active) return;
    this.swipe.active = false;
    const dx = pointer.x - this.swipe.startX;
    const dy = pointer.y - this.swipe.startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const threshold = 24; // px
    if (absX < threshold && absY < threshold) return;
    if (absX > absY) {
      if (dx > 0) this.moveRight(); else this.moveLeft();
    } else {
      if (dy < 0) this.moveUp(); else this.moveDown();
    }
  }

  update() {
    // Keyboard fallback
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) this.moveLeft();
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) this.moveRight();
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) this.moveUp();
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) this.moveDown();

    // Recycle off-screen cars
    this.traffic.children.iterate((car) => {
      if (!car) return;
      if (car.x < -100 || car.x > this.scale.width + 100) {
        // Free lane slot then destroy
        const laneIndex = car.laneIndex;
        if (laneIndex !== undefined && this.laneCar[laneIndex] === car) {
          this.laneCar[laneIndex] = null;
        }
        car.destroy();
      }
    });
  }

  moveLeft() { this.player.x = Math.max(32, this.player.x - 48); }
  moveRight() { this.player.x = Math.min(this.scale.width - 32, this.player.x + 48); }
  moveUp() {
    // Move from sidewalk into lanes, or between lanes
    const y = this.player.y;
    const targets = [this.lanesY[2], this.lanesY[1], this.lanesY[0]]; // move upward toward smaller index
    for (let i = 0; i < targets.length; i++) {
      if (y > targets[i] + 2) {
        this.player.y = targets[i];
        return;
      }
    }
  }
  moveDown() {
    const sidewalkH = this.scale.height * 0.12;
    const sidewalkY = this.scale.height - sidewalkH * 0.5;
    const y = this.player.y;
    const targets = [this.lanesY[0], this.lanesY[1], this.lanesY[2], sidewalkY];
    for (let i = 0; i < targets.length; i++) {
      if (y < targets[i] - 2) { this.player.y = targets[i]; return; }
    }
  }

  spawnCar(laneIndex) {
    // Enforce one microlet per lane
    if (this.laneCar[laneIndex]) return;
    const laneY = this.lanesY[laneIndex];
    const fromLeft = Math.random() < 0.5;
    const x = fromLeft ? -40 : this.scale.width + 40;
    const key = this.microletKeys[Math.floor(Math.random() * this.microletKeys.length)];
    const car = this.traffic.create(x, laneY, key).setDepth(5);
    // Microlet scaled to ~16% of screen height (twice previous)
    this.scaleToDisplayHeight(car, this.scale.height * 0.16);
    this.setBodyFraction(car, 0.65);
    const baseSpeed = [120, 160, 220][laneIndex] * this.speedMultiplier;
    car.setVelocityX(fromLeft ? baseSpeed : -baseSpeed);
    // Flip horizontally when moving right -> left so it faces the direction of travel
    car.setFlipX(!fromLeft);
    car.laneIndex = laneIndex;
    this.laneCar[laneIndex] = car;
  }

  onHit(player, car) {
    if (!car.active) return;
    if (car.texture.key === this.targetKey) {
      const laneIndex = car.laneIndex;
      const lanePoints = [1, 2, 5][laneIndex] || 1; // bottom=1, middle=2, top=5
      this.addPoints(lanePoints);
      MRSound.play(this, 'sfx_capture');
      // Increase microlet speed by 5% for future spawns
      this.speedMultiplier *= 1.05;
      if (this.laneCar[laneIndex] === car) this.laneCar[laneIndex] = null;
      car.destroy();
      this.pickNewTarget();
      this.updateHUD();
      this.resetPlayer();
    } else {
      this.lives -= 1;
      MRSound.play(this, 'sfx_hit');
      this.flashHit();
      this.resetPlayer();
      if (this.lives <= 0) this.gameOver();
      this.updateHUD();
    }
  }

  flashHit() {
    const f = this.add.rectangle(0, 0, this.scale.width*2, this.scale.height*2, 0xff0000, 0.35)
      .setOrigin(0,0).setDepth(1000);
    this.tweens.add({ targets: f, alpha: 0, duration: 350, onComplete: () => f.destroy() });
    const txt = this.add.text(this.scale.width/2, this.scale.height/2, 'Maromak!!', {
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial',
      fontSize: 48,
      fontStyle: 'bold',
      color: '#ffd34d',
      stroke: '#000',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(1001);
    this.tweens.add({ targets: txt, alpha: 0, duration: 600, onComplete: () => txt.destroy() });
  }

  resetPlayer() {
    this.player.x = this.scale.width * 0.5;
    const sidewalkH = this.scale.height * 0.12;
    this.player.y = this.scale.height - sidewalkH * 0.5;
  }

  gameOver() {
    this.scene.pause();
    const w = this.scale.width; const h = this.scale.height;
    const overlay = this.add.rectangle(0, 0, w*2, h*2, 0x000000, 0.7)
      .setOrigin(0,0).setDepth(999);

    // Classic scoreboard panel
    const panelW = Math.min(360, w * 0.9);
    const panelH = 220;
    const panelX = (w - panelW) / 2;
    const panelY = (h - panelH) / 2;
    const panel = this.add.rectangle(panelX, panelY, panelW, panelH, 0x111111, 1)
      .setOrigin(0,0).setDepth(1000);
    const border = this.add.rectangle(panelX - 4, panelY - 4, panelW + 8, panelH + 8, 0xffffff, 1)
      .setOrigin(0,0).setDepth(1000);

    const title = this.add.text(w/2, panelY + 24, 'GAME OVER', {
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial',
      fontSize: 28,
      fontStyle: 'bold',
      color: '#ffd34d',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(1001);

    // Scores
    const bestKey = 'mr_best_score';
    const prevBest = parseInt(localStorage.getItem(bestKey) || '0', 10);
    const best = Math.max(prevBest, this.score);
    localStorage.setItem(bestKey, String(best));

    this.add.text(w/2, panelY + 80, `Score: ${this.score}`, {
      fontFamily: 'system-ui, -apple-system, Segoe UI', fontSize: 22, color: '#ffffff'
    }).setOrigin(0.5).setDepth(1001);
    this.add.text(w/2, panelY + 114, `Best: ${best}`, {
      fontFamily: 'system-ui, -apple-system, Segoe UI', fontSize: 20, color: '#9ad3ff'
    }).setOrigin(0.5).setDepth(1001);

    const again = this.add.text(w/2, panelY + 168, 'Tap to Play Again', {
      fontFamily: 'system-ui, -apple-system, Segoe UI', fontSize: 18, color: '#ffd34d'
    }).setOrigin(0.5).setDepth(1001).setInteractive({ useHandCursor: true });
    again.on('pointerdown', () => { window.location.reload(); });

    // Leaderboard view (local fallback)
    MRLeaderboard.top(10).then((rows) => {
      const startY = panelY + 200; // below button
      const baseY = panelY + 140; // within panel space
      const limit = Math.min(5, rows.length);
      for (let i = 0; i < limit; i++) {
        const r = rows[i];
        this.add.text(panelX + 16, baseY + i * 18, `${i+1}. ${r.name}`.padEnd(14, ' '), { fontFamily: 'system-ui, -apple-system, Segoe UI', fontSize: 14, color: '#ffffff' }).setDepth(1001);
        this.add.text(panelX + panelW - 20, baseY + i * 18, `${r.score}`, { fontFamily: 'system-ui, -apple-system, Segoe UI', fontSize: 14, color: '#9ad3ff' }).setOrigin(1,0).setDepth(1001);
      }
    });

    // Submit my score
    const name = this.game.playerName || 'Player';
    MRLeaderboard.submit(name, this.score);
  }

  updateHUD() {
    const scoreEl = document.getElementById('hud-score');
    const livesEl = document.getElementById('hud-lives');
    const targetEl = document.getElementById('hud-target');
    const targetImg = document.getElementById('hud-target-img');
    if (scoreEl) scoreEl.textContent = `Score: ${this.score}`;
    if (livesEl) livesEl.textContent = `Lives: ${this.lives}`;
    if (targetEl && targetImg) {
      const keyToPath = {
        microlet_silver: 'sprites/microlets/silver_omega.png',
        microlet_esperansa: 'sprites/microlets/esperansa.png',
        microlet_kuitadu: 'sprites/microlets/kuitadu.png',
        microlet_realize: 'sprites/microlets/realize_dream.png',
      };
      targetImg.src = keyToPath[this.targetKey];
    }
  }

  pickNewTarget() {
    this.targetKey = this.microletKeys[Math.floor(Math.random() * this.microletKeys.length)];
  }

  addPoints(amount) {
    this.score += amount;
    this.updateHUD();
    const float = this.add.text(this.player.x, this.player.y - 24, `+${amount}`, {
      fontFamily: 'system-ui, -apple-system, Segoe UI', fontSize: 18, color: '#7CFC00', stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(1000);
    this.tweens.add({ targets: float, y: float.y - 24, alpha: 0, duration: 700, onComplete: () => float.destroy() });
  }

  // Helpers
  scaleToDisplayHeight(gameObject, targetHeightPx) {
    const sourceHeight = gameObject.height || 1;
    const scale = targetHeightPx / sourceHeight;
    gameObject.setScale(scale);
    return scale;
  }

  setBodyFraction(gameObject, fraction = 0.7) {
    const frameW = gameObject.width;
    const frameH = gameObject.height;
    const bw = Math.max(4, frameW * fraction);
    const bh = Math.max(4, frameH * fraction);
    gameObject.body.setSize(bw, bh);
    gameObject.body.setOffset((frameW - bw) / 2, (frameH - bh) / 2);
  }
}

window.GameScene = GameScene;


