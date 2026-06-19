// End screen for crash / out-of-fuel / win. Handles high-score entry.
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.result = data;
        this.save = null;
        this.nameEntry = '';
        this.submitted = false;
    }

    create() {
        const w = GameConfig.WIDTH;
        const h = GameConfig.HEIGHT;
        const r = this.result;
        this.audio = this.registry.get('audio');
        this.save = this.registry.get('save');

        this.add.tileSprite(w / 2, h / 2, w, h, 'bg_sky');
        const win = r.reason === 'win';
        this.add.rectangle(w / 2, h / 2, w, h, win ? 0x222200 : 0x220000, 0.6);

        const titles = { crash: 'CRASHED!', outOfFuel: 'OUT OF FUEL!', win: 'YOU WIN! 🏆' };
        this.add.text(w / 2, 90, titles[r.reason] || 'GAME OVER', {
            fontSize: '52px', fontStyle: 'bold', color: win ? '#ffd34d' : '#ff5555', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(w / 2, 160, 'Final Score: ' + r.score, {
            fontSize: '32px', fontStyle: 'bold', color: '#ffffff', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);

        this.isHigh = this.save.isHighScore(r.score);
        if (this.isHigh) {
            this.add.text(w / 2, 210, 'NEW HIGH SCORE! Type your name:', {
                fontSize: '20px', color: '#ffd34d'
            }).setOrigin(0.5);
            this.nameText = this.add.text(w / 2, 246, '_', {
                fontSize: '34px', fontStyle: 'bold', color: '#ffffff', stroke: '#000', strokeThickness: 4
            }).setOrigin(0.5);
            this.input.keyboard.on('keydown', this._onType, this);
        } else {
            this._showScores(252);
        }

        this._button(w / 2, 380, win ? 'PLAY AGAIN' : 'RETRY', () => this._retry());
        this._button(w / 2, 444, 'MAIN MENU', () => this._menu());

        if (!this.audio.muted) this.audio.sfx(win ? 'levelup' : 'gameover');
    }

    _onType(ev) {
        if (this.submitted) return;
        if (ev.key === 'Enter') { this._submit(); return; }
        if (ev.key === 'Backspace') { this.nameEntry = this.nameEntry.slice(0, -1); }
        else if (/^[a-zA-Z0-9]$/.test(ev.key) && this.nameEntry.length < 6) { this.nameEntry += ev.key.toUpperCase(); }
        this.nameText.setText((this.nameEntry || '') + '_');
    }

    _submit() {
        if (this.submitted) return;
        this.submitted = true;
        this.save.submitScore(this.nameEntry || 'YOU', this.result.score);
        this.audio.sfx('coin');
        if (this.nameText) this.nameText.setText(this.nameEntry || 'YOU');
        this._showScores(300);
    }

    _ensureSubmitted() {
        if (this.isHigh && !this.submitted) {
            this.save.submitScore(this.nameEntry || 'YOU', this.result.score);
            this.submitted = true;
        }
    }

    _showScores(y) {
        if (this._scoreList) this._scoreList.destroy();
        const scores = this.save.get('highScores');
        let txt = 'HIGH SCORES\n';
        scores.forEach((s, i) => { txt += (i + 1) + '. ' + s.name + '  —  ' + s.score + '\n'; });
        this._scoreList = this.add.text(GameConfig.WIDTH / 2, y, txt, {
            fontSize: '18px', color: '#ffffff', align: 'center', lineSpacing: 4
        }).setOrigin(0.5, 0);
    }

    _retry() {
        this._ensureSubmitted();
        const r = this.result;
        const level = r.reason === 'win' ? 0 : r.levelIndex;
        this.scene.start('GameScene', { levelIndex: level, vehicleId: r.vehicleId, score: 0 });
    }

    _menu() {
        this._ensureSubmitted();
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
