import React from "react";
import { cls } from "../utils/helpers";

export function Scoreboard({ teamA, teamB, teamAName, teamBName, players, phase, controlTeam, faceoffTurn, stealingTeam }) {
  const teamAPlayers = players?.filter(p => p.team === "A") || [];
  const teamBPlayers = players?.filter(p => p.team === "B") || [];

  return (
    <section className="mt-4 grid grid-cols-2 gap-3">
      <div
        className={cls(
          "bg-white/10 rounded-2xl p-4 backdrop-blur-md transition",
          (phase === "round" && controlTeam === "A") ||
            ((phase === "faceoff" || phase === "sudden") && faceoffTurn === "A") ||
            (phase === "steal" && stealingTeam === "A")
            ? "ring-4 ring-yellow-300"
            : ""
        )}
      >
        <div className="text-sm uppercase tracking-widest opacity-80">{teamAName}</div>
        <div className="text-4xl font-black tabular-nums mb-2">{teamA}</div>
        {teamAPlayers.length > 0 && (
          <div className="space-y-1">
            {teamAPlayers.map(p => (
              <div key={p.id} className="text-xs flex items-center justify-between bg-white/5 px-2 py-1 rounded">
                <span className="flex items-center gap-1">
                  <span className="text-base">{p.avatar}</span>
                  <span>{p.name}</span>
                </span>
                <span className="font-bold">{p.personalScore}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div
        className={cls(
          "bg-white/10 rounded-2xl p-4 backdrop-blur-md transition",
          (phase === "round" && controlTeam === "B") ||
            ((phase === "faceoff" || phase === "sudden") && faceoffTurn === "B") ||
            (phase === "steal" && stealingTeam === "B")
            ? "ring-4 ring-yellow-300"
            : ""
        )}
      >
        <div className="text-sm uppercase tracking-widest opacity-80">{teamBName}</div>
        <div className="text-4xl font-black tabular-nums mb-2">{teamB}</div>
        {teamBPlayers.length > 0 && (
          <div className="space-y-1">
            {teamBPlayers.map(p => (
              <div key={p.id} className="text-xs flex items-center justify-between bg-white/5 px-2 py-1 rounded">
                <span className="flex items-center gap-1">
                  <span className="text-base">{p.avatar}</span>
                  <span>{p.name}</span>
                </span>
                <span className="font-bold">{p.personalScore}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}