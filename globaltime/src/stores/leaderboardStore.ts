import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GameId = 'reaction' | 'clicker' | 'memory' | 'puzzle' | 'runner'
                   | 'typing' | 'quiz' | 'snake' | 'color';

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  timestamp: number;
}

export interface GameLeaderboard {
  entries: LeaderboardEntry[];
  maxEntries: number;
  lowerIsBetter: boolean;
}

const EMPTY_BOARD = (lowerIsBetter = false): GameLeaderboard => ({
  entries: [],
  maxEntries: 10,
  lowerIsBetter,
});

interface LeaderboardStore {
  boards: Record<GameId, GameLeaderboard>;
  submitScore: (game: GameId, name: string, score: number) => boolean;
  getTopEntries: (game: GameId, n?: number) => LeaderboardEntry[];
  clearBoard: (game: GameId) => void;
}

export const useLeaderboardStore = create<LeaderboardStore>()(
  persist(
    (set, get) => ({
      boards: {
        reaction: EMPTY_BOARD(true),
        clicker:  EMPTY_BOARD(false),
        memory:   EMPTY_BOARD(false),
        puzzle:   EMPTY_BOARD(false),
        runner:   EMPTY_BOARD(false),
        typing:   EMPTY_BOARD(false),
        quiz:     EMPTY_BOARD(false),
        snake:    EMPTY_BOARD(false),
        color:    EMPTY_BOARD(false),
      },

      submitScore: (game, name, score) => {
        const board = get().boards[game];
        if (!board) return false;
        const newEntry: LeaderboardEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: name.trim().slice(0, 16) || 'Anonymous',
          score,
          timestamp: Date.now(),
        };
        const combined = [...board.entries, newEntry];
        combined.sort((a, b) => board.lowerIsBetter ? a.score - b.score : b.score - a.score);
        const trimmed  = combined.slice(0, board.maxEntries);
        const madeBoard = trimmed.some(e => e.id === newEntry.id);
        set(state => ({
          boards: { ...state.boards, [game]: { ...board, entries: trimmed } },
        }));
        return madeBoard;
      },

      getTopEntries: (game, n = 10) => {
        const board = get().boards[game];
        return board ? board.entries.slice(0, n) : [];
      },

      clearBoard: (game) => {
        set(state => ({
          boards: { ...state.boards, [game]: { ...state.boards[game], entries: [] } },
        }));
      },
    }),
    { name: 'worldclock-leaderboards-v2' }
  )
);
