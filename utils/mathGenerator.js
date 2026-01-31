// utils/mathGenerator.js
const ProblemBank = require('./problemBank.js');

/**
 * 核心配置：定义每个年级的默认题型结构
 * 新增了 'word_problem' 类型，用于抽取应用题
 */
const GRADE_CONFIGS = {
  'Grade1': [
    { type: 'type1', name: '10以内加减法', count: 5, score: 5 },
    { type: 'type2', name: '20以内不进位加法', count: 5, score: 5 },
    { type: 'type3', name: '20以内不退位减法', count: 5, score: 5 },
    { type: 'word_problem', name: '应用题', count: 2, score: 10 }, // 新增应用题
    { type: 'type4', name: '认识数字', count: 3, score: 5 }
  ],
  'Grade2': [
    { type: 'type1', name: '100以内加减法', count: 5, score: 5 },
    { type: 'type2', name: '表内乘除法', count: 5, score: 5 },
    { type: 'type3', name: '乘加乘减', count: 5, score: 5 },
    { type: 'word_problem', name: '应用题', count: 2, score: 10 },
    { type: 'type5', name: '简单的两步计算', count: 3, score: 5 }
  ],
  'Grade3': [
    { type: 'type1', name: '三位数加减法', count: 5, score: 5 },
    { type: 'type2', name: '两位数乘一位数', count: 5, score: 5 },
    { type: 'type3', name: '简单分数计算', count: 5, score: 5 },
    { type: 'word_problem', name: '应用题', count: 2, score: 10 },
    { type: 'type5', name: '混合运算', count: 3, score: 5 }
  ],
  'Grade4': [
    { type: 'type1', name: '三位数乘两位数', count: 5, score: 5 },
    { type: 'type2', name: '除法运算', count: 5, score: 5 },
    { type: 'type3', name: '小数加减乘除', count: 5, score: 5 },
    { type: 'word_problem', name: '应用题', count: 2, score: 10 },
    { type: 'type5', name: '四则混合运算', count: 3, score: 6 }
  ],
  'Grade5': [
    { type: 'type1', name: '小数乘除法', count: 5, score: 5 },
    { type: 'type2', name: '分数四则运算', count: 5, score: 5 },
    { type: 'type3', name: '简易方程', count: 5, score: 5 },
    { type: 'word_problem', name: '应用题', count: 2, score: 10 },
    { type: 'type5', name: '综合运算', count: 3, score: 5 }
  ],
  'Grade6': [
    { type: 'type1', name: '分数/百分数计算', count: 5, score: 5 },
    { type: 'type2', name: '小数四则运算', count: 5, score: 5 },
    { type: 'type3', name: '比例与求值', count: 5, score: 5 },
    { type: 'word_problem', name: '应用题', count: 2, score: 10 },
    { type: 'type5', name: '综合运算', count: 3, score: 5 }
  ]
};

// ================= 工具函数区 =================

const gcd = (a, b) => {
  while (b !== 0) { let temp = b; b = a % b; a = temp; }
  return a;
};

const lcm = (a, b) => (a * b) / gcd(a, b);

const simplifyFraction = (fraction) => {
  if (!fraction.includes('/')) return fraction;
  const parts = fraction.split('/');
  let num = parseInt(parts[0]);
  let den = parseInt(parts[1]);
  if (den === 0 || num === 0) return '0';
  const divisor = gcd(Math.abs(num), den);
  num = num / divisor;
  den = den / divisor;
  if (den === 1) return num.toString();
  return `${num}/${den}`;
};

const numberToChinese = (num) => {
  const cn = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  if (num < 10) return cn[num];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return (ten === 1 ? '十' : cn[ten] + '十') + (one === 0 ? '' : cn[one]);
  }
  return num.toString();
};

/**
 * 答案标准化 (这是判题准确的关键)
 */
const normalizeAnswer = (answer) => {
  if (answer === null || answer === undefined) return '';
  let str = answer.toString().replace(/\s+/g, ''); // 去空格
  // 全角转半角
  str = str.replace(/＞/g, '>').replace(/＜/g, '<').replace(/＝/g, '=')
           .replace(/÷/g, '/').replace(/×/g, '*')
           .replace(/：/g, ':').toLowerCase();
  
  // 处理小数末尾的0 (如 1.50 -> 1.5)
  if (str.includes('.') && !str.includes(':')) { // 排除比例 1:2.5 这种情况
    str = parseFloat(str).toString();
  }
  return str;
};

