import { Player, GameMode, QuestionPair, WordPair } from '../types';
import { NUMBER_QUESTIONS, WORD_PAIRS } from '../constants';

class DeterministicRNG {
  private seed: number;
  constructor(seed: number) { this.seed = seed; }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  nextRange(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  shuffle<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
}

const rng = new DeterministicRNG(Date.now()); 

export const getRandomQuestion = (): QuestionPair => {
  const index = rng.nextRange(0, NUMBER_QUESTIONS.length - 1);
  return NUMBER_QUESTIONS[index];
};

export const getRandomWordPair = (category: string): WordPair => {
  let pool = category === "Random Mix" ? WORD_PAIRS : WORD_PAIRS.filter(p => p.category === category);
  if (pool.length === 0) return WORD_PAIRS[0];
  return pool[rng.nextRange(0, pool.length - 1)];
};

export const setupGame1 = (players: Player[], imposterCount: number): Player[] => {
  const cleanPlayers = players.map(p => ({ ...p, isImpostor: false, answer: undefined }));
  const count = Math.max(1, Math.min(imposterCount, Math.floor(players.length / 2)));
  const indices = rng.shuffle(cleanPlayers.map((_, i) => i));
  for (let i = 0; i < count; i++) { cleanPlayers[indices[i]].isImpostor = true; }
  return cleanPlayers;
};

export const setupGame2 = (players: Player[], imposterCount: number): Player[] => {
  const p = players.map(pl => ({ ...pl, isImpostor: false }));
  const count = Math.max(1, Math.min(imposterCount, Math.floor(players.length / 2)));
  const indices = rng.shuffle(p.map((_, i) => i));
  for (let i = 0; i < count; i++) { p[indices[i]].isImpostor = true; }
  return p;
};