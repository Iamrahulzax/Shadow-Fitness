/**
 * Procedural Web Audio API Sound Synthesizer for Shadow Fitness
 * Zero external audio files required, low latency, custom styled for game HUD.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction to comply with browser autoplay policies
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // Generic tone generator
  private playTone(freq: number, type: OscillatorType, duration: number, gainValue: number = 0.2, delay: number = 0) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);

      gain.gain.setValueAtTime(gainValue, this.ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + duration);
    } catch {
      // Ignore audio failure if unsupported
    }
  }

  // System UI Click / HUD Chirp
  public playClick() {
    this.playTone(880, 'sine', 0.05, 0.08);
  }

  // Stat point allocation chirp
  public playStatUp() {
    this.playTone(587.33, 'triangle', 0.08, 0.15, 0);
    this.playTone(880, 'triangle', 0.12, 0.2, 0.06);
  }

  // Quest Completed / Checkbox Ding
  public playQuestComplete() {
    this.playTone(523.25, 'sine', 0.15, 0.2, 0);      // C5
    this.playTone(659.25, 'sine', 0.15, 0.2, 0.08);   // E5
    this.playTone(783.99, 'sine', 0.25, 0.25, 0.16);  // G5
    this.playTone(1046.50, 'triangle', 0.4, 0.28, 0.24); // C6
  }

  // Dungeon Cleared Victory Fanfare
  public playDungeonClear() {
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'triangle', 0.35, 0.22, idx * 0.1);
    });
  }

  // Epic Level Up Cinematic Fanfare
  public playLevelUp() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      // Sub-bass boom
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(120, this.ctx.currentTime);
      bassOsc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 1.2);
      bassGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      bassGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);
      bassOsc.connect(bassGain);
      bassGain.connect(this.ctx.destination);
      bassOsc.start();
      bassOsc.stop(this.ctx.currentTime + 1.2);

      // Heroic synth progression
      const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      chords.forEach((freq, idx) => {
        this.playTone(freq, 'sawtooth', 0.5, 0.14, 0.15 + idx * 0.09);
        this.playTone(freq * 0.5, 'sine', 0.6, 0.2, 0.15 + idx * 0.09);
      });
    } catch {
      // Fallback
    }
  }

  // Loot Drop Rattle
  public playLootDrop() {
    this.playTone(300, 'square', 0.06, 0.1, 0);
    this.playTone(450, 'square', 0.06, 0.12, 0.06);
    this.playTone(600, 'square', 0.08, 0.15, 0.12);
    this.playTone(900, 'sine', 0.3, 0.2, 0.18);
  }

  // Respect / Mana Bless chime for leaderboard rivals
  public playManaSent() {
    this.playTone(659.25, 'sine', 0.08, 0.15, 0);      // E5
    this.playTone(880, 'sine', 0.12, 0.2, 0.06);       // A5
    this.playTone(1318.51, 'triangle', 0.25, 0.22, 0.12); // E6
  }

  // Leaderboard Rank climb fanfare
  public playRankUp() {
    this.playTone(440, 'triangle', 0.1, 0.2, 0);
    this.playTone(554.37, 'triangle', 0.1, 0.22, 0.08);
    this.playTone(659.25, 'triangle', 0.12, 0.25, 0.16);
    this.playTone(880, 'sawtooth', 0.35, 0.28, 0.24);
  }
}

export const soundFx = new SoundEngine();