// ================= 生成器逻辑区 =================

const Generators = {
  // -------- 一年级 --------
  'Grade1': {
    'type1': (id, score) => { // 10以内加减
      const n1 = Math.floor(Math.random() * 10);
      const n2 = Math.floor(Math.random() * (10 - n1));
      const op = Math.random() > 0.5 ? '+' : '-';
      return { id, type: 'basic', score, q: op==='+'?`${n1}+${n2}=`:`${n1}-${n2}=`, a: (op==='+'?n1+n2:n1-n2) };
    },
    'type2': (id, score) => { // 20以内不进位加
      const n1 = Math.floor(Math.random() * 10) + 10;
      const n2 = Math.floor(Math.random() * (20 - n1));
      return { id, type: 'basic', score, q: `${n1}+${n2}=`, a: n1+n2 };
    },
    'type3': (id, score) => { // 20以内不退位减
      const n1 = Math.floor(Math.random() * 10) + 10;
      const n2 = Math.floor(Math.random() * (n1 - 10)); 
      return { id, type: 'basic', score, q: `${n1}-${n2}=`, a: n1-n2 };
    },
    'type4': (id, score) => { // 读数
      const n = Math.floor(Math.random() * 100);
      return { id, type: 'text', score, q: `写出数字 ${n} 的读法`, a: numberToChinese(n) };
    }
  },

  // -------- 二年级 --------
  'Grade2': {
    'type1': (id, score) => { // 100以内加减
      const n1 = Math.floor(Math.random()*90)+10;
      const n2 = Math.floor(Math.random()*(100-n1));
      const op = Math.random()>0.5?'+':'-';
      return { id, type: 'basic', score, q: `${n1}${op}${n2}=`, a: op==='+'?n1+n2:n1-n2 };
    },
    'type2': (id, score) => { // 表内乘除
      const n1 = Math.floor(Math.random()*9)+1;
      const n2 = Math.floor(Math.random()*9)+1;
      if (Math.random()>0.5) return { id, type: 'basic', score, q: `${n1*n2}÷${n1}=`, a: n2 };
      return { id, type: 'basic', score, q: `${n1}×${n2}=`, a: n1*n2 };
    },
    'type3': (id, score) => { // 乘加乘减
      const n1=Math.floor(Math.random()*5)+2, n2=Math.floor(Math.random()*5)+2, n3=Math.floor(Math.random()*10)+1;
      const op = Math.random()>0.5?'+':'-';
      const ans = op==='+' ? n1*n2+n3 : n1*n2-n3;
      return { id, type: 'basic', score, q: `${n1}×${n2}${op}${n3}=`, a: ans };
    },
    'type5': (id, score) => { // 两步计算
      const n1=Math.floor(Math.random()*20)+5, n2=Math.floor(Math.random()*10)+2, n3=Math.floor(Math.random()*10)+2;
      return { id, type: 'basic', score, q: `${n1}+${n2}-${n3}=`, a: n1+n2-n3 }; // 简化防负数
    }
  },

  // -------- 三年级 --------
  'Grade3': {
    'type1': (id, score) => { // 三位数加减
      const n1=Math.floor(Math.random()*800)+100, n2=Math.floor(Math.random()*800)+100;
      return { id, type: 'basic', score, q: `${n1}+${n2}=`, a: n1+n2 };
    },
    'type2': (id, score) => { // 两位乘一位
      const n1=Math.floor(Math.random()*90)+10, n2=Math.floor(Math.random()*9)+1;
      return { id, type: 'basic', score, q: `${n1}×${n2}=`, a: n1*n2 };
    },
    'type3': (id, score) => { // 简单分数
      const d = Math.floor(Math.random()*8)+2;
      const n1=1, n2=1;
      return { id, type: 'fraction', score, q: `${n1}/${d} + ${n2}/${d} =`, a: simplifyFraction(`${n1+n2}/${d}`) };
    },
    'type5': (id, score) => { // 混合
      const n1=Math.floor(Math.random()*20)+10, n2=Math.floor(Math.random()*9)+2, n3=Math.floor(Math.random()*9)+2;
      return { id, type: 'basic', score, q: `${n1}+${n2}×${n3}=`, a: n1+n2*n3 };
    }
  },

  // -------- 四年级 --------
  'Grade4': {
    'type1': (id, score) => { // 三位乘两位
      const n1=Math.floor(Math.random()*900)+100, n2=Math.floor(Math.random()*90)+10;
      return { id, type: 'basic', score, q: `${n1}×${n2}=`, a: n1*n2 };
    },
    'type2': (id, score) => { // 除法
      const div=Math.floor(Math.random()*89)+11;
      const res=Math.floor(Math.random()*20)+2;
      return { id, type: 'basic', score, q: `${div*res}÷${div}=`, a: res };
    },
    'type3': (id, score) => { // 小数加减
      const d1=parseFloat((Math.random()*10).toFixed(2)), d2=parseFloat((Math.random()*10).toFixed(2));
      return { id, type: 'basic', score, q: `${d1}+${d2}=`, a: parseFloat((d1+d2).toFixed(2)) };
    },
    'type5': (id, score) => { // 四则
      const n1=Math.floor(Math.random()*50)+10, n2=Math.floor(Math.random()*10)+2, n3=Math.floor(Math.random()*5)+2;
      return { id, type: 'basic', score, q: `(${n1}-${n2})×${n3}=`, a: (n1-n2)*n3 };
    }
  },

  // -------- 五年级 --------
  'Grade5': {
    'type1': (id, score) => { // 小数乘除
      const d1=parseFloat((Math.random()*9+0.1).toFixed(1));
      const d2=parseFloat((Math.random()*9+0.1).toFixed(1));
      return { id, type: 'basic', score, q: `${d1}×${d2}=`, a: parseFloat((d1*d2).toFixed(2)) };
    },
    'type2': (id, score) => { // 分数乘法
      const d1=Math.floor(Math.random()*8)+2, d2=Math.floor(Math.random()*8)+2;
      return { id, type: 'fraction', score, q: `1/${d1} × 1/${d2} =`, a: `1/${d1*d2}` };
    },
    'type3': (id, score) => { // 方程
      const x=Math.floor(Math.random()*10)+1, a=Math.floor(Math.random()*9)+2;
      return { id, type: 'text', score, q: `${a}x = ${a*x}, x=?`, a: x };
    },
    'type5': (id, score) => { // 综合
      const n1=Math.floor(Math.random()*10)+1;
      const d1=parseFloat((Math.random()*5).toFixed(1));
      return { id, type: 'basic', score, q: `(${n1}+${d1})×2=`, a: (n1+d1)*2 };
    }
  },

  // -------- 六年级 --------
  'Grade6': {
    'type1': (id, score) => { // 百分数
      const n=Math.floor(Math.random()*100)+10;
      return { id, type: 'text', score, q: `${n}的20%是多少`, a: n*0.2 };
    },
    'type2': (id, score) => Generators.Grade5.type1(id, score),
    'type3': (id, score) => { // 比例
      const a=2, b=3, x=Math.floor(Math.random()*10)+2;
      return { id, type: 'text', score, q: `2:3 = ${x*2}:x, x=?`, a: x*3 };
    },
    'type5': (id, score) => Generators.Grade4.type5(id, score)
  }
};

