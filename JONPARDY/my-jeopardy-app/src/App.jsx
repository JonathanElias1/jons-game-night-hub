import React, { useState, useEffect, useCallback, useRef } from 'react';
import { isAnswerMatch, normalize } from './utils/answerMatching';

// --- Hub Scoring Integration ---
function getHubData() {
  try {
    const saved = localStorage.getItem('jonsGameNightData');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load hub data:', e);
  }
  return null;
}

function addHubTeamScore(team, points, gameName) {
  // team is 'A' or 'B'
  if (!window.GameNightScoring) return;
  window.GameNightScoring.addTeamScore(team, points, gameName, `+${points} pts`);
}

function addHubPlayerScore(playerName, points, gameName, description) {
  if (!window.GameNightScoring) return;
  // Validate playerName before sending to hub (hub uses name, not ID)
  if (!playerName || playerName === 'undefined') {
    console.warn('JONpardy: Invalid playerName, skipping hub score update');
    return;
  }
  window.GameNightScoring.addScore(playerName, points, gameName, description);
}

// Convert question dollar value to hub points (scaled: $200 = 2pts, $1000 = 10pts)
function dollarToHubPoints(dollars) {
  return Math.round(dollars / 100);
}

// --- Game Data ---
const JONpardyData = {
  categories: [
    { name: "Culinary", questions: [
        { points: 200, question: "JON FOOD's first video featured this delectable red fruit.", answer: "Tomato", aliases: ["tomatoes", "tomatoe", "a tomato"] },
        { points: 400, question: "According to Jon, this is the worst form of chicken.", answer: "Shredded", aliases: ["shredded chicken", "shreaded", "shredded meat"] },
        { points: 600, question: "Jon is known for these famous ____ Nights.", answer: "Meat", aliases: ["meat night", "meatnight"] },
        { points: 800, question: "Baking for his first time, Jon decided to master this food for Cody who had the key to his heart.", answer: "Key Lime Pie", aliases: ["keylime pie", "key lime", "keylime", "lime pie"] },
        { points: 1000, question: "JON tried and loved this controversial food in a Southeast Asian Country. 1 word!", answer: "Durian", aliases: ["durion", "dorian", "durien"] },
    ]},
    { name: "Geography", questions: [
        { points: 200, question: "Jon made a detailed itinerary for this Southeast Asian country.", answer: "Thailand", aliases: ["tailand", "thai land", "thai"] },
        { points: 400, question: "A small country known for its feud with all of its neighbors.", answer: "Israel", aliases: ["isreal", "izrael", "the holy land"] },
        { points: 600, question: "When Jon visited this European country, known for being the worlds largest wine producer, everybody thought he was a native.", answer: "Italy", aliases: ["italia", "italian"] },
        { points: 800, question: "This 'Wolverine State' features a city where your story begins, _______ city.", answer: "Minden", aliases: ["minden city", "minden michigan"] },
        { points: 1000, question: "Jon's documentary premiered in this major U.S. borough.", answer: "Manhattan", aliases: ["manhatten", "new york", "nyc"] },
    ]},
    { name: "Television", questions: [
        { points: 200, question: "This classic 1 word show which Jon describes as the most entertaining, involves a serial killer who kills bad guys.", answer: "Dexter", aliases: ["dextor", "dxter"] },
        { points: 400, question: "This popular 2017 tv show on Netflix featuring the profiling of serial killers was on a roll for its first 2 seasons until David Lynch forgot about it.", answer: "Mindhunter", aliases: ["mind hunter", "mindhunters"] },
        { points: 600, question: "In a 'Stark' contrast to Breaking Bad this popular tv show featuring dragons, magic, and rape ended on a bad note", answer: "Game of Thrones", aliases: ["got", "gameofthrones", "game of throne"] },
        { points: 800, question: "This old comedy show with a very unique theme song features a man who doesn't know how to open doors.", answer: "Seinfeld", aliases: ["seinfield", "sienfeld", "signfeld"] },
        { points: 1000, question: "Basic people love saying they LOVE this tv show on dating apps", answer: "The Office", aliases: ["office", "theoffice"] },
    ]},
    { name: "JONNISMS", questions: [
        { points: 200, question: "This popular Jon saying about abuse became notorious through an organization called Crysalis.", answer: "No abuse is okay", aliases: ["no abuse is ok", "abuse is not okay", "no abuse"] },
        { points: 400, question: "Jon says this when calling pals to verify his identity for security purposes.", answer: "Hi this is Jon", aliases: ["hi its jon", "hello this is jon", "this is jon"] },
        { points: 600, question: "Instead of sending prayers, Jon frequently sends this to pals.", answer: "Thoughts", aliases: ["thought", "thots", "thinking of you"] },
        { points: 800, question: "A popular YouTube channel called JonFood has an amazing host who says this at the start of almost every Jon Food video.", answer: "Hey Jon Fooders", aliases: ["hey jonfooders", "hi jon fooders", "jon fooders"] },
        { points: 1000, question: "After Jon met Cody, who loves knitting, he started saying this to show his love.", answer: "I love knitters", aliases: ["love knitters", "i love knitter", "iloveknitters"] },
    ]},
    { name: "MOVIES", questions: [
        { points: 200, question: "This popular movie features Leonardo Di Caprio taking quaaludes in a pool.", answer: "Wolf of Wall Street", aliases: ["the wolf of wall street", "wolfofwallstreet", "wolf on wall street"] },
        { points: 400, question: "This movie featuring actors in blueface is the highest-grossing film of all time (unadjusted for inflation).", answer: "Avatar", aliases: ["avitar", "avatr"] },
        { points: 600, question: "This movie has Jon's favorite movie plot. It features a man with memory loss trying to hunt clues to solve a mystery. Made by the same director who made Interstellar.", answer: "Memento", aliases: ["momento", "mamento"] },
        { points: 800, question: "This Office Comedy movie features a slow motion printer battle.", answer: "Office Space", aliases: ["officespace", "the office space"] },
        { points: 1000, question: "In 'The Hobbit', this is the name of the funny looking guy, He's also known as the dwarf who wrote the Book of Mazarbul found by the Fellowship in Moria.", answer: "Ori", aliases: ["oree", "orie"] },
    ]},
  ],
};

