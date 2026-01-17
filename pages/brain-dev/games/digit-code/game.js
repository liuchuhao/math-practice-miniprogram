/**
 * 数字密码 - 游戏核心逻辑
 */
const config = require('../common/game-config');

const DIFFICULTY = {
  easy: { startDigits: 3, memoryTime: 3 },
  medium: { startDigits: 4, memoryTime: 2.5 },
  hard: { startDigits: 5, memoryTime: 2 }
};

/**
 * 生成关卡数据
 */
function generateLevel(difficulty, level) {
  const diff = DIFFICULTY[difficulty];
  
  // 根据等级增加位数，最多8位
  const digits = Math.min(diff.startDigits + Math.floor((level - 1) / 2), 8);
  
  // 生成目标数字序列
  const targetCode = [];
  for (let i = 0; i < digits; i++) {
    targetCode.push(Math.floor(Math.random() * 10));
  }
  
  // 生成选项
  const options = [targetCode.slice()];
  while (options.length < 4) {
    const fake = generateFakeCode(targetCode);
    const fakeStr = fake.join('');
    if (!options.some(opt => opt.join('') === fakeStr)) {
      options.push(fake);
    }
  }
  
  // 记忆时间随等级递减
  const memoryTime = Math.max(diff.memoryTime - (level - 1) * 0.15, 1);
  
  return {
    targetCode,
    options: shuffle(options),
    memoryTime,
    digits
  };
}

/**
 * 生成干扰选项
 */
function generateFakeCode(target) {
  const fake = [...target];
  const changes = Math.random() > 0.5 ? 1 : 2;
  for (let i = 0; i < changes; i++) {
    const pos = Math.floor(Math.random() * fake.length);
    let newDigit;
    do {
      newDigit = Math.floor(Math.random() * 10);
    } while (newDigit === fake[pos]);
    fake[pos] = newDigit;
  }
  return fake;
}

/**
 * 计算得分
 */
function calcScore(isCorrect, level, digits) {
  if (isCorrect) {
    return 80 + digits * 15 + level * 10;
  } else {
    return -(40 + level * 8);
  }
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