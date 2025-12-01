import React, { useState } from "react";
import { cls } from "../utils/helpers";

export function PersonalScorePanel({ players, onAward }) {
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [points, setPoints] = useState(10);

  const handleAward = () => {
    if (!selectedPlayer) return;
    onAward(selectedPlayer, points);
    setSelectedPlayer("");
  };

  return (
    <div className="mt-4 bg-white/5 rounded-xl p-4">
      <div className="text-sm font-bold uppercase tracking-wider opacity-80 mb-3">Award Personal Points</div>
      <div className="flex flex-wrap gap-2">
        <select
          value={selectedPlayer}
          onChange={(e) => setSelectedPlayer(e.target.value)}
          className="flex-1 min-w-[150px] px-3 py-2 bg-white/10 rounded-lg border border-white/20 text-sm text-white"
        >
          <option value="" className="text-black">Select Player...</option>
          {players.map(p => (
            <option key={p.id} value={p.id} className="text-black">
              {p.avatar} {p.name} (Team {p.team})
            </option>
          ))}
        </select>
        <select
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
          className="px-3 py-2 bg-white/10 rounded-lg border border-white/20 text-sm text-white"
        >
          <option value={5} className="text-black">+5 (Faceoff Win)</option>
          <option value={10} className="text-black">+10 (Answer)</option>
          <option value={15} className="text-black">+15 (Top Answer)</option>
          <option value={20} className="text-black">+20 (Steal)</option>
          <option value={25} className="text-black">+25 (Fast Money)</option>
        </select>
        <button
          onClick={handleAward}
          disabled={!selectedPlayer}
          className={cls(
            "px-4 py-2 rounded-lg font-semibold text-sm transition",
            selectedPlayer 
              ? "bg-yellow-400 text-black hover:bg-yellow-300" 
              : "bg-white/10 text-white/50 cursor-not-allowed"
          )}
        >
          Award
        </button>
      </div>
    </div>
  );
}