const doubleJONpardyData = {
    categories: [
      { name: "HARD MATH", questions: [
          { points: 400, question: "This famous English mathematician is often credited as the inventor of calculus and also gave his name to three laws of motion.", answer: "Isaac Newton", aliases: ["newton", "sir isaac newton", "issac newton"] },
          { points: 800, question: "In algebra class, this formula gives the solutions to ax² + bx + c = 0 and is often sung as 'x equals negative b, plus or minus the square root of b squared minus 4ac, all over 2a.", answer: "quadratic formula", aliases: ["the quadratic formula", "quadradic formula", "quadratic equation"] },
          { points: 1200, question: "This integration technique comes from the product rule for derivatives and is summarized by the formula: integral of u dv equals uv minus integral of v du.", answer: "integration by parts", aliases: ["by parts", "intergration by parts"] },
          { points: 1600, question: "In right triangle trigonometry, this function is remembered as 'opposite over hypotenuse' in the SOHCAHTOA mnemonic.", answer: "sine", aliases: ["sin", "syne"] },
          { points: 2000, question: "A right triangle has legs of length 5 and 12. Using the Pythagorean theorem you learned in school, this is the length of the hypotenuse.", answer: "13", aliases: ["thirteen"] },
      ]},
      { name: "MAKEUP", questions: [
          { points: 400, question: "This speedy step that takes about 1 minute—just a swipe or two to wake up the eyes.", answer: "Mascara", aliases: ["mascarra", "eye mascara"] },
          { points: 800, question: "Taking about 2 minutes, this step evens out the skin tone before anything else goes on.", answer: "Foundation", aliases: ["foundaton", "makeup foundation"] },
          { points: 1200, question: "At roughly 3 minutes, this step adds shape back into the cheeks using powders, sticks, or creams.", answer: "Contouring", aliases: ["contour", "contoring", "countouring"] },
          { points: 1600, question: "This colorful ritual requires multiple shades, three brushes minimum, and the blending dedication of someone buffing a rare gemstone. One wrong swipe and you start the whole lid over.", answer: "eyeshadow", aliases: ["eye shadow", "eye-shadow", "eyeshadows"] },
          { points: 2000, question: "Often saved for last, this step can take the longest—one slip outside the lines and you're redoing half your face.", answer: "Lipstick", aliases: ["lip stick", "lipstik", "lips"] },
      ]},
      { name: "BOARD GAMES", questions: [
          { points: 400, question: "This board game features an old man with a monacle as its logo.", answer: "Monopoly", aliases: ["monopoli", "monoply"] },
          { points: 800, question: "This board game involves using dice to gather resources to build roads, settlements, and cities. You can also buy development cards.", answer: "Catan", aliases: ["settlers of catan", "cataan", "settlers"] },
          { points: 1200, question: "This 4 x 4 grid board game involves players conecting letters to make words.", answer: "Boggle", aliases: ["bogle", "boogle"] },
          { points: 1600, question: "Scorned from PTSD in past experiences from an english teacher who made fun of him for being bad at this game, Jon overcame the abuse beat her and has never lost this game since as a result.", answer: "Scrabble", aliases: ["scrable", "scrabel"] },
          { points: 2000, question: "The goal of this Hasbro published 1963 game is to be the last one standing after activating traps", answer: "Mousetrap", aliases: ["mouse trap", "mouse-trap"] },
      ]},
      { name: "DIABETES", questions: [
        { points: 400, question: "This organ, located behind the stomach, produces the hormone insulin.", answer: "pancreas", aliases: ["the pancreas", "pancrias", "pancrease"] },
        { points: 800, question: "This hormone helps move glucose from the bloodstream into the body's cells for energy.", answer: "insulin", aliases: ["insuline", "insolin"] },
        { points: 1200, question: "In this type of diabetes, the body's immune system destroys the insulin-producing cells in the pancreas.", answer: "Type 1", aliases: ["type 1 diabetes", "type one", "t1d", "type1"] },
        { points: 1600, question: "This blood test, often reported as a percentage, shows average blood sugar levels over the past two to three months.", answer: "A1C", aliases: ["a1c test", "hba1c", "hemoglobin a1c"] },
        { points: 2000, question: "This serious complication of diabetes involves very high blood sugar and a buildup of acids called ketones, and can be life-threatening if untreated.", answer: "ketoacidosis", aliases: ["diabetic ketoacidosis", "dka", "keto acidosis"] },
    ]},
      { name: "VIDEO GAMES", questions: [
          { points: 400, question: "This shitty simulation franchise features Orange Juice, B-Fresh, BO$$ Key Yacht$, Michael B Jordan, and Ronnie.", answer: "NBA 2K", aliases: ["nba2k", "2k", "nba 2k24", "nba 2k25"] },
          { points: 800, question: "This walking simulator stars Stanley.", answer: "The Stanley Parable", aliases: ["stanley parable", "stanleyparable"] },
          { points: 1200, question: "This virtual reality rhythm game lets you slash the tunes away.", answer: "Beat Saber", aliases: ["beatsaber", "beat sabre"] },
          { points: 1600, question: "This game has you shouting stuff at dragons. Fus Ro Dah", answer: "Skyrim", aliases: ["elder scrolls skyrim", "the elder scrolls skyrim", "skryim"] },
          { points: 2000, question: "This action adventure video game franchise follows Kratos.", answer: "God of War", aliases: ["godofwar", "god of war ragnarok"] },
      ]},
    ],
  };

