// Data-driven level definitions. GameScene is generic and reads everything here.
//
// theme.layers   ordered far->near; each becomes a parallax tileSprite.
//                mode: 'fill'  full-screen background (sky)
//                      'bottom' bottom-aligned to the horizon (ROAD_TOP_Y), uses `height`
//                      'road'   the driving band (ROAD_TOP_Y..ROAD_BOTTOM_Y)
//                factor: horizontal scroll speed relative to gameSpeed (0..1)
// goal           { type:'distance', distance } | { type:'passengers', count }
//                | { type:'both', distance, count }
// speeds in px/s; fuelDrain in fuel-units/s; spawnInterval in ms.
// obstacles/pickups: weighted spawn tables (weights need not sum to 100).
// musicScale: note frequencies (Hz) the AudioManager arpeggiates for this theme.

window.LEVELS = [
    {
        id: 'city',
        name: 'Dili City',
        subtitle: 'Rush hour downtown',
        theme: {
            tint: 0xffffff,
            sky: '#5fb0d8',
            layers: [
                { key: 'bg_sky',       mode: 'fill',   factor: 0.05 },
                { key: 'bg_mountains', mode: 'bottom', factor: 0.15, height: 230 },
                { key: 'bg_buildings', mode: 'bottom', factor: 0.45, height: 200 },
                { key: 'bg_roadside',  mode: 'bottom', factor: 0.75, height: 150 },
                { key: 'road',         mode: 'road',   factor: 1.00 }
            ]
        },
        goal: { type: 'distance', distance: 3600 },
        startSpeed: 280, maxSpeed: 440, speedRamp: 7,
        fuelDrain: 4.5,
        spawnInterval: { start: 1300, min: 720 },
        obstacles: [
            { key: 'pothole', weight: 70, dmg: 12, kind: 'static' },
            { key: 'yellow_taxi', weight: 30, dmg: 20, kind: 'weave' }
        ],
        pickups: [
            { key: 'coin', weight: 52 },
            { key: 'fuel', weight: 20 },
            { key: 'passenger', weight: 16 },
            { key: 'pw_shield', weight: 4 },
            { key: 'pw_boost', weight: 4 },
            { key: 'pw_magnet', weight: 4 }
        ],
        musicScale: [196.00, 246.94, 293.66, 392.00, 493.88]
    },
    {
        id: 'coast',
        name: 'Coast Road',
        subtitle: 'Pick up beach-goers',
        theme: {
            tint: 0xfff0d8,
            sky: '#7fd0e0',
            layers: [
                { key: 'bg_sky',       mode: 'fill',   factor: 0.04 },
                { key: 'bg_mountains', mode: 'bottom', factor: 0.12, height: 200 },
                { key: 'bg_roadside',  mode: 'bottom', factor: 0.55, height: 170 },
                { key: 'bg_buildings', mode: 'bottom', factor: 0.80, height: 150 },
                { key: 'road',         mode: 'road',   factor: 1.00 }
            ]
        },
        goal: { type: 'passengers', count: 10 },
        startSpeed: 330, maxSpeed: 500, speedRamp: 8,
        fuelDrain: 5.5,
        spawnInterval: { start: 1200, min: 640 },
        obstacles: [
            { key: 'pothole', weight: 55, dmg: 12, kind: 'static' },
            { key: 'yellow_taxi', weight: 45, dmg: 22, kind: 'weave' }
        ],
        pickups: [
            { key: 'coin', weight: 44 },
            { key: 'fuel', weight: 22 },
            { key: 'passenger', weight: 22 },
            { key: 'pw_shield', weight: 4 },
            { key: 'pw_boost', weight: 4 },
            { key: 'pw_magnet', weight: 4 }
        ],
        musicScale: [220.00, 277.18, 329.63, 440.00, 554.37]
    },
    {
        id: 'mountains',
        name: 'Mountain Pass',
        subtitle: 'The long climb home',
        theme: {
            tint: 0xd8d0e8,
            sky: '#9a86c4',
            layers: [
                { key: 'bg_sky',       mode: 'fill',   factor: 0.03 },
                { key: 'bg_mountains', mode: 'bottom', factor: 0.18, height: 260 },
                { key: 'bg_buildings', mode: 'bottom', factor: 0.50, height: 170 },
                { key: 'bg_roadside',  mode: 'bottom', factor: 0.78, height: 150 },
                { key: 'road',         mode: 'road',   factor: 1.00 }
            ]
        },
        goal: { type: 'both', distance: 5200, count: 6 },
        startSpeed: 380, maxSpeed: 560, speedRamp: 9,
        fuelDrain: 6.5,
        spawnInterval: { start: 1050, min: 560 },
        obstacles: [
            { key: 'pothole', weight: 50, dmg: 14, kind: 'static' },
            { key: 'yellow_taxi', weight: 50, dmg: 24, kind: 'weave' }
        ],
        pickups: [
            { key: 'coin', weight: 42 },
            { key: 'fuel', weight: 26 },
            { key: 'passenger', weight: 18 },
            { key: 'pw_shield', weight: 5 },
            { key: 'pw_boost', weight: 5 },
            { key: 'pw_magnet', weight: 4 }
        ],
        musicScale: [174.61, 220.00, 261.63, 349.23, 440.00]
    }
];

// Which pickup keys are power-ups (vs score/resource pickups).
window.POWERUP_KEYS = ['pw_shield', 'pw_boost', 'pw_magnet'];
