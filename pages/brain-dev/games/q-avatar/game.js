/**
 * Q趣头像 - 游戏核心逻辑
 */
const config = require('../common/game-config');

const AVATARS = [
  { emoji: '😀', name: '开心' },
  { emoji: '😎', name: '酷酷' },
  { emoji: '🥳', name: '派对' },
  { emoji: '🤠', name: '牛仔' },
  { emoji: '😇', name: '天使' },
  { emoji: '🤡', name: '小丑' },
  { emoji: '👻', name: '幽灵' },
  { emoji: '🤖', name: '机器人' },
  { emoji: '👽', name: '外星人' },
  { emoji: '🎃', name: '南瓜' },
  { emoji: '😺', name: '猫咪' },
  { emoji: '🐶', name: '狗狗' },
  { emoji: '🦊', name: '狐狸' },
  { emoji: '🐼', name: '熊猫' },
  { emoji: '🐵', name: '猴子' },
  { emoji: '🦁', name: '狮子' },
  { emoji: '🐰', name: '兔子' },
  { emoji: '🐻', name: '小熊' }
];

const DIFFICULTY = {
  easy: { avatarCount: 4, memoryTime: 4 },
  medium: { avatarCount: 6, memoryTime: 3.5 },
  hard: { avatarCount: 9, memoryTime: 3 }
};

/**
 * 生成关卡数据
 */
function generateLevel(difficulty, level) {
  const diff = DIFFICULTY[difficulty];
  const bonus = Math.min(Math.floor((level - 1) / 2), 4);
  const avatarCount = Math.min(diff.avatarCount + bonus, 12);
  
  // 随机选择头像
  const shuffled = [...AVATARS].sort(() => Math.random() - 0.5);
  const selectedAvatars = shuffled.slice(0, avatarCount);
  
  // 随机选择消失的头像
  const missingIndex = Math.floor(Math.random() * avatarCount);
  const missingAvatar = selectedAvatars[missingIndex];
  
  // 剩余头像
  const remainingAvatars = selectedAvatars.filter((_, i) => i !== missingIndex);
  
  // 生成选项
  const options = [missingAvatar];
  const otherAvatars = AVATARS.filter(a => !selectedAvatars.some(s => s.emoji === a.emoji));
  const shuffledOthers = otherAvatars.sort(() => Math.random() - 0.5);
  for (let i = 0; i < 3 && i < shuffledOthers.length; i++) {
    options.push(shuffledOthers[i]);
  }
  
  // 记忆时间随等级递减
  const memoryTime = Math.max(diff.memoryTime - (level - 1) * 0.2, 1.5);
  
  // 计算网格大小
  const gridSize = avatarCount <= 4 ? 2 : (avatarCount <= 6 ? 3 : 3);
  
  return {
    displayAvatars: selectedAvatars,
    remainingAvatars,
    missingAvatar,
    options: options.sort(() => Math.random() - 0.5),
    memoryTime,
    gridSize,
    avatarCount
  };
}

/**
 * 计算得分
 */
function calcScore(isCorrect, level, avatarCount) {
  if (isCorrect) {
    return 80 + avatarCount * 10 + level * 15;
  } else {
    return -(40 + level * 8);
  }
}

module.exports = { AVATARS, DIFFICULTY, generateLevel, calcScore };