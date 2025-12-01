import React from "react";
import { cls } from "../utils/helpers";

export function StrikesDisplay({ strikes, controlTeam, phase, addStrike }) {
  return (
    <div className="mt-4 flex items-center gap-2">
      <div className="text-sm uppercase tracking-widest opacity-80">Strikes — Team {controlTeam}</div>
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((n) => (
          <div
            key={n}
            className={cls(
              "h-9 w-9 rounded-xl grid place-items-center text-xl font-black transition",
              strikes > n ? "bg-red-500 text-white" : "bg-white/20 text-white/50"
            )}
          >
            {strikes > n ? "✖" : "—"}
          </div>
        ))}
      </div>
      <button
        onClick={addStrike}
        disabled={phase !== "round"}
        className={cls(
          "ml-2 px-3 py-2 rounded-xl text-sm font-semibold transition",
          phase === "round" ? "bg-white/20 hover:bg-white/30" : "bg-white/10 text-white/60 cursor-not-allowed"
        )}
        title="Add strike (X)"
      >
        Add Strike
      </button>
    </div>
  );
}