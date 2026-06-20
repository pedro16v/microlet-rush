// Shown when a level's goal is met. Carries score into the next level.
class LevelCompleteScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelCompleteScene' });
    }

    init(data) {
        this.data_ = data;
        this.hasNext = (data.levelIndex + 1) < LEVELS.length;
    }

    create() {
        const w = GameConfig.WIDTH;
        const h = GameConfig.HEIGHT;
        const d = this.data_;
        this.audio = this.registry.get('audio');

        this.add.tileSprite(w / 2, h / 2, w, h, 'bg_sky');
        this.add.rectangle(w / 2, h / 2, w, h, 0x002200, 0.55);

        this.add.text(w / 2, 90, 'LEVEL COMPLETE!', {
            fontSize: '48px', fontStyle: 'bold', color: '#7be06b', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5);
        this.add.text(w / 2, 140, LEVELS[d.levelIndex].name, {
            fontSize: '26px', color: '#ffffff', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5);

        this.add.text(w / 2, 220,
            'Distance: ' + d.distance + ' m\n' +
            'Passengers: ' + d.passengers + '\n' +
            'Score: ' + d.score,
            { fontSize: '26px', color: '#ffffff', align: 'center', lineSpacing: 10 }).setOrigin(0.5);

        if (this.hasNext) {
            this._button(w / 2, 380, 'NEXT LEVEL ▶', () => this._next());
            this.add.text(w / 2, 330, 'Up next: ' + LEVELS[d.levelIndex + 1].name, {
                fontSize: '20px', fontStyle: 'italic', color: '#cfe8ff'
            }).setOrigin(0.5);
        } else {
            this._button(w / 2, 380, 'FINISH 🏁', () => this._finish());
            this.add.text(w / 2, 330, 'Final stage cleared!', {
                fontSize: '22px', fontStyle: 'italic', color: '#ffd34d'
            }).setOrigin(0.5);
        }
        this._button(w / 2, 444, 'MAIN MENU', () => this.scene.start('MenuScene'));

        this.input.keyboard.on('keydown-ENTER', () => (this.hasNext ? this._next() : this._finish()));

        if (!this.audio.muted) this.audio.sfx('levelup');
    }

    _next() {
        const d = this.data_;
        this.scene.start('GameScene', { levelIndex: d.levelIndex + 1, vehicleId: d.vehicleId, score: d.score });
    }

    _finish() {
        const d = this.data_;
        this.scene.start('GameOverScene', { score: d.score, levelIndex: d.levelIndex, vehicleId: d.vehicleId, reason: 'win' });
    }

    _button(x, y, label, onClick) {
        const bg = this.add.rectangle(x, y, 280, 52, 0x224422, 0.95).setStrokeStyle(3, 0x7be06b);
        const txt = this.add.text(x, y, label, { fontSize: '26px', fontStyle: 'bold', color: '#cfffcf' }).setOrigin(0.5);
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerover', () => { bg.setFillStyle(0x336633, 1); txt.setScale(1.06); });
        bg.on('pointerout', () => { bg.setFillStyle(0x224422, 0.95); txt.setScale(1); });
        bg.on('pointerdown', () => { this.audio.sfx('click'); onClick(); });
    }
}
