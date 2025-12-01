import { useState, useEffect } from 'react';

export function useScoreData() {
const [players, setPlayers] = useState([]);
  const [currentGame, setCurrentGame] = useState('Family Feud');
  const [history, setHistory] = useState([]);
  const [teamNames, setTeamNames] = useState({ A: 'Team A', B: 'Team B' });

  useEffect(() => {
    const saved = localStorage.getItem('gameNightData');
    if (saved) {
      try {
        setPlayers(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load data:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (players.length > 0) {
      localStorage.setItem('gameNightData', JSON.stringify(players));
    }
  }, [players]);

  const addPlayer = (name, team) => {
    if (!name.trim()) return false;
    
    setPlayers(prev => [...prev, {
      name: name.trim(),
      team: team,
      scores: {
        'Family Feud': 0,
        'Jeopardy': 0,
        'Wheel of Fortune': 0,
      },
      total: 0
    }]);
    return true;
  };

  const removePlayer = (index) => {
    setPlayers(prev => prev.filter((_, i) => i !== index));
  };

  const addScore = (playerName, points) => {
    console.log('addScore called with:', playerName, points);
    
    // Save current state to history before making changes
    setHistory(prev => [...prev, { players: JSON.parse(JSON.stringify(players)), game: currentGame }]);
    
    setPlayers(prev => {
      const updated = prev.map(p => {
        console.log('Checking player:', p.name, 'against:', playerName, 'match:', p.name === playerName);
        if (p.name === playerName) {
          const updatedScores = { ...p.scores };
          updatedScores[currentGame] += points;
          const newTotal = Object.values(updatedScores).reduce((a, b) => a + b, 0);
          console.log('Updating player:', p.name, 'with points:', points);
          return { ...p, scores: updatedScores, total: newTotal };
        }
        return p;
      });
      console.log('Updated players:', updated);
      return updated;
    });
  };

  const editScore = (playerName, game, newScore) => {
    // Save current state to history
    setHistory(prev => [...prev, { players: JSON.parse(JSON.stringify(players)), game: currentGame }]);
    
    setPlayers(prev => {
      const updated = prev.map(p => {
        if (p.name === playerName) {
          const updatedScores = { ...p.scores };
          updatedScores[game] = newScore;
          const newTotal = Object.values(updatedScores).reduce((a, b) => a + b, 0);
          return { ...p, scores: updatedScores, total: newTotal };
        }
        return p;
      });
      return updated;
    });
  };

  const undo = () => {
    if (history.length === 0) return false;
    
    const lastState = history[history.length - 1];
    setPlayers(lastState.players);
    setHistory(prev => prev.slice(0, -1));
    return true;
  };

  const resetAll = () => {
    setPlayers([]);
    setHistory([]);
    localStorage.removeItem('gameNightData');
  };

  const exportData = () => {
    const data = JSON.stringify(players, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game-night-scores.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTeamTotals = () => {
    const teamA = players.filter(p => p.team === 'A').reduce((sum, p) => sum + p.total, 0);
    const teamB = players.filter(p => p.team === 'B').reduce((sum, p) => sum + p.total, 0);
    return { teamA, teamB };
  };

  const getSortedPlayers = () => {
    return [...players].sort((a, b) => b.total - a.total);
  };

  return {
    players,
    currentGame,
    setCurrentGame,
    addPlayer,
    removePlayer,
    addScore,
    editScore,
    undo,
    canUndo: history.length > 0,
    resetAll,
    exportData,
    getTeamTotals,
    getSortedPlayers,
    teamNames,
    setTeamNames,
  };
}