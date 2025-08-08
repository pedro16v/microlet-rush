(() => {
  const designWidth = 480;
  const designHeight = 800;

  const config = {
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#1a1a1a',
    scale: {
      mode: Phaser.Scale.ENVELOP,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: designWidth,
      height: designHeight,
    },
    physics: {
      default: 'arcade',
      arcade: { debug: false },
    },
    input: { activePointers: 3, touch: true },
    scene: [PreloadScene, GameScene],
  };

  const game = new Phaser.Game(config);

  // Resize safeguard for iOS address bar changes
  window.addEventListener('resize', () => {
    game.scale.refresh();
  });
})();


