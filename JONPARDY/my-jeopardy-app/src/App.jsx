import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- Hub Scoring Integration ---
function getHubData() {
  try {
    const saved = localStorage.getItem('jonsGameNightData');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load hub data:', e);
  }
  return null;
}

function addHubTeamScore(team, points, gameName) {
  // team is 'A' or 'B'
  if (!window.GameNightScoring) return;
  window.GameNightScoring.addTeamScore(team, points, gameName, `+${points} pts`);
}

function addHubPlayerScore(playerId, points, gameName, description) {
  if (!window.GameNightScoring) return;
  window.GameNightScoring.addPlayerScore(playerId, points, gameName, description);
}

// Convert question dollar value to hub points (scaled: $200 = 2pts, $1000 = 10pts)
function dollarToHubPoints(dollars) {
  return Math.round(dollars / 100);
}

// --- Game Data ---
const JONpardyData = {
  categories: [
    { name: "Culinary", questions: [
        { points: 200, question: "JON FOOD's first video featured this delectable red fruit.", answer: "Tomato" },
        { points: 400, question: "According to Jon, this is the worst form of chicken.", answer: "Shredded" },
        { points: 600, question: "Jon is known for these famous ____ Nights.", answer: "Meat" },
        { points: 800, question: "Baking for his first time, Jon decided to master this food for Cody who had the key to his heart.", answer: "Key Lime Pie" },
        { points: 1000, question: "JON tried and loved this controversial food in a Southeast Asian Country. 1 word!", answer: "Durian" },
    ]},
    { name: "Geography", questions: [
        { points: 200, question: "The place where dreams are made, _______ city.", answer: "Minden" },
        { points: 400, question: "A small country known for its feud with its neighbors.", answer: "Israel" },
      { points: 200, question: "Jon made a detailed itinerary for this Southeast Asian country.", answer: "Thailand" },
        { points: 800, question: "When Jon visited this European country, everybody thought he was a native.", answer: "Italy" },
  { points: 1000, question: "Jon's documentary premiered in this major U.S. borough.", answer: "Manhattan" },
    ]},
    { name: "Television", questions: [
        { points: 200, question: "This classic 1 word show which Jon describes as the most entertaining, involves a serial killer who kills bad guys.", answer: "Dexter" },
        { points: 400, question: "This series of books is about a young wizard attending Hogwarts.", answer: "Harry Potter" },
        { points: 600, question: "In 'The Hobbit', this is the name of the dragon who guards the treasure.", answer: "Smaug" },
        { points: 800, question: "This is the author of the 'A Song of Ice and Fire' series, adapted into 'Game of Thrones'.", answer: "George R.R. Martin" },
        { points: 1000, question: "'Call me Ishmael' is the famous opening line from this novel.", answer: "Moby Dick" },
    ]},
    { name: "JONNISMS", questions: [
        { points: 200, question: "", answer: "Paris" },
        { points: 400, question: "The capital of Japan.", answer: "Tokyo" },
        { points: 600, question: "The capital of Australia.", answer: "Canberra" },
        { points: 800, question: "", answer: "Ottawa" },
        { points: 1000, question: "Instead of sending prayers, Jon frequently sends this to pals.", answer: "Thoughts" },
    ]},
    { name: "POP CULTURE", questions: [
        { points: 200, question: "This pop star is known for her 'Beyhive' fanbase.", answer: "Beyonce" },
        { points: 400, question: "This is the highest-grossing film of all time (unadjusted for inflation).", answer: "Avatar" },
        { points: 600, question: "The four members of The Beatles were John, Paul, George, and who?", answer: "Ringo" },
        { points: 800, question: "This TV show is set in the fictional city of Westeros.", answer: "Game of Thrones" },
        { points: 1000, question: "This artist painted the Mona Lisa.", answer: "Leonardo da Vinci" },
    ]},
  ],
};

