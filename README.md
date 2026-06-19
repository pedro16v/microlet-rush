# Microlet Rush: Timor Streets

A fast, juicy 2D arcade driving game where you steer a decorated Timorese
microlet through three themed stages — **Dili City**, the **Coast Road**, and the
**Mountain Pass** — collecting coins and passengers, grabbing power-ups, managing
fuel, and dodging potholes and weaving taxis. Built with [Phaser 3](https://phaser.io/)
(vendored locally, no build step required).

## How to Run

Any static web server works — just serve the project root and open it in a browser
(it must be served over HTTP, not opened as a `file://` URL):

```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server -c-1

# PHP
php -S localhost:8000
```

Then open `http://localhost:8000`.

## Controls

- **Arrow keys / WASD** — steer (left/right) and move near/far (up/down)
- **ESC / P** — pause
- **M** — toggle sound
- **Enter** — confirm / advance menus

## Features

- **Three themed levels** with rising difficulty, distinct parallax scenery, and
  per-stage goals (reach a distance, deliver passengers, or both). Defined as
  data in [`js/data/levels.js`](js/data/levels.js) — easy to tweak or extend.
- **Four selectable microlets**, each with different speed / handling / armor /
  fuel-tank stats ([`js/data/vehicles.js`](js/data/vehicles.js)).
- **Power-ups**: shield (absorb hits), speed boost, and coin magnet.
- **Fuel as a resource** — it drains as you drive; grab fuel cans or run dry.
- **Combo multiplier** for chaining pickups, score popups, particles, screen
  shake, hit flashes, and smooth accelerated steering.
- **Procedural audio** — music and sound effects synthesized at runtime via the
  Web Audio API (no audio files to download).
- **Full game flow**: title screen, vehicle select, pause, level-complete, and
  game-over screens, with high scores persisted in `localStorage`.

## Project Structure

```
index.html              loads Phaser + all modules
vendor/phaser.min.js    Phaser 3.60 (vendored)
js/
  config.js             GameConfig (size, renderer, ?debug=1 flag)
  main.js               registers scenes, boots the game
  data/                 levels.js, vehicles.js (data-driven content)
  systems/              AudioManager, SaveManager, Player, Spawner
  scenes/               Boot, Preload, Menu, VehicleSelect, Game, UI,
                        Pause, LevelComplete, GameOver
sprites/                source art (1024px originals)
sprites/opt/            optimized art actually loaded by the game
tools/                  optimize-assets.py, verify.mjs (headless smoke test)
```

## Assets

The game loads optimized art from `sprites/opt/` (generated from the large
originals in `sprites/`). Regenerate it after changing source art:

```bash
pip install Pillow
python tools/optimize-assets.py
```

This downscales the 1024px source PNGs to in-game sizes, keys out solid
backgrounds to add transparency, and recompresses the parallax layers as JPEG —
cutting the asset payload from ~21 MB to under 0.5 MB.

## Development Notes

- `?debug=1` in the URL enables Phaser's arcade-physics debug boxes.
- `tools/verify.mjs` is a headless Playwright smoke test that loads the game,
  drives it through every scene, screenshots each state, and fails on any console
  error. Run it against a local server with Playwright installed.
