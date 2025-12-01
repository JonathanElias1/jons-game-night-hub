import React, { useState, useEffect, useCallback } from 'react';

// Letter values (Scrabble-style)
const LETTER_VALUES = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3,
  N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10
};

// Letter distribution for tile bag
const LETTER_DISTRIBUTION = {
  A: 9, B: 2, C: 2, D: 4, E: 12, F: 2, G: 3, H: 2, I: 9, J: 1, K: 1, L: 4, M: 2,
  N: 6, O: 8, P: 2, Q: 1, R: 6, S: 4, T: 6, U: 4, V: 2, W: 2, X: 1, Y: 2, Z: 1
};

// Board size
const BOARD_SIZE = 15;
const CENTER = 7;

// Premium square positions
const TRIPLE_WORD = [[0,0], [0,7], [0,14], [7,0], [7,14], [14,0], [14,7], [14,14]];
const DOUBLE_WORD = [[1,1], [2,2], [3,3], [4,4], [1,13], [2,12], [3,11], [4,10],
                     [13,1], [12,2], [11,3], [10,4], [13,13], [12,12], [11,11], [10,10]];
const TRIPLE_LETTER = [[1,5], [1,9], [5,1], [5,5], [5,9], [5,13], [9,1], [9,5], [9,9], [9,13], [13,5], [13,9]];
const DOUBLE_LETTER = [[0,3], [0,11], [2,6], [2,8], [3,0], [3,7], [3,14], [6,2], [6,6], [6,8], [6,12],
                       [7,3], [7,11], [8,2], [8,6], [8,8], [8,12], [11,0], [11,7], [11,14], [12,6], [12,8], [14,3], [14,11]];

// Power-ups
const POWER_UPS = [
  { id: 'double_points', name: '2X Points', description: 'Double points for this turn', emoji: '✨', color: 'bg-yellow-500' },
  { id: 'swap_tiles', name: 'Swap Tiles', description: 'Swap up to 3 tiles', emoji: '🔄', color: 'bg-blue-500' },
  { id: 'steal_tile', name: 'Steal Tile', description: 'Take a random tile from opponent', emoji: '🦹', color: 'bg-purple-500' },
  { id: 'wild_card', name: 'Wild Card', description: 'Get a blank tile (any letter)', emoji: '🃏', color: 'bg-green-500' },
  { id: 'extra_turn', name: 'Extra Turn', description: 'Play again after this turn', emoji: '⏩', color: 'bg-orange-500' },
  { id: 'bomb', name: 'Letter Bomb', description: 'Remove a tile from the board', emoji: '💣', color: 'bg-red-500' },
];

// Random events
const RANDOM_EVENTS = [
  { id: 'bonus_tiles', name: 'Bonus Tiles!', description: 'Both players draw 2 extra tiles', effect: 'bonus_draw' },
  { id: 'shuffle', name: 'Tile Shuffle!', description: 'All rack tiles are shuffled back and redrawn', effect: 'shuffle_rack' },
  { id: 'point_boost', name: 'Point Boost!', description: 'All tiles worth +1 point this round', effect: 'point_boost' },
  { id: 'mystery_tile', name: 'Mystery Tile!', description: 'Current player gets a mystery power-up', effect: 'mystery_powerup' },
  { id: 'vowel_rain', name: 'Vowel Rain!', description: 'Both players get 2 random vowels', effect: 'vowel_bonus' },
];

