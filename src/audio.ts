import type { BreathMetrics, BreathProfileType } from './types';

export class BreathAnalyzer {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private data: Float32Array<ArrayBuffer> = new Float32Array(0);
  private amplitudes: number[] = [];
  private timestamps: number[] = [];
  private running = false;
  private rafId = 0;

  async start() {
    this.ctx = new AudioContext();
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = this.ctx.createMediaStreamSource(this.stream);
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;
    source.connect(this.analyser);
    this.data = new Float32Array(this.analyser.fftSize);
    this.amplitudes = [];
    this.timestamps = [];
    this.running = true;
    this.sample();
  }

  private sample = () => {
    if (!this.running || !this.analyser) return;
    this.analyser.getFloatTimeDomainData(this.data);
    let sum = 0;
    for (let i = 0; i < this.data.length; i++) sum += this.data[i] * this.data[i];
    const rms = Math.sqrt(sum / this.data.length);
    this.amplitudes.push(rms);
    this.timestamps.push(Date.now());
    this.rafId = requestAnimationFrame(this.sample);
  };

  getAmplitude(): number {
    if (this.amplitudes.length === 0) return 0;
    return this.amplitudes[this.amplitudes.length - 1];
  }

  stop(): BreathMetrics {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    this.stream?.getTracks().forEach(t => t.stop());
    this.ctx?.close();
    return this.analyze();
  }

  private analyze(): BreathMetrics {
    if (this.amplitudes.length < 100) {
      return { breathRate: 15, inhaleExhaleRatio: 1, pauseFrequency: 0, regularity: 0.5, avgAmplitude: 0.01 };
    }

    // Smooth amplitudes
    const windowSize = 15;
    const smoothed: number[] = [];
    for (let i = 0; i < this.amplitudes.length; i++) {
      let sum = 0, count = 0;
      for (let j = Math.max(0, i - windowSize); j <= Math.min(this.amplitudes.length - 1, i + windowSize); j++) {
        sum += this.amplitudes[j]; count++;
      }
      smoothed.push(sum / count);
    }

    // Find peaks and valleys (breath cycles)
    const threshold = smoothed.reduce((a, b) => a + b, 0) / smoothed.length;
    const crossings: { idx: number; rising: boolean }[] = [];
    
    for (let i = 1; i < smoothed.length; i++) {
      if (smoothed[i - 1] < threshold && smoothed[i] >= threshold) {
        crossings.push({ idx: i, rising: true });
      } else if (smoothed[i - 1] >= threshold && smoothed[i] < threshold) {
        crossings.push({ idx: i, rising: false });
      }
    }

    // Calculate breath cycles from rising crossings
    const risingCrossings = crossings.filter(c => c.rising);
    const totalDurationMs = this.timestamps[this.timestamps.length - 1] - this.timestamps[0];
    const totalDurationMin = totalDurationMs / 60000;
    
    const breathRate = risingCrossings.length > 1
      ? risingCrossings.length / totalDurationMin
      : 15;

    // Inhale/exhale ratio from crossing pairs
    let totalInhale = 0, totalExhale = 0, pairs = 0;
    for (let i = 0; i < crossings.length - 1; i++) {
      const dt = this.timestamps[crossings[i + 1].idx] - this.timestamps[crossings[i].idx];
      if (crossings[i].rising) {
        totalInhale += dt;
      } else {
        totalExhale += dt;
      }
      pairs++;
    }
    const inhaleExhaleRatio = totalExhale > 0 ? totalInhale / totalExhale : 1;

    // Pause detection (low amplitude periods > 1.5s)
    let pauseCount = 0;
    let lowStart = -1;
    const pauseThreshold = threshold * 0.3;
    for (let i = 0; i < smoothed.length; i++) {
      if (smoothed[i] < pauseThreshold) {
        if (lowStart === -1) lowStart = i;
      } else {
        if (lowStart !== -1) {
          const dur = this.timestamps[i] - this.timestamps[lowStart];
          if (dur > 1500) pauseCount++;
          lowStart = -1;
        }
      }
    }
    const pauseFrequency = pauseCount / totalDurationMin;

    // Regularity: std dev of cycle durations
    const cycleDurations: number[] = [];
    for (let i = 1; i < risingCrossings.length; i++) {
      cycleDurations.push(this.timestamps[risingCrossings[i].idx] - this.timestamps[risingCrossings[i - 1].idx]);
    }
    let regularity = 0.5;
    if (cycleDurations.length > 2) {
      const mean = cycleDurations.reduce((a, b) => a + b, 0) / cycleDurations.length;
      const variance = cycleDurations.reduce((a, b) => a + (b - mean) ** 2, 0) / cycleDurations.length;
      const cv = Math.sqrt(variance) / mean; // coefficient of variation
      regularity = Math.max(0, Math.min(1, 1 - cv));
    }

    const avgAmplitude = this.amplitudes.reduce((a, b) => a + b, 0) / this.amplitudes.length;

    return { breathRate, inhaleExhaleRatio, pauseFrequency, regularity, avgAmplitude };
  }
}

export function classifyProfile(m: BreathMetrics): BreathProfileType {
  // Fast + shallow
  if (m.breathRate > 20) return 'shallow-racer';
  // Irregular pauses
  if (m.pauseFrequency > 3 || m.regularity < 0.3) return 'breath-holder';
  // Short exhale (inhale > exhale significantly)
  if (m.inhaleExhaleRatio > 1.3) return 'reverse-breather';
  // High amplitude + moderate rate (chest tension)
  if (m.avgAmplitude > 0.05 && m.regularity < 0.6) return 'chest-gripper';
  // Balanced
  return 'natural-breather';
}
