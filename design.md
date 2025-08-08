# Microlet Rush: Timor Streets – Agile Design Document

---

## 1. Product Vision
A fast-paced mobile web game where players weave through Timor-Leste traffic to board the correct colourful microlet. Inspired by classic arcade titles and Timorese street life, the game is simple to learn, difficult to master, and globally shareable through a real-time leaderboard.

Goals:
1. Deliver an engaging MVP playable in any modern mobile browser.
2. Showcase Timor-Leste culture through pixel-art microlets and scenery.
3. Use AI agents to automate art generation, code scaffolding, testing, and deployment for rapid iteration.

---

## 2. AI-Driven Development Principles
1. **Single Source of Truth** – This document drives automated backlog generation and validation.
2. **Task Granularity** – All stories are atomic (≤ 1 day). Agents can pick them up independently.
3. **Continuous Delivery** – Each merged PR auto-deploys to a staging URL for play-testing.
4. **Observable Definition of Done (DoD)** – Every story includes code, assets, tests, and lint-passing status.
5. **Human Oversight Loop** – Review checkpoints after each milestone ensure design alignment.

---

## 3. Release Plan (High-level Milestones)
| Sprint | Duration | Goal |
| ------ | -------- | ---- |
| **Sprint 0 – Setup** | 3 days | Repo scaffolding, CI/CD, asset pipeline, playable blank Phaser scene |
| **Sprint 1 – MVP Core** | 7 days | Player movement, traffic lanes, collision, scoring, lives |
| **Sprint 2 – Polish** | 7 days | Microlet differentiation, animations, SFX/music, UI/UX pass |
| **Sprint 3 – Leaderboard & Launch** | 5 days | Cloud leaderboard, PWA packaging, production deploy |

Timelines assume high agent parallelism; adjust with velocity data.

---

## 4. Epics, Stories & Acceptance Criteria

### Epic A: Player Setup & Settings
| ID | User Story | Acceptance Criteria |
|----|------------|---------------------|
| A-1 | *As a new player, I can enter my name so that scores are personalised.* | 1) Name prompt on first load.<br>2) Stored in local-storage.<br>3) Validated (3-15 alphanum chars). |
| A-2 | *As a returning player, I skip the prompt and go straight to the game.* | 1) Name auto-pre-filled.<br>2) Edit button available in UI. |

### Epic B: Core Gameplay
| ID | User Story | Acceptance Criteria |
| B-1 | *As a player, I can move left/right and up/down between lanes using on-screen arrows, swipe gestures, or keyboard.* | 1) Smooth 60 fps movement; blockers prevent off-screen travel.<br>2) Swipe gestures trigger the same actions without causing page scroll (`preventDefault` on touch events).<br>3) The game canvas fills the viewport and locks scrolling during gameplay. |
| B-2 | *As a player, I see three lanes with microlets driving left ⇄ right at varied speeds.* | Randomised spawn side & speed; lane-specific point multipliers display. |
| B-3 | *As a player, I collide with microlets and lose one of three lives with a "Maromak!!" comic pop.* | Life counter decrements; character reset to sidewalk; red screen flash <500 ms. |
| B-4 | *As a player, I view my score and the target microlet colour at the top.* | HUD updates every frame; target microlet cycles after capture. |
| B-5 | *As a player, the game ends when lives = 0 and I see my final score.* | End screen with "Play Again" & "Leaderboard" buttons. |

### Epic C: Leaderboard & Social
| ID | User Story | Acceptance Criteria |
| C-1 | *As a player, my final score posts to a shared online leaderboard.* | REST endpoint stores {name, score, ts}. |
| C-2 | *As a player, I can view the top 20 scores globally.* | Sorted descending; highlights my latest entry if present. |
| C-3 | *As a player, I can share my score via native share sheet.* | Web share API fallback copy-to-clipboard. |

### Epic D: Infrastructure & DevOps
| ID | User Story | Acceptance Criteria |
| D-1 | *As a developer, pushes run lint, unit tests, and e2e “smoke” playthroughs in CI.* | GitHub Actions pipeline green. |
| D-2 | *As a developer, merges auto-deploy to Vercel staging with version tag.* | Public URL comment on PR. |
| D-3 | *As a developer, production deploy promotes latest green tag when command `/release` is issued.* | Tag recorded in CHANGELOG. |

---

## 5. Technical Stack & Architecture
- **Engine:** Phaser 3 + TypeScript
- **Build:** Vite
- **Input:** Touch & pointer events (swipe detection via Phaser built-in or Hammer.js); page scroll locked with CSS (`touch-action: none`)
- **Hosting:** Vercel (static + serverless leaderboard functions)
- **Data:** PlanetScale (MySQL) via Prisma or simple KV if traffic low
- **Testing:** Vitest (unit) + Playwright (e2e)
- **CI/CD:** GitHub Actions → Vercel previews → Production promote
- **Lint:** ESLint + Prettier + Stylelint

Folder Guideline:
```
src/
  scenes/
  components/
  assets/    // compiled from sprites/
  ui/
  lib/
``` 

---

## 6. Asset Pipeline
1. Raw pixel art placed in `sprites/` (already present).
2. AI agent "SpriteChef" trims, packs, and outputs sprite-sheets to `public/assets/`.
3. Atlas JSON auto-generated and committed with hash naming for cache-bust.
4. Optimisation step (tinypng) runs in CI.

---

## 7. Definition of Done Checklist (per Story)
- [ ] Code & assets committed
- [ ] Unit tests pass & coverage ≥ 80 % for touched lines
- [ ] ESLint / Prettier clean
- [ ] Storybook or equivalent preview (for UI)
- [ ] Playwright scenario updated
- [ ] Documentation snippet appended to `/docs/`

---

## 8. Open Questions
1. How should swipe gesture sensitivity adapt to different screen sizes?
2. Should leaderboard require backend auth or remain open?
3. What is the minimum device spec (screen size & performance)?

---

*End of document – last updated by AI agent on 2025-08-08.*