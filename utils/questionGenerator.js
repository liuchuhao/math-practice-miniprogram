// utils/questionGenerator.js

/**
 * 题目生成器类 (西师版教材定制优化版)
 */
class QuestionGenerator {
  constructor(grade) {
    this.grade = grade;
    this.questionHistory = new Set(); // 使用Set避免重复
    this.maxHistorySize = 50; // 增加历史记录容量，防止单次练习中出现重复
  }

  /**
   * 生成一道题目（带防重复检查）
   */
  generate() {
    let attempts = 0;
    const maxAttempts = 100; // 增加尝试次数，确保能生成有效题目
    
    while (attempts < maxAttempts) {
      attempts++;
      
      const type = this.selectQuestionType();
      let question;
      
      switch(type) {
        case 'addition':
          question = this.generateAddition();
          break;
        case 'subtraction':
          question = this.generateSubtraction();
          break;
        case 'multiplication':
          question = this.generateMultiplication();
          break;
        case 'division':
          question = this.generateDivision();
          break;
        case 'mixed':
          question = this.generateMixedOperation();
          break;
        case 'decimal':
          question = this.generateDecimalOperation();
          break;
        case 'fraction': // 新增：简单的分数运算(预留接口，暂用小数模拟或转为简单除法)
          question = this.generateDivision(); // 暂时用除法代替，后续可扩展
          break;
        default:
          question = this.generateAddition();
      }
      
      // 检查题目有效性及是否重复
      if (question && !this.isDuplicate(question.key)) {
        this.addToHistory(question.key);
        return question;
      }
    }
    
    // 兜底策略：如果实在生成不出不重复的，清空历史再试一次加法
    console.warn('题目生成困难，重置历史');
    this.clearHistory();
    const finalQuestion = this.generateAddition();
    this.addToHistory(finalQuestion.key);
    return finalQuestion;
  }

  /**
   * 选择题目类型 (根据西师版教材大纲调整权重)
   */
  selectQuestionType() {
    const typeWeights = this.getTypeWeights();
    const random = Math.random();
    let cumulative = 0;
    
    for (const [type, weight] of Object.entries(typeWeights)) {
      cumulative += weight;
      if (random <= cumulative) {
        return type;
      }
    }
    return 'addition';
  }

  /**
   * 获取类型权重 (西师版配置)
   */
  getTypeWeights() {
    const weights = {
      1: { addition: 0.5, subtraction: 0.5 },
      2: { addition: 0.3, subtraction: 0.3, multiplication: 0.25, division: 0.15 }, // 二年级开始学表内乘除
      3: { addition: 0.2, subtraction: 0.2, multiplication: 0.3, division: 0.3 },     // 三年级多位数乘除
      4: { addition: 0.1, subtraction: 0.1, multiplication: 0.3, division: 0.3, mixed: 0.2 }, // 四年级四则混合
      5: { multiplication: 0.2, division: 0.2, decimal: 0.4, mixed: 0.2 },            // 五年级小数重点
      6: { multiplication: 0.15, division: 0.15, decimal: 0.3, mixed: 0.4 }           // 六年级综合
    };
    return weights[this.grade] || weights[1];
  }

  /**
   * 生成加法题目
   */
  generateAddition() {
    const range = this.getNumberRange('addition');
    let num1 = this.randomInt(range.min1, range.max1);
    let num2 = this.randomInt(range.min2, range.max2);
    
    // 一二年级进位加法控制
    if (this.grade <= 2) {
      // 50%概率生成进位加法 (如 8+5)
      if (Math.random() > 0.5 && (num1 % 10 + num2 % 10 < 10)) {
         num1 = this.randomInt(range.min1, range.max1); // 简单重随，不强求
      }
    }

    const answer = num1 + num2;
    // 确保答案不超过最大限制
    if (answer > range.maxResult) {
       return this.generateAddition(); // 递归重试
    }

    return {
      question: `${num1} + ${num2}`,
      answer: answer,
      type: 'addition',
      key: `add_${num1}_${num2}`,
      operator: '+'
    };
  }

