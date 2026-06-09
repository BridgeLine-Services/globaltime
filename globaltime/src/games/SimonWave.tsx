import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdSlotComponent } from '../components/AdSlot';
import { Leaderboard, SubmitScoreModal } from '../components/Leaderboard';

const COLORS = ['#ef4444','#3b82f6','#22c55e','#f59e0b'];
const LABELS = ['🔴','🔵','🟢','🟡'];

export const SimonWave: React.FC = () => {
  const [seq, setSeq] = useState<number[]>([]); const [userSeq, setUserSeq] = useState<number[]>([]);
  const [phase, setPhase] = useState<'idle'|'showing'|'input'|'done'>('idle');
  const [active, setActive] = useState<number|null>(null); const [score, setScore] = useState(0);
  const [showSubmit, setShowSubmit] = useState(false);

  const showSequence = async (s: number[]) => {
    setPhase('showing'); setUserSeq([]);
    for (let i=0; i<s.length; i++) {
      await new Promise(r=>setTimeout(r, 400));
      setActive(s[i]);
      await new Promise(r=>setTimeout(r, 500));
      setActive(null);
      await new Promise(r=>setTimeout(r, 200));
    }
    setPhase('input');
  };

  const start = () => { const s=[Math.floor(Math.random()*4)]; setSeq(s); setScore(0); setShowSubmit(false); showSequence(s); };

  const press = (i: number) => {
    if (phase!=='input') return;
    const newUser = [...userSeq, i];
    setUserSeq(newUser);
    const pos = newUser.length-1;
    if (newUser[pos] !== seq[pos]) { setPhase('done'); setScore(seq.length-1); setShowSubmit(true); return; }
    if (newUser.length === seq.length) {
      const newSeq = [...seq, Math.floor(Math.random()*4)];
      setSeq(newSeq);
      setTimeout(()=>showSequence(newSeq), 600);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-20 px-4 pb-16">
      <div className="max-w-md mx-auto">
        <Link to="/games" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-6 text-sm"><ArrowLeft size={16}/>Games</Link>
        <AdSlotComponent position="header" index={0} className="mb-4" />
        <div className="text-center mb-6"><div className="text-4xl mb-2">🌈</div><h1 className="text-2xl font-black text-white">Simon Wave</h1><p className="text-white/40 text-sm">Repeat the color sequence!</p></div>
        {phase==='idle'&&<motion.button initial={{opacity:0}} animate={{opacity:1}} onClick={start} className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg hover:opacity-90 transition">Start!</motion.button>}
        {(phase==='showing'||phase==='input')&&(
          <div className="space-y-4">
            <div className="flex justify-between text-sm px-2"><span className="text-white/60">Round: <span className="text-white font-bold">{seq.length}</span></span><span className={`font-medium ${phase==='showing'?'text-yellow-400':'text-green-400'}`}>{phase==='showing'?'Watch!':'Your turn!'}</span></div>
            <div className="grid grid-cols-2 gap-4">
              {COLORS.map((col,i)=>(
                <motion.button key={i} whileTap={{scale:0.92}} onClick={()=>press(i)}
                  disabled={phase==='showing'}
                  animate={{scale: active===i?1.1:1, opacity: active===i?1:0.6}}
                  className="h-28 rounded-2xl font-bold text-4xl shadow-lg transition-all disabled:cursor-not-allowed"
                  style={{backgroundColor:col, boxShadow: active===i?`0 0 30px ${col}`:'none'}}>
                  {LABELS[i]}
                </motion.button>
              ))}
            </div>
            <div className="text-center text-white/30 text-xs">{userSeq.length}/{seq.length} entered</div>
          </div>
        )}
        {phase==='done'&&(
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="text-center p-6 rounded-2xl border border-white/15 bg-white/5">
            <div className="text-5xl mb-2">💥</div><div className="text-3xl font-black text-white mb-1">Level {score}</div>
            <div className="text-white/50 text-sm mb-4">{score>=10?'🏆 Legendary memory!':score>=6?'🧠 Great memory!':'💪 Keep practicing!'}</div>
            {showSubmit&&<SubmitScoreModal game="simonwave" score={score} unit=" lvl" onDone={start}/>}
            {!showSubmit&&<button onClick={start} className="px-6 py-2 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-400 font-medium">Play Again</button>}
          </motion.div>
        )}
        <Leaderboard game="simonwave" unit=" lvl" className="mt-6" />
        <AdSlotComponent position="game" index={0} className="mt-4" />
      </div>
    </div>
  );
};
