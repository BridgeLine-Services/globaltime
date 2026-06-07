import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdSlotComponent } from '../components/AdSlot';
import { ArrowLeft, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

type Phase = 'idle' | 'waiting' | 'ready' | 'result' | 'toosoon';

const getBestScore = () => parseInt(localStorage.getItem('reaction_best') || '9999', 10);
const setBestScore = (ms: number) => {
  const prev = getBestScore();
  if (ms < prev) localStorage.setItem('reaction_best', String(ms));
};

export const ReactionGame: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(() => {
    setPhase('waiting');
    setReactionTime(null);
    const delay = 1500 + Math.random() * 3500;
    timerRef.current = setTimeout(() => {
      setPhase('ready');
      setStartTime(performance.now());
    }, delay);
  }, []);

  const handleClick = useCallback(() => {
    if (phase === 'waiting') {
      clearTimeout(timerRef.current!);
      setPhase('toosoon');
      return;
    }
    if (phase === 'ready') {
      const t = Math.round(performance.now() - startTime);
      setReactionTime(t);
      setPhase('result');
      setBestScore(t);
      setScores(prev => [...prev.slice(-4), t]);
    }
    if (phase === 'idle' || phase === 'result' || phase === 'toosoon') {
      start();
    }
  }, [phase, startTime, start]);

  const best = getBestScore() === 9999 ? null : getBestScore();
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  const bgColor = phase === 'waiting' ? 'from-red-900/80 to-red-950'
    : phase === 'ready' ? 'from-green-800/80 to-green-950'
    : phase === 'toosoon' ? 'from-orange-900/80 to-orange-950'
    : 'from-[#0d0d2b] to-[#0a0a1a]';

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/games" className="text-white/40 hover:text-white transition-colors"><ArrowLeft size={20} /></Link>
          <h1 className="text-white font-bold text-2xl">⚡ Reaction Test</h1>
        </div>

        <AdSlotComponent position="game" index={0} className="mb-6" />

        <motion.div
          className={`relative rounded-3xl border border-white/10 bg-gradient-to-br ${bgColor} overflow-hidden cursor-pointer select-none mb-6`}
          style={{ minHeight: '320px' }}
          onClick={handleClick}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex flex-col items-center justify-center h-full min-h-[320px] p-8 text-center gap-4">
            <AnimatePresence mode="wait">
              {phase === 'idle' && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="text-6xl">⚡</div>
                  <div className="text-white text-2xl font-bold">Reaction Test</div>
                  <div className="text-white/60">Tap anywhere to start</div>
                  <div className="px-6 py-3 rounded-xl bg-white/10 text-white font-medium">START</div>
                </motion.div>
              )}
              {phase === 'waiting' && (
                <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="text-6xl animate-pulse">🔴</div>
                  <div className="text-white text-2xl font-bold">Wait for green...</div>
                  <div className="text-red-300 text-sm">Don't tap yet!</div>
                </motion.div>
              )}
              {phase === 'ready' && (
                <motion.div key="ready" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="text-6xl">🟢</div>
                  <div className="text-white text-3xl font-black">TAP NOW!</div>
                </motion.div>
              )}
              {phase === 'toosoon' && (
                <motion.div key="toosoon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="text-6xl">😅</div>
                  <div className="text-white text-2xl font-bold">Too soon!</div>
                  <div className="text-orange-300">Tap to try again</div>
                </motion.div>
              )}
              {phase === 'result' && reactionTime !== null && (
                <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                  <div className="text-5xl font-black text-white">{reactionTime}<span className="text-2xl text-white/60">ms</span></div>
                  <div className="text-white/60 text-sm">
                    {reactionTime < 200 ? '🚀 Incredible reflexes!' : reactionTime < 300 ? '⚡ Great reaction!' : reactionTime < 500 ? '👍 Above average' : '🐌 Keep practicing!'}
                  </div>
                  {best && <div className="text-cyan-400 text-sm">Personal best: {best}ms</div>}
                  <div className="px-6 py-2 rounded-xl bg-white/10 text-white text-sm cursor-pointer">Tap to try again</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <AdSlotComponent position="game" index={0} className="mb-4" />

        {scores.length > 0 && (
          <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
            <div className="flex items-center gap-2 mb-4 text-white/60 text-sm font-medium">
              <Trophy size={16} /> Recent Scores
            </div>
            <div className="flex gap-3 flex-wrap">
              {scores.map((s, i) => (
                <div key={i} className="px-3 py-1.5 rounded-lg bg-white/10 text-white font-mono text-sm">{s}ms</div>
              ))}
            </div>
            {avg && <div className="mt-3 text-white/40 text-sm">Average: {avg}ms · Best: {Math.min(...scores)}ms</div>}
          </div>
        )}

        <AdSlotComponent position="game" index={0} className="mt-4" />
      </div>
    </div>
  );
};
