import React from "react";
import { cls } from "../utils/helpers";

export function RoundControls({ nextRound, restart, roundComplete }) {
  return (
    <>
      {/* Big Next Round button when round is complete */}
      {roundComplete && (
        <div className="mt-6 mb-4">
          <button
            onClick={nextRound}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-2xl font-black hover:from-green-400 hover:to-emerald-500 transition shadow-lg animate-pulse"
            title="Next round (N)"
          >
            ➡️ NEXT ROUND ➡️
          </button>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!roundComplete && (
          <button
            onClick={nextRound}
            className="px-4 py-2 rounded-xl bg-black/40 text-white hover:bg-black/50 transition"
            title="Next round (N)"
          >
            Skip to Next Round
          </button>
        )}
        <button
          onClick={restart}
          className="px-4 py-2 rounded-xl bg-black/40 text-white hover:bg-black/50 transition"
          title="Restart game (R)"
        >
          Restart
        </button>
        <button
          onClick={() => window.location.href = '../'}
          className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white transition font-semibold"
        >
          🏠 Back to Hub
        </button>
      </div>

      <div className="mt-3 text-xs opacity-80">
        <span className="font-semibold">Keys:</span> Q/P buzz • X pass (faceoff/sudden) or strike (round) •
        1–8 reveal • N next • R restart • F fullscreen • D ding • B buzzer
      </div>
    </>
  );
}