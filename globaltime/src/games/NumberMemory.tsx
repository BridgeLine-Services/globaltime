import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdSlotComponent } from '../components/AdSlot';
import { Leaderboard, SubmitScoreModal } from '../components/Leaderboard';

export const NumberMemory: React.FC = () => {
  const [phase, setPhase] = useState<'idle'|'show'|'input'|'result'|'done'>('idle');
  const [level, setLevel] = useState(1); const [number, setNumber] = useState('');
  const [input, setInput] = useState(''); const [timeLeft, setTimeLeft] = useState(0);
  const [showSubmit, setShowSubmit] = useState(false); const [score, setScore] = useState(0);

  useEffect(() => {
    if (phase!=='show') return;
    setTimeLeft(level+1);
    const t = setInterval(()=>setTimeLeft(tl=>{if(tl<=1){clearInterval(t);setPhase('input');return 0;}return tl-1;}), 1000);
    return ()=>clearInterval(t);
  }, [phase, level]);

  const nextRound = () => {
    const digits = level+2;
    const num = Array.from({length:digits},(_,i)=>i===0?String(Math.floor(Math.random()*9)+1):String(Math.floor(Math.random()*10))).join('');
    setNumber(num); setInput(''); setPhase('show');
  };
  const start = () => { setLevel(1); setScore(0); setShowSubmit(false); nextRound(); };
  const check = () => {
    if (input===number) { setScore(level); setLevel(l=>l+1); setPhase('result'); }
    else { setPhase('done'); setShowSubmit(true); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-20 px-4 pb-16">
      <div className="max-w-md mx-auto">
        <Link to="/games" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-6 text-sm"><ArrowLeft size={16}/>Games</Link>
        <AdSlotComponent position="header" index={0} className="mb-4" />
        <div className="text-center mb-6"><div className="text-4xl mb-2">🔢</div><h1 className="text-2xl font-black text-white">Number Memory</h1><p className="text-white/40 text-sm">Memorize the number, then type it back!</p></div>
        {phase==='idle'&&<motion.button initial={{opacity:0}} animate={{opacity:1}} onClick={start} className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg hover:opacity-90 transition">Start!</motion.button>}
        {phase==='show'&&<div className="text-center p-8 rounded-2xl border border-cyan-400/30 bg-cyan-900/10"><div className="text-white/50 text-sm mb-4">Memorize this! ({timeLeft}s)</div><div className="text-4xl font-black text-white font-mono tracking-widest">{number}</div><div className="mt-4 h-1 rounded-full bg-white/10 overflow-hidden"><motion.div className="h-full bg-cyan-400" initial={{width:'100%'}} animate={{width:'0%'}} transition={{duration:timeLeft, ease:'linear'}}/></div></div>}
        {phase==='input'&&<div className="space-y-4 text-center"><div className="text-white/60 text-sm">What was the number?</div><input autoFocus type="number" value={input} onChange={e=>setInput(e.target.value)} className="w-full text-center text-2xl font-mono font-black bg-white/5 border border-white/15 rounded-xl py-4 text-white outline-none focus:border-cyan-400/50" placeholder="Type here..."/><button onClick={check} className="w-full py-3 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 font-bold">Submit</button></div>}
        {phase==='result'&&<motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="text-center p-6 rounded-2xl border border-green-400/30 bg-green-900/10"><div className="text-3xl mb-2">✅</div><div className="text-white font-bold">Correct! Level {level-1} cleared.</div><button onClick={nextRound} className="mt-4 px-6 py-2 rounded-xl bg-green-500/20 border border-green-400/40 text-green-400 font-medium">Next Level</button></motion.div>}
        {phase==='done'&&<motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="text-center p-6 rounded-2xl border border-white/15 bg-white/5"><div className="text-5xl mb-2">🧠</div><div className="text-3xl font-black text-white mb-1">Level {score}</div><div className="text-white/40 text-xs mb-2">The number was: <span className="text-red-400 font-mono">{number}</span></div><div className="text-white/50 text-sm mb-4">{score>=8?'🏆 Photographic memory!':score>=5?'🧠 Impressive!':'💪 Keep training!'}</div>{showSubmit&&<SubmitScoreModal game="numbermemory" score={score} unit=" lvl" onDone={start}/>}{!showSubmit&&<button onClick={start} className="px-6 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 font-medium">Play Again</button>}</motion.div>}
        <Leaderboard game="numbermemory" unit=" lvl" className="mt-6" />
        <AdSlotComponent position="game" index={0} className="mt-4" />
      </div>
    </div>
  );
};
