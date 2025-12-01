import React, { useState } from 'react';

export function EditablePlayerScore({ player, currentGame, onEditScore }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const handleEdit = () => {
    setEditValue(player.scores[currentGame].toString());
    setIsEditing(true);
  };

  const handleSave = () => {
    const newScore = parseInt(editValue);
    if (!isNaN(newScore)) {
      onEditScore(player.name, currentGame, newScore);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="player-item">
      <span className={`team-badge team-${player.team}`}>
        Team {player.team}
      </span>
      <span className="player-name">{player.name}</span>
      
      {isEditing ? (
        <div className="edit-controls">
          <input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyPress}
            autoFocus
            className="edit-input"
          />
          <button onClick={handleSave} className="btn-small btn-success">✓</button>
          <button onClick={handleCancel} className="btn-small btn-cancel">✕</button>
        </div>
      ) : (
        <div className="score-display">
          <span className="player-score">{player.scores[currentGame]} pts</span>
          <button onClick={handleEdit} className="btn-edit">✏️ Edit</button>
        </div>
      )}
    </div>
  );
}