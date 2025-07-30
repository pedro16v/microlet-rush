class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        // Score display
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            fill: '#fff',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 4
        });
        this.scoreText.setDepth(10);
        
        // Damage display
        this.damageText = this.add.text(16, 50, 'Damage: 0', {
            fontSize: '32px',
            fill: '#ff0000', // Red color for damage
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 4
        });
        this.damageText.setDepth(10);
        
        // Listen for events from GameScene
        const gameScene = this.scene.get('GameScene');
        gameScene.events.on('updateScore', this.updateScore, this);
        gameScene.events.on('updateDamage', this.updateDamage, this); // Listen for damage updates
    }

    updateScore(score) {
        this.scoreText.setText('Score: ' + score);
    }
    
    updateDamage(damage) {
        this.damageText.setText('Damage: ' + damage);
    }
} 