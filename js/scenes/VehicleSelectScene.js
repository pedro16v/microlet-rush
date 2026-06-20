// Pick a microlet. Shows stat bars; remembers last choice.
class VehicleSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VehicleSelectScene' });
    }

    create() {
        const w = GameConfig.WIDTH;
        const h = GameConfig.HEIGHT;
        this.audio = this.registry.get('audio');
        this.save = this.registry.get('save');

        this.add.tileSprite(w / 2, h / 2, w, h, 'bg_sky');
        this.add.rectangle(w / 2, h / 2, w, h, 0x000022, 0.55);

        this.add.text(w / 2, 50, 'CHOOSE YOUR MICROLET', {
            fontSize: '34px', fontStyle: 'bold', color: '#ffd34d', stroke: '#000', strokeThickness: 5
        }).setOrigin(0.5);
        this.add.text(w / 2, 88, '← →  to browse    ENTER  to drive', {
            fontSize: '18px', color: '#ffffff'
        }).setOrigin(0.5);

        const startId = this.save.get('lastVehicle');
        this.index = Math.max(0, VEHICLES.findIndex((v) => v.id === startId));
        if (this.index < 0) this.index = 0;

        // big preview car
        this.preview = this.add.image(w / 2, 230, VEHICLES[this.index].key).setDisplaySize(300, 150);
        this.tweens.add({ targets: this.preview, y: 222, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

        this.nameText = this.add.text(w / 2, 320, '', { fontSize: '30px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
        this.blurbText = this.add.text(w / 2, 352, '', { fontSize: '18px', fontStyle: 'italic', color: '#cfe8ff' }).setOrigin(0.5);

        // stat bars
        this.statGfx = this.add.graphics();
        this.statLabels = ['SPEED', 'HANDLING', 'ARMOR', 'FUEL'];

        // arrows
        this._arrow(w / 2 - 200, 230, '◀', () => this._move(-1));
        this._arrow(w / 2 + 200, 230, '▶', () => this._move(1));

        this._button(w / 2, 520, 'DRIVE!', () => this._select());

        this.input.keyboard.on('keydown-LEFT', () => this._move(-1));
        this.input.keyboard.on('keydown-RIGHT', () => this._move(1));
        this.input.keyboard.on('keydown-ENTER', () => this._select());
        this.input.keyboard.on('keydown-ESC', () => this.scene.start('MenuScene'));

        this._render();
    }

    _move(dir) {
        this.audio.sfx('click');
        this.index = (this.index + dir + VEHICLES.length) % VEHICLES.length;
        this._render();
    }

    _render() {
        const v = VEHICLES[this.index];
        this.preview.setTexture(v.key);
        this.nameText.setText(v.name);
        this.blurbText.setText(v.blurb);

        const stats = [
            (v.speed - 0.85) / 0.45,      // normalize roughly 0..1
            (v.handling - 0.85) / 0.45,
            (v.armor - 0.85) / 0.5,
            (v.fuelMax - 80) / 40
        ];
        const g = this.statGfx;
        g.clear();
        const x = GameConfig.WIDTH / 2 - 110;
        let y = 388;
        for (let i = 0; i < stats.length; i++) {
            const val = Phaser.Math.Clamp(stats[i], 0.08, 1);
            g.fillStyle(0x000000, 0.5);
            g.fillRect(x + 90, y, 130, 12);
            g.fillStyle(v.accent, 1);
            g.fillRect(x + 90, y, 130 * val, 12);
            y += 20;
        }
        // labels (draw once)
        if (!this._labelTexts) {
            this._labelTexts = [];
            let ly = 384;
            for (let i = 0; i < this.statLabels.length; i++) {
                this._labelTexts.push(this.add.text(x, ly, this.statLabels[i], { fontSize: '15px', color: '#ffffff' }));
                ly += 20;
            }
        }
    }

    _arrow(x, y, ch, onClick) {
        const t = this.add.text(x, y, ch, { fontSize: '48px', color: '#ffd34d' }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
        t.on('pointerover', () => t.setScale(1.2));
        t.on('pointerout', () => t.setScale(1));
        t.on('pointerdown', onClick);
    }

    _button(x, y, label, onClick) {
        const bg = this.add.rectangle(x, y, 220, 52, 0x222244, 0.95).setStrokeStyle(3, 0xffd34d);
        const txt = this.add.text(x, y, label, { fontSize: '28px', fontStyle: 'bold', color: '#ffd34d' }).setOrigin(0.5);
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerover', () => { bg.setFillStyle(0x3a3a66, 1); txt.setScale(1.06); });
        bg.on('pointerout', () => { bg.setFillStyle(0x222244, 0.95); txt.setScale(1); });
        bg.on('pointerdown', onClick);
    }

    _select() {
        if (this._selecting) return;
        this._selecting = true;
        const v = VEHICLES[this.index];
        this.save.set('lastVehicle', v.id);
        this.audio.sfx('powerup');
        this.scene.start('GameScene', { levelIndex: 0, vehicleId: v.id, score: 0 });
    }
}
