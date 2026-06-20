// Heads-up display. Runs in parallel with GameScene and reads its `hud` snapshot
// each frame; uses events only for transient pops (combo).
class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        const w = GameConfig.WIDTH;
        this.gameScene = this.scene.get('GameScene');

        // bars (top-left)
        this.add.text(16, 14, 'HP', { fontSize: '14px', color: '#ffffff' });
        this.add.text(16, 38, 'FUEL', { fontSize: '14px', color: '#ffffff' });
        this.barGfx = this.add.graphics();

        // score + high score (top-right)
        this.scoreText = this.add.text(w - 16, 12, 'Score: 0', {
            fontSize: '26px', fontStyle: 'bold', color: '#ffffff', stroke: '#000', strokeThickness: 4
        }).setOrigin(1, 0);
        this.highText = this.add.text(w - 16, 44, 'Best: 0', {
            fontSize: '16px', color: '#ffd34d', stroke: '#000', strokeThickness: 3
        }).setOrigin(1, 0);

        // combo (center-right under score)
        this.comboText = this.add.text(w - 16, 70, '', {
            fontSize: '24px', fontStyle: 'bold', color: '#ff7a3d', stroke: '#000', strokeThickness: 4
        }).setOrigin(1, 0);

        // objective (top-center)
        this.objText = this.add.text(w / 2, 14, '', {
            fontSize: '18px', fontStyle: 'bold', color: '#ffffff', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5, 0);
        this.objBarGfx = this.add.graphics();

        // power-up icons (bottom-left)
        this.powerIcons = [];

        // on-screen pause button (touch-friendly), bottom-right
        this.pauseBtn = this.add.text(w - 18, GameConfig.HEIGHT - 14, '❚❚', {
            fontSize: '28px', fontStyle: 'bold', color: '#ffffff', stroke: '#000', strokeThickness: 4
        }).setOrigin(1, 1).setDepth(20).setInteractive({ useHandCursor: true });
        this.pauseBtn.on('pointerover', () => this.pauseBtn.setScale(1.15));
        this.pauseBtn.on('pointerout', () => this.pauseBtn.setScale(1));
        this.pauseBtn.on('pointerdown', () => { if (this.gameScene && this.gameScene._pause) this.gameScene._pause(); });

        this.gameScene.events.on('comboPop', this._comboPop, this);
    }

    _comboPop(combo) {
        this.comboText.setText('COMBO x' + combo);
        this.tweens.add({ targets: this.comboText, scale: 1.4, duration: 120, yoyo: true, ease: 'Quad.out' });
    }

    update() {
        const hud = this.gameScene.hud;
        if (!hud || hud.score === undefined) return;

        // bars
        const g = this.barGfx;
        g.clear();
        this._bar(g, 56, 16, 180, 14, hud.healthFrac, this._healthColor(hud.healthFrac));
        const fuelLow = hud.fuelFrac < 0.2;
        const fuelColor = fuelLow && (Math.floor(this.time.now / 200) % 2 === 0) ? 0xff3030 : 0x4ec3ff;
        this._bar(g, 56, 40, 180, 14, hud.fuelFrac, fuelColor);

        // score
        this.scoreText.setText('Score: ' + hud.score);
        this.highText.setText('Best: ' + hud.highScore);
        if (hud.combo <= 1) this.comboText.setText('');

        // objective
        this.objText.setText(hud.levelName + '  —  ' + hud.goalLabel);
        const og = this.objBarGfx;
        og.clear();
        const ow = 300;
        const ox = GameConfig.WIDTH / 2 - ow / 2;
        this._bar(og, ox, 40, ow, 10, hud.goalFrac, 0xffd34d);

        this._renderPowerups(hud.powerups);
    }

    _bar(g, x, y, w, h, frac, color) {
        frac = Phaser.Math.Clamp(frac, 0, 1);
        g.fillStyle(0x000000, 0.5);
        g.fillRect(x - 2, y - 2, w + 4, h + 4);
        g.fillStyle(0x222222, 1);
        g.fillRect(x, y, w, h);
        g.fillStyle(color, 1);
        g.fillRect(x, y, w * frac, h);
    }

    _healthColor(frac) {
        if (frac > 0.5) return 0x4cd964;
        if (frac > 0.25) return 0xffcc33;
        return 0xff3b30;
    }

    _renderPowerups(powerups) {
        powerups = powerups || [];
        // rebuild icon set if count changed
        if (powerups.length !== this.powerIcons.length) {
            this.powerIcons.forEach((p) => { p.icon.destroy(); p.gfx.destroy(); });
            this.powerIcons = [];
            const y = GameConfig.HEIGHT - 44;
            for (let i = 0; i < powerups.length; i++) {
                const x = 40 + i * 56;
                const icon = this.add.image(x, y, powerups[i].key).setDisplaySize(36, 36);
                const gfx = this.add.graphics();
                this.powerIcons.push({ icon: icon, gfx: gfx, x: x, y: y });
            }
        }
        // update countdown rings
        for (let i = 0; i < powerups.length; i++) {
            const p = this.powerIcons[i];
            p.icon.setTexture(powerups[i].key);
            p.gfx.clear();
            p.gfx.fillStyle(0x000000, 0.5);
            p.gfx.fillRect(p.x - 20, p.y + 22, 40, 6);
            p.gfx.fillStyle(0xffffff, 1);
            p.gfx.fillRect(p.x - 20, p.y + 22, 40 * Phaser.Math.Clamp(powerups[i].frac, 0, 1), 6);
        }
    }
}
