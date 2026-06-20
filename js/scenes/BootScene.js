// First scene: build runtime-generated textures and shared managers, then preload.
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    create() {
        // 1x1 white pixel for particle emitters (tinted per effect)
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xffffff, 1);
        g.fillRect(0, 0, 4, 4);
        g.generateTexture('px', 4, 4);
        g.destroy();

        // procedural power-up icons (no art assets exist for these)
        this._makePowerup('pw_shield', 0x4ec3ff, (gr) => {
            gr.fillStyle(0xffffff, 1);
            gr.fillTriangle(32, 12, 14, 22, 14, 40);
            gr.fillTriangle(32, 12, 50, 22, 50, 40);
            gr.fillTriangle(14, 40, 50, 40, 32, 54);
        });
        this._makePowerup('pw_boost', 0xff7a3d, (gr) => {
            gr.fillStyle(0xffffff, 1);
            gr.fillTriangle(34, 10, 16, 36, 30, 36);
            gr.fillTriangle(46, 28, 26, 54, 40, 36);
        });
        this._makePowerup('pw_magnet', 0xff4d6d, (gr) => {
            gr.fillStyle(0xffffff, 1);
            gr.fillRect(18, 14, 10, 26);
            gr.fillRect(38, 14, 10, 26);
            gr.fillRect(18, 14, 30, 10);
            gr.fillStyle(0x333333, 1);
            gr.fillRect(18, 40, 10, 8);
            gr.fillRect(38, 40, 10, 8);
        });

        // shared managers in the registry
        const save = new SaveManager();
        const audio = new AudioManager(save);
        this.registry.set('save', save);
        this.registry.set('audio', audio);

        this.scene.start('PreloadScene');
    }

    _makePowerup(key, bg, drawIcon) {
        const gr = this.make.graphics({ x: 0, y: 0, add: false });
        gr.fillStyle(bg, 1);
        gr.fillCircle(32, 32, 30);
        gr.lineStyle(4, 0xffffff, 1);
        gr.strokeCircle(32, 32, 30);
        drawIcon(gr);
        gr.generateTexture(key, 64, 64);
        gr.destroy();
    }
}
