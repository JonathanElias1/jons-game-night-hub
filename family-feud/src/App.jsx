import React, { useEffect, useMemo, useRef, useState } from "react";
import { StartScreen } from "./components/StartScreen";
import { GameHeader } from "./components/GameHeader";
import { Scoreboard } from "./components/Scoreboard";
import { QuestionDisplay } from "./components/QuestionDisplay";
import { AnswersBoard } from "./components/AnswersBoard";
import { FaceoffControls } from "./components/FaceoffControls";
import { StrikesDisplay } from "./components/StrikesDisplay";
import { StealPanel } from "./components/StealPanel";
import { RoundControls } from "./components/RoundControls";
import { GameOverScreen } from "./components/GameOverScreen";
import { FastMoney } from "./components/FastMoney";
import { ActionHistory } from "./components/ActionHistory";
import { Timer } from "./components/Timer";
import { AnswerInput } from "./components/AnswerInput";
import { PlayerSelector } from "./components/PlayerSelector";
import { useAudio } from "./hooks/useAudio";
import { useThemeMusic } from "./hooks/useThemeMusic";
import { useGameData } from "./hooks/useGameData";
import { gradientBg, AVATARS } from "./utils/constants";
import { defaultMultiplierByIndex, labelForMult } from "./utils/helpers";

// Load hub data from localStorage
function loadHubData() {
  try {
    const saved = localStorage.getItem('jonsGameNightData');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load hub data:', e);
  }
  return null;
}

// --- Hub Scoring Integration ---
function addHubTeamScore(team, points, gameName, description) {
  if (!window.GameNightScoring) return;
  window.GameNightScoring.addTeamScore(team, points, gameName, description);
}

function addHubPlayerScore(playerName, points, gameName, description) {
  if (!window.GameNightScoring) return;
  window.GameNightScoring.addScore(playerName, points, gameName, description);
}

// Sync actual team game scores to hub (the real Family Feud scores, not bonuses)
function syncTeamGameScore(team, score) {
  if (!window.GameNightScoring) return;
  window.GameNightScoring.setTeamGameScore(team, score, 'Jon Feud');
}

