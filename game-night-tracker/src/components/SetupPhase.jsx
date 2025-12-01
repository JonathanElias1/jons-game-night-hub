import React, { useState } from 'react';
import { PlayerItem } from './PlayerItem';

export function SetupPhase({ players, teamNames, onSetTeamNames, onAddPlayer, onRemovePlayer, onStart }) {
  const [playerName, setPlayerName] = useState('');
  const [playerTeam, setPlayerTeam] = useState('A');

  const handleTeamNameChange = (team, name) => {
    onSetTeamNames({ ...teamNames, [team]: name });
  };

  const handleAddPlayer = () => {
    if (onAddPlayer(playerName, playerTeam)) {
      setPlayerName('');
    } else {
      alert('Please enter a player name');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddPlayer();
    }
  };

  return (
    <div className="setup-phase">
      <div className="card">
        <div className="section-title">Team Names</div>
        <input 
          type="text" 
          value={teamNames.A}
          onChange={(e) => handleTeamNameChange('A', e.target.value)}
          placeholder="Team A Name"
        />
        <input 
          type="text" 
          value={teamNames.B}
          onChange={(e) => handleTeamNameChange('B', e.target.value)}
          placeholder="Team B Name"
        />
      </div>

      <div className="card">
        <div className="section-title">Add Players</div>
        <input 
          type="text" 
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Player Name"
        />
        <select 
          value={playerTeam}
          onChange={(e) => setPlayerTeam(e.target.value)}
        >
          <option value="A">{teamNames.A}</option>
          <option value="B">{teamNames.B}</option>
        </select>
        <button onClick={handleAddPlayer}>+ Add Player</button>
        
        <div className="player-list">
          {players.map((player, index) => (
            <PlayerItem 
              key={index}
              player={player}
              teamName={teamNames[player.team]}
              showRemove={true}
              onRemove={() => onRemovePlayer(index)}
            />
          ))}
        </div>
        
        {players.length > 0 && (
          <button 
            onClick={onStart}
            style={{ marginTop: '20px', background: '#3b82f6' }}
          >
            Start Game Night ({players.length} players)
          </button>
        )}
      </div>
    </div>
  );
}