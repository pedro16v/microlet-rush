// Persists high scores and settings to localStorage. Safe in private mode
// (all access wrapped in try/catch; falls back to in-memory state).
class SaveManager {
    constructor() {
        this.KEY = 'microletRush.v1';
        this.data = this._load();
    }

    _defaults() {
        return {
            highScores: [],      // [{ name, score }] sorted desc, max 5
            bestPerLevel: {},    // levelId -> best score
            lastVehicle: 'silver',
            muted: false,
            volume: 0.7,
            unlockedLevel: 0
        };
    }

    _load() {
        const def = this._defaults();
        try {
            const raw = window.localStorage.getItem(this.KEY);
            if (!raw) return def;
            return Object.assign(def, JSON.parse(raw));
        } catch (e) {
            return def;
        }
    }

    _save() {
        try {
            window.localStorage.setItem(this.KEY, JSON.stringify(this.data));
        } catch (e) { /* private mode / quota: keep in-memory only */ }
    }

    get(key) { return this.data[key]; }

    set(key, value) {
        this.data[key] = value;
        this._save();
    }

    getTopScore() {
        return this.data.highScores.length ? this.data.highScores[0].score : 0;
    }

    isHighScore(score) {
        const list = this.data.highScores;
        return score > 0 && (list.length < 5 || score > list[list.length - 1].score);
    }

    submitScore(name, score) {
        this.data.highScores.push({ name: (name || 'YOU').slice(0, 6), score: score });
        this.data.highScores.sort(function (a, b) { return b.score - a.score; });
        this.data.highScores = this.data.highScores.slice(0, 5);
        this._save();
        return this.data.highScores;
    }

    recordLevelBest(levelId, score) {
        if (!this.data.bestPerLevel[levelId] || score > this.data.bestPerLevel[levelId]) {
            this.data.bestPerLevel[levelId] = score;
            this._save();
        }
    }

    unlockLevel(index) {
        if (index > this.data.unlockedLevel) {
            this.data.unlockedLevel = index;
            this._save();
        }
    }
}
