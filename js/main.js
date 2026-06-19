// Bootstraps the Phaser game once the DOM and Phaser are ready.
document.addEventListener('DOMContentLoaded', function () {
    if (typeof Phaser === 'undefined') {
        console.error('Phaser is not loaded.');
        return;
    }

    const config = Object.assign({}, window.GameConfig.phaser, {
        scene: [
            BootScene,
            PreloadScene,
            MenuScene,
            VehicleSelectScene,
            GameScene,
            UIScene,
            PauseScene,
            LevelCompleteScene,
            GameOverScene
        ]
    });

    // eslint-disable-next-line no-new
    window.game = new Phaser.Game(config);
});
