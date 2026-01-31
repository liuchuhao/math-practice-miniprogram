/**
 * 汉字魔方 - 游戏核心逻辑
 */
const config = require('../common/game-config');

const HANZI_GROUPS = [
  { radical: '氵', chars: ['河','湖','海','江','浪','泪','洗','游','泳','沙','波','流','汗','池','消','湿','溪','深'] },
  { radical: '木', chars: ['林','森','树','村','杨','柳','梅','松','柏','桃','椅','桌','棵','枝','板','杆','柱','根'] },
  { radical: '亻', chars: ['他','你','们','作','做','休','住','位','低','伙','伴','份','但','体','何','优','传','仔'] },
  { radical: '口', chars: ['吃','喝','叫','听','吹','唱','哭','笑','嘴','咬','味','呼','喊','叹','品','吸','呆','咳'] },
  { radical: '日', chars: ['明','晚','早','时','暗','晴','晒','映','昨','春','星','易','旺','昌','景','暖','晨','昏'] },
  { radical: '女', chars: ['妈','姐','妹','好','姑','娘','婆','奶','她','如','妻','始','姓','婚','嫁','娃','姨','妇'] },
  { radical: '火', chars: ['烧','炒','烤','灯','炎','灭','烟','煮','热','烫','焦','灿','灼','煎','熬','烂','炸','煌'] },
  { radical: '土', chars: ['地','场','城','坐','坏','块','坡','垃','圾','堆','填','塔','墙','境','域','坚','坦','堵'] },
  { radical: '艹', chars: ['花','草','苗','茶','药','菜','芳','落','萝','莲','葡','萄','蓝','藏','蒸','苦','荷','芽'] },
  { radical: '钅', chars: ['钱','铁','银','钟','铜','针','锁','镜','钻','锅','铃','链','销','锋','错','钉','铅','镇'] },
  { radical: '心', chars: ['想','思','念','忘','志','您','怎','忍','恶','悠','恐','总','愁','悲','愿','愈','恋','怠'] },
  { radical: '扌', chars: ['打','把','找','抓','投','拉','拿','换','挂','推','提','摇','搬','接','摔','抱','挡','捡'] }
];

const DIFFICULTY = {
  easy: { gridSize: 3, time: 15 },
  medium: { gridSize: 4, time: 12 },
  hard: { gridSize: 5, time: 10 }
};

/**
 * 生成关卡数据
 */
function generateLevel(difficulty, level) {
  const diff = DIFFICULTY[difficulty];
  const totalCells = diff.gridSize * diff.gridSize;
  
  // 随机选择两个汉字组
  const shuffled = [...HANZI_GROUPS].sort(() => Math.random() - 0.5);
  const mainGroup = shuffled[0];
  const targetGroup = shuffled[1];
  
  // 主要汉字
  const mainChars = [...mainGroup.chars].sort(() => Math.random() - 0.5);
  // 目标汉字（不同偏旁）
  const targetChar = targetGroup.chars[Math.floor(Math.random() * targetGroup.chars.length)];
  // 目标位置
  const targetIndex = Math.floor(Math.random() * totalCells);
  
  // 生成字符数组
  const characters = [];
  for (let i = 0; i < totalCells; i++) {
    if (i === targetIndex) {
      characters.push({ 
        char: targetChar, 
        isTarget: true,
        index: i
      });
    } else {
      const idx = (i < targetIndex ? i : i - 1) % mainChars.length;
      characters.push({ 
        char: mainChars[idx], 
        isTarget: false,
        index: i
      });
    }
  }
  
  return {
    characters,
    targetChar,
    gridSize: diff.gridSize,
    mainRadical: mainGroup.radical,
    targetRadical: targetGroup.radical
  };
}

/**
 * 计算得分
 */
function calcScore(isCorrect, level, gridSize) {
  if (isCorrect) {
    return 80 + gridSize * 15 + level * 20;
  } else {
    return -(40 + level * 10);
  }
}

module.exports = { HANZI_GROUPS, DIFFICULTY, generateLevel, calcScore };