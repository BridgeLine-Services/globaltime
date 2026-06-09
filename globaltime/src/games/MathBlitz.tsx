import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdSlotComponent } from '../components/AdSlot';
import { Leaderboard, SubmitScoreModal } from '../components/Leaderboard';

function gen() {
  const ops = ['+', '-', '×', '÷'] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, ans: number;
  if (op === '+') { a = Math.floor(Math.random()*50)+1; b = Math.floor(Math.random()*50)+1; ans = a+b; }
  else if (op === '-') { a = Math.floor(Math.random()*50)+10; b = Math.floor(Math.random()*a)+1; ans = a-b; }
  else if (op === '×') { a = Math.floor(Math.random()*12)+1; b = Math.floor(Math.random()*12)+1; ans = a*b; }
  else { b = Math.floor(Math.random()*10)+1; ans = Math.floor(Math.random()*10)+1; a = b*ans; }
  const wrongs = new Set<number>();
  while (wrongs.size < 3) { const w = ans + (Math.floor(Math.random()*20)-10); if (w !== ans) wrongs.add(w); }
  const choices = [...wrongs, ans].sort(() => Math.random()-0.5);
  return { expr: `${a} ${op} ${b}`, ans, choices };
}

export const MathBlitz: React.FC = () => {
  const [phase, setPhase] = useState<'idle'|'playing'|'done'>('idle');
  const [score, setScore] = useState(0); const [q, setQ] = useState(gen());
  const [timeLeft, setTimeLeft] = useState(30); const [flash, setFlash] = useState<'right'|'wrong'|null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current!); setPhase('done'); setShowSubmit(true); return 0; } return t-1; });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [phase]);

  const answer = (c: number) => {
    if (c === q.ans) { setScore(s => s+1); setFlash('right'); }
    else { setFlash('wrong'); }
    setTimeout(() => setFlash(null), 300);
    setQ(gen());
  };

  const start = () => { setScore(0); setTimeLeft(30); setQ(gen()); setPhase('playing'); setShowSubmit(false); };

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-20 px-4 pb-16">
      <div className="max-w-md mx-auto">
        <Link to="/games" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-6 text-sm"><ArrowLeft size={16}/>Games</Link>
        <AdSlotComponent position="header" index={0} className="mb-4" />
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔢</div>
          <h1 className="text-2xl font-black text-white">Math Blitz</h1>
          <p className="text-white/40 text-sm">Solve as many as you can in 30 seconds!</p>
        </div>

        {phase === 'idle' && (
          <motion.button initial={{opacity:0}} animate={{opacity:1}} onClick={start}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold text-lg hover:opacity-90 transition">
            Start Blitz!
          </motion.button>
        )}

        {phase === 'playing' && (
          <div className={`rounded-2xl border p-6 text-center transition-colors ${flash==='right'?'border-green-400 bg-green-900/20':flash==='wrong'?'border-red-400 bg-red-900/20':'border-white/10 bg-white/5'}`}>
            <div className="flex justify-between mb-4 text-sm">
              <span className="text-white/60">Score: <span className="text-white font-bold">{score}</span></span>
              <span className={`font-mono font-bold ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>{timeLeft}s</span>
            </div>
            <div className="text-4xl font-black text-white mb-6">{q.expr} = ?</div>
            <div className="grid grid-cols-2 gap-3">
              {q.choices.map(c => (
                <motion.button key={c} whileTap={{scale:0.95}} onClick={() => answer(c)}
                  className="py-3 rounded-xl bg-white/10 border border-white/15 text-white font-bold text-xl hover:bg-white/20 transition">
                  {c}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {phase === 'done' && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="text-center p-6 rounded-2xl border border-white/15 bg-white/5">
            <div className="text-5xl mb-2">🧮</div>
            <div className="text-3xl font-black text-white mb-1">{score} correct</div>
            <div className="text-white/50 text-sm mb-4">{score>=20?'🔥 Einstein mode!':score>=10?'⚡ Math whiz!':'🌱 Keep practicing!'}</div>
            {showSubmit && <SubmitScoreModal game="mathblitz" score={score} unit=" correct" onDone={start} />}
            {!showSubmit && <button onClick={start} className="px-6 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 font-medium">Play Again</button>}
          </motion.div>
        )}

        <Leaderboard game="mathblitz" unit=" correct" className="mt-6" />
        <AdSlotComponent position="game" index={0} className="mt-4" />
      </div>
    </div>
  );
};
