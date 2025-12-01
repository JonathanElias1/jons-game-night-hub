/**
 * Jon's Game Night - Shared Scoring System
 * Include this in each game to sync scores across all games
 *
 * Features:
 * - Persistent scoring across games via localStorage
 * - Undo last action support
 * - Toast notifications for score changes
 * - Quick team scoring
 * - Custom point input
 */

(function(window) {
  'use strict';

  const STORAGE_KEY = 'jonsGameNightData';
  const HISTORY_KEY = 'jonsGameNightHistory';
  const HUB_URL = '../index.html';
  const MAX_HISTORY = 20; // Keep last 20 actions for undo

  // Scoring configuration per game
  const SCORING_CONFIG = {
    'Family Feud': {
      pointOptions: [
        { name: 'Top Answer', value: 10, type: 'individual' },
        { name: 'Fast Money Win', value: 20, type: 'individual' },
        { name: 'Round Win', value: 25, type: 'team' }
      ],
      maxPoints: 125
    },
    'Jeopardy': {
      pointOptions: [
        { name: 'Daily Double', value: 15, type: 'team' },
        { name: 'Round Win', value: 25, type: 'team' }
      ],
      maxPoints: 120
    },
    'Wheel of Fortune': {
      pointOptions: [
        { name: 'Bonus Round', value: 20, type: 'individual' },
        { name: 'Round Win', value: 10, type: 'team' }
      ],
      maxPoints: 100
    },
    'Price Is Right': {
      pointOptions: [
        { name: 'Game Win', value: 15, type: 'individual' },
        { name: 'Showcase Win', value: 30, type: 'individual' },
        { name: 'Perfect Bid', value: 10, type: 'individual' }
      ],
      maxPoints: 100
    },
    'Are You Smarter Than Jon': {
      pointOptions: [
        { name: 'Correct Answer', value: 10, type: 'individual' },
        { name: 'Used Lifeline', value: -5, type: 'individual' },
        { name: 'Game Win', value: 25, type: 'team' }
      ],
      maxPoints: 100
    }
  };

  // Load data from localStorage
  function loadData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load game night data:', e);
    }
    return {
      players: [],
      teamNames: { A: 'Team A', B: 'Team B' },
      gamesPlayed: [],
      currentGame: null
    };
  }

  // Save data to localStorage
  function saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save game night data:', e);
    }
  }

  // Load history for undo functionality
  function loadHistory() {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
    return [];
  }

  // Save history
  function saveHistory(history) {
    try {
      // Keep only last MAX_HISTORY entries
      const trimmed = history.slice(-MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  }

  // Add action to history
  function addToHistory(action) {
    const history = loadHistory();
    history.push({
      ...action,
      timestamp: Date.now()
    });
    saveHistory(history);
  }

  // Undo last action
  function undoLast() {
    const history = loadHistory();
    if (history.length === 0) return null;

    const lastAction = history.pop();
    saveHistory(history);

    // Reverse the score change
    const data = loadData();
    if (lastAction.type === 'individual') {
      data.players = data.players.map(p => {
        if (p.name === lastAction.playerName) {
          const newScores = { ...p.scores };
          newScores[lastAction.gameName] = (newScores[lastAction.gameName] || 0) - lastAction.points;
          const newTotal = Object.values(newScores).reduce((a, b) => a + b, 0);
          return { ...p, scores: newScores, total: newTotal };
        }
        return p;
      });
    } else if (lastAction.type === 'team') {
      data.players = data.players.map(p => {
        if (p.team === lastAction.team) {
          const newScores = { ...p.scores };
          newScores[lastAction.gameName] = (newScores[lastAction.gameName] || 0) - lastAction.points;
          const newTotal = Object.values(newScores).reduce((a, b) => a + b, 0);
          return { ...p, scores: newScores, total: newTotal };
        }
        return p;
      });
    }

    saveData(data);
    return lastAction;
  }

  // Get last action for display
  function getLastAction() {
    const history = loadHistory();
    return history.length > 0 ? history[history.length - 1] : null;
  }

  // Get current data
  function getData() {
    return loadData();
  }

  // Get players
  function getPlayers() {
    return loadData().players || [];
  }

  // Get team names
  function getTeamNames() {
    return loadData().teamNames || { A: 'Team A', B: 'Team B' };
  }

  // Add score to a player
  function addScore(playerName, points, gameName, actionLabel) {
    const data = loadData();
    data.players = data.players.map(p => {
      if (p.name === playerName) {
        const newScores = { ...p.scores };
        newScores[gameName] = (newScores[gameName] || 0) + points;
        const newTotal = Object.values(newScores).reduce((a, b) => a + b, 0);
        return { ...p, scores: newScores, total: newTotal };
      }
      return p;
    });
    saveData(data);

    // Track for undo
    addToHistory({
      type: 'individual',
      playerName,
      points,
      gameName,
      label: actionLabel || `${points > 0 ? '+' : ''}${points} pts`
    });

    return data;
  }

  // Add score to entire team
  function addTeamScore(team, points, gameName, actionLabel) {
    const data = loadData();
    const teamNames = data.teamNames || { A: 'Team A', B: 'Team B' };
    data.players = data.players.map(p => {
      if (p.team === team) {
        const newScores = { ...p.scores };
        newScores[gameName] = (newScores[gameName] || 0) + points;
        const newTotal = Object.values(newScores).reduce((a, b) => a + b, 0);
        return { ...p, scores: newScores, total: newTotal };
      }
      return p;
    });
    saveData(data);

    // Track for undo
    addToHistory({
      type: 'team',
      team,
      teamName: teamNames[team],
      points,
      gameName,
      label: actionLabel || `${points > 0 ? '+' : ''}${points} pts (Team)`
    });

    return data;
  }

  // Mark game as played
  function markGamePlayed(gameName) {
    const data = loadData();
    if (!data.gamesPlayed.includes(gameName)) {
      data.gamesPlayed.push(gameName);
    }
    data.currentGame = gameName;
    saveData(data);
  }

  // Get team totals
  function getTeamTotals() {
    const data = loadData();
    const teamA = data.players.filter(p => p.team === 'A').reduce((sum, p) => sum + (p.total || 0), 0);
    const teamB = data.players.filter(p => p.team === 'B').reduce((sum, p) => sum + (p.total || 0), 0);
    return { teamA, teamB };
  }

  // Get sorted leaderboard
  function getLeaderboard() {
    const data = loadData();
    return [...data.players].sort((a, b) => (b.total || 0) - (a.total || 0));
  }

  // Navigate back to hub
  function goToHub() {
    window.location.href = HUB_URL;
  }

  // Show toast notification
  function showToast(message, type = 'success') {
    const existing = document.getElementById('gns-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'gns-toast';
    toast.className = `gns-toast gns-toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after delay
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // Create floating score button UI
  function createScoreUI(gameName) {
    const data = loadData();
    if (!data.players || data.players.length === 0) {
      console.log('No players set up - scoring UI not shown');
      return;
    }

    markGamePlayed(gameName);
    const teamNames = getTeamNames();
    const config = SCORING_CONFIG[gameName];

    // Create floating button
    const container = document.createElement('div');
    container.id = 'game-night-scoring';
    container.innerHTML = `
      <style>
        #game-night-scoring {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 99999;
          font-family: 'Poppins', system-ui, sans-serif;
        }
        #gns-toggle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          transition: transform 0.2s;
        }
        #gns-toggle:hover { transform: scale(1.1); }
        #gns-panel {
          display: none;
          position: absolute;
          bottom: 70px;
          right: 0;
          width: 340px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          max-height: 80vh;
          overflow-y: auto;
        }
        #gns-panel.open { display: block; }
        .gns-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        #gns-panel h3 { color: #fff; margin: 0; font-size: 14px; }
        .gns-undo-btn { padding: 4px 10px; border-radius: 6px; border: none; background: rgba(239, 68, 68, 0.3); color: #fca5a5; font-size: 11px; cursor: pointer; }
        .gns-undo-btn:hover { background: rgba(239, 68, 68, 0.5); }
        .gns-undo-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .gns-teams { display: flex; gap: 8px; margin-bottom: 12px; }
        .gns-team { flex: 1; padding: 8px; border-radius: 8px; text-align: center; cursor: pointer; transition: all 0.2s; }
        .gns-team:hover { transform: scale(1.02); }
        .gns-team.selected { outline: 2px solid #fbbf24; outline-offset: 2px; }
        .gns-team-a { background: rgba(59, 130, 246, 0.3); }
        .gns-team-b { background: rgba(239, 68, 68, 0.3); }
        .gns-team-name { color: #aaa; font-size: 11px; }
        .gns-team-score { color: #fff; font-size: 24px; font-weight: bold; }
        .gns-section-label { color: #94a3b8; font-size: 10px; text-transform: uppercase; margin-bottom: 6px; }
        .gns-players { max-height: 120px; overflow-y: auto; margin-bottom: 12px; }
        .gns-player { display: flex; align-items: center; gap: 8px; padding: 6px 8px; background: rgba(255,255,255,0.1); border-radius: 6px; margin-bottom: 4px; cursor: pointer; transition: all 0.15s; }
        .gns-player:hover { background: rgba(255,255,255,0.2); }
        .gns-player.selected { background: rgba(234, 179, 8, 0.4); border: 1px solid #eab308; }
        .gns-player-team { width: 4px; height: 100%; min-height: 20px; border-radius: 2px; }
        .gns-player-team.team-a { background: #3b82f6; }
        .gns-player-team.team-b { background: #ef4444; }
        .gns-player-name { flex: 1; color: #fff; font-size: 12px; }
        .gns-player-score { color: #eab308; font-weight: bold; font-size: 12px; }
        .gns-points { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
        .gns-point-btn { padding: 8px 10px; border-radius: 8px; border: none; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; font-weight: bold; cursor: pointer; font-size: 10px; transition: all 0.15s; }
        .gns-point-btn:hover { opacity: 0.9; transform: scale(1.02); }
        .gns-point-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .gns-point-btn.negative { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
        .gns-custom-row { display: flex; gap: 6px; margin-bottom: 12px; }
        .gns-custom-input { flex: 1; padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white; font-size: 12px; }
        .gns-custom-input::placeholder { color: #666; }
        .gns-custom-btn { padding: 8px 12px; border-radius: 6px; border: none; background: #6366f1; color: white; font-size: 11px; font-weight: bold; cursor: pointer; }
        .gns-custom-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .gns-actions { display: flex; gap: 8px; }
        .gns-hub-btn { flex: 1; padding: 10px; border-radius: 8px; border: none; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; font-weight: bold; cursor: pointer; font-size: 12px; }
        .gns-hub-btn:hover { opacity: 0.9; }
        .gns-last-action { background: rgba(255,255,255,0.05); border-radius: 6px; padding: 6px 10px; margin-bottom: 12px; font-size: 10px; color: #94a3b8; }
        .gns-last-action strong { color: #fbbf24; }

        /* Toast notification */
        .gns-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 20px;
          border-radius: 10px;
          font-family: 'Poppins', system-ui, sans-serif;
          font-weight: 600;
          font-size: 14px;
          z-index: 999999;
          opacity: 0;
          transform: translateY(-10px);
          transition: all 0.3s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .gns-toast.show { opacity: 1; transform: translateY(0); }
        .gns-toast-success { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
        .gns-toast-undo { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; }
        .gns-toast-error { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; }
      </style>
      <div id="gns-panel">
        <div class="gns-header">
          <h3>🎮 ${gameName}</h3>
          <button class="gns-undo-btn" id="gns-undo-btn" title="Undo last action">↩ Undo</button>
        </div>

        <div id="gns-last-action" class="gns-last-action" style="display:none;"></div>

        <div class="gns-section-label">Team Scores (click to award team)</div>
        <div class="gns-teams">
          <div class="gns-team gns-team-a" id="gns-select-team-a" data-team="A">
            <div class="gns-team-name">${teamNames.A}</div>
            <div class="gns-team-score" id="gns-team-a-score">0</div>
          </div>
          <div class="gns-team gns-team-b" id="gns-select-team-b" data-team="B">
            <div class="gns-team-name">${teamNames.B}</div>
            <div class="gns-team-score" id="gns-team-b-score">0</div>
          </div>
        </div>

        <div class="gns-section-label">Players (click to select)</div>
        <div class="gns-players" id="gns-players"></div>

        <div class="gns-section-label">Award Points</div>
        <div class="gns-points" id="gns-points"></div>

        <div class="gns-custom-row">
          <input type="number" class="gns-custom-input" id="gns-custom-pts" placeholder="Custom pts (e.g. 5 or -5)">
          <button class="gns-custom-btn" id="gns-custom-btn" disabled>Award</button>
        </div>

        <div class="gns-actions">
          <button class="gns-hub-btn" id="gns-hub-btn">← Back to Hub</button>
        </div>
      </div>
      <button id="gns-toggle">🎯</button>
    `;
    document.body.appendChild(container);

    // Toggle panel
    const toggle = document.getElementById('gns-toggle');
    const panel = document.getElementById('gns-panel');
    toggle.addEventListener('click', () => panel.classList.toggle('open'));

    // Hub button
    document.getElementById('gns-hub-btn').addEventListener('click', goToHub);

    // Undo button
    document.getElementById('gns-undo-btn').addEventListener('click', () => {
      const undone = undoLast();
      if (undone) {
        showToast(`Undid: ${undone.label}`, 'undo');
        updateUI();
      }
    });

    // Selected state
    let selectedPlayers = [];
    let selectedTeam = null;

    // Team click handlers
    document.getElementById('gns-select-team-a').addEventListener('click', () => toggleTeam('A'));
    document.getElementById('gns-select-team-b').addEventListener('click', () => toggleTeam('B'));

    function toggleTeam(team) {
      if (selectedTeam === team) {
        selectedTeam = null;
      } else {
        selectedTeam = team;
        selectedPlayers = []; // Clear individual selection when selecting team
      }
      renderPlayers();
      renderPoints();
      updateTeamSelection();
    }

    function updateTeamSelection() {
      document.getElementById('gns-select-team-a').classList.toggle('selected', selectedTeam === 'A');
      document.getElementById('gns-select-team-b').classList.toggle('selected', selectedTeam === 'B');
    }

    // Render players
    function renderPlayers() {
      const players = getPlayers();
      const playersDiv = document.getElementById('gns-players');
      playersDiv.innerHTML = players.map(p => `
        <div class="gns-player ${selectedPlayers.includes(p.name) ? 'selected' : ''}" data-name="${p.name}">
          <div class="gns-player-team team-${p.team.toLowerCase()}"></div>
          <span class="gns-player-name">${p.name}</span>
          <span class="gns-player-score">${p.scores[gameName] || 0}</span>
        </div>
      `).join('');

      // Click handlers
      playersDiv.querySelectorAll('.gns-player').forEach(el => {
        el.addEventListener('click', () => {
          const name = el.dataset.name;
          selectedTeam = null; // Clear team selection
          updateTeamSelection();
          if (selectedPlayers.includes(name)) {
            selectedPlayers = selectedPlayers.filter(n => n !== name);
          } else {
            selectedPlayers.push(name);
          }
          renderPlayers();
          renderPoints();
        });
      });
    }

    // Render point buttons
    function renderPoints() {
      const pointsDiv = document.getElementById('gns-points');
      if (!config) return;

      const hasSelection = selectedPlayers.length > 0 || selectedTeam !== null;

      pointsDiv.innerHTML = config.pointOptions.map(opt => `
        <button class="gns-point-btn ${opt.value < 0 ? 'negative' : ''}"
                data-value="${opt.value}"
                data-label="${opt.name}"
                ${!hasSelection ? 'disabled' : ''}>
          ${opt.name} (${opt.value > 0 ? '+' : ''}${opt.value})
        </button>
      `).join('');

      pointsDiv.querySelectorAll('.gns-point-btn').forEach(btn => {
        btn.addEventListener('click', () => awardPoints(parseInt(btn.dataset.value), btn.dataset.label));
      });

      // Custom points button state
      const customBtn = document.getElementById('gns-custom-btn');
      const customInput = document.getElementById('gns-custom-pts');
      customBtn.disabled = !hasSelection;

      customBtn.onclick = () => {
        const val = parseInt(customInput.value);
        if (!isNaN(val) && val !== 0) {
          awardPoints(val, `Custom ${val > 0 ? '+' : ''}${val}`);
          customInput.value = '';
        }
      };
    }

    // Award points to selection
    function awardPoints(value, label) {
      if (selectedTeam) {
        addTeamScore(selectedTeam, value, gameName, label);
        const teamName = teamNames[selectedTeam];
        showToast(`${teamName}: ${value > 0 ? '+' : ''}${value} pts (${label})`, 'success');
        selectedTeam = null;
      } else if (selectedPlayers.length > 0) {
        selectedPlayers.forEach(name => addScore(name, value, gameName, label));
        const names = selectedPlayers.length > 2
          ? `${selectedPlayers[0]} +${selectedPlayers.length - 1} more`
          : selectedPlayers.join(', ');
        showToast(`${names}: ${value > 0 ? '+' : ''}${value} pts`, 'success');
        selectedPlayers = [];
      }
      updateUI();
    }

    // Update team scores
    function updateTeamScores() {
      const totals = getTeamTotals();
      document.getElementById('gns-team-a-score').textContent = totals.teamA;
      document.getElementById('gns-team-b-score').textContent = totals.teamB;
    }

    // Update last action display
    function updateLastAction() {
      const lastAction = getLastAction();
      const el = document.getElementById('gns-last-action');
      const undoBtn = document.getElementById('gns-undo-btn');

      if (lastAction) {
        const who = lastAction.type === 'team' ? lastAction.teamName : lastAction.playerName;
        el.innerHTML = `Last: <strong>${who}</strong> → ${lastAction.label}`;
        el.style.display = 'block';
        undoBtn.disabled = false;
      } else {
        el.style.display = 'none';
        undoBtn.disabled = true;
      }
    }

    function updateUI() {
      renderPlayers();
      renderPoints();
      updateTeamScores();
      updateTeamSelection();
      updateLastAction();
    }

    updateUI();
  }

  // Expose API globally
  window.GameNightScoring = {
    loadData,
    saveData,
    getData,
    getPlayers,
    getTeamNames,
    addScore,
    addTeamScore,
    markGamePlayed,
    getTeamTotals,
    getLeaderboard,
    goToHub,
    createScoreUI,
    SCORING_CONFIG
  };

})(window);