const tripleJONpardyData = {
    categories: [
      { name: "STAR WARS", questions: [
          { points: 100, question: "The original name for this green character in The Empire Strikes Back before George Lucas chickened out was this?", answer: "Minch", aliases: ["minch yoda", "yoda minch"] },
          { points: 200, question: "What is the name of the creature living in the trash compactor of the Death Star in A New Hope?", answer: "Dianoga", aliases: ["dianoga", "dianooga", "trash monster", "garbage squid"] },
          { points: 300, question: "According to C-3PO, the odds of successfully navigating an asteroid field are __________ to 1.", answer: "3720", aliases: ["3,720", "3720 to 1", "3720 to one"] },
          { points: 400, question: "This upbeat, swinging style, played by the Bith alien band, Figrin D'an and the Modal Nodes, in the Mos Eisley Cantina in Episode IV: A New Hope played this music genre", answer: "Jizz", aliases: ["jatz", "cantina music"] },
          { points: 500, question: "To keep costs down and fans away, Return of the Jedi was shot under this fake horror-movie title with the tagline 'Horror Beyond Imagination.'", answer: "Blue Harvest", aliases: ["blueharvest", "blue harvest horror"] },
      ]},
      { name: "PSYCHOLOGY", questions: [
          { points: 100, question: "In Mary Ainsworth's Strange Situation, this specific attachment style is characterized by minimal distress at separation and active avoidance of the caregiver upon reunion.", answer: "Anxious-avoidant attachment", aliases: ["avoidant", "avoidant attachment", "anxious avoidant", "insecure avoidant"] },
          { points: 200, question: "In Mischel's original delay of gratification research at Stanford, this common preschool treat was famously used as the main reward in the 'one now vs two later' condition.", answer: "Marshmallow", aliases: ["marshmellows", "marshmallow test", "marshmallows"] },
          { points: 300, question: "This specific cognitive bias explains why people with low ability in a domain overestimate their competence, while those with high ability sometimes underestimate theirs.", answer: "Dunning–Kruger effect", aliases: ["dunning kruger", "dunning-kruger", "dunning kruger effect", "dk effect"] },
          { points: 400, question: "This phenomenon, shown in Rensink's flicker paradigm, is the difficulty detecting large changes between alternating images separated by a brief blank screen.", answer: "change blindness", aliases: ["changeblindness", "inattentional blindness"] },
          { points: 500, question: "This disorder, often following right parietal damage, leads patients to ignore or fail to respond to stimuli on the opposite side of space, such as only shaving half their face.", answer: "hemispatial neglect", aliases: ["neglect", "unilateral neglect", "spatial neglect", "hemineglect", "hemi-neglect"] },
      ]},
      { name: "ABCU", questions: [
          { points: 100, question: "This iconic classic ABCU movie started it all and features slam dunks as our main character carries the Timberwolves to the promised land.", answer: "Air Bud", aliases: ["airbud", "air-bud"] },
          { points: 200, question: "This classic christmas movie features the classic puppy cast rescuing crying unadopted kids.", answer: "The Search for Santa Paws", aliases: ["search for santa paws", "santa paws", "santapaws"] },
          { points: 300, question: "This classic film is highly regarded as the most successful volleyball film of all time.", answer: "Air Bud Spikes Back", aliases: ["spikes back", "air bud volleyball", "airbud spikes back"] },
          { points: 400, question: "This classic superhero movie features Zendaya", answer: "Super Buddies", aliases: ["superbuddies", "super buddies movie"] },
          { points: 500, question: "In this classic ABCU film the iconic quote 'What's hip hop happening' is said by B-DAWG.", answer: "Space Buddies", aliases: ["spacebuddies", "space buddies movie"] },
      ]},
      { name: "PHOENIX SUNS", questions: [
          { points: 100, question: "In 2010 in the Western Conference Semifinals against dirty San Antonio, this mvp dominated leading to an easy sweep despite having a completely swollen shut right eye.", answer: "Steve Nash", aliases: ["nash", "steven nash"] },
          { points: 200, question: "In Game 6 of the 1993 Western Conference Semifinals at the Alamodome, this league MVP hit the series-clinching jumper over David Robinson with the score tied 100–100, eliminating San Antonio 4–2.", answer: "Charles Barkley", aliases: ["barkley", "sir charles", "chuck"] },
          { points: 300, question: "On January 17, 2022, this Suns star posted his single-game high against San Antonio with 48 points in a win over the Spurs.", answer: "Devin Booker", aliases: ["booker", "book", "d book", "dbook"] },
          { points: 400, question: "On November 24, 2025, the Suns beat the Spurs 111–102 as this player scored 25 and his teammate Devin Booker dropped 24 points.", answer: "Dillon Brooks", aliases: ["brooks", "dillon", "d brooks"] },
          { points: 500, question: "On April 6, 1994, this Suns point guard dished a franchise-record 25 assists in a win over the Spurs.", answer: "Kevin Johnson", aliases: ["kj", "k johnson"] },
      ]},
      { name: "BIG PERSONALITIES", questions: [
          { points: 100, question: "This movie featuring Gary Oldman in the role of a lifetime also showcases this famous actor known for his work on Dexter and Game of Thrones.", answer: "Peter Dinklage", aliases: ["dinklage", "dinkalge", "tyrion"] },
          { points: 200, question: "This English actor with spondyloepiphyseal dysplasia congenital starred in Willow and played multiple roles in the Harry Potter films, including Professor Flitwick.", answer: "Warwick Davis", aliases: ["davis", "warrick davis", "wicket"] },
          { points: 300, question: "Best known as Mini-Me in the Austin Powers films, this American actor was 2 ft 8 in tall and had cartilage–hair hypoplasia.", answer: "Verne Troyer", aliases: ["troyer", "vern troyer", "mini me"] },
      ]},
    ],
  };

const finalJONpardyData = {
    category: "JON",
    question: "Pronounced like a pirate mistakenly by ASU at his graduation, what is Jon's middle name?",
    answer: "Yair",
    aliases: ["yaer", "yaire"]
};

// Buzzer keys - multiple options for arcade buttons
// Team 1: Q, Z, 1, Left Arrow
// Team 2: P, M, 2, Right Arrow
// Team 3: Z (if not team 1), 3
// Team 4: M (if not team 2), 4
const BUZZER_KEYS = {
  'q': 0, '1': 0, 'z': 0, 'arrowleft': 0,
  'p': 1, '2': 1, 'm': 1, 'arrowright': 1,
  '3': 2,
  '4': 3
};

