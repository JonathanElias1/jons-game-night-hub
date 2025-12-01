export const BRAND_A = "#0ea5e9";
export const BRAND_B = "#22c55e";
export const gradientBg = { background: `linear-gradient(135deg, ${BRAND_A}, ${BRAND_B})` };

// Add these to your existing constants.js

export const AVATARS = [
  { emoji: "😎", name: "Cool" },
  { emoji: "🎮", name: "Gamer" },
  { emoji: "🎨", name: "Artist" },
  { emoji: "🎵", name: "Music" },
  { emoji: "⚡", name: "Lightning" },
  { emoji: "🔥", name: "Fire" },
  { emoji: "🌟", name: "Star" },
  { emoji: "🎯", name: "Target" },
  { emoji: "🚀", name: "Rocket" },
  { emoji: "👑", name: "Crown" },
  { emoji: "💎", name: "Diamond" },
  { emoji: "🦁", name: "Lion" },
  { emoji: "🐉", name: "Dragon" },
  { emoji: "🦅", name: "Eagle" },
  { emoji: "🐺", name: "Wolf" },
  { emoji: "🦊", name: "Fox" },
  { emoji: "🐯", name: "Tiger" },
  { emoji: "🎪", name: "Circus" },
  { emoji: "🏆", name: "Trophy" },
  { emoji: "⚔️", name: "Sword" },
];

export const FALLBACK = {
  rounds: [
    {
      question: "Name something you bring to a birthday party:",
      answers: [
        { text: "Gift", points: 35 },
        { text: "Cake", points: 26 },
        { text: "Balloons", points: 12 },
        { text: "Drinks", points: 9 },
        { text: "Snacks/Chips", points: 7 },
        { text: "Candles", points: 5 },
        { text: "Plates/Cups", points: 3 },
        { text: "Games", points: 3 },
      ],
      multiplier: 1,
    },
    {
      question: "Name a reason a video shoot runs late:",
      answers: [
        { text: "Technical issues", points: 29 },
        { text: "Talent arrives late", points: 24 },
        { text: "Last-minute script changes", points: 17 },
        { text: "Lighting setup", points: 12 },
        { text: "Audio problems", points: 8 },
        { text: "Location issues", points: 6 },
        { text: "Wardrobe/makeup", points: 3 },
        { text: "Weather", points: 1 },
      ],
      multiplier: 1,
    },
    {
      question: "Name a place you shouldn't check your phone:",
      answers: [
        { text: "Driving", points: 40 },
        { text: "Movie theater", points: 18 },
        { text: "Dinner date", points: 15 },
        { text: "Class/Meeting", points: 12 },
        { text: "Church/Service", points: 8 },
        { text: "Gym", points: 4 },
        { text: "Bathroom", points: 2 },
        { text: "Wedding", points: 1 },
      ],
      multiplier: 2,
    },
    {
      question: "Name something that has a shell:",
      answers: [
        { text: "Turtle/Tortoise", points: 45 },
        { text: "Egg", points: 22 },
        { text: "Snail", points: 15 },
        { text: "Crab/Lobster", points: 8 },
        { text: "Nut", points: 5 },
        { text: "Taco", points: 3 },
        { text: "Oyster/Clam", points: 2 },
      ],
      multiplier: 3,
    },
  ],
  fastMoneyPrompts: [
    "A breakfast food you can eat on the go",
    "Something people lose all the time",
    "A reason you might be late",
    "A chore kids get paid to do",
    "A fruit you can peel",
  ],
  suddenDeath: [
    { question: "Name the most important meal of the day", answer: { text: "Breakfast", points: 78 }, multiplier: 3 },
  ],
};

