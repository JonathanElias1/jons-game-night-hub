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
  const [fmPoints1, setFmPoints1] = useState(Array(5).fill(0));
  const [fmPoints2, setFmPoints2] = useState(Array(5).fill(0));
  const [fmShown, setFmShown] = useState(Array(5).fill(false));
  const [displayedQuestion, setDisplayedQuestion] = useState("");
  const [isAwarding, setIsAwarding] = useState(false);
  const [actionHistory, setActionHistory] = useState([]);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(20);
  
  const typewriterTimerRef = useRef(null);
  
  const { data, loaded } = useGameData();
  const { ding, buzz, blip, buzzA, buzzB, volume, setVolume } = useAudio();
  const theme = useThemeMusic();

  // Auto-start from hub data if available
  useEffect(() => {
    if (autoStarted || gameSettings) return;

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
        setAutoStarted(true);
        setPlayers([...playersA, ...playersB]);
        setTeamAName(teamNames.A);
        setTeamBName(teamNames.B);
        setGameSettings({ numRounds: 3, players: [...playersA, ...playersB], teamAName: teamNames.A, teamBName: teamNames.B });
      }
    }
  }, [autoStarted, gameSettings]);

  const addAction = (message) => {
    const time = new Date().toLocaleTimeString();
    setActionHistory(prev => [...prev, { time, message }]);
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

  // Typewriter effect
  useEffect(() => {
    stopTyping();
    const text = currentRound?.question;

    if (text) {
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
      setDisplayedQuestion('');
    }

    return () => stopTyping();
  }, [currentRound]);

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
        if (k === "q") {
          setFaceoffBuzz("A");
          setFaceoffTurn("A");
          buzzA();
          addAction(`${teamAName} buzzed in!`);
          return;
        }
        if (k === "p") {
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

  function startFaceoff() {
    if (phase === "round" || phase === "steal") return;
    stopTyping();
    setPhase("faceoff");
    setFaceoffBuzz(null);
    setFaceoffTurn(null);
    setControlTeam(null);
    setRevealed(Array(8).fill(false));
    setStrikes(0);
    setBank(0);
    setTimerActive(false);
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
  
  function beginRound(team) {
    if (!faceoffBuzz) return;
    setControlTeam(team);
    setPhase("round");
    blip();
    const teamName = team === "A" ? teamAName : teamBName;
    addAction(`${teamName} takes control!`);
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
    addAction(`Moving to Round ${roundIndex + 2}`);
    startFaceoff();
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
    setFmPoints1(Array(5).fill(0));
    setFmPoints2(Array(5).fill(0));
    setFmShown(Array(5).fill(false));
    setIsAwarding(false);
    setActionHistory([]);
    setTimerActive(false);
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
    
    if (success) {
      award(stealingTeam);
      addAction(`${stealTeamName} successfully stole!`);
    } else {
      award(controlTeam || "A");
      addAction(`Steal failed! ${controlTeamName} keeps points`);
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

  const awardDisabled = bank <= 0 || isAwarding;
  const activeMult = phase === "sudden" ? suddenMultiplier : roundMultiplier;
  const multLabel = labelForMult(activeMult);

  const winner = teamA > teamB ? teamAName : teamB > teamA ? teamBName : "Tie";

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

            {(phase === "round" || phase === "steal") && (
              <StrikesDisplay 
                strikes={strikes} 
                controlTeam={controlTeam} 
                phase={phase} 
                addStrike={addStrike} 
              />
            )}

            {phase === "steal" && (
              <StealPanel 
                stealingTeam={stealingTeam} 
                controlTeam={controlTeam} 
                resolveSteal={resolveSteal} 
              />
            )}

            <RoundControls 
              award={award} 
              awardDisabled={awardDisabled} 
              nextRound={nextRound} 
              restart={restart} 
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
            restart={restart}
          />
        )}
      </div>
    </div>
  );
}