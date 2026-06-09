import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdSlotComponent } from '../components/AdSlot';
import { Leaderboard } from '../components/Leaderboard';

const DURATION = 10;
const getBest = () => parseFloat(localStorage.getItem('clicker_best') || '0');

export const ClickerGame: React.FC = () => {
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle');
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef(0);
  const scores = useRef<number[]>(JSON.parse(localStorage.getItem('clicker_scores') || '[]'));

  const start = useCallback(() => {
    setClicks(0);
    setTimeLeft(DURATION);
    setPhase('playing');
    endTimeRef.current = Date.now() + DURATION * 1000;
    intervalRef.current = setInterval(() => {
      const left = Math.max(0, (endTimeRef.current - Date.now()) / 1000);
      setTimeLeft(parseFloat(left.toFixed(1)));
      if (left <= 0) {
        clearInterval(intervalRef.current!);
        setPhase('done');
      }
    }, 100);
  }, []);

  useEffect(() => () => clearInterval(intervalRef.current!), []);

  const handleClick = useCallback(() => {
    if (phase === 'idle' || phase === 'done') { start(); return; }
    if (phase === 'playing') setClicks(c => c + 1);
  }, [phase, start]);

  const cps = phase === 'done' ? (clicks / DURATION).toFixed(2) : (clicks / Math.max(1, DURATION - timeLeft)).toFixed(2);

  useEffect(() => {
    if (phase === 'done') {
      const cpsNum = clicks / DURATION;
      if (cpsNum > getBest()) localStorage.setItem('clicker_best', String(cpsNum));
      scores.current = [...scores.current.slice(-4), clicks];
      localStorage.setItem('clicker_scores', JSON.stringify(scores.current));
    }
  }, [phase]);

  const pct = ((DURATION - timeLeft) / DURATION) * 100;

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-20 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/games" className="text-white/40 hover:text-white"><ArrowLeft size={20} /></Link>
          <h1 className="text-white font-bold text-2xl">👆 Click Speed</h1>
        </div>

        <AdSlotComponent position="game" index={0} className="mb-6" />

        <div className="flex gap-4 mb-6">
          <div className="flex-1 p-3 rounded-xl border border-white/10 bg-white/5 text-center">
            <div className="text-white font-bold text-2xl">{clicks}</div>
            <div className="text-white/40 text-xs">Clicks</div>
          </div>
          <div className="flex-1 p-3 rounded-xl border border-white/10 bg-white/5 text-center">
            <div className="text-cyan-400 font-bold text-2xl">{cps}</div>
            <div className="text-white/40 text-xs">CPS</div>
          </div>
          <div className="flex-1 p-3 rounded-xl border border-white/10 bg-white/5 text-center">
            <div className="text-orange-400 font-bold text-2xl">{timeLeft.toFixed(1)}s</div>
            <div className="text-white/40 text-xs">Left</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full" style={{ width: `${pct}%` }} />
        </div>

        <motion.button
          onClick={handleClick}
          className={`w-full h-56 rounded-3xl border-2 text-center flex flex-col items-center justify-center gap-4 select-none cursor-pointer transition-all ${
            phase === 'playing' ? 'border-green-400/50 bg-green-900/20' : 'border-white/20 bg-white/5 hover:bg-white/10'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-6xl">{phase === 'idle' ? '👆' : phase === 'done' ? '🏁' : '💥'}</span>
          <span className="text-white font-bold text-xl">
            {phase === 'idle' ? 'Tap to Start!' : phase === 'playing' ? 'CLICK CLICK CLICK!' : 'Done! Tap to restart'}
          </span>
          {phase === 'playing' && <span className="text-white/50 text-sm">Give it all you've got!</span>}
        </motion.button>

        {phase === 'done' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-5 rounded-2xl border border-cyan-400/20 bg-cyan-900/10 text-center">
            <div className="text-3xl font-black text-white">{clicks} clicks</div>
            <div className="text-cyan-400 text-lg font-bold">{cps} CPS</div>
            <div className="text-white/40 text-sm mt-1">Personal best: {getBest().toFixed(2)} CPS</div>
            <div className="text-white/30 text-xs mt-1">
              {parseFloat(cps) > 10 ? '🚀 Legendary speed!' : parseFloat(cps) > 7 ? '⚡ Incredible!' : parseFloat(cps) > 5 ? '💪 Great speed!' : '🌱 Keep training!'}
            </div>
          </motion.div>
        )}

        <AdSlotComponent position="game" index={0} className="mt-6" />
        
        <Leaderboard game="clicker" unit=" CPS" className="mt-4" />
<AdSlotComponent position="game" index={0} className="mt-4" />
      </div>
    </div>
  );
};
