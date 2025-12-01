export function PlayerItem({ player, rank, teamName, onRemove, showRemove = false }) {
  const rankClass = rank === 0 ? 'rank-1' : rank === 1 ? 'rank-2' : rank === 2 ? 'rank-3' : '';
  const displayTeamName = teamName || `Team ${player.team}`;
  
  return (
    <div className={`player-item ${rankClass}`}>
      <div className="player-info">
        <div className="player-name">
          {rank !== undefined && `${rank + 1}. `}{player.name}
        </div>
        <div className="player-team">
          {displayTeamName}
          {player.scores && ` | FF: ${player.scores['Family Feud']} | J: ${player.scores['Jeopardy']} | WF: ${player.scores['Wheel of Fortune']}`}
        </div>
      </div>
      {player.total !== undefined && (
        <div className="player-score">{player.total}</div>
      )}
      {showRemove && (
        <button 
          onClick={onRemove}
          className="remove-btn"
        >
          Remove
        </button>
      )}
    </div>
  );
}