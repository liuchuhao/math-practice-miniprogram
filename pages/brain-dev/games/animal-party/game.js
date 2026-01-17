/**
 * 动物派对 - 游戏核心逻辑
 */
const config = require('../common/game-config');

const ANIMALS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
  '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
  '🐧', '🦆', '🦅', '🦉', '🐴', '🦄', '🐝', '🦋'
];

const DIFFICULTY = {
  easy: { types: 3, totalRange: [12, 18] },
  medium: { types: 4, totalRange: [16, 24] },
  hard: { types: 5, totalRange: [20, 30] }
};

/**
 * 生成关卡数据
 */
function generateLevel(difficulty, level) {
  const diff = DIFFICULTY[difficulty];
  const bonus = Math.min(level - 1, 5);
  
  // 选择动物种类
  const shuffled = [...ANIMALS].sort(() => Math.random() - 0.5);
  const selectedAnimals = shuffled.slice(0, diff.types);
  
  // 计算总数
  const total = randomInt(diff.totalRange[0], diff.totalRange[1]) + bonus * 2;
  
  // 分配数量（确保有唯一最多的）
  const counts = generateCounts(diff.types, total);
  
  // 生成动物数组
  const animals = [];
  let id = 0;
  
  // 使用网格布局防止重叠
  const positions = generatePositions(total);
  
  let posIndex = 0;
  selectedAnimals.forEach((emoji, typeIndex) => {
    for (let i = 0; i < counts[typeIndex]; i++) {
      const pos = positions[posIndex++];
      animals.push({
        id: id++,
        emoji,
        x: pos.x,
        y: pos.y,
        rotation: randomInt(-20, 20),
        scale: 0.8 + Math.random() * 0.4,
        styleStr: `left:${pos.x}%; top:${pos.y}%; transform:rotate(${randomInt(-20, 20)}deg) scale(${(0.8 + Math.random() * 0.4).toFixed(2)});`
      });
    }
  });
  
  // 打乱顺序
  animals.sort(() => Math.random() - 0.5);
  
  // 生成选项
  const options = selectedAnimals.map((emoji, i) => ({ emoji, count: counts[i] }));
  
  // 找出最多的动物
  const maxCount = Math.max(...counts);
  const correctIndex = counts.indexOf(maxCount);
  const correctAnimal = selectedAnimals[correctIndex];
  
  return {
    animals,
    options: options.sort(() => Math.random() - 0.5),
    correctAnimal,
    maxCount
  };
}

/**
 * 生成不重叠的位置
 */
function generatePositions(count) {
  const positions = [];
  const cols = Math.ceil(Math.sqrt(count * 1.3));
  const rows = Math.ceil(count / cols);
  const cellW = 75 / cols;
  const cellH = 60 / rows;
  
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    positions.push({
      x: 10 + col * cellW + randomInt(0, Math.floor(cellW * 0.3)),
      y: 10 + row * cellH + randomInt(0, Math.floor(cellH * 0.3))
    });
  }
  
  return positions.sort(() => Math.random() - 0.5);
}

/**
 * 生成数量分配
 */
function generateCounts(types, total) {
  const counts = [];
  let remaining = total;
  
  // 确保有一个明确的最大值
  const maxCount = Math.floor(total / types) + randomInt(2, 4);
  counts.push(maxCount);
  remaining -= maxCount;
  
  // 分配剩余
  for (let i = 1; i < types - 1; i++) {
    const avg = remaining / (types - i);
    const count = Math.max(1, Math.floor(avg * (0.6 + Math.random() * 0.6)));
    const safeCount = Math.min(count, maxCount - 1);
    counts.push(safeCount);
    remaining -= safeCount;
  }
  
  counts.push(Math.max(1, Math.min(remaining, maxCount - 1)));
  return counts.sort(() => Math.random() - 0.5);
}

/**
 * 计算得分
 */
function calcScore(isCorrect, level, types) {
  if (isCorrect) {
    return 80 + types * 20 + level * 15;
  } else {
    return -(40 + level * 10);
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = { ANIMALS, DIFFICULTY, generateLevel, calcScore };