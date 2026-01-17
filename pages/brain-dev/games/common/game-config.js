/**
 * 游戏公共配置
 */
module.exports = {
  // 最大等级
  MAX_LEVEL: 10,
  
  // 游戏总时长（秒）
  GAME_DURATION: 90,
  
  // 难度积分系数
  DIFFICULTY_MULTIPLIER: {
    easy: 5,      // 简单：等级×5
    medium: 7,    // 中等：等级×7
    hard: 10      // 困难：等级×10
  },
  
  // 根据等级和难度计算奖励积分
  calcLevelReward(level, difficulty) {
    const multiplier = this.DIFFICULTY_MULTIPLIER[difficulty] || 5;
    return level * multiplier;
  },
  
  // 计算累计奖励积分（从等级1到当前等级的总和）
  calcTotalReward(level, difficulty) {
    const multiplier = this.DIFFICULTY_MULTIPLIER[difficulty] || 5;
    // 1+2+3+...+level = level*(level+1)/2
    // 再乘以难度系数
    return Math.floor((level * (level + 1) / 2) * multiplier);
  },
  
  // 根据等级获取难度系数
  getLevelDifficulty(level) {
    return {
      speedMultiplier: 1 + (level - 1) * 0.15,
      countBonus: Math.floor((level - 1) / 2),
      timeReduce: Math.min((level - 1) * 0.5, 3)
    };
  },
  
  // 根据得分获取评价
  getRank(score, maxScore) {
    const ratio = score / Math.max(maxScore, 1);
    if (ratio >= 0.9) return { text: '完美通关', emoji: '👑' };
    if (ratio >= 0.7) return { text: '非常优秀', emoji: '🌟' };
    if (ratio >= 0.5) return { text: '表现不错', emoji: '👍' };
    if (ratio >= 0.3) return { text: '继续努力', emoji: '💪' };
    return { text: '初次尝试', emoji: '🌱' };
  }
};