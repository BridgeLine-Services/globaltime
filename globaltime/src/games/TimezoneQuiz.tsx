import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Globe } from 'lucide-react';
import { AdSlotComponent } from '../components/AdSlot';
import { Leaderboard, SubmitScoreModal } from '../components/Leaderboard';
import { COUNTRIES } from '../data/countries';

interface Question {
  prompt: string;
  options: string[];
  answer: string;
  flag: string;
}

const getBest = () => parseInt(localStorage.getItem('quiz_best') || '0', 10);

function makeQuestion(): Question {
  const pool = COUNTRIES.filter(c => c.capital);
  const idx  = Math.floor(Math.random() * pool.length);
  const target = pool[idx];
  const type = Math.floor(Math.random() * 3);

  if (type === 0) {
    // What is the capital of X?
    const wrong = pool.filter(c => c.code !== target.code).sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [target.capital, ...wrong.map(c => c.capital)].sort(() => Math.random() - 0.5);
    return { prompt: `What is the capital of ${target.name}?`, options, answer: target.capital, flag: target.flag };
  } else if (type === 1) {
    // Which country is in which timezone offset?
    const tzLabel = target.timezone.replace('_', ' ').split('/').pop() ?? target.timezone;
    const wrong = pool.filter(c => c.code !== target.code).sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [target.name, ...wrong.map(c => c.name)].sort(() => Math.random() - 0.5);
    return { prompt: `Which country uses the "${tzLabel}" timezone?`, options, answer: target.name, flag: target.flag };
  } else {
    // Which continent?
    const continents = ['Africa','Asia','Europe','North America','South America','Oceania'];
    const wrong = continents.filter(c => c !== target.continent).sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [target.continent, ...wrong].sort(() => Math.random() - 0.5);
    return { prompt: `${target.flag} ${target.name} is in which continent?`, options, answer: target.continent, flag: target.flag };
  }
}

const TOTAL = 10;
const Q_TIME = 12;

