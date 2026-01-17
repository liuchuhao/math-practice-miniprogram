/**
 * 速算高手 - 游戏核心逻辑
 */
const config = require('../common/game-config');

const DIFFICULTY = {
  easy: { numCount: [3, 4], maxValue: 9, baseSpeed: 1 },
  medium: { numCount: [4, 6], maxValue: 15, baseSpeed: 1 },
  hard: { numCount: [5, 8], maxValue: 20, baseSpeed: 1 }
};

/**
 * 生成关卡数据
 */
function generateLevel(difficulty, level) {
  const diff = DIFFICULTY[difficulty];
  const levelDiff = config.getLevelDifficulty(level);
  
  const bonus = levelDiff.countBonus;
  const minCount = diff.numCount[0] + bonus;
  const maxCount = diff.numCount[1] + bonus;
  const count = randomInt(minCount, Math.min(maxCount, 12));
  
  // 使用网格布局防止重叠
  const numbers = generateNonOverlappingNumbers(count, diff.maxValue);
  
  let sum = 0;
  numbers.forEach(n => sum += n.value);
  
  const options = generateOptions(sum);
  
  return { numbers, correctAnswer: sum, options };
}

/**
 * 生成不重叠的数字卡片
 */
function generateNonOverlappingNumbers(count, maxValue) {
  const numbers = [];
  const cols = Math.ceil(Math.sqrt(count * 1.5));
  const rows = Math.ceil(count / cols);
  const cellW = 70 / cols;
  const cellH = 55 / rows;
  
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    
    const x = 12 + col * cellW + randomInt(0, Math.floor(cellW * 0.2));
    const y = 12 + row * cellH + randomInt(0, Math.floor(cellH * 0.2));
    const rotation = randomInt(-15, 15);
    const value = randomInt(1, maxValue);
    
    numbers.push({
      id: i,
      value,
      x,
      y,
      rotation,
      styleStr: `left:${x}%; top:${y}%; transform:rotate(${rotation}deg);`
    });
  }
  
  return numbers;
}

/**
 * 生成选项
 */
function generateOptions(correct) {
  const options = [correct];
  const range = Math.max(5, Math.floor(correct * 0.25));
  
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
 * 计算得分
 */
function calcScore(isCorrect, level) {
  if (isCorrect) {
    return 100 + level * 20;
  } else {
    return -(50 + level * 10);
  }
}

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

module.exports = { DIFFICULTY, generateLevel, calcScore };