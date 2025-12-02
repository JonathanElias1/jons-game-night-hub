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

  return (
    <div className="mb-3 p-3 bg-white/10 rounded-xl">
      <div className="text-xs uppercase tracking-widest opacity-70 mb-2">
        Who is answering for {teamName}?
      </div>
      <div className="flex flex-wrap gap-2">
        {teamPlayers.map(player => (
          <button
            key={player.id}
            onClick={() => onSelectPlayer(player.id)}
            className={cls(
              "px-3 py-2 rounded-lg font-semibold transition flex items-center gap-2",
              selectedPlayerId === player.id
                ? "bg-yellow-400 text-black ring-2 ring-yellow-300"
                : "bg-white/20 text-white hover:bg-white/30"
            )}
          >
            <span className="text-lg">{player.avatar}</span>
            <span>{player.name}</span>
            {player.personalScore > 0 && (
              <span className="text-xs bg-black/20 px-1.5 py-0.5 rounded">
                {player.personalScore}
              </span>
            )}
          </button>
        ))}
      </div>
      {!selectedPlayerId && (
        <div className="text-yellow-300 text-sm mt-2 animate-pulse">
          Select a player before answering!
        </div>
      )}
    </div>
  );
}