const doubleJONpardyData = {
    categories: [
      { name: "CULINARY", questions: [
          { points: 400, question: "E=mc^2 is this scientist's famous equation.", answer: "Jicama" },
          { points: 800, question: "The unit of electrical resistance.", answer: "Ohm" },
          { points: 1200, question: "The tendency of an object to resist a change in its state of motion.", answer: "Inertia" },
          { points: 1600, question: "The type of energy possessed by an object due to its motion.", answer: "Kinetic Energy" },
          { points: 2000, question: "The law that states that for every action, there is an equal and opposite reaction.", answer: "Newton's Third Law" },
      ]},
      { name: "WORLD LEADERS", questions: [
          { points: 400, question: "She was the first female Prime Minister of the United Kingdom.", answer: "Margaret Thatcher" },
          { points: 800, question: "He was the first black president of South Africa.", answer: "Nelson Mandela" },
          { points: 1200, question: "The leader of the Soviet Union during the Cuban Missile Crisis.", answer: "Nikita Khrushchev" },
          { points: 1600, question: "The longest-reigning monarch in British history.", answer: "Queen Elizabeth II" },
          { points: 2000, question: "He was the emperor of France who was defeated at the Battle of Waterloo.", answer: "Napoleon Bonaparte" },
      ]},
      { name: "CLASSIC FILMS", questions: [
          { points: 400, question: "In 'The Godfather', this head of the Corleone family is played by Marlon Brando.", answer: "Vito Corleone" },
          { points: 800, question: "'Here's looking at you, kid' is a famous line from this 1942 film.", answer: "Casablanca" },
          { points: 1200, question: "This Alfred Hitchcock thriller features a famous shower scene.", answer: "Psycho" },
          { points: 1600, question: "Dorothy's ruby slippers are a key element in this 1939 classic.", answer: "The Wizard of Oz" },
          { points: 2000, question: "This epic science fiction film from 1968 was directed by Stanley Kubrick.", answer: "2001: A Space Odyssey" },
      ]},
      { name: "GEOGRAPHY", questions: [
        { points: 400, question: "This is the longest river in the world.", answer: "The Nile" },
        { points: 800, question: "This is the largest desert in the world.", answer: "The Antarctic Polar Desert" },
        { points: 1200, question: "Mount Everest is located in this mountain range.", answer: "The Himalayas" },
        { points: 1600, question: "This is the only continent that lies in all four hemispheres.", answer: "Africa" },
        { points: 2000, question: "The Strait of Gibraltar separates Spain from this African country.", answer: "Morocco" },
    ]},
      { name: "MYTHOLOGY", questions: [
          { points: 400, question: "In Greek mythology, he is the king of the gods.", answer: "Zeus" },
          { points: 800, question: "In Norse mythology, this is the hammer of Thor.", answer: "Mjolnir" },
          { points: 1200, question: "In Egyptian mythology, she is the goddess of cats.", answer: "Bastet" },
          { points: 1600, question: "The Roman equivalent of the Greek god of war, Ares.", answer: "Mars" },
          { points: 2000, question: "This half-man, half-bull creature was kept in the Labyrinth on Crete.", answer: "The Minotaur" },
      ]},
    ],
  };

const finalJONpardyData = {
    category: "INVENTIONS",
    question: "This 15th-century invention by Johannes Gutenberg revolutionized communication and the spread of knowledge throughout Europe.",
    answer: "The printing press"
};

const BUZZER_KEYS = { 'q': 0, 'p': 1, 'z': 2, 'm': 3 };

