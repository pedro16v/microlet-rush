// Main gameplay. Generic and data-driven: everything specific to a stage comes
// from LEVELS[levelIndex]. Owns score/damage/distance/combo; delegates the
// vehicle to Player and spawning to Spawner. UIScene reads this.hud each frame.
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        // ALL per-run state lives here so restarts/next-level start clean.
        this.levelIndex = data.levelIndex || 0;
        this.level = LEVELS[this.levelIndex];
        this.vehicle = getVehicle(data.vehicleId);
        this.carriedScore = data.score || 0;

        this.score = this.carriedScore;
        this.damage = 0;
        this.maxDamage = 100;
        this.distance = 0;
        this.passengers = 0;

        this.gameSpeed = this.level.startSpeed;
        this.elapsed = 0;
        this.spawnTimer = 0;

        this.combo = 0; // chain count; multiplier applied = max(1, combo)
        this.comboTimer = 0;
        this.comboWindow = 3000;

        this.isGameOver = false;
        this.isComplete = false;

        this.hud = {};
    }

    create() {
        this.audio = this.registry.get('audio');
        this.save = this.registry.get('save');

        this.bounds = { top: GameConfig.ROAD_TOP_Y, bottom: GameConfig.ROAD_BOTTOM_Y };
        this.cameras.main.setBackgroundColor(this.level.theme.sky || '#000000');

        this._createBackground();

        // groups
        this.obstacles = this.physics.add.group();
        this.pickups = this.physics.add.group();

        // player + systems
        const startY = (this.bounds.top + this.bounds.bottom) / 2;
        this.player = new Player(this, 200, startY, this.vehicle, this.bounds);
        this.spawner = new Spawner(this, this.level, this.bounds);

        this._createParticles();

        // input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });
        this.input.keyboard.on('keydown-ESC', () => this._pause());
        this.input.keyboard.on('keydown-P', () => this._pause());

        // collisions
        this.physics.add.overlap(this.player.sprite, this.pickups, this._collectPickup, null, this);
        this.physics.add.overlap(this.player.sprite, this.obstacles, this._hitObstacle,
            (p, o) => !this.player.isInvulnerable(this.time.now) || this.player.isPowerupActive('pw_shield', this.time.now), this);

        // HUD
        this._updateHud();
        this.scene.launch('UIScene');

        // music
        this.audio.unlock();
        if (!this.audio.muted) this.audio.startMusic(this.level.musicScale, 300);
        this.audio.setMusicIntensity(1);

        // intro banner
        this._banner(this.level.name, this.level.subtitle);

        this.events.on('shutdown', this._onShutdown, this);
    }

    _createBackground() {
        const w = GameConfig.WIDTH;
        const roadTop = this.bounds.top;
        const roadH = this.bounds.bottom - this.bounds.top;
        this.bgLayers = [];

        this.level.theme.layers.forEach((def, i) => {
            let ts;
            if (def.mode === 'fill') {
                ts = this.add.tileSprite(w / 2, GameConfig.HEIGHT / 2, w, GameConfig.HEIGHT, def.key);
            } else if (def.mode === 'road') {
                ts = this.add.tileSprite(w / 2, this.bounds.bottom, w, roadH, def.key).setOrigin(0.5, 1);
                const th = ts.texture.source[0].height;
                ts.setTileScale(0.5, roadH / th);
            } else { // bottom
                const hgt = def.height || 200;
                ts = this.add.tileSprite(w / 2, roadTop, w, hgt, def.key).setOrigin(0.5, 1);
                const th = ts.texture.source[0].height;
                ts.setTileScale(0.5, hgt / th);
            }
            ts.setDepth(i);
            if (this.level.theme.tint && this.level.theme.tint !== 0xffffff) {
                ts.setTint(this.level.theme.tint);
            }
            this.bgLayers.push({ ts: ts, factor: def.factor });
        });
    }

    _createParticles() {
        this.exhaust = this.add.particles(0, 0, 'px', {
            lifespan: 380, speedX: { min: -60, max: -140 }, speedY: { min: -20, max: 20 },
            scale: { start: 2.2, end: 0 }, alpha: { start: 0.5, end: 0 },
            tint: 0x555555, frequency: 55, quantity: 1
        });
        this.exhaust.setDepth(5);
        this.exhaust.startFollow(this.player.sprite, -52, 12);

        this.sparks = this.add.particles(0, 0, 'px', {
            lifespan: 500, speed: { min: 60, max: 180 }, scale: { start: 3, end: 0 },
            alpha: { start: 1, end: 0 }, tint: [0xffe24d, 0xfff7b0], blendMode: 'ADD', emitting: false
        });
        this.sparks.setDepth(8);

        this.smoke = this.add.particles(0, 0, 'px', {
            lifespan: 650, speed: { min: 40, max: 150 }, scale: { start: 4, end: 0 },
            alpha: { start: 0.85, end: 0 }, tint: [0x888888, 0xffffff], emitting: false
        });
        this.smoke.setDepth(8);
    }

    update(time, delta) {
        if (this.isGameOver || this.isComplete) return;
        const dt = delta / 1000;
        this.elapsed += dt;

        // difficulty ramp
        this.gameSpeed = Math.min(this.level.maxSpeed, this.gameSpeed + this.level.speedRamp * dt);
        const boost = this.player.isPowerupActive('pw_boost', time) ? 1.5 : 1;
        const effSpeed = this.gameSpeed * boost;

        // parallax
        for (let i = 0; i < this.bgLayers.length; i++) {
            this.bgLayers[i].ts.tilePositionX += effSpeed * this.bgLayers[i].factor * dt;
        }

        // input -> player
        const input = {
            left: this.cursors.left.isDown || this.wasd.left.isDown,
            right: this.cursors.right.isDown || this.wasd.right.isDown,
            up: this.cursors.up.isDown || this.wasd.up.isDown,
            down: this.cursors.down.isDown || this.wasd.down.isDown
        };
        this.player.update(dt, input);

        // fuel
        this.player.consumeFuel(this.level.fuelDrain * dt);
        if (this.player.fuel <= 0) { this._gameOver('outOfFuel'); return; }

        // distance / goal
        this.distance += effSpeed * dt;

        // spawning
        const progress = this._goalProgress();
        this.spawnTimer += delta;
        const interval = Phaser.Math.Linear(this.level.spawnInterval.start, this.level.spawnInterval.min, progress);
        if (this.spawnTimer >= interval) {
            this.spawnTimer = 0;
            this.spawner.spawnObstacle(this.obstacles, effSpeed);
            if (Phaser.Math.Between(1, 100) <= 55) {
                this.spawner.spawnPickup(this.pickups, effSpeed);
            }
        }

        this.spawner.updateObstacles(this.obstacles, time);
        this._cleanup(this.obstacles);
        this._cleanup(this.pickups);

        // coin magnet
        if (this.player.isPowerupActive('pw_magnet', time)) this._applyMagnet();

        // combo decay
        if (this.combo > 0) {
            this.comboTimer -= delta;
            if (this.comboTimer <= 0) this.combo = 0;
        }

        // power-up expiry
        this.player.tickPowerups(time);

        // music tension scales with speed
        this.audio.setMusicIntensity(1 + (this.gameSpeed - this.level.startSpeed) / (this.level.maxSpeed - this.level.startSpeed) * 0.5);

        // goal complete?
        if (this._isGoalMet()) { this._levelComplete(); return; }

        this._updateHud();
    }

    _goalProgress() {
        const g = this.level.goal;
        if (g.type === 'distance') return Phaser.Math.Clamp(this.distance / g.distance, 0, 1);
        if (g.type === 'passengers') return Phaser.Math.Clamp(this.passengers / g.count, 0, 1);
        return Phaser.Math.Clamp(Math.min(this.distance / g.distance, this.passengers / g.count), 0, 1);
    }

    _isGoalMet() {
        const g = this.level.goal;
        if (g.type === 'distance') return this.distance >= g.distance;
        if (g.type === 'passengers') return this.passengers >= g.count;
        return this.distance >= g.distance && this.passengers >= g.count;
    }

    _goalLabel() {
        const g = this.level.goal;
        if (g.type === 'passengers') return 'Passengers ' + this.passengers + '/' + g.count;
        if (g.type === 'both') return Math.floor(this.distance) + '/' + g.distance + ' m  •  ' + this.passengers + '/' + g.count + ' pax';
        return Math.floor(this.distance) + ' / ' + g.distance + ' m';
    }

    _cleanup(group) {
        group.children.iterate(function (o) {
            if (o && o.x < -90) o.destroy();
        });
    }

    _applyMagnet() {
        const px = this.player.x;
        const py = this.player.y;
        this.pickups.children.iterate(function (p) {
            if (!p || p.getData('power')) return;
            const d = Phaser.Math.Distance.Between(px, py, p.x, p.y);
            if (d < 220) {
                p.x = Phaser.Math.Linear(p.x, px, 0.12);
                p.y = Phaser.Math.Linear(p.y, py, 0.12);
            }
        });
    }

    _collectPickup(playerSprite, pickup) {
        const key = pickup.getData('key');
        const time = this.time.now;
        pickup.destroy();

        if (pickup.getData('power')) {
            this._activatePower(key, time);
            return;
        }

        if (key === 'coin') {
            this._bumpCombo();
            const pts = 10 * this.combo;
            this.score += pts;
            this.sparks.explode(12, pickup.x, pickup.y);
            this.audio.sfx('coin');
            this._popup(pickup.x, pickup.y, '+' + pts, this.combo > 1 ? '#ffe24d' : '#ffffff');
        } else if (key === 'passenger') {
            this._bumpCombo();
            this.passengers += 1;
            const pts = 25 * this.combo;
            this.score += pts;
            this.sparks.explode(16, pickup.x, pickup.y);
            this.audio.sfx('passenger');
            this._popup(pickup.x, pickup.y, 'PAX +' + pts, '#7be06b');
        } else if (key === 'fuel') {
            this.player.refuel(35);
            this.score += 5;
            this.audio.sfx('fuel');
            this._popup(pickup.x, pickup.y, 'FUEL', '#4ec3ff');
        }
        this._updateHud();
    }

    _activatePower(key, time) {
        const durations = { pw_shield: 6000, pw_boost: 5000, pw_magnet: 6000 };
        this.player.activatePowerup(key, time, durations[key] || 5000);
        if (key === 'pw_boost') {
            this.audio.sfx('powerup');
            this.cameras.main.flash(180, 255, 200, 80);
            this._popup(this.player.x, this.player.y - 40, 'BOOST!', '#ff7a3d');
        } else if (key === 'pw_shield') {
            this.audio.sfx('shield');
            this._popup(this.player.x, this.player.y - 40, 'SHIELD!', '#4ec3ff');
        } else {
            this.audio.sfx('powerup');
            this._popup(this.player.x, this.player.y - 40, 'MAGNET!', '#ff4d6d');
        }
    }

    _hitObstacle(playerSprite, obstacle) {
        const time = this.time.now;

        // shield absorbs the hit
        if (this.player.isPowerupActive('pw_shield', time)) {
            this.smoke.explode(10, obstacle.x, obstacle.y);
            this.audio.sfx('shield');
            obstacle.destroy();
            return;
        }
        if (this.player.isInvulnerable(time)) return;

        const dmg = this.player.applyDamage(obstacle.getData('dmg') || 12);
        this.damage = Math.min(this.maxDamage, this.damage + dmg);
        this.combo = 0;
        obstacle.destroy();

        // juice
        this.cameras.main.shake(220, 0.012 + dmg * 0.0004);
        this.smoke.explode(18, this.player.x, this.player.y);
        this.audio.sfx('hit');
        this.player.grantInvuln(time, 900);
        this._flashPlayer();
        this.gameSpeed = Math.max(this.level.startSpeed * 0.8, this.gameSpeed - 30);

        this._updateHud();
        if (this.damage >= this.maxDamage) this._gameOver('crash');
    }

    _flashPlayer() {
        const s = this.player.sprite;
        s.setTintFill(0xffffff);
        this.time.delayedCall(70, () => s.clearTint());
        this.tweens.add({ targets: s, alpha: 0.3, duration: 90, yoyo: true, repeat: 4,
            onComplete: () => s.setAlpha(1) });
    }

    _bumpCombo() {
        this.combo = Math.min(8, this.combo + 1);
        this.comboTimer = this.comboWindow;
        if (this.combo > 1) this.events.emit('comboPop', this.combo);
    }

    _popup(x, y, text, color) {
        const t = this.add.text(x, y, text, {
            fontSize: '22px', fontStyle: 'bold', color: color || '#ffffff',
            stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(9);
        this.tweens.add({ targets: t, y: y - 50, alpha: 0, duration: 800, ease: 'Cubic.out',
            onComplete: () => t.destroy() });
    }

    _banner(title, subtitle) {
        const w = GameConfig.WIDTH;
        const c = this.add.container(w / 2, 150).setDepth(20);
        const t1 = this.add.text(0, 0, title, { fontSize: '46px', fontStyle: 'bold', color: '#ffd34d', stroke: '#000', strokeThickness: 6 }).setOrigin(0.5);
        const t2 = this.add.text(0, 44, subtitle, { fontSize: '22px', fontStyle: 'italic', color: '#ffffff', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5);
        c.add([t1, t2]);
        c.setScale(0.6); c.setAlpha(0);
        this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 400, ease: 'Back.out' });
        this.tweens.add({ targets: c, alpha: 0, delay: 1800, duration: 500, onComplete: () => c.destroy() });
    }

    _updateHud() {
        this.hud = {
            score: this.score,
            highScore: this.save.getTopScore(),
            healthFrac: 1 - this.damage / this.maxDamage,
            fuelFrac: this.player.fuel / this.player.fuelMax,
            combo: this.combo,
            levelName: this.level.name,
            levelIndex: this.levelIndex,
            goalLabel: this._goalLabel(),
            goalFrac: this._goalProgress(),
            powerups: this._activePowerups()
        };
    }

    _activePowerups() {
        const time = this.time.now;
        const durs = { pw_shield: 6000, pw_boost: 5000, pw_magnet: 6000 };
        const out = [];
        POWERUP_KEYS.forEach((k) => {
            if (this.player.isPowerupActive(k, time)) {
                out.push({ key: k, frac: this.player.powerupRemaining(k, time) / durs[k] });
            }
        });
        return out;
    }

    _pause() {
        if (this.isGameOver || this.isComplete) return;
        this.scene.pause();
        this.scene.pause('UIScene');
        this.audio.stopMusic();
        this.scene.launch('PauseScene', { from: 'GameScene' });
    }

    _gameOver(reason) {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.player.sprite.body.setVelocity(0);
        this.audio.stopMusic();
        this.audio.sfx('gameover');
        this.cameras.main.flash(250, 120, 0, 0);
        this.cameras.main.shake(400, 0.02);
        this.player.sprite.setTint(0xff5555);

        this.save.recordLevelBest(this.level.id, this.score);

        this.time.delayedCall(1000, () => {
            this.scene.stop('UIScene');
            this.scene.start('GameOverScene', {
                score: this.score, levelIndex: this.levelIndex,
                vehicleId: this.vehicle.id, reason: reason
            });
        });
    }

    _levelComplete() {
        if (this.isComplete) return;
        this.isComplete = true;
        this.player.sprite.body.setVelocity(0);
        this.audio.stopMusic();
        this.audio.sfx('levelup');
        this.cameras.main.flash(300, 255, 230, 120);

        this.save.recordLevelBest(this.level.id, this.score);
        this.save.unlockLevel(this.levelIndex + 1);

        this.time.delayedCall(900, () => {
            this.scene.stop('UIScene');
            this.scene.start('LevelCompleteScene', {
                levelIndex: this.levelIndex, vehicleId: this.vehicle.id,
                score: this.score, passengers: this.passengers,
                distance: Math.floor(this.distance)
            });
        });
    }

    _onShutdown() {
        this.audio.stopMusic();
    }
}
