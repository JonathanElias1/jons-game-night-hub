import React from "react";

export function GameOverScreen({ winner, teamA, teamB, teamAName, teamBName, players, goToFastMoney, restart }) {
  const sortedPlayers = [...players].sort((a, b) => b.personalScore - a.personalScore);
  const mvp = sortedPlayers[0];
  const teamAPlayers = players.filter(p => p.team === "A");
  const teamBPlayers = players.filter(p => p.team === "B");
  const teamAPersonal = teamAPlayers.reduce((sum, p) => sum + p.personalScore, 0);
  const teamBPersonal = teamBPlayers.reduce((sum, p) => sum + p.personalScore, 0);

  return (
    <section className="mt-6 bg-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-md">
      <div className="text-center mb-6">
        <div className="text-5xl md:text-6xl font-black mb-4">GAME OVER!</div>
       <div className="text-3xl md:text-4xl font-bold mb-2">
  {winner === "Tie" ? "It's a Tie!" : `🏆 ${winner} Wins! 🏆`}
</div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white/10 rounded-xl p-4">
<div className="text-sm uppercase tracking-wider opacity-80 mb-2">{teamAName}</div>
          <div className="text-4xl font-black mb-1">{teamA} pts</div>
          <div className="text-sm opacity-75 mb-3">Personal Total: {teamAPersonal}</div>
          <div className="space-y-2">
            {teamAPlayers.map(p => (
              <div key={p.id} className="bg-white/5 p-2 rounded">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{p.avatar}</span>
                    <span className="font-bold">{p.name}</span>
                  </span>
                  <span className="font-black text-lg">{p.personalScore}</span>
                </div>
                <div className="text-xs opacity-75 grid grid-cols-2 gap-1">
                  <span>Answers: {p.stats.answersRevealed}</span>
                  <span>Top: {p.stats.topAnswers}</span>
                  <span>Faceoffs: {p.stats.faceoffWins}</span>
                  <span>Steals: {p.stats.stealsWon}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4">
        <div className="text-sm uppercase tracking-wider opacity-80 mb-2">{teamBName}</div>
          <div className="text-4xl font-black mb-1">{teamB} pts</div>
          <div className="text-sm opacity-75 mb-3">Personal Total: {teamBPersonal}</div>
          <div className="space-y-2">
            {teamBPlayers.map(p => (
              <div key={p.id} className="bg-white/5 p-2 rounded">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{p.avatar}</span>
                    <span className="font-bold">{p.name}</span>
                  </span>
                  <span className="font-black text-lg">{p.personalScore}</span>
                </div>
                <div className="text-xs opacity-75 grid grid-cols-2 gap-1">
                  <span>Answers: {p.stats.answersRevealed}</span>
                  <span>Top: {p.stats.topAnswers}</span>
                  <span>Faceoffs: {p.stats.faceoffWins}</span>
                  <span>Steals: {p.stats.stealsWon}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {mvp && (
        <div className="bg-yellow-400/20 border-2 border-yellow-400 rounded-xl p-4 mb-6 text-center">
          <div className="text-2xl font-black mb-1">
            🏅 MVP: {mvp.avatar} {mvp.name}
          </div>
          <div className="text-lg">Team {mvp.team} · {mvp.personalScore} Personal Points</div>
          <div className="text-sm opacity-75 mt-2">
            {mvp.stats.answersRevealed} answers · {mvp.stats.topAnswers} top answers · {mvp.stats.faceoffWins} faceoff wins
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={goToFastMoney}
          className="px-6 py-3 rounded-xl bg-yellow-300 text-black font-bold text-lg hover:opacity-90 transition"
        >
          Play Fast Money
        </button>
        <button
          onClick={restart}
          className="px-6 py-3 rounded-xl bg-white text-black font-bold text-lg hover:opacity-90 transition"
        >
          New Game
        </button>
      </div>
    </section>
  );
}