Project Title: Microlet Rush: Timor Streets

⸻

Goal:
Build a 2D pixel art game where the player drives one of several decorated Timorese microlets through a lively, side-scrolling environment. The game combines mechanics from Sonic, Golden Axe, and Prince of Persia, allowing lateral and depth movement (left/right, forward/backward) on a continuous scrolling road. The visual style is vibrant, pixelated, and inspired by the colorful minibuses of Timor-Leste.

⸻

🎮 Game Mechanics
	•	Player Movement:
	•	Move left and right along the road
	•	Move “closer” or “farther” into the background (pseudo-3D perspective like in Golden Axe)
	•	Jump (optional, depending on platform behavior)
	•	Environment:
	•	Continuous horizontal scrolling road with a looping or extended tilemap
	•	Multiple background layers with parallax effect to simulate depth
	•	Background features typical Timor-Leste buildings, kiosks, palm trees, mountains, ocean, and animated elements (like flags, people, goats)
	•	Vehicles:
	•	Selectable microlets: Silver Omega, Esperansa, Kuitadu, Realize Dream
	•	Each is a sprite facing right by default (with mirrored left animation)
	•	Optionally, each has a slightly different boost or speed value
	•	Interactions (MVP):
	•	Obstacles (potholes, people, animals)
	•	Pickups (coins, fuel, or passengers)
	•	Optional: simple time or distance score counter

⸻

🎨 Art & Assets
	•	Pixel art style, resolution of character/vehicle sprites around 64x32
	•	Environments and vehicles match the pixel-art style of examples provided
	•	Use placeholder sprites for testing if necessary; support sprite loading from external folder (e.g., /sprites/microlets/)

⸻

🛠 Technical Requirements
	•	Framework: Use HTML5 + JavaScript (or TypeScript) with Phaser.js, Kaboom.js, or Godot (Web export)
	•	Controls: Arrow keys (or WASD) for movement, space for action (e.g., jump or honk)
	•	Level Design: Basic tile-based or scroll-triggered continuous world
	•	Parallax: Implement 3+ background layers (sky/mountains, buildings, roadside objects)
	•	Code Structure: Modular with components for:
	•	Player vehicle
	•	Environment rendering
	•	Scrolling logic
	•	Input handling
	•	Sprite loading
	•	Collision & pickup handling

⸻

✅ Stretch Goals (if time allows)
	•	Add music/SFX from Timorese sources
	•	Support switching vehicles mid-game
	•	Add racing NPCs (other microlets)
	•	Localized Tetum text overlays or signs