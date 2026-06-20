// Minimal leaderboard API wrapper
// For hackathon: localStorage fallback; replace ENDPOINT with your serverless URL later
(function(){
  const STORAGE_KEY = 'mr_leaderboard_local';
  const ENDPOINT = '/api/leaderboard';

  async function submit(name, score) {
    try {
      await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, score }) });
    } catch (_) { /* ignore and fallback */ }
    // Local fallback
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    list.push({ name, score, ts: Date.now() });
    list.sort((a,b) => b.score - a.score);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
  }

  async function top(n=20) {
    try {
      const res = await fetch(`${ENDPOINT}?limit=${n}`);
      if (res.ok) return (await res.json()).slice(0, n);
    } catch (_) {}
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return list.slice(0, n);
  }

  window.MRLeaderboard = { submit, top };
})();


