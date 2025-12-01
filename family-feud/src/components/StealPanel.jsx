import React from "react";

export function StealPanel({ stealingTeam, controlTeam, resolveSteal, stealingTeamName, controlTeamName }) {
  return (
    <div className="mt-4 bg-yellow-500/20 border-2 border-yellow-400 rounded-xl p-4 text-center">
      <div className="text-xl font-bold text-yellow-300 mb-2">
        🚨 STEAL ATTEMPT! 🚨
      </div>
      <div className="text-lg">
        <strong>{stealingTeamName || `Team ${stealingTeam}`}</strong> - type your answer below!
      </div>
      <div className="text-sm mt-2 opacity-80">
        Correct answer = steal the bank • Wrong answer = {controlTeamName || `Team ${controlTeam}`} keeps points
      </div>
    </div>
  );
}