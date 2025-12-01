import React from 'react';

const GAMES = ['Family Feud', 'Jeopardy', 'Wheel of Fortune'];

export function GameSelector({ currentGame, onSelectGame }) {
  return (
    <div className="card">
      <div className="section-title">Current Game</div>
      <div className="game-buttons">
        {GAMES.map(game => (
          <button
            key={game}
            onClick={() => onSelectGame(game)}
            className={`game-btn ${currentGame === game ? 'active' : ''}`}
          >
            {game}
          </button>
        ))}
      </div>
      <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', marginTop: '10px' }}>
        {currentGame}
      </div>
    </div>
  );
}