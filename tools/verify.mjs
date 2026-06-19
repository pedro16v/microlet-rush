// Headless smoke test: load the game, capture console errors, drive it through
// menu -> vehicle select -> gameplay -> pause, and screenshot each state.
// Usage: NODE_PATH=$(npm root -g) node tools/verify.mjs
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
import fs from 'fs';

const BASE = process.env.BASE || 'http://localhost:8080';
const OUT = 'tools/shots';
fs.mkdirSync(OUT, { recursive: true });

const errors = [];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 700 } });

page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push('CONSOLE: ' + msg.text());
});
page.on('pageerror', (err) => errors.push('PAGEERROR: ' + err.message));

async function shot(name) {
    await page.screenshot({ path: `${OUT}/${name}.png` });
    console.log('  shot:', name);
}

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector('canvas');
await page.waitForTimeout(2500); // preload + menu
await shot('1-menu');

// click PLAY (canvas coords). Menu PLAY button center ~ (450, 280) in 900x700?
// Game is 800x600 FIT-scaled & centered in 900x700 -> letterboxed. Use keyboard.
await page.keyboard.press('Enter'); // start from menu
await page.waitForTimeout(800);
await shot('2-vehicle-select');

await page.keyboard.press('ArrowRight');
await page.waitForTimeout(300);
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(300);
await shot('3-vehicle-browse');

await page.keyboard.press('Enter'); // DRIVE
await page.waitForTimeout(1500);
await shot('4-gameplay-start');

// drive around to collect/dodge
const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
for (let i = 0; i < 24; i++) {
    const k = keys[i % keys.length];
    await page.keyboard.down(k);
    await page.waitForTimeout(180);
    await page.keyboard.up(k);
}
await shot('5-gameplay-mid');

// pause
await page.keyboard.press('Escape');
await page.waitForTimeout(500);
await shot('6-pause');
await page.keyboard.press('Escape'); // resume
await page.waitForTimeout(400);

// check localStorage gets written eventually (play a bit more)
await page.waitForTimeout(800);
const ls = await page.evaluate(() => window.localStorage.getItem('microletRush.v1'));
console.log('  localStorage present:', !!ls);

// inspect internal game state
const state = await page.evaluate(() => {
    const g = window.game;
    const gs = g.scene.keys['GameScene'];
    return {
        activeScenes: g.scene.scenes.filter(s => s.scene.isActive()).map(s => s.scene.key),
        score: gs ? gs.score : null,
        fuel: gs && gs.player ? Math.round(gs.player.fuel) : null,
        distance: gs ? Math.round(gs.distance) : null
    };
});
console.log('  state:', JSON.stringify(state));

await browser.close();

console.log('\nERRORS (' + errors.length + '):');
errors.forEach(e => console.log('  ' + e));
process.exit(errors.length ? 1 : 0);
