import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdSlotComponent } from '../components/AdSlot';
import { Leaderboard, SubmitScoreModal } from '../components/Leaderboard';

const ROWS=8, COLS=8, MINES=10;
type Cell = { mine:boolean; revealed:boolean; flagged:boolean; adj:number; };

function buildBoard(): Cell[][] {
  const b: Cell[][] = Array.from({length:ROWS},()=>Array.from({length:COLS},()=>({mine:false,revealed:false,flagged:false,adj:0})));
  let placed=0;
  while(placed<MINES){ const r=Math.floor(Math.random()*ROWS),c=Math.floor(Math.random()*COLS); if(!b[r][c].mine){b[r][c].mine=true;placed++;} }
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){if(b[r][c].mine)continue;let n=0;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const nr=r+dr,nc=c+dc;if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&b[nr][nc].mine)n++;}b[r][c].adj=n;}
  return b;
}

export const Minesweeper: React.FC = () => {
  const [board, setBoard] = useState<Cell[][]>(buildBoard());
  const [phase, setPhase] = useState<'playing'|'won'|'lost'>('playing');
  const [flagMode, setFlagMode] = useState(false);
  const [time, setTime] = useState(0); const [started, setStarted] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const timerRef = React.useRef<ReturnType<typeof setInterval>|null>(null);

  const startTimer = () => { if(started)return; setStarted(true); timerRef.current=setInterval(()=>setTime(t=>t+1),1000); };
  const stopTimer = () => { if(timerRef.current){clearInterval(timerRef.current);timerRef.current=null;} };

  const reveal = useCallback((r: number, c: number, b: Cell[][]) => {
    if(b[r][c].revealed||b[r][c].flagged)return;
    b[r][c].revealed=true;
    if(b[r][c].adj===0&&!b[r][c].mine)for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const nr=r+dr,nc=c+dc;if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&!b[nr][nc].revealed)reveal(nr,nc,b);}
  },[]);

  const click = (r: number, c: number) => {
    if(phase!=='playing')return;
    startTimer();
    const b=board.map(row=>row.map(cell=>({...cell})));
    if(flagMode){b[r][c].flagged=!b[r][c].flagged;setBoard(b);return;}
    if(b[r][c].flagged)return;
    if(b[r][c].mine){b.forEach(row=>row.forEach(cell=>{if(cell.mine)cell.revealed=true;}));setBoard(b);setPhase('lost');stopTimer();return;}
    reveal(r,c,b);
    const won=b.every(row=>row.every(cell=>cell.mine||cell.revealed));
    setBoard(b);
    if(won){setPhase('won');stopTimer();setShowSubmit(true);}
  };

  const reset = () => { setBoard(buildBoard()); setPhase('playing'); setTime(0); setStarted(false); stopTimer(); setShowSubmit(false); };

  const ADJ_COLORS=['','text-blue-400','text-green-400','text-red-400','text-indigo-400','text-red-600','text-cyan-400','text-black','text-gray-400'];

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-20 px-4 pb-16">
      <div className="max-w-sm mx-auto">
        <Link to="/games" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-6 text-sm"><ArrowLeft size={16}/>Games</Link>
        <AdSlotComponent position="header" index={0} className="mb-4" />
        <div className="text-center mb-4"><div className="text-4xl mb-2">💣</div><h1 className="text-2xl font-black text-white">Minesweeper</h1></div>
        <div className="flex justify-between mb-3 text-sm px-1">
          <span className="text-white/60">💣 {MINES - board.flat().filter(c=>c.flagged).length}</span>
          <button onClick={()=>setFlagMode(f=>!f)} className={`px-3 py-1 rounded-lg text-xs font-medium transition ${flagMode?'bg-red-500/20 border border-red-400/40 text-red-400':'bg-white/5 border border-white/15 text-white/50'}`}>{flagMode?'🚩 Flag Mode':'Reveal Mode'}</button>
          <span className={`font-mono font-bold ${phase==='playing'?'text-white/60':'text-white'}`}>⏱️ {time}s</span>
        </div>
        <div className="grid gap-0.5" style={{gridTemplateColumns:`repeat(${COLS},1fr)`}}>
          {board.map((row,r)=>row.map((cell,c)=>(
            <button key={`${r}-${c}`} onClick={()=>click(r,c)}
              className={`aspect-square rounded-sm text-xs font-bold flex items-center justify-center transition-all select-none ${
                cell.revealed?(cell.mine?'bg-red-900 border border-red-400/50':'bg-white/10 border border-white/5'):'bg-white/15 border border-white/20 hover:bg-white/25'
              }`}>
              {cell.revealed&&cell.mine&&'💣'}
              {cell.revealed&&!cell.mine&&cell.adj>0&&<span className={ADJ_COLORS[cell.adj]}>{cell.adj}</span>}
              {!cell.revealed&&cell.flagged&&'🚩'}
            </button>
          )))}
        </div>
        {phase!=='playing'&&(
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className={`mt-4 text-center p-4 rounded-2xl border ${phase==='won'?'border-green-400/30 bg-green-900/10':'border-red-400/30 bg-red-900/10'}`}>
            <div className="text-2xl mb-1">{phase==='won'?'🏆':'💥'}</div>
            <div className="text-white font-bold">{phase==='won'?`Cleared in ${time}s!`:'Boom! Try again.'}</div>
            {phase==='won'&&showSubmit&&<div className="mt-3"><SubmitScoreModal game="minesweeper" score={time} unit="s" formatScore={s=>`${s}s`} onDone={reset}/></div>}
            {(!showSubmit||phase!=='won')&&<button onClick={reset} className="mt-2 px-5 py-2 rounded-xl bg-white/10 text-white/70 text-sm hover:bg-white/20 transition">New Game</button>}
          </motion.div>
        )}
        <Leaderboard game="minesweeper" unit="s" formatScore={s=>`${s}s`} className="mt-4" />
        <AdSlotComponent position="game" index={0} className="mt-4" />
      </div>
    </div>
  );
};
