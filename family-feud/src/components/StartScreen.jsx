import React, { useState } from "react";
import { gradientBg, AVATARS } from "../utils/constants";

// Move PlayerForm OUTSIDE of StartScreen component
function PlayerForm({ players, team, teamName, setTeamName, updatePlayer, addPlayer, removePlayer }) {
  return (
    <div>
      <h3 className={`text-xl font-bold mb-3 ${team === "A" ? "text-blue-300" : "text-green-300"}`}>
        Team {team}
      </h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Family Name</label>
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder={`e.g., "Johnson" (will display as "Johnson Family")`}
          className="w-full px-3 py-2 bg-white/10 rounded-lg border border-white/20 text-white placeholder-white/50"
        />
      </div>

      {players.map((player, i) => (
        <div key={i} className="mb-4 bg-white/5 p-3 rounded-lg">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={player.name}
              onChange={(e) => updatePlayer(team, i, "name", e.target.value)}
              placeholder={`Player ${i + 1} name`}
              className="flex-1 px-3 py-2 bg-white/10 rounded-lg border border-white/20 text-white placeholder-white/50"
            />
            {players.length > 1 && (
              <button
                type="button"
                onClick={() => removePlayer(team, i)}
                className="px-3 py-2 bg-red-500/30 hover:bg-red-500/50 rounded-lg transition"
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="mb-2 text-sm opacity-80">Choose Avatar:</div>
          <div className="grid grid-cols-5 gap-2">
            {AVATARS.map((avatar) => (
              <button
                key={avatar.emoji}
                type="button"
                onClick={() => updatePlayer(team, i, "avatar", avatar.emoji)}
                className={`text-2xl p-2 rounded-lg transition ${
                  player.avatar === avatar.emoji
                    ? "bg-yellow-400/30 ring-2 ring-yellow-400 scale-110"
                    : "bg-white/10 hover:bg-white/20"
                }`}
                title={avatar.name}
              >
                {avatar.emoji}
              </button>
            ))}
          </div>
          
          {player.name && player.avatar && (
            <div className="mt-2 text-sm bg-white/10 p-2 rounded flex items-center gap-2">
              <span className="text-xl">{player.avatar}</span>
              <span className="font-semibold">{player.name}</span>
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => addPlayer(team)}
        className="w-full mt-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition"
      >
        + Add Player
      </button>
    </div>
  );
}

export function StartScreen({ onStart, totalAvailableRounds }) {
  const [numRounds, setNumRounds] = useState(3);
  const [teamAName, setTeamAName] = useState("");
  const [teamBName, setTeamBName] = useState("");
  const [teamAPlayers, setTeamAPlayers] = useState([{ name: "", avatar: null }]);
  const [teamBPlayers, setTeamBPlayers] = useState([{ name: "", avatar: null }]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const finalTeamAName = teamAName.trim() || "Team A";
    const finalTeamBName = teamBName.trim() || "Team B";
    
    const playersA = teamAPlayers
      .filter(p => p.name.trim() && p.avatar)
      .map((player, i) => ({
        id: `A${i}`,
        name: player.name.trim(),
        avatar: player.avatar,
        team: "A",
        teamName: finalTeamAName,
        personalScore: 0,
        stats: {
          answersRevealed: 0,
          topAnswers: 0,
          faceoffWins: 0,
          stealsWon: 0,
          fastMoneyPoints: 0
        }
      }));
      
    const playersB = teamBPlayers
      .filter(p => p.name.trim() && p.avatar)
      .map((player, i) => ({
        id: `B${i}`,
        name: player.name.trim(),
        avatar: player.avatar,
        team: "B",
        teamName: finalTeamBName,
        personalScore: 0,
        stats: {
          answersRevealed: 0,
          topAnswers: 0,
          faceoffWins: 0,
          stealsWon: 0,
          fastMoneyPoints: 0
        }
      }));

    if (playersA.length === 0 || playersB.length === 0) {
      alert("Each team needs at least one player with a name and avatar!");
      return;
    }

    onStart({
      numRounds: parseInt(numRounds, 10),
      players: [...playersA, ...playersB],
      teamAName: finalTeamAName,
      teamBName: finalTeamBName
    });
  };

  const updatePlayer = (team, index, field, value) => {
    const setter = team === "A" ? setTeamAPlayers : setTeamBPlayers;
    const players = team === "A" ? teamAPlayers : teamBPlayers;
    
    setter(players.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const addPlayer = (team) => {
    const setter = team === "A" ? setTeamAPlayers : setTeamBPlayers;
    const players = team === "A" ? teamAPlayers : teamBPlayers;
    setter([...players, { name: "", avatar: null }]);
  };

  const removePlayer = (team, index) => {
    const setter = team === "A" ? setTeamAPlayers : setTeamBPlayers;
    const players = team === "A" ? teamAPlayers : teamBPlayers;
    if (players.length > 1) {
      setter(players.filter((_, i) => i !== index));
    }
  };

  return (
    <div
      className="min-h-[100dvh] text-white flex items-center justify-center p-4"
      style={{ ...gradientBg, fontFamily: "Barlow, system-ui, sans-serif" }}
    >
      <div className="bg-white/10 p-6 md:p-8 rounded-2xl shadow-lg backdrop-blur-md max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-6">JON FEUD - Setup</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Number of Rounds</label>
            <select
              value={numRounds}
              onChange={(e) => setNumRounds(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 rounded-lg border border-white/20 text-white"
            >
              {Array.from({ length: totalAvailableRounds }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n} className="text-black">
                  {n} Round{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <PlayerForm 
              players={teamAPlayers} 
              team="A" 
              teamName={teamAName}
              setTeamName={setTeamAName}
              updatePlayer={updatePlayer}
              addPlayer={addPlayer}
              removePlayer={removePlayer}
            />
            <PlayerForm 
              players={teamBPlayers} 
              team="B"
              teamName={teamBName}
              setTeamName={setTeamBName}
              updatePlayer={updatePlayer}
              addPlayer={addPlayer}
              removePlayer={removePlayer}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black font-bold py-3 px-4 rounded-xl hover:bg-opacity-90 transition-transform hover:scale-105"
          >
            Start Game
          </button>
        </form>
      </div>
    </div>
  );
}