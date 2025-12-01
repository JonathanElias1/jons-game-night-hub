import React, { useState, useEffect, useCallback, useRef } from 'react';

// Boggle dice (standard 4x4)
const DICE = [
  'AAEEGN', 'ABBJOO', 'ACHOPS', 'AFFKPS',
  'AOOTTW', 'CIMOTU', 'DEILRX', 'DELRVY',
  'DISTTY', 'EEGHNW', 'EEINSU', 'EHRTVW',
  'EIOSST', 'ELRTTY', 'HIMNQU', 'HLNNRZ'
];

// 5x5 Big Boggle dice
const BIG_DICE = [
  'AAAFRS', 'AAEEEE', 'AAFIRS', 'ADENNN', 'AEEEEM',
  'AEEGMU', 'AEGMNN', 'AFIRSY', 'BJKQXZ', 'CCNSTW',
  'CEIILT', 'CEILPT', 'CEIPST', 'DDLNOR', 'DHHLOR',
  'DHHNOT', 'DHLNOR', 'EIIITT', 'EMOTTT', 'ENSSSU',
  'FIPRSY', 'GORRVW', 'HIPRRY', 'NOOTUW', 'OOOTTU'
];

// Point values by word length
const POINTS = {
  3: 1,
  4: 1,
  5: 2,
  6: 3,
  7: 5,
  8: 11
};

