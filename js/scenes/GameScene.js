class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.score = 0;
        this.damage = 0; // Initialize damage
        this.isGameOver = false; // Game over flag
        this.gameSpeed = 300; // Base speed in pixels per second
        this.spawnTimer = 0;
        this.spawnInterval = 2000; // Milliseconds
    }

    create() {
        // Log camera properties
        const cam = this.cameras.main;
        console.log(`Camera properties: x=${cam.x}, y=${cam.y}, scrollX=${cam.scrollX}, scrollY=${cam.scrollY}, width=${cam.width}, height=${cam.height}, zoom=${cam.zoom}`);

        // Create background layers for parallax effect
        this.createBackground();
        
        // Create player microlet
        this.createPlayer();
        
        // Set up obstacles and pickups groups
        this.obstacles = this.add.group();
        this.pickups = this.add.group();
        
        // Set up input handling
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        
        // Start UI scene
        this.scene.launch('UIScene');
    }

    createBackground() {
        const gameWidth = this.game.config.width;
        const gameHeight = this.game.config.height; // 600
        const backgroundScale = 0.5; 

        // Define vertical layout (Buildings + Road Only)
        const buildingsHeight = 300; 
        const roadHeight = 300;      

        // Calculate Y positions for the *center* of each band
        const buildingsCenterY = buildingsHeight / 2;                     // 150
        const roadCenterY = buildingsCenterY + buildingsHeight / 2 + roadHeight / 2; // 150 + 150 + 150 = 450
        
        // Calculate the *bottom* Y coordinate for each band
        const buildingsBottomY = buildingsCenterY + buildingsHeight / 2; // 150 + 150 = 300
        const roadBottomY = roadCenterY + roadHeight / 2;       // 450 + 150 = 600

        /* // --- Sky (Still Commented out) ---
        if (skyHeight > 0) { 
            this.bgSky = this.add.tileSprite(gameWidth / 2, skyY, gameWidth, skyHeight, 'bg_sky');
            this.bgSky.setTileScale(backgroundScale);
            this.bgSky.setDepth(0); 
        } else {
            this.bgSky = null; 
        }
        */
       this.bgSky = null; 
        
       /* // --- Mountains (Commented out) ---
        this.bgMountains = this.add.tileSprite(gameWidth / 2, mountainsBottomY, gameWidth, mountainsHeight, 'bg_mountains');
        this.bgMountains.setOrigin(0.5, 1); // Align bottom edge
        const mountainsTextureHeight = this.bgMountains.texture?.source[0]?.height || mountainsHeight;
        const mountainsTileScaleY = mountainsHeight / mountainsTextureHeight;
        this.bgMountains.setTileScale(backgroundScale, mountainsTileScaleY); 
        this.bgMountains.setDepth(0); 
        */
       this.bgMountains = null; 

        // Buildings (Depth 1)
        this.bgBuildings = this.add.tileSprite(gameWidth / 2, buildingsBottomY, gameWidth, buildingsHeight, 'bg_buildings');
        this.bgBuildings.setOrigin(0.5, 1); // Align bottom edge
        const buildingsTextureHeight = this.bgBuildings.texture?.source[0]?.height || buildingsHeight;
        const buildingsTileScaleY = buildingsHeight / buildingsTextureHeight;
        this.bgBuildings.setTileScale(backgroundScale, buildingsTileScaleY); 
        this.bgBuildings.setDepth(1); 

        /* // --- Roadside objects (Still Commented out) ---
        this.bgRoadside = this.add.tileSprite(gameWidth / 2, roadsideY, gameWidth, roadsideHeight, 'bg_roadside');
        this.bgRoadside.setTileScale(backgroundScale);
        this.bgRoadside.setDepth(2); 
        */
       this.bgRoadside = null; 

        // Road (Depth 2) - Reverted to standard tileSprite
        this.road = this.add.tileSprite(gameWidth / 2, roadBottomY, gameWidth, roadHeight, 'road');
        this.road.setOrigin(0.5, 1); 
        const roadTextureHeight = this.road.texture?.source[0]?.height || roadHeight; 
        const roadTileScaleY = roadHeight / roadTextureHeight; 
        this.road.setTileScale(backgroundScale, roadTileScaleY); 
        this.road.setDepth(2); 
        // No setImmovable or setVelocityX for standard tileSprite
        
        // Store road bounds based on new Y (600) and Height (300)
        this.roadTopY = roadBottomY - roadHeight; // 600 - 300 = 300
        this.roadBottomY = roadBottomY; // 600 
    }

    createPlayer() {
        // Adjust starting Y and bounds to be on the new road (center Y = 450)
        const startY = this.roadTopY + (this.roadBottomY - this.roadTopY) / 2; // Center on road (y=450)
        this.player = this.physics.add.sprite(200, startY, 'microlet_silver'); 
        this.player.setDisplaySize(128, 64); // Using user's size
        this.player.setDepth(5); 
        
        this.player.setCollideWorldBounds(true); 
        
        // Set player properties based on new road bounds (300-600)
        this.player.speed = 200;
        this.player.minY = this.roadTopY + 10; // 300 + 10 = 310
        this.player.maxY = this.roadBottomY - 10; // 600 - 10 = 590
        // console.log("Player sprite created at:", this.player.x, this.player.y, "with texture:", this.player.texture.key);
        // console.log("Player display size (forced):", this.player.displayWidth, "x", this.player.displayHeight);
        // console.log("Player source texture size:", this.player.texture.source[0].width, "x", this.player.texture.source[0].height);
    }

    update(time, delta) {
        if (this.isGameOver) {
            return; // Stop updates if game is over
        }
        
        const deltaSeconds = delta / 1000;
        
        // Parallax scrolling (Mountains removed, Road manual update restored)
        // if (this.bgSky) this.bgSky.tilePositionX += this.gameSpeed * 0.1 * deltaSeconds;
        // if (this.bgMountains) this.bgMountains.tilePositionX += this.gameSpeed * 0.3 * deltaSeconds; 
        if (this.bgBuildings) this.bgBuildings.tilePositionX += this.gameSpeed * 0.5 * deltaSeconds;
        // if (this.bgRoadside) this.bgRoadside.tilePositionX += this.gameSpeed * 0.8 * deltaSeconds;
        if (this.road) this.road.tilePositionX += this.gameSpeed * deltaSeconds; // RESTORED manual tilePosition update
        
        // Handle player movement
        this.handlePlayerMovement();
        
        // Spawn obstacles and pickups
        this.spawnTimer += delta;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnObstacle();
            if (Phaser.Math.Between(1, 100) <= 20) { 
                this.spawnPickup();
            }
        }
                
        // Check collisions
        this.physics.overlap(this.player, this.pickups, this.collectPickup, null, this);
        this.physics.overlap(this.player, this.obstacles, this.hitObstacle, null, this);
    }

    handlePlayerMovement() {
        const body = this.player.body;
        const speed = this.player.speed;
        let intendedFlipX = this.player.flipX;
        
        // Reset velocities
        body.setVelocity(0);

        // Horizontal movement
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            body.setVelocityX(-speed);
            intendedFlipX = true;
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            body.setVelocityX(speed);
            intendedFlipX = false;
        }
        
        if (this.player.flipX !== intendedFlipX) {
            console.log(`Changing flipX from ${this.player.flipX} to ${intendedFlipX}`);
            this.player.flipX = intendedFlipX;
        }

        // Vertical movement (closer/farther in pseudo-3D)
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            if (this.player.y > this.player.minY) {
                body.setVelocityY(-speed);
            }
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            if (this.player.y < this.player.maxY) {
                body.setVelocityY(speed);
            }
        }
        
        // Clamp player position to vertical bounds manually as well
        this.player.y = Phaser.Math.Clamp(this.player.y, this.player.minY, this.player.maxY);
    }

    spawnObstacle() {
        // Spawn within the new road Y bounds (300-600 -> 310-590)
        const y = Phaser.Math.Between(this.roadTopY + 10, this.roadBottomY - 10); 
        const obstacle = this.physics.add.sprite(this.game.config.width + 50, y, 'pothole'); 
        obstacle.setDisplaySize(48, 48); 
        obstacle.setVelocityX(-this.gameSpeed); // Confirming this uses the same gameSpeed
        obstacle.setDepth(5); 
        obstacle.checkWorldBounds = true;
        obstacle.outOfBoundsKill = true; 
        this.obstacles.add(obstacle);
    }

    spawnPickup() {
        // Spawn within the new road Y bounds (300-600 -> 310-590)
        const y = Phaser.Math.Between(this.roadTopY + 10, this.roadBottomY - 10); 
        const type = Phaser.Math.RND.pick(['coin', 'fuel', 'passenger']);
        const pickup = this.physics.add.sprite(this.game.config.width + 50, y, type); 
        pickup.setDisplaySize(32, 32); 
        pickup.setVelocityX(-this.gameSpeed); // Confirming this uses the same gameSpeed
        pickup.setDepth(5); 
        pickup.checkWorldBounds = true;
        pickup.outOfBoundsKill = true; 
        this.pickups.add(pickup);
        pickup.setData('type', type);
    }

    collectPickup(player, pickup) {
        const type = pickup.getData('type');
        switch (type) {
            case 'coin':
                this.score += 10;
                break;
            case 'fuel':
                this.score += 5;
                break;
            case 'passenger':
                this.score += 20;
                break;
        }
        this.events.emit('updateScore', this.score);
        pickup.destroy();
    }

    hitObstacle(player, obstacle) {
        if (this.isGameOver) return;
        
        console.log("Hit obstacle!");
        this.damage += 10;
        this.events.emit('updateDamage', this.damage); // Emit damage update event
        
        this.gameSpeed = Math.max(50, this.gameSpeed - 10); // Slow down more significantly
        obstacle.destroy();
        
        if (this.damage >= 100) {
            this.gameOver();
        }
    }
    
    gameOver() {
        this.isGameOver = true;
        this.physics.pause(); // Stop physics
        this.player.setTint(0xff0000); // Indicate player is "damaged"
        console.log("GAME OVER! Damage:", this.damage);
        // Optional: Add text or transition to a GameOver scene here
        // this.scene.start('GameOverScene'); 
    }
} 