  /**
   * 生成减法题目
   */
  generateSubtraction() {
    const range = this.getNumberRange('subtraction');
    let num1 = this.randomInt(range.min1, range.max1);
    let num2 = this.randomInt(range.min2, range.max2);
    
    // 确保大减小
    if (num1 < num2) [num1, num2] = [num2, num1];
    
    // 一二年级退位减法控制 (如 13-8)
    if (this.grade <= 2) {
       // 确保减数不为0
       if (num2 === 0) num2 = this.randomInt(1, 9);
    }

    const answer = num1 - num2;
    return {
      question: `${num1} - ${num2}`,
      answer: answer,
      type: 'subtraction',
      key: `sub_${num1}_${num2}`,
      operator: '-'
    };
  }

  /**
   * 生成乘法题目
   */
  generateMultiplication() {
    const range = this.getNumberRange('multiplication');
    let num1 = this.randomInt(range.min1, range.max1);
    let num2 = this.randomInt(range.min2, range.max2);
    
    const answer = num1 * num2;
    // 检查结果是否超出年级范围
    if (answer > range.maxResult) {
        return this.generateMultiplication();
    }

    return {
      question: `${num1} × ${num2}`,
      answer: answer,
      type: 'multiplication',
      key: `mul_${num1}_${num2}`,
      operator: '×'
    };
  }

  /**
   * 生成除法题目 (整除)
   */
  generateDivision() {
    const range = this.getNumberRange('division');
    
    // 先生成除数和商，反推被除数，保证整除
    const divisor = this.randomInt(range.min2, range.max2);
    const quotient = this.randomInt(range.minResult, range.maxResult);
    const dividend = divisor * quotient;
    
    return {
      question: `${dividend} ÷ ${divisor}`,
      answer: quotient,
      type: 'division',
      key: `div_${dividend}_${divisor}`,
      operator: '÷'
    };
  }

  /**
   * 生成混合运算 (a + b × c 或 a × b - c)
   * 修复：严格保证中间步骤和结果都是非负整数
   */
  generateMixedOperation() {
    const mode = Math.random() > 0.5 ? 1 : 2; // 1: 乘加/乘减  2: 括号/除法混合
    
    let qStr = '', ans = 0;
    
    // 模式1：简单的两步运算，如 3 × 5 + 4
    if (mode === 1) {
        const n1 = this.randomInt(2, 9);
        const n2 = this.randomInt(2, 9);
        const n3 = this.randomInt(1, 20);
        
        if (Math.random() > 0.5) {
            // n1 × n2 + n3
            qStr = `${n1} × ${n2} + ${n3}`;
            ans = n1 * n2 + n3;
        } else {
            // n1 × n2 - n3 (需保证结果非负)
            const prod = n1 * n2;
            const safeN3 = this.randomInt(1, prod); 
            qStr = `${n1} × ${n2} - ${safeN3}`;
            ans = prod - safeN3;
        }
    } 
    // 模式2：带除法或括号，如 (10 + 5) ÷ 3 或 20 ÷ 4 + 6
    else {
        if (Math.random() > 0.5) {
            // (n1 + n2) ÷ n3
            const n3 = this.randomInt(2, 9);
            const ansTemp = this.randomInt(2, 9);
            const sum = n3 * ansTemp; // 括号内的和
            const n1 = this.randomInt(1, sum - 1);
            const n2 = sum - n1;
            
            qStr = `(${n1} + ${n2}) ÷ ${n3}`;
            ans = ansTemp;
        } else {
            // n1 ÷ n2 + n3
            const n2 = this.randomInt(2, 9);
            const quot = this.randomInt(2, 9);
            const n1 = n2 * quot;
            const n3 = this.randomInt(1, 20);
            
            qStr = `${n1} ÷ ${n2} + ${n3}`;
            ans = quot + n3;
        }
    }

    return {
      question: qStr,
      answer: ans,
      type: 'mixed',
      key: `mix_${qStr.replace(/\s/g, '')}`, // 去除空格作为key
      operator: 'mix'
    };
  }

