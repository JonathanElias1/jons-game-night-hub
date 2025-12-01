import React from "react";

export function StealPanel({ stealingTeam, controlTeam, resolveSteal, stealingTeamName, controlTeamName }) {
  return (
    <div className="mt-4 bg-white/5 rounded-xl p-3 flex flex-wrap items-center gap-2">
      <div className="text-sm">
        <strong>Steal!</strong> {stealingTeamName || `Team ${stealingTeam}`} gets one guess. If correct, they take the bank.
      </div>
      <div className="ml-auto flex gap-2">
        <button
          onClick={() => resolveSteal(true)}
          className="px-3 py-2 rounded-xl bg-green-400 text-black font-semibold hover:opacity-90 transition"
        >
          Steal Success → {stealingTeamName || `Team ${stealingTeam}`}
        </button>
        <button
          onClick={() => resolveSteal(false)}
          className="px-3 py-2 rounded-xl bg-red-400 text-black font-semibold hover:opacity-90 transition"
        >
          Steal Fail → {controlTeamName || `Team ${controlTeam}`}
        </button>
      </div>
    </div>
  );
}