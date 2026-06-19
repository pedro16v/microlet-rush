// Single source of truth for game configuration.
// Renderer is AUTO (WebGL preferred for particles/tints; falls back to Canvas).
// Pass ?debug=1 in the URL to enable arcade physics debug boxes.
(function () {
    const debug = /[?&]debug=1\b/.test(window.location.search);

    window.GameConfig = {
        WIDTH: 800,
        HEIGHT: 600,
        // Road band (driving area) in screen space.
        ROAD_TOP_Y: 300,
        ROAD_BOTTOM_Y: 600,
        DEBUG: debug,

        phaser: {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            parent: 'game',
            backgroundColor: '#1a1a2e',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: debug
                }
            },
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            }
        }
    };
})();
