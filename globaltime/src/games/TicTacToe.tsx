import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdSlotComponent } from '../components/AdSlot';
import { Leaderboard, SubmitScoreModal } from '../components/Leaderboard';

const WIN = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function checkWin(b: (string|null)[], p: string) { return WIN.some(line=>line.every(i=>b[i]===p)); }
function aiMove(b: (string|null)[]): number {
  // Try win
  for(let i=0;i<9;i++){if(!b[i]){const t=[...b];t[i]='O';if(checkWin(t,'O'))return i;}}
  // Try block
  for(let i=0;i<9;i++){if(!b[i]){const t=[...b];t[i]='X';if(checkWin(t,'X'))return i;}}
  if(!b[4])return 4;
  const corners=[0,2,6,8].filter(i=>!b[i]);
  if(corners.length)return corners[Math.floor(Math.random()*corners.length)];
  const empty=b.map((v,i)=>v?-1:i).filter(i=>i>=0);
  return empty[Math.floor(Math.random()*empty.length)];
}

export const TicTacToe: React.FC = () => {
  const [board, setBoard] = useState<(string|null)[]>(Array(9).fill(null));
  const [wins, setWins] = useState(0); const [losses, setLosses] = useState(0); const [draws, setDraws] = useState(0);
  const [status, setStatus] = useState<'playing'|'win'|'lose'|'draw'>('playing');
  const [showSubmit, setShowSubmit] = useState(false);

  const click = (i: number) => {
    if (board[i] || status!=='playing') return;
    const b1=[...board]; b1[i]='X';
    if(checkWin(b1,'X')){setBoard(b1);setStatus('win');setWins(w=>w+1);setShowSubmit(true);return;}
    if(b1.every(Boolean)){setBoard(b1);setStatus('draw');setDraws(d=>d+1);return;}
    const ai=aiMove(b1); b1[ai]='O';
    setBoard(b1);
    if(checkWin(b1,'O')){setStatus('lose');setLosses(l=>l+1);}
    else if(b1.every(Boolean)){setStatus('draw');setDraws(d=>d+1);}
  };
  const reset = () => { setBoard(Array(9).fill(null)); setStatus('playing'); setShowSubmit(false); };

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-20 px-4 pb-16">
      <div className="max-w-md mx-auto">
        <Link to="/games" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-6 text-sm"><ArrowLeft size={16}/>Games</Link>
        <AdSlotComponent position="header" index={0} className="mb-4" />
        <div className="text-center mb-4"><div className="text-4xl mb-2">❌⭕</div><h1 className="text-2xl font-black text-white">Tic Tac Toe</h1><p className="text-white/40 text-sm">You are X. Beat the AI!</p></div>
        <div className="flex justify-center gap-6 mb-4 text-sm"><span className="text-green-400">W: {wins}</span><span className="text-white/40">D: {draws}</span><span className="text-red-400">L: {losses}</span></div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {board.map((cell,i)=>(
            <motion.button key={i} whileTap={{scale:0.9}} onClick={()=>click(i)}
              className={`h-24 rounded-2xl border text-4xl font-black flex items-center justify-center transition-all ${cell?'cursor-default':'hover:bg-white/10 cursor-pointer'} ${cell==='X'?'text-cyan-400 border-cyan-400/30 bg-cyan-900/10':cell==='O'?'text-red-400 border-red-400/30 bg-red-900/10':'border-white/10 bg-white/5'}`}>
              {cell}
            </motion.button>
          ))}
        </div>
        {status!=='playing'&&(
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className={`text-center p-4 rounded-2xl border mb-4 ${status==='win'?'border-green-400/30 bg-green-900/10':status==='lose'?'border-red-400/30 bg-red-900/10':'border-white/10 bg-white/5'}`}>
            <div className="text-2xl mb-1">{status==='win'?'🏆':status==='lose'?'😅':'🤝'}</div>
            <div className="text-white font-bold">{status==='win'?'You win!':status==='lose'?'AI wins!':'Draw!'}</div>
            {status==='win'&&showSubmit&&<SubmitScoreModal game="tictactoe" score={wins} unit=" wins" onDone={reset}/>}
            {(!showSubmit||status!=='win')&&<button onClick={reset} className="mt-2 px-5 py-2 rounded-xl bg-white/10 text-white/70 text-sm hover:bg-white/20 transition">Play Again</button>}
          </motion.div>
        )}
        <Leaderboard game="tictactoe" unit=" wins" className="mt-4" />
        <AdSlotComponent position="game" index={0} className="mt-4" />
      </div>
    </div>
  );
};
