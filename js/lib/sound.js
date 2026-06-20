window.MRSound = {
  play(scene, key, opts) {
    try { scene.sound.play(key, Object.assign({ volume: 0.6 }, opts)); } catch (_) {}
  }
};


