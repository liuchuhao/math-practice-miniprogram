/**
 * 漂浮乐园 - 游戏核心逻辑
 * 功能：星星移动反弹、防重叠、等级难度递增
 */
const config = require('../common/game-config');

// 星星emoji池
const STAR_EMOJIS = ['⭐', '🌟', '✨', '💫', '🌠'];

// 难度配置
const DIFFICULTY = {
  easy: { minStars: 3, maxStars: 6, baseSpeed: 0.3 },
  medium: { minStars: 5, maxStars: 10, baseSpeed: 0.5 },
  hard: { minStars: 8, maxStars: 15, baseSpeed: 0.7 }
};

/**
 * 生成关卡数据
 * @param {string} difficulty 难度
 * @param {number} level 当前等级 1-10
 */
function generateLevel(difficulty, level) {
  const diff = DIFFICULTY[difficulty];
  const levelDiff = config.getLevelDifficulty(level);
  
  // 根据等级增加星星数量
  const minStars = diff.minStars + levelDiff.countBonus;
  const maxStars = diff.maxStars + levelDiff.countBonus * 2;
  const starCount = randomInt(minStars, Math.min(maxStars, 25));
  
  // 生成不重叠的星星（带移动属性）
  const stars = generateNonOverlappingStars(starCount, diff.baseSpeed, levelDiff.speedMultiplier);
  
  // 生成4个选项
  const options = generateOptions(starCount);
  
  return {
    stars,
    correctAnswer: starCount,
    options
  };
}

/**
 * 生成不重叠的星星，带移动属性
 */
function generateNonOverlappingStars(count, baseSpeed, speedMultiplier) {
  const stars = [];
  const minDistance = 12;
  
  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let x, y;
    
    do {
      x = randomInt(10, 82);
      y = randomInt(10, 72);
      attempts++;
    } while (isOverlapping(x, y, stars, minDistance) && attempts < 50);
    
    const angle = Math.random() * Math.PI * 2;
    const speed = (baseSpeed + Math.random() * 0.3) * speedMultiplier;
    const size = randomInt(36, 52);
    
    stars.push({
      id: i,
      emoji: STAR_EMOJIS[randomInt(0, STAR_EMOJIS.length - 1)],
      x: x,
      y: y,
      size: size,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      // 预生成样式字符串
      styleStr: `left:${x}%; top:${y}%; font-size:${size}rpx;`
    });
  }
  
  return stars;
}

/**
 * 检查位置是否重叠
 */
function isOverlapping(x, y, existingStars, minDistance) {
  for (const star of existingStars) {
    const dx = x - star.x;
    const dy = y - star.y;
    if (Math.sqrt(dx * dx + dy * dy) < minDistance) {
      return true;
    }
  }
  return false;
}

/**
 * 更新星星位置（边界反弹）
 */
function updateStarPositions(stars) {
  const minX = 5, maxX = 88;
  const minY = 5, maxY = 78;
  
  return stars.map(star => {
    let { x, y, vx, vy, size } = star;
    
    // 更新位置
    x += vx;
    y += vy;
    
    // 边界反弹
    if (x <= minX || x >= maxX) {
      vx = -vx;
      x = Math.max(minX, Math.min(maxX, x));
    }
    if (y <= minY || y >= maxY) {
      vy = -vy;
      y = Math.max(minY, Math.min(maxY, y));
    }
    
    return { 
      ...star, 
      x, 
      y, 
      vx, 
      vy,
      // 更新样式字符串
      styleStr: `left:${x.toFixed(2)}%; top:${y.toFixed(2)}%; font-size:${size}rpx;`
    };
  });
}

/**
 * 生成选项（含正确答案）
 */
function generateOptions(correct) {
  const options = [correct];
  const range = Math.max(3, Math.floor(correct * 0.4));
  
  while (options.length < 4) {
    const offset = randomInt(-range, range) || 1;
    const opt = correct + offset;
    if (opt > 0 && !options.includes(opt)) {
      options.push(opt);
    }
  }
  return shuffle(options);
}

/**
 * 计算本题得分
 * @param {boolean} isCorrect 是否正确
 * @param {number} level 当前等级
 * @returns {number} 得分（正确为正，错误为负）
 */
function calcScore(isCorrect, level) {
  if (isCorrect) {
    // 正确：基础分 + 等级奖励
    return 100 + level * 20;
  } else {
    // 错误：扣分（等级越高扣得越多）
    return -(50 + level * 10);
  }
}

// 工具函数
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

module.exports = { 
  DIFFICULTY, 
  generateLevel, 
  updateStarPositions, 
  calcScore 
};