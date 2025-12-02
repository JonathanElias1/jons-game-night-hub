// Answer matching utility for Family Feud
// Supports fuzzy matching for partial answers

/**
 * Normalize a string for comparison
 * - lowercase, remove punctuation, trim whitespace
 */
export function normalize(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Check if two answers are considered a match
 * Supports exact match and partial/fuzzy matching
 */
export function isAnswerMatch(userAnswer, correctAnswer, threshold = 0.6) {
  const userNorm = normalize(userAnswer);
  const correctNorm = normalize(correctAnswer);

  if (!userNorm || !correctNorm) return false;

  // Exact match
  if (userNorm === correctNorm) return true;

  // User answer is contained in correct answer (e.g., "gift" matches "a gift for jon")
  if (correctNorm.includes(userNorm) && userNorm.length >= 3) return true;

  // Correct answer is contained in user answer
  if (userNorm.includes(correctNorm) && correctNorm.length >= 3) return true;

  // Check individual words match
  const userWords = userNorm.split(" ").filter(w => w.length > 2);
  const correctWords = correctNorm.split(" ").filter(w => w.length > 2);

  // If any significant word from user matches any word from correct
  for (const userWord of userWords) {
    for (const correctWord of correctWords) {
      if (userWord === correctWord && userWord.length >= 3) return true;
      // Handle plurals
      if (userWord + "s" === correctWord || correctWord + "s" === userWord) return true;
    }
  }

  // Levenshtein distance for typo tolerance
  const distance = levenshteinDistance(userNorm, correctNorm);
  const maxLen = Math.max(userNorm.length, correctNorm.length);
  const similarity = 1 - distance / maxLen;

  return similarity >= threshold;
}

/**
 * Check if user answer matches any of the aliases
 */
function matchesAlias(userNorm, aliases) {
  if (!aliases || !Array.isArray(aliases)) return false;

  for (const alias of aliases) {
    const aliasNorm = normalize(alias);
    // Exact match with alias
    if (userNorm === aliasNorm) return true;
    // User answer contains alias or vice versa
    if (aliasNorm.includes(userNorm) && userNorm.length >= 3) return true;
    if (userNorm.includes(aliasNorm) && aliasNorm.length >= 3) return true;
    // Handle plurals
    if (userNorm + "s" === aliasNorm || aliasNorm + "s" === userNorm) return true;
  }
  return false;
}

/**
 * Find matching answer from a list of possible answers
 * Returns { matched: boolean, answerIndex: number, confidence: 'exact'|'partial'|'close' }
 * Supports aliases array on each answer for synonym matching
 */
export function findMatchingAnswer(userAnswer, answers) {
  const userNorm = normalize(userAnswer);
  if (!userNorm) return { matched: false, answerIndex: -1, confidence: null };

  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    if (!answer.text || answer.revealed) continue;

    const correctNorm = normalize(answer.text);

    // Exact match
    if (userNorm === correctNorm) {
      return { matched: true, answerIndex: i, confidence: 'exact' };
    }

    // Check aliases for exact/partial match
    if (matchesAlias(userNorm, answer.aliases)) {
      return { matched: true, answerIndex: i, confidence: 'exact' };
    }

    // Partial match (user word in correct answer)
    if (correctNorm.includes(userNorm) && userNorm.length >= 3) {
      return { matched: true, answerIndex: i, confidence: 'partial' };
    }

    // Individual word match
    const userWords = userNorm.split(" ").filter(w => w.length > 2);
    const correctWords = correctNorm.split(" ").filter(w => w.length > 2);

    for (const userWord of userWords) {
      for (const correctWord of correctWords) {
        if (userWord === correctWord ||
            userWord + "s" === correctWord ||
            correctWord + "s" === userWord) {
          return { matched: true, answerIndex: i, confidence: 'partial' };
        }
      }
    }
  }

  // Check for close matches (typos) - also check aliases
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    if (!answer.text || answer.revealed) continue;

    const correctNorm = normalize(answer.text);
    const distance = levenshteinDistance(userNorm, correctNorm);
    const maxLen = Math.max(userNorm.length, correctNorm.length);
    const similarity = 1 - distance / maxLen;

    if (similarity >= 0.7) {
      return { matched: true, answerIndex: i, confidence: 'close' };
    }

    // Also check aliases for close matches
    if (answer.aliases) {
      for (const alias of answer.aliases) {
        const aliasNorm = normalize(alias);
        const aliasDist = levenshteinDistance(userNorm, aliasNorm);
        const aliasMaxLen = Math.max(userNorm.length, aliasNorm.length);
        const aliasSim = 1 - aliasDist / aliasMaxLen;
        if (aliasSim >= 0.7) {
          return { matched: true, answerIndex: i, confidence: 'close' };
        }
      }
    }
  }

  return { matched: false, answerIndex: -1, confidence: null };
}

/**
 * Check if two Fast Money answers are duplicates
 */
export function isDuplicateAnswer(answer1, answer2) {
  const norm1 = normalize(answer1);
  const norm2 = normalize(answer2);

  if (!norm1 || !norm2) return false;

  // Exact match
  if (norm1 === norm2) return true;

  // Very similar (for typos)
  const distance = levenshteinDistance(norm1, norm2);
  const maxLen = Math.max(norm1.length, norm2.length);
  const similarity = 1 - distance / maxLen;

  return similarity >= 0.8;
}

/**
 * Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}
