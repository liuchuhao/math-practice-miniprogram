// utils/advancedGenerator.js
class AdvancedGenerator {
  constructor(grade) {
    this.grade = grade;
  }

  generate() {
    // 题型概率控制
    const type = Math.random();
    if (type < 0.33) return this.genSymbol();
    if (type < 0.66) return this.genMissing();
    return this.genCompare();
  }

  // 1. 填符号
  genSymbol() {
    const numRange = this.getRange();
    const ops = ['+', '-'];
    if (this.grade >= 2) ops.push('×'); // 2年级开始乘法
    if (this.grade >= 3) ops.push('÷'); // 3年级开始除法
    
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = this.rand(1, numRange);
    let b = this.rand(1, numRange);
    let c;

    if (op === '+') {
      c = a + b;
    } else if (op === '-') {
      if(a < b) [a, b] = [b, a];
      c = a - b;
    } else if (op === '×') {
      // 乘法限制乘数大小，防止结果过大
      a = this.rand(1, 12); 
      c = a * b;
    } else if (op === '÷') {
      // 除法反推：c = a / b => a = c * b
      // 限制商和除数的大小
      c = this.rand(1, 10); // 商
      b = this.rand(1, 10); // 除数
      a = b * c;            // 被除数
    }

    return {
      question: `${a} ⃝ ${b} = ${c}`, // 用统一的圈圈比较美观
      answer: op,
      inputType: 'symbol',
      options: ops
    };
  }

  // 2. 填空缺数 (inputType: number)
  genMissing() {
    const numRange = this.getRange();
    const isAdd = Math.random() > 0.5;
    let a, b, c, qStr, ans;

    if (isAdd) {
      a = this.rand(1, numRange);
      b = this.rand(1, numRange);
      c = a + b;
      if (Math.random() > 0.5) { qStr = `${a} + ( ) = ${c}`; ans = b; }
      else { qStr = `( ) + ${b} = ${c}`; ans = a; }
    } else {
      a = this.rand(Math.floor(numRange/2), numRange * 1.5);
      b = this.rand(1, a);
      c = a - b;
      if (Math.random() > 0.5) { qStr = `${a} - ( ) = ${c}`; ans = b; }
      else { qStr = `( ) - ${b} = ${c}`; ans = a; }
    }

    return {
      question: qStr,
      answer: ans, // 这里返回的是数字，JS submitAnswer 中做了 parseFloat 兼容
      inputType: 'number'
    };
  }

  // 3. 比大小 (inputType: compare)
  genCompare() {
    const limit = this.getRange();
    const v1 = this.rand(5, limit);
    const v2 = v1 + this.rand(-5, 5); // 稍微浮动，制造难度
    
    const leftExpr = this.makeExpr(v1);
    const rightExpr = this.makeExpr(v2);

    let ans;
    if (v1 > v2) ans = '>';
    else if (v1 < v2) ans = '<';
    else ans = '=';

    return {
      question: `${leftExpr} ⃝ ${rightExpr}`,
      answer: ans,
      inputType: 'compare',
      options: ['>', '<', '=']
    };
  }

  makeExpr(val) {
    if (val <= 0) return '0+0';
    // 随机生成加法或减法表达式
    if (Math.random() > 0.5) {
      const sub = this.rand(0, val);
      return `${sub} + ${val - sub}`;
    } else {
      const add = this.rand(1, 10);
      return `${val + add} - ${add}`;
    }
  }

  getRange() {
    switch(this.grade) {
      case 1: return 20;
      case 2: return 50;
      case 3: return 100;
      default: return 100 + (this.grade * 10);
    }
  }

  rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

module.exports = AdvancedGenerator;