export default function FamilyFeudApp() {
  const [gameSettings, setGameSettings] = useState(null);
  const [autoStarted, setAutoStarted] = useState(false);
  const [players, setPlayers] = useState([]);
  const [teamAName, setTeamAName] = useState("Team A Family");
  const [teamBName, setTeamBName] = useState("Team B Family");
  const [phase, setPhase] = useState("faceoff");
  const [roundIndex, setRoundIndex] = useState(0);
  const [suddenIndex, setSuddenIndex] = useState(0);
  const [revealed, setRevealed] = useState(() => Array(8).fill(false));
  const [strikes, setStrikes] = useState(0);
  const [bank, setBank] = useState(0);
  const [teamA, setTeamA] = useState(0);
  const [teamB, setTeamB] = useState(0);
  const [faceoffBuzz, setFaceoffBuzz] = useState(null);
  const [faceoffTurn, setFaceoffTurn] = useState(null);
  const [controlTeam, setControlTeam] = useState(null);
  const [faceoffAnswerA, setFaceoffAnswerA] = useState(null); // Index of answer Team A got
  const [faceoffAnswerB, setFaceoffAnswerB] = useState(null); // Index of answer Team B got
  const [faceoffMissedA, setFaceoffMissedA] = useState(false); // Team A gave wrong answer
  const [faceoffMissedB, setFaceoffMissedB] = useState(false); // Team B gave wrong answer
  const [faceoffAcknowledged, setFaceoffAcknowledged] = useState(false); // Banner has been clicked
  const [fmPoints1, setFmPoints1] = useState(Array(5).fill(0));
  const [fmPoints2, setFmPoints2] = useState(Array(5).fill(0));
  const [fmShown, setFmShown] = useState(Array(5).fill(false));
  const [displayedQuestion, setDisplayedQuestion] = useState("");
  const [isAwarding, setIsAwarding] = useState(false);
  const [actionHistory, setActionHistory] = useState([]);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(20);
  const [hubEnabled, setHubEnabled] = useState(false);
  const [fmTargetHit, setFmTargetHit] = useState(false);
  const [stealAttempted, setStealAttempted] = useState(false);
  const [stealResult, setStealResult] = useState(null); // 'success' or 'failed'
  const [selectedPlayerA, setSelectedPlayerA] = useState(null); // Selected player from Team A
  const [selectedPlayerB, setSelectedPlayerB] = useState(null); // Selected player from Team B
  const [gameWinBonusAwarded, setGameWinBonusAwarded] = useState(false); // Track if game win bonus awarded
  const [faceoffWinner, setFaceoffWinner] = useState(null); // Which team won faceoff (for pass/play choice)

  // Auto-rotation: track which player index for faceoffs and main play
  const [faceoffPlayerIndex, setFaceoffPlayerIndex] = useState(0); // Which player does faceoffs (increments each round)
  const [currentPlayerIndexA, setCurrentPlayerIndexA] = useState(0); // Whose turn during main play (Team A)
  const [currentPlayerIndexB, setCurrentPlayerIndexB] = useState(0); // Whose turn during main play (Team B)

  const typewriterTimerRef = useRef(null);
  
  const { data, loaded } = useGameData();
  const { ding, buzz, blip, buzzA, buzzB, volume, setVolume, duplicateBuzz } = useAudio();
  const theme = useThemeMusic();

  // Auto-start from hub data if available
  useEffect(() => {
    if (autoStarted || gameSettings || !loaded) return;

    const hubData = loadHubData();
    if (hubData && hubData.players && hubData.players.length >= 2) {
      const teamNames = hubData.teamNames || { A: 'Team A', B: 'Team B' };

      // Split players by team and assign random avatars
      const playersA = hubData.players
        .filter(p => p.team === 'A')
        .map((p, i) => ({
          id: `A${i}`,
          name: p.name,
          avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)].emoji,
          team: 'A',
          teamName: teamNames.A,
          personalScore: 0,
          stats: { answersRevealed: 0, topAnswers: 0, faceoffWins: 0, stealsWon: 0, fastMoneyPoints: 0 }
        }));

      const playersB = hubData.players
        .filter(p => p.team === 'B')
        .map((p, i) => ({
          id: `B${i}`,
          name: p.name,
          avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)].emoji,
          team: 'B',
          teamName: teamNames.B,
          personalScore: 0,
          stats: { answersRevealed: 0, topAnswers: 0, faceoffWins: 0, stealsWon: 0, fastMoneyPoints: 0 }
        }));

      if (playersA.length > 0 && playersB.length > 0) {
        // Use all available rounds from the JSON
        const totalRounds = data.rounds.length;
        setAutoStarted(true);
        setPlayers([...playersA, ...playersB]);
        setTeamAName(teamNames.A);
        setTeamBName(teamNames.B);
        setHubEnabled(true);
        setGameSettings({ numRounds: totalRounds, players: [...playersA, ...playersB], teamAName: teamNames.A, teamBName: teamNames.B });
        console.log('Family Feud: Hub scoring enabled with teams', teamNames.A, 'and', teamNames.B, '- Playing', totalRounds, 'rounds');
      }
    }
  }, [autoStarted, gameSettings, loaded, data.rounds.length]);

  // Sync actual team game scores to hub whenever they change
  useEffect(() => {
    if (hubEnabled) {
      syncTeamGameScore('A', teamA);
      syncTeamGameScore('B', teamB);
    }
  }, [teamA, teamB, hubEnabled]);

  const addAction = (message) => {
    const time = new Date().toLocaleTimeString();
    setActionHistory(prev => [...prev, { time, message }]);
  };

  // Update player stats and recalculate personal score
  const updatePlayerStats = (playerId, statUpdate) => {
    if (!playerId) return;
    setPlayers(prev => prev.map(player => {
      if (player.id !== playerId) return player;
      const newStats = { ...player.stats };
      // Apply stat updates
      if (statUpdate.answersRevealed) newStats.answersRevealed += statUpdate.answersRevealed;
      if (statUpdate.topAnswers) newStats.topAnswers += statUpdate.topAnswers;
      if (statUpdate.faceoffWins) newStats.faceoffWins += statUpdate.faceoffWins;
      if (statUpdate.stealsWon) newStats.stealsWon += statUpdate.stealsWon;
      if (statUpdate.fastMoneyPoints) newStats.fastMoneyPoints += statUpdate.fastMoneyPoints;
      // Team bonuses (cumulative)
      if (statUpdate.roundWinBonus) newStats.roundWinBonus = (newStats.roundWinBonus || 0) + statUpdate.roundWinBonus;
      if (statUpdate.fastMoneyBonus) newStats.fastMoneyBonus = (newStats.fastMoneyBonus || 0) + statUpdate.fastMoneyBonus;
      if (statUpdate.gameWinBonus) newStats.gameWinBonus = (newStats.gameWinBonus || 0) + statUpdate.gameWinBonus;
      // Calculate personal score (reduced to balance across games)
      const personalScore =
        (newStats.answersRevealed * 6) +     // +6 per answer (was 10)
        (newStats.topAnswers * 10) +         // +10 for top answer (was 15)
        (newStats.faceoffWins * 12) +        // +12 for faceoff win (was 20)
        (newStats.stealsWon * 5) +           // +5 for submitting steal answer (team effort, small bonus)
        (newStats.roundWinBonus || 0) +      // +5 per round win
        (newStats.fastMoneyBonus || 0) +     // +10 for FM win
        (newStats.gameWinBonus || 0) +       // +15 for game win
        (newStats.fastMoneyPoints || 0);
      // Also send to hub scoring (reduced values)
      if (hubEnabled && statUpdate.answersRevealed) {
        addHubPlayerScore(player.name, 6, 'Jon Feud', 'Correct answer (+6)');
      }
      if (hubEnabled && statUpdate.topAnswers) {
        addHubPlayerScore(player.name, 10, 'Jon Feud', 'Top answer (+10)');
      }
      if (hubEnabled && statUpdate.faceoffWins) {
        addHubPlayerScore(player.name, 12, 'Jon Feud', 'Won faceoff (+12)');
      }
      if (hubEnabled && statUpdate.stealsWon) {
        // Steal is collaborative - submitter gets small individual bonus
        // Team already gets 25 for winning the round via award()
        addHubPlayerScore(player.name, 5, 'Jon Feud', 'Submitted steal answer (+5)');
      }
      return { ...player, stats: newStats, personalScore };
    }));
  };

  // Get players for a specific team
  const getTeamPlayers = (team) => players.filter(p => p.team === team);

  // Get current player based on auto-rotation index (or manual override if set)
  const getSelectedPlayer = (team) => {
    const manualSelection = team === "A" ? selectedPlayerA : selectedPlayerB;
    if (manualSelection) return manualSelection;

    // Auto-select based on current index
    const teamPlayers = getTeamPlayers(team);
    if (teamPlayers.length === 0) return null;
    const index = team === "A" ? currentPlayerIndexA : currentPlayerIndexB;
    return teamPlayers[index % teamPlayers.length]?.id || null;
  };

  // Get the faceoff player for a team (based on round number)
  const getFaceoffPlayer = (team) => {
    const teamPlayers = getTeamPlayers(team);
    if (teamPlayers.length === 0) return null;
    return teamPlayers[faceoffPlayerIndex % teamPlayers.length];
  };

  // Rotate to next player on a team (for main play)
  const rotateToNextPlayer = (team) => {
    const teamPlayers = getTeamPlayers(team);
    if (teamPlayers.length <= 1) return;

    if (team === "A") {
      setCurrentPlayerIndexA(prev => (prev + 1) % teamPlayers.length);
      setSelectedPlayerA(null); // Clear manual override
    } else {
      setCurrentPlayerIndexB(prev => (prev + 1) % teamPlayers.length);
      setSelectedPlayerB(null); // Clear manual override
    }
  };

  // Set current player to the faceoff player (when round starts)
  const setPlayerToFaceoffPlayer = (team) => {
    const teamPlayers = getTeamPlayers(team);
    if (teamPlayers.length === 0) return;
    const faceoffIdx = faceoffPlayerIndex % teamPlayers.length;

    if (team === "A") {
      setCurrentPlayerIndexA(faceoffIdx);
      setSelectedPlayerA(null);
    } else {
      setCurrentPlayerIndexB(faceoffIdx);
      setSelectedPlayerB(null);
    }
  };

  const stopTyping = () => {
    if (typewriterTimerRef.current) {
      clearInterval(typewriterTimerRef.current);
      typewriterTimerRef.current = null;
    }
  };
  
  const gameRounds = useMemo(() => {
    if (!gameSettings) return [];
    return data.rounds.slice(0, gameSettings.numRounds);
  }, [data.rounds, gameSettings]);

  const currentRound = gameRounds[Math.min(roundIndex, gameRounds.length - 1)];
  const roundMultiplier =
    currentRound && typeof currentRound.multiplier === "number"
      ? currentRound.multiplier
      : defaultMultiplierByIndex(roundIndex);

  const suddenItem = data.suddenDeath[Math.min(suddenIndex, data.suddenDeath.length - 1)];
  const suddenMultiplier = suddenItem && typeof suddenItem.multiplier === "number" ? suddenItem.multiplier : 3;

  const answers = useMemo(() => {
    if (phase === "sudden") {
      const a = suddenItem?.answer ? [suddenItem.answer] : [];
      while (a.length < 1) a.push({ text: "", points: 0 });
      return a;
    }
    const base = currentRound?.answers?.slice?.(0, 8) || [];
    while (base.length < 8) base.push({ text: "", points: 0 });
    return base;
  }, [phase, currentRound, suddenItem]);

  // Typewriter effect - only starts after faceoff is acknowledged or during round play
  useEffect(() => {
    stopTyping();
    const text = currentRound?.question;

    // During faceoff, only show question after banner is acknowledged
    if (phase === "faceoff") {
      if (faceoffAcknowledged && text) {
        // Start typewriter after acknowledgment
        setDisplayedQuestion('');
        typewriterTimerRef.current = setInterval(() => {
          setDisplayedQuestion(currentText => {
            if (currentText.length < text.length) {
              return text.substring(0, currentText.length + 1);
            } else {
              stopTyping();
              return text;
            }
          });
        }, 100);
      } else {
        // Banner not acknowledged yet - don't show question
        setDisplayedQuestion('');
      }
    } else if (phase === "round") {
      // During round, show full question (typewriter already happened in faceoff)
      setDisplayedQuestion(text || '');
    } else if (phase === "passOrPlay") {
      // Show question during pass/play choice
      setDisplayedQuestion(text || '');
    } else {
      setDisplayedQuestion('');
    }

    return () => stopTyping();
  }, [currentRound, phase, faceoffAcknowledged]);

  useEffect(() => {
    if (faceoffBuzz) {
      stopTyping();
      setTimerActive(false);
    }
  }, [faceoffBuzz]);

  // Keyboard controls
  useEffect(() => {
    if (!gameSettings) return;
    function onKey(e) {
      if (e.repeat) return;
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;

      const k = e.key.toLowerCase();

      if ((phase === "faceoff" || phase === "sudden") && !faceoffBuzz) {
        // Team A buzzer: Q, Z, 1, or Left Arrow (for arcade buttons)
        if (k === "q" || k === "z" || k === "1" || k === "arrowleft") {
          e.preventDefault();
          setFaceoffBuzz("A");
          setFaceoffTurn("A");
          buzzA();
          addAction(`${teamAName} buzzed in!`);
          return;
        }
        // Team B buzzer: P, M, 2, or Right Arrow (for arcade buttons)
        if (k === "p" || k === "m" || k === "2" || k === "arrowright") {
          e.preventDefault();
          setFaceoffBuzz("B");
          setFaceoffTurn("B");
          buzzB();
          addAction(`${teamBName} buzzed in!`);
          return;
        }
      }

      if ((phase === "faceoff" || phase === "sudden") && k === "x" && faceoffBuzz) {
        passFaceoff();
        return;
      }

      if (k >= "1" && k <= "8" && phase !== "fast" && phase !== "gameover") {
        toggleReveal(parseInt(k, 10) - 1);
        return;
      }

      if (phase === "round" && k === "x") {
        addStrike();
        return;
      }

      if (k === "a") award("A");
      else if (k === "l") award("B");
      else if (k === "n") nextRound();
      else if (k === "r") restart();
      else if (k === "f") toggleFullscreen();
      else if (k === "d") ding();
      else if (k === "b") buzz();
      else if (k === "t") startTimer();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gameSettings, phase, faceoffBuzz, faceoffTurn, bank, controlTeam, strikes, isAwarding, teamAName, teamBName]);

  function startTimer() {
    if (phase === "faceoff" || phase === "sudden") {
      setTimerSeconds(5);
      setTimerActive(true);
      addAction("Timer started: 5 seconds");
    } else if (phase === "round") {
      setTimerSeconds(20);
      setTimerActive(true);
      addAction("Timer started: 20 seconds");
    } else if (phase === "fast") {
      setTimerSeconds(15);
      setTimerActive(true);
      addAction("Timer started: 15 seconds");
    }
  }

  function revealFullQuestion() {
    stopTyping();
    if (currentRound?.question) {
      setDisplayedQuestion(currentRound.question);
    }
  }

  function startFaceoff(force = false) {
    if (!force && (phase === "round" || phase === "steal")) return;
    stopTyping();
    setPhase("faceoff");
    setFaceoffBuzz(null);
    setFaceoffTurn(null);
    setControlTeam(null);
    setFaceoffAnswerA(null);
    setFaceoffAnswerB(null);
    setFaceoffMissedA(false);
    setFaceoffMissedB(false);
    setFaceoffAcknowledged(false);
    setRevealed(Array(8).fill(false));
    setStrikes(0);
    setBank(0);
    setTimerActive(false);
    setStealAttempted(false);
    setStealResult(null);
    setFaceoffWinner(null);

    // Auto-set faceoff players based on round number
    setPlayerToFaceoffPlayer("A");
    setPlayerToFaceoffPlayer("B");
  }

  function startSudden() {
    if (phase === "round" || phase === "steal") return;
    stopTyping();
    setPhase("sudden");
    setFaceoffBuzz(null);
    setFaceoffTurn(null);
    setControlTeam(null);
    setRevealed([false]);
    setStrikes(0);
    setBank(0);
    setTimerActive(false);
    addAction("Sudden Death begins!");
  }
  
  // Show pass/play choice after faceoff win
  function showPassOrPlay(winningTeam) {
    const losingTeam = winningTeam === "A" ? "B" : "A";
    setFaceoffWinner(winningTeam);
    setPhase("passOrPlay");
    // DON'T rotate here - we'll rotate when the round actually starts
    // This avoids timing issues with React state batching
    const winnerName = winningTeam === "A" ? teamAName : teamBName;
    addAction(`${winnerName} won the faceoff! Play or Pass?`);
  }

  // Winner chooses to play
  function choosePlay() {
    if (!faceoffWinner) return;
    const teamName = faceoffWinner === "A" ? teamAName : teamBName;
    addAction(`${teamName} chooses to PLAY!`);
    beginRoundWithTeam(faceoffWinner);
  }

  // Winner chooses to pass
  function choosePass() {
    if (!faceoffWinner) return;
    const otherTeam = faceoffWinner === "A" ? "B" : "A";
    const winnerName = faceoffWinner === "A" ? teamAName : teamBName;
    const otherName = otherTeam === "A" ? teamAName : teamBName;
    addAction(`${winnerName} chooses to PASS! ${otherName} must play.`);
    beginRoundWithTeam(otherTeam);
  }

  // Start the round with a specific team
  function beginRoundWithTeam(team) {
    // Rotate BOTH teams past their faceoff players now that the round is starting
    // This ensures the faceoff player doesn't guess first - the next player does
    const teamAPlayers = getTeamPlayers("A");
    const teamBPlayers = getTeamPlayers("B");

    // Rotate Team A to next player after faceoff player
    if (teamAPlayers.length > 1) {
      const faceoffIdxA = faceoffPlayerIndex % teamAPlayers.length;
      setCurrentPlayerIndexA((faceoffIdxA + 1) % teamAPlayers.length);
      setSelectedPlayerA(null);
    }

    // Rotate Team B to next player after faceoff player
    if (teamBPlayers.length > 1) {
      const faceoffIdxB = faceoffPlayerIndex % teamBPlayers.length;
      setCurrentPlayerIndexB((faceoffIdxB + 1) % teamBPlayers.length);
      setSelectedPlayerB(null);
    }

    setControlTeam(team);
    setPhase("round");
    setFaceoffWinner(null);
    blip();
    const teamName = team === "A" ? teamAName : teamBName;
    addAction(`${teamName} takes control!`);
  }

  // Legacy function for compatibility
  function beginRound(team) {
    if (!faceoffBuzz) return;
    showPassOrPlay(team);
  }
  
  function passFaceoff() {
    if (!faceoffBuzz) return;
    // Reveal full question when they get it wrong or pass
    revealFullQuestion();
    const nextTurn = faceoffTurn === "A" ? "B" : "A";
    const nextTeamName = nextTurn === "A" ? teamAName : teamBName;
    setFaceoffTurn(nextTurn);
    buzz();
    addAction(`Wrong answer! Turn passes to ${nextTeamName}`);
  }

  function toggleReveal(i) {
    // Don't auto-reveal full question - keep it at whatever was shown when they buzzed
    const slot = answers[i];
    if (!slot || !slot.points) return;

    if (phase === "sudden") {
      setRevealed((prev) => {
        const next = [...prev];
        const on = !next[i];
        next[i] = on;
        if (on) {
          ding();
          const payout = slot.points * suddenMultiplier;
          const winningTeamName = faceoffTurn === "A" ? teamAName : teamBName;
          if (faceoffTurn === "A") setTeamA((s) => s + payout);
          else setTeamB((s) => s + payout);
          setBank(0);
          addAction(`Sudden Death won by ${winningTeamName}! +${payout} points`);
          setTimeout(() => setPhase("gameover"), 700);
        }
        return next;
      });
      return;
    }

    setRevealed((prev) => {
      const next = [...prev];
      const on = !next[i];
      next[i] = on;
      if (on) {
        setBank((b) => b + slot.points);
        ding();
        const isTopAnswer = i === 0;
        addAction(`Revealed: "${slot.text}" for ${slot.points} points${isTopAnswer ? " (TOP ANSWER!)" : ""}`);

        // Note: No individual top answer bonus during steal - it's a team effort
        // Team gets 25 for winning the round via award(), submitter gets 5 via stealsWon

        // Auto-rotate to next player after correct answer during main play
        if (phase === "round" && controlTeam) {
          rotateToNextPlayer(controlTeam);
        }
      } else {
        setBank((b) => Math.max(0, b - slot.points));
        addAction(`Hidden: "${slot.text}"`);
      }
      return next;
    });
  }

  function addStrike() {
    setStrikes((s) => {
      const ns = Math.min(3, s + 1);
      buzz();
      const controlTeamName = controlTeam === "A" ? teamAName : teamBName;
      addAction(`Strike ${ns}/3 for ${controlTeamName}`);
      if (ns === 3) {
        setPhase("steal");
        const stealTeamName = controlTeam === "A" ? teamBName : teamAName;
        addAction(`3 strikes! ${stealTeamName} can steal!`);
      } else {
        // After strike 1 or 2, rotate to next player on the same team
        rotateToNextPlayer(controlTeam);
      }
      return ns;
    });
  }

  function award(team) {
    if (bank <= 0 || isAwarding) return;
    setIsAwarding(true);
    const mult = phase === "sudden" ? suddenMultiplier : roundMultiplier;
    const payout = bank * mult;
    const awardedTeamName = team === "A" ? teamAName : teamBName;
    if (team === "A") setTeamA((s) => s + payout);
    else setTeamB((s) => s + payout);
    addAction(`${awardedTeamName} awarded ${payout} points! (${bank} × ${mult})`);

    // Hub scoring: +25 to winning team
    if (hubEnabled) {
      addHubTeamScore(team, 25, 'Jon Feud', `Won round (+25)`);
    }

    // Award round win bonus (+5) to all players on winning team
    players.filter(p => p.team === team).forEach(p => {
      updatePlayerStats(p.id, { roundWinBonus: 5 });
    });
    addAction(`+5 personal points to all ${awardedTeamName} players for round win!`);

    setBank(0);
    setTimeout(() => setIsAwarding(false), 300);
  }

  function nextRound() {
    stopTyping();
    setTimerActive(false);
    
    if (phase === "sudden") {
      addAction("Game complete!");
      setPhase("gameover");
      return;
    }

    if (roundIndex + 1 >= gameRounds.length) {
      if (teamA === teamB && data.suddenDeath.length > 0) {
        const nextSuddenIdx = suddenIndex;
        if (nextSuddenIdx >= data.suddenDeath.length) {
          setPhase("gameover");
          return;
        }
        setSuddenIndex(nextSuddenIdx);
        startSudden();
        return;
      }
      addAction("All rounds complete!");
      setPhase("gameover");
      setFaceoffBuzz(null);
      setFaceoffTurn(null);
      setControlTeam(null);
      setRevealed(Array(8).fill(false));
      setStrikes(0);
      setBank(0);
      return;
    }

    setRoundIndex((i) => i + 1);
    // Increment faceoff player index so next players do the faceoff
    setFaceoffPlayerIndex((i) => i + 1);
    addAction(`Moving to Round ${roundIndex + 2}`);
    startFaceoff(true);  // Force reset even from steal phase
  }

  function restart() {
    stopTyping();
    setGameSettings(null);
    setPlayers([]);
    setTeamAName("Team A Family");
    setTeamBName("Team B Family");
    setPhase("faceoff");
    setRoundIndex(0);
    setSuddenIndex(0);
    setRevealed(Array(8).fill(false));
    setStrikes(0);
    setBank(0);
    setTeamA(0);
    setTeamB(0);
    setFaceoffBuzz(null);
    setFaceoffTurn(null);
    setControlTeam(null);
    setFaceoffAnswerA(null);
    setFaceoffAnswerB(null);
    setFaceoffMissedA(false);
    setFaceoffMissedB(false);
    setFaceoffAcknowledged(false);
    setFmPoints1(Array(5).fill(0));
    setFmPoints2(Array(5).fill(0));
    setFmShown(Array(5).fill(false));
    setFmTargetHit(false);
    setStealAttempted(false);
    setStealResult(null);
    setFaceoffWinner(null);
    setSelectedPlayerA(null);
    setSelectedPlayerB(null);
    setGameWinBonusAwarded(false);
    setIsAwarding(false);
    setFaceoffPlayerIndex(0);
    setCurrentPlayerIndexA(0);
    setCurrentPlayerIndexB(0);
    setActionHistory([]);
    setTimerActive(false);
    setHubEnabled(false);
    setAutoStarted(false);
  }

  function toggleFullscreen() {
    const doc = document;
    const el = document.documentElement;
    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
    } else {
      (doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc);
    }
  }

  const stealingTeam = controlTeam === "A" ? "B" : "A";

  function resolveSteal(success) {
    const stealTeamName = stealingTeam === "A" ? teamAName : teamBName;
    const controlTeamName = controlTeam === "A" ? teamAName : teamBName;

    setStealAttempted(true); // Disable further input after steal attempt
    setStealResult(success ? 'success' : 'failed');

    if (success) {
      award(stealingTeam);
      addAction(`${stealTeamName} successfully stole!`);
      // Reveal all remaining answers after successful steal
      setRevealed(answers.map((a, i) => revealed[i] || (a.text && a.points > 0)));
    } else {
      award(controlTeam || "A");
      addAction(`Steal failed! ${controlTeamName} keeps points`);
      // Reveal all remaining answers to show what was on the board
      setRevealed(answers.map((a, i) => revealed[i] || (a.text && a.points > 0)));
      addAction("Revealing remaining answers...");
    }
  }

  function goToFastMoney() {
    stopTyping();
    setPhase("fast");
    setFaceoffBuzz(null);
    setFaceoffTurn(null);
    setControlTeam(null);
    setRevealed(Array(8).fill(false));
    setStrikes(0);
    setBank(0);
    setFmShown(Array(5).fill(false));
    setFmPoints1(Array(5).fill(0));
    setFmPoints2(Array(5).fill(0));
    addAction("Fast Money begins!");
  }

  const fmTotal1 = fmPoints1.reduce((a, b) => a + (Number(b) || 0), 0);
  const fmTotal2 = fmPoints2.reduce((a, b) => a + (Number(b) || 0), 0);
  const fmCombined = fmTotal1 + fmTotal2;

  // Fast Money target detection - award hub points when 200+ is hit
  useEffect(() => {
    if (phase === 'fast' && fmCombined >= 200 && !fmTargetHit) {
      setFmTargetHit(true);
      // Award +20 hub points to the winning team (team with higher score, or A if tied)
      const winningTeam = teamA >= teamB ? 'A' : 'B';
      if (hubEnabled) {
        addHubTeamScore(winningTeam, 20, 'Jon Feud', 'Fast Money target hit (+20)');
      }
      // Award +10 personal points to all players on winning team for Fast Money win
      players.filter(p => p.team === winningTeam).forEach(p => {
        updatePlayerStats(p.id, { fastMoneyBonus: 10 });
      });
      const winningTeamName = winningTeam === 'A' ? teamAName : teamBName;
      addAction(`Fast Money target hit! +10 personal points to all ${winningTeamName} players!`);
    }
  }, [phase, fmCombined, fmTargetHit, hubEnabled, teamA, teamB, players, teamAName, teamBName]);

  const activeMult = phase === "sudden" ? suddenMultiplier : roundMultiplier;
  const multLabel = labelForMult(activeMult);

  // Check if all valid answers have been revealed (round is complete)
  const validAnswersCount = answers.filter(a => a.text && a.points > 0).length;
  const revealedCount = revealed.filter((r, i) => r && answers[i]?.text && answers[i]?.points > 0).length;
  const allAnswersRevealed = revealedCount === validAnswersCount && validAnswersCount > 0;
  const roundComplete = allAnswersRevealed && bank === 0;

  // Auto-award when all answers are revealed during regular round play
  useEffect(() => {
    if (phase === "round" && allAnswersRevealed && bank > 0 && controlTeam && !isAwarding) {
      // All answers revealed, auto-award to control team
      award(controlTeam);
    }
  }, [phase, allAnswersRevealed, bank, controlTeam, isAwarding]);

  const winner = teamA > teamB ? teamAName : teamB > teamA ? teamBName : "Tie";

  // Award game win bonus (+15 per player) when game ends (reduced from 20)
  useEffect(() => {
    if (phase === "gameover" && !gameWinBonusAwarded && winner !== "Tie") {
      setGameWinBonusAwarded(true);
      const winningTeamLetter = teamA > teamB ? "A" : "B";
      players.filter(p => p.team === winningTeamLetter).forEach(p => {
        updatePlayerStats(p.id, { gameWinBonus: 15 });
      });
      addAction(`+15 personal points to all ${winner} players for winning the game!`);
    }
  }, [phase, gameWinBonusAwarded, winner, teamA, teamB, players]);

  if (!gameSettings) {
    return <StartScreen onStart={(settings) => {
      setGameSettings(settings);
      setPlayers(settings.players);
      setTeamAName(settings.teamAName + " Family");
      setTeamBName(settings.teamBName + " Family");
      addAction("Game started!");
    }} totalAvailableRounds={data.rounds.length} />;
  }

  return (
    <div
      className="min-h-[100dvh] text-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
      style={{ ...gradientBg, fontFamily: "Barlow, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}
    >
      <Timer 
        seconds={timerSeconds} 
        isActive={timerActive} 
        onComplete={() => {
          setTimerActive(false);
          buzz();
          addAction("Time's up!");
        }} 
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <GameHeader 
          loaded={loaded} 
          volume={volume} 
          setVolume={setVolume} 
          theme={theme} 
          toggleFullscreen={toggleFullscreen}
          startTimer={startTimer}
        />

        <Scoreboard 
          teamA={teamA} 
          teamB={teamB} 
          teamAName={teamAName}
          teamBName={teamBName}
          players={players}
          phase={phase} 
          controlTeam={controlTeam} 
          faceoffTurn={faceoffTurn} 
          stealingTeam={stealingTeam} 
        />

        {phase !== "fast" && phase !== "gameover" && (
          <section className="mt-4 bg-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-md select-none">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs uppercase tracking-widest opacity-80">
                {phase === "sudden" ? (
                  <>
                    Sudden Death ·{" "}
                    <span className="px-2 py-0.5 rounded bg-yellow-300 text-black font-bold">
                      {multLabel} ×{activeMult}
                    </span>
                  </>
                ) : (
                  <>
                    Round {roundIndex + 1} / {gameRounds.length} ·{" "}
                    <span className="px-2 py-0.5 rounded bg-yellow-300 text-black font-bold">
                      {multLabel} ×{activeMult}
                    </span>
                  </>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-widest opacity-80">Bank</div>
                <div className="text-3xl md:text-4xl font-black tabular-nums">{bank}</div>
                <div className="text-[11px] opacity-80">
                  Payout: {bank} × {activeMult} = {bank * activeMult}
                </div>
              </div>
            </div>

            {/* Faceoff Players Banner - click to acknowledge and start */}
            {phase === "faceoff" && !faceoffAcknowledged && (
              <div
                className="my-4 p-6 bg-gradient-to-r from-blue-600/40 via-purple-600/40 to-red-600/40 rounded-xl border-2 border-yellow-400 cursor-pointer hover:border-yellow-300 hover:scale-[1.02] transition-all"
                onClick={() => setFaceoffAcknowledged(true)}
              >
                <div className="text-center text-yellow-300 text-lg font-bold uppercase tracking-wider mb-3">
                  🔔 Round {roundIndex + 1} Faceoff 🔔
                </div>
                <div className="flex justify-center items-center gap-6 text-xl font-bold mb-4">
                  <div className="text-blue-300">
                    <span className="text-white/60 text-sm block">{teamAName}</span>
                    {getFaceoffPlayer('A')?.name || '?'}
                  </div>
                  <div className="text-yellow-400 text-3xl">VS</div>
                  <div className="text-red-300">
                    <span className="text-white/60 text-sm block">{teamBName}</span>
                    {getFaceoffPlayer('B')?.name || '?'}
                  </div>
                </div>
                <div className="text-center text-yellow-400 text-sm font-bold animate-pulse">
                  👆 Click to Start Faceoff 👆
                </div>
              </div>
            )}

            <QuestionDisplay
              displayedQuestion={displayedQuestion}
              phase={phase}
              faceoffBuzz={faceoffBuzz}
              faceoffTurn={faceoffTurn}
            />

            <AnswersBoard
              answers={answers}
              revealed={revealed}
              phase={phase}
              toggleReveal={toggleReveal}
            />

            {/* Player Selector - shown during gameplay */}
            {!allAnswersRevealed && ((phase === "round" && controlTeam) ||
              (phase === "faceoff" && faceoffBuzz) ||
              (phase === "steal" && controlTeam && !stealAttempted)) && (
              <PlayerSelector
                players={players}
                currentTeam={phase === "steal" ? stealingTeam : (phase === "faceoff" ? faceoffTurn : controlTeam)}
                selectedPlayerId={phase === "steal" ? getSelectedPlayer(stealingTeam) : (phase === "faceoff" ? getSelectedPlayer(faceoffTurn) : getSelectedPlayer(controlTeam))}
                onSelectPlayer={(playerId) => {
                  const playerTeam = players.find(p => p.id === playerId)?.team;
                  if (playerTeam === "A") setSelectedPlayerA(playerId);
                  else setSelectedPlayerB(playerId);
                }}
                teamAName={teamAName}
                teamBName={teamBName}
              />
            )}

            {/* Answer Input - shown during gameplay, hidden when all answers revealed */}
            {!allAnswersRevealed && ((phase === "round" && controlTeam) ||
              (phase === "faceoff" && faceoffBuzz) ||
              (phase === "steal" && controlTeam && !stealAttempted)) && (
              <AnswerInput
                answers={answers}
                revealed={revealed}
                onReveal={(idx) => {
                  toggleReveal(idx);
                  const isTopAnswer = idx === 0;

                  // Track player stats for correct answers during regular rounds
                  if (phase === "round" && controlTeam) {
                    const currentPlayerId = getSelectedPlayer(controlTeam);
                    if (currentPlayerId) {
                      updatePlayerStats(currentPlayerId, {
                        answersRevealed: 1,
                        topAnswers: isTopAnswer ? 1 : 0
                      });
                      const playerName = players.find(p => p.id === currentPlayerId)?.name;
                      if (playerName) {
                        addAction(`📊 ${playerName} +${isTopAnswer ? 25 : 10} personal points`);
                      }
                    }
                  }

                  // During faceoff - track answers and let both teams guess
                  if (phase === "faceoff" && faceoffTurn) {
                    // Reveal full question after any faceoff guess
                    revealFullQuestion();

                    const answerPoints = answers[idx]?.points || 0;
                    const currentPlayerId = getSelectedPlayer(faceoffTurn);

                    // Track faceoff answer for the player
                    if (currentPlayerId) {
                      updatePlayerStats(currentPlayerId, {
                        answersRevealed: 1,
                        topAnswers: isTopAnswer ? 1 : 0
                      });
                    }

                    // If someone gets the #1 answer, they automatically win!
                    if (isTopAnswer) {
                      const winnerName = faceoffTurn === "A" ? teamAName : teamBName;
                      addAction(`🎯 ${winnerName} got the #1 answer and wins the faceoff!`);
                      // Award faceoff win to player
                      if (currentPlayerId) {
                        updatePlayerStats(currentPlayerId, { faceoffWins: 1 });
                      }
                      beginRound(faceoffTurn);
                      return;
                    }

                    if (faceoffTurn === "A") {
                      setFaceoffAnswerA(idx);
                      // Team A got a correct answer
                      if (faceoffAnswerB !== null) {
                        // Both teams have answered - compare
                        const teamAPoints = answerPoints;
                        const teamBPoints = answers[faceoffAnswerB]?.points || 0;
                        if (teamAPoints >= teamBPoints) {
                          addAction(`${teamAName} wins faceoff with higher answer!`);
                          if (currentPlayerId) updatePlayerStats(currentPlayerId, { faceoffWins: 1 });
                          beginRound("A");
                        } else {
                          addAction(`${teamBName} wins faceoff with higher answer!`);
                          const otherPlayerId = getSelectedPlayer("B");
                          if (otherPlayerId) updatePlayerStats(otherPlayerId, { faceoffWins: 1 });
                          beginRound("B");
                        }
                      } else if (faceoffMissedB) {
                        // Team B already missed - Team A wins automatically!
                        addAction(`${teamAName} wins the faceoff!`);
                        if (currentPlayerId) updatePlayerStats(currentPlayerId, { faceoffWins: 1 });
                        beginRound("A");
                      } else {
                        // Team A answered first, switch to Team B
                        addAction(`${teamAName} got "${answers[idx].text}" for ${answerPoints}! ${teamBName}'s turn to beat it.`);
                        setFaceoffTurn("B");
                      }
                    } else {
                      setFaceoffAnswerB(idx);
                      // Team B got a correct answer
                      if (faceoffAnswerA !== null) {
                        // Both teams have answered - compare
                        const teamBPoints = answerPoints;
                        const teamAPoints = answers[faceoffAnswerA]?.points || 0;
                        if (teamBPoints > teamAPoints) {
                          addAction(`${teamBName} wins faceoff with higher answer!`);
                          if (currentPlayerId) updatePlayerStats(currentPlayerId, { faceoffWins: 1 });
                          beginRound("B");
                        } else {
                          addAction(`${teamAName} wins faceoff with higher/equal answer!`);
                          const otherPlayerId = getSelectedPlayer("A");
                          if (otherPlayerId) updatePlayerStats(otherPlayerId, { faceoffWins: 1 });
                          beginRound("A");
                        }
                      } else if (faceoffMissedA) {
                        // Team A already missed - Team B wins automatically!
                        addAction(`${teamBName} wins the faceoff!`);
                        if (currentPlayerId) updatePlayerStats(currentPlayerId, { faceoffWins: 1 });
                        beginRound("B");
                      } else {
                        // Team B answered first, switch to Team A
                        addAction(`${teamBName} got "${answers[idx].text}" for ${answerPoints}! ${teamAName}'s turn to beat it.`);
                        setFaceoffTurn("A");
                      }
                    }
                  }
                  // During steal, if they get a correct answer, auto-succeed the steal
                  // Steal is a TEAM effort - everyone collaborates. Only give submitter a small bonus.
                  if (phase === "steal") {
                    const currentPlayerId = getSelectedPlayer(stealingTeam);
                    if (currentPlayerId) {
                      // Only give stealsWon - no answersRevealed or topAnswers since it's a team effort
                      updatePlayerStats(currentPlayerId, {
                        stealsWon: 1
                      });
                    }
                    addAction(`Steal successful! Matched answer #${idx + 1}`);
                    resolveSteal(true);
                  }
                }}
                onWrongAnswer={(answer) => {
                  if (phase === "round") {
                    addStrike();
                    addAction(`Wrong answer: "${answer}"`);
                  } else if (phase === "steal") {
                    // Steal attempt failed
                    addAction(`Steal failed! "${answer}" was wrong`);
                    resolveSteal(false);
                  } else if (phase === "faceoff") {
                    // Reveal full question after any faceoff guess
                    revealFullQuestion();

                    // Wrong answer in faceoff - mark as missed and pass turn
                    if (faceoffTurn === "A") {
                      setFaceoffMissedA(true);
                      // Check if Team B already has an answer - they win
                      if (faceoffAnswerB !== null) {
                        addAction(`Wrong! ${teamBName} wins the faceoff!`);
                        beginRound("B");
                      } else {
                        // Team A missed, pass to Team B
                        addAction(`Wrong answer: "${answer}". ${teamBName}'s turn!`);
                        setFaceoffTurn("B");
                      }
                    } else {
                      setFaceoffMissedB(true);
                      // Check if Team A already has an answer - they win
                      if (faceoffAnswerA !== null) {
                        addAction(`Wrong! ${teamAName} wins the faceoff!`);
                        beginRound("A");
                      } else {
                        // Team B missed, pass to Team A
                        addAction(`Wrong answer: "${answer}". ${teamAName}'s turn!`);
                        setFaceoffTurn("A");
                      }
                    }
                  } else {
                    buzz();
                    addAction(`Wrong answer: "${answer}"`);
                  }
                }}
                disabled={phase === "gameover" || phase === "fast"}
                placeholder={
                  phase === "steal" ? "Type steal attempt..." :
                  phase === "faceoff" ? `${faceoffTurn === "A" ? teamAName : teamBName}: Type your faceoff answer...` :
                  "Type an answer..."
                }
              />
            )}

            {(phase === "faceoff" || phase === "sudden") && (
              <FaceoffControls
                phase={phase}
                faceoffBuzz={faceoffBuzz}
                faceoffTurn={faceoffTurn}
                beginRound={beginRound}
                passFaceoff={passFaceoff}
                startFaceoff={startFaceoff}
                startSudden={startSudden}
              />
            )}

            {/* Pass or Play choice after faceoff win */}
            {phase === "passOrPlay" && faceoffWinner && (
              <div className="mb-6 p-6 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-2xl border-2 border-yellow-400">
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-yellow-300 mb-2">
                    🏆 {faceoffWinner === "A" ? teamAName : teamBName} Won the Faceoff!
                  </div>
                  <div className="text-lg text-white">
                    Do you want to PLAY or PASS?
                  </div>
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={choosePlay}
                    className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded-xl shadow-lg transform hover:scale-105 transition"
                  >
                    ✅ PLAY
                  </button>
                  <button
                    onClick={choosePass}
                    className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold text-xl rounded-xl shadow-lg transform hover:scale-105 transition"
                  >
                    ❌ PASS
                  </button>
                </div>
                <div className="text-center mt-3 text-sm text-white/70">
                  Play = Your team answers | Pass = Other team must answer
                </div>
              </div>
            )}

            {(phase === "round" || phase === "steal") && (
              <StrikesDisplay
                strikes={strikes}
                controlTeam={controlTeam}
                controlTeamName={controlTeam === "A" ? teamAName : teamBName}
                phase={phase}
                addStrike={addStrike}
              />
            )}

            {phase === "steal" && (
              <StealPanel
                stealingTeam={stealingTeam}
                controlTeam={controlTeam}
                resolveSteal={resolveSteal}
                stealingTeamName={stealingTeam === "A" ? teamAName : teamBName}
                controlTeamName={controlTeam === "A" ? teamAName : teamBName}
                stealResult={stealResult}
              />
            )}

            <RoundControls
              nextRound={nextRound}
              restart={restart}
              roundComplete={roundComplete}
            />

            <ActionHistory history={actionHistory} />
          </section>
        )}

        {phase === "gameover" && (
          <GameOverScreen 
            winner={winner} 
            teamA={teamA} 
            teamB={teamB} 
            teamAName={teamAName}
            teamBName={teamBName}
            players={players}
            goToFastMoney={goToFastMoney} 
            restart={restart} 
          />
        )}

        {phase === "fast" && (
          <FastMoney
            fastMoneyPrompts={data.fastMoneyPrompts}
            fmPoints1={fmPoints1}
            fmPoints2={fmPoints2}
            fmShown={fmShown}
            setFmPoints1={setFmPoints1}
            setFmPoints2={setFmPoints2}
            setFmShown={setFmShown}
            fmTotal1={fmTotal1}
            fmTotal2={fmTotal2}
            blip={blip}
            duplicateBuzz={duplicateBuzz}
            restart={restart}
          />
        )}
      </div>
    </div>
  );
}