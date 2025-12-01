import React from "react";
import { cls } from "../utils/helpers";

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
  restart 
}) {
  return (
    <section className="mt-6 bg-white/10 rounded-2xl p-5 md:p-7 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xl md:text-2xl font-black">Fast Money</div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setFmPoints1(Array(5).fill(0));
              setFmPoints2(Array(5).fill(0));
              setFmShown(Array(5).fill(false));
            }}
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
        </div>
      </div>

      <div className="mt-2 text-sm opacity-85">
        Host reads prompts aloud. Only type the <strong>points</strong> awarded for each player from your
        sheet.
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[600px] w-full text-left">
          <thead>
            <tr className="text-xs uppercase tracking-widest opacity-80">
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-2">Prompt</th>
              <th className="py-2 pr-2">Player 1 pts</th>
              <th className="py-2 pr-2">Player 2 pts</th>
              <th className="py-2 pr-2">Show</th>
            </tr>
          </thead>
          <tbody>
            {(fastMoneyPrompts || []).slice(0, 5).map((p, i) => (
              <tr key={i} className="border-t border-white/10 align-middle">
                <td className="py-2 pr-2 font-semibold">{i + 1}</td>
                <td className="py-2 pr-2">
                  {fmShown[i] ? p : <span className="uppercase tracking-widest text-white/70 text-xs">Hidden</span>}
                </td>
                <td className="py-2 pr-2">
                  <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={fmPoints1[i]}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^\d]/g, "");
                      setFmPoints1((arr) => arr.map((x, j) => (j === i ? Number(v || 0) : x)));
                    }}
                    className="w-20 px-2 py-1 rounded bg-white text-black font-semibold"
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={fmPoints2[i]}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^\d]/g, "");
                      setFmPoints2((arr) => arr.map((x, j) => (j === i ? Number(v || 0) : x)));
                    }}
                    className="w-20 px-2 py-1 rounded bg-white text-black font-semibold"
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
              <td className="py-3 text-2xl font-black">{fmTotal1}</td>
              <td className="py-3 text-2xl font-black">{fmTotal2}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}