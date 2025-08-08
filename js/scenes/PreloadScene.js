class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    const w = this.scale.width;
    const h = this.scale.height;

    const text = this.add.text(w / 2, h / 2, 'Loading...', {
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial',
      fontSize: 24,
      color: '#ffffff',
    }).setOrigin(0.5, 0.5);

    // Background layers
    this.load.image('sky', 'sprites/background/sky.png');
    this.load.image('mountains', 'sprites/background/mountains.png');
    this.load.image('buildings', 'sprites/background/buildings.png');
    this.load.image('roadside', 'sprites/background/roadside.png');
    this.load.image('road', 'sprites/background/road.png');

    // Microlets
    this.load.image('microlet_silver', 'sprites/microlets/silver_omega.png');
    this.load.image('microlet_esperansa', 'sprites/microlets/esperansa.png');
    this.load.image('microlet_kuitadu', 'sprites/microlets/kuitadu.png');
    this.load.image('microlet_realize', 'sprites/microlets/realize_dream.png');

    // Obstacles
    this.load.image('ob_pothole', 'sprites/obstacles/pothole.png');
    this.load.image('ob_taxi', 'sprites/obstacles/yellow_taxi.png');

    // Pickups (future)
    this.load.image('pickup_coin', 'sprites/pickups/coin.png');
    this.load.image('pickup_fuel', 'sprites/pickups/fuel.png');
    this.load.image('pickup_pass', 'sprites/pickups/passenger.png');
  }

  create() {
    this.scene.start('GameScene');
  }
}

window.PreloadScene = PreloadScene;