// Common English words for validation (simplified list - in production, use a full dictionary)
const VALID_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there',
  'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time',
  'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than',
  'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work',
  'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'are', 'was',
  'cat', 'dog', 'run', 'jump', 'play', 'game', 'word', 'win', 'lose', 'fun', 'joy', 'love', 'hate', 'big', 'small', 'fast',
  'slow', 'hot', 'cold', 'red', 'blue', 'green', 'yes', 'no', 'hi', 'bye', 'hello', 'world', 'home', 'house', 'car', 'tree',
  'sun', 'moon', 'star', 'sky', 'rain', 'snow', 'wind', 'fire', 'water', 'earth', 'air', 'food', 'eat', 'drink', 'sleep',
  'wake', 'walk', 'talk', 'read', 'write', 'sing', 'dance', 'happy', 'sad', 'mad', 'glad', 'bad', 'good', 'best', 'worst',
  'jon', 'party', 'birthday', 'friend', 'family', 'team', 'score', 'point', 'letter', 'tile', 'board', 'rack', 'turn', 'round',
  'ax', 'ex', 'ox', 'qi', 'xi', 'xu', 'za', 'zo', 'aa', 'ab', 'ad', 'ae', 'ag', 'ah', 'ai', 'al', 'am', 'an', 'ar', 'as', 'at', 'aw', 'ay',
  'ba', 'be', 'bi', 'bo', 'by', 'da', 'de', 'do', 'ed', 'ef', 'eh', 'el', 'em', 'en', 'er', 'es', 'et', 'fa', 'fe', 'go', 'ha', 'he', 'hi', 'hm', 'ho',
  'id', 'if', 'in', 'is', 'it', 'jo', 'ka', 'ki', 'la', 'li', 'lo', 'ma', 'me', 'mi', 'mm', 'mo', 'mu', 'my', 'na', 'ne', 'no', 'nu', 'od', 'oe', 'of',
  'oh', 'oi', 'ok', 'om', 'on', 'op', 'or', 'os', 'ou', 'ow', 'pa', 'pe', 'pi', 'po', 're', 'sh', 'si', 'so', 'ta', 'ti', 'to', 'uh', 'um', 'un', 'up',
  'us', 'ut', 'we', 'wo', 'ya', 'ye', 'yo', 'war', 'words', 'power', 'super', 'mega', 'ultra', 'epic', 'cool', 'nice', 'great', 'awesome',
  'quiz', 'quip', 'quit', 'quite', 'quote', 'jazz', 'fizz', 'buzz', 'fuzz', 'pizza', 'zone', 'zero', 'zap', 'zip', 'zoo', 'zoom',
  'box', 'fox', 'mix', 'fix', 'six', 'wax', 'max', 'tax', 'vex', 'hex', 'rex', 'apex', 'axle', 'exit', 'next', 'text', 'flex',
]);

// Hub integration
function loadHubData() {
  try {
    const saved = localStorage.getItem('jonsGameNightData');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load hub data:', e);
  }
  return null;
}

function addHubTeamScore(team, points, gameName, description) {
  if (!window.GameNightScoring) return;
  window.GameNightScoring.addTeamScore(team, points, gameName, description);
}

// Helper functions
function createTileBag() {
  const bag = [];
  for (const [letter, count] of Object.entries(LETTER_DISTRIBUTION)) {
    for (let i = 0; i < count; i++) {
      bag.push({ letter, value: LETTER_VALUES[letter], id: `${letter}_${i}` });
    }
  }
  // Add 2 blank tiles
  bag.push({ letter: '*', value: 0, id: 'blank_1', isBlank: true });
  bag.push({ letter: '*', value: 0, id: 'blank_2', isBlank: true });
  return shuffleArray(bag);
}

function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function getSquareType(row, col) {
  if (row === CENTER && col === CENTER) return 'center';
  if (TRIPLE_WORD.some(([r, c]) => r === row && c === col)) return 'tw';
  if (DOUBLE_WORD.some(([r, c]) => r === row && c === col)) return 'dw';
  if (TRIPLE_LETTER.some(([r, c]) => r === row && c === col)) return 'tl';
  if (DOUBLE_LETTER.some(([r, c]) => r === row && c === col)) return 'dl';
  return 'normal';
}

function getSquareStyle(type, hasTile) {
  if (hasTile) return 'bg-amber-100';
  switch (type) {
    case 'center': return 'bg-pink-400';
    case 'tw': return 'bg-red-500 text-white';
    case 'dw': return 'bg-pink-300';
    case 'tl': return 'bg-blue-500 text-white';
    case 'dl': return 'bg-cyan-300';
    default: return 'bg-emerald-100';
  }
}

