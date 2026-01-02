import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucidePlus, LucideX, LucideHash, LucidePlay, LucidePause, LucideRefreshCcw, LucideCheck, LucideMinus, LucideTimer, LucideUsers, LucideArrowRight, LucideInfo, LucideLock, LucideSearch } from 'lucide-react';
import { App as CapApp } from '@capacitor/app'; // Import the App plugin
import { AppScreen, GameMode, GameState, Player, CATEGORIES } from './types';
import { setupGame1, setupGame2, getRandomQuestion, getRandomWordPair } from './services/gameLogic';
import { Button, Card, Heading, SubHeading, ScreenContainer, Input, ConfirmationModal, InfoModal } from './components/UI';
import { ANIMATION_DURATION } from './constants';

const formatName = (s: string) => {
  if (!s) return '';
  const trimmed = s.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : '';
};

const App = () => {
  const [state, setState] = useState<GameState>({
    screen: AppScreen.HOME,
    players: [],
    activeGame: null,
    imposterCount: 1,
    category: "Random Mix",
    currentPlayerIndex: 0,
    questionSafe: '',
    questionImpostor: '',
    questionType: 'number',
    wordSafe: '',
    wordImpostor: '',
    timeLeft: 0,
    roundDuration: 120, 
    isTimerRunning: false,
    votes: {}
  });

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // --- NATIVE BACK BUTTON LOGIC ---
  useEffect(() => {
    const backHandler = CapApp.addListener('backButton', () => {
      if (state.screen === AppScreen.HOME) {
        // If on Home, let it close or show a toast
        CapApp.exitApp();
      } else if (state.screen === AppScreen.PLAYER_SETUP) {
        setState(p => ({ ...p, screen: AppScreen.HOME }));
      } else {
        // In any other screen (Game/Results), show your exit modal
        setShowExitConfirm(true);
      }
    });

    return () => {
      backHandler.then(h => h.remove());
    };
  }, [state.screen]);

  useEffect(() => {
    let interval: any;
    if (state.isTimerRunning && state.timeLeft > 0) {
      interval = setInterval(() => setState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 })), 1000);
    }
    return () => clearInterval(interval);
  }, [state.isTimerRunning, state.timeLeft]);

  const addPlayer = (name: string) => {
    const capName = formatName(name);
    if (!capName || state.players.some(p => p.name === capName)) return;
    setState(prev => ({ ...prev, players: [...prev.players, { id: crypto.randomUUID(), name: capName, avatarSeed: 0, isImpostor: false, score: 0 }] }));
  };

  const proceedToGameSetup = () => {
    if (state.activeGame === GameMode.NUMBER_JUSTIFY) {
      const q = getRandomQuestion();
      setState(prev => ({ ...prev, players: setupGame1(prev.players, prev.imposterCount), questionSafe: q.safe, questionImpostor: q.impostor, questionType: q.type, currentPlayerIndex: 0, screen: AppScreen.G1_ASSIGNMENT }));
    } else { setState(prev => ({ ...prev, screen: AppScreen.G2_CATEGORY_SELECT })); }
  };

  // ... (Keep all your existing screen components and functions below)
  // [Rest of your working App.tsx code goes here]
  return (
    <ScreenContainer onBack={state.screen !== AppScreen.HOME ? () => setShowExitConfirm(true) : undefined}>
        {/* Your current UI code */}
    </ScreenContainer>
  );
};

export default App;