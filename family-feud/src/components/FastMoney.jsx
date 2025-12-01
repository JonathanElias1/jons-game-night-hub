import React, { useState, useEffect } from "react";
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
  };

  const switchToPlayer2 = () => {
    setPlayer(2);
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

  const combined = fmTotal1 + fmTotal2;
  const targetHit = combined >= 200;

  return (
    <section className="mt-6 bg-white/10 rounded-2xl p-5 md:p-7 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xl md:text-2xl font-black">
          Fast Money
          <span className={cls(
            "ml-3 px-3 py-1 rounded-full text-sm font-bold",
            player === 1 ? "bg-blue-500" : "bg-green-500"
          )}>
            Player {player}
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {player === 1 && (
            <button
              onClick={switchToPlayer2}
              className="px-3 py-2 rounded-xl bg-green-500 text-white hover:bg-green-400 transition font-semibold"
            >
              Switch to Player 2 →
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
            🏠 Back to Hub
          </button>
        </div>
      </div>

      <div className="mt-2 text-sm opacity-85">
        {player === 1 ? (
          <>Player 1 answers all 5 questions. Then click "Switch to Player 2".</>
        ) : (
          <>Player 2 answers. <span className="text-yellow-300 font-semibold">Duplicate answers will trigger a buzzer!</span></>
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
                duplicates[i] && "bg-red-500/20"
              )}>
                <td className="py-2 pr-2 font-semibold">{i + 1}</td>
                <td className="py-2 pr-2">
                  {fmShown[i] ? (p.prompt || p) : <span className="uppercase tracking-widest text-white/70 text-xs">Hidden</span>}
                </td>
                {/* Player 1 Answer */}
                <td className="py-2 pr-2">
                  <input
                    type="text"
                    value={answers1[i]}
                    onChange={(e) => handleAnswer1Change(i, e.target.value)}
                    disabled={player === 2}
                    placeholder={player === 1 ? "Type answer..." : ""}
                    className={cls(
                      "w-28 px-2 py-1 rounded text-sm",
                      player === 1 ? "bg-white text-black" : "bg-white/20 text-white/70"
                    )}
                  />
                </td>
                {/* Player 1 Points */}
                <td className="py-2 pr-2">
                  <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={fmPoints1[i]}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^\d]/g, "");
                      setFmPoints1((arr) => arr.map((x, j) => (j === i ? Number(v || 0) : x)));
                    }}
                    className="w-16 px-2 py-1 rounded bg-blue-500/30 text-white font-semibold text-center"
                  />
                </td>
                {/* Player 2 Answer */}
                <td className="py-2 pr-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={answers2[i]}
                      onChange={(e) => handleAnswer2Change(i, e.target.value)}
                      disabled={player === 1}
                      placeholder={player === 2 ? "Type answer..." : ""}
                      className={cls(
                        "w-28 px-2 py-1 rounded text-sm",
                        player === 2 ? "bg-white text-black" : "bg-white/20 text-white/70",
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
                {/* Player 2 Points */}
                <td className="py-2 pr-2">
                  <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={fmPoints2[i]}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^\d]/g, "");
                      setFmPoints2((arr) => arr.map((x, j) => (j === i ? Number(v || 0) : x)));
                    }}
                    disabled={duplicates[i]}
                    className={cls(
                      "w-16 px-2 py-1 rounded font-semibold text-center",
                      duplicates[i] ? "bg-red-500/30 text-red-300" : "bg-green-500/30 text-white"
                    )}
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
              <td className="py-3 text-2xl font-black text-blue-300">{fmTotal1}</td>
              <td />
              <td className="py-3 text-2xl font-black text-green-300">{fmTotal2}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Combined Score Display */}
      <div className={cls(
        "mt-4 p-4 rounded-xl text-center",
        targetHit ? "bg-yellow-500/30" : "bg-white/10"
      )}>
        <div className="text-sm uppercase tracking-widest opacity-80">Combined Total</div>
        <div className={cls(
          "text-5xl font-black mt-1",
          targetHit ? "text-yellow-300" : "text-white"
        )}>
          {combined}
        </div>
        {targetHit && (
          <div className="text-yellow-300 font-bold mt-2 text-xl">
            🎉 TARGET HIT! 200+ POINTS! 🎉
          </div>
        )}
        {!targetHit && combined > 0 && (
          <div className="text-white/70 text-sm mt-1">
            {200 - combined} points to win
          </div>
        )}
      </div>
    </section>
  );
}
