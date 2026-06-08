import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Keyboard } from 'lucide-react';
import { AdSlotComponent } from '../components/AdSlot';
import { Leaderboard, SubmitScoreModal } from '../components/Leaderboard';

const WORDS = [
  'timezone','global','clock','world','second','millisecond','latitude','longitude',
  'planet','orbit','equator','meridian','galaxy','compass','sunrise','midnight',
  'calendar','century','decade','moment','instant','swift','rapid','precise',
  'accurate','timing','rhythm','pulse','beacon','signal','transmit','broadcast',
  'frequency','wavelength','satellite','cosmos','stellar','nebula','aurora','zenith',
  'nadir','horizon','solstice','equinox','rotation','revolution','velocity','momentum',
];

const DURATION = 30;
const WORD_COUNT = 25;
const getBest = () => parseInt(localStorage.getItem('typing_best') || '0', 10);

function pickWords() {
  const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
  return Array.from({ length: WORD_COUNT }, (_, i) => shuffled[i % shuffled.length]);
}

export const TypingGame: React.FC = () => {
  const [phase, setPhase]       = useState<'idle' | 'playing' | 'done'>('idle');
  const [words, setWords]       = useState<string[]>(pickWords);
  const [current, setCurrent]   = useState(0);
  const [input, setInput]       = useState('');
  const [correct, setCorrect]   = useState(0);
  const [wrong, setWrong]       = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [showSubmit, setShowSubmit] = useState(false);
  const [pendingWPM, setPendingWPM] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const wpm = Math.round((correct / (DURATION - timeLeft || 1)) * 60);

  const startGame = () => {
    setWords(pickWords()); setCurrent(0); setInput('');
    setCorrect(0); setWrong(0); setTimeLeft(DURATION); setPhase('playing');
    setTimeout(() => inputRef.current?.focus(), 50);
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          setPhase('done');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (phase === 'done') {
      const finalWPM = Math.round((correct / DURATION) * 60);
      if (finalWPM > getBest()) localStorage.setItem('typing_best', String(finalWPM));
      setPendingWPM(finalWPM);
      setShowSubmit(true);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.endsWith(' ')) {
      const typed = val.trim();
      if (typed === words[current]) { setCorrect(c => c + 1); }
      else { setWrong(w => w + 1); }
      setCurrent(c => c + 1);
      setInput('');
    } else {
      setInput(val);
    }
  }, [words, current]);

  const accuracy = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 100;

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/games" className="text-white/40 hover:text-white flex items-center gap-1 transition-colors text-sm">
            <ArrowLeft size={14} /> Games
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-white/70 flex items-center gap-1"><Keyboard size={14} /> Speed Typing</span>
        </div>

        <AdSlotComponent position="header" index={0} className="mb-4" />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Timer bar */}
            {phase === 'playing' && (
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, #00d4ff, #b347ea)`, width: `${(timeLeft / DURATION) * 100}%` }}
                  transition={{ duration: 0.9, ease: 'linear' }} />
              </div>
            )}

            {/* Stats */}
            {phase !== 'idle' && (
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'WPM',      value: phase === 'done' ? pendingWPM : (wpm || 0) },
                  { label: 'Correct',  value: correct },
                  { label: 'Wrong',    value: wrong },
                  { label: 'Accuracy', value: `${accuracy}%` },
                ].map(s => (
                  <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-2 text-center">
                    <div className="text-cyan-400 font-bold">{s.value}</div>
                    <div className="text-white/40 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Word display */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 min-h-[140px]">
              {phase === 'idle' ? (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center gap-3">
                  <Keyboard size={40} className="text-cyan-400" />
                  <div className="text-xl font-bold">Speed Typing</div>
                  <div className="text-white/50 text-sm">Type the highlighted word, press space to advance</div>
                  <button onClick={startGame} className="mt-2 px-6 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-semibold hover:bg-cyan-500/30 transition-colors">
                    Start ({DURATION}s)
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {words.slice(0, current + 12).map((w, i) => (
                    <span key={i} className={`text-lg font-mono px-1 rounded transition-all ${
                      i < current ? 'text-white/20 line-through' :
                      i === current ? 'text-white bg-cyan-400/20 border border-cyan-400/40 px-2' :
                      'text-white/50'
                    }`}>{w}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            {phase === 'playing' && (
              <input
                ref={inputRef}
                value={input}
                onChange={handleInput}
                placeholder={`Type: ${words[current]}`}
                className={`w-full rounded-xl border px-4 py-3 bg-white/5 text-white font-mono text-lg placeholder-white/20 outline-none transition-colors ${
                  input.length > 0 && !words[current].startsWith(input)
                    ? 'border-red-400/60 bg-red-400/5'
                    : 'border-white/20 focus:border-cyan-400/60'
                }`}
                autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              />
            )}

            {phase === 'done' && (
              <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-4 text-center">
                <div className="text-3xl font-black text-cyan-400 mb-1">{pendingWPM} WPM</div>
                <div className="text-white/50 text-sm">{correct} correct · {wrong} wrong · {accuracy}% accuracy</div>
                <div className="text-white/30 text-xs mt-1">Best: {getBest()} WPM</div>
                <button onClick={startGame} className="mt-3 px-4 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-sm">
                  Try Again
                </button>
              </div>
            )}

            <AdSlotComponent position="mid-page" index={0} />
            <AdSlotComponent position="game" index={0} />
          </div>

          <div className="space-y-4">
            <Leaderboard game="typing" unit=" WPM" formatScore={(s: number) => `${s} WPM`} />
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
            <SubmitScoreModal game="typing" score={pendingWPM} unit=" WPM" formatScore={(s: number) => `${s} WPM`} onDone={() => setShowSubmit(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
