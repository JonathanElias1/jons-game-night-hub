import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Are You Smarter Than a 5th Grader — Jon Edition
 *
 * Features
 * - Fullscreen mode with larger layout in FS
 * - Header Play/Stop Theme button (no autoplay, no loop)
 * - Volume slider (applies to music + SFX)
 * - Louder SFX:
 *   - Bright “correct” chime
 *   - Beefier wrong-answer buzzer
 *   - Distinct lose sting
 * - Cash Out: Player can cash out anytime before game end.
 *   -> Must "repeat after me" then claim Jon Bucks equal to current score.
 */

const BRAND_A = "#5b9bd5";
const BRAND_B = "#36e326";

// ————————————————————————————————————————————
// Question Bank (Jon-specific)
// ————————————————————————————————————————————
const QUESTIONS = [
  // Grade 1
  { id: "q1", grade: 1, subject: "Language Arts", q: "What is the verb in the sentence \"Jon saved my life\"?", choices: ["my", "save", "saved", "life"], answerIndex: 2, hint: "Verbs are action words. Which word tells what Jon did?" },
  { id: "q2",   grade: 1,
  subject: "Math",
  q: "The event starts at 12:27 PM. Kaz texts 'almost ready' at 12:18 PM. She takes 56 minutes to get ready and 13 minutes to drive to the event. What time will Kaz actually arrive? (assume she follows the math)",
  choices: ["1:27 PM", "12:59 PM", "1:11 PM", "12:27 PM"],
  answerIndex: 0,
  hint: "Ignore the start time (just like Kaz). Use addition."
},
  { id: "q17", grade: 1, subject: "Culinary Arts", q: "Besides refusing to eat any animal he can have fun with, which food does Jon refuse to eat? ", choices: ["Pulled Pork", "Mushrooms", "Octopus", "Shredded Chicken"], answerIndex: 3, hint: "He hates the stringy, 'pulled' texture." },
  {
  id: "q18",
  grade: 1,
  subject: "Media",
  q: "Jon records video by attaching a 28–70mm lens to which item?",
  choices: ["Camera body", "Tripod", "Phone", "Camcorder"],
  answerIndex: 0,
  hint: "It’s the part the lens snaps onto, the one with the record button."
},

  // Grade 2
  { id: "q3",  grade: 2,
  subject: "Math",
  q: "Jon buys tape for $2.75 and a marker for $1.25. He pays with $5.00. How much change does he get?",
  choices: ["$0.75", "$1.00", "$1.25", "$2.00"],
  answerIndex: 1,
  hint: "Add prices, then subtract from 5."},
  { id: "q4", grade: 2,
  subject: "Geography",
  q: "Jon recently learned part of his family heritage traces to which continent?",
  choices: ["South America", "Europe", "Africa", "Asia"],
  answerIndex: 3,
  hint: "Think of the continent with Japan and Thailand." },
  { id: "q19",  grade: 2,
  subject: "Language Arts",
  q: "Choose the correctly punctuated sentence.",
  choices: [
    "The other day, Jon was told: \"You are the best person I know in the entire world, Jon. You saved my life. You are, without question, the greatest of all time.\"",
    "The other day, Jon was told, \"You are the best person I know in the entire world Jon, you saved my life, and you are without question the greatest of all time\".",
    "The other day, Jon was told: \"you are the best person I know in the entire world, Jon you saved my life, you are the greatest of all time.\"",
    "The other day Jon was told \"You are the best person I know in the entire world, Jon! You saved my life and you are, without question the greatest of all time\"."
  ],
  answerIndex: 0,
  hint: "Use a colon to introduce a multi-sentence quote, commas for direct address (“Jon”), and end each sentence with a period inside the quotes."},
  { id: "q20", grade: 2,
  subject: "Earth Science",
  q: "Rocks that change deep underground because of heat and pressure are called ______ rocks.",
  choices: ["igneous", "sedimentary", "metamorphic", "volcanic"],
  answerIndex: 2,
  hint: "They ‘morph’ (change) inside Earth."},

  // Grade 3
  { id: "q5", grade: 3, subject: "Math",
  q: "Jon’s break lasts 3/4 of an hour. One-third of that is spent talking to coworkers about the weather. How many minutes is that?",
  choices: ["12", "18", "20", "15"],
  answerIndex: 3,
  hint: "First find 3/4 of 60 (=45), then take 1/3 of 45." },
  { id: "q6", grade: 3,  subject: "Math",
  q: "Jon starts editing at 3:47 PM. He edits 38 minutes, takes a 9-minute break, then edits 14 more minutes. When does he finish?",
  choices: ["4:47 PM", "4:48 PM", "4:54 PM", "4:38 PM"],
  answerIndex: 1,
  hint: "Add 38, then 9, then 14 to 3:47." },
  { id: "q14", grade: 3, subject: "Language Arts",
  q: "Choose the correctly punctuated sentence.",
  choices: [
    "“Jon, you're absolutely the greatest,” Cody said.",
    "“Jon you're absolutely the greatest” Cody said.",
    "“Jon, youre absolutely the greatest,” said Cody.",
    "“Jon, you're absolutely the greatest”,” Cody said."
  ],
  answerIndex: 0,
  hint: "Comma for direct address, apostrophe in you’re, comma inside the quotes." },
  { id: "q16", grade: 3,
  subject: "Science",
  q: "On a hot Phoenix day, water drops form on the outside of Jon’s cold bottle. This process is called ______.",
  choices: ["evaporation", "condensation", "melting", "freezing"],
  answerIndex: 1,
  hint: "Gas in the air turns back into liquid on the bottle." },

  // Grade 4
  { id: "q7", grade: 4,
  subject: "Math",
  q: "Jon has 53 photos to print and puts them in rows of 4. How many full rows and how many are left over?",
  choices: ["12 rows, 2 left", "13 rows, 1 left", "14 rows, 1 left", "13 rows, 2 left"],
  answerIndex: 1,
  hint: "53 ÷ 4 = ? (think remainder)." },
  { id: "q8", 
    grade: 4, subject: "Language Arts",
 q: "The legendary, astonishing Jon, clearly the greatest filmmaker alive, placed the mic under the table. Which phrase is a prepositional phrase?",
  choices: ["the legendary, astonishing Jon", "placed the mic", "under the table", "greatest filmmaker alive"],
  answerIndex: 2,
  hint: "Look for a position word (preposition) + its object."},
  { id: "q12", grade: 4, subject: "Culinary Arts", q: "Which sauce does Jon prefer?", choices: ["Sriracha", "Frank's RedHot", "Bachan's", "Heinz"], answerIndex: 2, hint: "Japanese BBQ—brand starts with a B." },
  { id: "q13", grade: 4,   subject: "Science",
  q: "In this scientific food chain, who is the PRIMARY consumer? Kale → Guinea Pig → Lion → Jon",
  choices: ["Kale (the salad)", "Guinea Pig", "Lion", "Jon (Jon)"],
  answerIndex: 1,
  hint: "Primary consumers eat plants." },

  // Grade 5
  { id: "q9", grade: 5, subject: "Math",   q: "Jon quotes $500 for a project. The client gets a 20% discount, then 8% sales tax is added. What is the total price?",
  choices: ["$420", "$432", "$440", "$480"],
  answerIndex: 1,
  hint: "Apply the discount first, then tax." },
  { id: "q10", grade: 5, subject: "Science",   q: "Which material is the best conductor for a microphone cable?",
  choices: ["Copper", "Rubber", "Plastic", "Wood"],
  answerIndex: 0,
  hint: "Think metals vs insulators." },
  { id: "q11", grade: 5, subject: "Social Studies", q: "Jon’s violation letter about his beautiful string lights built by Duncan cites 'ARC Guideline 4.3' and the CC&Rs. Jon appeals. Which asshole organization has the authority to fuck him over like this?",
  choices: ["Property manager", "Architectural Review Committee", "HOA Board of Directors", "City code enforcement"],
  answerIndex: 2,
  hint: "Management mails letters; committees review; the elected board makes final decisions." },  
  { id: "q15", grade: 5, subject: "Health/PE",
  q: "Achieving a perfect score on his Secret Service fitness test, during the 1.5 mile event, Jon ran 1.5 miles in 11 minutes and 15 seconds. What was his average pace per mile?",
  choices: ["6:45 per mile", "8:00 per mile", "7:45 per mile", "7:30 per mile"],
  answerIndex: 3,
  hint: "11:15 = 11.25 minutes. Divide 11.25 by 1.5."},

];

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

