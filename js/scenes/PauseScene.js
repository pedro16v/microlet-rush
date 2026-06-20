// Transparent overlay shown while GameScene is paused.
class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    create() {
        const w = GameConfig.WIDTH;
        const h = GameConfig.HEIGHT;
        this.audio = this.registry.get('audio');
        this.gameScene = this.scene.get('GameScene');

        this.add.rectangle(w / 2, h / 2, w, h, 0x000010, 0.7);
        this.add.text(w / 2, 140, 'PAUSED', {
            fontSize: '56px', fontStyle: 'bold', color: '#ffd34d', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5);

        this._button(w / 2, 250, 'RESUME', () => this._resume());
        this._button(w / 2, 314, 'RESTART', () => this._restart());
        this._button(w / 2, 378, 'MAIN MENU', () => this._menu());

        this.muteText = this.add.text(w / 2, 450, '', { fontSize: '20px', color: '#ffffff' })
            .setOrigin(0.5).setInteractive({ useHandCursor: true });
        this._refreshMute();
        this.muteText.on('pointerdown', () => { this.audio.toggleMute(); this._refreshMute(); });

        this.input.keyboard.on('keydown-ESC', () => this._resume());
        this.input.keyboard.on('keydown-P', () => this._resume());
        this.input.keyboard.on('keydown-M', () => { this.audio.toggleMute(); this._refreshMute(); });
    }

    _refreshMute() {
        this.muteText.setText(this.audio.muted ? '🔇 muted (M)' : '🔊 sound (M)');
    }

    _resume() {
        this.scene.resume('GameScene');
        this.scene.resume('UIScene');
        if (!this.audio.muted) this.audio.startMusic(this.gameScene.level.musicScale, 300);
        this.scene.stop();
    }

    _restart() {
        const gs = this.gameScene;
        this.scene.stop('UIScene');
        this.scene.stop('GameScene');
        this.scene.stop();
        this.scene.start('GameScene', { levelIndex: gs.levelIndex, vehicleId: gs.vehicle.id, score: gs.carriedScore });
    }

    _menu() {
        this.scene.stop('UIScene');
        this.scene.stop('GameScene');
        this.scene.stop();
        this.scene.start('MenuScene');
    }

    _button(x, y, label, onClick) {
        const bg = this.add.rectangle(x, y, 260, 52, 0x222244, 0.95).setStrokeStyle(3, 0xffd34d);
        const txt = this.add.text(x, y, label, { fontSize: '26px', fontStyle: 'bold', color: '#ffd34d' }).setOrigin(0.5);
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerover', () => { bg.setFillStyle(0x3a3a66, 1); txt.setScale(1.06); });
        bg.on('pointerout', () => { bg.setFillStyle(0x222244, 0.95); txt.setScale(1); });
        bg.on('pointerdown', () => { this.audio.sfx('click'); onClick(); });
    }
}
