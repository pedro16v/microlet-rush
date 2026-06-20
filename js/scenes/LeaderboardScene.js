// Shows the global online leaderboard (falls back to local high scores offline).
class LeaderboardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LeaderboardScene' });
    }

    create() {
        const w = GameConfig.WIDTH;
        const h = GameConfig.HEIGHT;
        this.audio = this.registry.get('audio');
        this.save = this.registry.get('save');

        this.add.tileSprite(w / 2, h / 2, w, h, 'bg_sky');
        this.add.rectangle(w / 2, h / 2, w, h, 0x000022, 0.6);

        this.add.text(w / 2, 54, 'LEADERBOARD', {
            fontSize: '40px', fontStyle: 'bold', color: '#ffd34d', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5);

        this.statusText = this.add.text(w / 2, 96, 'Loading…', {
            fontSize: '16px', fontStyle: 'italic', color: '#cfe8ff'
        }).setOrigin(0.5);

        this.listText = this.add.text(w / 2, 130, '', {
            fontSize: '20px', color: '#ffffff', align: 'center', lineSpacing: 6
        }).setOrigin(0.5, 0);

        this._button(w / 2, h - 50, 'BACK', () => this.scene.start('MenuScene'));
        this.input.keyboard.on('keydown-ESC', () => this.scene.start('MenuScene'));

        this._load();
    }

    async _load() {
        const rows = await MRLeaderboard.top(10);
        if (rows && rows.length >= 0 && MRLeaderboard.isOnline()) {
            this.statusText.setText('🌐 Global · top ' + rows.length);
            this._render(rows.map((r) => ({ name: r.name, score: r.score })));
        } else {
            // offline: show local high scores from SaveManager
            this.statusText.setText('Offline · local scores (start the server for global)');
            this._render(this.save.get('highScores'));
        }
    }

    _render(list) {
        if (!list || !list.length) {
            this.listText.setText('No scores yet.\nBe the first!');
            return;
        }
        let txt = '';
        list.forEach((s, i) => {
            txt += String(i + 1).padStart(2, ' ') + '.  ' + s.name + '   —   ' + s.score + '\n';
        });
        this.listText.setText(txt);
    }

    _button(x, y, label, onClick) {
        const bg = this.add.rectangle(x, y, 220, 50, 0x222244, 0.95).setStrokeStyle(3, 0xffd34d);
        const txt = this.add.text(x, y, label, { fontSize: '24px', fontStyle: 'bold', color: '#ffd34d' }).setOrigin(0.5);
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerover', () => { bg.setFillStyle(0x3a3a66, 1); txt.setScale(1.06); });
        bg.on('pointerout', () => { bg.setFillStyle(0x222244, 0.95); txt.setScale(1); });
        bg.on('pointerdown', () => { this.audio.sfx('click'); onClick(); });
    }
}