/**
 * 核心方法：生成试卷
 */
const generatePaper = (gradeKey, config) => {
  let questions = [];
  let idCounter = 1;
  const gradeNum = parseInt(gradeKey.replace('Grade', ''));

  // 1. 获取该年级的应用题库
  let gradeProblems = ProblemBank[gradeNum] || [];
  
  // 2. 遍历配置生成题目
  config.forEach(item => {
    // 特殊处理应用题
    if (item.type === 'word_problem') {
      const count = item.count;
      if (gradeProblems.length > 0 && count > 0) {
        // 随机抽取不重复的题目
        const shuffled = [...gradeProblems].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, count);
        
        selected.forEach(p => {
          questions.push({
            id: idCounter.toString(),
            type: 'word', // 标记为文字题
            category: '应用题',
            score: item.score,
            question: p.content,
            answer: p.answer
          });
          idCounter++;
        });
      }
    } 
    // 处理普通计算题
    else {
      const generator = Generators[gradeKey] && Generators[gradeKey][item.type];
      if (generator) {
        for (let i = 0; i < item.count; i++) {
          try {
            const qObj = generator(idCounter.toString(), item.score);
            questions.push({
              id: qObj.id.toString(),
              type: qObj.type || 'basic',
              category: item.name,
              score: item.score,
              question: qObj.q,
              answer: qObj.a
            });
            idCounter++;
          } catch (e) {
            console.error('Gen Error', e);
          }
        }
      }
    }
  });

  return questions;
};

module.exports = {
  GRADE_CONFIGS,
  generatePaper,
  normalizeAnswer
};