import React, { useState } from 'react';
import { SetupPhase } from './components/SetupPhase';
import { GamePhase } from './components/GamePhase';
import { useScoreData } from './hooks/useScoreData';
import './ScoreTracker.css';

export default function ScoreTracker() {
  const [gameStarted, setGameStarted] = useState(false);
  const {
    players,
    currentGame,
    setCurrentGame,
    teamNames,
  setTeamNames,
    addPlayer,
    removePlayer,
    addScore,
    editScore,
    undo,
    canUndo,
    resetAll,
    exportData,
    getTeamTotals,
    getSortedPlayers
  } = useScoreData();

  const handleStart = () => {
    if (players.length === 0) {
      alert('Please add at least one player');
      return;
    }
    setGameStarted(true);
  };

  const handleReset = () => {
    if (window.confirm('Reset all data? This cannot be undone!')) {
      resetAll();
      setGameStarted(false);
    } 
  };

  return (
    <div className="score-tracker-container">
      <h1>🎮 Game Night Tracker</h1>
      
      {!gameStarted ? (
        <SetupPhase 
          players={players}
          teamNames={teamNames}
        onSetTeamNames={setTeamNames}
          onAddPlayer={addPlayer}
          onRemovePlayer={removePlayer}
          onStart={handleStart}
        />
      ) : (
        <GamePhase 
          players={players}
          currentGame={currentGame}
          onSelectGame={setCurrentGame}
          onAddScore={addScore}
          onEditScore={editScore}
          onUndo={undo}
          canUndo={canUndo}
          teamTotals={getTeamTotals()}
          sortedPlayers={getSortedPlayers()}
          onExport={exportData}
          onReset={handleReset}
        />
      )}
    </div>
  );
}