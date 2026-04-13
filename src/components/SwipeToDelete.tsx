import { useRef, useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";

interface Props {
  children: ReactNode;
  onDelete: () => void;
}

const THRESHOLD = 90;
const MAX_SWIPE = 140;

export default function SwipeToDelete({ children, onDelete }: Props) {
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const locked = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [removing, setRemoving] = useState(false);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    currentX.current = 0;
    locked.current = false;
    setSwiping(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!swiping) return;

    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    // Lock direction on first significant move
    if (!locked.current && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      locked.current = true;
      if (Math.abs(dy) > Math.abs(dx)) {
        // Vertical scroll — bail out
        setSwiping(false);
        setOffset(0);
        return;
      }
    }

    if (!locked.current) return;

    // Only allow left swipe (negative dx)
    const clamped = Math.min(0, Math.max(-MAX_SWIPE, dx));
    currentX.current = clamped;
    setOffset(clamped);
  };

  const onTouchEnd = () => {
    if (!swiping) return;
    setSwiping(false);

    if (Math.abs(currentX.current) >= THRESHOLD) {
      setRemoving(true);
      // Animate out then delete
      setOffset(-window.innerWidth);
      setTimeout(() => {
        onDelete();
        setOffset(0);
        setRemoving(false);
      }, 250);
    } else {
      setOffset(0);
    }
  };

  const pastThreshold = Math.abs(offset) >= THRESHOLD;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl"
      style={{ height: removing ? 0 : undefined, transition: removing ? "height 250ms ease-out" : undefined }}
    >
      {/* Red background revealed on swipe */}
      <div
        className={`absolute inset-y-0 right-0 flex items-center justify-end pr-5 transition-colors ${
          pastThreshold ? "bg-red-600" : "bg-red-500/80"
        }`}
        style={{ width: Math.max(Math.abs(offset), 0) }}
      >
        <Trash2
          className="h-5 w-5 text-white transition-transform"
          style={{
            transform: pastThreshold ? "scale(1.2)" : "scale(1)",
            opacity: Math.min(Math.abs(offset) / 50, 1),
          }}
        />
      </div>

      {/* Swipeable content */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: `translateX(${offset}px)`,
          transition: swiping ? "none" : "transform 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
