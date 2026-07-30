// Persistence layer for Buzzer.
//
// This uses the browser's localStorage, so data is scoped to a single
// browser on a single device — it is NOT shared between different users.
// If you want a real shared/multiplayer leaderboard, swap the bodies of
// these functions for calls to your own backend (REST API, Supabase,
// Firebase, etc.) — the function signatures are designed to stay the same.

const KEYS = {
  quizzes: "buzzer:quizzes",
  globalLeaderboard: "buzzer:global-leaderboard",
  leaderboard: (quizId) => `buzzer:leaderboard:${quizId}`,
};

function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export async function loadQuizzes() {
  return safeGet(KEYS.quizzes, []);
}

export async function saveQuizzes(quizzes) {
  return safeSet(KEYS.quizzes, quizzes);
}

export async function loadLeaderboard(quizId) {
  return safeGet(KEYS.leaderboard(quizId), []);
}

export async function saveLeaderboard(quizId, entries) {
  return safeSet(KEYS.leaderboard(quizId), entries);
}

export async function loadGlobalLeaderboard() {
  return safeGet(KEYS.globalLeaderboard, []);
}

export async function saveGlobalLeaderboard(entries) {
  return safeSet(KEYS.globalLeaderboard, entries);
}
