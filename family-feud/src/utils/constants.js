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
      question: "Name a reason a video shoot runs late?",
      multiplier: 2,
      answers: [
        { text: "Technical issues", points: 39, aliases: ["tech problems", "equipment failure", "camera issues", "computer problems", "equipment", "technology","sound issues", "microphone", "mic problems", "sound", "audio"] },
        { text: "Bad Talent", points: 24, aliases: ["actors", "bad acting", "performers", "talent", "acting"] },
        { text: "Last-minute script changes", points: 22, aliases: ["rewrites", "script rewrites", "script", "changes"] },
        { text: "Lighting setup", points: 6, aliases: ["lights", "lighting", "light problems"] },
        { text: "Location issues", points: 9, aliases: ["venue", "setting", "location", "place","travel","far","its far","it's far","rain", "storm", "wind", "snow", "cold", "hot","weather"] }
      ]
    },
    {
      question: "Which race does Jon get confused for?",
      multiplier: 1,
      answers: [
        { text: "Russian", points: 40, aliases: ["soviet", "russia"] },
        { text: "Ukranian", points: 18, aliases: ["ukraine", "ukrainian"] },
        { text: "Mexican", points: 15, aliases: ["Mexico"] },
        { text: "Spanish", points: 13, aliases: ["hispanic", "spanish"] },
        { text: "Greek", points: 12, aliases: ["Greece", "Roman"] },
        { text: "Mongolian", points: 11, aliases: ["mongol", "mongolia"] },
        { text: "Unknown", points: 8, aliases: ["other", "idk", "dont know", "mystery", "unclear"] },
        { text: "Homo Sapien", points: 4, aliases: ["human", "person", "man", "guy"] }
      ]
    },
    {
      question: "If adults trick or treated, what might they request instead of candy?",
      multiplier: 3,
      answers: [
        { text: "Sex", points: 30, aliases: ["boobs", "ass", "hookup", "intimacy","sexual intercourse", "intercourse"] },
        { text: "Money", points: 21, aliases: ["cash", "dollars", "bucks", "coins", "currency"] },
        { text: "Drugs", points: 17, aliases: ["weed", "marijuana", "pills", "edibles", "pot"] },
        { text: "Alcohol", points: 16, aliases: ["beer", "wine", "liquor", "booze", "drinks", "shots", "vodka", "whiskey"] },
        { text: "Food", points: 11, aliases: ["candy", "snacks", "pizza", "dinner", "meal", "steak"] },
        { text: "Help", points: 5, aliases: ["assistance", "favors", "favor", "chores"] }
      ]
    },
    {
      question: "Name something Jon hates when people say out loud?",
      multiplier: 1,
      answers: [
        { text: "Six Seven", points: 65, aliases: ["67", "sixty seven"] },
        { text: "Fender Bender", points: 20, aliases: ["car accident", "fenderbender"] },
        { text: "LOL", points: 15, aliases: ["laugh out loud", "lmao", "lmfao", "rofl"] }
      ]
    },
    {
      question: "Name a reason you might not respond to a text?",
      multiplier: 3,
      answers: [
        { text: "Hate", points: 35, aliases: ["dont like", "angry", "mad", "annoyed", "hate them", "dont like them", "ignoring"] },
        { text: "Busy", points: 22, aliases: ["occupied", "preoccupied", "distracted"] },
        { text: "Working", points: 15, aliases: ["at work", "job", "work", "meeting"] },
        { text: "Drinking", points: 10, aliases: ["drunk", "wasted", "partying", "bar", "club"] },
        { text: "Eating", points: 7, aliases: ["dinner", "lunch", "meal", "breakfast", "food"] },
        { text: "Bathroom", points: 5, aliases: ["toilet", "restroom", "peeing", "pooping", "shower", "showering"] },
        { text: "Car Issues", points: 4, aliases: ["car trouble", "dead battery", "car problems", "broken down", "Jumping a car"] },
        { text: "Involved with Hospital Operations", points: 2, aliases: ["hospital", "medical", "surgery", "sick", "doctor", "emergency", "er", "dentist"] }
      ]
    }
  ],
  fastMoneyPrompts: [
    {
      prompt: "Name something you bring to a birthday party?",
      answers: [
        { text: "A gift for Jon", points: 70, aliases: ["gift", "present", "presents", "birthday gift", "birthday present"] },
        { text: "Food", points: 30, aliases: ["pizza", "cake", "snacks", "chips", "candy", "cookies", "cupcakes", "appetizers"] },
        { text: "Drugs", points: 40, aliases: ["weed", "marijuana", "pot", "pills", "edibles","blow","cocaine"] },
        { text: "Drinks", points: 39, aliases: ["soda", "beer", "wine", "beverages", "alcohol", "juice", "water", "pop", "booze"] },
        { text: "Napkins", points: 4, aliases: ["paper towels", "tissues", "serviettes"] },
        { text: "Candles", points: 3, aliases: ["birthday candles"] },
        { text: "Plates/Cups", points: 2, aliases: ["dishes", "utensils", "silverware", "forks", "spoons", "paper plates", "plasticware", "cups"] },
        { text: "Games", points: 1, aliases: ["board games", "video games", "party games", "card games"] }
      ]
    },
    {
      prompt: "Name one of Jon's signature catch phrases",
      answers: [
        { text: "Hi this is Jon", points: 40, aliases: ["hello its jon", "hi this is jon", "hello jon"] },
        { text: "You should listen to me", points: 25, aliases: ["listen to me", "you should listen"] },
        { text: "I'm always hard", points: 49, aliases: ["always hard", "im hard", "hard","I'm the hardest"] },
        { text: "Hey Jon Fooders", points: 50, aliases: ["jon fooders", "fooders", "hey fooders"] },
        { text: "I love Israel", points: 60, aliases: ["love israel", "israel"] }
      ]
    },
    {
      prompt: "Name something Jon would bring to a desert island",
      answers: [
        { text: "Cody", points: 80, aliases: ["cody", "his girlfriend"] },
        { text: "Dogs", points: 50, aliases: ["dog", "pets", "his dogs", "puppy"] },
        { text: "Camera", points: 40, aliases: ["video camera", "filming equipment", "phone"] },
        { text: "Food", points: 12, aliases: ["snacks", "meals", "chicken", "meat"] },
        { text: "Water", points: 8, aliases: ["drinks", "hydration", "beverages"] }
      ]
    },
    {
      prompt: "Name something Jon is known for",
      answers: [
        { text: "FGL/Best friend/best person", points: 60, aliases: ["fgl", "best friend", "friend", "friendship", "best person"] },
        { text: "JON-E Worldwide/Filming", points: 55, aliases: ["jon e worldwide", "jone worldwide", "filming", "videos", "youtube"] },
        { text: "JON FOOD", points: 50, aliases: ["jonfood", "food reviews", "eating", "food channel"] },
        { text: "Cooking/Meat Night", points: 40, aliases: ["cooking", "meat night", "grilling", "bbq", "chef"] },
        { text: "Acting/Art The Clown", points: 10, aliases: ["acting", "art the clown", "terrifier", "movies", "horror"] },
        { text: "Sports", points: 7, aliases: ["basketball", "football", "athletics", "athlete"] }
      ]
    },
    {
      prompt: "Name Jon's favorite food",
      answers: [
        { text: "Chicken", points: 60, aliases: ["fried chicken", "poultry", "bird"] },
        { text: "Durian", points: 49, aliases: ["durian fruit", "stinky fruit"] },
        { text: "Watermelon", points: 48, aliases: ["melon", "water melon"] },
        { text: "Chicken Fried Rice", points: 40, aliases: ["fried rice", "rice"] },
        { text: "Chicken Wings", points: 8, aliases: ["wings", "bbq wings", "hot wings"] }
      ]
    }
  ],
  suddenDeath: [
    {
      question: "Sudden Death: Name a household bill people dread the most?",
      multiplier: 3,
      answers: [
        { text: "Electricity", points: 100, aliases: ["electric", "power", "electric bill", "power bill", "utilities"] }
      ]
    },
    {
      question: "Sudden Death: Name the most-used app on people's phones.",
      multiplier: 3,
      answers: [
        { text: "Messages/Texts", points: 100, aliases: ["texting", "imessage", "sms", "text", "messaging", "messages"] }
      ]
    },
    {
      question: "Sudden Death: Name the most popular pizza topping.",
      multiplier: 3,
      answers: [
        { text: "Pepperoni", points: 100, aliases: ["peperoni", "pepperonis"] }
      ]
    }
  ]
};