// Common English words (simplified - production would use full dictionary)
const VALID_WORDS = new Set([
  // 3 letter words
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get',
  'has', 'him', 'his', 'how', 'its', 'let', 'may', 'new', 'now', 'old', 'see', 'way', 'who', 'boy', 'did', 'own', 'say',
  'she', 'two', 'war', 'cat', 'dog', 'run', 'eat', 'hot', 'big', 'red', 'sun', 'man', 'car', 'top', 'sit', 'set', 'put',
  'end', 'got', 'let', 'cut', 'ran', 'use', 'try', 'ask', 'win', 'arm', 'ago', 'air', 'bed', 'bad', 'box', 'bus', 'cup',
  'far', 'fun', 'gas', 'hat', 'hit', 'ice', 'job', 'key', 'leg', 'lot', 'map', 'met', 'mix', 'mud', 'net', 'odd', 'oil',
  'pet', 'pie', 'pop', 'pot', 'raw', 'rid', 'rob', 'row', 'rub', 'sad', 'sat', 'sea', 'sin', 'six', 'sky', 'son', 'sum',
  'tan', 'tax', 'tea', 'ten', 'tie', 'tip', 'toe', 'toy', 'van', 'war', 'wet', 'won', 'yes', 'yet', 'zoo', 'add', 'age',
  'aid', 'aim', 'ant', 'any', 'ape', 'art', 'ate', 'awl', 'axe', 'aye', 'ban', 'bar', 'bat', 'bay', 'bee', 'bet', 'bid',
  'bit', 'bow', 'bud', 'bug', 'bun', 'buy', 'cab', 'cam', 'cap', 'cob', 'cod', 'cog', 'cop', 'cot', 'cow', 'cry', 'cub',
  'cue', 'dam', 'den', 'dew', 'die', 'dig', 'dim', 'dip', 'doe', 'dot', 'dry', 'dub', 'dud', 'due', 'dug', 'dye', 'ear',
  'ego', 'elf', 'elk', 'elm', 'emu', 'era', 'eve', 'ewe', 'eye', 'fan', 'fat', 'fax', 'fed', 'fee', 'few', 'fig', 'fin',
  'fir', 'fit', 'fix', 'flu', 'fly', 'foe', 'fog', 'for', 'fox', 'fry', 'fur', 'gag', 'gap', 'gel', 'gem', 'gin', 'gnu',
  'god', 'gum', 'gun', 'gut', 'guy', 'gym', 'ham', 'hay', 'hem', 'hen', 'hid', 'him', 'hip', 'hog', 'hop', 'hub', 'hue',
  'hug', 'hum', 'hut', 'ink', 'inn', 'ion', 'ire', 'irk', 'its', 'ivy', 'jab', 'jag', 'jam', 'jar', 'jaw', 'jay', 'jet',
  'jig', 'jog', 'jot', 'joy', 'jug', 'jut', 'keg', 'kid', 'kin', 'kit', 'lab', 'lad', 'lag', 'lap', 'law', 'lay', 'led',
  'lid', 'lie', 'lip', 'lit', 'log', 'lop', 'low', 'lug', 'mad', 'mat', 'maw', 'men', 'mob', 'mop', 'mow', 'mug', 'nab',
  'nag', 'nap', 'nay', 'nil', 'nip', 'nit', 'nod', 'nor', 'not', 'nun', 'nut', 'oak', 'oar', 'oat', 'orb', 'ore', 'ounce',
  'owl', 'pad', 'pal', 'pan', 'pat', 'paw', 'pay', 'pea', 'peg', 'pen', 'pep', 'per', 'pew', 'pig', 'pin', 'pit', 'ply',
  'pod', 'pry', 'pub', 'pug', 'pun', 'pup', 'pus', 'rag', 'ram', 'ran', 'rap', 'rat', 'ray', 'ref', 'rib', 'rig', 'rim',
  'rip', 'rod', 'roe', 'rot', 'rug', 'rum', 'rut', 'rye', 'sac', 'sag', 'sap', 'saw', 'sob', 'sod', 'sop', 'sow', 'soy',
  'spa', 'spy', 'sub', 'sue', 'tab', 'tad', 'tag', 'tap', 'tar', 'tic', 'tin', 'ton', 'too', 'tow', 'tub', 'tug', 'urn',
  'vat', 'vet', 'via', 'vie', 'vow', 'wad', 'wag', 'wig', 'wit', 'woe', 'wok', 'yak', 'yam', 'yap', 'yaw', 'yen', 'yep',
  'yew', 'yin', 'yip', 'zap', 'zed', 'zig', 'zip', 'zit',
  // 4+ letter words
  'that', 'with', 'have', 'this', 'will', 'your', 'from', 'they', 'been', 'call', 'come', 'could', 'each', 'find',
  'first', 'give', 'good', 'just', 'know', 'like', 'long', 'look', 'made', 'make', 'many', 'more', 'most', 'much',
  'must', 'name', 'need', 'never', 'only', 'other', 'over', 'part', 'people', 'place', 'right', 'same', 'side',
  'small', 'some', 'still', 'such', 'take', 'tell', 'than', 'them', 'then', 'there', 'these', 'thing', 'think',
  'three', 'time', 'turn', 'under', 'upon', 'very', 'want', 'water', 'well', 'were', 'what', 'when', 'where',
  'which', 'while', 'word', 'work', 'world', 'would', 'write', 'year', 'also', 'back', 'before', 'being', 'both',
  'down', 'even', 'great', 'hand', 'here', 'high', 'home', 'house', 'into', 'last', 'left', 'life', 'line', 'little',
  'live', 'man', 'mean', 'might', 'move', 'next', 'night', 'number', 'often', 'once', 'order', 'own', 'page', 'play',
  'point', 'read', 'real', 'room', 'school', 'seem', 'self', 'show', 'since', 'sound', 'start', 'state', 'story',
  'study', 'sure', 'talk', 'thought', 'through', 'together', 'took', 'tree', 'try', 'until', 'used', 'using',
  'walk', 'watch', 'week', 'went', 'white', 'whole', 'without', 'words', 'year', 'young', 'game', 'team', 'win',
  'play', 'score', 'point', 'best', 'star', 'gold', 'fire', 'wind', 'rain', 'snow', 'moon', 'earth', 'love', 'hate',
  'friend', 'party', 'happy', 'funny', 'crazy', 'weird', 'cool', 'nice', 'great', 'awesome', 'super', 'mega',
  'jon', 'birthday', 'cake', 'gift', 'present',
]);

