import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdSlotComponent } from '../components/AdSlot';
import { Leaderboard, SubmitScoreModal } from '../components/Leaderboard';
import { COUNTRIES } from '../data/countries';

const POOL = COUNTRIES.filter(c => c.capital && c.capital.length > 0);
function pick() {
  const correct = POOL[Math.floor(Math.random()*POOL.length)];
  const wrong = new Set<string>();
  while (wrong.size < 3) { const w = POOL[Math.floor(Math.random()*POOL.length)]; if (w.capital !== correct.capital) wrong.add(w.capital); }
  return { country: correct, choices: [...wrong, correct.capital].sort(()=>Math.random()-0.5) };
}

export const CapitalsQuiz: React.FC = () => {
  const [phase, setPhase] = useState<'idle'|'playing'|'done'>('idle');
  const [q, setQ] = useState(pick()); const [score, setScore] = useState(0);
  const [round, setRound] = useState(0); const ROUNDS = 10;
  const [last, setLast] = useState<'correct'|'wrong'|null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const answer = (cap: string) => {
    const ok = cap === q.country.capital;
    setLast(ok?'correct':'wrong');
    if (ok) setScore(s=>s+10);
    setTimeout(() => {
      if (round+1>=ROUNDS) { setPhase('done'); setShowSubmit(true); }
      else { setRound(r=>r+1); setQ(pick()); setLast(null); }
    }, 600);
  };
  const start = () => { setScore(0); setRound(0); setQ(pick()); setPhase('playing'); setLast(null); setShowSubmit(false); };
  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-20 px-4 pb-16">
      <div className="max-w-md mx-auto">
        <Link to="/games" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-6 text-sm"><ArrowLeft size={16}/>Games</Link>
        <AdSlotComponent position="header" index={0} className="mb-4" />
        <div className="text-center mb-6"><div className="text-4xl mb-2">🏛️</div><h1 className="text-2xl font-black text-white">Capitals Quiz</h1><p className="text-white/40 text-sm">What's the capital? 10 rounds.</p></div>
        {phase==='idle'&&<motion.button initial={{opacity:0}} animate={{opacity:1}} onClick={start} className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg hover:opacity-90 transition">Start Quiz!</motion.button>}
        {phase==='playing'&&(
          <div className={`rounded-2xl border p-6 text-center transition-colors ${last==='correct'?'border-green-400 bg-green-900/20':last==='wrong'?'border-red-400 bg-red-900/20':'border-white/10 bg-white/5'}`}>
            <div className="flex justify-between mb-4 text-sm"><span className="text-white/60">Round <span className="text-white font-bold">{round+1}/{ROUNDS}</span></span><span className="text-cyan-400 font-bold">{score} pts</span></div>
            <div className="text-3xl mb-1">{q.country.flag}</div>
            <div className="text-white font-bold text-xl mb-6">Capital of {q.country.name}?</div>
            <div className="grid grid-cols-2 gap-3">
              {q.choices.map(cap=>(
                <motion.button key={cap} whileTap={{scale:0.95}} onClick={()=>answer(cap)} disabled={!!last}
                  className="py-3 px-2 rounded-xl bg-white/10 border border-white/15 text-white text-sm font-medium hover:bg-white/20 transition disabled:pointer-events-none">{cap}</motion.button>
              ))}
            </div>
          </div>
        )}
        {phase==='done'&&(
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="text-center p-6 rounded-2xl border border-white/15 bg-white/5">
            <div className="text-5xl mb-2">🌐</div><div className="text-3xl font-black text-white mb-1">{score}/100 pts</div>
            <div className="text-white/50 text-sm mb-4">{score===100?'🏆 Geography master!':score>=70?'🌟 Capital expert!':score>=40?'👍 Getting there!':'📚 Time to study!'}</div>
            {showSubmit&&<SubmitScoreModal game="capitals" score={score} unit=" pts" onDone={start} />}
            {!showSubmit&&<button onClick={start} className="px-6 py-2 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 font-medium">Play Again</button>}
          </motion.div>
        )}
        <Leaderboard game="capitals" unit=" pts" className="mt-6" />
        <AdSlotComponent position="game" index={0} className="mt-4" />
      </div>
    </div>
  );
};
