document.addEventListener('DOMContentLoaded', function() {
    // Ensure Phaser is available
    if (typeof Phaser !== 'undefined') {
        const gameConfig = {
            type: Phaser.CANVAS,
            width: 800,
            height: 600,
            parent: 'game',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: true
                }
            },
            // Directly use the scene classes
            scene: [PreloadScene, GameScene, UIScene],
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            }
        };
        const game = new Phaser.Game(gameConfig);
    } else {
        console.error('Phaser is not loaded.');
    }
}); 