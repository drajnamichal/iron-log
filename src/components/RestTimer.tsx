import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Timer, X, Play, Pause, RotateCcw, Plus, Minus } from "lucide-react";

interface Props {
  seconds: number;
  onClose: () => void;
}

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.3;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.stop(ctx.currentTime + 0.4);

    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 1100;
      gain2.gain.value = 0.3;
      osc2.start();
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc2.stop(ctx.currentTime + 0.8);
    }, 300);
  } catch {}
}

function sendNotification(title: string) {
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { icon: "/favicon.svg", silent: false });
    }
  } catch {}
}

function requestNotificationPermission() {
  try {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  } catch {}
}

export default function RestTimer({ seconds: initial, onClose }: Props) {
  const [remaining, setRemaining] = useState(initial);
  const [running, setRunning] = useState(true);
  const [alerted, setAlerted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const reset = useCallback(() => {
    setRemaining(initial);
    setRunning(true);
    setAlerted(false);
  }, [initial]);

  const adjustTime = (delta: number) => {
    setRemaining((r) => Math.max(0, r + delta));
  };

  useEffect(() => {
    if (!running || remaining <= 0) {
      clearInterval(intervalRef.current);
      if (remaining <= 0 && !alerted) {
        setAlerted(true);
        playBeep();
        try { navigator.vibrate?.([200, 100, 200]); } catch {}
        sendNotification("Oddych skončil! Ďalšia séria.");
      }
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((r) => r - 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, remaining, alerted]);

  const pct = Math.max(0, (remaining / initial) * 100);
  const mins = Math.floor(Math.abs(remaining) / 60);
  const secs = Math.abs(remaining) % 60;
  const display = `${remaining < 0 ? "-" : ""}${mins}:${secs.toString().padStart(2, "0")}`;
  const done = remaining <= 0;

  const ui = (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-[max(4.75rem,calc(3.5rem+env(safe-area-inset-bottom,0px)))] pt-2"
      role="status"
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto card flex w-full max-w-lg items-center gap-3 border border-slate-700/80 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-md transition-colors ${done ? "border-green-500/50 bg-green-950/90" : ""}`}
      >
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
          <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
            <circle
              cx="24" cy="24" r="20" fill="none" stroke="currentColor"
              strokeWidth="3" className="text-slate-800"
            />
            <circle
              cx="24" cy="24" r="20" fill="none" stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 20}`}
              strokeDashoffset={`${2 * Math.PI * 20 * (1 - pct / 100)}`}
              strokeLinecap="round"
              className={`transition-all duration-1000 ${done ? "text-green-400" : "text-brand-400"}`}
            />
          </svg>
          <Timer className="absolute h-4 w-4 text-slate-400" />
        </div>

        <div className="flex-1">
          <p className="font-mono text-xl font-bold tabular-nums">{display}</p>
          <p className="text-xs text-slate-400">
            {done ? "Hotovo! Pokračuj." : "Oddych"}
          </p>
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="flex gap-0.5">
            <button
              onClick={() => adjustTime(-15)}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800 text-[10px] font-mono"
            >
              <Minus className="h-3 w-3" />
            </button>
            <button
              onClick={() => adjustTime(15)}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800 text-[10px] font-mono"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <div className="flex gap-0.5">
            {!done && (
              <button
                onClick={() => setRunning((r) => !r)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800"
              >
                {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>
            )}
            <button
              onClick={reset}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(ui, document.body);
}
