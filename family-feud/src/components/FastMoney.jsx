import React, { useState, useEffect, useRef } from "react";
import { cls } from "../utils/helpers";
import { isDuplicateAnswer, findMatchingAnswer } from "../utils/answerMatching";

export function FastMoney({
  fastMoneyPrompts,
  fmPoints1,
  fmPoints2,
  fmShown,
  setFmPoints1,
  setFmPoints2,
  setFmShown,
  fmTotal1,
  fmTotal2,
  blip,
  duplicateBuzz,
  restart
}) {
  // Track typed answers for duplicate detection
  const [answers1, setAnswers1] = useState(Array(5).fill(""));
  const [answers2, setAnswers2] = useState(Array(5).fill(""));
  const [duplicates, setDuplicates] = useState(Array(5).fill(false));
  const [player, setPlayer] = useState(1); // 1 = first player, 2 = second player
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [pointsRevealed, setPointsRevealed] = useState(Array(5).fill(false)); // Track which points are revealed
  const [revealPhase, setRevealPhase] = useState(false); // True when both players are done and we're revealing
  const [p1TotalRevealed, setP1TotalRevealed] = useState(false); // Host clicks to reveal P1 total
  const [p2TotalRevealed, setP2TotalRevealed] = useState(false); // Host clicks to reveal P2 total
  const timerRef = useRef(null);
  const inputRefs1 = useRef([]);
  const inputRefs2 = useRef([]);

  // Timer countdown effect
  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false);
      // Play a sound or alert when time's up
      blip();
    }
    return () => clearTimeout(timerRef.current);
  }, [timerRunning, timeLeft]);

  const startTimer = () => {
    const duration = player === 1 ? 65 : 70; // 1:05 for P1, 1:10 for P2
    setTimeLeft(duration);
    setTimerRunning(true);
    blip();
  };

  const stopTimer = () => {
    setTimerRunning(false);
    clearTimeout(timerRef.current);
  };

  // Check for duplicates when Player 2 types
  useEffect(() => {
    if (player === 2) {
      const newDuplicates = answers2.map((ans2, i) => {
        if (!ans2.trim() || !answers1[i].trim()) return false;
        return isDuplicateAnswer(ans2, answers1[i]);
      });

      // Play buzzer for newly detected duplicates
      const hadNoDuplicates = duplicates.every(d => !d);
      const hasNewDuplicate = newDuplicates.some((d, i) => d && !duplicates[i]);

      if (hasNewDuplicate && duplicateBuzz) {
        duplicateBuzz();
      }

      setDuplicates(newDuplicates);
    }
  }, [answers2, answers1, player]);

  const handleReset = () => {
    setFmPoints1(Array(5).fill(0));
    setFmPoints2(Array(5).fill(0));
    setFmShown(Array(5).fill(false));
    setAnswers1(Array(5).fill(""));
    setAnswers2(Array(5).fill(""));
    setDuplicates(Array(5).fill(false));
    setPlayer(1);
    setTimerRunning(false);
    setTimeLeft(0);
    setPointsRevealed(Array(5).fill(false));
    setRevealPhase(false);
    setP1TotalRevealed(false);
    setP2TotalRevealed(false);
    clearTimeout(timerRef.current);
  };

  // Reveal next point (one at a time)
  const revealNextPoint = () => {
    const nextIdx = pointsRevealed.findIndex(r => !r);
    if (nextIdx !== -1) {
      setPointsRevealed(arr => arr.map((v, i) => i === nextIdx ? true : v));
      blip();
    }
  };

  // Enter reveal phase (after both players are done)
  const startRevealPhase = () => {
    setRevealPhase(true);
    setTimerRunning(false);
    clearTimeout(timerRef.current);
    blip();
  };

  const switchToPlayer2 = () => {
    setPlayer(2);
    setTimerRunning(false);
    setTimeLeft(0);
    clearTimeout(timerRef.current);
    blip();
  };

  // Auto-match answer and return points if found
  const findPointsForAnswer = (promptIndex, userAnswer) => {
    const prompt = fastMoneyPrompts[promptIndex];
    if (!prompt || !prompt.answers) return 0;

    // Build answers array for matching
    const answersWithStatus = prompt.answers.map(a => ({
      text: a.text,
      points: a.points,
      revealed: false
    }));

    const result = findMatchingAnswer(userAnswer, answersWithStatus);
    if (result.matched && result.answerIndex >= 0) {
      return prompt.answers[result.answerIndex].points;
    }
    return 0;
  };

  // Handle Player 1 answer change with auto-matching
  const handleAnswer1Change = (index, value) => {
    setAnswers1((arr) => arr.map((x, j) => (j === index ? value : x)));

    // Auto-fill points if we find a match
    const points = findPointsForAnswer(index, value);
    if (points > 0) {
      setFmPoints1((arr) => arr.map((x, j) => (j === index ? points : x)));
      blip();
    }
  };

  // Handle Player 1 Enter key - move to next input
  const handleAnswer1KeyDown = (index, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index < 4 && inputRefs1.current[index + 1]) {
        inputRefs1.current[index + 1].focus();
      }
    }
  };

  // Handle Player 2 answer change with auto-matching
  const handleAnswer2Change = (index, value) => {
    setAnswers2((arr) => arr.map((x, j) => (j === index ? value : x)));

    // Don't auto-fill if it's a duplicate
    if (!duplicates[index]) {
      const points = findPointsForAnswer(index, value);
      if (points > 0) {
        setFmPoints2((arr) => arr.map((x, j) => (j === index ? points : x)));
        blip();
      }
    }
  };

  // Handle Player 2 Enter key - move to next input
  const handleAnswer2KeyDown = (index, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index < 4 && inputRefs2.current[index + 1]) {
        inputRefs2.current[index + 1].focus();
      }
    }
  };

  const combined = fmTotal1 + fmTotal2;
  const targetHit = combined >= 200;

  return (
    <section className="mt-6 bg-white/10 rounded-2xl p-5 md:p-7 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xl md:text-2xl font-black">
          Fast Money
          <span className={cls(
            "ml-3 px-3 py-1 rounded-full text-sm font-bold",
            revealPhase ? "bg-yellow-500" : player === 1 ? "bg-blue-500" : "bg-green-500"
          )}>
            {revealPhase ? "Reveal Phase" : `Player ${player}`}
          </span>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {/* Timer Display */}
          {(timerRunning || timeLeft > 0) && !revealPhase && (
            <div className={cls(
              "px-4 py-2 rounded-xl font-black text-2xl min-w-[80px] text-center",
              timeLeft <= 5 ? "bg-red-500 text-white animate-pulse" : "bg-yellow-400 text-black"
            )}>
              {timeLeft}s
            </div>
          )}
          {/* Start Timer Button */}
          {!timerRunning && !revealPhase && (
            <button
              onClick={startTimer}
              className="px-3 py-2 rounded-xl bg-yellow-400 text-black hover:bg-yellow-300 transition font-bold"
            >
              ▶ Start ({player === 1 ? "1:05" : "1:10"})
            </button>
          )}
          {timerRunning && !revealPhase && (
            <button
              onClick={stopTimer}
              className="px-3 py-2 rounded-xl bg-red-500 text-white hover:bg-red-400 transition font-bold"
            >
              ⏹ Stop
            </button>
          )}
          {player === 1 && !revealPhase && (
            <button
              onClick={switchToPlayer2}
              className="px-3 py-2 rounded-xl bg-green-500 text-white hover:bg-green-400 transition font-semibold"
            >
              Switch to Player 2 →
            </button>
          )}
          {player === 2 && !revealPhase && (
            <button
              onClick={startRevealPhase}
              className="px-3 py-2 rounded-xl bg-yellow-500 text-black hover:bg-yellow-400 transition font-bold"
            >
              Done - Start Reveal
            </button>
          )}
          {revealPhase && (
            <button
              onClick={revealNextPoint}
              disabled={pointsRevealed.every(r => r)}
              className={cls(
                "px-4 py-2 rounded-xl font-bold transition text-lg",
                pointsRevealed.every(r => r)
                  ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                  : "bg-yellow-400 text-black hover:bg-yellow-300 animate-pulse"
              )}
            >
              🎯 Reveal Next Points ({pointsRevealed.filter(r => r).length}/5)
            </button>
          )}
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-xl bg-white text-black hover:opacity-90 transition font-semibold"
          >
            Reset Fast Money
          </button>
          <button
            onClick={() => {
              const idx = fmShown.findIndex((x) => !x);
              if (idx !== -1) {
                setFmShown((arr) => arr.map((v, i) => (i === idx ? true : v)));
                blip();
              }
            }}
            className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition"
          >
            Next Prompt
          </button>
          <button
            onClick={restart}
            className="px-3 py-2 rounded-xl bg-black/40 hover:bg-black/50 text-white transition"
          >
            New Game
          </button>
          <button
            onClick={() => window.location.href = '../'}
            className="px-3 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white transition font-semibold"
          >
            Back to Hub
          </button>
        </div>
      </div>

      <div className="mt-2 text-sm opacity-85">
        {revealPhase ? (
          <span className="text-yellow-300 font-semibold">Click "Reveal Next Points" to show each answer's points one at a time!</span>
        ) : player === 1 ? (
          <>Player 1 answers all 5 questions. Then click "Switch to Player 2".</>
        ) : (
          <>Player 2 answers. <span className="text-yellow-300 font-semibold">Duplicate answers will trigger a buzzer!</span> Click "Done - Start Reveal" when finished.</>
        )}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[700px] w-full text-left">
          <thead>
            <tr className="text-xs uppercase tracking-widest opacity-80">
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-2">Prompt</th>
              <th className="py-2 pr-2">P1 Answer</th>
              <th className="py-2 pr-2">P1 Pts</th>
              <th className="py-2 pr-2">P2 Answer</th>
              <th className="py-2 pr-2">P2 Pts</th>
              <th className="py-2 pr-2">Show</th>
            </tr>
          </thead>
          <tbody>
            {(fastMoneyPrompts || []).slice(0, 5).map((p, i) => (
              <tr key={i} className={cls(
                "border-t border-white/10 align-middle",
                duplicates[i] && "bg-red-500/20",
                pointsRevealed[i] && "bg-yellow-500/10"
              )}>
                <td className="py-2 pr-2 font-semibold">{i + 1}</td>
                <td className="py-2 pr-2">
                  {fmShown[i] ? (p.prompt || p) : <span className="uppercase tracking-widest text-white/70 text-xs">Hidden</span>}
                </td>
                {/* Player 1 Answer - Hidden during Player 2 turn */}
                <td className="py-2 pr-2">
                  {player === 2 && !revealPhase ? (
                    <span className="text-white/50 text-sm italic">Hidden</span>
                  ) : (
                    <input
                      ref={el => inputRefs1.current[i] = el}
                      type="text"
                      value={answers1[i]}
                      onChange={(e) => handleAnswer1Change(i, e.target.value)}
                      onKeyDown={(e) => handleAnswer1KeyDown(i, e)}
                      disabled={player === 2 || revealPhase}
                      placeholder={player === 1 ? "Type answer..." : ""}
                      className={cls(
                        "w-28 px-2 py-1 rounded text-sm",
                        player === 1 && !revealPhase ? "bg-white text-black" : "bg-white/20 text-white/70"
                      )}
                    />
                  )}
                </td>
                {/* Player 1 Points - Hidden until reveal phase for suspense */}
                <td className="py-2 pr-2">
                  {pointsRevealed[i] ? (
                    <div className="w-16 px-2 py-1 rounded bg-blue-500/50 text-white font-bold text-center text-lg">
                      {fmPoints1[i]}
                    </div>
                  ) : (
                    <div className="w-16 px-2 py-1 rounded bg-blue-500/20 text-blue-300 font-semibold text-center">
                      ???
                    </div>
                  )}
                  {/* Hidden input for auto-matching - not visible */}
                  <input
                    type="hidden"
                    value={fmPoints1[i]}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^\d]/g, "");
                      setFmPoints1((arr) => arr.map((x, j) => (j === i ? Number(v || 0) : x)));
                    }}
                  />
                </td>
                {/* Player 2 Answer */}
                <td className="py-2 pr-2">
                  <div className="relative">
                    <input
                      ref={el => inputRefs2.current[i] = el}
                      type="text"
                      value={answers2[i]}
                      onChange={(e) => handleAnswer2Change(i, e.target.value)}
                      onKeyDown={(e) => handleAnswer2KeyDown(i, e)}
                      disabled={player === 1 || revealPhase}
                      placeholder={player === 2 && !revealPhase ? "Type answer..." : ""}
                      className={cls(
                        "w-28 px-2 py-1 rounded text-sm",
                        player === 2 && !revealPhase ? "bg-white text-black" : "bg-white/20 text-white/70",
                        duplicates[i] && "ring-2 ring-red-500 bg-red-100"
                      )}
                    />
                    {duplicates[i] && (
                      <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-red-400 font-bold">
                        ✖
                      </span>
                    )}
                  </div>
                </td>
                {/* Player 2 Points - Hidden until reveal phase for suspense */}
                <td className="py-2 pr-2">
                  {pointsRevealed[i] ? (
                    <div className={cls(
                      "w-16 px-2 py-1 rounded font-bold text-center text-lg",
                      duplicates[i] ? "bg-red-500/50 text-red-300" : "bg-green-500/50 text-white"
                    )}>
                      {duplicates[i] ? "0" : fmPoints2[i]}
                    </div>
                  ) : (
                    <div className={cls(
                      "w-16 px-2 py-1 rounded font-semibold text-center",
                      duplicates[i] ? "bg-red-500/20 text-red-300" : "bg-green-500/20 text-green-300"
                    )}>
                      {duplicates[i] ? "DUP" : "???"}
                    </div>
                  )}
                  {/* Hidden input for auto-matching - not visible */}
                  <input
                    type="hidden"
                    value={fmPoints2[i]}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^\d]/g, "");
                      setFmPoints2((arr) => arr.map((x, j) => (j === i ? Number(v || 0) : x)));
                    }}
                  />
                </td>
                <td className="py-2 pr-2">
                  <button
                    onClick={() => setFmShown((arr) => arr.map((v, j) => (j === i ? !v : v)))}
                    className={cls(
                      "px-2 py-1 rounded text-sm font-semibold transition",
                      fmShown[i] ? "bg-white text-black hover:opacity-90" : "bg-white/20 hover:bg-white/30 text-white"
                    )}
                  >
                    {fmShown[i] ? "Hide" : "Reveal"}
                  </button>
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-white/20">
              <td />
              <td className="py-3 font-black">Totals</td>
              <td />
              <td className="py-3">
                {p1TotalRevealed ? (
                  <div className="text-2xl font-black text-blue-300">{fmTotal1}</div>
                ) : pointsRevealed.every(r => r) ? (
                  <button
                    onClick={() => { setP1TotalRevealed(true); blip(); }}
                    className="px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-bold animate-pulse"
                  >
                    Reveal P1
                  </button>
                ) : (
                  <div className="text-xl font-bold text-blue-300/50">???</div>
                )}
              </td>
              <td />
              <td className="py-3">
                {p2TotalRevealed ? (
                  <div className="text-2xl font-black text-green-300">{fmTotal2}</div>
                ) : p1TotalRevealed ? (
                  <button
                    onClick={() => { setP2TotalRevealed(true); blip(); }}
                    className="px-3 py-1 rounded-lg bg-green-500 hover:bg-green-400 text-white font-bold animate-pulse"
                  >
                    Reveal P2
                  </button>
                ) : (
                  <div className="text-xl font-bold text-green-300/50">???</div>
                )}
              </td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Combined Score Display */}
      <div className={cls(
        "mt-4 p-4 rounded-xl text-center",
        p1TotalRevealed && p2TotalRevealed && targetHit ? "bg-yellow-500/30" : "bg-white/10"
      )}>
        <div className="text-sm uppercase tracking-widest opacity-80">Combined Total</div>
        <div className={cls(
          "text-5xl font-black mt-1",
          p1TotalRevealed && p2TotalRevealed && targetHit ? "text-yellow-300" : "text-white"
        )}>
          {p1TotalRevealed && p2TotalRevealed ? combined : "???"}
        </div>
        {p1TotalRevealed && p2TotalRevealed && targetHit && (
          <div className="text-yellow-300 font-bold mt-2 text-xl">
            🎉 TARGET HIT! 200+ POINTS! 🎉
          </div>
        )}
        {p1TotalRevealed && p2TotalRevealed && !targetHit && combined > 0 && (
          <div className="text-white/70 text-sm mt-1">
            {200 - combined} points short
          </div>
        )}
        {!p2TotalRevealed && revealPhase && (
          <div className="text-white/70 text-sm mt-1">
            {!pointsRevealed.every(r => r)
              ? "Reveal all individual points first!"
              : !p1TotalRevealed
                ? "Click 'Reveal P1' to see Player 1's total!"
                : "Click 'Reveal P2' to see Player 2's total!"}
          </div>
        )}
      </div>
    </section>
  );
}
