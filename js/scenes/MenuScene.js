// Title screen: animated parallax backdrop, Play, high score, mute toggle.
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const w = GameConfig.WIDTH;
        const h = GameConfig.HEIGHT;
        this.audio = this.registry.get('audio');
        this.save = this.registry.get('save');

        // animated backdrop (reuse level 1 art)
        this.sky = this.add.tileSprite(w / 2, h / 2, w, h, 'bg_sky');
        this.mountains = this.add.tileSprite(w / 2, 300, w, 230, 'bg_mountains').setOrigin(0.5, 1);
        this.buildings = this.add.tileSprite(w / 2, 300, w, 200, 'bg_buildings').setOrigin(0.5, 1);
        this.road = this.add.tileSprite(w / 2, h, w, 300, 'road').setOrigin(0.5, 1);
        this.add.rectangle(w / 2, h / 2, w, h, 0x000022, 0.25);

        // a microlet cruising across the menu
        this.car = this.add.image(w / 2, h - 120, 'microlet_silver').setDisplaySize(160, 80);
        this.tweens.add({ targets: this.car, y: this.car.y - 12, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

        // title
        const title = this.add.text(w / 2, 130, 'MICROLET RUSH', {
            fontSize: '60px', fontStyle: 'bold', color: '#ffd34d',
            stroke: '#5a2d00', strokeThickness: 8
        }).setOrigin(0.5);
        this.add.text(w / 2, 178, 'Timor Streets', {
            fontSize: '26px', fontStyle: 'italic', color: '#ffffff',
            stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);
        this.tweens.add({ targets: title, scale: 1.04, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

        // buttons
        this._button(w / 2, 268, 'PLAY', () => this._start());
        this._button(w / 2, 326, 'LEADERBOARD', () => { this.audio.sfx('click'); this.scene.start('LeaderboardScene'); });
        this._button(w / 2, 384, 'CONTROLS', () => this._toggleHelp());

        // high score
        const top = this.save.getTopScore();
        this.add.text(w / 2, 432, 'HIGH SCORE: ' + top, {
            fontSize: '22px', color: '#ffffff', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5);

        // mute toggle
        this.muteText = this.add.text(w - 16, 16, '', { fontSize: '20px', color: '#ffffff' })
            .setOrigin(1, 0).setInteractive({ useHandCursor: true });
        this._refreshMute();
        this.muteText.on('pointerdown', () => { this.audio.unlock(); this.audio.toggleMute(); this._refreshMute(); });
        this.input.keyboard.on('keydown-M', () => { this.audio.toggleMute(); this._refreshMute(); });

        // help overlay (hidden)
        this.help = this.add.container(0, 0).setVisible(false);
        const panel = this.add.rectangle(w / 2, h / 2, 460, 260, 0x000000, 0.85).setStrokeStyle(2, 0xffd34d);
        const helpText = this.add.text(w / 2, h / 2,
            '← →   steer left / right\n' +
            '↑ ↓   move near / far\n' +
            'Touch: drag to steer\n' +
            'ESC / P   pause\n\n' +
            'Collect coins & passengers.\n' +
            'Grab fuel before you run dry.\n' +
            'Dodge potholes and taxis!',
            { fontSize: '20px', color: '#ffffff', align: 'center', lineSpacing: 6 }).setOrigin(0.5);
        this.help.add([panel, helpText]);

        // input to start
        this.input.keyboard.on('keydown-ENTER', () => this._start());
        this.input.keyboard.on('keydown-SPACE', () => this._start());

        // start menu music on first gesture
        this.input.once('pointerdown', () => this._kickAudio());
        this.input.keyboard.once('keydown', () => this._kickAudio());
    }

    _kickAudio() {
        if (this._starting) return; // don't start music if we're leaving the menu
        this.audio.unlock();
        if (!this.audio.muted) this.audio.startMusic(LEVELS[0].musicScale, 360);
    }

    _refreshMute() {
        this.muteText.setText(this.audio.muted ? '🔇 muted (M)' : '🔊 sound (M)');
    }

    _toggleHelp() {
        this.audio.sfx('click');
        this.help.setVisible(!this.help.visible);
    }

    _button(x, y, label, onClick) {
        const bg = this.add.rectangle(x, y, 260, 52, 0x222244, 0.9).setStrokeStyle(3, 0xffd34d);
        const txt = this.add.text(x, y, label, { fontSize: '28px', fontStyle: 'bold', color: '#ffd34d' }).setOrigin(0.5);
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerover', () => { bg.setFillStyle(0x3a3a66, 1); txt.setScale(1.06); });
        bg.on('pointerout', () => { bg.setFillStyle(0x222244, 0.9); txt.setScale(1); });
        bg.on('pointerdown', () => { this.audio.unlock(); this.audio.sfx('click'); onClick(); });
        return bg;
    }

    _start() {
        if (this._starting) return;
        this._starting = true;
        this.audio.unlock();
        this.audio.stopMusic();
        this.scene.start('VehicleSelectScene');
    }

    update(time, delta) {
        const d = delta / 1000;
        this.sky.tilePositionX += 8 * d;
        this.mountains.tilePositionX += 20 * d;
        this.buildings.tilePositionX += 60 * d;
        this.road.tilePositionX += 200 * d;
    }
}