export default function App() {
  // Build: 2025-12-02-v5 - fixed hub scoring (use player name not ID)
  const [gameState, setGameState] = useState('setup');
  const [currentRound, setCurrentRound] = useState('JONpardy');
  const [board, setBoard] = useState([]);
  const [teams, setTeams] = useState([]);
  const [numTeams, setNumTeams] = useState(2);
  const [hubTeamMap, setHubTeamMap] = useState({}); // Maps JONpardy team index to hub team ('A' or 'B')
  const [hubEnabled, setHubEnabled] = useState(false);
  const [gameWinBonusAwarded, setGameWinBonusAwarded] = useState(false);

  // Individual player tracking
  const [players, setPlayers] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [awaitingPlayerSelect, setAwaitingPlayerSelect] = useState(false);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [questionChooserIndex, setQuestionChooserIndex] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(null);
  const [dailyDoubleWager, setDailyDoubleWager] = useState('');
  const [wagerError, setWagerError] = useState('');
  const [attemptedBy, setAttemptedBy] = useState([]);
  const [finalJONpardyStep, setFinalJONpardyStep] = useState('wager');
  const [finalWagers, setFinalWagers] = useState({});
  const [finalAnswers, setFinalAnswers] = useState({});
  const [questionPhase, setQuestionPhase] = useState('reading'); 
  const [buzzInTimer, setBuzzInTimer] = useState(5);
  const [displayedQuestion, setDisplayedQuestion] = useState('');

  const audioContext = useRef(null);
  const finalJONpardyMusic = useRef(null);
  const buzzInInterval = useRef(null);
  const typewriterTimerRef = useRef(null);

  const stopTyping = useCallback(() => {
    if (typewriterTimerRef.current) {
        clearInterval(typewriterTimerRef.current);
        typewriterTimerRef.current = null;
    }
  }, []);

  // Update individual player stats and calculate personal score
  // JONpardy is team-based - all players on the team earn points together
  const updatePlayerStats = useCallback((playerId, playerName, statUpdate) => {
    setPlayers(prev => prev.map(p => {
      if (p.id !== playerId) return p;
      const newStats = { ...p.stats };

      // Track counts for stats display
      if (statUpdate.correctAnswer) newStats.correctAnswers = (newStats.correctAnswers || 0) + 1;
      if (statUpdate.dailyDoubleCorrect) newStats.dailyDoubleCorrect = (newStats.dailyDoubleCorrect || 0) + 1;
      if (statUpdate.finalCorrect) newStats.finalCorrect = (newStats.finalCorrect || 0) + 1;

      // Accumulate points (now scaled by question value)
      if (statUpdate.hubPoints) newStats.totalPoints = (newStats.totalPoints || 0) + statUpdate.hubPoints;

      // Team bonuses
      if (statUpdate.gameWinBonus) newStats.gameWinBonus = (newStats.gameWinBonus || 0) + statUpdate.gameWinBonus;

      // Personal score = accumulated points + game win bonus
      const personalScore = (newStats.totalPoints || 0) + (newStats.gameWinBonus || 0);

      // Sync to hub using player NAME (hub uses name for lookups)
      if (statUpdate.hubPoints && window.GameNightScoring) {
        addHubPlayerScore(playerName, statUpdate.hubPoints, 'JONpardy', statUpdate.description || '+points');
      }

      return { ...p, stats: newStats, personalScore };
    }));
  }, []);

useEffect(() => {
    // Make sure to stop any previous timers when the active question changes.
    stopTyping();

    if (questionPhase === 'reading' && activeQuestion && !activeQuestion.isDailyDouble) {
        const text = activeQuestion.question;
        // We start with the first character instead of an empty string
        // to kick off the interval logic correctly.
        setDisplayedQuestion(text[0] || '');

        typewriterTimerRef.current = setInterval(() => {
            // Use the updater function to get the most recent state
            setDisplayedQuestion(currentText => {
                // If we're not done yet...
                if (currentText.length < text.length) {
                    // Get the next portion of the full string
                    return text.substring(0, currentText.length + 1);
                }
                
                // Otherwise, we're done. Stop the timer.
                stopTyping();
                setQuestionPhase('buzzing');
                return currentText; // Return the final, full text
            });
        }, 70);
    }
    
    // The cleanup function is still essential!
    return () => stopTyping();
  }, [questionPhase, activeQuestion, stopTyping]);

  const playSound = (type) => {
    if (!audioContext.current) return;
    const now = audioContext.current.currentTime;
    const oscillator = audioContext.current.createOscillator();
    const gain = audioContext.current.createGain();
    oscillator.connect(gain);
    gain.connect(audioContext.current.destination);

    switch (type) {
      case 'select':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        break;
      case 'correct':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.linearRampToValueAtTime(800, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        break;
      case 'incorrect':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        break;
      case 'dailyDouble':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.linearRampToValueAtTime(400, now + 0.1);
        oscillator.frequency.linearRampToValueAtTime(200, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        break;
      case 'finalJONpardyThink':
        const osc = audioContext.current.createOscillator();
        const lfo = audioContext.current.createOscillator();
        const musicGain = audioContext.current.createGain();
        lfo.type = 'square';
        lfo.frequency.setValueAtTime(4, now);
        lfo.connect(musicGain.gain);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.connect(musicGain);
        musicGain.gain.setValueAtTime(0.3, now);
        musicGain.connect(audioContext.current.destination);
        osc.start(now);
        lfo.start(now);
        // Auto-stop after 30 seconds (typical Final Jeopardy think time)
        const autoStopTimeout = setTimeout(() => {
          stopFinalJONpardyMusic();
        }, 30000);
        finalJONpardyMusic.current = { osc, lfo, musicGain, autoStopTimeout };
        return;
    }
    oscillator.start(now);
    oscillator.stop(now + 1);
  };
  
  const stopFinalJONpardyMusic = () => {
    if (finalJONpardyMusic.current) {
        // Clear auto-stop timeout if it exists
        if (finalJONpardyMusic.current.autoStopTimeout) {
          clearTimeout(finalJONpardyMusic.current.autoStopTimeout);
        }
        try {
          const now = audioContext.current.currentTime;
          finalJONpardyMusic.current.osc.stop(now);
          finalJONpardyMusic.current.lfo.stop(now);
          if (finalJONpardyMusic.current.musicGain) {
            finalJONpardyMusic.current.musicGain.disconnect();
          }
        } catch (e) {
          // Oscillators may already be stopped
        }
        finalJONpardyMusic.current = null;
    }
  };

  const setupRound = (round) => {
    const data = round === 'JONpardy' ? JONpardyData :
                 round === 'doubleJONpardy' ? doubleJONpardyData : tripleJONpardyData;
    let questionPool = [];
    const newBoard = data.categories.map((cat, catIndex) => ({
      ...cat,
      questions: cat.questions.map((q, qIndex) => {
        const questionData = { ...q, catIndex, qIndex, answered: false, isDailyDouble: false };
        questionPool.push(questionData);
        return questionData;
      }),
    }));
    const numDailyDoubles = round === 'JONpardy' ? 1 : round === 'doubleJONpardy' ? 2 : 3;
    for (let i = 0; i < numDailyDoubles; i++) {
      let placed = false;
      while (!placed) {
        const randIndex = Math.floor(Math.random() * questionPool.length);
        const { catIndex, qIndex } = questionPool[randIndex];
        if (!newBoard[catIndex].questions[qIndex].isDailyDouble) {
          newBoard[catIndex].questions[qIndex].isDailyDouble = true;
          placed = true;
        }
      }
    }
    setBoard(newBoard);
    setCurrentRound(round);
    setGameState('playing');
  };
  
  const handleStartGame = () => {
    if (numTeams < 1 || numTeams > 4) return;
    if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.current.state === 'suspended') {
        audioContext.current.resume();
    }

    // Check for hub data and set up team mapping
    const hubData = getHubData();
    if (hubData && hubData.players && hubData.players.length >= 2) {
      const teamNames = hubData.teamNames || { A: 'Team A', B: 'Team B' };
      // For 2 teams: Team 0 = Hub Team A, Team 1 = Hub Team B
      const initialTeams = [
        { name: teamNames.A, score: 0 },
        { name: teamNames.B, score: 0 }
      ];
      setTeams(initialTeams);
      setHubTeamMap({ 0: 'A', 1: 'B' });
      setHubEnabled(true);
      setNumTeams(2);

      // Load players with individual tracking
      const loadedPlayers = hubData.players.map((p, index) => ({
        // Ensure player has a valid ID - use hub ID or generate fallback
        id: p.id || `player_${index}_${Date.now()}`,
        name: p.name || `Player ${index + 1}`,
        team: p.team, // 'A' or 'B'
        teamIndex: p.team === 'A' ? 0 : 1,
        avatar: p.avatar || '🎮',
        personalScore: 0,
        stats: {
          correctAnswers: 0,
          dailyDoubleCorrect: 0,
          finalCorrect: 0,
          gameWinBonus: 0
        }
      }));
      console.log('JONpardy: Loaded players', loadedPlayers.map(p => ({ id: p.id, name: p.name, team: p.team })));
      setPlayers(loadedPlayers);
    } else {
      const initialTeams = Array.from({ length: numTeams }, (_, i) => ({ name: `Team ${i + 1}`, score: 0 }));
      setTeams(initialTeams);
      setHubEnabled(false);
      setPlayers([]);
    }

    setCurrentTeamIndex(0);
    setQuestionChooserIndex(0);
    setAttemptedBy([]);
    setupRound('JONpardy');
  };

  const handleSelectQuestion = (catIndex, qIndex) => {
    const question = board[catIndex].questions[qIndex];
    if (question.answered) return;
    setQuestionChooserIndex(currentTeamIndex);
    setAttemptedBy([]);
    setActiveQuestion(question);
    
    if (question.isDailyDouble) {
        playSound('dailyDouble');
        setGameState('dailyDouble');
        setQuestionPhase('answering');
        setDisplayedQuestion(question.question);
    } else {
        playSound('select');
        setQuestionPhase('reading');
        setDisplayedQuestion('');
    }
  };

  const handleDailyDoubleWager = (e) => {
    e.preventDefault();
    const wager = parseInt(dailyDoubleWager);
    const teamScore = teams[currentTeamIndex].score;
    const highestClueValue = currentRound === 'JONpardy' ? 1000 : currentRound === 'doubleJONpardy' ? 2000 : 3000;
    // In real Jeopardy: max wager is the greater of your score or highest clue value
    // But you can't wager more than you have if your score is positive
    const maxWager = teamScore > 0 ? Math.max(teamScore, highestClueValue) : highestClueValue;
    const minWager = 5;

    if (isNaN(wager) || wager < minWager || wager > maxWager) {
      setWagerError(`Wager must be between $${minWager} and $${maxWager}.`);
      return;
    }
    setActiveQuestion(prev => ({ ...prev, wager }));
    setDailyDoubleWager('');
    setWagerError('');
    // JONpardy is team-based - go straight to answering
  };

  // Handle player selection after buzz-in
  const handleSelectPlayer = (playerId) => {
    setSelectedPlayerId(playerId);
    setAwaitingPlayerSelect(false);
    setQuestionPhase('answering');
  };

const handleBuzzIn = useCallback((event) => {
    if ((questionPhase !== 'buzzing' && questionPhase !== 'reading') || !BUZZER_KEYS.hasOwnProperty(event.key.toLowerCase())) return;

    const teamIndex = BUZZER_KEYS[event.key.toLowerCase()];
    if (teamIndex < numTeams && !attemptedBy.includes(teamIndex)) {
        event.preventDefault();
        stopTyping();
        playSound('select');
        setCurrentTeamIndex(teamIndex);
        // Go straight to answering - JONpardy is team-based (teams discuss together)
        setQuestionPhase('answering');
    }
  }, [questionPhase, numTeams, attemptedBy, stopTyping]);

  useEffect(() => {
    window.addEventListener('keydown', handleBuzzIn);
    return () => {
        window.removeEventListener('keydown', handleBuzzIn);
    };
  }, [handleBuzzIn]);

  useEffect(() => {
    if (questionPhase === 'buzzing') {
        setBuzzInTimer(5);
        buzzInInterval.current = setInterval(() => {
            setBuzzInTimer(prev => prev - 1);
        }, 1000);
    } else {
        if (buzzInInterval.current) {
            clearInterval(buzzInInterval.current);
            buzzInInterval.current = null;
        }
    }
    return () => {
        if (buzzInInterval.current) clearInterval(buzzInInterval.current);
    }
  }, [questionPhase]);

  useEffect(() => {
    if (buzzInTimer === 0 && buzzInInterval.current) {
        clearInterval(buzzInInterval.current);
        buzzInInterval.current = null;
        setShowResult({ status: 'incorrect', message: `Time's up! The answer was: ${activeQuestion.answer}` });
        const newBoard = [...board];
        newBoard[activeQuestion.catIndex].questions[activeQuestion.qIndex].answered = true;
        setBoard(newBoard);
        setCurrentTeamIndex(questionChooserIndex);
        setTimeout(() => {
          setActiveQuestion(null);
          setShowResult(null);
          setSelectedPlayerId(null);
          setAwaitingPlayerSelect(false);
          setGameState('playing');
        }, 3000);
    }
  }, [buzzInTimer, activeQuestion, board, questionChooserIndex]);

  // Skip question - host can click if no one knows the answer
  const handleSkipQuestion = () => {
    if (buzzInInterval.current) {
      clearInterval(buzzInInterval.current);
      buzzInInterval.current = null;
    }
    setShowResult({ status: 'incorrect', message: `Skipped! The answer was: ${activeQuestion.answer}` });
    const newBoard = [...board];
    newBoard[activeQuestion.catIndex].questions[activeQuestion.qIndex].answered = true;
    setBoard(newBoard);
    setCurrentTeamIndex(questionChooserIndex);
    setTimeout(() => {
      setActiveQuestion(null);
      setShowResult(null);
      setSelectedPlayerId(null);
      setAwaitingPlayerSelect(false);
      setGameState('playing');
    }, 3000);
  };

  const handleSubmitAnswer = (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    // Use fuzzy matching with aliases support
    const isCorrect = isAnswerMatch(userAnswer, activeQuestion.answer) ||
                      (activeQuestion.aliases && activeQuestion.aliases.some(alias => isAnswerMatch(userAnswer, alias)));
    const points = activeQuestion.wager ?? activeQuestion.points;
    const newTeams = [...teams];
    const team = newTeams[currentTeamIndex];

    if (isCorrect) {
      playSound('correct');
      team.score += points;
      setShowResult({ status: 'correct', message: `Correct! +$${points} for ${team.name}` });

      const newBoard = [...board];
      newBoard[activeQuestion.catIndex].questions[activeQuestion.qIndex].answered = true;
      setBoard(newBoard);

      // Auto-score to hub (team)
      if (hubEnabled && hubTeamMap[currentTeamIndex]) {
        const hubTeam = hubTeamMap[currentTeamIndex];
        if (activeQuestion.isDailyDouble) {
          addHubTeamScore(hubTeam, 15, 'JONpardy');
        } else {
          const hubPoints = dollarToHubPoints(activeQuestion.points);
          addHubTeamScore(hubTeam, hubPoints, 'JONpardy');
        }
      }

      // Award ALL players on the team - JONpardy is collaborative!
      // Since teams discuss answers together, everyone on the team gets credit.
      // Points scale by question value: $200=2, $400=4, $600=6, $800=8, $1000=10
      const teamLetter = hubTeamMap[currentTeamIndex]; // 'A' or 'B'
      if (teamLetter) {
        const teamPlayers = players.filter(p => p.team === teamLetter);
        if (activeQuestion.isDailyDouble) {
          // Daily Double: +15 per player
          teamPlayers.forEach(p => {
            updatePlayerStats(p.id, p.name, {
              dailyDoubleCorrect: true,
              hubPoints: 15,
              description: 'Daily Double correct (+15)'
            });
          });
        } else {
          // Regular question: scale by dollar value ($200=2, $1000=10)
          const individualPoints = dollarToHubPoints(activeQuestion.points);
          teamPlayers.forEach(p => {
            updatePlayerStats(p.id, p.name, {
              correctAnswer: true,
              hubPoints: individualPoints,
              description: `Correct $${activeQuestion.points} (+${individualPoints})`
            });
          });
        }
      }

      setTimeout(() => {
        setActiveQuestion(null);
        setUserAnswer('');
        setShowResult(null);
        setGameState('playing');
      }, 3000);
    } else { // Incorrect Answer
      playSound('incorrect');
      team.score -= points;
      
      if (activeQuestion.isDailyDouble) {
          setShowResult({ status: 'incorrect', message: `Incorrect! The answer was: ${activeQuestion.answer}` });
          const newBoard = [...board];
          newBoard[activeQuestion.catIndex].questions[activeQuestion.qIndex].answered = true;
          setBoard(newBoard);
          setCurrentTeamIndex(prev => (prev + 1) % teams.length);
          setTimeout(() => {
            setActiveQuestion(null);
            setUserAnswer('');
            setShowResult(null);
            setSelectedPlayerId(null);
            setGameState('playing');
          }, 3000);
          return;
      }

      setTeams(newTeams);
      const newAttemptedBy = [...attemptedBy, currentTeamIndex];
      setAttemptedBy(newAttemptedBy);
      setUserAnswer('');

      if (newAttemptedBy.length >= teams.length) {
        setShowResult({ status: 'incorrect', message: `Incorrect! The answer was: ${activeQuestion.answer}` });
        const newBoard = [...board];
        newBoard[activeQuestion.catIndex].questions[activeQuestion.qIndex].answered = true;
        setBoard(newBoard);
        setCurrentTeamIndex(questionChooserIndex);

        setTimeout(() => {
          setActiveQuestion(null);
          setShowResult(null);
          setSelectedPlayerId(null);
          setGameState('playing');
        }, 3000);
      } else {
        setSelectedPlayerId(null);
        setQuestionPhase('buzzing');
        setDisplayedQuestion(activeQuestion.question);
      }
    }
  };

  useEffect(() => {
    if (gameState !== 'playing' || board.length === 0) return;
    if (board.every(cat => cat.questions.every(q => q.answered))) {
      if (currentRound === 'JONpardy') {
        setTimeout(() => {
            const lowestScore = Math.min(...teams.map(t => t.score));
            const startingTeamIndex = teams.findIndex(t => t.score === lowestScore);
            setCurrentTeamIndex(startingTeamIndex >= 0 ? startingTeamIndex : 0);
            setupRound('doubleJONpardy');
        }, 3000);
      } else if (currentRound === 'doubleJONpardy') {
        setTimeout(() => {
            const lowestScore = Math.min(...teams.map(t => t.score));
            const startingTeamIndex = teams.findIndex(t => t.score === lowestScore);
            setCurrentTeamIndex(startingTeamIndex >= 0 ? startingTeamIndex : 0);
            setupRound('tripleJONpardy');
        }, 3000);
      } else {
        setTimeout(() => {
          if (teams.some(t => t.score > 0)) {
              setGameState('finalJONpardy');
              playSound('finalJONpardyThink');
          } else {
              setGameState('gameOver');
          }
        }, 3000);
      }
    }
  }, [board, gameState]);

  // Stop Final JONpardy music when leaving that game state
  useEffect(() => {
    if (gameState !== 'finalJONpardy') {
      stopFinalJONpardyMusic();
    }
  }, [gameState]);

  // Award game win bonus (+25 team, +10 per player) when game ends
  useEffect(() => {
    if (gameState === 'gameOver' && hubEnabled && !gameWinBonusAwarded) {
      const maxScore = Math.max(...teams.map(t => t.score));
      const winners = teams.filter(t => t.score === maxScore);
      // Only award if there's a single winner (not a tie)
      if (winners.length === 1) {
        const winnerIndex = teams.findIndex(t => t.score === maxScore);
        if (winnerIndex !== -1 && hubTeamMap[winnerIndex]) {
          setGameWinBonusAwarded(true);
          addHubTeamScore(hubTeamMap[winnerIndex], 25, 'JONpardy');

          // Award individual game win bonus (+10) to all winning team players
          const winningTeam = hubTeamMap[winnerIndex]; // 'A' or 'B'
          players.filter(p => p.team === winningTeam).forEach(p => {
            updatePlayerStats(p.id, p.name, {
              gameWinBonus: 10,
              hubPoints: 10,
              description: 'Game win bonus (+10)'
            });
          });
          console.log('JONpardy: Awarded +25 team, +10/player to', winners[0].name);
        }
      }
    }
  }, [gameState, hubEnabled, gameWinBonusAwarded, teams, hubTeamMap, players, updatePlayerStats]);

  const handleFinalWagers = (e) => { e.preventDefault(); setFinalJONpardyStep('answer'); };
  const handleFinalAnswers = (e) => {
    e.preventDefault();
    stopFinalJONpardyMusic();
    const newTeams = teams.map((team, i) => {
      if (team.score <= 0) return team;
      const answer = (finalAnswers[i] || "").trim();
      const wager = finalWagers[i] || 0;
      // Use fuzzy matching with aliases for Final JONpardy
      const isCorrect = isAnswerMatch(answer, finalJONpardyData.answer) ||
                        (finalJONpardyData.aliases && finalJONpardyData.aliases.some(alias => isAnswerMatch(answer, alias)));

      // Auto-score Final JONpardy to hub (+25 for correct)
      if (isCorrect && hubEnabled && hubTeamMap[i]) {
        addHubTeamScore(hubTeamMap[i], 25, 'JONpardy');

        // Award individual Final JONpardy correct (+20) to all players on this team
        const teamLetter = hubTeamMap[i]; // 'A' or 'B'
        players.filter(p => p.team === teamLetter).forEach(p => {
          updatePlayerStats(p.id, p.name, {
            finalCorrect: true,
            hubPoints: 20,
            description: 'Final JONpardy correct (+20)'
          });
        });
      }

      return isCorrect
        ? { ...team, score: team.score + wager }
        : { ...team, score: team.score - wager };
    });
    setTeams(newTeams);
    setFinalJONpardyStep('reveal');
    setTimeout(() => setGameState('gameOver'), 8000);
  };
  
  const handleGoToSetup = () => {
    setGameState('setup');
    setCurrentRound('JONpardy');
    setFinalJONpardyStep('wager');
    setFinalWagers({});
    setFinalAnswers({});
    setAttemptedBy([]);
    setGameWinBonusAwarded(false);
    setSelectedPlayerId(null);
    setAwaitingPlayerSelect(false);
    setPlayers([]);
  };
  
  const getWinner = () => {
    if (teams.length === 0) return [];
    const maxScore = Math.max(...teams.map(t => t.score));
    return teams.filter(t => t.score === maxScore);
  };
  
  if (gameState === 'setup') {
    const hubData = getHubData();
    const hasHubData = hubData && hubData.players && hubData.players.length >= 2;
    const hubTeamNames = hubData?.teamNames || { A: 'Team A', B: 'Team B' };

    return (
      <div className="min-h-screen w-screen bg-gray-900 text-white font-sans flex flex-col items-center justify-center p-4">
        <div className="bg-blue-900 p-8 rounded-lg shadow-2xl text-center w-full max-w-md">
            <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-yellow-400 mb-8" style={{ textShadow: '2px 2px 4px #000000' }}>JONPARDY!</h1>

            {hasHubData ? (
              <>
                <div className="bg-green-600/30 border border-green-500 rounded-lg p-4 mb-6">
                  <p className="text-green-400 font-bold mb-2">✓ Game Night Hub Connected!</p>
                  <p className="text-sm text-gray-300">Teams: {hubTeamNames.A} vs {hubTeamNames.B}</p>
                  <p className="text-xs text-gray-400 mt-1">Points will auto-sync to the hub</p>
                </div>
                <p className="text-gray-400 mb-6">Buzzer keys: {hubTeamNames.A} (Q), {hubTeamNames.B} (P)</p>
              </>
            ) : (
              <>
                <h2 className="text-2xl mb-4">Select Number of Teams</h2>
                <p className="text-gray-400 mb-6">Buzzer keys: Team 1 (Q), Team 2 (P), Team 3 (Z), Team 4 (M)</p>
                <div className="flex justify-center gap-4 mb-8">
                    {[2, 3, 4].map(num => (
                        <button
                            key={num}
                            onClick={() => setNumTeams(num)}
                            className={`w-16 h-16 text-2xl font-bold rounded-lg transition-all flex items-center justify-center ${numTeams === num ? 'bg-yellow-400 text-blue-900 scale-110' : 'bg-blue-700 hover:bg-blue-600'}`}
                        >
                            {num}
                        </button>
                    ))}
                </div>
              </>
            )}

            <button onClick={handleStartGame} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md text-xl transition-transform transform hover:scale-105">
                Start Game
            </button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    const winners = getWinner();
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4 z-30 text-center animate-fade-in">
        <h2 className="text-4xl sm:text-5xl md:text-6xl text-yellow-400 font-bold mb-8">Final Scores</h2>
        <div className="flex flex-col gap-4 mb-8">
            {teams.map((team, index) => (
               <p key={index} className="text-2xl sm:text-3xl md:text-4xl font-bold">
                  {team.name}: <span className={team.score >= 0 ? 'text-green-400' : 'text-red-400'}>${team.score}</span>
               </p>
            ))}
        </div>
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8">
          {winners.length > 1 ? "It's a Tie!" : (winners.length === 1 ? `${winners[0].name} Wins!` : "No Winners!")}
        </h3>
        <button onClick={handleGoToSetup} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-lg shadow-md text-xl md:text-2xl transition-transform transform hover:scale-105">
          Play Again!
        </button>
      </div>
    );
  }

  if (gameState === 'finalJONpardy') {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4 z-30 text-center animate-fade-in">
            <h2 className="text-4xl text-yellow-400 font-bold mb-4">Final JONpardy!</h2>
            <h3 className="text-2xl mb-8">Category: {finalJONpardyData.category}</h3>
            {finalJONpardyStep === 'wager' && (
                <form onSubmit={handleFinalWagers} className="w-full max-w-lg">
                    <p className="mb-4">Enter your wagers (0 to your current score).</p>
                    {teams.map((team, index) => team.score > 0 && (
                        <div key={index} className="flex items-center justify-between gap-4 mb-2">
                            <label className="text-xl">{team.name}:</label>
                            <input type="number" min="0" max={team.score} required
                                onChange={(e) => setFinalWagers(prev => ({ ...prev, [index]: Math.max(0, Math.min(team.score, parseInt(e.target.value) || 0)) }))}
                                className="w-40 p-2 rounded bg-gray-800 border-blue-600 border-2" />
                        </div>
                    ))}
                    <button type="submit" className="mt-4 bg-blue-600 px-6 py-2 rounded-lg text-xl">Lock Wagers</button>
                </form>
            )}
            {finalJONpardyStep === 'answer' && (
                <form onSubmit={handleFinalAnswers} className="w-full max-w-2xl">
                    <p className="text-3xl font-light mb-6">{finalJONpardyData.question}</p>
                     {teams.map((team, index) => team.score > 0 && (
                        <div key={index} className="flex items-center justify-between gap-4 mb-2">
                            <label className="text-xl">{team.name}:</label>
                            <input type="text" placeholder="What is...?" required
                                onChange={(e) => setFinalAnswers(prev => ({...prev, [index]: e.target.value}))}
                                className="flex-grow p-2 rounded bg-gray-800 border-blue-600 border-2"/>
                        </div>
                     ))}
                    <button type="submit" className="mt-4 bg-green-600 px-6 py-2 rounded-lg text-xl">Reveal Answers</button>
                </form>
            )}
            {finalJONpardyStep === 'reveal' && (
                <div>
                    <h2 className="text-3xl mb-4">The correct answer was:</h2>
                    <p className="text-4xl text-yellow-400 font-bold">{finalJONpardyData.answer}</p>
                </div>
            )}
        </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gray-900 text-white font-sans flex flex-col items-center p-2 sm:p-4">
      <div className="w-full max-w-7xl">
        <header className="w-full mb-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-yellow-400" style={{ textShadow: '2px 2px 4px #000000' }}>
                {currentRound === 'tripleJONpardy' ? 'Triple JONpardy!' : currentRound === 'doubleJONpardy' ? 'Double JONpardy!' : 'JONPARDY!'}
            </h1>
            <div className="mt-4 flex flex-col md:flex-row justify-center items-center gap-4">
                <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2">
                {teams.map((team, index) => (
                    <div key={index} className={`text-base md:text-xl font-bold bg-blue-800 px-4 py-2 rounded-lg shadow-lg transition-all border-2 ${index === currentTeamIndex && questionPhase === 'answering' ? 'border-yellow-400 scale-110' : 'border-transparent'}`}>
                    <span className="hidden sm:inline">({Object.keys(BUZZER_KEYS)[index]})</span> {team.name}: <span className={team.score >= 0 ? 'text-green-400' : 'text-red-400'}>${team.score}</span>
                    </div>
                ))}
                </div>
                <button onClick={handleGoToSetup} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 mt-2 md:mt-0">
                    New Game
                </button>
            </div>
        </header>

        <div className="w-full overflow-x-auto pb-4">
            <main className="grid grid-cols-5 gap-1 sm:gap-2 min-w-[600px] md:min-w-[700px] lg:min-w-[800px] mx-auto">
            {board.map((category, catIndex) => (
                <div key={catIndex} className="flex flex-col gap-1 sm:gap-2">
                <div className="h-24 flex items-center justify-center p-2 bg-blue-800 text-yellow-400 text-center font-bold text-xs sm:text-sm md:text-lg rounded-md shadow-lg uppercase">
                    {category.name}
                </div>
                {category.questions.map((q, qIndex) => (
                    <div
                    key={qIndex}
                    onClick={() => handleSelectQuestion(catIndex, qIndex)}
                    className={`h-20 flex items-center justify-center p-2 text-xl sm:text-2xl md:text-3xl font-bold rounded-md shadow-lg transition-transform ${
                        q.answered ? 'bg-gray-700 opacity-40 cursor-not-allowed' : 'bg-blue-700 text-yellow-400 cursor-pointer hover:scale-105 hover:bg-blue-600'
                    }`}
                    >
                    {q.answered ? '' : `$${q.points}`}
                    </div>
                ))}
                </div>
            ))}
            </main>
        </div>
      </div>

      {activeQuestion && (gameState !== 'dailyDouble' || activeQuestion.wager) && !showResult && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-10">
            <div className="bg-blue-900 p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-3xl text-center flex flex-col items-center animate-fade-in">
              <h2 className="text-lg md:text-xl font-bold text-yellow-400 uppercase mb-4">{activeQuestion.isDailyDouble ? `Daily Double!` : `${board[activeQuestion.catIndex].name} for $${activeQuestion.points}`}</h2>
              <p className="text-2xl md:text-4xl font-light mb-6 flex-grow min-h-[8rem]">
                {displayedQuestion}
              </p>
              
              <div className="h-16">
                {questionPhase === 'buzzing' &&
                    <div className="flex flex-col items-center">
                        <div className="text-3xl text-yellow-400 animate-pulse">Buzz In!</div>
                        <div className="mt-2 text-2xl font-bold text-white">{buzzInTimer}</div>
                        <button
                          onClick={handleSkipQuestion}
                          className="mt-3 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm font-semibold transition-colors"
                        >
                          Skip Question
                        </button>
                    </div>
                }
              </div>

              {questionPhase === 'answering' && (
                <>
                  <h3 className="text-xl md:text-2xl font-bold text-green-400 mb-4">
                    {teams[currentTeamIndex].name}'s Turn
                  </h3>
                  <form onSubmit={handleSubmitAnswer} className="w-full flex flex-col sm:flex-row gap-2">
                    <input type="text" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} autoFocus placeholder="What is...?" className="flex-grow p-3 rounded-md bg-gray-800 text-white border-2 border-blue-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"/>
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md transition-transform transform hover:scale-105 text-lg"> Answer </button>
                  </form>
                </>
              )}
            </div>
        </div>
      )}

      {gameState === 'dailyDouble' && !activeQuestion.wager && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-20">
            <div className="bg-yellow-400 text-blue-900 p-8 rounded-lg shadow-2xl w-full max-w-md text-center animate-fade-in">
                <h2 className="text-6xl font-bold mb-4">Daily Double!</h2>
                <p className="text-xl mb-4">{teams[currentTeamIndex].name}, enter your wager.</p>
                <form onSubmit={handleDailyDoubleWager} className="flex flex-col gap-2">
                    <input type="number" value={dailyDoubleWager} autoFocus min="5"
                        onChange={(e) => setDailyDoubleWager(e.target.value)}
                        className="p-3 text-center text-xl rounded bg-blue-900 text-white"/>
                    {wagerError && <p className="text-red-700 font-bold">{wagerError}</p>}
                    <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-md text-xl">
                        Wager
                    </button>
                </form>
            </div>
        </div>
      )}
      
      {showResult && (
         <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-20">
            <div className={`p-8 rounded-lg shadow-2xl text-center text-xl sm:text-3xl font-bold animate-fade-in ${showResult.status === 'correct' ? 'bg-green-700' : 'bg-red-800'}`}>
                {showResult.message}
            </div>
         </div>
      )}
    </div>
  );
}
