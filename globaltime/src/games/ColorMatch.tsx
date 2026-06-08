import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Palette } from 'lucide-react';
import { AdSlotComponent } from '../components/AdSlot';
import { Leaderboard, SubmitScoreModal } from '../components/Leaderboard';

// Color name vs hex — the WORD and COLOR may not match (Stroop-style)
const COLORS = [
  { name: 'Red',    hex: '#ff3355' },
  { name: 'Blue',   hex: '#0088ff' },
  { name: 'Green',  hex: '#00cc44' },
  { name: 'Yellow', hex: '#ffcc00' },
  { name: 'Purple', hex: '#aa44ff' },
  { name: 'Orange', hex: '#ff6600' },
  { name: 'Cyan',   hex: '#00ccff' },
  { name: 'Pink',   hex: '#ff44aa' },
];

const getBest = () => parseInt(localStorage.getItem('color_best') || '0', 10);

interface Round {
  word: string;       // what the text says
  color: string;      // actual ink color (hex)
  colorName: string;  // name of the ink color
  match: boolean;     // does word === colorName?
}

function makeRound(): Round {
  const word  = COLORS[Math.floor(Math.random() * COLORS.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return { word: word.name, color: color.hex, colorName: color.name, match: word.name === color.name };
}

const TOTAL = 20;
const ROUND_MS = 2200;

export const ColorMatch: React.FC = () => {
  const [phase, setPhase]       = useState<'idle' | 'playing' | 'done'>('idle');
  const [rounds, setRounds]     = useState<Round[]>([]);
  const [idx, setIdx]           = useState(0);
  const [score, setScore]       = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [pendingScore, setPendingScore] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startGame = () => {
    const rs = Array.from({ length: TOTAL }, makeRound);
    setRounds(rs); setIdx(0); setScore(0); setFeedback(null); setPhase('playing');
  };

  const nextRound = useCallback((correct: boolean) => {
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) setScore(s => s + 1);
    timerRef.current = setTimeout(() => {
      setFeedback(null);
      setIdx(i => {
        const next = i + 1;
        if (next >= TOTAL) {
          setPhase('done');
        }
        return next;
      });
    }, 400);
  }, []);

  // Auto-advance if no answer
  useEffect(() => {
    if (phase !== 'playing' || idx >= TOTAL) return;
    const t = setTimeout(() => nextRound(false), ROUND_MS);
    return () => clearTimeout(t);
  }, [idx, phase]);

  useEffect(() => {
    if (phase === 'done') {
      const finalScore = score * 50;
      if (finalScore > getBest()) localStorage.setItem('color_best', String(finalScore));
      setPendingScore(finalScore);
      setShowSubmit(true);
    }
  }, [phase]);

  const answer = useCallback((isMatch: boolean) => {
    if (feedback || phase !== 'playing') return;
    if (timerRef.current) clearTimeout(timerRef.current);
    const round = rounds[idx];
    nextRound(isMatch === round.match);
  }, [feedback, phase, rounds, idx, nextRound]);

  const r = rounds[idx];
  const progress = (idx / TOTAL) * 100;

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/games" className="text-white/40 hover:text-white flex items-center gap-1 transition-colors text-sm">
            <ArrowLeft size={14} /> Games
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-white/70 flex items-center gap-1"><Palette size={14} /> Color Match</span>
        </div>

        <AdSlotComponent position="header" index={0} className="mb-4" />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {phase === 'idle' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center gap-5 py-16 px-6 text-center">
                <Palette size={52} className="text-purple-400" />
                <div className="text-2xl font-bold">Color Match</div>
                <div className="text-white/50 max-w-xs leading-relaxed">
                  Does the <strong className="text-white">color of the text</strong> match what the word says?<br />
                  <span className="text-purple-400">Sounds easy...</span> it's not. 🧠
                </div>
                <div className="flex gap-3 text-lg">
                  <span style={{ color: '#ff3355' }}>Blue</span>
                  <span style={{ color: '#00cc44' }}>Green</span>
                  <span style={{ color: '#0088ff' }}>Red</span>
                </div>
                <button onClick={startGame} className="px-8 py-3 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 font-bold hover:bg-purple-500/30 transition-colors">
                  Start ({TOTAL} rounds)
                </button>
              </motion.div>
            )}

            {phase === 'playing' && r && (
              <div className="space-y-4">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400/60 rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
                </div>

                <div className="flex justify-between text-sm text-white/40">
                  <span>Round {idx + 1}/{TOTAL}</span>
                  <span>Score: <strong className="text-white">{score}</strong></span>
                </div>

                {/* Word display */}
                <AnimatePresence mode="wait">
                  <motion.div key={idx}
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
                    className={`rounded-2xl border flex items-center justify-center py-16 transition-colors ${
                      feedback === 'correct' ? 'border-green-400/50 bg-green-400/10' :
                      feedback === 'wrong'   ? 'border-red-400/50 bg-red-400/10' :
                      'border-white/10 bg-white/5'
                    }`}
                    style={{ minHeight: 180 }}>
                    <span className="text-6xl font-black tracking-wide" style={{ color: r.color }}>
                      {r.word}
                    </span>
                  </motion.div>
                </AnimatePresence>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.button whileTap={{ scale: 0.96 }} onClick={() => answer(true)}
                    className="py-5 rounded-2xl border border-green-400/40 bg-green-400/10 text-green-300 text-xl font-black hover:bg-green-400/20 transition-colors">
                    ✅ MATCH
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.96 }} onClick={() => answer(false)}
                    className="py-5 rounded-2xl border border-red-400/40 bg-red-400/10 text-red-300 text-xl font-black hover:bg-red-400/20 transition-colors">
                    ❌ NO MATCH
                  </motion.button>
                </div>

                <div className="text-white/20 text-xs text-center">Does the ink color match the word? Decide fast!</div>
              </div>
            )}

            {phase === 'done' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-2xl border border-purple-400/30 bg-purple-400/10 p-8 text-center">
                <div className="text-5xl mb-3">{score >= 16 ? '🧠' : score >= 12 ? '🎯' : '🎨'}</div>
                <div className="text-3xl font-black mb-1">{score}/{TOTAL} correct</div>
                <div className="text-purple-300 font-bold text-xl mb-4">{pendingScore} pts</div>
                <div className="text-white/50 text-sm mb-6">
                  {score >= 18 ? 'Incredible! Your brain is wired differently.' :
                   score >= 14 ? 'Great Stroop resistance! Sharp mind.' :
                   score >= 10 ? 'Decent! The Stroop effect got you a few times.' :
                   'The Stroop effect is real — keep training!'}
                </div>
                <button onClick={startGame} className="px-6 py-2.5 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 font-semibold">
                  Play Again
                </button>
              </motion.div>
            )}

            <AdSlotComponent position="mid-page" index={0} />
            <AdSlotComponent position="game" index={0} />
          </div>

          <div className="space-y-4">
            <Leaderboard game="color" unit=" pts" formatScore={(s: number) => `${s} pts`} />
            <AdSlotComponent position="sidebar" index={0} />
            <AdSlotComponent position="sidebar" index={1} />
          </div>
        </div>
        <AdSlotComponent position="footer" index={0} className="mt-6" />
      </div>

      <AnimatePresence>
        {showSubmit && (
          <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SubmitScoreModal game="color" score={pendingScore} unit=" pts" formatScore={(s: number) => `${s} pts`} onDone={() => setShowSubmit(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
