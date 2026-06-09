import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdSlotComponent } from '../components/AdSlot';
import { Leaderboard, SubmitScoreModal } from '../components/Leaderboard';

export const CountdownTimer: React.FC = () => {
  const [phase, setPhase] = useState<'idle'|'counting'|'done'>('idle');
  const [target] = useState(()=>5+Math.floor(Math.random()*11)); // 5-15s
  const [elapsed, setElapsed] = useState(0); const [result, setResult] = useState(0);
  const [showSubmit, setShowSubmit] = useState(false);
  const startRef = useRef(0); const rafRef = useRef(0);

  const start = () => { startRef.current = performance.now(); setPhase('counting'); setShowSubmit(false); };
  const stop = () => {
    const e = (performance.now() - startRef.current) / 1000;
    setElapsed(e);
    const diff = Math.abs(e - target);
    const score = Math.max(0, Math.round(1000 - diff * 200));
    setResult(score);
    setPhase('done');
    setShowSubmit(true);
  };

  useEffect(()=>{
    if(phase!=='counting')return;
    const tick=()=>{ setElapsed((performance.now()-startRef.current)/1000); rafRef.current=requestAnimationFrame(tick); };
    rafRef.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(rafRef.current);
  },[phase]);

  const reset = () => { setPhase('idle'); setElapsed(0); setShowSubmit(false); };

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-20 px-4 pb-16">
      <div className="max-w-md mx-auto">
        <Link to="/games" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-6 text-sm"><ArrowLeft size={16}/>Games</Link>
        <AdSlotComponent position="header" index={0} className="mb-4" />
        <div className="text-center mb-6"><div className="text-4xl mb-2">⏱️</div><h1 className="text-2xl font-black text-white">Countdown Timer</h1><p className="text-white/40 text-sm">Stop the timer exactly on the target time!</p></div>
        {phase==='idle'&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center space-y-4">
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5"><div className="text-white/40 text-sm mb-2">Your target:</div><div className="text-6xl font-black text-cyan-400">{target}s</div><div className="text-white/30 text-xs mt-1">Press start, count mentally, then stop!</div></div>
            <motion.button onClick={start} className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-lg hover:opacity-90 transition">I'm Ready!</motion.button>
          </motion.div>
        )}
        {phase==='counting'&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center space-y-6">
            <div className="text-white/40 text-sm">Target: <span className="text-white font-bold">{target}s</span></div>
            <div className="text-7xl font-black text-white font-mono">{elapsed.toFixed(2)}s</div>
            <motion.button whileTap={{scale:0.95}} onClick={stop}
              className="w-full py-6 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-2xl hover:opacity-90 transition">
              STOP!
            </motion.button>
          </motion.div>
        )}
        {phase==='done'&&(
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="text-center space-y-4">
            <div className="p-6 rounded-2xl border border-white/15 bg-white/5">
              <div className="text-white/40 text-sm mb-1">Target: {target}s</div>
              <div className="text-white/40 text-sm mb-3">Your stop: {elapsed.toFixed(3)}s (off by {Math.abs(elapsed-target).toFixed(3)}s)</div>
              <div className="text-4xl font-black text-cyan-400">{result} pts</div>
              <div className="text-white/50 text-sm mt-1">{result>=900?'🎯 Perfect timing!':result>=700?'⏱️ Very close!':result>=400?'👍 Not bad!':'🌱 Keep practicing!'}</div>
            </div>
            {showSubmit&&<SubmitScoreModal game="countdowntimer" score={result} unit=" pts" onDone={reset}/>}
            {!showSubmit&&<button onClick={reset} className="px-6 py-2 rounded-xl bg-violet-500/20 border border-violet-400/40 text-violet-400 font-medium">Play Again</button>}
          </motion.div>
        )}
        <Leaderboard game="countdowntimer" unit=" pts" className="mt-6" />
        <AdSlotComponent position="game" index={0} className="mt-4" />
      </div>
    </div>
  );
};
