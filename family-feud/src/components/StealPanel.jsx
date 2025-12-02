import React from "react";

export function StealPanel({ stealingTeam, controlTeam, resolveSteal, stealingTeamName, controlTeamName, stealResult }) {
  // Show result if steal has been attempted
  if (stealResult === 'success') {
    return (
      <div className="mt-4 bg-green-500/30 border-2 border-green-400 rounded-xl p-4 text-center">
        <div className="text-xl font-bold text-green-300 mb-2">
          ✅ STEAL SUCCESSFUL! ✅
        </div>
        <div className="text-lg">
          <strong>{stealingTeamName || `Team ${stealingTeam}`}</strong> stole the points!
        </div>
      </div>
    );
  }

  if (stealResult === 'failed') {
    return (
      <div className="mt-4 bg-red-500/30 border-2 border-red-400 rounded-xl p-4 text-center">
        <div className="text-xl font-bold text-red-300 mb-2">
          ❌ STEAL FAILED! ❌
        </div>
        <div className="text-lg">
          <strong>{controlTeamName || `Team ${controlTeam}`}</strong> keeps the points!
        </div>
      </div>
    );
  }

  // Default: steal attempt in progress
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