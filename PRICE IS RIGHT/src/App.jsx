import { useMemo, useState, useEffect, useRef, useCallback } from "react";

/**
 * THE PRICE IS RIGHT - FIXED VERSION
 * Major fixes applied to game flow and logic
 */

// ===== Constants & Data =====
const CURRENCY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const CONTESTANTS_ROW_ITEMS = [
  { name: "Bluetooth Speaker", price: 89, img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=800&auto=format&fit=crop" },
  { name: "Coffee Grinder", price: 45, img: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop" },
  { name: "Desk Lamp", price: 67, img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop" },
  { name: "Phone Charger", price: 29, img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop" },
  { name: "Kitchen Scale", price: 35, img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800&auto=format&fit=crop" },
  { name: "Water Bottle", price: 25, img: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=800&auto=format&fit=crop" },
];

const PRICING_GAME_ITEMS = [
  { name: "Premium Coffee Maker", price: 149, img: "https://images.unsplash.com/photo-1517256673644-36ad11246d21?q=80&w=800&auto=format&fit=crop", description: "12-cup programmable with thermal carafe" },
  { name: "Air Fryer Oven", price: 199, img: "https://images.unsplash.com/photo-1585515656491-9ba0c2d1d1d0?q=80&w=800&auto=format&fit=crop", description: "8-in-1 countertop convection oven" },
  { name: "Robot Vacuum", price: 399, img: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?q=80&w=800&auto=format&fit=crop", description: "Smart mapping with app control" },
  { name: "4K Smart TV", price: 649, img: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800&auto=format&fit=crop", description: "55-inch LED with streaming apps" },
  { name: "Gaming Chair", price: 259, img: "https://images.unsplash.com/photo-1598300183876-28fd72a0f5e6?q=80&w=800&auto=format&fit=crop", description: "Ergonomic with RGB lighting" },
  { name: "Espresso Machine", price: 449, img: "https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=800&auto=format&fit=crop", description: "Professional grade with milk frother" },
];

const SHOWCASE_ITEMS = [
  { 
    name: "Luxury European Vacation", 
    price: 8500, 
    img: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=800&auto=format&fit=crop", 
    description: "10-day tour of Paris, Rome, and Barcelona with 4-star hotels, meals, and guided tours included"
  },
  { 
    name: "Dream Kitchen Makeover", 
    price: 12000, 
    img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800&auto=format&fit=crop", 
    description: "Complete kitchen renovation with premium appliances, granite countertops, and custom cabinetry"
  },
  { 
    name: "Luxury Car Package", 
    price: 28000, 
    img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop", 
    description: "Brand new sedan with leather interior, premium sound system, and 3-year warranty"
  },
  { 
    name: "Home Entertainment Center", 
    price: 6500, 
    img: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=800&auto=format&fit=crop", 
    description: "75-inch 8K TV, surround sound system, gaming console, and premium streaming setup"
  },
];

const CLASSIC_GAMES = ["Hi-Lo", "Range Game", "Plinko", "Cliffhangers"];
const PLINKO_PRIZES = [100, 500, 1000, 0, 10000, 0, 1000, 500, 100];

const PLAYER_REACTIONS = {
  win: ["🎉", "💪", "👍", "🔥", "⭐"],
  lose: ["😔", "💔", "😞", "🤦‍♂️", "😤"],
  close: ["😮", "🤏", "😬", "😱", "👀"],
  perfect: ["🎯", "🏆", "💯", "👑", "🎊"]
};

// ===== Utility Functions =====
function shuffle(arr) {
  if (!Array.isArray(arr)) return [];
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function validateBid(bid, maxPrice) {
  const numBid = Number(bid);
  return !isNaN(numBid) && numBid > 0 && numBid <= maxPrice + 1000;
}

function calculateAccuracy(bid, actualPrice) {
  const diff = Math.abs(actualPrice - bid);
  return Math.max(0, 100 - (diff / actualPrice * 100));
}

// ===== Audio System =====
const AudioManager = {
  createAudioContext() {
    try {
      return new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return null;
    }
  },

  playTheme() {
    const audioContext = this.createAudioContext();
    if (!audioContext) return;
    
    try {
      const melody = [523, 659, 784, 1047, 1175, 1047, 784, 659, 523];
      melody.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(0, audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(audioContext.currentTime + i * 0.15);
        osc.stop(audioContext.currentTime + i * 0.15 + 0.8);
      });
    } catch (e) {
      console.log("Audio playback failed");
    }
  },

  playWin() {
    const audioContext = this.createAudioContext();
    if (!audioContext) return;
    
    try {
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.frequency.value = freq;
        osc.type = "square";
        gain.gain.setValueAtTime(0, audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(audioContext.currentTime + i * 0.1);
        osc.stop(audioContext.currentTime + i * 0.1 + 0.3);
      });
    } catch (e) {
      console.log("Audio playback failed");
    }
  },

  playLose() {
    const audioContext = this.createAudioContext();
    if (!audioContext) return;
    
    try {
      const notes = [300, 250, 200];
      notes.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.frequency.value = freq;
        osc.type = "sawtooth";
        gain.gain.setValueAtTime(0, audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.01);
        gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(audioContext.currentTime + i * 0.15);
        osc.stop(audioContext.currentTime + i * 0.15 + 0.4);
      });
    } catch (e) {
      console.log("Audio playback failed");
    }
  }
};

// ===== Responsive Button Styles =====
const btn = {
  primary: "inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-4 font-black text-white shadow-lg sm:shadow-2xl transition-all duration-200 hover:-translate-y-0.5 sm:hover:-translate-y-1 hover:shadow-xl sm:hover:shadow-3xl active:translate-y-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 hover:from-yellow-300 hover:via-orange-300 hover:to-red-400 border-2 sm:border-4 border-yellow-200 text-sm sm:text-lg",
  green: "inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-4 font-black text-white shadow-lg sm:shadow-2xl transition-all duration-200 hover:-translate-y-0.5 sm:hover:-translate-y-1 hover:shadow-xl sm:hover:shadow-3xl active:translate-y-0 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 border-2 sm:border-4 border-emerald-200 text-sm sm:text-lg",
  blue: "inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-4 font-black text-white shadow-lg sm:shadow-2xl transition-all duration-200 hover:-translate-y-0.5 sm:hover:-translate-y-1 hover:shadow-xl sm:hover:shadow-3xl active:translate-y-0 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 border-2 sm:border-4 border-blue-200 text-sm sm:text-lg",
  red: "inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-4 font-black text-white shadow-lg sm:shadow-2xl transition-all duration-200 hover:-translate-y-0.5 sm:hover:-translate-y-1 hover:shadow-xl sm:hover:shadow-3xl active:translate-y-0 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 border-2 sm:border-4 border-red-200 text-sm sm:text-lg",
  disabled: "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-gray-500 bg-gray-300 cursor-not-allowed text-sm"
};

// ===== Components =====
function InitialsAvatar({ name, winner = false, onStage = false, reaction = null }) {
  const safeName = name || "Player";
  const initials = safeName
    .split(" ")
    .map((n) => n[0] || "?")
    .join("")
    .slice(0, 2)
    .toUpperCase();
  
  return (
    <div className={`relative grid h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 place-items-center rounded-full text-xs sm:text-sm font-black text-white shadow-lg transition-all duration-300 ${
      winner 
        ? "bg-gradient-to-br from-yellow-400 to-orange-500 ring-2 sm:ring-4 ring-yellow-300 animate-pulse scale-110" 
        : onStage
        ? "bg-gradient-to-br from-purple-500 to-pink-600 ring-2 ring-purple-300"
        : "bg-gradient-to-br from-blue-500 to-indigo-600"
    }`}>
      {initials}
      {winner && (
        <div className="absolute -top-2 sm:-top-3 -right-2 sm:-right-3 text-xl sm:text-3xl animate-bounce">👑</div>
      )}
      {onStage && (
        <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 text-sm sm:text-xl animate-pulse">⭐</div>
      )}
      {reaction && (
        <div className="absolute -bottom-1 -right-1 text-lg animate-bounce">{reaction}</div>
      )}
    </div>
  );
}

function PrizeCard({ item, revealed = false, winner = false, withSpotlight = false }) {
  if (!item) return null;
  
  return (
    <div className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 sm:border-4 transition-all duration-500 ${
      winner 
        ? "border-yellow-400 bg-yellow-50 shadow-xl sm:shadow-2xl ring-2 sm:ring-4 ring-yellow-300 scale-105" 
        : revealed 
          ? "border-gray-300 bg-white shadow-lg sm:shadow-xl" 
          : "border-purple-300 bg-purple-50 shadow-md sm:shadow-lg"
    } ${withSpotlight ? "animate-pulse" : ""}`}>
      <div className="relative">
        <img 
          src={item.img} 
          alt={item.name} 
          className="h-40 sm:h-48 md:h-64 w-full object-cover" 
        />
        {winner && (
          <div className="absolute inset-0 bg-yellow-400/20 flex items-center justify-center">
            <div className="text-4xl sm:text-6xl animate-bounce">🏆</div>
          </div>
        )}
        {!revealed && (
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent flex items-end justify-center pb-2 sm:pb-4">
            <div className="bg-black/70 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold animate-pulse">
              MYSTERY PRIZE
            </div>
          </div>
        )}
      </div>
      <div className="p-3 sm:p-4 md:p-6">
        <h3 className="text-base sm:text-lg md:text-xl font-black text-gray-900 mb-1 sm:mb-2">{item.name}</h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">{item.description}</p>
        {revealed && (
          <div className="text-xl sm:text-2xl md:text-3xl font-black text-green-600 animate-pulse">
            {CURRENCY.format(item.price)}
          </div>
        )}
      </div>
    </div>
  );
}

function ResponsiveWheel({ onSpinComplete, isSpinning, onWheelClick, canSpin }) {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const size = isMobile ? 280 : 380;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const r = (size / 2) - 30;

    ctx.clearRect(0, 0, size, size);

    // Outer shadow
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r + 15, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fill();
    ctx.restore();

    // Wheel segments
    const segments = 20;
    const anglePer = (Math.PI * 2) / segments;

    for (let i = 0; i < segments; i++) {
      const start = i * anglePer + rotation;
      const end = (i + 1) * anglePer + rotation;
      const value = (i + 1) * 5;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      
      const colors = [
        "#FFD700", "#FF6B35", "#4ECDC4", "#45B7D1", 
        "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8",
        "#FF9999", "#87CEEB", "#DEB887", "#F0E68C",
        "#FFB6C1", "#20B2AA", "#F4A460", "#9370DB",
        "#3CB371", "#FF7F50", "#6495ED", "#DC143C"
      ];
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();

      // Segment borders
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(end) * r, cy + Math.sin(end) * r);
      ctx.stroke();
      ctx.restore();

      // Value labels
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + anglePer / 2);
      ctx.textAlign = "center";
      ctx.fillStyle = "#000";
      ctx.font = `bold ${isMobile ? '12px' : '16px'} Arial`;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      const label = value === 100 ? "$1.00" : `${value}¢`;
      ctx.strokeText(label, r - (isMobile ? 20 : 30), 4);
      ctx.fillText(label, r - (isMobile ? 20 : 30), 4);
      ctx.restore();
    }

    // Center hub
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
    gradient.addColorStop(0, "#FFD700");
    gradient.addColorStop(0.5, "#FFA500");
    gradient.addColorStop(1, "#FF8C00");
    
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = "#B8860B";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center shine
    ctx.beginPath();
    ctx.arc(cx - 8, cy - 8, 12, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fill();

    // Pointer
    ctx.save();
    ctx.translate(cx, 20);
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(15, 0);
    ctx.lineTo(0, 20);
    ctx.closePath();
    ctx.fillStyle = "#FF0000";
    ctx.fill();
    ctx.strokeStyle = "#8B0000";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

  }, [rotation, size, isMobile]);

  const handleWheelClick = useCallback(() => {
    if (!canSpin || isSpinning) return;
    
    const startRotation = rotation;
    const spins = 4 + Math.random() * 6;
    const finalValue = Math.floor(Math.random() * 20) + 1;
    const finalPosition = (finalValue * Math.PI * 2) / 20;
    const targetRotation = startRotation + (spins * Math.PI * 2) + finalPosition;
    
    const duration = 3000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + (targetRotation - startRotation) * easeOut;
      setRotation(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        const wheelScore = finalValue === 20 ? 1.0 : (finalValue * 5) / 100;
        onSpinComplete(wheelScore);
      }
    };

    requestAnimationFrame(animate);
    onWheelClick();
  }, [canSpin, isSpinning, rotation, onSpinComplete, onWheelClick]);

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative rounded-full p-2 sm:p-4 transition-all duration-300 ${
          canSpin 
            ? "cursor-pointer hover:scale-105 shadow-lg sm:shadow-2xl bg-gradient-to-br from-yellow-100 to-orange-100" 
            : "cursor-not-allowed opacity-75 shadow-md bg-gray-100"
        }`}
        onClick={handleWheelClick}
      >
        <canvas ref={canvasRef} />
        {!isSpinning && canSpin && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/80 text-white px-3 sm:px-6 py-1 sm:py-2 rounded-full font-black text-sm sm:text-lg animate-pulse">
              {isMobile ? "TAP!" : "CLICK TO SPIN!"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Pricing Games
function HiLoGame({ item, onComplete, active = false }) {
  const [displayPrice, setDisplayPrice] = useState(null);
  const [guess, setGuess] = useState(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (active && item?.price) {
      const variation = Math.floor(Math.random() * 200) - 100;
      setDisplayPrice(Math.max(1, item.price + variation));
    }
  }, [active, item]);

  const makeGuess = useCallback((higher) => {
    if (!active || revealed || !displayPrice || !item?.price) return;
    
    setGuess(higher);
    setRevealed(true);
    
    const correct = higher ? item.price > displayPrice : item.price < displayPrice;
    
    setTimeout(() => {
      onComplete(correct ? 1000 : 0);
    }, 2000);
  }, [active, revealed, displayPrice, item, onComplete]);

  if (!displayPrice || !item) return null;

  return (
    <div className="bg-purple-900 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border-2 sm:border-4 border-yellow-400">
      <div className="text-center mb-4 sm:mb-6">
        <h3 className="text-xl sm:text-2xl font-black text-yellow-400 mb-2 sm:mb-4">HI-LO</h3>
        <div className="mb-4">
          <PrizeCard item={item} revealed={true} />
        </div>
        <div className="text-white text-sm sm:text-lg mb-4">
          Is the actual price HIGHER or LOWER than {CURRENCY.format(displayPrice)}?
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <button
          onClick={() => makeGuess(true)}
          disabled={!active || revealed}
          className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl border-2 sm:border-4 font-bold text-lg sm:text-xl ${
            revealed && guess === true
              ? item.price > displayPrice 
                ? "bg-green-500 border-green-300 text-white"
                : "bg-red-500 border-red-300 text-white"
              : active && !revealed
                ? "bg-blue-600 border-blue-400 text-white hover:bg-blue-500"
                : "bg-gray-400 border-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          HIGHER
        </button>
        <button
          onClick={() => makeGuess(false)}
          disabled={!active || revealed}
          className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl border-2 sm:border-4 font-bold text-lg sm:text-xl ${
            revealed && guess === false
              ? item.price < displayPrice 
                ? "bg-green-500 border-green-300 text-white"
                : "bg-red-500 border-red-300 text-white"
              : active && !revealed
                ? "bg-blue-600 border-blue-400 text-white hover:bg-blue-500"
                : "bg-gray-400 border-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          LOWER
        </button>
      </div>
      
      {revealed && (
        <div className="text-center text-white text-lg sm:text-xl font-bold">
          Actual price: {CURRENCY.format(item.price)}
        </div>
      )}
    </div>
  );
}

function PlinkoBoard({ onChipDrop, active = false }) {
  const [animating, setAnimating] = useState(false);
  const [finalSlot, setFinalSlot] = useState(null);

  const dropChip = useCallback(() => {
    if (!active || animating) return;
    
    setAnimating(true);
    
    setTimeout(() => {
      const slot = Math.floor(Math.random() * PLINKO_PRIZES.length);
      setFinalSlot(slot);
      const prize = PLINKO_PRIZES[slot] || 0;
      
      setTimeout(() => {
        onChipDrop(prize);
        setAnimating(false);
        setFinalSlot(null);
      }, 1000);
    }, 2000);
  }, [active, animating, onChipDrop]);

  return (
    <div className="relative bg-blue-900 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border-2 sm:border-4 border-yellow-400">
      <div className="text-center mb-4 sm:mb-6">
        <h3 className="text-xl sm:text-2xl font-black text-yellow-400 mb-2">PLINKO!</h3>
        <button 
          onClick={dropChip}
          disabled={!active || animating}
          className={`${active && !animating ? btn.green : btn.disabled}`}
        >
          {animating ? "CHIP FALLING..." : "DROP CHIP"}
        </button>
      </div>
      
      {/* Plinko Board Visual */}
      <div className="relative bg-blue-800 rounded-lg p-4 mb-4">
        {/* Pegs */}
        <div className="grid grid-cols-9 gap-2 mb-4">
          {Array.from({ length: 45 }, (_, i) => (
            <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full mx-auto"></div>
          ))}
        </div>
        
        {/* Prize Slots */}
        <div className="grid grid-cols-9 gap-1">
          {PLINKO_PRIZES.map((prize, index) => (
            <div 
              key={index} 
              className={`text-center p-2 rounded-lg font-bold text-xs sm:text-sm ${
                finalSlot === index 
                  ? "bg-yellow-400 text-black animate-pulse" 
                  : prize === 10000 ? "bg-red-600 text-white" 
                  : prize === 1000 ? "bg-green-600 text-white" 
                  : prize === 500 ? "bg-blue-600 text-white" 
                  : prize === 100 ? "bg-purple-600 text-white" 
                  : "bg-gray-600 text-white"
              }`}
            >
              {prize === 0 ? "LOSE" : `${prize}`}
            </div>
          ))}
        </div>
      </div>
      
      {animating && (
        <div className="text-yellow-400 text-center animate-bounce">
          Chip is falling...
        </div>
      )}
    </div>
  );
}

function RangeGame({ item, onComplete, active = false }) {
  const [currentRange, setCurrentRange] = useState(-1);
  const [revealed, setRevealed] = useState(false);
  
  const ranges = [
    { min: 0, max: 150, label: "$0-$150" },
    { min: 151, max: 300, label: "$151-$300" },
    { min: 301, max: 500, label: "$301-$500" },
    { min: 501, max: 999, label: "$501+" }
  ];

  const handleRangeSelect = useCallback((rangeIndex) => {
    if (!active || revealed || !item?.price) return;
    
    setCurrentRange(rangeIndex);
    setRevealed(true);
    
    const selectedRange = ranges[rangeIndex];
    const correct = item.price >= selectedRange.min && 
                   (selectedRange.max === 999 ? true : item.price <= selectedRange.max);
    
    setTimeout(() => {
      onComplete(correct ? 1000 : 0);
    }, 2000);
  }, [active, revealed, item, onComplete]);

  if (!item) return null;

  return (
    <div className="bg-green-900 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border-2 sm:border-4 border-yellow-400">
      <div className="text-center mb-4 sm:mb-6">
        <h3 className="text-xl sm:text-2xl font-black text-yellow-400 mb-2 sm:mb-4">RANGE GAME</h3>
        <div className="mb-4">
          <PrizeCard item={item} revealed={true} />
        </div>
        <div className="text-white text-sm sm:text-lg mb-4">Which price range is correct?</div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
        {ranges.map((range, index) => (
          <button
            key={index}
            onClick={() => handleRangeSelect(index)}
            disabled={!active || revealed}
            className={`p-3 sm:p-4 rounded-xl border-2 sm:border-4 font-bold text-sm sm:text-lg transition-all ${
              revealed && index === currentRange
                ? (item.price >= range.min && (range.max === 999 || item.price <= range.max))
                  ? "bg-green-500 border-green-300 text-white"
                  : "bg-red-500 border-red-300 text-white"
                : active && !revealed
                  ? "bg-blue-600 border-blue-400 text-white hover:bg-blue-500" 
                  : "bg-gray-400 border-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
      
      {revealed && (
        <div className="text-center text-white text-lg sm:text-xl font-bold">
          Actual price: {CURRENCY.format(item.price)}
        </div>
      )}
    </div>
  );
}

function CliffhangersGame({ item, onComplete, active = false }) {
  const [climberPosition, setClimberPosition] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [currentDigit, setCurrentDigit] = useState(0);
  const [guesses, setGuesses] = useState([]);

  // Safety check and reset when item changes
  useEffect(() => {
    if (active && item) {
      setClimberPosition(0);
      setGameOver(false);
      setCurrentDigit(0);
      setGuesses([]);
    }
  }, [active, item]);

  if (!item || !item.price) {
    return (
      <div className="bg-green-800 rounded-2xl p-4 border-2 border-yellow-400 text-white text-center">
        <h3 className="text-xl font-black text-yellow-400 mb-4">CLIFFHANGERS</h3>
        <p>Loading game...</p>
      </div>
    );
  }

  const priceString = item.price.toString().padStart(3, '0');
  const actualDigits = priceString.split('').map(Number);

  const makeGuess = useCallback((digit) => {
    if (!active || gameOver || currentDigit >= actualDigits.length) return;

    const correct = digit === actualDigits[currentDigit];
    const newGuesses = [...guesses, { digit, correct, actual: actualDigits[currentDigit] }];
    setGuesses(newGuesses);

    if (!correct) {
      const newPosition = climberPosition + 1;
      setClimberPosition(newPosition);
      if (newPosition >= 3) {
        setGameOver(true);
        AudioManager.playLose();
        setTimeout(() => onComplete(0), 2000);
        return;
      }
    }

    const nextDigit = currentDigit + 1;
    setCurrentDigit(nextDigit);

    if (nextDigit >= actualDigits.length) {
      setGameOver(true);
      AudioManager.playWin();
      setTimeout(() => onComplete(2000), 2000);
    }
  }, [active, gameOver, currentDigit, actualDigits, climberPosition, guesses, onComplete]);

  return (
    <div className="bg-green-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border-2 sm:border-4 border-yellow-400">
      <div className="text-center mb-4 sm:mb-6">
        <h3 className="text-xl sm:text-2xl font-black text-yellow-400 mb-2 sm:mb-4">CLIFFHANGERS</h3>
        <div className="mb-4">
          <PrizeCard item={item} revealed={true} />
        </div>
        <div className="text-white text-sm sm:text-lg mb-4">
          Guess each digit of the price. Wrong guess moves the climber up!
        </div>
      </div>

      <div className="mb-4 sm:mb-6 text-center">
        <div className="text-4xl sm:text-6xl mb-2">🧗‍♂️</div>
        <div className="text-white text-sm sm:text-base">
          Position: {climberPosition}/3 {climberPosition >= 3 && "💀 FELL OFF!"}
        </div>
      </div>

      <div className="flex justify-center gap-1 sm:gap-2 mb-4 sm:mb-6">
        {actualDigits.map((digit, index) => (
          <div
            key={index}
            className={`w-12 h-12 sm:w-16 sm:h-16 border-2 sm:border-4 border-white rounded-lg flex items-center justify-center text-lg sm:text-2xl font-black ${
              index < guesses.length 
                ? guesses[index].correct 
                  ? "bg-green-500 text-white" 
                  : "bg-red-500 text-white"
                : index === currentDigit
                  ? "bg-yellow-400 text-black"
                  : "bg-gray-600 text-gray-400"
            }`}
          >
            {index < guesses.length ? actualDigits[index] : "?"}
          </div>
        ))}
      </div>

      {active && !gameOver && currentDigit < actualDigits.length && (
        <div className="grid grid-cols-5 gap-2 max-w-sm mx-auto">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => makeGuess(num)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 sm:py-3 px-2 sm:px-4 rounded-lg border-2 border-blue-400 text-sm sm:text-base"
            >
              {num}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Main App Component
export default function App() {
  // Core game state
  const [numPlayers, setNumPlayers] = useState(4);
  const [playerNames, setPlayerNames] = useState(Array(20).fill(""));
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePhase, setGamePhase] = useState("setup");

  // Game progression state
  const [stageContestants, setStageContestants] = useState([]);
  const [currentContestantsRowItem, setCurrentContestantsRowItem] = useState(0);
  const [contestantsRowBids, setContestantsRowBids] = useState({});
  const [contestantsRowWinner, setContestantsRowWinner] = useState(null);
  const [currentPricingGame, setCurrentPricingGame] = useState(0);
  const [currentGame, setCurrentGame] = useState(null);
  const [showcaseWinner, setShowcaseWinner] = useState(null);
  const [showcaseRevealed, setShowcaseRevealed] = useState(false);
  const [showcaseBids, setShowcaseBids] = useState({});
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentSpinnerIndex, setCurrentSpinnerIndex] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [playerReactions, setPlayerReactions] = useState({});

  // Data decks
  const contestantsRowDeck = useMemo(() => shuffle(CONTESTANTS_ROW_ITEMS), []);
  const pricingGamesDeck = useMemo(() => shuffle(PRICING_GAME_ITEMS), []);
  const showcaseDeck = useMemo(() => shuffle(SHOWCASE_ITEMS).slice(0, 2), []);
  const gameTypes = useMemo(() => shuffle(CLASSIC_GAMES), []);

  // Event handlers
  const makeAnnouncement = useCallback((text) => {
    setAnnouncement(text);
    setTimeout(() => setAnnouncement(""), 4000);
  }, []);

  const showPlayerReaction = useCallback((playerId, type) => {
    const reactions = PLAYER_REACTIONS[type] || PLAYER_REACTIONS.win;
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];
    setPlayerReactions(prev => ({ ...prev, [playerId]: reaction }));
    setTimeout(() => {
      setPlayerReactions(prev => ({ ...prev, [playerId]: null }));
    }, 3000);
  }, []);

  const startGame = useCallback(() => {
    const validPlayerCount = Math.max(2, Math.min(20, numPlayers));
    const initialPlayers = Array.from({ length: validPlayerCount }, (_, i) => ({
      id: i,
      name: playerNames[i]?.trim() || `Player ${i + 1}`,
      score: 0,
      onStage: false,
      wheelScore: null,
      wonWheel: false
    }));
    
    setPlayers(initialPlayers);
    setGameStarted(true);
    setGamePhase("contestantsRow");
    setCurrentContestantsRowItem(0);
    
    AudioManager.playTheme();
    makeAnnouncement("Welcome to The Price Is Right! Let's start with Contestants' Row!");
  }, [numPlayers, playerNames, makeAnnouncement]);

  const handleContestantsRowBid = useCallback((playerId, bid) => {
    const cleanBid = bid.replace(/[^\d]/g, "");
    if (cleanBid.length <= 6) {
      setContestantsRowBids(prev => ({ ...prev, [playerId]: cleanBid }));
    }
  }, []);

  const submitContestantsRowBids = useCallback(() => {
    const currentItem = contestantsRowDeck[currentContestantsRowItem];
    if (!currentItem?.price) return;

    // Check if all eligible players have placed bids
    const eligiblePlayers = players.filter(p => !p.onStage);
    const hasBids = eligiblePlayers.filter(player => 
      contestantsRowBids[player.id] && contestantsRowBids[player.id].trim() !== ""
    );
    
    if (hasBids.length !== eligiblePlayers.length) {
      makeAnnouncement("All contestants must place a bid!");
      return;
    }

    let winningBid = -1;
    let winners = [];

    Object.entries(contestantsRowBids).forEach(([playerId, bid]) => {
      if (!validateBid(bid, currentItem.price)) return;
      
      const numBid = Number(bid);
      if (numBid <= currentItem.price) {
        if (numBid > winningBid) {
          winningBid = numBid;
          winners = [playerId];
        } else if (numBid === winningBid) {
          winners.push(playerId);
        }
      }
    });

    let winnerId = winners.length === 1 ? winners[0] : 
                   winners.length > 1 ? winners[Math.floor(Math.random() * winners.length)] : null;

    const winner = winnerId ? players.find(p => p.id === parseInt(winnerId)) : null;
    setContestantsRowWinner(winner);

    if (winner) {
      AudioManager.playWin();
      showPlayerReaction(winner.id, "win");
      makeAnnouncement(`${winner.name}, come on down! You're the next contestant!`);
      
      setPlayers(prev => prev.map(p => 
        p.id === winner.id ? { ...p, onStage: true } : p
      ));
      setStageContestants(prev => [...prev, winner]);
      
      setTimeout(() => {
        const newStageCount = stageContestants.length + 1;
        if (newStageCount < 4 && players.filter(p => !p.onStage && p.id !== winner.id).length > 0) {
          // Reset for next contestants row round only if we need more contestants and have available players
          setContestantsRowBids({});
          setContestantsRowWinner(null);
          setCurrentContestantsRowItem(prev => (prev + 1) % contestantsRowDeck.length);
        } else {
          // Move to pricing games
          setGamePhase("pricingGames");
          setCurrentGame(gameTypes[0]);
          makeAnnouncement("Time for our first pricing game!");
        }
      }, 3000);
    } else {
      AudioManager.playLose();
      makeAnnouncement("Nobody wins! Let's try again!");
      setTimeout(() => {
        setContestantsRowBids({});
        setContestantsRowWinner(null);
      }, 2000);
    }
  }, [contestantsRowDeck, currentContestantsRowItem, contestantsRowBids, players, stageContestants, gameTypes, makeAnnouncement, showPlayerReaction]);

  const handleGameComplete = useCallback((points) => {
    const validPoints = Math.max(0, Math.min(10000, points || 0));
    const currentContestant = stageContestants[currentPricingGame % Math.max(1, stageContestants.length)];
    
    if (currentContestant) {
      setPlayers(prev => prev.map(p => 
        p.id === currentContestant.id ? { ...p, score: p.score + validPoints } : p
      ));
      
      if (validPoints > 0) {
        AudioManager.playWin();
        showPlayerReaction(currentContestant.id, "win");
        makeAnnouncement(`${currentContestant.name} wins ${validPoints} points!`);
      } else {
        AudioManager.playLose();
        showPlayerReaction(currentContestant.id, "lose");
        makeAnnouncement(`Better luck next time, ${currentContestant.name}!`);
      }

      setTimeout(() => {
        if (currentPricingGame < Math.min(5, gameTypes.length - 1)) {
          setCurrentPricingGame(prev => prev + 1);
          setCurrentGame(gameTypes[currentPricingGame + 1]);
          makeAnnouncement("Next pricing game coming up!");
        } else {
          setGamePhase("showcaseShowdown");
          setCurrentSpinnerIndex(0);
          makeAnnouncement("Time for the Showcase Showdown! Spin that wheel!");
        }
      }, 3000);
    }
  }, [stageContestants, currentPricingGame, gameTypes, makeAnnouncement, showPlayerReaction]);

  const handleSpinComplete = useCallback((wheelScore) => {
    setPlayers(prev => prev.map(p => 
      p.id === stageContestants[currentSpinnerIndex]?.id 
        ? { ...p, wheelScore } 
        : p
    ));
    
    setIsSpinning(false);
    
    if (wheelScore === 1.0) {
      AudioManager.playWin();
      showPlayerReaction(stageContestants[currentSpinnerIndex]?.id, "perfect");
      makeAnnouncement("PERFECT DOLLAR! Bonus $1000!");
      setPlayers(prev => prev.map(p => 
        p.id === stageContestants[currentSpinnerIndex]?.id 
          ? { ...p, score: p.score + 1000 } 
          : p
      ));
    } else if (wheelScore > 1.0) {
      showPlayerReaction(stageContestants[currentSpinnerIndex]?.id, "lose");
      makeAnnouncement("Over a dollar! You're out!");
    } else {
      showPlayerReaction(stageContestants[currentSpinnerIndex]?.id, "win");
    }
    
    setTimeout(() => {
      if (currentSpinnerIndex < stageContestants.length - 1) {
        setCurrentSpinnerIndex(prev => prev + 1);
      } else {
        // Determine showcase winner
        const validContestants = stageContestants.filter((c, index) => {
          const player = players.find(p => p.id === c.id);
          return player?.wheelScore && player.wheelScore <= 1.0;
        });
        
        let winner = validContestants.length > 0 ? validContestants[0] : stageContestants[0];
        if (validContestants.length > 1) {
          winner = validContestants.reduce((prev, curr) => {
            const prevPlayer = players.find(p => p.id === prev.id);
            const currPlayer = players.find(p => p.id === curr.id);
            return (currPlayer?.wheelScore || 0) > (prevPlayer?.wheelScore || 0) ? curr : prev;
          });
        }
        
        setPlayers(prev => prev.map(p => 
          p.id === winner.id ? { ...p, wonWheel: true } : p
        ));
        
        setTimeout(() => {
          setGamePhase("showcase");
          makeAnnouncement("Time for the Final Showcase!");
        }, 2000);
      }
    }, 2000);
  }, [currentSpinnerIndex, stageContestants, players, makeAnnouncement, showPlayerReaction]);

  const handleWheelClick = useCallback(() => {
    setIsSpinning(true);
  }, []);

  const handleShowcaseBid = useCallback((playerId, bid) => {
    const cleanBid = bid.replace(/[^\d]/g, "");
    if (cleanBid.length <= 7) {
      setShowcaseBids(prev => ({ ...prev, [playerId]: cleanBid }));
    }
  }, []);

  const submitShowcaseBids = useCallback(() => {
    const showcaseTotal = showcaseDeck.reduce((sum, item) => sum + (item?.price || 0), 0);
    setShowcaseRevealed(true);
    
    // Find the winner
    const wheelWinner = players.find(p => p.wonWheel);
    if (wheelWinner && showcaseBids[wheelWinner.id]) {
      const bid = Number(showcaseBids[wheelWinner.id]);
      const diff = Math.abs(bid - showcaseTotal);
      const won = bid <= showcaseTotal && diff <= 1000;
      
      if (won) {
        AudioManager.playWin();
        setShowcaseWinner(wheelWinner.name);
        makeAnnouncement(`${wheelWinner.name} WINS THE SHOWCASE!`);
        // Perfect bid bonus
        if (diff <= 100) {
          makeAnnouncement(`Perfect bid! Bonus showcase prizes!`);
        }
      } else {
        AudioManager.playLose();
        makeAnnouncement(bid > showcaseTotal ? "Overbid! Better luck next time!" : "Too far under! Better luck next time!");
      }
    }
    
    setTimeout(() => {
      setGamePhase("gameOver");
      makeAnnouncement("That's our show! Thanks for playing The Price Is Right!");
    }, 3000);
  }, [showcaseDeck, players, showcaseBids, makeAnnouncement]);

  const restartGame = useCallback(() => {
    setGameStarted(false);
    setGamePhase("setup");
    setPlayers([]);
    setStageContestants([]);
    setCurrentPricingGame(0);
    setContestantsRowBids({});
    setContestantsRowWinner(null);
    setCurrentSpinnerIndex(0);
    setIsSpinning(false);
    setShowcaseRevealed(false);
    setShowcaseWinner(null);
    setShowcaseBids({});
    setAnnouncement("");
    setPlayerReactions({});
    setCurrentContestantsRowItem(0);
  }, []);

  // Get current contestants row item
  const getCurrentContestantsRowItem = () => {
    return contestantsRowDeck[currentContestantsRowItem] || contestantsRowDeck[0];
  };

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white">
      {/* Announcement Banner */}
      {announcement && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-center py-2 sm:py-4 px-4 sm:px-6 font-black text-sm sm:text-xl animate-pulse shadow-2xl">
          📢 {announcement}
        </div>
      )}

      {/* Header */}
      <header className={`relative overflow-hidden bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-4 sm:p-6 shadow-2xl ${announcement ? "mt-12 sm:mt-16" : ""}`}>
        <div className="relative mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="grid h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 place-items-center rounded-full bg-white/20 text-2xl sm:text-3xl md:text-4xl font-black backdrop-blur animate-pulse">
              $
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
                THE PRICE IS RIGHT
              </h1>
              <p className="text-xs sm:text-lg font-bold text-white/90 hidden sm:block">The Ultimate Game Show Experience!</p>
            </div>
          </div>
          {gameStarted && (
            <div className="text-right">
              <div className="text-xs sm:text-sm font-bold text-white/80">PHASE</div>
              <div className="text-lg sm:text-2xl font-black text-white">{gamePhase.toUpperCase()}</div>
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-3 sm:p-6">
        {/* Setup Phase */}
        {!gameStarted && (
          <div className="space-y-6">
            <div className="rounded-2xl sm:rounded-3xl border border-white/20 bg-white/95 p-4 sm:p-8 text-gray-900 shadow-2xl backdrop-blur">
              <div className="text-center">
                <div className="mx-auto mb-6 sm:mb-8 max-w-2xl">
                  <h2 className="mb-2 sm:mb-4 text-2xl sm:text-4xl font-black text-gray-900">Welcome Contestants!</h2>
                  <p className="text-sm sm:text-lg text-gray-600">
                    Experience the complete Price Is Right game show! Start with Contestants' Row, 
                    play classic pricing games, spin the Big Wheel, and compete in the Final Showcase!
                  </p>
                </div>

                <div className="mx-auto mb-6 sm:mb-8 max-w-md rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-gray-50 p-4 sm:p-6">
                  <label className="mb-3 sm:mb-4 block text-base sm:text-lg font-bold text-gray-700">
                    Number of Contestants
                  </label>
                  <select
                    value={numPlayers}
                    onChange={(e) => setNumPlayers(Number(e.target.value))}
                    className="w-full rounded-lg sm:rounded-xl border-2 border-gray-300 bg-white p-3 sm:p-4 text-base sm:text-lg font-bold text-gray-800 focus:border-blue-500 focus:outline-none"
                  >
                    {Array.from({length: 19}, (_, i) => i + 2).map((n) => (
                      <option key={n} value={n}>{n} Contestants</option>
                    ))}
                  </select>
                </div>

                <div className="mx-auto mb-6 sm:mb-8 grid max-w-4xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {Array.from({ length: numPlayers }, (_, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Contestant ${i + 1}`}
                      value={playerNames[i]}
                      onChange={(e) => {
                        const newNames = [...playerNames];
                        newNames[i] = e.target.value.slice(0, 20);
                        setPlayerNames(newNames);
                      }}
                      className="rounded-lg sm:rounded-xl border-2 border-gray-300 bg-white p-3 sm:p-4 text-base sm:text-lg font-bold text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
                      maxLength={20}
                    />
                  ))}
                </div>

                <button onClick={startGame} className={btn.primary + " text-xl sm:text-2xl w-full sm:w-auto"}>
                  🎬 START THE SHOW!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Phases */}
        {gameStarted && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">
            {/* Scoreboard */}
            <aside className="lg:col-span-3 order-2 lg:order-1">
              <div className="rounded-2xl sm:rounded-3xl border border-white/20 bg-white/10 p-4 sm:p-6 backdrop-blur-lg">
                <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-black text-yellow-400">CONTESTANTS</h2>
                <div className="space-y-2 sm:space-y-3">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className={`rounded-xl sm:rounded-2xl border-2 p-3 sm:p-4 transition-all duration-300 ${
                        player.wonWheel
                          ? "border-yellow-400 bg-yellow-400/20 ring-2 ring-yellow-400"
                          : player.onStage
                          ? "border-purple-400 bg-purple-400/20 ring-2 ring-purple-400"
                          : "border-white/20 bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <InitialsAvatar 
                          name={player.name} 
                          winner={player.wonWheel} 
                          onStage={player.onStage}
                          reaction={playerReactions[player.id]}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white text-sm sm:text-base truncate">{player.name}</div>
                          <div className="text-xs sm:text-sm text-white/70">
                            Score: <span className="font-bold text-yellow-400">{player.score}</span>
                          </div>
                          {player.wheelScore !== null && (
                            <div className="text-xs sm:text-sm">
                              <span className={`font-bold ${
                                player.wheelScore > 1 ? "text-red-400" : "text-green-400"
                              }`}>
                                Wheel: ${player.wheelScore.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                        {player.onStage && <div className="text-base sm:text-lg">⭐</div>}
                        {player.wonWheel && <div className="text-base sm:text-lg">👑</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main Game Area */}
            <main className="lg:col-span-9 order-1 lg:order-2">
              <div className="rounded-2xl sm:rounded-3xl border border-white/20 bg-white/95 p-4 sm:p-8 text-gray-900 shadow-2xl backdrop-blur">
                
                {/* Contestants' Row */}
                {gamePhase === "contestantsRow" && (
                  <div className="text-center">
                    <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl font-black text-gray-900">CONTESTANTS' ROW</h2>
                    <div className="mb-4 text-lg font-bold text-purple-600">
                      Round {Math.floor(currentContestantsRowItem / contestantsRowDeck.length) + 1} - Item {(currentContestantsRowItem % contestantsRowDeck.length) + 1}
                    </div>
                    
                    <div className="mb-4 sm:mb-6">
                      <PrizeCard 
                        item={getCurrentContestantsRowItem()} 
                        revealed={!!contestantsRowWinner}
                        withSpotlight={!contestantsRowWinner}
                      />
                    </div>
                    
                    {!contestantsRowWinner && (
                      <>
                        <div className="mb-4 sm:mb-6 text-center">
                          <div className="inline-block rounded-full bg-blue-500 px-4 sm:px-6 py-2 text-sm sm:text-lg font-bold text-white">
                            🎯 BID TO GET ON STAGE!
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {players.filter(p => !p.onStage).map((player) => (
                            <div key={player.id} className="rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-gray-50 p-3 sm:p-4">
                              <div className="mb-3 flex items-center gap-2 sm:gap-3">
                                <InitialsAvatar name={player.name} />
                                <div className="font-bold text-gray-800 text-sm sm:text-base truncate">{player.name}</div>
                              </div>
                              <div className="flex items-center rounded-lg sm:rounded-xl border-2 border-gray-300 bg-white p-2 sm:p-3 focus-within:border-blue-500">
                                <span className="text-lg sm:text-xl font-black text-green-600">$</span>
                                <input
                                  value={contestantsRowBids[player.id] || ""}
                                  onChange={(e) => handleContestantsRowBid(player.id, e.target.value)}
                                  inputMode="numeric"
                                  placeholder="Enter bid"
                                  className="ml-2 w-full text-base sm:text-lg font-bold text-gray-800 outline-none placeholder:text-gray-400"
                                  maxLength={6}
                                />
                              </div>
                              <div className="mt-2 text-center">
                                {contestantsRowBids[player.id] && contestantsRowBids[player.id].trim() !== "" ? (
                                  <div className="text-green-600 font-bold text-sm">✓ Bid Placed</div>
                                ) : (
                                  <div className="text-red-500 font-bold text-sm">⚠ Need Bid</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 sm:mt-6">
                          <button 
                            onClick={submitContestantsRowBids}
                            className={
                              players.filter(p => !p.onStage).every(player => 
                                contestantsRowBids[player.id] && contestantsRowBids[player.id].trim() !== ""
                              ) ? btn.green + " w-full" : btn.disabled + " w-full"
                            }
                            disabled={!players.filter(p => !p.onStage).every(player => 
                              contestantsRowBids[player.id] && contestantsRowBids[player.id].trim() !== ""
                            )}
                          >
                            🔒 REVEAL BIDS & FIND WINNER
                          </button>
                        </div>
                      </>
                    )}

                    {contestantsRowWinner && (
                      <div className="rounded-2xl sm:rounded-3xl border-4 border-green-400 bg-green-50 p-4 sm:p-6 text-center">
                        <div className="text-2xl sm:text-3xl mb-2">🎉</div>
                        <div className="text-xl sm:text-2xl font-black text-green-700 mb-2">
                          {contestantsRowWinner.name} COME ON DOWN!
                        </div>
                        <div className="text-base sm:text-lg text-green-600">
                          Actual price: {CURRENCY.format(getCurrentContestantsRowItem()?.price || 0)}
                        </div>
                        <div className="text-sm text-green-600 mt-2">
                          On Stage: {stageContestants.length + 1}/4
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Pricing Games */}
                {gamePhase === "pricingGames" && (
                  <div className="text-center">
                    <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl font-black text-gray-900">
                      PRICING GAME #{currentPricingGame + 1}
                    </h2>
                    <div className="mb-4 text-base sm:text-lg font-bold text-purple-600">
                      {stageContestants[currentPricingGame % Math.max(1, stageContestants.length)]?.name}'s turn to play {currentGame}!
                    </div>

                    {currentGame === "Hi-Lo" && (
                      <HiLoGame 
                        item={pricingGamesDeck[currentPricingGame]}
                        onComplete={handleGameComplete}
                        active={true}
                      />
                    )}

                    {currentGame === "Range Game" && (
                      <RangeGame 
                        item={pricingGamesDeck[currentPricingGame]}
                        onComplete={handleGameComplete}
                        active={true}
                      />
                    )}

                    {currentGame === "Plinko" && (
                      <PlinkoBoard 
                        onChipDrop={handleGameComplete}
                        active={true}
                      />
                    )}

                    {currentGame === "Cliffhangers" && (
                      <CliffhangersGame 
                        item={pricingGamesDeck[currentPricingGame]}
                        onComplete={handleGameComplete}
                        active={true}
                      />
                    )}
                  </div>
                )}

                {/* Showcase Showdown */}
                {gamePhase === "showcaseShowdown" && (
                  <div className="text-center">
                    <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl font-black text-gray-900">
                      🎡 SHOWCASE SHOWDOWN
                    </h2>
                    <div className="mb-4 text-base sm:text-lg font-bold text-blue-600">
                      {stageContestants[currentSpinnerIndex]?.name}, spin the Big Wheel!
                    </div>

                    <div className="mb-6 sm:mb-8">
                      <ResponsiveWheel
                        onSpinComplete={handleSpinComplete}
                        isSpinning={isSpinning}
                        onWheelClick={handleWheelClick}
                        canSpin={!isSpinning && currentSpinnerIndex < stageContestants.length}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {stageContestants.map((contestant, index) => {
                        const player = players.find(p => p.id === contestant.id);
                        return (
                          <div
                            key={contestant.id}
                            className={`rounded-xl sm:rounded-2xl border-2 sm:border-4 p-4 sm:p-6 transition-all duration-300 ${
                              index === currentSpinnerIndex
                                ? "border-blue-400 bg-blue-50 scale-105"
                                : player?.wonWheel
                                ? "border-yellow-400 bg-yellow-50"
                                : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            <div className="mb-3 flex items-center gap-2 sm:gap-3 justify-center">
                              <InitialsAvatar 
                                name={contestant.name} 
                                winner={player?.wonWheel}
                                onStage={true}
                              />
                              <div className="text-base sm:text-lg font-bold text-gray-800 truncate">{contestant.name}</div>
                            </div>
                            
                            <div className="text-center">
                              {player?.wheelScore !== null ? (
                                <div className={`text-xl sm:text-2xl font-black ${
                                  player.wheelScore > 1 ? "text-red-500" : "text-green-500"
                                }`}>
                                  ${player.wheelScore.toFixed(2)}
                                  {player.wheelScore === 1.0 && " 🎯"}
                                </div>
                              ) : index === currentSpinnerIndex ? (
                                <div className="text-base sm:text-lg font-bold text-blue-600 animate-pulse">
                                  {isSpinning ? "SPINNING..." : "YOUR TURN!"}
                                </div>
                              ) : (
                                <div className="text-gray-400">Waiting...</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Final Showcase */}
                {gamePhase === "showcase" && (
                  <div className="text-center">
                    <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl font-black text-gray-900">
                      🏆 FINAL SHOWCASE
                    </h2>

                    <div className="mb-6 sm:mb-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                      {showcaseDeck.map((item, index) => (
                        <PrizeCard 
                          key={index} 
                          item={item} 
                          revealed={showcaseRevealed}
                          withSpotlight={!showcaseRevealed}
                        />
                      ))}
                    </div>

                    {!showcaseRevealed && (
                      <div className="mb-6">
                        <div className="mb-4 text-lg font-bold text-gray-700">
                          {players.find(p => p.wonWheel)?.name}, bid on the showcase!
                        </div>
                        <div className="max-w-md mx-auto">
                          <div className="flex items-center rounded-xl border-2 border-gray-300 bg-white p-3 focus-within:border-blue-500">
                            <span className="text-xl font-black text-green-600">$</span>
                            <input
                              value={showcaseBids[players.find(p => p.wonWheel)?.id] || ""}
                              onChange={(e) => handleShowcaseBid(players.find(p => p.wonWheel)?.id, e.target.value)}
                              inputMode="numeric"
                              placeholder="Enter your bid"
                              className="ml-2 w-full text-lg font-bold text-gray-800 outline-none placeholder:text-gray-400"
                              maxLength={7}
                            />
                          </div>
                          <button 
                            onClick={submitShowcaseBids}
                            className={btn.red + " mt-4 w-full text-lg sm:text-xl"}
                            disabled={!showcaseBids[players.find(p => p.wonWheel)?.id]}
                          >
                            🎯 SUBMIT FINAL BID
                          </button>
                        </div>
                      </div>
                    )}

                    {showcaseRevealed && (
                      <div className="rounded-2xl sm:rounded-3xl border-4 border-green-400 bg-green-50 p-4 sm:p-6">
                        <div className="text-xl sm:text-2xl font-black text-green-700">
                          Showcase Total: {CURRENCY.format(showcaseDeck.reduce((sum, item) => sum + item.price, 0))}
                        </div>
                        {showcaseWinner ? (
                          <div className="mt-4 text-lg font-bold text-green-600">
                            🎊 {showcaseWinner} wins the showcase! 🎊
                          </div>
                        ) : (
                          <div className="mt-4 text-lg font-bold text-red-600">
                            No winner this time!
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Game Over */}
                {gamePhase === "gameOver" && (
                  <div className="text-center">
                    <h1 className="mb-6 sm:mb-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-3xl sm:text-6xl font-black text-transparent">
                      🎊 THAT'S OUR SHOW! 🎊
                    </h1>

                    <div className="mx-auto mb-6 sm:mb-8 max-w-2xl">
                      <h3 className="mb-4 sm:mb-6 text-xl sm:text-3xl font-black text-gray-900">FINAL WINNERS</h3>
                      <div className="space-y-3 sm:space-y-4">
                        {[...players]
                          .sort((a, b) => b.score - a.score)
                          .slice(0, 5)
                          .map((player, index) => (
                            <div
                              key={player.id}
                              className={`flex items-center justify-between rounded-xl sm:rounded-2xl border-2 sm:border-4 p-4 sm:p-6 ${
                                index === 0
                                  ? "border-yellow-400 bg-yellow-50"
                                  : "border-gray-200 bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                <div className={`text-lg sm:text-2xl font-black ${
                                  index === 0 ? "text-yellow-600" : "text-gray-500"
                                }`}>
                                  #{index + 1}
                                </div>
                                <InitialsAvatar name={player.name} winner={index === 0} />
                                <div className="text-base sm:text-xl font-bold text-gray-800 truncate">{player.name}</div>
                              </div>
                              <div className="text-lg sm:text-2xl font-black text-purple-600">{player.score} pts</div>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="text-base sm:text-lg text-gray-600">
                        Thanks for playing The Price Is Right!
                      </div>
                      <button onClick={restartGame} className={btn.primary + " text-lg sm:text-2xl w-full sm:w-auto"}>
                        🎮 PLAY AGAIN
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
