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
            LeaderboardScene,
            VehicleSelectScene,
            GameScene,
            UIScene,
            PauseScene,
            LevelCompleteScene,
            GameOverScene
        ]
    });

    window.game = new Phaser.Game(config);

    // keep the canvas correctly sized when the mobile address bar shows/hides
    window.addEventListener('resize', function () { window.game.scale.refresh(); });
});
