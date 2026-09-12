// AudioEngine: Singleton Web Audio API manager for stream analysis, DSP filtering, and live stream capture

import { AudioEnhancements } from "../types";

class AudioEngine {
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;
  private vocalFilter: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private attachedElement: HTMLAudioElement | null = null;
  private isInitialized = false;

  // Stream capture tap nodes for live translation
  private captureProcessor: ScriptProcessorNode | null = null;
  private captureSilentGain: GainNode | null = null;
  private onCaptureCallback: ((inputData: Float32Array, sampleRate: number) => void) | null = null;

  public init(audioElement: HTMLAudioElement): boolean {
    if (typeof window === "undefined") return false;
    if (this.attachedElement === audioElement && this.isInitialized && this.sourceNode) {
      return true;
    }

    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioCtx();
      }

      if (this.audioContext.state === "suspended") {
        this.audioContext.resume().catch(() => {});
      }

      // Connect element only once per HTMLAudioElement instance
      if (!this.sourceNode || this.attachedElement !== audioElement) {
        this.attachedElement = audioElement;
        try {
          this.sourceNode = this.audioContext.createMediaElementSource(audioElement);
        } catch (mediaErr: any) {
          // If already attached, reuse existing sourceNode or log warning
          console.warn("[AudioEngine] MediaElementAudioSource creation note:", mediaErr?.message || mediaErr);
        }
      }

      if (!this.sourceNode) {
        return false;
      }

      // Create DSP nodes if not created
      if (!this.bassFilter) {
        this.bassFilter = this.audioContext.createBiquadFilter();
        this.bassFilter.type = "lowshelf";
        this.bassFilter.frequency.value = 120; // 120Hz bass
        this.bassFilter.gain.value = 0;
      }

      if (!this.trebleFilter) {
        this.trebleFilter = this.audioContext.createBiquadFilter();
        this.trebleFilter.type = "highshelf";
        this.trebleFilter.frequency.value = 3500; // 3.5kHz treble
        this.trebleFilter.gain.value = 0;
      }

      if (!this.vocalFilter) {
        this.vocalFilter = this.audioContext.createBiquadFilter();
        this.vocalFilter.type = "peaking";
        this.vocalFilter.frequency.value = 2000; // 2kHz vocal clarity
        this.vocalFilter.Q.value = 1.0;
        this.vocalFilter.gain.value = 0;
      }

      if (!this.gainNode) {
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 1.0;
      }

      if (!this.analyserNode) {
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 512;
        this.analyserNode.smoothingTimeConstant = 0.85;
      }

      if (!this.isInitialized) {
        // Wire main audio graph: Source -> Bass -> Treble -> Vocal -> Gain -> Analyser -> Destination
        this.sourceNode.connect(this.bassFilter);
        this.bassFilter.connect(this.trebleFilter);
        this.trebleFilter.connect(this.vocalFilter);
        this.vocalFilter.connect(this.gainNode);
        this.gainNode.connect(this.analyserNode);
        this.analyserNode.connect(this.audioContext.destination);
        this.isInitialized = true;
      }

      return true;
    } catch (err) {
      console.warn("[AudioEngine] Web Audio graph initialization notice:", err);
      return false;
    }
  }

  public async resume(): Promise<void> {
    if (this.audioContext && this.audioContext.state === "suspended") {
      try {
        await this.audioContext.resume();
      } catch (e) {
        console.warn("[AudioEngine] Context resume error:", e);
      }
    }
  }

  public applyEnhancements(enhancements: AudioEnhancements): void {
    if (!this.audioContext) return;
    const now = this.audioContext.currentTime;

    // bassBoost: 0-100 (50 is neutral, 0 is -10dB, 100 is +14dB)
    if (this.bassFilter) {
      const bassGain = (enhancements.bassBoost - 50) * 0.28;
      this.bassFilter.gain.setTargetAtTime(bassGain, now, 0.05);
    }

    // treble: 0-100 (50 is neutral, 0 is -10dB, 100 is +12dB)
    if (this.trebleFilter) {
      const trebleGain = (enhancements.treble - 50) * 0.24;
      this.trebleFilter.gain.setTargetAtTime(trebleGain, now, 0.05);
    }

    // vocalClarity: 0-100 (50 is neutral, 0 is -6dB, 100 is +10dB)
    if (this.vocalFilter) {
      const vocalGain = (enhancements.vocalClarity - 50) * 0.2;
      this.vocalFilter.gain.setTargetAtTime(vocalGain, now, 0.05);
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyserNode;
  }

  public getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  public getSourceNode(): MediaElementAudioSourceNode | null {
    return this.sourceNode;
  }

  public setDuckAudio(duck: boolean): void {
    if (!this.gainNode || !this.audioContext) return;
    const target = duck ? 0.2 : 1.0;
    this.gainNode.gain.setTargetAtTime(target, this.audioContext.currentTime, 0.1);
  }

  /**
   * Taps audio directly from the shared source node for live AI transcription & translation.
   * Connects via a silent gain node to destination to ensure onaudioprocess fires continuously
   * without duplicating or corrupting output audio.
   */
  public startCapture(callback: (inputData: Float32Array, sampleRate: number) => void): boolean {
    if (typeof window === "undefined") return false;

    if (!this.sourceNode || !this.audioContext) {
      const audioEl = document.querySelector("audio");
      if (audioEl) {
        this.init(audioEl);
      }
    }

    if (!this.audioContext || !this.sourceNode) {
      console.warn("[AudioEngine] Cannot capture audio: No audio context or source node initialized");
      return false;
    }

    if (this.audioContext.state === "suspended") {
      this.audioContext.resume().catch(() => {});
    }

    this.stopCapture();

    this.onCaptureCallback = callback;
    try {
      this.captureProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
      this.captureSilentGain = this.audioContext.createGain();
      this.captureSilentGain.gain.value = 0; // Silent tap: no duplicate sound to speakers

      this.sourceNode.connect(this.captureProcessor);
      this.captureProcessor.connect(this.captureSilentGain);
      this.captureSilentGain.connect(this.audioContext.destination);

      this.captureProcessor.onaudioprocess = (e) => {
        if (this.onCaptureCallback) {
          const channelData = e.inputBuffer.getChannelData(0);
          this.onCaptureCallback(channelData, e.inputBuffer.sampleRate);
        }
      };
      return true;
    } catch (err) {
      console.error("[AudioEngine] Failed to attach capture tap:", err);
      return false;
    }
  }

  public stopCapture(): void {
    if (this.captureProcessor) {
      this.captureProcessor.onaudioprocess = null;
      try {
        if (this.sourceNode) {
          this.sourceNode.disconnect(this.captureProcessor);
        }
      } catch (e) {}
      try {
        this.captureProcessor.disconnect();
      } catch (e) {}
      this.captureProcessor = null;
    }

    if (this.captureSilentGain) {
      try {
        this.captureSilentGain.disconnect();
      } catch (e) {}
      this.captureSilentGain = null;
    }

    this.onCaptureCallback = null;
  }
}

export const audioEngine = new AudioEngine();
