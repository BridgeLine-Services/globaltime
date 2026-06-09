import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdSlotComponent } from '../components/AdSlot';
import { Leaderboard, SubmitScoreModal } from '../components/Leaderboard';

// Timezone & world-themed crossword-style fill-in
const QS = [
  {q:'Abbreviation for Coordinated Universal Time',a:'UTC'},
  {q:'The timezone offset of New York in summer (e.g. UTC-4)',a:'UTC-4'},
  {q:'GMT stands for Greenwich _____ Time',a:'MEAN'},
  {q:'The continent where the Prime Meridian starts',a:'EUROPE'},
  {q:'Country with the most timezones (11)',a:'FRANCE'},
  {q:'The line at 0° longitude',a:'MERIDIAN'},
  {q:'Tokyo is in the timezone JST — J stands for?',a:'JAPAN'},
  {q:'The phase when all clocks move forward 1 hour',a:'DST'},
  {q:'Direction from UTC that adds hours (East or West?)',a:'EAST'},
  {q:'The timezone city that is always UTC+0 year-round',a:'REYKJAVIK'},
];

export const ChronoWord: React.FC = () => {
  const [phase, setPhase] = useState<'idle'|'playing'|'done'>('idle');
  const [idx, setIdx] = useState(0); const [input, setInput] = useState('');
  const [score, setScore] = useState(0); const [timeLeft, setTimeLeft] = useState(60);
  const [flash, setFlash] = useState<'correct'|'wrong'|null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [order] = useState(()=>[...QS].sort(()=>Math.random()-0.5));
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  useEffect(()=>{
    if(phase!=='playing')return;
    timerRef.current=setInterval(()=>setTimeLeft(t=>{if(t<=1){clearInterval(timerRef.current!);setPhase('done');setShowSubmit(true);return 0;}return t-1;}),1000);
    return()=>clearInterval(timerRef.current!);
  },[phase]);

  const check = () => {
    if(input.toUpperCase().trim()===order[idx].a){setScore(s=>s+1);setFlash('correct');setTimeout(()=>{setFlash(null);if(idx+1>=order.length){setPhase('done');setShowSubmit(true);}else{setIdx(i=>i+1);setInput('');}},500);}
    else{setFlash('wrong');setTimeout(()=>setFlash(null),400);}
  };
  const start = () => { setScore(0); setIdx(0); setInput(''); setTimeLeft(60); setPhase('playing'); setShowSubmit(false); };

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-20 px-4 pb-16">
      <div className="max-w-md mx-auto">
        <Link to="/games" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-6 text-sm"><ArrowLeft size={16}/>Games</Link>
        <AdSlotComponent position="header" index={0} className="mb-4" />
        <div className="text-center mb-6"><div className="text-4xl mb-2">🕐</div><h1 className="text-2xl font-black text-white">Chrono Word</h1><p className="text-white/40 text-sm">Timezone trivia — type the answer!</p></div>
        {phase==='idle'&&<motion.button initial={{opacity:0}} animate={{opacity:1}} onClick={start} className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold text-lg hover:opacity-90 transition">Start!</motion.button>}
        {phase==='playing'&&(
          <div className={`rounded-2xl border p-6 transition-colors ${flash==='correct'?'border-green-400 bg-green-900/20':flash==='wrong'?'border-red-400 bg-red-900/20':'border-white/10 bg-white/5'}`}>
            <div className="flex justify-between mb-4 text-sm"><span className="text-white/60">{idx+1}/{order.length}</span><span className={`font-mono font-bold ${timeLeft<=10?'text-red-400 animate-pulse':'text-cyan-400'}`}>{timeLeft}s</span><span className="text-cyan-400 font-bold">{score} ✓</span></div>
            <div className="text-white font-medium mb-4 text-center leading-relaxed">{order[idx].q}</div>
            <div className="text-white/30 text-xs text-center mb-3">Answer has {order[idx].a.length} characters</div>
            <div className="flex gap-1 justify-center mb-4">
              {[...order[idx].a].map((_,i)=>(<div key={i} className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white font-mono font-bold">{input[i]?.toUpperCase()||''}</div>))}
            </div>
            <input autoFocus type="text" value={input} onChange={e=>setInput(e.target.value.toUpperCase().replace(/[^A-Z0-9+\-]/g,''))} onKeyDown={e=>e.key==='Enter'&&check()}
              className="w-full text-center text-lg font-mono bg-white/5 border border-white/15 rounded-xl py-3 text-white outline-none focus:border-teal-400/50 mb-3 uppercase tracking-wider" placeholder="Type answer..."/>
            <button onClick={check} className="w-full py-2.5 rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-400 font-bold">Submit</button>
          </div>
        )}
        {phase==='done'&&(
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="text-center p-6 rounded-2xl border border-white/15 bg-white/5">
            <div className="text-5xl mb-2">🌐</div><div className="text-3xl font-black text-white mb-1">{score}/{order.length}</div>
            <div className="text-white/50 text-sm mb-4">{score===order.length?'🏆 Timezone master!':score>=7?'🌟 Expert!':score>=4?'👍 Good job!':'📚 Study those timezones!'}</div>
            {showSubmit&&<SubmitScoreModal game="chronoword" score={score} unit=" correct" onDone={start}/>}
            {!showSubmit&&<button onClick={start} className="px-6 py-2 rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-400 font-medium">Play Again</button>}
          </motion.div>
        )}
        <Leaderboard game="chronoword" unit=" correct" className="mt-6" />
        <AdSlotComponent position="game" index={0} className="mt-4" />
      </div>
    </div>
  );
};