function getSquareLabel(type) {
  switch (type) {
    case 'center': return '★';
    case 'tw': return 'TW';
    case 'dw': return 'DW';
    case 'tl': return 'TL';
    case 'dl': return 'DL';
    default: return '';
  }
}

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState([
    { name: 'Player 1', team: 'A', score: 0, rack: [], powerUps: [] },
    { name: 'Player 2', team: 'B', score: 0, rack: [], powerUps: [] }
  ]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [board, setBoard] = useState(() => Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
  const [tileBag, setTileBag] = useState([]);
  const [selectedTile, setSelectedTile] = useState(null);
  const [placedTiles, setPlacedTiles] = useState([]); // Tiles placed this turn
  const [turnScore, setTurnScore] = useState(0);
  const [message, setMessage] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [consecutivePasses, setConsecutivePasses] = useState(0);
  const [firstTurn, setFirstTurn] = useState(true);
  const [activePowerUp, setActivePowerUp] = useState(null);
  const [showEvent, setShowEvent] = useState(null);
  const [pointBoostActive, setPointBoostActive] = useState(false);
  const [extraTurnPending, setExtraTurnPending] = useState(false);
  const [swapMode, setSwapMode] = useState(false);
  const [tilesToSwap, setTilesToSwap] = useState([]);
  const [bombMode, setBombMode] = useState(false);

  // Initialize game
  const startGame = useCallback((playerNames) => {
    const bag = createTileBag();
    const newPlayers = playerNames.map((name, i) => ({
      name,
      team: i === 0 ? 'A' : 'B',
      score: 0,
      rack: bag.splice(0, 7),
      powerUps: [POWER_UPS[Math.floor(Math.random() * POWER_UPS.length)]] // Start with 1 random power-up
    }));
    setPlayers(newPlayers);
    setTileBag(bag);
    setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
    setCurrentPlayer(0);
    setPlacedTiles([]);
    setGameStarted(true);
    setGameOver(false);
    setConsecutivePasses(0);
    setFirstTurn(true);
    setMessage(`${newPlayers[0].name}'s turn! Place tiles on the board.`);
  }, []);

  // Load hub data on mount
  useEffect(() => {
    const hubData = loadHubData();
    if (hubData && hubData.players && hubData.players.length >= 2) {
      const teamA = hubData.players.filter(p => p.team === 'A').map(p => p.name);
      const teamB = hubData.players.filter(p => p.team === 'B').map(p => p.name);
      if (teamA.length > 0 && teamB.length > 0) {
        startGame([teamA[0], teamB[0]]);
      }
    }
  }, [startGame]);

  // Draw tiles to fill rack
  const drawTiles = (playerIndex, count = 7) => {
    const player = players[playerIndex];
    const needed = Math.min(count - player.rack.length, tileBag.length);
    if (needed <= 0) return;

    const drawn = tileBag.splice(0, needed);
    setPlayers(prev => prev.map((p, i) =>
      i === playerIndex ? { ...p, rack: [...p.rack, ...drawn] } : p
    ));
    setTileBag([...tileBag]);
  };

  // Handle tile selection from rack
  const selectTile = (tileIndex) => {
    if (swapMode) {
      // Toggle tile for swapping
      setTilesToSwap(prev =>
        prev.includes(tileIndex)
          ? prev.filter(i => i !== tileIndex)
          : prev.length < 3 ? [...prev, tileIndex] : prev
      );
    } else {
      setSelectedTile(selectedTile === tileIndex ? null : tileIndex);
    }
  };

  // Handle board click
  const handleBoardClick = (row, col) => {
    if (gameOver) return;

    // Bomb mode - remove a tile
    if (bombMode && board[row][col]) {
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = null;
      setBoard(newBoard);
      setBombMode(false);
      setMessage('💣 Tile removed!');
      return;
    }

    if (selectedTile === null) return;
    if (board[row][col]) return; // Square already occupied

    const player = players[currentPlayer];
    const tile = player.rack[selectedTile];

    // Handle blank tile
    let placedTile = { ...tile };
    if (tile.isBlank) {
      const letter = prompt('Enter the letter for the blank tile (A-Z):')?.toUpperCase();
      if (!letter || letter.length !== 1 || !/[A-Z]/.test(letter)) {
        setMessage('Invalid letter!');
        return;
      }
      placedTile = { ...tile, letter, displayLetter: letter };
    }

    // Place tile
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = placedTile;
    setBoard(newBoard);

    // Remove from rack
    const newRack = [...player.rack];
    newRack.splice(selectedTile, 1);
    setPlayers(prev => prev.map((p, i) =>
      i === currentPlayer ? { ...p, rack: newRack } : p
    ));

    setPlacedTiles([...placedTiles, { row, col, tile: placedTile }]);
    setSelectedTile(null);

    // Calculate preview score
    calculateTurnScore(newBoard, [...placedTiles, { row, col, tile: placedTile }]);
  };

  // Remove placed tile (undo)
  const removePlacedTile = (index) => {
    const placed = placedTiles[index];
    const newBoard = board.map(r => [...r]);
    newBoard[placed.row][placed.col] = null;
    setBoard(newBoard);

    // Return to rack
    setPlayers(prev => prev.map((p, i) =>
      i === currentPlayer ? { ...p, rack: [...p.rack, placed.tile] } : p
    ));

    const newPlaced = [...placedTiles];
    newPlaced.splice(index, 1);
    setPlacedTiles(newPlaced);
    calculateTurnScore(newBoard, newPlaced);
  };

  // Calculate score for placed tiles
  const calculateTurnScore = (currentBoard, placed) => {
    if (placed.length === 0) {
      setTurnScore(0);
      return 0;
    }

    let totalScore = 0;
    const wordsFound = findWords(currentBoard, placed);

    for (const word of wordsFound) {
      let wordScore = 0;
      let wordMultiplier = 1;

      for (const { row, col, tile } of word.tiles) {
        let letterScore = tile.value + (pointBoostActive ? 1 : 0);
        const isNewTile = placed.some(p => p.row === row && p.col === col);

        if (isNewTile) {
          const squareType = getSquareType(row, col);
          if (squareType === 'dl') letterScore *= 2;
          else if (squareType === 'tl') letterScore *= 3;
          else if (squareType === 'dw' || squareType === 'center') wordMultiplier *= 2;
          else if (squareType === 'tw') wordMultiplier *= 3;
        }

        wordScore += letterScore;
      }

      totalScore += wordScore * wordMultiplier;
    }

    // Bonus for using all 7 tiles
    if (placed.length === 7) totalScore += 50;

    // Apply double points power-up
    if (activePowerUp === 'double_points') totalScore *= 2;

    setTurnScore(totalScore);
    return totalScore;
  };

  // Find all words formed by placed tiles
  const findWords = (currentBoard, placed) => {
    const words = [];
    const checked = new Set();

    for (const { row, col } of placed) {
      // Check horizontal word
      let startCol = col;
      while (startCol > 0 && currentBoard[row][startCol - 1]) startCol--;
      let endCol = col;
      while (endCol < BOARD_SIZE - 1 && currentBoard[row][endCol + 1]) endCol++;

      if (endCol > startCol) {
        const key = `h_${row}_${startCol}_${endCol}`;
        if (!checked.has(key)) {
          checked.add(key);
          const tiles = [];
          for (let c = startCol; c <= endCol; c++) {
            tiles.push({ row, col: c, tile: currentBoard[row][c] });
          }
          words.push({ tiles, direction: 'horizontal' });
        }
      }

      // Check vertical word
      let startRow = row;
      while (startRow > 0 && currentBoard[startRow - 1][col]) startRow--;
      let endRow = row;
      while (endRow < BOARD_SIZE - 1 && currentBoard[endRow + 1][col]) endRow++;

      if (endRow > startRow) {
        const key = `v_${startRow}_${endRow}_${col}`;
        if (!checked.has(key)) {
          checked.add(key);
          const tiles = [];
          for (let r = startRow; r <= endRow; r++) {
            tiles.push({ row: r, col, tile: currentBoard[r][col] });
          }
          words.push({ tiles, direction: 'vertical' });
        }
      }
    }

    return words;
  };

  // Validate word placement
  const validatePlacement = () => {
    if (placedTiles.length === 0) return { valid: false, error: 'Place at least one tile!' };

    // Check if all tiles are in a line
    const rows = [...new Set(placedTiles.map(t => t.row))];
    const cols = [...new Set(placedTiles.map(t => t.col))];

    if (rows.length > 1 && cols.length > 1) {
      return { valid: false, error: 'Tiles must be in a straight line!' };
    }

    // First turn must cover center
    if (firstTurn) {
      const coversCenter = placedTiles.some(t => t.row === CENTER && t.col === CENTER);
      if (!coversCenter) {
        return { valid: false, error: 'First word must cover the center star!' };
      }
    } else {
      // Must connect to existing tiles
      const connectsToExisting = placedTiles.some(({ row, col }) => {
        const neighbors = [
          [row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]
        ];
        return neighbors.some(([r, c]) => {
          if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return false;
          const tile = board[r][c];
          return tile && !placedTiles.some(p => p.row === r && p.col === c);
        });
      });

      if (!connectsToExisting) {
        return { valid: false, error: 'Word must connect to existing tiles!' };
      }
    }

    // Validate words
    const words = findWords(board, placedTiles);
    for (const word of words) {
      const wordStr = word.tiles.map(t => t.tile.letter).join('').toLowerCase();
      if (!VALID_WORDS.has(wordStr)) {
        return { valid: false, error: `"${wordStr.toUpperCase()}" is not a valid word!` };
      }
    }

    return { valid: true };
  };

  // Submit turn
  const submitTurn = () => {
    const validation = validatePlacement();
    if (!validation.valid) {
      setMessage(validation.error);
      return;
    }

    const score = turnScore;

    // Update score
    setPlayers(prev => prev.map((p, i) =>
      i === currentPlayer ? { ...p, score: p.score + score } : p
    ));

    // Clear placed tiles tracking
    setPlacedTiles([]);
    setTurnScore(0);
    setConsecutivePasses(0);
    setFirstTurn(false);
    setActivePowerUp(null);
    setPointBoostActive(false);

    // Draw new tiles
    drawTiles(currentPlayer, 7);

    // Random event chance (20%)
    if (Math.random() < 0.2) {
      triggerRandomEvent();
    }

    // Random power-up reward (15% chance)
    if (Math.random() < 0.15) {
      const newPowerUp = POWER_UPS[Math.floor(Math.random() * POWER_UPS.length)];
      setPlayers(prev => prev.map((p, i) =>
        i === currentPlayer ? { ...p, powerUps: [...p.powerUps, newPowerUp] } : p
      ));
      setMessage(`+${score} points! 🎁 You earned a ${newPowerUp.name} power-up!`);
    } else {
      setMessage(`+${score} points!`);
    }

    // Check for game over
    if (tileBag.length === 0 && players[currentPlayer].rack.length === 0) {
      endGame();
      return;
    }

    // Next turn (unless extra turn)
    if (extraTurnPending) {
      setExtraTurnPending(false);
      setMessage(`+${score} points! ⏩ Extra turn!`);
    } else {
      setCurrentPlayer(prev => (prev + 1) % 2);
    }
  };

  // Pass turn
  const passTurn = () => {
    setConsecutivePasses(prev => prev + 1);

    if (consecutivePasses >= 3) {
      endGame();
      return;
    }

    // Return placed tiles
    placedTiles.forEach(({ row, col, tile }) => {
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = null;
      setBoard(newBoard);
      setPlayers(prev => prev.map((p, i) =>
        i === currentPlayer ? { ...p, rack: [...p.rack, tile] } : p
      ));
    });

    setPlacedTiles([]);
    setTurnScore(0);
    setActivePowerUp(null);
    setCurrentPlayer(prev => (prev + 1) % 2);
    setMessage('Turn passed.');
  };

  // Use power-up
  const usePowerUp = (powerUpIndex) => {
    const player = players[currentPlayer];
    const powerUp = player.powerUps[powerUpIndex];

    switch (powerUp.id) {
      case 'double_points':
        setActivePowerUp('double_points');
        setMessage('✨ Double points activated for this turn!');
        break;

      case 'swap_tiles':
        setSwapMode(true);
        setTilesToSwap([]);
        setMessage('🔄 Select up to 3 tiles to swap, then click "Confirm Swap"');
        break;

      case 'steal_tile':
        const opponent = players[(currentPlayer + 1) % 2];
        if (opponent.rack.length > 0) {
          const stolenIndex = Math.floor(Math.random() * opponent.rack.length);
          const stolenTile = opponent.rack[stolenIndex];
          setPlayers(prev => prev.map((p, i) => {
            if (i === currentPlayer) return { ...p, rack: [...p.rack, stolenTile] };
            if (i === (currentPlayer + 1) % 2) {
              const newRack = [...p.rack];
              newRack.splice(stolenIndex, 1);
              return { ...p, rack: newRack };
            }
            return p;
          }));
          setMessage(`🦹 Stole a "${stolenTile.letter}" from ${opponent.name}!`);
        }
        break;

      case 'wild_card':
        const wildTile = { letter: '*', value: 0, id: `wild_${Date.now()}`, isBlank: true };
        setPlayers(prev => prev.map((p, i) =>
          i === currentPlayer ? { ...p, rack: [...p.rack, wildTile] } : p
        ));
        setMessage('🃏 Wild card added to your rack!');
        break;

      case 'extra_turn':
        setExtraTurnPending(true);
        setMessage('⏩ Extra turn activated! Play again after this turn.');
        break;

      case 'bomb':
        setBombMode(true);
        setMessage('💣 Click on a tile on the board to remove it!');
        break;
    }

    // Remove used power-up
    setPlayers(prev => prev.map((p, i) => {
      if (i === currentPlayer) {
        const newPowerUps = [...p.powerUps];
        newPowerUps.splice(powerUpIndex, 1);
        return { ...p, powerUps: newPowerUps };
      }
      return p;
    }));
  };

  // Confirm swap
  const confirmSwap = () => {
    if (tilesToSwap.length === 0) {
      setSwapMode(false);
      return;
    }

    const player = players[currentPlayer];
    const tilesToReturn = tilesToSwap.map(i => player.rack[i]);

    // Remove tiles from rack and add to bag
    const newRack = player.rack.filter((_, i) => !tilesToSwap.includes(i));
    const newBag = shuffleArray([...tileBag, ...tilesToReturn]);

    // Draw new tiles
    const drawn = newBag.splice(0, tilesToSwap.length);

    setPlayers(prev => prev.map((p, i) =>
      i === currentPlayer ? { ...p, rack: [...newRack, ...drawn] } : p
    ));
    setTileBag(newBag);
    setSwapMode(false);
    setTilesToSwap([]);
    setMessage(`🔄 Swapped ${tilesToSwap.length} tiles!`);
  };

  // Trigger random event
  const triggerRandomEvent = () => {
    const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
    setShowEvent(event);

    switch (event.effect) {
      case 'bonus_draw':
        setPlayers(prev => prev.map(p => ({
          ...p,
          rack: [...p.rack, ...tileBag.splice(0, Math.min(2, tileBag.length))]
        })));
        break;

      case 'shuffle_rack':
        setPlayers(prev => prev.map(p => {
          const newBag = shuffleArray([...tileBag, ...p.rack]);
          const newRack = newBag.splice(0, 7);
          setTileBag(newBag);
          return { ...p, rack: newRack };
        }));
        break;

      case 'point_boost':
        setPointBoostActive(true);
        break;

      case 'mystery_powerup':
        const powerUp = POWER_UPS[Math.floor(Math.random() * POWER_UPS.length)];
        setPlayers(prev => prev.map((p, i) =>
          i === currentPlayer ? { ...p, powerUps: [...p.powerUps, powerUp] } : p
        ));
        break;

      case 'vowel_bonus':
        const vowels = ['A', 'E', 'I', 'O', 'U'];
        setPlayers(prev => prev.map(p => ({
          ...p,
          rack: [...p.rack,
            { letter: vowels[Math.floor(Math.random() * 5)], value: 1, id: `vowel_${Date.now()}_1` },
            { letter: vowels[Math.floor(Math.random() * 5)], value: 1, id: `vowel_${Date.now()}_2` }
          ]
        })));
        break;
    }

    setTimeout(() => setShowEvent(null), 3000);
  };

  // End game
  const endGame = () => {
    // Subtract remaining tile values
    const finalPlayers = players.map(p => ({
      ...p,
      score: p.score - p.rack.reduce((sum, t) => sum + t.value, 0)
    }));
    setPlayers(finalPlayers);
    setGameOver(true);

    const winner = finalPlayers[0].score > finalPlayers[1].score ? finalPlayers[0] : finalPlayers[1];
    setMessage(`🏆 ${winner.name} wins with ${winner.score} points!`);

    // Hub scoring
    addHubTeamScore(winner.team, 50, 'Word War', 'Won the game (+50)');
  };

  // Start screen
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-md w-full text-center text-white">
          <h1 className="text-4xl font-black mb-2">🔤 JON'S WORD WAR 🔤</h1>
          <p className="text-lg opacity-80 mb-8">Scrabble with Power-Ups!</p>

          <div className="space-y-4 mb-8">
            <input
              type="text"
              placeholder="Player 1 Name"
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 border border-white/30"
              id="player1"
              defaultValue="Player 1"
            />
            <input
              type="text"
              placeholder="Player 2 Name"
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 border border-white/30"
              id="player2"
              defaultValue="Player 2"
            />
          </div>

          <button
            onClick={() => {
              const p1 = document.getElementById('player1').value || 'Player 1';
              const p2 = document.getElementById('player2').value || 'Player 2';
              startGame([p1, p2]);
            }}
            className="w-full py-4 rounded-xl bg-white text-orange-600 font-bold text-xl hover:bg-orange-100 transition"
          >
            Start Game!
          </button>

          <button
            onClick={() => window.location.href = '../'}
            className="mt-4 w-full py-3 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-400 transition"
          >
            🏠 Back to Hub
          </button>
        </div>
      </div>
    );
  }

  const player = players[currentPlayer];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 p-2 md:p-4 text-white">
      {/* Random Event Modal */}
      {showEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-pop">
          <div className="bg-white text-black rounded-2xl p-8 text-center max-w-sm">
            <div className="text-5xl mb-4">🎲</div>
            <h2 className="text-2xl font-bold mb-2">{showEvent.name}</h2>
            <p className="text-gray-600">{showEvent.description}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-2 md:mb-4">
          <h1 className="text-xl md:text-2xl font-black">🔤 Jon's Word War</h1>
          <div className="flex gap-2">
            <span className="text-sm opacity-80">Tiles: {tileBag.length}</span>
            <button
              onClick={() => window.location.href = '../'}
              className="px-3 py-1 rounded-lg bg-purple-500 hover:bg-purple-400 text-sm font-semibold"
            >
              🏠 Hub
            </button>
          </div>
        </div>

        {/* Scoreboard */}
        <div className="grid grid-cols-2 gap-2 md:gap-4 mb-2 md:mb-4">
          {players.map((p, i) => (
            <div
              key={i}
              className={`rounded-xl p-3 md:p-4 ${i === currentPlayer ? 'bg-yellow-400 text-black ring-4 ring-white' : 'bg-white/20'}`}
            >
              <div className="font-bold text-lg">{p.name}</div>
              <div className="text-3xl font-black">{p.score}</div>
              {p.powerUps.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {p.powerUps.map((pu, j) => (
                    <span key={j} className="text-lg" title={pu.name}>{pu.emoji}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Message */}
        <div className="bg-black/30 rounded-xl p-3 mb-2 md:mb-4 text-center font-semibold">
          {message}
          {turnScore > 0 && <span className="ml-2 text-yellow-300">Preview: +{turnScore} pts</span>}
        </div>

        {/* Game Board */}
        <div className="flex flex-col lg:flex-row gap-2 md:gap-4">
          <div className="overflow-auto">
            <div
              className="grid gap-px bg-amber-800 p-1 rounded-lg"
              style={{
                gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(24px, 32px))`,
                width: 'fit-content'
              }}
            >
              {board.map((row, r) =>
                row.map((cell, c) => {
                  const type = getSquareType(r, c);
                  const isPlacedThisTurn = placedTiles.some(t => t.row === r && t.col === c);
                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => handleBoardClick(r, c)}
                      className={`
                        w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-xs font-bold
                        cursor-pointer transition-all rounded-sm
                        ${getSquareStyle(type, !!cell)}
                        ${isPlacedThisTurn ? 'ring-2 ring-yellow-400' : ''}
                        ${bombMode && cell ? 'hover:bg-red-400' : 'hover:brightness-110'}
                      `}
                    >
                      {cell ? (
                        <span className="text-black">
                          {cell.displayLetter || cell.letter}
                          <sub className="text-[8px]">{cell.value}</sub>
                        </span>
                      ) : (
                        <span className="text-[8px] opacity-70">{getSquareLabel(type)}</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="flex-1 space-y-2 md:space-y-4">
            {/* Current Player's Rack */}
            <div className="bg-white/10 rounded-xl p-3 md:p-4">
              <div className="text-sm font-semibold mb-2">{player.name}'s Tiles</div>
              <div className="flex gap-1 md:gap-2 flex-wrap">
                {player.rack.map((tile, i) => (
                  <button
                    key={tile.id}
                    onClick={() => selectTile(i)}
                    className={`
                      w-10 h-10 md:w-12 md:h-12 rounded-lg font-bold text-lg
                      flex items-center justify-center relative
                      ${selectedTile === i ? 'bg-yellow-400 text-black ring-2 ring-white' : 'bg-amber-100 text-black'}
                      ${swapMode && tilesToSwap.includes(i) ? 'ring-2 ring-red-500 bg-red-200' : ''}
                      hover:scale-105 transition-transform
                    `}
                  >
                    {tile.letter}
                    <sub className="absolute bottom-0.5 right-1 text-[10px]">{tile.value}</sub>
                  </button>
                ))}
              </div>
            </div>

            {/* Placed Tiles (undo) */}
            {placedTiles.length > 0 && (
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-sm font-semibold mb-2">Placed this turn (click to undo)</div>
                <div className="flex gap-1 flex-wrap">
                  {placedTiles.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => removePlacedTile(i)}
                      className="px-2 py-1 rounded bg-yellow-400 text-black text-sm font-semibold hover:bg-red-400"
                    >
                      {p.tile.displayLetter || p.tile.letter} ×
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Power-ups */}
            {player.powerUps.length > 0 && !swapMode && (
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-sm font-semibold mb-2">Power-Ups</div>
                <div className="flex gap-2 flex-wrap">
                  {player.powerUps.map((pu, i) => (
                    <button
                      key={i}
                      onClick={() => usePowerUp(i)}
                      className={`${pu.color} px-3 py-2 rounded-lg font-semibold text-sm hover:scale-105 transition flex items-center gap-1`}
                      title={pu.description}
                    >
                      {pu.emoji} {pu.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Swap Mode */}
            {swapMode && (
              <div className="bg-blue-500/30 rounded-xl p-3 border-2 border-blue-400">
                <div className="text-sm font-semibold mb-2">Swap Mode - Select tiles to swap</div>
                <div className="flex gap-2">
                  <button
                    onClick={confirmSwap}
                    className="px-4 py-2 rounded-lg bg-green-500 font-semibold hover:bg-green-400"
                  >
                    Confirm Swap ({tilesToSwap.length})
                  </button>
                  <button
                    onClick={() => { setSwapMode(false); setTilesToSwap([]); }}
                    className="px-4 py-2 rounded-lg bg-gray-500 font-semibold hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            {!gameOver && !swapMode && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={submitTurn}
                  disabled={placedTiles.length === 0}
                  className="px-6 py-3 rounded-xl bg-green-500 font-bold text-lg hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Word
                </button>
                <button
                  onClick={passTurn}
                  className="px-6 py-3 rounded-xl bg-gray-500 font-bold hover:bg-gray-400"
                >
                  Pass
                </button>
              </div>
            )}

            {/* Game Over */}
            {gameOver && (
              <div className="bg-yellow-400 text-black rounded-xl p-4 text-center">
                <div className="text-2xl font-black mb-2">🏆 Game Over!</div>
                <div className="text-lg font-semibold mb-4">
                  {players[0].score > players[1].score
                    ? `${players[0].name} wins!`
                    : players[1].score > players[0].score
                      ? `${players[1].name} wins!`
                      : "It's a tie!"}
                </div>
                <button
                  onClick={() => setGameStarted(false)}
                  className="px-6 py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-500"
                >
                  Play Again
                </button>
              </div>
            )}

            {/* Legend */}
            <div className="bg-white/10 rounded-xl p-3 text-xs">
              <div className="font-semibold mb-1">Board Legend:</div>
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1"><span className="w-4 h-4 bg-red-500 rounded"></span> TW (3× word)</span>
                <span className="flex items-center gap-1"><span className="w-4 h-4 bg-pink-300 rounded"></span> DW (2× word)</span>
                <span className="flex items-center gap-1"><span className="w-4 h-4 bg-blue-500 rounded"></span> TL (3× letter)</span>
                <span className="flex items-center gap-1"><span className="w-4 h-4 bg-cyan-300 rounded"></span> DL (2× letter)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
