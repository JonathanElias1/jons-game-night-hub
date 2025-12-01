import React from "react";
import { cls } from "../utils/helpers";

export function RoundControls({ award, awardDisabled, nextRound, restart, teamAName, teamBName }) {
  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => award("A")}
          disabled={awardDisabled}
          className={cls(
            "px-4 py-2 rounded-xl font-semibold transition",
            awardDisabled ? "bg-white/20 text-white/60 cursor-not-allowed" : "bg-white text-black hover:opacity-90"
          )}
          title="Award bank to Team A (A)"
        >
          Award → {teamAName || "Team A"}
        </button>
        <button
          onClick={() => award("B")}
          disabled={awardDisabled}
          className={cls(
            "px-4 py-2 rounded-xl font-semibold transition",
            awardDisabled ? "bg-white/20 text-white/60 cursor-not-allowed" : "bg-white text-black hover:opacity-90"
          )}
          title="Award bank to Team B (L)"
        >
          Award → {teamBName || "Team B"}
        </button>
        <button
          onClick={nextRound}
          className="px-4 py-2 rounded-xl bg-black/40 text-white hover:bg-black/50 transition"
          title="Next round (N)"
        >
          Next Round
        </button>
        <button
          onClick={restart}
          className="px-4 py-2 rounded-xl bg-black/40 text-white hover:bg-black/50 transition"
          title="Restart game (R)"
        >
          Restart
        </button>
      </div>

      <div className="mt-3 text-xs opacity-80">
        <span className="font-semibold">Keys:</span> Q/P buzz • X pass (faceoff/sudden) or strike (round) •
        1–8 reveal • A/L award • N next • R restart • F fullscreen • D ding • B buzzer
      </div>
    </>
  );
}