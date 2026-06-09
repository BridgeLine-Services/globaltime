import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdSlotComponent } from '../components/AdSlot';
import { Leaderboard, SubmitScoreModal } from '../components/Leaderboard';

const WORDS = ['TOKYO','LONDON','BRAZIL','CLOCK','TIMEZONE','AFRICA','EUROPE','ARCTIC','DESERT','OCEAN','JUNGLE','ISLAND','CRATER','CANYON','VOLCANO','GLACIER','COMPASS','HORIZON','EQUATOR','TROPICS','MONSOON','TYPHOON','SOLSTICE'];
function scramble(w: string) { const a=[...w]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a.join('');}
function pick() { const w=WORDS[Math.floor(Math.random()*WORDS.length)]; return {word:w, scrambled:scramble(w)}; }

export const WordScramble: React.FC = () => {
  const [phase, setPhase] = useState<'idle'|'playing'|'done'>('idle');
  const [q, setQ] = useState(pick()); const [input, setInput] = useState('');
  const [score, setScore] = useState(0); const [round, setRound] = useState(0); const ROUNDS=8;
  const [flash, setFlash] = useState<'correct'|'wrong'|null>(null); const [showSubmit, setShowSubmit] = useState(false);
  const [skips, setSkips] = useState(2);

  const check = () => {
    if (input.toUpperCase()===q.word) { setScore(s=>s+10); setFlash('correct'); }
    else { setFlash('wrong'); setTimeout(()=>setFlash(null), 500); return; }
    advance();
  };
  const advance = () => {
    setInput(''); setFlash(null);
    if (round+1>=ROUNDS) { setPhase('done'); setShowSubmit(true); }
    else { setRound(r=>r+1); setQ(pick()); }
  };
  const skip = () => { if(skips<=0)return; setSkips(s=>s-1); advance(); };
  const start = () => { setScore(0); setRound(0); setQ(pick()); setInput(''); setPhase('playing'); setSkips(2); setShowSubmit(false); };

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-20 px-4 pb-16">
      <div className="max-w-md mx-auto">
        <Link to="/games" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-6 text-sm"><ArrowLeft size={16}/>Games</Link>
        <AdSlotComponent position="header" index={0} className="mb-4" />
        <div className="text-center mb-6"><div className="text-4xl mb-2">🔤</div><h1 className="text-2xl font-black text-white">Word Scramble</h1><p className="text-white/40 text-sm">Unscramble the world geography word!</p></div>
        {phase==='idle'&&<motion.button initial={{opacity:0}} animate={{opacity:1}} onClick={start} className="w-full py-4 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white font-bold text-lg hover:opacity-90 transition">Start!</motion.button>}
        {phase==='playing'&&(
          <div className={`rounded-2xl border p-6 transition-colors ${flash==='correct'?'border-green-400 bg-green-900/20':flash==='wrong'?'border-red-400 bg-red-900/20':'border-white/10 bg-white/5'}`}>
            <div className="flex justify-between mb-4 text-sm"><span className="text-white/60">Round <span className="text-white font-bold">{round+1}/{ROUNDS}</span></span><span className="text-cyan-400 font-bold">{score} pts</span></div>
            <div className="text-center mb-6">
              <div className="text-white/40 text-xs mb-2">Unscramble this word:</div>
              <div className="flex justify-center gap-2 flex-wrap">
                {[...q.scrambled].map((ch,i)=>(<span key={i} className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white font-black text-xl">{ch}</span>))}
              </div>
            </div>
            <input autoFocus type="text" value={input} onChange={e=>setInput(e.target.value.toUpperCase().slice(0,12))} onKeyDown={e=>e.key==='Enter'&&check()}
              className="w-full text-center text-xl font-black font-mono bg-white/5 border border-white/15 rounded-xl py-3 text-white outline-none focus:border-fuchsia-400/50 mb-3 uppercase tracking-widest" placeholder="Your answer..."/>
            <div className="flex gap-3">
              <button onClick={check} className="flex-1 py-2.5 rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-400 font-bold">Check</button>
              <button onClick={skip} disabled={skips<=0} className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white/40 text-sm disabled:opacity-30">Skip ({skips})</button>
            </div>
          </div>
        )}
        {phase==='done'&&(
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="text-center p-6 rounded-2xl border border-white/15 bg-white/5">
            <div className="text-5xl mb-2">🎯</div><div className="text-3xl font-black text-white mb-1">{score}/80 pts</div>
            <div className="text-white/50 text-sm mb-4">{score===80?'🏆 Word master!':score>=50?'📚 Great vocabulary!':'🌱 Keep learning!'}</div>
            {showSubmit&&<SubmitScoreModal game="wordscramble" score={score} unit=" pts" onDone={start}/>}
            {!showSubmit&&<button onClick={start} className="px-6 py-2 rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-400 font-medium">Play Again</button>}
          </motion.div>
        )}
        <Leaderboard game="wordscramble" unit=" pts" className="mt-6" />
        <AdSlotComponent position="game" index={0} className="mt-4" />
      </div>
    </div>
  );
};