export default function App() {
  const [gameState, setGameState] = useState('setup');
  const [currentRound, setCurrentRound] = useState('JONpardy');
  const [board, setBoard] = useState([]);
  const [teams, setTeams] = useState([]);
  const [numTeams, setNumTeams] = useState(2);
  const [hubTeamMap, setHubTeamMap] = useState({}); // Maps Jonpardy team index to hub team ('A' or 'B')
  const [hubEnabled, setHubEnabled] = useState(false);
  const [gameWinBonusAwarded, setGameWinBonusAwarded] = useState(false);

  // Individual player tracking
  const [players, setPlayers] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [awaitingPlayerSelect, setAwaitingPlayerSelect] = useState(false);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [questionChooserIndex, setQuestionChooserIndex] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(null);
  const [dailyDoubleWager, setDailyDoubleWager] = useState('');
  const [wagerError, setWagerError] = useState('');
  const [attemptedBy, setAttemptedBy] = useState([]);
  const [finalJONpardyStep, setFinalJONpardyStep] = useState('wager');
  const [finalWagers, setFinalWagers] = useState({});
  const [finalAnswers, setFinalAnswers] = useState({});
  const [questionPhase, setQuestionPhase] = useState('reading'); 
  const [buzzInTimer, setBuzzInTimer] = useState(5);
  const [displayedQuestion, setDisplayedQuestion] = useState('');

  const audioContext = useRef(null);
  const finalJONpardyMusic = useRef(null);
  const buzzInInterval = useRef(null);
  const typewriterTimerRef = useRef(null);

  const stopTyping = useCallback(() => {
    if (typewriterTimerRef.current) {
        clearInterval(typewriterTimerRef.current);
        typewriterTimerRef.current = null;
    }
  }, []);

  // Update individual player stats and calculate personal score
  const updatePlayerStats = useCallback((playerId, statUpdate) => {
    setPlayers(prev => prev.map(p => {
      if (p.id !== playerId) return p;
      const newStats = { ...p.stats };

      // Individual actions
      if (statUpdate.correctAnswer) newStats.correctAnswers = (newStats.correctAnswers || 0) + 1;
      if (statUpdate.dailyDoubleCorrect) newStats.dailyDoubleCorrect = (newStats.dailyDoubleCorrect || 0) + 1;
      if (statUpdate.finalCorrect) newStats.finalCorrect = (newStats.finalCorrect || 0) + 1;

      // Team bonuses
      if (statUpdate.gameWinBonus) newStats.gameWinBonus = (newStats.gameWinBonus || 0) + statUpdate.gameWinBonus;

      // Calculate personal score
      const personalScore =
        (newStats.correctAnswers || 0) * 10 +    // +10 per correct answer
        (newStats.dailyDoubleCorrect || 0) * 15 + // +15 per Daily Double correct
        (newStats.finalCorrect || 0) * 20 +       // +20 for Final Jonpardy correct
        (newStats.gameWinBonus || 0);             // +10 for team game win

      // Sync to hub
      if (statUpdate.hubPoints && window.GameNightScoring) {
        addHubPlayerScore(playerId, statUpdate.hubPoints, 'Jonpardy', statUpdate.description || '+points');
      }

      return { ...p, stats: newStats, personalScore };
    }));
  }, []);

useEffect(() => {
    // Make sure to stop any previous timers when the active question changes.
    stopTyping();

    if (questionPhase === 'reading' && activeQuestion && !activeQuestion.isDailyDouble) {
        const text = activeQuestion.question;
        // We start with the first character instead of an empty string
        // to kick off the interval logic correctly.
        setDisplayedQuestion(text[0] || '');

        typewriterTimerRef.current = setInterval(() => {
            // Use the updater function to get the most recent state
            setDisplayedQuestion(currentText => {
                // If we're not done yet...
                if (currentText.length < text.length) {
                    // Get the next portion of the full string
                    return text.substring(0, currentText.length + 1);
                }
                
                // Otherwise, we're done. Stop the timer.
                stopTyping();
                setQuestionPhase('buzzing');
                return currentText; // Return the final, full text
            });
        }, 70);
    }
    
    // The cleanup function is still essential!
    return () => stopTyping();
  }, [questionPhase, activeQuestion, stopTyping]);

  const playSound = (type) => {
    if (!audioContext.current) return;
    const now = audioContext.current.currentTime;
    const oscillator = audioContext.current.createOscillator();
    const gain = audioContext.current.createGain();
    oscillator.connect(gain);
    gain.connect(audioContext.current.destination);

    switch (type) {
      case 'select':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        break;
      case 'correct':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.linearRampToValueAtTime(800, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        break;
      case 'incorrect':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        break;
      case 'dailyDouble':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.linearRampToValueAtTime(400, now + 0.1);
        oscillator.frequency.linearRampToValueAtTime(200, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        break;
      case 'finalJONpardyThink':
        const osc = audioContext.current.createOscillator();
        const lfo = audioContext.current.createOscillator();
        const musicGain = audioContext.current.createGain();
        lfo.type = 'square';
        lfo.frequency.setValueAtTime(4, now);
        lfo.connect(musicGain.gain);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.connect(musicGain);
        musicGain.gain.setValueAtTime(0.3, now);
        musicGain.connect(audioContext.current.destination);
        osc.start(now);
        lfo.start(now);
        finalJONpardyMusic.current = { osc, lfo };
        return;
    }
    oscillator.start(now);
    oscillator.stop(now + 1);
  };
  
  const stopFinalJONpardyMusic = () => {
    if (finalJONpardyMusic.current) {
        const now = audioContext.current.currentTime;
        finalJONpardyMusic.current.osc.stop(now);
        finalJONpardyMusic.current.lfo.stop(now);
        finalJONpardyMusic.current = null;
    }
  };

  const setupRound = (round) => {
    const data = round === 'JONpardy' ? JONpardyData : doubleJONpardyData;
    let questionPool = [];
    const newBoard = data.categories.map((cat, catIndex) => ({
      ...cat,
      questions: cat.questions.map((q, qIndex) => {
        const questionData = { ...q, catIndex, qIndex, answered: false, isDailyDouble: false };
        questionPool.push(questionData);
        return questionData;
      }),
    }));
    const numDailyDoubles = round === 'JONpardy' ? 1 : 2;
    for (let i = 0; i < numDailyDoubles; i++) {
      let placed = false;
      while (!placed) {
        const randIndex = Math.floor(Math.random() * questionPool.length);
        const { catIndex, qIndex } = questionPool[randIndex];
        if (!newBoard[catIndex].questions[qIndex].isDailyDouble) {
          newBoard[catIndex].questions[qIndex].isDailyDouble = true;
          placed = true;
        }
      }
    }
    setBoard(newBoard);
    setCurrentRound(round);
    setGameState('playing');
  };
  
  const handleStartGame = () => {
    if (numTeams < 1 || numTeams > 4) return;
    if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.current.state === 'suspended') {
        audioContext.current.resume();
    }

    // Check for hub data and set up team mapping
    const hubData = getHubData();
    if (hubData && hubData.players && hubData.players.length >= 2) {
      const teamNames = hubData.teamNames || { A: 'Team A', B: 'Team B' };
      // For 2 teams: Team 0 = Hub Team A, Team 1 = Hub Team B
      const initialTeams = [
        { name: teamNames.A, score: 0 },
        { name: teamNames.B, score: 0 }
      ];
      setTeams(initialTeams);
      setHubTeamMap({ 0: 'A', 1: 'B' });
      setHubEnabled(true);
      setNumTeams(2);

      // Load players with individual tracking
      const loadedPlayers = hubData.players.map(p => ({
        id: p.id,
        name: p.name,
        team: p.team, // 'A' or 'B'
        teamIndex: p.team === 'A' ? 0 : 1,
        avatar: p.avatar || '🎮',
        personalScore: 0,
        stats: {
          correctAnswers: 0,
          dailyDoubleCorrect: 0,
          finalCorrect: 0,
          gameWinBonus: 0
        }
      }));
      setPlayers(loadedPlayers);
    } else {
      const initialTeams = Array.from({ length: numTeams }, (_, i) => ({ name: `Team ${i + 1}`, score: 0 }));
      setTeams(initialTeams);
      setHubEnabled(false);
      setPlayers([]);
    }

    setCurrentTeamIndex(0);
    setQuestionChooserIndex(0);
    setAttemptedBy([]);
    setupRound('JONpardy');
  };

  const handleSelectQuestion = (catIndex, qIndex) => {
    const question = board[catIndex].questions[qIndex];
    if (question.answered) return;
    setQuestionChooserIndex(currentTeamIndex);
    setAttemptedBy([]);
    setActiveQuestion(question);
    
    if (question.isDailyDouble) {
        playSound('dailyDouble');
        setGameState('dailyDouble');
        setQuestionPhase('answering');
        setDisplayedQuestion(question.question);
    } else {
        playSound('select');
        setQuestionPhase('reading');
        setDisplayedQuestion('');
    }
  };

  const handleDailyDoubleWager = (e) => {
    e.preventDefault();
    const wager = parseInt(dailyDoubleWager);
    const teamScore = teams[currentTeamIndex].score;
    const maxWager = Math.max(teamScore, currentRound === 'JONpardy' ? 1000 : 2000);
    if (isNaN(wager) || wager < 5 || wager > maxWager) {
      setWagerError(`Wager must be between $5 and $${maxWager}.`);
      return;
    }
    setActiveQuestion(prev => ({ ...prev, wager }));
    setDailyDoubleWager('');
    setWagerError('');

    // For Daily Double, show player selector if we have players
    const teamPlayers = players.filter(p => p.teamIndex === currentTeamIndex);
    if (teamPlayers.length > 0) {
      setAwaitingPlayerSelect(true);
      setSelectedPlayerId(null);
    }
  };

  // Handle player selection after buzz-in
  const handleSelectPlayer = (playerId) => {
    setSelectedPlayerId(playerId);
    setAwaitingPlayerSelect(false);
    setQuestionPhase('answering');
  };

const handleBuzzIn = useCallback((event) => {
    if ((questionPhase !== 'buzzing' && questionPhase !== 'reading') || !BUZZER_KEYS.hasOwnProperty(event.key.toLowerCase())) return;

    const teamIndex = BUZZER_KEYS[event.key.toLowerCase()];
    if (teamIndex < numTeams && !attemptedBy.includes(teamIndex)) {
        event.preventDefault();
        stopTyping();
        playSound('select');
        setCurrentTeamIndex(teamIndex);

        // If we have players on this team, show player selector first
        const teamPlayers = players.filter(p => p.teamIndex === teamIndex);
        if (teamPlayers.length > 0) {
          setAwaitingPlayerSelect(true);
          setSelectedPlayerId(null);
        } else {
          setQuestionPhase('answering');
        }
    }
  }, [questionPhase, numTeams, attemptedBy, stopTyping, players]);

  useEffect(() => {
    window.addEventListener('keydown', handleBuzzIn);
    return () => {
        window.removeEventListener('keydown', handleBuzzIn);
    };
  }, [handleBuzzIn]);

  useEffect(() => {
    if (questionPhase === 'buzzing') {
        setBuzzInTimer(5);
        buzzInInterval.current = setInterval(() => {
            setBuzzInTimer(prev => prev - 1);
        }, 1000);
    } else {
        if (buzzInInterval.current) {
            clearInterval(buzzInInterval.current);
            buzzInInterval.current = null;
        }
    }
    return () => {
        if (buzzInInterval.current) clearInterval(buzzInInterval.current);
    }
  }, [questionPhase]);

  useEffect(() => {
    if (buzzInTimer === 0 && buzzInInterval.current) {
        clearInterval(buzzInInterval.current);
        buzzInInterval.current = null;
        setShowResult({ status: 'incorrect', message: `Time's up! The answer was: ${activeQuestion.answer}` });
        const newBoard = [...board];
        newBoard[activeQuestion.catIndex].questions[activeQuestion.qIndex].answered = true;
        setBoard(newBoard);
        setCurrentTeamIndex(questionChooserIndex);
        setTimeout(() => {
          setActiveQuestion(null);
          setShowResult(null);
          setSelectedPlayerId(null);
          setAwaitingPlayerSelect(false);
          setGameState('playing');
        }, 3000);
    }
  }, [buzzInTimer, activeQuestion, board, questionChooserIndex]);

  const handleSubmitAnswer = (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    const isCorrect = userAnswer.trim().toLowerCase() === activeQuestion.answer.toLowerCase();
    const points = activeQuestion.wager ?? activeQuestion.points;
    const newTeams = [...teams];
    const team = newTeams[currentTeamIndex];

    if (isCorrect) {
      playSound('correct');
      team.score += points;

      // Get the answering player's name for the message
      const answeringPlayer = players.find(p => p.id === selectedPlayerId);
      const playerName = answeringPlayer ? answeringPlayer.name : team.name;
      setShowResult({ status: 'correct', message: `Correct! +$${points} for ${playerName}` });

      const newBoard = [...board];
      newBoard[activeQuestion.catIndex].questions[activeQuestion.qIndex].answered = true;
      setBoard(newBoard);

      // Auto-score to hub (team)
      if (hubEnabled && hubTeamMap[currentTeamIndex]) {
        const hubTeam = hubTeamMap[currentTeamIndex];
        if (activeQuestion.isDailyDouble) {
          addHubTeamScore(hubTeam, 15, 'Jonpardy');
        } else {
          const hubPoints = dollarToHubPoints(activeQuestion.points);
          addHubTeamScore(hubTeam, hubPoints, 'Jonpardy');
        }
      }

      // Track individual player scoring
      if (selectedPlayerId) {
        if (activeQuestion.isDailyDouble) {
          updatePlayerStats(selectedPlayerId, {
            dailyDoubleCorrect: true,
            hubPoints: 15,
            description: 'Daily Double correct (+15)'
          });
        } else {
          updatePlayerStats(selectedPlayerId, {
            correctAnswer: true,
            hubPoints: 10,
            description: 'Correct answer (+10)'
          });
        }
      }

      setTimeout(() => {
        setActiveQuestion(null);
        setUserAnswer('');
        setShowResult(null);
        setSelectedPlayerId(null);
        setGameState('playing');
      }, 3000);
    } else { // Incorrect Answer
      playSound('incorrect');
      team.score -= points;
      
      if (activeQuestion.isDailyDouble) {
          setShowResult({ status: 'incorrect', message: `Incorrect! The answer was: ${activeQuestion.answer}` });
          const newBoard = [...board];
          newBoard[activeQuestion.catIndex].questions[activeQuestion.qIndex].answered = true;
          setBoard(newBoard);
          setCurrentTeamIndex(prev => (prev + 1) % teams.length);
          setTimeout(() => {
            setActiveQuestion(null);
            setUserAnswer('');
            setShowResult(null);
            setSelectedPlayerId(null);
            setGameState('playing');
          }, 3000);
          return;
      }

      setTeams(newTeams);
      const newAttemptedBy = [...attemptedBy, currentTeamIndex];
      setAttemptedBy(newAttemptedBy);
      setUserAnswer('');

      if (newAttemptedBy.length >= teams.length) {
        setShowResult({ status: 'incorrect', message: `Incorrect! The answer was: ${activeQuestion.answer}` });
        const newBoard = [...board];
        newBoard[activeQuestion.catIndex].questions[activeQuestion.qIndex].answered = true;
        setBoard(newBoard);
        setCurrentTeamIndex(questionChooserIndex);

        setTimeout(() => {
          setActiveQuestion(null);
          setShowResult(null);
          setSelectedPlayerId(null);
          setGameState('playing');
        }, 3000);
      } else {
        setSelectedPlayerId(null);
        setQuestionPhase('buzzing');
        setDisplayedQuestion(activeQuestion.question);
      }
    }
  };

  useEffect(() => {
    if (gameState !== 'playing' || board.length === 0) return;
    if (board.every(cat => cat.questions.every(q => q.answered))) {
      if (currentRound === 'JONpardy') {
        setTimeout(() => {
            const lowestScore = Math.min(...teams.map(t => t.score));
            const startingTeamIndex = teams.findIndex(t => t.score === lowestScore);
            setCurrentTeamIndex(startingTeamIndex >= 0 ? startingTeamIndex : 0);
            setupRound('doubleJONpardy');
        }, 3000);
      } else {
        setTimeout(() => {
          if (teams.some(t => t.score > 0)) {
              setGameState('finalJONpardy');
              playSound('finalJONpardyThink');
          } else {
              setGameState('gameOver');
          }
        }, 3000);
      }
    }
  }, [board, gameState]);

  // Award game win bonus (+25 team, +10 per player) when game ends
  useEffect(() => {
    if (gameState === 'gameOver' && hubEnabled && !gameWinBonusAwarded) {
      const maxScore = Math.max(...teams.map(t => t.score));
      const winners = teams.filter(t => t.score === maxScore);
      // Only award if there's a single winner (not a tie)
      if (winners.length === 1) {
        const winnerIndex = teams.findIndex(t => t.score === maxScore);
        if (winnerIndex !== -1 && hubTeamMap[winnerIndex]) {
          setGameWinBonusAwarded(true);
          addHubTeamScore(hubTeamMap[winnerIndex], 25, 'Jonpardy');

          // Award individual game win bonus (+10) to all winning team players
          const winningTeam = hubTeamMap[winnerIndex]; // 'A' or 'B'
          players.filter(p => p.team === winningTeam).forEach(p => {
            updatePlayerStats(p.id, {
              gameWinBonus: 10,
              hubPoints: 10,
              description: 'Game win bonus (+10)'
            });
          });
          console.log('Jonpardy: Awarded +25 team, +10/player to', winners[0].name);
        }
      }
    }
  }, [gameState, hubEnabled, gameWinBonusAwarded, teams, hubTeamMap, players, updatePlayerStats]);

  const handleFinalWagers = (e) => { e.preventDefault(); setFinalJONpardyStep('answer'); };
  const handleFinalAnswers = (e) => {
    e.preventDefault();
    stopFinalJONpardyMusic();
    const newTeams = teams.map((team, i) => {
      if (team.score <= 0) return team;
      const answer = (finalAnswers[i] || "").trim().toLowerCase();
      const wager = finalWagers[i] || 0;
      const isCorrect = answer === finalJONpardyData.answer.toLowerCase();

      // Auto-score Final Jonpardy to hub (+25 for correct)
      if (isCorrect && hubEnabled && hubTeamMap[i]) {
        addHubTeamScore(hubTeamMap[i], 25, 'Jonpardy');

        // Award individual Final Jonpardy correct (+20) to all players on this team
        const teamLetter = hubTeamMap[i]; // 'A' or 'B'
        players.filter(p => p.team === teamLetter).forEach(p => {
          updatePlayerStats(p.id, {
            finalCorrect: true,
            hubPoints: 20,
            description: 'Final Jonpardy correct (+20)'
          });
        });
      }

      return isCorrect
        ? { ...team, score: team.score + wager }
        : { ...team, score: team.score - wager };
    });
    setTeams(newTeams);
    setFinalJONpardyStep('reveal');
    setTimeout(() => setGameState('gameOver'), 8000);
  };
  
  const handleGoToSetup = () => {
    setGameState('setup');
    setCurrentRound('JONpardy');
    setFinalJONpardyStep('wager');
    setFinalWagers({});
    setFinalAnswers({});
    setAttemptedBy([]);
    setGameWinBonusAwarded(false);
    setSelectedPlayerId(null);
    setAwaitingPlayerSelect(false);
    setPlayers([]);
  };
  
  const getWinner = () => {
    if (teams.length === 0) return [];
    const maxScore = Math.max(...teams.map(t => t.score));
    return teams.filter(t => t.score === maxScore);
  };
  
  if (gameState === 'setup') {
    const hubData = getHubData();
    const hasHubData = hubData && hubData.players && hubData.players.length >= 2;
    const hubTeamNames = hubData?.teamNames || { A: 'Team A', B: 'Team B' };

    return (
      <div className="min-h-screen w-screen bg-gray-900 text-white font-sans flex flex-col items-center justify-center p-4">
        <div className="bg-blue-900 p-8 rounded-lg shadow-2xl text-center w-full max-w-md">
            <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-yellow-400 mb-8" style={{ textShadow: '2px 2px 4px #000000' }}>JONPARDY!</h1>

            {hasHubData ? (
              <>
                <div className="bg-green-600/30 border border-green-500 rounded-lg p-4 mb-6">
                  <p className="text-green-400 font-bold mb-2">✓ Game Night Hub Connected!</p>
                  <p className="text-sm text-gray-300">Teams: {hubTeamNames.A} vs {hubTeamNames.B}</p>
                  <p className="text-xs text-gray-400 mt-1">Points will auto-sync to the hub</p>
                </div>
                <p className="text-gray-400 mb-6">Buzzer keys: {hubTeamNames.A} (Q), {hubTeamNames.B} (P)</p>
              </>
            ) : (
              <>
                <h2 className="text-2xl mb-4">Select Number of Teams</h2>
                <p className="text-gray-400 mb-6">Buzzer keys: Team 1 (Q), Team 2 (P), Team 3 (Z), Team 4 (M)</p>
                <div className="flex justify-center gap-4 mb-8">
                    {[2, 3, 4].map(num => (
                        <button
                            key={num}
                            onClick={() => setNumTeams(num)}
                            className={`w-16 h-16 text-2xl font-bold rounded-lg transition-all flex items-center justify-center ${numTeams === num ? 'bg-yellow-400 text-blue-900 scale-110' : 'bg-blue-700 hover:bg-blue-600'}`}
                        >
                            {num}
                        </button>
                    ))}
                </div>
              </>
            )}

            <button onClick={handleStartGame} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md text-xl transition-transform transform hover:scale-105">
                Start Game
            </button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    const winners = getWinner();
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4 z-30 text-center animate-fade-in">
        <h2 className="text-4xl sm:text-5xl md:text-6xl text-yellow-400 font-bold mb-8">Final Scores</h2>
        <div className="flex flex-col gap-4 mb-8">
            {teams.map((team, index) => (
               <p key={index} className="text-2xl sm:text-3xl md:text-4xl font-bold">
                  {team.name}: <span className={team.score >= 0 ? 'text-green-400' : 'text-red-400'}>${team.score}</span>
               </p>
            ))}
        </div>
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8">
          {winners.length > 1 ? "It's a Tie!" : (winners.length === 1 ? `${winners[0].name} Wins!` : "No Winners!")}
        </h3>
        <button onClick={handleGoToSetup} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-lg shadow-md text-xl md:text-2xl transition-transform transform hover:scale-105">
          Play Again!
        </button>
      </div>
    );
  }

  if (gameState === 'finalJONpardy') {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4 z-30 text-center animate-fade-in">
            <h2 className="text-4xl text-yellow-400 font-bold mb-4">Final JONpardy!</h2>
            <h3 className="text-2xl mb-8">Category: {finalJONpardyData.category}</h3>
            {finalJONpardyStep === 'wager' && (
                <form onSubmit={handleFinalWagers} className="w-full max-w-lg">
                    <p className="mb-4">Enter your wagers (0 to your current score).</p>
                    {teams.map((team, index) => team.score > 0 && (
                        <div key={index} className="flex items-center justify-between gap-4 mb-2">
                            <label className="text-xl">{team.name}:</label>
                            <input type="number" min="0" max={team.score} required
                                onChange={(e) => setFinalWagers(prev => ({ ...prev, [index]: parseInt(e.target.value) || 0 }))}
                                className="w-40 p-2 rounded bg-gray-800 border-blue-600 border-2" />
                        </div>
                    ))}
                    <button type="submit" className="mt-4 bg-blue-600 px-6 py-2 rounded-lg text-xl">Lock Wagers</button>
                </form>
            )}
            {finalJONpardyStep === 'answer' && (
                <form onSubmit={handleFinalAnswers} className="w-full max-w-2xl">
                    <p className="text-3xl font-light mb-6">{finalJONpardyData.question}</p>
                     {teams.map((team, index) => team.score > 0 && (
                        <div key={index} className="flex items-center justify-between gap-4 mb-2">
                            <label className="text-xl">{team.name}:</label>
                            <input type="text" placeholder="What is...?" required
                                onChange={(e) => setFinalAnswers(prev => ({...prev, [index]: e.target.value}))}
                                className="flex-grow p-2 rounded bg-gray-800 border-blue-600 border-2"/>
                        </div>
                     ))}
                    <button type="submit" className="mt-4 bg-green-600 px-6 py-2 rounded-lg text-xl">Reveal Answers</button>
                </form>
            )}
            {finalJONpardyStep === 'reveal' && (
                <div>
                    <h2 className="text-3xl mb-4">The correct answer was:</h2>
                    <p className="text-4xl text-yellow-400 font-bold">{finalJONpardyData.answer}</p>
                </div>
            )}
        </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gray-900 text-white font-sans flex flex-col items-center p-2 sm:p-4">
      <div className="w-full max-w-7xl">
        <header className="w-full mb-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-yellow-400" style={{ textShadow: '2px 2px 4px #000000' }}>
                {currentRound === 'doubleJONpardy' ? 'Double JONpardy!' : 'JONPARDY!'}
            </h1>
            <div className="mt-4 flex flex-col md:flex-row justify-center items-center gap-4">
                <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2">
                {teams.map((team, index) => (
                    <div key={index} className={`text-base md:text-xl font-bold bg-blue-800 px-4 py-2 rounded-lg shadow-lg transition-all border-2 ${index === currentTeamIndex && questionPhase === 'answering' ? 'border-yellow-400 scale-110' : 'border-transparent'}`}>
                    <span className="hidden sm:inline">({Object.keys(BUZZER_KEYS)[index]})</span> {team.name}: <span className={team.score >= 0 ? 'text-green-400' : 'text-red-400'}>${team.score}</span>
                    </div>
                ))}
                </div>
                <button onClick={handleGoToSetup} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 mt-2 md:mt-0">
                    New Game
                </button>
            </div>
        </header>

        <div className="w-full overflow-x-auto pb-4">
            <main className="grid grid-cols-5 gap-1 sm:gap-2 min-w-[600px] md:min-w-[700px] lg:min-w-[800px] mx-auto">
            {board.map((category, catIndex) => (
                <div key={catIndex} className="flex flex-col gap-1 sm:gap-2">
                <div className="h-24 flex items-center justify-center p-2 bg-blue-800 text-yellow-400 text-center font-bold text-xs sm:text-sm md:text-lg rounded-md shadow-lg uppercase">
                    {category.name}
                </div>
                {category.questions.map((q, qIndex) => (
                    <div
                    key={qIndex}
                    onClick={() => handleSelectQuestion(catIndex, qIndex)}
                    className={`h-20 flex items-center justify-center p-2 text-xl sm:text-2xl md:text-3xl font-bold rounded-md shadow-lg transition-transform ${
                        q.answered ? 'bg-gray-700 opacity-40 cursor-not-allowed' : 'bg-blue-700 text-yellow-400 cursor-pointer hover:scale-105 hover:bg-blue-600'
                    }`}
                    >
                    {q.answered ? '' : `$${q.points}`}
                    </div>
                ))}
                </div>
            ))}
            </main>
        </div>
      </div>

      {activeQuestion && (gameState !== 'dailyDouble' || activeQuestion.wager) && !showResult && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-10">
            <div className="bg-blue-900 p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-3xl text-center flex flex-col items-center animate-fade-in">
              <h2 className="text-lg md:text-xl font-bold text-yellow-400 uppercase mb-4">{activeQuestion.isDailyDouble ? `Daily Double!` : `${board[activeQuestion.catIndex].name} for $${activeQuestion.points}`}</h2>
              <p className="text-2xl md:text-4xl font-light mb-6 flex-grow min-h-[8rem]">
                {displayedQuestion}
              </p>
              
              <div className="h-16">
                {questionPhase === 'buzzing' && !awaitingPlayerSelect &&
                    <div className="flex flex-col items-center">
                        <div className="text-3xl text-yellow-400 animate-pulse">Buzz In!</div>
                        <div className="mt-2 text-2xl font-bold text-white">{buzzInTimer}</div>
                    </div>
                }
              </div>

              {/* Player Selection after buzz-in */}
              {awaitingPlayerSelect && (
                <div className="w-full">
                  <h3 className="text-xl md:text-2xl font-bold text-green-400 mb-4">
                    Who buzzed in for {teams[currentTeamIndex].name}?
                  </h3>
                  <div className="flex flex-wrap justify-center gap-3 mb-4">
                    {players.filter(p => p.teamIndex === currentTeamIndex).map(player => (
                      <button
                        key={player.id}
                        onClick={() => handleSelectPlayer(player.id)}
                        className="px-4 py-3 rounded-lg font-semibold transition bg-white/20 text-white hover:bg-yellow-400 hover:text-black flex items-center gap-2"
                      >
                        <span className="text-xl">{player.avatar}</span>
                        <span>{player.name}</span>
                        {player.personalScore > 0 && (
                          <span className="text-xs bg-black/30 px-1.5 py-0.5 rounded">
                            {player.personalScore}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {questionPhase === 'answering' && !awaitingPlayerSelect && (
                <>
                  <h3 className="text-xl md:text-2xl font-bold text-green-400 mb-4">
                    {selectedPlayerId
                      ? `${players.find(p => p.id === selectedPlayerId)?.name}'s Turn`
                      : `${teams[currentTeamIndex].name}'s Turn`
                    }
                  </h3>
                  <form onSubmit={handleSubmitAnswer} className="w-full flex flex-col sm:flex-row gap-2">
                    <input type="text" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} autoFocus placeholder="What is...?" className="flex-grow p-3 rounded-md bg-gray-800 text-white border-2 border-blue-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"/>
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md transition-transform transform hover:scale-105 text-lg"> Answer </button>
                  </form>
                </>
              )}
            </div>
        </div>
      )}

      {gameState === 'dailyDouble' && !activeQuestion.wager && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-20">
            <div className="bg-yellow-400 text-blue-900 p-8 rounded-lg shadow-2xl w-full max-w-md text-center animate-fade-in">
                <h2 className="text-6xl font-bold mb-4">Daily Double!</h2>
                <p className="text-xl mb-4">{teams[currentTeamIndex].name}, enter your wager.</p>
                <form onSubmit={handleDailyDoubleWager} className="flex flex-col gap-2">
                    <input type="number" value={dailyDoubleWager} autoFocus
                        onChange={(e) => setDailyDoubleWager(e.target.value)}
                        className="p-3 text-center text-xl rounded bg-blue-900 text-white"/>
                    {wagerError && <p className="text-red-700 font-bold">{wagerError}</p>}
                    <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-md text-xl">
                        Wager
                    </button>
                </form>
            </div>
        </div>
      )}
      
      {showResult && (
         <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-20">
            <div className={`p-8 rounded-lg shadow-2xl text-center text-xl sm:text-3xl font-bold animate-fade-in ${showResult.status === 'correct' ? 'bg-green-700' : 'bg-red-800'}`}>
                {showResult.message}
            </div>
         </div>
      )}
    </div>
  );
}

