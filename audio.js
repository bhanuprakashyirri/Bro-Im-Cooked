/**
 * BRO, I'M COOKED 💀 - Audio Engine
 * High-performance Web Audio API Procedural Synthesizer & Sound FX Hooks.
 * Generates realistic classroom ambience, ceiling fan drone, clicks, notifications,
 * warning pulses, footsteps, and dramatic caught stinger.
 * Supports custom audio asset URLs with automatic procedural fallback.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.ambientGain = null;
    this.sfxGain = null;
    this.isAmbientPlaying = false;
    this.fanOsc = null;
    this.fanNoiseNode = null;
    this.warningInterval = null;

    // Optional custom file paths can be injected here
    this.customSounds = {
      click: null,
      notification: null,
      warning: null,
      caught: null,
      footsteps: null
    };
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Ambience Bus
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      this.ambientGain.connect(this.ctx.destination);

      // SFX Bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.sfxGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Web Audio API not supported on this browser:", e);
    }
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.ctx) {
      const masterVal = this.isMuted ? 0 : 0.35;
      const ambVal = this.isMuted ? 0 : 0.18;
      this.sfxGain.gain.setTargetAtTime(masterVal, this.ctx.currentTime, 0.05);
      this.ambientGain.gain.setTargetAtTime(ambVal, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  /**
   * Start looping background classroom ambience:
   * Ceiling fan rhythmic whoosh + subtle low room tone + chalk scratches.
   */
  startClassroomAmbience() {
    if (this.isAmbientPlaying) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      // 1. Gentle low room drone
      const roomOsc = this.ctx.createOscillator();
      const roomGain = this.ctx.createGain();
      roomOsc.type = 'sine';
      roomOsc.frequency.setValueAtTime(65, this.ctx.currentTime);
      roomGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      roomOsc.connect(roomGain);
      roomGain.connect(this.ambientGain);
      roomOsc.start();

      // 2. Ceiling fan whoosh using filtered noise buffer
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const fanFilter = this.ctx.createBiquadFilter();
      fanFilter.type = 'bandpass';
      fanFilter.frequency.setValueAtTime(280, this.ctx.currentTime);
      fanFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

      // Fan LFO to create rhythmic blade revolution whoosh
      const fanLfo = this.ctx.createOscillator();
      const fanLfoGain = this.ctx.createGain();
      fanLfo.frequency.setValueAtTime(1.2, this.ctx.currentTime); // ~1.2 Hz fan rotation
      fanLfoGain.gain.setValueAtTime(120, this.ctx.currentTime);
      fanLfo.connect(fanFilter.frequency);

      const fanGain = this.ctx.createGain();
      fanGain.gain.setValueAtTime(0.07, this.ctx.currentTime);

      whiteNoise.connect(fanFilter);
      fanFilter.connect(fanGain);
      fanGain.connect(this.ambientGain);

      fanLfo.start();
      whiteNoise.start();

      this.isAmbientPlaying = true;
    } catch (err) {
      console.warn("Could not start audio ambience:", err);
    }
  }

  /**
   * Crisp UI Button click sound
   */
  playClick() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  /**
   * Action sound (typing keys, page turn, or phone tap)
   */
  playActionSound(type) {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    if (type === 'type') {
      // Rapid keyboard clack
      for (let i = 0; i < 3; i++) {
        const offset = i * 0.04;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800 + Math.random() * 600, t + offset);
        gain.gain.setValueAtTime(0.08, t + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.03);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t + offset);
        osc.stop(t + offset + 0.03);
      }
    } else if (type === 'study') {
      // Soft paper scribble
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.linearRampToValueAtTime(880, t + 0.12);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.12);
    } else if (type === 'phone') {
      // Phone notification pop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, t); // D5
      osc.frequency.setValueAtTime(880, t + 0.06); // A5
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.18);
    } else if (type === 'sleep') {
      // Gentle snooze sigh tone
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(160, t + 0.28);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.28);
    }
  }

  /**
   * Notification sound for random events & incoming WhatsApp message
   */
  playNotification() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const notes = [659.25, 880, 1046.5]; // E5, A5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = t + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }

  /**
   * Phone Ringtone (for phone ringing event)
   */
  playPhoneRing() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Classic marimba/bell sequence
    const notes = [1318.51, 1174.66, 783.99, 880, 1046.5];
    notes.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + idx * 0.09;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, start);
      gain.gain.setValueAtTime(0.28, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(start);
      osc.stop(start + 0.15);
    });
  }

  /**
   * Warning Sound (Suspicion >= 75%)
   */
  playWarningPulse() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(330, t + 0.15);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  /**
   * Heavy professor footsteps approaching desk
   */
  playFootsteps(count = 3) {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    for (let i = 0; i < count; i++) {
      const stepTime = t + i * 0.35;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(90 - i * 5, stepTime);
      osc.frequency.exponentialRampToValueAtTime(30, stepTime + 0.12);

      gain.gain.setValueAtTime(0.35 + i * 0.08, stepTime);
      gain.gain.exponentialRampToValueAtTime(0.001, stepTime + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(stepTime);
      osc.stop(stepTime + 0.15);
    }
  }

  /**
   * Dramatic "DUN DUN DUN" Caught Stinger
   */
  playCaughtStinger() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const chords = [
      { freqs: [130.81, 155.56, 196.00], time: 0, dur: 0.3 },      // C minor
      { freqs: [123.47, 146.83, 185.00], time: 0.35, dur: 0.3 },   // B dim
      { freqs: [110.00, 138.59, 164.81], time: 0.72, dur: 0.9 }    // A minor heavy sting
    ];

    chords.forEach(c => {
      c.freqs.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = t + c.time;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.24, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + c.dur);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(start);
        osc.stop(start + c.dur);
      });
    });
  }

  /**
   * Cheerful Class Survived Fanfare
   */
  playSuccessFanfare() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Classic victory arpeggio: C4, G4, C5, E5, G5, C6
    const notes = [
      { f: 261.63, d: 0.14 },
      { f: 392.00, d: 0.14 },
      { f: 523.25, d: 0.14 },
      { f: 659.25, d: 0.18 },
      { f: 783.99, d: 0.25 },
      { f: 1046.50, d: 0.7 }
    ];

    let offset = 0;
    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + offset;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, start);

      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + n.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(start);
      osc.stop(start + n.d);
      offset += (n.d * 0.85);
    });
  }

  /**
   * Sad trombone / failure sound
   */
  playFailureSound() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const notes = [311.13, 293.66, 277.18, 246.94]; // Eb4, D4, C#4, B3
    notes.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + idx * 0.28;
      const dur = idx === 3 ? 0.8 : 0.25;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, start);
      if (idx === 3) {
        // Slide down at the end
        osc.frequency.linearRampToValueAtTime(220, start + 0.7);
      }

      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(start);
      osc.stop(start + dur);
    });
  }
}

// Global instance
window.soundEngine = new SoundEngine();
