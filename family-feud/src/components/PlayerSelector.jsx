import React from "react";
import { cls } from "../utils/helpers";

export function PlayerSelector({
  players,
  currentTeam,
  selectedPlayerId,
  onSelectPlayer,
  teamAName,
  teamBName
}) {
  // Filter players by current team
  const teamPlayers = players.filter(p => p.team === currentTeam);
  const teamName = currentTeam === "A" ? teamAName : teamBName;

  if (teamPlayers.length === 0) return null;

  // Find the currently selected player
  const currentPlayer = teamPlayers.find(p => p.id === selectedPlayerId);

  return (
    <div className="mb-3 p-3 bg-white/10 rounded-xl">
      {/* Show current player prominently */}
      {currentPlayer && (
        <div className="mb-3 p-3 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-lg border-2 border-yellow-400/50">
          <div className="text-xs uppercase tracking-widest text-yellow-300 mb-1">
            Now Answering for {teamName}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentPlayer.avatar}</span>
            <span className="text-xl font-bold text-white">{currentPlayer.name}</span>
            {currentPlayer.personalScore > 0 && (
              <span className="text-sm bg-black/30 px-2 py-1 rounded text-yellow-300">
                {currentPlayer.personalScore} pts
              </span>
            )}
          </div>
        </div>
      )}

      {/* Show other players for manual override (collapsed style) */}
      {teamPlayers.length > 1 && (
        <div>
          <div className="text-xs uppercase tracking-widest opacity-50 mb-1">
            Click to switch player (manual override)
          </div>
          <div className="flex flex-wrap gap-1">
            {teamPlayers.map(player => (
              <button
                key={player.id}
                onClick={() => onSelectPlayer(player.id)}
                className={cls(
                  "px-2 py-1 rounded text-sm font-medium transition flex items-center gap-1",
                  selectedPlayerId === player.id
                    ? "bg-yellow-400/30 text-yellow-300 ring-1 ring-yellow-400"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                )}
              >
                <span>{player.avatar}</span>
                <span>{player.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
