import { useEffect, useState } from "react";

const COLORS = ["#facc15", "#f97316", "#ef4444", "#a855f7", "#3b82f6", "#22c55e"];
const PARTICLE_COUNT = 40;

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  rotation: number;
  size: number;
}

export default function Confetti({ onDone }: { onDone: () => void }) {
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.3,
      duration: 1.2 + Math.random() * 0.8,
      rotation: Math.random() * 720 - 360,
      size: 4 + Math.random() * 6,
    })),
  );

  useEffect(() => {
    const timer = setTimeout(onDone, 2500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.x}%`,
            top: "-10px",
            width: p.size,
            height: p.size * 1.5,
            backgroundColor: p.color,
            borderRadius: "2px",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ["--rotation" as string]: `${p.rotation}deg`,
          }}
        />
      ))}
    </div>
  );
}