export const TimezoneQuiz: React.FC = () => {
  const [phase, setPhase]       = useState<'idle' | 'playing' | 'done'>('idle');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIdx, setQIdx]         = useState(0);
  const [score, setScore]       = useState(0);
  const [streak, setStreak]     = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(Q_TIME);
  const [showSubmit, setShowSubmit] = useState(false);
  const [pendingScore, setPendingScore] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startGame = () => {
    const qs = Array.from({ length: TOTAL }, makeQuestion);
    setQuestions(qs); setQIdx(0); setScore(0); setStreak(0);
    setSelected(null); setTimeLeft(Q_TIME); setPhase('playing');
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    clearInterval(intervalRef.current!);
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          // Time's up — treat as wrong
          setSelected('__timeout__');
          setStreak(0);
          setTimeout(nextQ, 1200);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [qIdx, phase]);

  const nextQ = () => {
    setQIdx(i => {
      const next = i + 1;
      if (next >= TOTAL) {
        setPhase('done');
        return next;
      }
      setSelected(null);
      setTimeLeft(Q_TIME);
      return next;
    });
  };

  useEffect(() => {
    if (phase === 'done') {
      const finalScore = score * 100;
      if (finalScore > getBest()) localStorage.setItem('quiz_best', String(finalScore));
      setPendingScore(finalScore);
      setShowSubmit(true);
    }
  }, [phase]);

  const pick = useCallback((opt: string) => {
    if (selected || !questions[qIdx]) return;
    clearInterval(intervalRef.current!);
    setSelected(opt);
    const correct = opt === questions[qIdx].answer;
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
    setTimeout(nextQ, 1100);
  }, [selected, questions, qIdx]);

  const q = questions[qIdx];
  const progress = ((qIdx) / TOTAL) * 100;

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/games" className="text-white/40 hover:text-white flex items-center gap-1 transition-colors text-sm">
            <ArrowLeft size={14} /> Games
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-white/70 flex items-center gap-1"><Globe size={14} /> Timezone Quiz</span>
        </div>

        <AdSlotComponent position="header" index={0} className="mb-4" />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {phase === 'idle' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center justify-center gap-4 py-16 text-center">
                <Globe size={52} className="text-cyan-400" />
                <div className="text-2xl font-bold">Timezone Quiz</div>
                <div className="text-white/50 max-w-xs">10 questions about world capitals, timezones & continents. 12 seconds per question!</div>
                <button onClick={startGame} className="px-8 py-3 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold hover:bg-cyan-500/30 transition-colors">
                  Start Quiz
                </button>
              </motion.div>
            )}

            {phase === 'playing' && q && (
              <AnimatePresence mode="wait">
                <motion.div key={qIdx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                  className="space-y-4">
                  {/* Progress */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/40">Question {qIdx + 1} of {TOTAL}</span>
                    <div className="flex items-center gap-3">
                      {streak >= 2 && <span className="text-orange-400 font-bold">🔥 {streak} streak!</span>}
                      <span className={`font-bold ${timeLeft <= 4 ? 'text-red-400' : 'text-cyan-400'}`}>{timeLeft}s</span>
                    </div>
                  </div>

                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400/60 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>

                  {/* Time bar */}
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div className={`h-full rounded-full ${timeLeft <= 4 ? 'bg-red-400' : 'bg-cyan-400'}`}
                      animate={{ width: `${(timeLeft / Q_TIME) * 100}%` }} transition={{ duration: 0.9, ease: 'linear' }} />
                  </div>

                  {/* Question */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                    <div className="text-4xl mb-3">{q.flag}</div>
                    <div className="text-lg font-semibold text-white/90">{q.prompt}</div>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-2 gap-3">
                    {q.options.map(opt => {
                      const isCorrect = opt === q.answer;
                      const isSelected = opt === selected;
                      let cls = 'border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 cursor-pointer';
                      if (selected) {
                        if (isCorrect) cls = 'border-green-400/60 bg-green-400/15 cursor-default';
                        else if (isSelected) cls = 'border-red-400/60 bg-red-400/15 cursor-default';
                        else cls = 'border-white/5 bg-white/3 cursor-default opacity-50';
                      }
                      return (
                        <motion.button key={opt} onClick={() => pick(opt)} whileTap={!selected ? { scale: 0.97 } : {}}
                          className={`rounded-xl border p-3 text-left text-sm font-medium transition-all duration-200 ${cls}`}>
                          {isSelected && !isCorrect && <span className="mr-1">❌</span>}
                          {selected && isCorrect && <span className="mr-1">✅</span>}
                          {opt}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {phase === 'done' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-8 text-center">
                <div className="text-5xl mb-3">{score >= 8 ? '🏆' : score >= 5 ? '🎯' : '📚'}</div>
                <div className="text-3xl font-black text-white mb-1">{score}/{TOTAL} correct</div>
                <div className="text-cyan-400 font-bold text-xl mb-4">{pendingScore} pts</div>
                <div className="text-white/50 text-sm mb-6">
                  {score === TOTAL ? 'Perfect score! You\'re a geography genius!' :
                   score >= 7 ? 'Great job! Almost perfect.' :
                   score >= 4 ? 'Not bad — keep exploring the world!' :
                   'Time to brush up on your geography!'}
                </div>
                <button onClick={startGame} className="px-6 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-semibold hover:bg-cyan-500/30 transition-colors">
                  Play Again
                </button>
              </motion.div>
            )}

            <AdSlotComponent position="mid-page" index={0} />
            <AdSlotComponent position="game" index={0} />
          </div>

          <div className="space-y-4">
            {/* Score display */}
            {phase === 'playing' && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                <div className="text-4xl font-black text-green-400">{score}</div>
                <div className="text-white/40 text-sm">correct so far</div>
              </div>
            )}
            <Leaderboard game="quiz" unit=" pts" formatScore={(s: number) => `${s} pts`} />
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
            <SubmitScoreModal game="quiz" score={pendingScore} unit=" pts" formatScore={(s: number) => `${s} pts`} onDone={() => setShowSubmit(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
