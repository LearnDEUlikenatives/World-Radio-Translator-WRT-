import React, { useEffect, useRef, useState } from "react";
import { VisualizerMode } from "../types";
import { audioEngine } from "../services/audioEngine";
import { Activity, BarChart2, Disc, Gauge, Sparkles } from "lucide-react";

interface AudioVisualizerProps {
  isPlaying: boolean;
  mode: VisualizerMode;
  onModeChange: (mode: VisualizerMode) => void;
  className?: string;
}

export default function AudioVisualizer({
  isPlaying,
  mode,
  onModeChange,
  className = ""
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Peak hold data for spectrum mode
  const peaksRef = useRef<number[]>([]);
  // Smoothed VU values for meter mode
  const vuLeftRef = useRef<number>(0);
  const vuRightRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    const updateSize = () => {
      if (!container || !canvas) return;
      const dpr = window.devicePixelRatio || 1;
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(container);

    let idleAngle = 0;

    const render = () => {
      const analyser = audioEngine.getAnalyser();
      ctx.clearRect(0, 0, width, height);

      const bufferLength = analyser ? analyser.frequencyBinCount : 256;
      const freqData = new Uint8Array(bufferLength);
      const timeData = new Uint8Array(bufferLength);

      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(freqData);
        analyser.getByteTimeDomainData(timeData);
      } else {
        // Generate simulated soothing idle ambient waveform
        idleAngle += 0.03;
        for (let i = 0; i < bufferLength; i++) {
          const norm = i / bufferLength;
          timeData[i] = 128 + Math.sin(idleAngle + norm * 6) * 12 + Math.cos(idleAngle * 0.5 + norm * 12) * 6;
          freqData[i] = Math.max(0, 30 + Math.sin(idleAngle * 1.5 + norm * 8) * 20);
        }
      }

      // --- 1. Neon Oscilloscope ---
      if (mode === "oscilloscope") {
        ctx.save();
        ctx.lineWidth = 2.5;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        // Neon Glow
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#10b981";
        ctx.strokeStyle = "#34d399";

        ctx.beginPath();
        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();

        // Center line subtle guide
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(16, 185, 129, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.restore();
      }

      // --- 2. Multi-band Spectrum Bars ---
      else if (mode === "spectrum") {
        const barCount = Math.min(48, Math.floor(width / 8));
        const barWidth = (width / barCount) - 3;
        const step = Math.floor(bufferLength / barCount);

        if (peaksRef.current.length !== barCount) {
          peaksRef.current = new Array(barCount).fill(0);
        }

        for (let i = 0; i < barCount; i++) {
          let sum = 0;
          for (let j = 0; j < step; j++) {
            sum += freqData[i * step + j] || 0;
          }
          const avg = sum / step;
          const barHeight = (avg / 255) * (height - 18);

          // Peak falloff
          if (barHeight > peaksRef.current[i]) {
            peaksRef.current[i] = barHeight;
          } else {
            peaksRef.current[i] = Math.max(0, peaksRef.current[i] - 1.2);
          }

          const x = i * (barWidth + 3);
          const y = height - barHeight - 4;

          // Gradient bar
          const grad = ctx.createLinearGradient(0, height, 0, 0);
          grad.addColorStop(0, "#059669"); // Emerald deep
          grad.addColorStop(0.6, "#10b981"); // Emerald light
          grad.addColorStop(1, "#38bdf8"); // Sky cyan

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
          ctx.fill();

          // Peak hold dot
          ctx.fillStyle = "#6ee7b7";
          const peakY = height - peaksRef.current[i] - 7;
          ctx.fillRect(x, Math.max(2, peakY), barWidth, 2);
        }
      }

      // --- 3. Circular Waveform ---
      else if (mode === "circular") {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) * 0.52;

        ctx.save();
        ctx.translate(centerX, centerY);

        // Ambient inner core
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.75, 0, Math.PI * 2);
        ctx.fillStyle = isPlaying ? "rgba(16, 185, 129, 0.08)" : "rgba(100, 116, 139, 0.05)";
        ctx.fill();
        ctx.strokeStyle = "rgba(16, 185, 129, 0.25)";
        ctx.lineWidth = 1;
        ctx.stroke();

        const numRays = 72;
        const rayStep = Math.floor(bufferLength / numRays);

        for (let i = 0; i < numRays; i++) {
          const angle = (i / numRays) * Math.PI * 2;
          const val = (freqData[i * rayStep] || 0) / 255;
          const rayLen = radius + val * (radius * 0.7);

          const x1 = Math.cos(angle) * radius;
          const y1 = Math.sin(angle) * radius;
          const x2 = Math.cos(angle) * rayLen;
          const y2 = Math.sin(angle) * rayLen;

          const rayGrad = ctx.createLinearGradient(x1, y1, x2, y2);
          rayGrad.addColorStop(0, "#10b981");
          rayGrad.addColorStop(1, "#06b6d4");

          ctx.strokeStyle = rayGrad;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        ctx.restore();
      }

      // --- 4. Minimalist VU Meter ---
      else if (mode === "vu_meter") {
        // Calculate average RMS for Left and Right channels
        let rmsLeft = 0;
        let rmsRight = 0;
        const half = Math.floor(bufferLength / 2);

        for (let i = 0; i < half; i++) {
          const valL = (timeData[i] - 128) / 128;
          rmsLeft += valL * valL;
        }
        for (let i = half; i < bufferLength; i++) {
          const valR = (timeData[i] - 128) / 128;
          rmsRight += valR * valR;
        }

        rmsLeft = Math.sqrt(rmsLeft / half);
        rmsRight = Math.sqrt(rmsRight / half);

        // Smooth ballistic response
        vuLeftRef.current += (rmsLeft - vuLeftRef.current) * 0.18;
        vuRightRef.current += (rmsRight - vuRightRef.current) * 0.18;

        const meterW = Math.min(220, width / 2 - 24);
        const meterH = height - 32;

        const drawSingleVUMeter = (centerX: number, value: number, label: string) => {
          const baseY = height - 12;
          const needleLength = Math.min(meterW * 0.85, meterH * 0.85);

          // Arc background scale
          ctx.save();
          ctx.beginPath();
          ctx.arc(centerX, baseY, needleLength, -Math.PI * 0.75, -Math.PI * 0.25);
          ctx.strokeStyle = "rgba(100, 116, 139, 0.2)";
          ctx.lineWidth = 4;
          ctx.stroke();

          // Overdrive red zone (top 15%)
          ctx.beginPath();
          ctx.arc(centerX, baseY, needleLength, -Math.PI * 0.33, -Math.PI * 0.25);
          ctx.strokeStyle = "#f43f5e";
          ctx.lineWidth = 5;
          ctx.stroke();

          // Ticks and labels
          const ticks = [
            { db: "-20", angle: -Math.PI * 0.75 },
            { db: "-10", angle: -Math.PI * 0.62 },
            { db: "-5", angle: -Math.PI * 0.5 },
            { db: "0", angle: -Math.PI * 0.35 },
            { db: "+3", angle: -Math.PI * 0.25 }
          ];

          ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
          ctx.font = "8px monospace";
          ctx.textAlign = "center";

          ticks.forEach((t) => {
            const tx = centerX + Math.cos(t.angle) * (needleLength + 10);
            const ty = baseY + Math.sin(t.angle) * (needleLength + 10);
            ctx.fillText(t.db, tx, ty);
          });

          // Needle deflection angle mapped between -0.75PI and -0.25PI
          const minAngle = -Math.PI * 0.74;
          const maxAngle = -Math.PI * 0.26;
          const targetAngle = minAngle + Math.min(1, Math.max(0, value * 2.8)) * (maxAngle - minAngle);

          // Needle line
          ctx.shadowBlur = 6;
          ctx.shadowColor = value > 0.8 ? "#f43f5e" : "#10b981";
          ctx.strokeStyle = value > 0.8 ? "#f43f5e" : "#10b981";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(centerX, baseY);
          ctx.lineTo(
            centerX + Math.cos(targetAngle) * needleLength,
            baseY + Math.sin(targetAngle) * needleLength
          );
          ctx.stroke();

          // Pivot cap
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#334155";
          ctx.beginPath();
          ctx.arc(centerX, baseY, 5, 0, Math.PI * 2);
          ctx.fill();

          // Channel Label
          ctx.fillStyle = "#94a3b8";
          ctx.font = "bold 10px monospace";
          ctx.fillText(label, centerX, baseY - needleLength * 0.4);

          ctx.restore();
        };

        const leftCenter = width / 4;
        const rightCenter = (width * 3) / 4;
        drawSingleVUMeter(leftCenter, vuLeftRef.current, "CH 1 (L)");
        drawSingleVUMeter(rightCenter, vuRightRef.current, "CH 2 (R)");
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      resizeObserver.disconnect();
    };
  }, [mode, isPlaying]);

  return (
    <div className={`relative flex flex-col bg-slate-900/90 dark:bg-slate-950/90 rounded-2xl border border-slate-800/80 p-3 shadow-inner ${className}`}>
      {/* Top Header & Mode Toggle Bar */}
      <div className="flex items-center justify-between mb-2 z-10 px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPlaying ? "bg-emerald-400" : "bg-slate-500"} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? "bg-emerald-500" : "bg-slate-400"}`}></span>
          </span>
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-300">
            {isPlaying ? "Live DSP Frequency Scope" : "Scope Ready (Standby)"}
          </span>
        </div>

        {/* Visualizer Mode Switchers */}
        <div className="flex items-center gap-1 bg-slate-850/80 p-1 rounded-xl border border-slate-750/70">
          <button
            onClick={() => onModeChange("oscilloscope")}
            className={`p-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-all ${
              mode === "oscilloscope"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Neon Oscilloscope waveform"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px]">Wave</span>
          </button>

          <button
            onClick={() => onModeChange("spectrum")}
            className={`p-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-all ${
              mode === "spectrum"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Multi-band Spectrum Bars"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px]">Bars</span>
          </button>

          <button
            onClick={() => onModeChange("circular")}
            className={`p-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-all ${
              mode === "circular"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Circular Radar Waveform"
          >
            <Disc className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px]">Radial</span>
          </button>

          <button
            onClick={() => onModeChange("vu_meter")}
            className={`p-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-all ${
              mode === "vu_meter"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Analog Ballistic VU Meter"
          >
            <Gauge className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px]">VU</span>
          </button>
        </div>
      </div>

      {/* Canvas container with ResizeObserver */}
      <div ref={containerRef} className="w-full h-32 md:h-36 relative overflow-hidden rounded-xl bg-black/40 border border-slate-800/40">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
}
