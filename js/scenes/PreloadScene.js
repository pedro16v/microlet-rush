// Loads optimized art (sprites/opt/...) with a progress bar, then -> MenuScene.
class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        this._buildLoadingBar();

        const M = 'sprites/opt/';

        // microlets
        this.load.image('microlet_silver', M + 'microlets/silver_omega.png');
        this.load.image('microlet_esperansa', M + 'microlets/esperansa.png');
        this.load.image('microlet_kuitadu', M + 'microlets/kuitadu.png');
        this.load.image('microlet_realize', M + 'microlets/realize_dream.png');

        // parallax layers (JPEG)
        this.load.image('bg_sky', M + 'background/sky.jpg');
        this.load.image('bg_mountains', M + 'background/mountains.jpg');
        this.load.image('bg_buildings', M + 'background/buildings.jpg');
        this.load.image('bg_roadside', M + 'background/roadside.jpg');
        this.load.image('road', M + 'background/road.jpg');

        // obstacles + pickups
        this.load.image('pothole', M + 'obstacles/pothole.png');
        this.load.image('yellow_taxi', M + 'obstacles/yellow_taxi.png');
        this.load.image('coin', M + 'pickups/coin.png');
        this.load.image('fuel', M + 'pickups/fuel.png');
        this.load.image('passenger', M + 'pickups/passenger.png');
    }

    _buildLoadingBar() {
        const w = GameConfig.WIDTH;
        const h = GameConfig.HEIGHT;
        this.add.text(w / 2, h / 2 - 60, 'MICROLET RUSH', {
            fontSize: '40px', fontStyle: 'bold', color: '#ffd34d'
        }).setOrigin(0.5);

        const barW = 420;
        const barX = (w - barW) / 2;
        const barY = h / 2;
        this.add.rectangle(w / 2, barY, barW + 8, 28, 0x000000, 0.4).setStrokeStyle(2, 0xffffff, 0.5);
        const fill = this.add.rectangle(barX, barY, 1, 20, 0xffd34d).setOrigin(0, 0.5);
        const pct = this.add.text(w / 2, barY + 36, '0%', { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);

        this.load.on('progress', function (value) {
            fill.width = barW * value;
            pct.setText(Math.round(value * 100) + '%');
        });
    }

    create() {
        if (GameConfig.DEBUG) console.log('Assets loaded. Starting MenuScene.');
        this.scene.start('MenuScene');
    }
}
