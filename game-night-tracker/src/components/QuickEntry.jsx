import React, { useState } from 'react';

export function QuickEntry({ players, onAddScore, currentGame }) {
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  const gamePoints = {
    'Family Feud': [
      { name: 'Top Answer', value: 10, type: 'individual' },
      { name: 'Fast Money Win', value: 20, type: 'individual' },
      { name: 'Round Win', value: 25, type: 'team' }
    ],
    'Jeopardy': [
      { name: 'Daily Double', value: 15, type: 'team' },
      { name: 'Round Win', value: 25, type: 'team' }
    ],
    'Wheel of Fortune': [
      { name: 'Bonus Round', value: 20, type: 'individual' },
      { name: 'Round Win', value: 10, type: 'team' }
    ]
  };

  const pointOptions = gamePoints[currentGame] || [];

  const togglePlayer = (playerName) => {
    setSelectedPlayers(prev => 
      prev.includes(playerName) 
        ? prev.filter(p => p !== playerName)
        : [...prev, playerName]
    );
  };

  const selectAllTeam = (team) => {
    const teamPlayers = players.filter(p => p.team === team).map(p => p.name);
    setSelectedPlayers(teamPlayers);
  };

  const handleAward = (points) => {
    if (selectedPlayers.length === 0) {
      alert('Please select at least one player');
      return;
    }
    
    selectedPlayers.forEach(playerName => {
      onAddScore(playerName, points);
    });
    
    setSelectedPlayers([]);
  };

  return (
    <div className="quick-entry card">
      <h2>AWARD POINTS</h2>
      
      <h3>Select Players:</h3>
      
      <div className="team-select-buttons">
        <button 
          onClick={() => selectAllTeam('A')} 
          className="team-select-btn team-a-btn"
        >
          All Team A
        </button>
        <button 
          onClick={() => selectAllTeam('B')} 
          className="team-select-btn team-b-btn"
        >
          All Team B
        </button>
      </div>

      <div className="players-grid">
        {players.map((player, index) => (
          <button
            key={index}
            onClick={() => togglePlayer(player.name)}
            className={`player-btn ${selectedPlayers.includes(player.name) ? 'selected' : ''} team-${player.team.toLowerCase()}`}
          >
            <div style={{ fontWeight: 'bold' }}>{player.name}</div>
            <div className="player-info">Team {player.team} • {player.scores[currentGame]} pts</div>
          </button>
        ))}
      </div>

      <div className="points-grid">
        <h3>{currentGame}</h3>
        {pointOptions.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAward(option.value)}
            className="point-button"
            disabled={selectedPlayers.length === 0}
          >
            <div className="point-name">{option.name}</div>
            <div className="point-value">+{option.value}</div>
            <span className="point-type">{option.type.toUpperCase()}</span>
          </button>
        ))}
        
        <div className="point-explanation">
          <strong>Individual:</strong> 1 player gets points<br/>
          <strong>Team:</strong> All selected players get points
        </div>
      </div>
    </div>
  );
}