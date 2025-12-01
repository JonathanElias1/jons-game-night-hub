import React from 'react';
import { PlayerItem } from './PlayerItem';

export function Leaderboard({ sortedPlayers }) {
  return (
    <div className="card">
      <div className="section-title">Leaderboard</div>
      <div className="leaderboard">
        {sortedPlayers.map((player, index) => (
          <PlayerItem 
            key={player.name}
            player={player}
            rank={index}
          />
        ))}
      </div>
      {sortedPlayers.length > 0 && (
        <div className="finale-notice">
          🏆 5th Grader Finalist: {sortedPlayers[0].name}
        </div>
      )}
    </div>
  );
}