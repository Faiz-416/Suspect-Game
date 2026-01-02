export enum AppScreen {
  SPLASH = 'SPLASH',
  HOME = 'HOME',
  PLAYER_SETUP = 'PLAYER_SETUP',
  
  // Game 1: Number Justify
  G1_ASSIGNMENT = 'G1_ASSIGNMENT',
  G1_INPUT = 'G1_INPUT',
  G1_REVEAL = 'G1_REVEAL',
  G1_DISCUSS = 'G1_DISCUSS',
  G1_VOTE = 'G1_VOTE',
  G1_RESULTS = 'G1_RESULTS',

  // Game 2: Impostor Word
  G2_CATEGORY_SELECT = 'G2_CATEGORY_SELECT',
  G2_REVEAL_FLOW = 'G2_REVEAL_FLOW',
  G2_PASS_PHONE = 'G2_PASS_PHONE', 
  G2_GAMEPLAY = 'G2_GAMEPLAY',
  G2_VOTE = 'G2_VOTE',
  G2_RESULTS = 'G2_RESULTS'
}

export enum GameMode {
  NUMBER_JUSTIFY = 'NUMBER_JUSTIFY',
  IMPOSTOR_WORD = 'IMPOSTOR_WORD'
}

export interface Player {
  id: string;
  name: string;
  avatarSeed: number;
  isImpostor: boolean;
  score: number;
  answer?: string; // Changed to string to support words and numbers
  role?: string;
  word?: string;
}

export interface GameState {
  screen: AppScreen;
  players: Player[];
  activeGame: GameMode | null;
  imposterCount: number;
  category: string;
  currentPlayerIndex: number;
  questionSafe: string;
  questionImpostor: string;
  questionType: 'number' | 'text'; // New: handles different input types
  wordSafe: string;
  wordImpostor: string;
  timeLeft: number;
  roundDuration: number;
  isTimerRunning: boolean;
  votes: Record<string, string>;
}

export interface QuestionPair {
  safe: string;
  impostor: string;
  type: 'number' | 'text';
}

export interface WordPair {
  safe: string;
  impostor: string;
  category: string;
}

export const CATEGORIES = [
  "Random Mix",
  "Food",
  "Places",
  "Animals",
  "Activities",
  "Objects",
  "Jobs",
  "Nature"
];