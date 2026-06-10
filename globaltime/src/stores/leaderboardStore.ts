import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GameId = 'reaction' | 'clicker' | 'memory' | 'puzzle' | 'runner'
                   | 'typing' | 'quiz' | 'snake' | 'color'
                   | 'mathblitz' | 'wordscramble' | 'flagquiz' | 'capitals'
                   | 'countdowntimer' | 'simonwave' | 'minesweeper' | 'tictactoe'
                   | 'numbermemory' | 'chronoword';

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  timestamp: number;
  isPersonalBest?: boolean;
}

export interface PersonalBest {
  score: number;
  timestamp: number;
  name: string;
}

export interface GameLeaderboard {
  entries: LeaderboardEntry[];
  maxEntries: number;
  lowerIsBetter: boolean;
}

const EMPTY_BOARD = (lowerIsBetter = false): GameLeaderboard => ({
  entries: [],
  maxEntries: 75,
  lowerIsBetter,
});

interface LeaderboardStore {
  boards: Record<GameId, GameLeaderboard>;
  personalBests: Record<string, PersonalBest>; // key: `${name}-${game}`
  playerName: string;
  setPlayerName: (name: string) => void;
  submitScore: (game: GameId, name: string, score: number) => { madeBoard: boolean; isPersonalBest: boolean; prevBest: number | null };
  getTopEntries: (game: GameId, n?: number) => LeaderboardEntry[];
  getPersonalBest: (game: GameId, name: string) => PersonalBest | null;
  clearBoard: (game: GameId) => void;
}

export const useLeaderboardStore = create<LeaderboardStore>()(
  persist(
    (set, get) => ({
      boards: {
        reaction:      EMPTY_BOARD(true),
        clicker:       EMPTY_BOARD(false),
        memory:        EMPTY_BOARD(false),
        puzzle:        EMPTY_BOARD(true),
        runner:        EMPTY_BOARD(false),
        typing:        EMPTY_BOARD(false),
        quiz:          EMPTY_BOARD(false),
        snake:         EMPTY_BOARD(false),
        color:         EMPTY_BOARD(false),
        mathblitz:     EMPTY_BOARD(false),
        wordscramble:  EMPTY_BOARD(false),
        flagquiz:      EMPTY_BOARD(false),
        capitals:      EMPTY_BOARD(false),
        countdowntimer:EMPTY_BOARD(true),
        simonwave:     EMPTY_BOARD(false),
        minesweeper:   EMPTY_BOARD(true),
        tictactoe:     EMPTY_BOARD(false),
        numbermemory:  EMPTY_BOARD(false),
        chronoword:    EMPTY_BOARD(false),
      },
      personalBests: {},
      playerName: '',

      setPlayerName: (name) => set({ playerName: name.trim().slice(0, 20) }),

      submitScore: (game, name, score) => {
        const board = get().boards[game];
        if (!board) return { madeBoard: false, isPersonalBest: false, prevBest: null };

        const cleanName = name.trim().slice(0, 20) || 'Anonymous';
        const pbKey = `${cleanName.toLowerCase()}-${game}`;
        const existingPB = get().personalBests[pbKey];

        let isPersonalBest = false;
        let prevBest: number | null = existingPB?.score ?? null;

        if (!existingPB) {
          isPersonalBest = true;
        } else if (board.lowerIsBetter) {
          isPersonalBest = score < existingPB.score;
        } else {
          isPersonalBest = score > existingPB.score;
        }

        const newEntry: LeaderboardEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: cleanName,
          score,
          timestamp: Date.now(),
          isPersonalBest,
        };

        const combined = [...board.entries, newEntry];
        combined.sort((a, b) => board.lowerIsBetter ? a.score - b.score : b.score - a.score);
        const trimmed = combined.slice(0, 75);
        const madeBoard = trimmed.some(e => e.id === newEntry.id);

        const newPersonalBests = { ...get().personalBests };
        if (isPersonalBest) {
          newPersonalBests[pbKey] = { score, timestamp: Date.now(), name: cleanName };
        }

        set(state => ({
          boards: { ...state.boards, [game]: { ...board, entries: trimmed } },
          personalBests: newPersonalBests,
          playerName: cleanName,
        }));

        return { madeBoard, isPersonalBest, prevBest };
      },

      getTopEntries: (game, n = 75) => {
        const board = get().boards[game];
        return board ? board.entries.slice(0, n) : [];
      },

      getPersonalBest: (game, name) => {
        const pbKey = `${name.trim().toLowerCase()}-${game}`;
        return get().personalBests[pbKey] ?? null;
      },

      clearBoard: (game) => {
        set(state => ({
          boards: { ...state.boards, [game]: { ...state.boards[game], entries: [] } },
        }));
      },
    }),
    { name: 'worldclock-leaderboards-v5' }
  )
);
