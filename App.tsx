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
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [g1Input, setG1Input] = useState('');
  const [isRevealingRole, setIsRevealingRole] = useState(false); // UI toggle for revealing role

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

  const resetGame = () => {
    setState(prev => ({
      ...prev,
      screen: AppScreen.HOME,
      activeGame: null,
      players: prev.players.map(p => ({ ...p, isImpostor: false, answer: undefined, votes: undefined, word: undefined })),
      votes: {}
    }));
    setShowExitConfirm(false);
  };

  const addPlayer = () => {
    const capName = formatName(playerNameInput);
    if (!capName || state.players.some(p => p.name === capName)) return;
    setState(prev => ({ ...prev, players: [...prev.players, { id: crypto.randomUUID(), name: capName, avatarSeed: 0, isImpostor: false, score: 0 }] }));
    setPlayerNameInput('');
  };

  const removePlayer = (id: string) => {
    setState(prev => ({ ...prev, players: prev.players.filter(p => p.id !== id) }));
  };

  const proceedToGameSetup = () => {
    if (state.players.length < 3) return; // Simple validation

    if (state.activeGame === GameMode.NUMBER_JUSTIFY) {
      const q = getRandomQuestion();
      setState(prev => ({
        ...prev,
        players: setupGame1(prev.players, prev.imposterCount),
        questionSafe: q.safe,
        questionImpostor: q.impostor,
        questionType: q.type,
        currentPlayerIndex: 0,
        screen: AppScreen.G1_ASSIGNMENT
      }));
    } else {
      setState(prev => ({ ...prev, screen: AppScreen.G2_CATEGORY_SELECT }));
    }
  };

  const selectCategory = (category: string) => {
    const pair = getRandomWordPair(category);
    const setupPlayers = setupGame2(state.players, state.imposterCount).map(p => ({
       ...p,
       word: p.isImpostor ? pair.impostor : pair.safe
    }));

    setState(prev => ({
      ...prev,
      category,
      wordSafe: pair.safe,
      wordImpostor: pair.impostor,
      players: setupPlayers,
      currentPlayerIndex: 0,
      screen: AppScreen.G2_PASS_PHONE
    }));
  };

  // --- GAME 1 LOGIC ---
  const handleG1Submit = () => {
    if (!g1Input) return;
    const updatedPlayers = state.players.map((p, i) =>
      i === state.currentPlayerIndex ? { ...p, answer: g1Input } : p
    );
    setG1Input('');

    if (state.currentPlayerIndex < state.players.length - 1) {
      setState(prev => ({ ...prev, players: updatedPlayers, currentPlayerIndex: prev.currentPlayerIndex + 1, screen: AppScreen.G1_ASSIGNMENT }));
    } else {
      setState(prev => ({ ...prev, players: updatedPlayers, screen: AppScreen.G1_REVEAL }));
    }
  };

  const startDiscussion = () => {
      setState(prev => ({ ...prev, timeLeft: prev.roundDuration, isTimerRunning: true, screen: prev.activeGame === GameMode.NUMBER_JUSTIFY ? AppScreen.G1_DISCUSS : AppScreen.G2_GAMEPLAY }));
  };

  const startVoting = () => {
      setState(prev => ({ ...prev, isTimerRunning: false, currentPlayerIndex: 0, votes: {}, screen: prev.activeGame === GameMode.NUMBER_JUSTIFY ? AppScreen.G1_VOTE : AppScreen.G2_VOTE }));
  };

  const handleVote = (targetId: string) => {
      const voterId = state.players[state.currentPlayerIndex].id;
      const newVotes = { ...state.votes, [voterId]: targetId };

      if (state.currentPlayerIndex < state.players.length - 1) {
          setState(prev => ({ ...prev, votes: newVotes, currentPlayerIndex: prev.currentPlayerIndex + 1 }));
      } else {
          setState(prev => ({ ...prev, votes: newVotes, screen: state.activeGame === GameMode.NUMBER_JUSTIFY ? AppScreen.G1_RESULTS : AppScreen.G2_RESULTS }));
      }
  };

  // --- GAME 2 LOGIC ---
  const nextG2Player = () => {
      setIsRevealingRole(false);
      if (state.currentPlayerIndex < state.players.length - 1) {
          setState(prev => ({ ...prev, currentPlayerIndex: prev.currentPlayerIndex + 1, screen: AppScreen.G2_PASS_PHONE }));
      } else {
          // All revealed, go to gameplay
          setState(prev => ({ ...prev, timeLeft: prev.roundDuration, isTimerRunning: true, screen: AppScreen.G2_GAMEPLAY }));
      }
  };

  // --- RENDERING HELPERS ---

  const renderHome = () => (
    <div className="flex flex-col h-full justify-center space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-black tracking-tighter text-white mb-2">SUSPECT</h1>
        <p className="text-[#B3B3C6]">The social deduction party game</p>
      </div>

      <Button onClick={() => setState(p => ({...p, activeGame: GameMode.NUMBER_JUSTIFY, screen: AppScreen.PLAYER_SETUP}))}>
        <LucideHash /> Number Justify
      </Button>
      <Button variant="secondary" onClick={() => setState(p => ({...p, activeGame: GameMode.IMPOSTOR_WORD, screen: AppScreen.PLAYER_SETUP}))}>
        <LucideSearch /> Impostor Word
      </Button>

      <div className="mt-8 flex justify-center">
        <button onClick={() => setShowInfoModal(true)} className="flex items-center gap-2 text-[#B3B3C6] hover:text-white transition-colors">
          <LucideInfo size={20} /> How to play
        </button>
      </div>
    </div>
  );

  const renderPlayerSetup = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        <Heading>Who's Playing?</Heading>
        <SubHeading>Add at least 3 players</SubHeading>

        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Enter name..."
            value={playerNameInput}
            onChange={(e) => setPlayerNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
          />
          <Button onClick={addPlayer} className="!w-auto !px-4"><LucidePlus /></Button>
        </div>

        <div className="space-y-2">
          {state.players.map(player => (
            <Card key={player.id} className="!p-4 flex justify-between items-center">
              <span className="font-bold text-lg">{player.name}</span>
              <button onClick={() => removePlayer(player.id)} className="text-[#E5484D] p-2 hover:bg-white/5 rounded-full"><LucideX size={20}/></button>
            </Card>
          ))}
          {state.players.length === 0 && (
            <div className="text-center text-[#B3B3C6] mt-10 italic">No players added yet.</div>
          )}
        </div>

        {state.players.length >= 3 && (
            <div className="mt-8">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[#B3B3C6] font-semibold">Impostors</span>
                    <span className="text-2xl font-bold text-[#E5484D]">{state.imposterCount}</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max={Math.floor(state.players.length / 2)}
                    value={state.imposterCount}
                    onChange={(e) => setState(p => ({ ...p, imposterCount: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-[#1A1A22] rounded-lg appearance-none cursor-pointer accent-[#7C5CFF]"
                />
            </div>
        )}
      </div>

      <div className="absolute bottom-5 left-5 right-5">
        <Button
            disabled={state.players.length < 3}
            onClick={proceedToGameSetup}
            className={state.players.length < 3 ? "opacity-50 grayscale" : ""}
        >
            Start Game <LucidePlay size={20} fill="currentColor" />
        </Button>
      </div>
    </div>
  );

  // GAME 1 SCREENS
  const renderG1Assignment = () => {
    const player = state.players[state.currentPlayerIndex];
    return (
      <div className="flex flex-col h-full justify-center items-center text-center">
        <SubHeading>Pass the phone to</SubHeading>
        <h1 className="text-4xl font-black mb-8 text-[#7C5CFF]">{player.name}</h1>
        <Button onClick={() => setState(p => ({ ...p, screen: AppScreen.G1_INPUT }))}>I am {player.name}</Button>
      </div>
    );
  };

  const renderG1Input = () => {
    const player = state.players[state.currentPlayerIndex];
    const question = player.isImpostor ? state.questionImpostor : state.questionSafe;
    const isNumber = state.questionType === 'number';

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col justify-center">
            <SubHeading className="text-center">Answer the question</SubHeading>
            <Card className="mb-6 !bg-[#7C5CFF]/10 border border-[#7C5CFF]/30">
                <p className="text-xl font-bold text-center leading-relaxed">{question}</p>
            </Card>

            <Input
                type={isNumber ? "number" : "text"}
                placeholder={isNumber ? "Enter a number..." : "Enter your answer..."}
                value={g1Input}
                onChange={(e) => setG1Input(e.target.value)}
                autoFocus
            />
        </div>
        <Button onClick={handleG1Submit} disabled={!g1Input}>Submit Answer</Button>
      </div>
    );
  };

  const renderG1Reveal = () => (
    <div className="flex flex-col h-full">
        <Heading>The Answers</Heading>
        <div className="flex-1 overflow-y-auto space-y-3 pb-20 no-scrollbar">
            {state.players.map(p => (
                <Card key={p.id} className="flex justify-between items-center">
                    <span className="font-bold text-[#B3B3C6]">{p.name}</span>
                    <span className="text-2xl font-bold text-[#7C5CFF]">{p.answer}</span>
                </Card>
            ))}
        </div>
        <div className="absolute bottom-5 left-5 right-5">
            <Button onClick={startDiscussion}>Discuss <LucideUsers /></Button>
        </div>
    </div>
  );

  const renderDiscuss = () => (
      <div className="flex flex-col h-full justify-center items-center">
          <div className="mb-8">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-6xl font-black tabular-nums tracking-widest"
              >
                  {Math.floor(state.timeLeft / 60)}:{(state.timeLeft % 60).toString().padStart(2, '0')}
              </motion.div>
              <p className="text-center text-[#B3B3C6] mt-2">Time Remaining</p>
          </div>
          <Heading className="text-center mb-8">Discuss!</Heading>
          <Button onClick={startVoting} variant="danger">Vote Now <LucideCheck /></Button>
      </div>
  );

  const renderVote = () => {
      const currentPlayer = state.players[state.currentPlayerIndex];
      // Check if we are in "Pass Phone" state or "Voting" state locally
      // For simplicity, we'll just show the voting UI directly with a header telling who is voting

      // If we strictly want to hide votes, we should have an interstitial.
      // Let's implement a simple "Tap to reveal vote screen" overlay if desired, but for now:

      return (
          <div className="flex flex-col h-full">
              <div className="text-center mb-6">
                  <SubHeading>Voting Phase</SubHeading>
                  <h2 className="text-2xl font-bold">{currentPlayer.name}, who is the impostor?</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 overflow-y-auto pb-5">
                  {state.players.filter(p => p.id !== currentPlayer.id).map(p => (
                      <Card
                        key={p.id}
                        onClick={() => handleVote(p.id)}
                        className="flex flex-col items-center justify-center aspect-square hover:bg-[#7C5CFF]/20 cursor-pointer border border-transparent hover:border-[#7C5CFF]"
                      >
                          <span className="text-lg font-bold">{p.name}</span>
                      </Card>
                  ))}
              </div>
          </div>
      );
  };

  const renderResults = () => {
      // Calculate results
      const voteCounts: Record<string, number> = {};
      Object.values(state.votes).forEach(targetId => {
          voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
      });

      // Find who got most votes
      let maxVotes = 0;
      let eliminatedIds: string[] = [];
      Object.entries(voteCounts).forEach(([id, count]) => {
          if (count > maxVotes) {
              maxVotes = count;
              eliminatedIds = [id];
          } else if (count === maxVotes) {
              eliminatedIds.push(id);
          }
      });

      // Determine win condition
      // Impostors win if NO impostor is eliminated (assuming simple majority rule)
      // If there's a tie including an impostor, maybe we consider it a catch? Usually tie = no one eliminated or random.
      // Let's say: If ANY impostor is in the eliminated set, Innocents win. (Harsh for impostors but okay for simple logic)

      const impostors = state.players.filter(p => p.isImpostor);
      const caughtImpostors = impostors.filter(p => eliminatedIds.includes(p.id));
      const impostorsWin = caughtImpostors.length === 0;

      return (
          <div className="flex flex-col h-full">
              <div className={`text-center py-8 rounded-[30px] mb-6 ${impostorsWin ? 'bg-[#E5484D]/20 text-[#E5484D]' : 'bg-[#4CC9F0]/20 text-[#4CC9F0]'}`}>
                  <h1 className="text-4xl font-black uppercase mb-2">{impostorsWin ? "Impostors Win!" : "Innocents Win!"}</h1>
                  <p className="font-semibold opacity-80">{impostorsWin ? "They blended in perfectly." : "The suspect was caught."}</p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                  <div className="space-y-2">
                      <SubHeading>The Impostors</SubHeading>
                      {impostors.map(p => (
                          <Card key={p.id} className="!bg-[#E5484D]/10 border border-[#E5484D]/30 flex justify-between items-center">
                              <span className="font-bold">{p.name}</span>
                              {state.activeGame === GameMode.NUMBER_JUSTIFY ? (
                                  <span className="text-sm opacity-70">Answered: {p.answer}</span>
                              ) : (
                                  <span className="text-sm opacity-70">Word: {p.word}</span>
                              )}
                          </Card>
                      ))}
                  </div>

                  <div className="space-y-2">
                      <SubHeading>Votes Cast</SubHeading>
                      {state.players.map(p => {
                          const votedForName = state.players.find(t => t.id === state.votes[p.id])?.name;
                          return (
                              <div key={p.id} className="flex justify-between items-center px-4 py-2 border-b border-white/5">
                                  <span className="text-[#B3B3C6]">{p.name}</span>
                                  <span className="text-sm flex items-center gap-2">
                                      voted for <span className="text-white font-bold">{votedForName}</span>
                                  </span>
                              </div>
                          )
                      })}
                  </div>
              </div>

              <div className="mt-4">
                  <Button onClick={resetGame} variant="secondary">Back to Home</Button>
              </div>
          </div>
      );
  };

  // GAME 2 SCREENS
  const renderG2CategorySelect = () => (
      <div className="flex flex-col h-full">
          <Heading>Choose Category</Heading>
          <div className="grid grid-cols-2 gap-3 overflow-y-auto pb-5 mt-4">
              {CATEGORIES.map(cat => (
                  <Card key={cat} onClick={() => selectCategory(cat)} className="aspect-[4/3] flex items-center justify-center text-center cursor-pointer hover:bg-[#7C5CFF]/20 border border-transparent hover:border-[#7C5CFF]">
                      <span className="font-bold text-lg">{cat}</span>
                  </Card>
              ))}
          </div>
      </div>
  );

  const renderG2PassPhone = () => {
      const player = state.players[state.currentPlayerIndex];
      return (
        <div className="flex flex-col h-full justify-center items-center text-center">
            <SubHeading>Pass the phone to</SubHeading>
            <h1 className="text-4xl font-black mb-8 text-[#4CC9F0]">{player.name}</h1>
            <Button onClick={() => { setState(p => ({ ...p, screen: AppScreen.G2_REVEAL_FLOW })); setIsRevealingRole(true); }}>I am {player.name}</Button>
        </div>
      );
  };

  const renderG2RevealFlow = () => {
      const player = state.players[state.currentPlayerIndex];

      return (
          <div className="flex flex-col h-full justify-center items-center text-center">
             <SubHeading>Your secret word is</SubHeading>
             <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="my-10 p-8 bg-[#1A1A22] rounded-full border-2 border-[#4CC9F0]"
             >
                 <h2 className="text-3xl font-black text-[#4CC9F0]">{player.word}</h2>
             </motion.div>
             <p className="text-[#B3B3C6] mb-8 px-8">Memorize this word. Describe it carefully, but don't be too obvious!</p>
             <Button onClick={nextG2Player}>Got it</Button>
          </div>
      );
  };

  const renderCurrentScreen = () => {
    switch (state.screen) {
      case AppScreen.HOME: return renderHome();
      case AppScreen.PLAYER_SETUP: return renderPlayerSetup();

      // Game 1
      case AppScreen.G1_ASSIGNMENT: return renderG1Assignment();
      case AppScreen.G1_INPUT: return renderG1Input();
      case AppScreen.G1_REVEAL: return renderG1Reveal();
      case AppScreen.G1_DISCUSS: return renderDiscuss();
      case AppScreen.G1_VOTE: return renderVote();
      case AppScreen.G1_RESULTS: return renderResults();

      // Game 2
      case AppScreen.G2_CATEGORY_SELECT: return renderG2CategorySelect();
      case AppScreen.G2_PASS_PHONE: return renderG2PassPhone();
      case AppScreen.G2_REVEAL_FLOW: return renderG2RevealFlow();
      case AppScreen.G2_GAMEPLAY: return renderDiscuss(); // Reuse discuss screen
      case AppScreen.G2_VOTE: return renderVote(); // Reuse vote screen
      case AppScreen.G2_RESULTS: return renderResults();

      default: return renderHome();
    }
  };

  return (
    <ScreenContainer onBack={state.screen !== AppScreen.HOME ? () => setShowExitConfirm(true) : undefined}>
        <AnimatePresence mode="wait">
            <motion.div
                key={state.screen}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: ANIMATION_DURATION }}
                className="h-full"
            >
                {renderCurrentScreen()}
            </motion.div>
        </AnimatePresence>

        <ConfirmationModal
            isOpen={showExitConfirm}
            title="Quit Game?"
            message="Current progress will be lost."
            onConfirm={resetGame}
            onCancel={() => setShowExitConfirm(false)}
        />

        <InfoModal
            isOpen={showInfoModal}
            onClose={() => setShowInfoModal(false)}
        />
    </ScreenContainer>
  );
};

export default App;
