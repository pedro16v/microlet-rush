// Thin client for the optional online leaderboard (server.js). Every call
// degrades gracefully: if the API isn't reachable (e.g. the game is opened from
// a plain static server or file host), online methods resolve to null/false and
// callers fall back to the local high scores in SaveManager.
window.MRLeaderboard = (function () {
    const ENDPOINT = '/api/leaderboard';
    let online = null; // null = unknown, true/false once probed

    async function submit(name, score, level) {
        try {
            const res = await fetch(ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name, score: score, level: level })
            });
            online = res.ok;
            return res.ok;
        } catch (_) {
            online = false;
            return false;
        }
    }

    async function top(n, level) {
        const q = new URLSearchParams({ limit: String(n || 20) });
        if (level) q.set('level', level);
        try {
            const res = await fetch(ENDPOINT + '?' + q.toString());
            if (!res.ok) { online = false; return null; }
            online = true;
            return await res.json();
        } catch (_) {
            online = false;
            return null;
        }
    }

    function isOnline() { return online; }

    return { submit: submit, top: top, isOnline: isOnline };
})();
