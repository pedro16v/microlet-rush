// Procedural audio via the Web Audio API - no asset files. Creates short
// oscillator/noise SFX and a lightweight stepped music loop per level theme.
// Shared across scenes via the Phaser registry.
class AudioManager {
    constructor(saveManager) {
        this.save = saveManager || null;
        this.ctx = null;
        this.master = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.muted = this.save ? !!this.save.get('muted') : false;
        this.volume = this.save ? this.save.get('volume') : 0.7;

        // music sequencer state
        this._musicTimer = null;
        this._step = 0;
        this._scale = [220, 277, 330, 440, 554];
        this._tempo = 320;        // ms per step
        this._speedFactor = 1;    // tightens with game speed
    }

    _ensure() {
        if (this.ctx) return;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : this.volume;
        this.master.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.35;
        this.musicGain.connect(this.master);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 1.0;
        this.sfxGain.connect(this.master);
    }

    // Call from a user gesture (click / keydown) to satisfy autoplay policy.
    unlock() {
        this._ensure();
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }

    setMuted(muted) {
        this.muted = muted;
        if (this.save) this.save.set('muted', muted);
        if (this.master) {
            this.master.gain.setTargetAtTime(muted ? 0 : this.volume, this.ctx.currentTime, 0.02);
        }
    }

    toggleMute() { this.setMuted(!this.muted); return this.muted; }

    // ---- low level helpers ----
    _tone(freq, dur, type, gain, when) {
        if (!this.ctx) return;
        const t = when || this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = type || 'square';
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(gain || 0.3, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + dur + 0.02);
    }

    _sweep(f0, f1, dur, type, gain) {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = type || 'sawtooth';
        osc.frequency.setValueAtTime(f0, t);
        osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(gain || 0.3, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + dur + 0.02);
    }

    _noise(dur, gain, cutoff) {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const frames = Math.floor(this.ctx.sampleRate * dur);
        const buffer = this.ctx.createBuffer(1, frames, this.ctx.sampleRate);
        const ch = buffer.getChannelData(0);
        for (let i = 0; i < frames; i++) ch[i] = Math.random() * 2 - 1;
        const src = this.ctx.createBufferSource();
        src.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = cutoff || 1200;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(gain || 0.4, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(filter);
        filter.connect(g);
        g.connect(this.sfxGain);
        src.start(t);
        src.stop(t + dur + 0.02);
    }

    // ---- SFX ----
    sfx(name) {
        this._ensure();
        if (!this.ctx) return;
        switch (name) {
            case 'coin':
                this._tone(880, 0.08, 'square', 0.25);
                this._tone(1320, 0.10, 'square', 0.22, this.ctx.currentTime + 0.06);
                break;
            case 'passenger':
                this._tone(523, 0.10, 'triangle', 0.28);
                this._tone(659, 0.10, 'triangle', 0.26, this.ctx.currentTime + 0.08);
                this._tone(784, 0.14, 'triangle', 0.26, this.ctx.currentTime + 0.16);
                break;
            case 'fuel':
                this._sweep(300, 700, 0.18, 'sine', 0.3);
                break;
            case 'powerup':
                this._sweep(400, 1200, 0.30, 'sawtooth', 0.25);
                break;
            case 'hit':
                this._noise(0.22, 0.5, 900);
                this._sweep(180, 60, 0.22, 'square', 0.35);
                break;
            case 'shield':
                this._tone(660, 0.12, 'sine', 0.3);
                this._tone(990, 0.18, 'sine', 0.25, this.ctx.currentTime + 0.1);
                break;
            case 'levelup':
                [523, 659, 784, 1047].forEach((f, i) => {
                    this._tone(f, 0.16, 'triangle', 0.3, this.ctx.currentTime + i * 0.12);
                });
                break;
            case 'gameover':
                [440, 349, 277, 220].forEach((f, i) => {
                    this._tone(f, 0.28, 'sawtooth', 0.3, this.ctx.currentTime + i * 0.18);
                });
                break;
            case 'click':
                this._tone(600, 0.05, 'square', 0.18);
                break;
        }
    }

    // ---- music ----
    startMusic(scale, tempo) {
        this._ensure();
        if (!this.ctx) return;
        if (scale) this._scale = scale;
        this._tempo = tempo || 320;
        this.stopMusic();
        this._step = 0;
        const tick = () => {
            this._playStep();
            this._musicTimer = setTimeout(tick, this._tempo / this._speedFactor);
        };
        tick();
    }

    setMusicIntensity(factor) {
        // 1.0 = base tempo; higher = faster. Clamped for sanity.
        this._speedFactor = Math.max(1, Math.min(1.6, factor));
    }

    _playStep() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const scale = this._scale;
        // bass: root every 2 steps
        if (this._step % 2 === 0) {
            const bass = scale[0] / 2;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = bass;
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(0.5, t + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
            osc.connect(g); g.connect(this.musicGain);
            osc.start(t); osc.stop(t + 0.3);
        }
        // arpeggio note
        const note = scale[(this._step * 2) % scale.length];
        const osc2 = this.ctx.createOscillator();
        const g2 = this.ctx.createGain();
        osc2.type = 'square';
        osc2.frequency.value = note;
        g2.gain.setValueAtTime(0.0001, t);
        g2.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
        g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        osc2.connect(g2); g2.connect(this.musicGain);
        osc2.start(t); osc2.stop(t + 0.2);

        this._step = (this._step + 1) % 16;
    }

    stopMusic() {
        if (this._musicTimer) {
            clearTimeout(this._musicTimer);
            this._musicTimer = null;
        }
    }
}