// Power-ups
const POWER_UPS = [
  { id: 'double_time', name: '+30 Seconds', description: 'Add 30 seconds to the clock', emoji: '⏱️', color: 'bg-blue-500' },
  { id: 'double_points', name: '2X Points', description: 'Double points for 20 seconds', emoji: '✨', color: 'bg-yellow-500' },
  { id: 'reveal_word', name: 'Reveal Word', description: 'Shows a valid word on the board', emoji: '👁️', color: 'bg-purple-500' },
  { id: 'freeze', name: 'Freeze Opponent', description: 'Opponent can\'t submit for 10 seconds', emoji: '🥶', color: 'bg-cyan-500' },
  { id: 'steal', name: 'Steal Points', description: 'Steal 5 points from opponent', emoji: '🦹', color: 'bg-red-500' },
  { id: 'bonus_letter', name: 'Bonus Letter', description: 'Q, X, Z worth triple points', emoji: '💎', color: 'bg-green-500' },
];

// Random events
const RANDOM_EVENTS = [
  { id: 'shake', name: 'SHAKE!', description: 'The board shakes and letters shuffle!', effect: 'shuffle' },
  { id: 'golden', name: 'Golden Round!', description: 'All words worth double for 15 seconds!', effect: 'double' },
  { id: 'vowel_boost', name: 'Vowel Boost!', description: 'Words with 3+ vowels get bonus points!', effect: 'vowels' },
  { id: 'race', name: 'Speed Race!', description: 'First to find a word gets +3 bonus!', effect: 'race' },
];

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

// Generate random board
function generateBoard(size = 4) {
  const dice = size === 4 ? DICE : BIG_DICE;
  const shuffled = [...dice].sort(() => Math.random() - 0.5);
  const board = [];

  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      const die = shuffled[i * size + j];
      const face = die[Math.floor(Math.random() * 6)];
      row.push(face === 'Q' ? 'Qu' : face);
    }
    board.push(row);
  }

  return board;
}