  /**
   * 生成小数运算
   * 修复：JS浮点数精度问题
   */
  generateDecimalOperation() {
    const isAdd = Math.random() > 0.5;
    // 五六年级生成1-2位小数
    const decimalPlaces = Math.random() > 0.5 ? 1 : 2; 
    const factor = Math.pow(10, decimalPlaces);

    // 用整数生成策略，最后除以 factor，避免精度问题
    let n1Int = this.randomInt(10, 999); 
    let n2Int = this.randomInt(10, 999);
    
    let n1 = n1Int / factor;
    let n2 = n2Int / factor;
    
    let ans, op;

    if (isAdd) {
        ans = (n1Int + n2Int) / factor;
        op = '+';
    } else {
        if (n1 < n2) [n1, n2] = [n2, n1]; // 保证大减小
        ans = Math.round((n1 - n2) * factor) / factor; // 再次取整修正精度
        op = '-';
    }

    return {
      question: `${n1} ${op} ${n2}`,
      answer: ans,
      type: 'decimal',
      key: `dec_${n1}_${op}_${n2}`,
      operator: op
    };
  }

  /**
   * 获取数字范围配置 (西师版难度梯度)
   */
  getNumberRange(operation) {
    const ranges = {
      1: { 
        addition: { min1: 1, max1: 20, min2: 1, max2: 20, maxResult: 20 },
        subtraction: { min1: 1, max1: 20, min2: 1, max2: 20 }
      },
      2: { 
        addition: { min1: 10, max1: 99, min2: 10, max2: 99, maxResult: 100 },
        subtraction: { min1: 10, max1: 100, min2: 10, max2: 99 },
        multiplication: { min1: 1, max1: 9, min2: 1, max2: 9, maxResult: 81 }, // 表内乘法
        division: { min2: 2, max2: 9, minResult: 1, maxResult: 9 } // 表内除法
      },
      3: { 
        addition: { min1: 100, max1: 999, min2: 100, max2: 999, maxResult: 1000 },
        subtraction: { min1: 100, max1: 1000, min2: 100, max2: 999 },
        multiplication: { min1: 10, max1: 99, min2: 2, max2: 9, maxResult: 900 }, // 两位数乘一位数
        division: { min2: 2, max2: 9, minResult: 10, maxResult: 100 }
      },
      4: { 
        addition: { min1: 1000, max1: 9999, min2: 1000, max2: 9999, maxResult: 20000 },
        subtraction: { min1: 1000, max1: 10000, min2: 1000, max2: 9999 },
        multiplication: { min1: 100, max1: 999, min2: 10, max2: 99, maxResult: 100000 }, // 三位数乘两位数
        division: { min2: 10, max2: 99, minResult: 2, maxResult: 50 } // 除数是两位数
      },
      5: { // 五六年级范围更大
        addition: { min1: 100, max1: 10000, min2: 100, max2: 10000, maxResult: 20000 },
        subtraction: { min1: 100, max1: 10000, min2: 100, max2: 10000 },
        multiplication: { min1: 10, max1: 1000, min2: 10, max2: 100, maxResult: 100000 },
        division: { min2: 2, max2: 100, minResult: 2, maxResult: 200 }
      },
      6: { 
        // 六年级与五年级整数范围类似，重点在混合运算和小数分数
        addition: { min1: 100, max1: 10000, min2: 100, max2: 10000, maxResult: 20000 },
        subtraction: { min1: 100, max1: 10000, min2: 100, max2: 10000 },
        multiplication: { min1: 10, max1: 1000, min2: 10, max2: 100, maxResult: 100000 },
        division: { min2: 2, max2: 100, minResult: 2, maxResult: 200 }
      }
    };
    
    const gradeRanges = ranges[this.grade] || ranges[1];
    return gradeRanges[operation] || gradeRanges.addition;
  }

  // 基础工具函数
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // 历史记录管理
  addToHistory(key) {
    this.questionHistory.add(key);
    if (this.questionHistory.size > this.maxHistorySize) {
      const it = this.questionHistory.values();
      this.questionHistory.delete(it.next().value); // 删除最早的一个
    }
  }

  isDuplicate(key) {
    return this.questionHistory.has(key);
  }

  clearHistory() {
    this.questionHistory.clear();
  }
}

module.exports = QuestionGenerator;