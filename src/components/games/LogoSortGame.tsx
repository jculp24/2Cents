import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogoSortProps {
  data: any;
  onProgress: () => void;
}

const BRONZE = '#CD7F32';
const BALL_SIZE = 100;
const HOOP_SIZE = 180;
const EARNING_PER_BALL = 0.05;

const getBg = (mode: string) => (mode === 'dark' ? '#1A202C' : '#F7FAFC');

const Backboard = ({ label, color }: { label: string; color: string }) => (
  <svg
    width={HOOP_SIZE}
    height={HOOP_SIZE * 1.1}
    viewBox={`0 0 ${HOOP_SIZE} ${HOOP_SIZE * 1.1}`}
    className="drop-shadow-lg"
  >
    {/* Placeholder Rectangle */}
    <rect x="0" y="0" width={HOOP_SIZE} height={HOOP_SIZE} rx="10" fill={color} stroke={BRONZE} strokeWidth="4" />
    {/* Label inside placeholder */}
    <text x={HOOP_SIZE / 2} y={HOOP_SIZE / 2} textAnchor="middle" alignmentBaseline="middle" fontSize="18" fontWeight="bold" fill={BRONZE}>{label}</text>
  </svg>
);

const LogoSortGame = ({ data, onProgress }: LogoSortProps) => {
  const [balls, setBalls] = useState(() => {
    const logos = (data?.logos || []).slice(0, 20);
    return logos.map((logo: any, i: number) => ({ ...logo, id: logo.id || `ball-${i}` }));
  });
  const [binCounts, setBinCounts] = useState<{ [bin: string]: number }>({ left: 0, right: 0 });
  const [earnings, setEarnings] = useState(0);
  const [flicking, setFlicking] = useState<'left' | 'right' | null>(null);
  const [mode, setMode] = useState<'light' | 'dark'>(typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const [currentIdx, setCurrentIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const bins = [
    { id: 'left', label: data?.bins?.[0]?.label || 'Subscribe' },
    { id: 'right', label: data?.bins?.[1]?.label || "Don't Use" },
  ];

  const currentBall = balls[currentIdx];

  // Flick handler (mouse/touch)
  const handleFlick = (direction: 'left' | 'right') => {
    setFlicking(direction);
    setTimeout(() => {
      setBinCounts((prev) => ({ ...prev, [direction]: prev[direction] + 1 }));
      setEarnings((prev) => +(prev + EARNING_PER_BALL).toFixed(2));
      setFlicking(null);
      setCurrentIdx((idx) => idx + 1);
      onProgress();
    }, 600);
  };

  // Ball flick gesture (web: drag up/diagonal)
  const handleDragEnd = (_e: any, info: any) => {
    if (info.velocity.y < -500) {
      handleFlick(info.point.x < window.innerWidth / 2 ? 'left' : 'right');
    }
  };

  return (
    <div
      className="relative min-h-[700px] flex flex-col items-center w-full"
      style={{ background: getBg(mode), transition: 'background 0.3s' }}
      ref={containerRef}
    >
      {/* Top section: Backboards and Earnings */}
      <div className="w-full flex flex-row items-start justify-around px-12 pt-8">
        {/* Left Backboard/Hoop */}
        <div className="flex flex-col items-center">
          <Backboard label={bins[0].label} color="#FFFFFF" />
          <div className="mt-2 text-bronze font-bold text-lg">{binCounts.left}</div>
        </div>

        {/* Earnings display between backboards */}
        <div className="flex justify-center items-center py-4">
          <div className="bg-bronze/20 border-2 border-bronze rounded-full px-6 py-2 text-2xl font-bold text-bronze flex items-center gap-2 shadow">
            <span>🏀</span> ${earnings.toFixed(2)}
          </div>
        </div>

        {/* Right Backboard/Hoop */}
        <div className="flex flex-col items-center">
          <Backboard label={bins[1].label} color={BRONZE} />
          <div className="mt-2 text-bronze font-bold text-lg">{binCounts.right}</div>
        </div>
      </div>

      {/* Ball (one at a time, centered low) */}
      <div className="absolute left-1/2 bottom-24 -translate-x-1/2 flex flex-col items-center">
        <AnimatePresence>
          {currentBall && !flicking && ( // Only show if not currently flicking
            <motion.div
              key={currentBall.id}
              className="rounded-full shadow-2xl border-4 border-bronze flex items-center justify-center bg-white"
              style={{ width: BALL_SIZE, height: BALL_SIZE, background: currentBall.color || '#fff', cursor: 'grab' }}
              whileTap={{ scale: 0.95 }}
              drag
              dragConstraints={containerRef}
              dragElastic={0.3}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, scale: 0.7, y: 100 }} // Appear from below
              animate={{ opacity: 1, scale: 1, y: 0 }} // Animate to center
              exit={{ opacity: 0, scale: 0.5, y: -200 }} // Animate upwards and fade out
              transition={{ duration: 0.5 }}
            >
              <img src={currentBall.image} alt={currentBall.name} className="w-16 h-16 object-contain rounded-full" />
            </motion.div>
          )}
          {/* This second motion div handles the flicking animation */}
          {currentBall && flicking && (
            <motion.div
              key={currentBall.id}
              className="rounded-full border-4 border-bronze"
              style={{ width: BALL_SIZE, height: BALL_SIZE }}
              initial={{ opacity: 1, scale: 1, y: 0, x: 0 }} // Start from current position
              animate={{ opacity: 0, scale: 0.5, y: -220, x: flicking === 'left' ? -220 : 220 }} // Animate towards determined side
              exit={{ opacity: 0 }} // Already animating out, just ensure it's gone
              transition={{ duration: 0.6 }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Instructions (below the ball) */}
      <div className="mt-auto mb-8 text-center text-lg font-semibold text-bronze">Flick streaming service logos into the hoops that best describe your preference.</div>
    </div>
  );
};

export default LogoSortGame;
