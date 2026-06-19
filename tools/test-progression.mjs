// Longer run: reach a level-complete and a game-over, screenshotting both.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
import fs from 'fs';
const OUT = 'tools/shots';
fs.mkdirSync(OUT, { recursive: true });

const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 820, height: 640 } });
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(e.message));

const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png` });
const active = () => page.evaluate(() => window.game.scene.scenes.filter(s => s.scene.isActive()).map(s => s.scene.key));

await page.goto('http://localhost:8080', { waitUntil: 'load' });
await page.waitForSelector('canvas');
await page.waitForTimeout(2500);
await page.keyboard.press('Enter');        // menu -> select
await page.waitForTimeout(600);
await page.keyboard.press('Enter');        // select silver -> play
await page.waitForTimeout(1200);

// idle-drive until level complete (distance goal); collect fuel by sweeping
let levelDone = false;
for (let i = 0; i < 80; i++) {
    await page.keyboard.down('ArrowUp'); await page.waitForTimeout(120); await page.keyboard.up('ArrowUp');
    await page.keyboard.down('ArrowDown'); await page.waitForTimeout(120); await page.keyboard.up('ArrowDown');
    const a = await active();
    if (a.includes('LevelCompleteScene')) { levelDone = true; break; }
}
console.log('reached level complete:', levelDone);
await shot('7-level-complete');

// go to next level
await page.keyboard.press('Enter');
await page.waitForTimeout(1500);
console.log('after next, active:', JSON.stringify(await active()));
await shot('8-level2');

// now crash: sit still and let fuel run out / take hits until game over
let over = false;
for (let i = 0; i < 120; i++) {
    await page.waitForTimeout(400);
    const a = await active();
    if (a.includes('GameOverScene')) { over = true; break; }
}
console.log('reached game over:', over);
await shot('9-game-over');

const ls = await page.evaluate(() => window.localStorage.getItem('microletRush.v1'));
console.log('save:', ls);

await browser.close();
console.log('ERRORS (' + errors.length + '):');
errors.forEach((e) => console.log('  ' + e));
process.exit(errors.length ? 1 : 0);