function getTopScorer() {
  const hubData = getHubData();
  if (!hubData || !hubData.players) return null;

  // Get scores from GameNightScoring
  let topPlayer = null;
  let topScore = -1;

  hubData.players.forEach(player => {
    const score = window.GameNightScoring?.getPlayerScore?.(player.name) || 0;
    if (score > topScore) {
      topScore = score;
      topPlayer = { name: player.name, score, team: player.team };
    }
  });

  // Also get runner-up
  let runnerUp = null;
  let runnerUpScore = -1;

  hubData.players.forEach(player => {
    if (topPlayer && player.name === topPlayer.name) return;
    const score = window.GameNightScoring?.getPlayerScore?.(player.name) || 0;
    if (score > runnerUpScore) {
      runnerUpScore = score;
      runnerUp = { name: player.name, score, team: player.team };
    }
  });

  return { top: topPlayer, runnerUp };
}

// Currency formatter
const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

// ————————————————————————————————————————————
// Utilities
// ————————————————————————————————————————————
function classNames(...xs) { return xs.filter(Boolean).join(" "); }

function useKeyboard(onAnswer, onBoard, onHint, onRestart) {
  useEffect(() => {
    const handler = (e) => {
      if (["1", "2", "3", "4"].includes(e.key)) onAnswer(parseInt(e.key, 10) - 1);
      else if (e.key.toLowerCase() === "b") onBoard();
      else if (e.key.toLowerCase() === "h") onHint();
      else if (e.key.toLowerCase() === "r") onRestart();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onAnswer, onBoard, onHint, onRestart]);
}

function useCountUp(target, duration = 700) {
  const [val, setVal] = useState(target);
  const prevRef = useRef(target);
  useEffect(() => {
    let raf; const start = performance.now();
    const from = prevRef.current; const to = target;
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setVal(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    prevRef.current = target;
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function WinWinnings({ to = 999_999, duration = 2600 }) {
  const [val, setVal] = useState(0);
  const [shirt, setShirt] = useState(false);
  useEffect(() => {
    let raf; const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(to * eased));
      if (p < 1) raf = requestAnimationFrame(step);
      else setTimeout(() => setShirt(true), 250);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  if (shirt) return <span className="font-black">Winnings: JON T-SHIRT</span>;
  return <span>Winnings: <span className="font-black">{USD.format(val)}</span></span>;
}

/** Simple count-up display for Jon Bucks */
function CountTo({ to = 0, duration = 1200, prefix = "", suffix = "" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf; const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(to * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return (
    <span>
      {prefix}
      <span className="font-black">{val.toLocaleString()}</span>
      {suffix}
    </span>
  );
}

// ————————————————————————————————————————————
// Main App
// ————————————————————————————————————————————
export default function JonSmarterGame() {
  const [phase, setPhase] = useState("splash"); // splash | board | question | million | win | lose | cashout
  const [currentId, setCurrentId] = useState(null);
  const [played, setPlayed] = useState(new Set());
  const [score, setScore] = useState(0);
  const [topScorerData, setTopScorerData] = useState(null);

  // Load top scorer data on mount
  useEffect(() => {
    const data = getTopScorer();
    setTopScorerData(data);
  }, []);

  // Lifelines (once per game)
  const [lifelines, setLifelines] = useState({ peek: false, copy: false, hint: false, save: false });
  const [saveArmed, setSaveArmed] = useState(true); // auto-protect on first wrong
  const [hintForId, setHintForId] = useState(null); // which question the Hint was used on

  // Cash Out state
  const [cashedAt, setCashedAt] = useState(0);
  const [cashoutClaimed, setCashoutClaimed] = useState(false);

  // Audio state (master volume)
  const [volume, setVolume] = useState(0.8); // 0..1
  const volumeRef = useRef(volume);
  useEffect(() => { volumeRef.current = volume; if (themeRef.current) themeRef.current.volume = volume; }, [volume]);
  const themeRef = useRef(null);
  const [themeUrl] = useState(`${import.meta.env.BASE_URL}are-you-smarter-song.mp3`);
  const [isThemePlaying, setIsThemePlaying] = useState(false);

  // Fullscreen state
  const [isFs, setIsFs] = useState(false);
  useEffect(() => {
    const onFs = () => setIsFs(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("webkitfullscreenchange", onFs);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("webkitfullscreenchange", onFs);
    };
  }, []);
  function toggleFullscreen() {
    const doc = document; const el = document.documentElement;
    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
    } else {
      (doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc);
    }
  }

  // Per-question UI
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState(null); // null | correct | wrong-saved | wrong
  const [peekOverlay, setPeekOverlay] = useState(false);
  const [copyModal, setCopyModal] = useState(false);

  // Million dollar question (no lifelines)
  const MILLION_Q = {
    id: "mq1",
    q: "What did 5th-grade Jon name his bird, and about how long can an Amazon parrot typically live?",
    choices: [   "Reno — about 100 years", "Rob-E — about 40 years", "Reso — about 80 years",  "Revo — about 60 years"],
    answerIndex: 2,
  };

 // ——— Audio helpers (Web Audio API) ———
const audioCtxRef = useRef(null);
function getAudioCtx() {
  if (!audioCtxRef.current) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtxRef.current = new Ctx();
  }
  return audioCtxRef.current;
}

function playTone(freq = 440, duration = 0.3, type = "sine", baseVolume = 0.2) {
  const master = volumeRef.current; if (master <= 0) return;
  const ctx = getAudioCtx(); if (!ctx) return;

  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator(); osc.type = type; osc.frequency.value = freq;
  const gain = ctx.createGain(); gain.gain.setValueAtTime(0.0001, t0);
  osc.connect(gain); gain.connect(ctx.destination);

  const v = Math.max(0.0001, baseVolume * master);
  gain.gain.exponentialRampToValueAtTime(v, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.start(t0); osc.stop(t0 + duration + 0.02);
}

// UI clicks (lifelines) — slightly louder
function playSfx(name) {
  switch (name) {
    case "peek": playTone(660, 0.25, "sine", 0.4); break;
    case "copy": playTone(520, 0.25, "sine", 0.4); break;
    case "hint": playTone(740, 0.30, "sine", 0.45); break;
    default: playTone(440, 0.20, "sine", 0.35);
  }
}

// WRONG answer — beefier
function playWrong() {
  playTone(220, 0.24, "square", 0.9);
  setTimeout(() => playTone(160, 0.30, "square", 0.9), 150);
}

// LOSE sting — descending
function playLose() {
  [392, 349, 330, 294].forEach((f, i) =>
    setTimeout(() => playTone(f, 0.24, "sawtooth", 0.8), i * 150)
  );
}

// CORRECT (normal question) — brighter & louder
function playCorrect() {
  [523, 659, 784].forEach((f, i) =>
    setTimeout(() => playTone(f, 0.22, "triangle", 0.7), i * 100)
  );
  // quick final chord for emphasis
  setTimeout(() => {
    [523, 659, 784].forEach((f) => playTone(f, 0.18, "triangle", 0.6));
  }, 330);
}

// Quick UI blip when selecting a question tile
function playSelect() {
  // low→high double blip; distinct from the correct chime
  playTone(450, 0.09, "sine", 0.9);
  setTimeout(() => playTone(720, 0.12, "triangle", 0.55), 70);
}

// WIN fanfare (million-dollar) — new, big and loud
function playWin() {
  const arp = [523, 659, 784, 988, 1175]; // C5 E5 G5 B5 D6
  arp.forEach((f, i) => setTimeout(() => playTone(f, 0.22, "triangle", 0.85), i * 120));
  // hold a bright final chord
  setTimeout(() => {
    [784, 988, 1175].forEach((f) => playTone(f, 0.6, "sawtooth", 0.75));
  }, arp.length * 120 + 40);
}
// (optional legacy) short fanfare if you still want it elsewhere
function playFanfare() {
  [523, 659, 784, 1046].forEach((f, i) =>
    setTimeout(() => playTone(f, 0.24, "triangle", 0.6), i * 160)
  );
}
  const gradientBg = { background: `linear-gradient(135deg, ${BRAND_A}, ${BRAND_B})` };

  const byGrade = useMemo(() => {
    const g = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    for (const q of QUESTIONS) g[q.grade].push(q);
    return g;
  }, []);

  const remaining = QUESTIONS.length - played.size;
  const current = useMemo(() => QUESTIONS.find((x) => x.id === currentId) || null, [currentId]);

  // Animated score readout
  const displayScore = useCountUp(score, 600);

  useKeyboard(
    (i) => {
      if (phase === "question" && !locked) handleAnswer(i);
      if (phase === "million" && !locked) handleMillionAnswer(i);
    },
    () => phase === "question" && !locked && backToBoard(),
    () => doHint(),
    () => restart()
  );

  // ——— Theme playback controls (no autoplay) ———
  async function playTheme() {
    try {
      const a = themeRef.current; if (!a) return;
      a.currentTime = 0; a.loop = false; a.volume = volumeRef.current;
      await a.play(); setIsThemePlaying(true);
    } catch { /* user blocked or quick click; no-op */ }
  }
  function stopTheme() {
    const a = themeRef.current; if (!a) return; a.pause(); setIsThemePlaying(false);
  }
  useEffect(() => {
    const a = themeRef.current; if (!a) return;
    const onEnded = () => setIsThemePlaying(false);
    a.addEventListener("ended", onEnded);
    return () => a.removeEventListener("ended", onEnded);
  }, []);

  function startQuestion(qid) {
    if (played.has(qid)) return;
    playSelect();   
    setCurrentId(qid);
    setPhase("question");
    setLocked(false); setResult(null); setPeekOverlay(false); setCopyModal(false);
  }

  function backToBoard() { setPhase("board"); }

  function restart() {
    setPhase("board"); setCurrentId(null); setPlayed(new Set()); setScore(0);
    setLifelines({ peek: false, copy: false, hint: false, save: false }); setSaveArmed(true);
    setLocked(false); setResult(null); setPeekOverlay(false); setCopyModal(false);
    setHintForId(null); // clear hint target
  }

  function consumeLifeline(name) { setLifelines((L) => ({ ...L, [name]: true })); }

  // ——— New: Cash Out ———
  function goCashOut() {
    if (phase === "win" || phase === "lose") return;
    setCashedAt(score);          // snapshot the prize at time of cash out
    setCashoutClaimed(false);
    setLocked(false);
    setResult(null);
    setPeekOverlay(false);
    setCopyModal(false);
    setPhase("cashout");
  }
  function claimCashout() {
    setCashoutClaimed(true);
    playFanfare();
  }

  // ——— Lifelines ———
  function doPeek() { if (phase !== "question" || locked || lifelines.peek) return; consumeLifeline("peek"); playSfx("peek"); setPeekOverlay(true); }
  function doCopy() { if (phase !== "question" || locked || lifelines.copy) return; consumeLifeline("copy"); playSfx("copy"); setCopyModal(true); }
  function doHint() {
    if (phase !== "question" || locked || lifelines.hint || !current) return;
    consumeLifeline("hint");
    playSfx("hint");
    setHintForId(current.id); // remember which question got the hint
  }

  // ——— Board question grading ———
  function handleAnswer(choiceIdx) {
    if (locked || !current) return; setLocked(true);
    const isCorrect = choiceIdx === current.answerIndex;
    if (isCorrect) {
      playCorrect();
      setScore((s) => s + current.grade * 100);
      setResult("correct");
      finalizeQuestion();
    } else {
      if (saveArmed && !lifelines.save) {
        consumeLifeline("save");
        setSaveArmed(false);
        setResult("wrong-saved");
        playWrong();
        finalizeQuestion();
      } else {
        setResult("wrong");
        playWrong();
        setTimeout(() => {
          setPhase("lose");
          setLocked(false);
          playLose();
        }, 800);
      }
    }
  }

  function finalizeQuestion() {
    setPlayed((p) => {
      const np = new Set(p); if (current) np.add(current.id);
      const allPlayed = np.size >= QUESTIONS.length;
      setTimeout(() => { setPhase(allPlayed ? "million" : "board"); setLocked(false); }, 900);
      return np;
    });
  }

  // ——— Million-dollar question ———
  function handleMillionAnswer(choiceIdx) {
    if (locked) return; setLocked(true);
    const isCorrect = choiceIdx === MILLION_Q.answerIndex;
    if (isCorrect) {
      playWin();
      setTimeout(() => { setPhase("win"); setLocked(false); }, 800);
    } else {
      playLose();
      setTimeout(() => { setPhase("lose"); setLocked(false); }, 1200);
    }
  }

  // Small helpers
  const lifelinePill = (label, used) => (
    <span className={classNames("px-2 py-1 rounded-md text-xs font-bold", used ? "bg-white/20 text-white/60" : "bg-white text-black")}>{label}</span>
  );

  // Wider container + bigger type in fullscreen
  const containerW = isFs ? "max-w-[1500px] md:max-w-[1700px]" : "max-w-5xl";
  const boardMinW = isFs ? "min-w-[1200px]" : ""; // allow wrap on small screens
  const h1Size = isFs ? "text-5xl md:text-6xl" : "text-2xl sm:text-3xl md:text-4xl";
  const gradeTitleSize = isFs ? "text-2xl" : "text-xl";
  const tilePad = isFs ? "p-4 md:p-5" : "p-3";
  const tileLabelSize = isFs ? "text-sm" : "text-xs";
  const tilePtsSize = isFs ? "text-base" : "text-sm";

  return (
    <div className="min-h-[100dvh] w-full text-white overscroll-none pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]" style={gradientBg}>
      {/* Hidden audio element for theme (no loop) */}
      <audio ref={themeRef} src={themeUrl} preload="auto" playsInline />

      {/* CONTENT CONTAINER (centers UI on desktop) */}
      <div className={classNames(containerW, "mx-auto")}>
        {/* Header */}
        <header className="px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}jon-5th-grade.jpg`}
              alt="Jon (5th grade)"
              className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover shadow"
              loading="eager"
              decoding="async"
            />
            <h1 className={classNames(h1Size, "font-extrabold tracking-tight drop-shadow")}>
              Are You Smarter Than a 5th Grader?
              <span className="hidden sm:block text-white/90 text-lg md:text-xl">Jon Edition</span>
            </h1>
          </div>
          <div className="text-right px-4 flex items-end gap-3 md:gap-4">
            <div>
              <div className="text-sm uppercase tracking-wider opacity-80">Score</div>
              <div className={classNames(isFs ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl", "font-black tabular-nums")}>{displayScore}</div>
              <div className="mt-2 flex items-center gap-2 justify-end">
                <label className="text-xs opacity-80">Vol</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(volume * 100)}
                  onChange={(e) => setVolume(parseInt(e.target.value, 10) / 100)}
                  className={classNames(isFs ? "w-36" : "w-28", "accent-white")}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {!isThemePlaying ? (
                <button onClick={playTheme} className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition">Play Theme Song</button>
              ) : (
                <button onClick={stopTheme} className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition">Stop Theme</button>
              )}
              <button onClick={toggleFullscreen} className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition">
                {isFs ? "Exit Fullscreen" : "Fullscreen"}
              </button>

              {/* New: Cash Out button (disabled while locked) */}
              {!["win", "lose", "cashout"].includes(phase) && (
                <button
                  onClick={goCashOut}
                  disabled={locked}
                  className="px-3 py-2 rounded-xl bg-yellow-300 text-black hover:opacity-90 text-sm font-semibold transition shadow"
                  title="Cash out now and claim Jon Bucks equal to your current score"
                >
                  Cash Out
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Lifelines strip (global) — hidden on million/win/lose/cashout */}
        {phase !== "million" && phase !== "win" && phase !== "lose" && phase !== "cashout" && (
          <div className="px-4 md:px-8">
            <div className="flex flex-wrap gap-2 items-center mb-2">
              {lifelinePill("Peek (Cody)", lifelines.peek)}
              {lifelinePill("Copy (Cody)", lifelines.copy)}
              {lifelinePill("Hint", lifelines.hint)}
              {lifelinePill("Save", lifelines.save)}
            </div>
          </div>
        )}

        {/* SPLASH PHASE - Top Scorer Display */}
        {phase === "splash" && (
          <main className="px-4 md:px-8 py-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-lg mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-black mb-4 text-yellow-300">
                🧠 Are You Smarter Than Jon?
              </h2>
              <p className="text-xl md:text-2xl mb-8 opacity-90">THE FINALE</p>

              {topScorerData?.top ? (
                <>
                  <div className="bg-white/20 rounded-2xl p-6 mb-6 backdrop-blur-md">
                    <p className="text-lg mb-4 font-bold uppercase tracking-wider">🏆 TOP SCORER PLAYS!</p>
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-xl p-6 mb-4">
                      <div className="text-4xl mb-2">🥇</div>
                      <div className="text-3xl font-black">{topScorerData.top.name}</div>
                      <div className="text-xl">{topScorerData.top.score} points</div>
                      <div className="text-sm opacity-80">Team {topScorerData.top.team}</div>
                    </div>
                    {topScorerData.runnerUp && (
                      <p className="text-sm opacity-80">
                        Runner-up: {topScorerData.runnerUp.name} ({topScorerData.runnerUp.score} pts)
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setPhase("board")}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-xl shadow-lg hover:scale-105 transition"
                  >
                    ▶️ Start Game with {topScorerData.top.name}
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-white/20 rounded-2xl p-6 mb-6 backdrop-blur-md">
                    <p className="text-lg opacity-80">No Game Night Hub data found.</p>
                    <p className="text-sm opacity-60 mt-2">Play this as a standalone game!</p>
                  </div>
                  <button
                    onClick={() => setPhase("board")}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-xl shadow-lg hover:scale-105 transition"
                  >
                    ▶️ Start Game
                  </button>
                </>
              )}
            </motion.div>
          </main>
        )}

        {/* BOARD PHASE */}
        {phase === "board" && (
          <main className="px-4 md:px-8 pb-10">
            <div className="mb-3 text-sm opacity-90">Pick any grade & question tile to begin. Remaining: {remaining}</div>
            <div className="overflow-x-auto select-none">
              <div className={classNames("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3", boardMinW)}>
                {[1, 2, 3, 4, 5].map((g) => (
                  <div key={g} className="bg-white/10 rounded-2xl p-3 md:p-4 backdrop-blur-md">
                    <div className={classNames("text-center font-black mb-2", gradeTitleSize)}>Grade {g}</div>
                    <div className="space-y-2">
                      {byGrade[g].map((q) => {
                        const isPlayed = played.has(q.id);
                        return (
                          <button
                            key={q.id}
                            disabled={isPlayed}
                            onClick={() => startQuestion(q.id)}
                            className={classNames(
                              "w-full text-left bg-white text-black rounded-xl shadow transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
                              tilePad,
                              isPlayed ? "opacity-40 line-through" : "hover:shadow-lg"
                            )}
                          >
                            <div className={classNames("uppercase tracking-widest opacity-70 font-bold", tileLabelSize)}>{q.subject}</div>
                            <div className={classNames("font-semibold", tilePtsSize)}>{q.grade * 100} pts</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-2 items-center">
              <button onClick={restart} className="px-4 py-2 rounded-xl bg-white text-black hover:opacity-90 transition">Restart</button>
            </div>
          </main>
        )}

        {/* QUESTION PHASE */}
        {phase === "question" && current && (
          <main className="px-4 md:px-8 py-6">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-5 md:p-7"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="inline-flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg:black/30 bg-black/30 text-white/90 text-xs uppercase tracking-wider">{current.subject}</span>
                  <span className="px-3 py-1 rounded-full bg-black/30 text-white/90 text-xs uppercase tracking-wider">Grade {current.grade}</span>
                  <span className="px-3 py-1 rounded-full bg-black/30 text-white/90 text-xs uppercase tracking-wider">{current.grade * 100} pts</span>
                </div>

                {/* Lifelines (actions) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={doPeek}
                    disabled={lifelines.peek || locked}
                    className={classNames(
                      "px-3 py-2 rounded-xl text-sm font-semibold transition shadow",
                      lifelines.peek || locked ? "bg-white/20 text-white/60" : "bg-white text-black hover:opacity-90"
                    )}
                    title="Ask Cody for her suggestion (nothing shown on screen)"
                  >
                    Peek
                  </button>
                  <button
                    onClick={doCopy}
                    disabled={lifelines.copy || locked}
                    className={classNames(
                      "px-3 py-2 rounded-xl text-sm font-semibold transition shadow",
                      lifelines.copy || locked ? "bg-white/20 text-white/60" : "bg-white text-black hover:opacity-90"
                    )}
                    title="Copy Cody's answer (host selects A/B/C/D)"
                  >
                    Copy
                  </button>
                  <button
                    onClick={doHint}
                    disabled={lifelines.hint || locked}
                    className={classNames(
                      "px-3 py-2 rounded-xl text-sm font-semibold transition shadow",
                      lifelines.hint || locked ? "bg-white/20 text-white/60" : "bg-white text-black hover:opacity-90"
                    )}
                    title="Reveal the written hint (once per game)"
                  >
                    Hint
                  </button>
                  <button
                    disabled
                    className={classNames(
                      "px-3 py-2 rounded-xl text-sm font-semibold transition shadow",
                      lifelines.save ? "bg-white/20 text-white/60" : "bg-white text-black"
                    )}
                    title="Save triggers automatically on your first wrong answer"
                  >
                    Save (auto)
                  </button>
                </div>
              </div>

              <div className="mt-4 md:mt-6">
                <div className={classNames(isFs ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl", "font-bold leading-snug drop-shadow-sm")}>{current.q}</div>

                {/* Hint — visible only for the specific question where it was used */}
                <AnimatePresence>
                  {lifelines.hint && hintForId === current.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-3 text-white/90 bg-black/30 rounded-xl p-3 text-sm"
                    >
                      💡 <span className="opacity-90">Hint:</span> {current.hint}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Choices */}
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 select-none">
                  {current.choices.map((choice, i) => {
                    const isAnswer = i === current.answerIndex;
                    let stateClasses = "";
                    if (locked && result === "correct" && isAnswer) stateClasses = "ring-4 ring-green-400";
                    if (locked && result?.startsWith("wrong") && isAnswer) stateClasses = "ring-4 ring-green-300";
                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        disabled={locked}
                        className={classNames(
                          "relative group text-left bg-white text-black rounded-2xl p-4 min-h-[56px] shadow hover:shadow-lg transition focus:outline-none focus-visible:ring-4 focus-visible:ring-black/40 cursor-pointer disabled:cursor-not-allowed",
                          stateClasses
                        )}
                      >
                        <div className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">{String.fromCharCode(65 + i)}</div>
                        <div className="text-lg leading-snug">{choice}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback + Controls */}
                <div className="min-h-10 mt-4 flex flex-wrap items-center gap-2">
                  <AnimatePresence>
                    {result === "correct" && (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-green-400/90 text-black font-semibold shadow"
                      >
                        ✅ Correct! +{current.grade * 100}
                      </motion.div>
                    )}
                    {result === "wrong-saved" && (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-300/90 text-black font-semibold shadow"
                      >
                        🛟 Wrong — but your Save rescued you!
                      </motion.div>
                    )}
                    {result === "wrong" && (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-400/90 text-black font-semibold shadow"
                      >
                        ❌ Not quite.
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button onClick={backToBoard} disabled={locked} className="px-4 py-2 rounded-xl bg-black/40 text-white hover:bg-black/50 transition" title="B to go back">
                    Back to Board
                  </button>
                  <button onClick={restart} className="px-4 py-2 rounded-xl bg-white text-black hover:opacity-90 transition" title="R to restart">
                    Restart
                  </button>
                </div>
              </div>
            </motion.div>
          </main>
        )}

        {/* OVERLAYS */}
        <AnimatePresence>
          {peekOverlay && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white text-black rounded-2xl p-6 shadow max-w-md w-[90%] text-center">
                <div className="text-xl font-black mb-2">Peek (Cody)</div>
                <p>
                  Ask <strong>Cody</strong> for her suggestion now. Nothing will be shown on screen.
                </p>
                <button onClick={() => setPeekOverlay(false)} className="mt-4 px-4 py-2 rounded-xl bg-black text-white hover:opacity-90 transition">
                  Continue
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {copyModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white text-black rounded-2xl p-6 shadow max-w-md w-[90%] text-center">
                <div className="text-xl font-black mb-3">Copy (Cody)</div>
                <p className="mb-3">Select the option Cody just said:</p>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <button key={i} onClick={() => { setCopyModal(false); handleAnswer(i); }} className="px-4 py-3 rounded-xl bg-black text-white hover:opacity-90 transition">
                      {String.fromCharCode(65 + i)}
                    </button>
                  ))}
                </div>
                <button onClick={() => setCopyModal(false)} className="mt-4 px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition">
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MILLION-DOLLAR QUESTION */}
        {phase === "million" && (
          <main className="px-4 md:px-8 py-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8">
              <div className="text-center mb-4">
                <div className={classNames(isFs ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl", "font-black")}>💰 Million-Dollar Question</div>
                <div className="mt-1 text-white/90">No lifelines remain. Choose wisely.</div>
              </div>
              <div className={classNames(isFs ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl", "font-bold leading-snug drop-shadow-sm text-center")}>
                {MILLION_Q.q}
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                {MILLION_Q.choices.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => handleMillionAnswer(i)}
                    disabled={locked}
                    className="text-left bg-white text-black rounded-2xl p-4 shadow hover:shadow-lg transition focus:outline-none focus-visible:ring-4 focus-visible:ring-black/40"
                  >
                    <div className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">{String.fromCharCode(65 + i)}</div>
                    <div className="text-lg leading-snug">{c}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          </main>
        )}

        {/* WIN SCREEN */}
        {phase === "win" && (
          <main className="px-4 md:px-8 py-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white text-black rounded-2xl p-6 shadow text-center">
              <div className={classNames(isFs ? "text-5xl md:text-6xl" : "text-3xl md:text-5xl", "font-black mb-2")}>🏆 YOU ARE SMARTER THAN JON!</div>
              <div className={classNames(isFs ? "text-3xl" : "text-2xl md:text-3xl")}>
                <WinWinnings />
              </div>
              <div className="mt-4">
                <button onClick={restart} className="px-5 py-3 rounded-2xl bg-black text-white hover:opacity-90 transition">Play Again</button>
              </div>
            </motion.div>
          </main>
        )}

        {/* LOSE SCREEN */}
        {phase === "lose" && (
          <main className="px-4 md:px-8 py-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white text-black rounded-2xl p-6 shadow text-center">
              <div className="text-2xl md:text-3xl font-black mb-2">Winnings: $0</div>
              <div className={classNames(isFs ? "text-5xl md:text-6xl" : "text-3xl md:text-5xl", "font-black")}>Repeat after me:</div>
              <div className="mt-2 text-3xl md:text-5xl font-black text-red-600">“I am not smarter than Jon.”</div>
              <div className="mt-4">
                <button onClick={restart} className="px-5 py-3 rounded-2xl bg-black text-white hover:opacity-90 transition">Try Again</button>
              </div>
            </motion.div>
          </main>
        )}

        {/* CASH OUT SCREEN */}
        {phase === "cashout" && (
          <main className="px-4 md:px-8 py-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white text-black rounded-2xl p-6 shadow text-center max-w-2xl mx-auto">
              {!cashoutClaimed ? (
                <>
                  <div className={classNames(isFs ? "text-5xl md:text-6xl" : "text-3xl md:text-5xl", "font-black")}>Repeat after me:</div>
                  <div className="mt-2 text-2xl md:text-4xl font-black text-red-600">“I am not smarter than Jon.”</div>
                  <div className="mt-6 text-lg">
                    Congratulations You’re cashing out with some JON BUCKS. 
                  </div>
                  <div className="mt-2 text-xl font-semibold">Current Score: {score.toLocaleString()} Jon Bucks</div>
                  <div className="mt-6">
                    <button
                      onClick={claimCashout}
                      className="px-5 py-3 rounded-2xl bg-yellow-300 hover:bg-yellow-400 text-black font-bold transition shadow"
                    >
                      I said it — Claim Jon Bucks
                    </button>
                  </div>
                  {/* <div className="mt-4">
                    <button onClick={restart} className="px-5 py-3 rounded-2xl bg-black text-white hover:opacity-90 transition">Cancel & Restart</button>
                  </div> */}
                </>
              ) : (
                <>
                  <div className={classNames(isFs ? "text-5xl md:text-6xl" : "text-3xl md:text-5xl", "font-black mb-2")}>🎉 You Cashed Out!</div>
                  <div className={classNames(isFs ? "text-3xl" : "text-2xl md:text-3xl", "mb-2")}>
                    Prize:&nbsp;
                    <CountTo to={cashedAt} suffix=" Jon Bucks" />
                  </div>
                  <div className="text-sm text-black/70">Nice try champ. Maybe one day you'll have what it takes.</div>
                  <div className="mt-6">
                    <button onClick={restart} className="px-5 py-3 rounded-2xl bg-black text-white hover:opacity-90 transition">Play Again</button>
                  </div>
                </>
              )}
            </motion.div>
          </main>
        )}
      </div>
    </div>
  );
}
