import React, { useState } from 'react';
import { GameSelector } from './GameSelector';
import { QuickEntry } from './QuickEntry';
import { Leaderboard } from './Leaderboard';
import { EditablePlayerScore } from './EditablePlayerScore';

export function GamePhase({ 
  players, 
  currentGame, 
  onSelectGame, 
  onAddScore,
  onEditScore,
  onUndo,
  canUndo,
  teamTotals, 
  sortedPlayers,
  onExport,
  onReset 
}) {
  const [showScores, setShowScores] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  return (
    <div className="game-phase">
      <GameSelector 
        currentGame={currentGame}
        onSelectGame={onSelectGame}
      />
      
      <QuickEntry 
        players={players}
        onAddScore={onAddScore}
        currentGame={currentGame}
      />

      {/* Collapsible Current Scores */}
      <div className="card">
        <button 
          className="collapse-toggle"
          onClick={() => setShowScores(!showScores)}
        >
          {showScores ? '▼' : '▶'} Current Scores - {currentGame}
        </button>
        
        {showScores && (
          <div className="players-list">
            {players.map((player, index) => (
              <EditablePlayerScore
                key={index}
                player={player}
                currentGame={currentGame}
                onEditScore={onEditScore}
              />
            ))}
          </div>
        )}
      </div>

      {/* Collapsible Leaderboard */}
      <div className="card">
        <button 
          className="collapse-toggle"
          onClick={() => setShowLeaderboard(!showLeaderboard)}
        >
          {showLeaderboard ? '▼' : '▶'} Leaderboard
        </button>
        
        {showLeaderboard && <Leaderboard sortedPlayers={sortedPlayers} />}
      </div>
      
      {/* Quick Action Buttons */}
      <div className="card quick-actions">
        <button 
          className="secondary compact-btn" 
          onClick={onUndo}
          disabled={!canUndo}
          style={{ opacity: canUndo ? 1 : 0.5 }}
        >
          ↩️ Undo
        </button>
        <button className="secondary compact-btn" onClick={onExport}>
          💾 Export
        </button>
        <button className="danger compact-btn" onClick={onReset}>
          🔄 Reset
        </button>
      </div>
    </div>
  );
}