// Check if positions are adjacent
function isAdjacent(pos1, pos2) {
  const rowDiff = Math.abs(pos1.row - pos2.row);
  const colDiff = Math.abs(pos1.col - pos2.col);
  return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
}

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState('vs'); // 'vs' or 'solo'
  const [boardSize, setBoardSize] = useState(4);
  const [players, setPlayers] = useState([
    { name: 'Player 1', team: 'A', score: 0, words: [], powerUps: [], frozen: false },
    { name: 'Player 2', team: 'B', score: 0, words: [], powerUps: [], frozen: false }
  ]);
  const [board, setBoard] = useState([]);
  const [selectedPath, setSelectedPath] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [allFoundWords, setAllFoundWords] = useState(new Set());
  const [showEvent, setShowEvent] = useState(null);
  const [doublePointsActive, setDoublePointsActive] = useState(false);
  const [bonusLetterActive, setBonusLetterActive] = useState(false);
  const [revealedWord, setRevealedWord] = useState(null);
  const [shakeBoard, setShakeBoard] = useState(false);
  const timerRef = useRef(null);

  // Start game
  const startGame = useCallback((playerNames, mode, size) => {
    const newBoard = generateBoard(size);
    setBoard(newBoard);
    setBoardSize(size);
    setGameMode(mode);

    const newPlayers = mode === 'solo'
      ? [{ name: playerNames[0], team: 'A', score: 0, words: [], powerUps: [POWER_UPS[0]], frozen: false }]
      : playerNames.map((name, i) => ({
          name,
          team: i === 0 ? 'A' : 'B',
          score: 0,
          words: [],
          powerUps: [POWER_UPS[Math.floor(Math.random() * POWER_UPS.length)]],
          frozen: false
        }));

    setPlayers(newPlayers);
    setSelectedPath([]);
    setCurrentWord('');
    setTimeLeft(180);
    setGameOver(false);
    setGameStarted(true);
    setAllFoundWords(new Set());
    setCurrentPlayer(0);
    setMessage('Find words by connecting adjacent letters!');
  }, []);

  // Load hub data
  useEffect(() => {
    const hubData = loadHubData();
    if (hubData && hubData.players && hubData.players.length >= 2) {
      const teamA = hubData.players.filter(p => p.team === 'A').map(p => p.name);
      const teamB = hubData.players.filter(p => p.team === 'B').map(p => p.name);
      if (teamA.length > 0 && teamB.length > 0) {
        startGame([teamA[0], teamB[0]], 'vs', 4);
      }
    }
  }, [startGame]);

  // Timer
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setGameOver(true);
          return 0;
        }

        // Random event (5% chance per second)
        if (Math.random() < 0.02 && prev > 30) {
          triggerRandomEvent();
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameStarted, gameOver]);

  // Handle letter click
  const handleLetterClick = (row, col) => {
    if (gameOver) return;
    if (players[currentPlayer]?.frozen) {
      setMessage('🥶 You are frozen!');
      return;
    }

    const pos = { row, col };
    const letter = board[row][col];

    // Check if already in path
    const existingIndex = selectedPath.findIndex(p => p.row === row && p.col === col);

    if (existingIndex !== -1) {
      // If clicking last letter, keep it; if clicking earlier, truncate path
      if (existingIndex === selectedPath.length - 1) {
        return;
      }
      const newPath = selectedPath.slice(0, existingIndex + 1);
      setSelectedPath(newPath);
      setCurrentWord(newPath.map(p => board[p.row][p.col]).join(''));
      return;
    }

    // Check if adjacent to last letter (or first letter)
    if (selectedPath.length > 0 && !isAdjacent(selectedPath[selectedPath.length - 1], pos)) {
      return;
    }

    const newPath = [...selectedPath, pos];
    setSelectedPath(newPath);
    setCurrentWord(newPath.map(p => board[p.row][p.col]).join(''));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedPath([]);
    setCurrentWord('');
  };

  // Submit word
  const submitWord = () => {
    if (currentWord.length < 3) {
      setMessage('Words must be at least 3 letters!');
      setShakeBoard(true);
      setTimeout(() => setShakeBoard(false), 500);
      clearSelection();
      return;
    }

    const wordLower = currentWord.toLowerCase().replace('qu', 'q');

    if (allFoundWords.has(wordLower)) {
      setMessage('Word already found!');
      setShakeBoard(true);
      setTimeout(() => setShakeBoard(false), 500);
      clearSelection();
      return;
    }

    if (!VALID_WORDS.has(wordLower)) {
      setMessage(`"${currentWord}" is not a valid word!`);
      setShakeBoard(true);
      setTimeout(() => setShakeBoard(false), 500);
      clearSelection();
      return;
    }

    // Calculate points
    let points = POINTS[Math.min(currentWord.length, 8)] || 11;

    // Bonus for rare letters
    if (bonusLetterActive && /[QXZ]/i.test(currentWord)) {
      points *= 3;
    }

    // Double points
    if (doublePointsActive) {
      points *= 2;
    }

    // Update player
    setPlayers(prev => prev.map((p, i) => {
      if (i !== currentPlayer) return p;
      return {
        ...p,
        score: p.score + points,
        words: [...p.words, { word: currentWord, points }]
      };
    }));

    setAllFoundWords(prev => new Set([...prev, wordLower]));
    setMessage(`+${points} for "${currentWord}"!`);

    // Random power-up reward (10% chance)
    if (Math.random() < 0.1) {
      const newPowerUp = POWER_UPS[Math.floor(Math.random() * POWER_UPS.length)];
      setPlayers(prev => prev.map((p, i) =>
        i === currentPlayer ? { ...p, powerUps: [...p.powerUps, newPowerUp] } : p
      ));
      setMessage(`+${points}! 🎁 Earned ${newPowerUp.name}!`);
    }

    clearSelection();

    // In VS mode, switch players after each word
    if (gameMode === 'vs') {
      setCurrentPlayer(prev => (prev + 1) % 2);
    }
  };

  // Use power-up
  const usePowerUp = (index) => {
    const player = players[currentPlayer];
    const powerUp = player.powerUps[index];

    switch (powerUp.id) {
      case 'double_time':
        setTimeLeft(prev => prev + 30);
        setMessage('⏱️ +30 seconds added!');
        break;

      case 'double_points':
        setDoublePointsActive(true);
        setTimeout(() => setDoublePointsActive(false), 20000);
        setMessage('✨ Double points for 20 seconds!');
        break;

      case 'reveal_word':
        const validWord = findValidWord();
        if (validWord) {
          setRevealedWord(validWord);
          setTimeout(() => setRevealedWord(null), 5000);
          setMessage(`👁️ Found: "${validWord.word}"`);
        }
        break;

      case 'freeze':
        if (gameMode === 'vs') {
          const opponentIndex = (currentPlayer + 1) % 2;
          setPlayers(prev => prev.map((p, i) =>
            i === opponentIndex ? { ...p, frozen: true } : p
          ));
          setTimeout(() => {
            setPlayers(prev => prev.map(p => ({ ...p, frozen: false })));
          }, 10000);
          setMessage(`🥶 ${players[opponentIndex].name} is frozen for 10 seconds!`);
        }
        break;

      case 'steal':
        if (gameMode === 'vs') {
          const opponentIndex = (currentPlayer + 1) % 2;
          setPlayers(prev => prev.map((p, i) => {
            if (i === currentPlayer) return { ...p, score: p.score + 5 };
            if (i === opponentIndex) return { ...p, score: Math.max(0, p.score - 5) };
            return p;
          }));
          setMessage('🦹 Stole 5 points!');
        }
        break;

      case 'bonus_letter':
        setBonusLetterActive(true);
        setTimeout(() => setBonusLetterActive(false), 30000);
        setMessage('💎 Q, X, Z worth triple for 30 seconds!');
        break;
    }

    // Remove used power-up
    setPlayers(prev => prev.map((p, i) => {
      if (i !== currentPlayer) return p;
      const newPowerUps = [...p.powerUps];
      newPowerUps.splice(index, 1);
      return { ...p, powerUps: newPowerUps };
    }));
  };

  // Find a valid word on the board (for reveal power-up)
  const findValidWord = () => {
    const size = board.length;
    const found = [];

    const dfs = (row, col, path, word) => {
      if (word.length >= 3 && VALID_WORDS.has(word.toLowerCase()) && !allFoundWords.has(word.toLowerCase())) {
        found.push({ word, path: [...path] });
      }
      if (word.length >= 6) return;

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = row + dr;
          const nc = col + dc;
          if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
          if (path.some(p => p.row === nr && p.col === nc)) continue;
          dfs(nr, nc, [...path, { row: nr, col: nc }], word + board[nr][nc]);
        }
      }
    };

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        dfs(r, c, [{ row: r, col: c }], board[r][c]);
      }
    }

    return found.length > 0 ? found[Math.floor(Math.random() * found.length)] : null;
  };

  // Trigger random event
  const triggerRandomEvent = () => {
    const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
    setShowEvent(event);

    switch (event.effect) {
      case 'shuffle':
        setShakeBoard(true);
        setTimeout(() => {
          setBoard(generateBoard(boardSize));
          setSelectedPath([]);
          setCurrentWord('');
          setShakeBoard(false);
        }, 500);
        break;

      case 'double':
        setDoublePointsActive(true);
        setTimeout(() => setDoublePointsActive(false), 15000);
        break;

      case 'vowels':
        // Handled in scoring
        break;

      case 'race':
        // First word gets bonus (handled by message)
        break;
    }

    setTimeout(() => setShowEvent(null), 3000);
  };

  // Format time
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // End game scoring
  useEffect(() => {
    if (gameOver && gameMode === 'vs') {
      const winner = players[0].score > players[1].score ? players[0] : players[1];
      addHubTeamScore(winner.team, 50, 'Boggle Blitz', 'Won the game (+50)');
    }
  }, [gameOver, players, gameMode]);

  // Start screen
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-teal-600 to-cyan-700 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-md w-full text-center text-white">
          <h1 className="text-4xl font-black mb-2">🎲 BOGGLE BLITZ 🎲</h1>
          <p className="text-lg opacity-80 mb-6">Find words. Score points. Beat your friends!</p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-1">Game Mode</label>
              <select
                value={gameMode}
                onChange={(e) => setGameMode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/20 text-white border border-white/30"
              >
                <option value="vs" className="text-black">VS Mode (2 Players)</option>
                <option value="solo" className="text-black">Solo Mode</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Board Size</label>
              <select
                value={boardSize}
                onChange={(e) => setBoardSize(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-white/20 text-white border border-white/30"
              >
                <option value={4} className="text-black">4x4 (Classic)</option>
                <option value={5} className="text-black">5x5 (Big Boggle)</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Player 1 Name"
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 border border-white/30"
              id="player1"
              defaultValue="Player 1"
            />
            {gameMode === 'vs' && (
              <input
                type="text"
                placeholder="Player 2 Name"
                className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 border border-white/30"
                id="player2"
                defaultValue="Player 2"
              />
            )}
          </div>

          <button
            onClick={() => {
              const p1 = document.getElementById('player1').value || 'Player 1';
              const p2 = gameMode === 'vs' ? (document.getElementById('player2')?.value || 'Player 2') : '';
              startGame(gameMode === 'vs' ? [p1, p2] : [p1], gameMode, boardSize);
            }}
            className="w-full py-4 rounded-xl bg-white text-teal-600 font-bold text-xl hover:bg-teal-100 transition"
          >
            Start Game!
          </button>

          <button
            onClick={() => window.location.href = '../'}
            className="mt-4 w-full py-3 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-400 transition"
          >
            🏠 Back to Hub
          </button>

          <div className="mt-6 text-sm opacity-80">
            <div className="font-semibold mb-1">Scoring:</div>
            <div>3-4 letters: 1pt • 5 letters: 2pts • 6 letters: 3pts</div>
            <div>7 letters: 5pts • 8+ letters: 11pts</div>
          </div>
        </div>
      </div>
    );
  }

  const player = players[currentPlayer] || players[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-teal-600 to-cyan-700 p-2 md:p-4 text-white">
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

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl md:text-2xl font-black">🎲 Boggle Blitz</h1>
          <button
            onClick={() => window.location.href = '../'}
            className="px-3 py-1 rounded-lg bg-purple-500 hover:bg-purple-400 text-sm font-semibold"
          >
            🏠 Hub
          </button>
        </div>

        {/* Timer & Scores */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* Player 1 */}
          <div className={`rounded-xl p-3 ${currentPlayer === 0 ? 'bg-yellow-400 text-black ring-2 ring-white' : 'bg-white/20'} ${players[0]?.frozen ? 'opacity-50' : ''}`}>
            <div className="font-bold text-sm truncate">{players[0]?.name}</div>
            <div className="text-2xl font-black">{players[0]?.score || 0}</div>
            <div className="text-xs opacity-70">{players[0]?.words?.length || 0} words</div>
          </div>

          {/* Timer */}
          <div className={`rounded-xl p-3 bg-black/30 text-center ${timeLeft <= 30 ? 'animate-countdown' : ''}`}>
            <div className="text-xs opacity-70">Time</div>
            <div className={`text-3xl font-black ${timeLeft <= 30 ? 'text-red-400' : ''}`}>
              {formatTime(timeLeft)}
            </div>
            {doublePointsActive && <div className="text-yellow-300 text-xs">✨ 2X POINTS!</div>}
          </div>

          {/* Player 2 (if VS mode) */}
          {gameMode === 'vs' ? (
            <div className={`rounded-xl p-3 ${currentPlayer === 1 ? 'bg-yellow-400 text-black ring-2 ring-white' : 'bg-white/20'} ${players[1]?.frozen ? 'opacity-50' : ''}`}>
              <div className="font-bold text-sm truncate">{players[1]?.name}</div>
              <div className="text-2xl font-black">{players[1]?.score || 0}</div>
              <div className="text-xs opacity-70">{players[1]?.words?.length || 0} words</div>
            </div>
          ) : (
            <div className="rounded-xl p-3 bg-white/20">
              <div className="font-bold text-sm">Best Word</div>
              <div className="text-lg font-black truncate">
                {players[0]?.words?.sort((a, b) => b.points - a.points)[0]?.word || '-'}
              </div>
            </div>
          )}
        </div>

        {/* Message */}
        <div className="bg-black/30 rounded-xl p-2 mb-4 text-center font-semibold text-sm">
          {message}
        </div>

        {/* Current Word */}
        <div className="bg-white/20 rounded-xl p-3 mb-4 text-center">
          <div className="text-3xl font-black tracking-wider min-h-[40px]">
            {currentWord || <span className="opacity-30">Select letters...</span>}
          </div>
        </div>

        {/* Game Board */}
        <div className={`flex justify-center mb-4 ${shakeBoard ? 'animate-shake' : ''}`}>
          <div
            className="grid gap-2 p-3 bg-amber-800 rounded-xl"
            style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)` }}
          >
            {board.map((row, r) =>
              row.map((letter, c) => {
                const isSelected = selectedPath.some(p => p.row === r && p.col === c);
                const isRevealed = revealedWord?.path?.some(p => p.row === r && p.col === c);
                const selectIndex = selectedPath.findIndex(p => p.row === r && p.col === c);

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleLetterClick(r, c)}
                    className={`
                      w-14 h-14 md:w-16 md:h-16 rounded-xl font-black text-2xl
                      flex items-center justify-center
                      transition-all duration-150
                      ${isSelected
                        ? 'bg-yellow-400 text-black scale-110 ring-2 ring-white'
                        : isRevealed
                          ? 'bg-purple-400 text-white animate-pulse-green'
                          : 'bg-amber-100 text-black hover:bg-amber-200'}
                    `}
                  >
                    {letter}
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                        {selectIndex + 1}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Actions */}
        {!gameOver && (
          <div className="flex gap-2 justify-center mb-4">
            <button
              onClick={submitWord}
              disabled={currentWord.length < 3 || player?.frozen}
              className="px-8 py-3 rounded-xl bg-green-500 font-bold text-lg hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Word
            </button>
            <button
              onClick={clearSelection}
              className="px-6 py-3 rounded-xl bg-gray-500 font-bold hover:bg-gray-400"
            >
              Clear
            </button>
          </div>
        )}

        {/* Power-ups */}
        {player?.powerUps?.length > 0 && !gameOver && (
          <div className="bg-white/10 rounded-xl p-3 mb-4">
            <div className="text-sm font-semibold mb-2">Power-Ups</div>
            <div className="flex gap-2 flex-wrap justify-center">
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

        {/* Words Found */}
        <div className="bg-white/10 rounded-xl p-3 mb-4">
          <div className="text-sm font-semibold mb-2">Words Found ({allFoundWords.size})</div>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
            {[...allFoundWords].map(word => (
              <span key={word} className="px-2 py-1 bg-white/20 rounded text-xs font-semibold uppercase">
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* Game Over */}
        {gameOver && (
          <div className="bg-yellow-400 text-black rounded-xl p-6 text-center">
            <div className="text-3xl font-black mb-2">🏆 Time's Up!</div>
            {gameMode === 'vs' ? (
              <div className="text-xl font-semibold mb-4">
                {players[0].score > players[1].score
                  ? `${players[0].name} wins!`
                  : players[1].score > players[0].score
                    ? `${players[1].name} wins!`
                    : "It's a tie!"}
              </div>
            ) : (
              <div className="text-xl font-semibold mb-4">
                Final Score: {players[0].score} points ({players[0].words.length} words)
              </div>
            )}
            <button
              onClick={() => setGameStarted(false)}
              className="px-8 py-3 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-500"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
