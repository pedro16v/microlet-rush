class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Load placeholder sprites for testing
        this.load.image('microlet_silver', 'sprites/microlets/silver_omega.png');
        this.load.image('microlet_esperansa', 'sprites/microlets/esperansa.png');
        this.load.image('microlet_kuitadu', 'sprites/microlets/kuitadu.png');
        this.load.image('microlet_realize', 'sprites/microlets/realize_dream.png');
        
        // Load background layers
        this.load.image('bg_sky', 'sprites/background/sky.png');
        this.load.image('bg_mountains', 'sprites/background/mountains.png');
        this.load.image('bg_buildings', 'sprites/background/buildings.png');
        this.load.image('bg_roadside', 'sprites/background/roadside.png');
        this.load.image('road', 'sprites/background/road.2.png.jpg');
        
        // Load obstacles and pickups
        this.load.image('pothole', 'sprites/obstacles/pothole.png');
        this.load.image('coin', 'sprites/pickups/coin.png');
        this.load.image('fuel', 'sprites/pickups/fuel.png');
        this.load.image('passenger', 'sprites/pickups/passenger.png');
    }

    create() {
        console.log("PreloadScene create: Checking loaded textures...");
        const textures = [
            'microlet_silver', 'microlet_esperansa', 'microlet_kuitadu', 'microlet_realize',
            'bg_sky', 'bg_mountains', 'bg_buildings', 'bg_roadside', 'road',
            'pothole', 'coin', 'fuel', 'passenger'
        ];
        textures.forEach(key => {
            if (this.textures.exists(key)) {
                const texture = this.textures.get(key);
                console.log(`  Texture '${key}' exists. Source image size: ${texture.source[0].width}x${texture.source[0].height}`);
            } else {
                console.error(`  Texture '${key}' DOES NOT EXIST.`);
            }
        });

        console.log("Starting GameScene...");
        this.scene.start('GameScene');
    }
} 