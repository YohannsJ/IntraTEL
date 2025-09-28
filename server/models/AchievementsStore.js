// Almacenamiento en memoria de logros por usuario
// Se resetea al reiniciar el servidor

const achievementsByUser = new Map(); // key: userId, value: Set de achievement keys

export function getUserAchievements(userId) {
  const set = achievementsByUser.get(userId);
  return set ? Array.from(set) : [];
}

export function addUserAchievements(userId, achievementKeys = []) {
  const current = achievementsByUser.get(userId) || new Set();
  achievementKeys.forEach((k) => current.add(k));
  achievementsByUser.set(userId, current);
  return Array.from(current);
}

export function hasAchievement(userId, key) {
  const current = achievementsByUser.get(userId);
  return current ? current.has(key) : false;
}

export function clearUserAchievements(userId) {
  achievementsByUser.delete(userId);
}

export function resetAllAchievements() {
  achievementsByUser.clear();
}

export default {
  getUserAchievements,
  addUserAchievements,
  hasAchievement,
  clearUserAchievements,
  resetAllAchievements,
};
