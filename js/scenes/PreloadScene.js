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

    // SFX
    this.load.audio('sfx_hit', 'https://cdn.jsdelivr.net/gh/jackyzha0/sfx@master/hit1.mp3');
    this.load.audio('sfx_capture', 'https://cdn.jsdelivr.net/gh/jackyzha0/sfx@master/coin1.mp3');
    this.load.audio('sfx_tap', 'https://cdn.jsdelivr.net/gh/jackyzha0/sfx@master/click1.mp3');
  }

  create() {
    // Name prompt (localStorage)
    const stored = localStorage.getItem('mr_player_name');
    if (stored && stored.length >= 3) {
      this.game.playerName = stored;
      this.scene.start('GameScene');
      return;
    }

    const overlay = document.getElementById('name-overlay');
    const input = document.getElementById('name-input');
    const button = document.getElementById('name-button');
    overlay.style.display = 'flex';
    const finish = () => {
      const name = (input.value || '').trim();
      if (!/^[a-zA-Z0-9]{3,15}$/.test(name)) return;
      localStorage.setItem('mr_player_name', name);
      this.game.playerName = name;
      overlay.style.display = 'none';
      this.sound.play('sfx_tap', { volume: 0.5 });
      this.scene.start('GameScene');
    };
    button.addEventListener('click', finish);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') finish(); });
  }
}

window.PreloadScene = PreloadScene;


