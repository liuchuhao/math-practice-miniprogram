Page({
  data: {
    activeTab: 'config',
    paperTitle: '六年级数学计算练习卷',
    isGenerating: false,
    showAnswerInputs: false,
    showScore: false,
    
    // 年级选择
    gradeList: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
    currentGrade: '六年级',
    
    // 题目配置（根据年级动态变化）
    questionConfig: {
      '一年级': {
        type1: { type: 'type1', name: '10以内加减法', count: 5, score: 5 },
        type2: { type: 'type2', name: '20以内不进位加法', count: 5, score: 5 },
        type3: { type: 'type3', name: '20以内不退位减法', count: 5, score: 5 },
        type4: { type: 'type4', name: '认识数字', count: 5, score: 5 },
        type5: { type: 'type5', name: '简单比较', count: 5, score: 5 }
      },
      '二年级': {
        type1: { type: 'type1', name: '100以内加减法', count: 5, score: 5 },
        type2: { type: 'type2', name: '表内乘除法', count: 5, score: 5 },
        type3: { type: 'type3', name: '乘加乘减', count: 5, score: 5 },
        type4: { type: 'type4', name: '连加连减', count: 5, score: 5 },
        type5: { type: 'type5', name: '简单的两步计算', count: 5, score: 6 }
      },
      '三年级': {
        type1: { type: 'type1', name: '三位数加减法', count: 5, score: 5 },
        type2: { type: 'type2', name: '两位数乘一位数', count: 5, score: 5 },
        type3: { type: 'type3', name: '简单分数计算', count: 5, score: 5 },
        type4: { type: 'type4', name: '简单小数加减', count: 5, score: 5 },
        type5: { type: 'type5', name: '混合运算', count: 5, score: 6 }
      },
      '四年级': {
        type1: { type: 'type1', name: '多位数乘除法', count: 5, score: 5 },
        type2: { type: 'type2', name: '小数乘除法', count: 5, score: 5 },
        type3: { type: 'type3', name: '分数加减法', count: 5, score: 5 },
        type4: { type: 'type4', name: '四则混合运算', count: 5, score: 6 },
        type5: { type: 'type5', name: '简便运算', count: 5, score: 6 }
      },
      '五年级': {
        type1: { type: 'type1', name: '小数四则运算', count: 5, score: 5 },
        type2: { type: 'type2', name: '分数四则运算', count: 5, score: 5 },
        type3: { type: 'type3', name: '百分数计算', count: 5, score: 5 },
        type4: { type: 'type4', name: '复杂混合运算', count: 5, score: 6 },
        type5: { type: 'type5', name: '解方程', count: 5, score: 6 }
      },
      '六年级': {
        type1: { type: 'type1', name: '分数计算', count: 5, score: 5 },
        type2: { type: 'type2', name: '小数计算', count: 5, score: 5 },
        type3: { type: 'type3', name: '百分数计算', count: 5, score: 5 },
        type4: { type: 'type4', name: '混合运算', count: 5, score: 6 },
        type5: { type: 'type5', name: '综合运算', count: 5, score: 8 }
      }
    },
    
    // 当前年级配置
    currentConfig: {},
    
    questions: [],
    userAnswers: {},
    score: 0,
    correctCount: 0
  },

  onLoad: function() {
    // 初始化当前年级配置
    this.setData({
      currentConfig: this.data.questionConfig[this.data.currentGrade]
    });
    // 计算初始总数
    this.computeTotals();
  },

  // 切换年级
  changeGrade: function(e) {
    const grade = e.detail.value;
    this.setData({
      currentGrade: grade,
      currentConfig: this.data.questionConfig[grade],
      paperTitle: `${grade}数学计算练习卷`
    }, () => {
      this.computeTotals();
    });
  },

  // 计算总数
  computeTotals: function() {
    const config = this.data.currentConfig;
    let totalCount = 0;
    let totalScore = 0;
    
    for (const key in config) {
      totalCount += config[key].count;
      totalScore += config[key].count * config[key].score;
    }
    
    this.setData({
      totalCount,
      totalScore
    });
  },

  // 切换选项卡
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // 切换到配置页面
  switchToConfig: function() {
    this.setData({ activeTab: 'config' });
  },

  // 处理试卷标题输入
  onTitleInput: function(e) {
    this.setData({
      paperTitle: e.detail.value
    });
  },

  // 更新题目数量
  updateQuestionCount: function(e) {
    const { type } = e.currentTarget.dataset;
    let value = parseInt(e.detail.value) || 0;
    value = Math.max(0, Math.min(50, value));
    
    this.updateConfigCount(type, value);
  },

  // 更新配置
  updateConfigCount: function(type, count) {
    const configKey = `currentConfig.${type}.count`;
    this.setData({
      [configKey]: count
    }, () => {
      this.computeTotals();
    });
  },

  // 生成试卷
  generatePaper: function() {
    if (this.data.isGenerating) return;
    
    this.setData({ isGenerating: true });
    
    setTimeout(() => {
      const questions = this.generateQuestions();
      
      this.setData({
        questions,
        isGenerating: false,
        activeTab: 'preview',
        userAnswers: {},
        showAnswerInputs: false,
        score: 0,
        correctCount: 0,
        showScore: false
      });
      
      wx.showToast({
        title: '试卷生成成功',
        icon: 'success'
      });
    }, 800);
  },

  // 生成题目
  generateQuestions: function() {
    const questions = [];
    const config = this.data.currentConfig;
    const grade = this.data.currentGrade;
    let questionId = 1;
    
    // 根据年级生成题目
    for (const key in config) {
      const questionType = config[key];
      for (let i = 0; i < questionType.count; i++) {
        const question = this.generateQuestionByGrade(grade, questionType.type, questionId, questionType.score);
        if (question) {
          questions.push(question);
          questionId++;
        }
      }
    }
    
    return questions;
  },

  // 根据年级和类型生成题目
  generateQuestionByGrade: function(grade, type, id, score) {
    switch(grade) {
      case '一年级':
        return this.generateGrade1Question(type, id, score);
      case '二年级':
        return this.generateGrade2Question(type, id, score);
      case '三年级':
        return this.generateGrade3Question(type, id, score);
      case '四年级':
        return this.generateGrade4Question(type, id, score);
      case '五年级':
        return this.generateGrade5Question(type, id, score);
      case '六年级':
        return this.generateGrade6Question(type, id, score);
      default:
        return this.generateGrade6Question(type, id, score);
    }
  },

  // 一年级题目生成
  generateGrade1Question: function(type, id, score) {
    let question = '';
    let answer = '';
    
    switch(type) {
      case 'type1': // 10以内加减法
        const num1 = Math.floor(Math.random() * 10);
        const num2 = Math.floor(Math.random() * (10 - num1));
        const operator = Math.random() > 0.5 ? '+' : '-';
        if (operator === '+') {
          question = `${num1} + ${num2}`;
          answer = (num1 + num2).toString();
        } else {
          question = `${num1} - ${num2}`;
          answer = (num1 - num2).toString();
        }
        break;
        
      case 'type2': // 20以内不进位加法
        const num3 = Math.floor(Math.random() * 10) + 10;
        const num4 = Math.floor(Math.random() * (20 - num3));
        question = `${num3} + ${num4}`;
        answer = (num3 + num4).toString();
        break;
        
      case 'type3': // 20以内不退位减法
        const num5 = Math.floor(Math.random() * 10) + 10;
        const num6 = Math.floor(Math.random() * num5);
        question = `${num5} - ${num6}`;
        answer = (num5 - num6).toString();
        break;
        
      case 'type4': // 认识数字
        const number = Math.floor(Math.random() * 100);
        question = `写出数字 ${number} 的读法`;
        answer = this.numberToChinese(number);
        break;
        
      case 'type5': // 简单比较
        const num7 = Math.floor(Math.random() * 20);
        const num8 = Math.floor(Math.random() * 20);
        question = `比较大小：${num7} ○ ${num8}`;
        if (num7 > num8) {
          answer = '＞';
        } else if (num7 < num8) {
          answer = '＜';
        } else {
          answer = '＝';
        }
        break;
    }
    
    return {
      id: id.toString(),
      type: type,
      category: this.data.currentConfig[type].name,
      score: score,
      question: question,
      answer: answer
    };
  },

  // 二年级题目生成
  generateGrade2Question: function(type, id, score) {
    let question = '';
    let answer = '';
    
    switch(type) {
      case 'type1': // 100以内加减法
        const num1 = Math.floor(Math.random() * 90) + 10;
        const num2 = Math.floor(Math.random() * (100 - num1));
        const operator = Math.random() > 0.5 ? '+' : '-';
        if (operator === '+') {
          question = `${num1} + ${num2}`;
          answer = (num1 + num2).toString();
        } else {
          question = `${num1} - ${num2}`;
          answer = (num1 - num2).toString();
        }
        break;
        
      case 'type2': // 表内乘除法
        const multiplier1 = Math.floor(Math.random() * 9) + 1;
        const multiplier2 = Math.floor(Math.random() * 9) + 1;
        const isDivision = Math.random() > 0.5;
        if (isDivision) {
          const product = multiplier1 * multiplier2;
          question = `${product} ÷ ${multiplier1}`;
          answer = multiplier2.toString();
        } else {
          question = `${multiplier1} × ${multiplier2}`;
          answer = (multiplier1 * multiplier2).toString();
        }
        break;
        
      case 'type3': // 乘加乘减
        const m1 = Math.floor(Math.random() * 5) + 2;
        const m2 = Math.floor(Math.random() * 5) + 2;
        const addNum = Math.floor(Math.random() * 10) + 1;
        if (Math.random() > 0.5) {
          question = `${m1} × ${m2} + ${addNum}`;
          answer = (m1 * m2 + addNum).toString();
        } else {
          question = `${m1} × ${m2} - ${addNum}`;
          answer = (m1 * m2 - addNum).toString();
        }
        break;
        
      case 'type4': // 连加连减
        const a = Math.floor(Math.random() * 30) + 10;
        const b = Math.floor(Math.random() * 20) + 5;
        const c = Math.floor(Math.random() * 10) + 1;
        if (Math.random() > 0.5) {
          question = `${a} + ${b} + ${c}`;
          answer = (a + b + c).toString();
        } else {
          question = `${a} - ${b} - ${c}`;
          answer = (a - b - c).toString();
        }
        break;
        
      case 'type5': // 简单的两步计算
        const numA = Math.floor(Math.random() * 20) + 5;
        const numB = Math.floor(Math.random() * 10) + 2;
        const numC = Math.floor(Math.random() * 10) + 2;
        const operations = ['+', '-', '×', '+', '-', '×'];
        const op1 = operations[Math.floor(Math.random() * 6)];
        const op2 = operations[Math.floor(Math.random() * 3)];
        question = `${numA} ${op1} ${numB} ${op2} ${numC}`;
        // 简单计算（不考虑优先级）
        let result = 0;
        if (op1 === '+') result = numA + numB;
        else if (op1 === '-') result = numA - numB;
        else if (op1 === '×') result = numA * numB;
        
        if (op2 === '+') result += numC;
        else if (op2 === '-') result -= numC;
        else if (op2 === '×') result *= numC;
        
        answer = result.toString();
        break;
    }
    
    return {
      id: id.toString(),
      type: type,
      category: this.data.currentConfig[type].name,
      score: score,
      question: question,
      answer: answer
    };
  },

  // 三年级题目生成
  generateGrade3Question: function(type, id, score) {
    let question = '';
    let answer = '';
    
    switch(type) {
      case 'type1': // 三位数加减法
        const num1 = Math.floor(Math.random() * 900) + 100;
        const num2 = Math.floor(Math.random() * 900) + 100;
        const operator = Math.random() > 0.5 ? '+' : '-';
        if (operator === '+') {
          question = `${num1} + ${num2}`;
          answer = (num1 + num2).toString();
        } else {
          question = `${num1} - ${num2}`;
          answer = (num1 - num2).toString();
        }
        break;
        
      case 'type2': // 两位数乘一位数
        const twoDigit = Math.floor(Math.random() * 90) + 10;
        const oneDigit = Math.floor(Math.random() * 9) + 1;
        question = `${twoDigit} × ${oneDigit}`;
        answer = (twoDigit * oneDigit).toString();
        break;
        
      case 'type3': // 简单分数计算
        const den1 = Math.floor(Math.random() * 5) + 2;
        const nume1 = Math.floor(Math.random() * (den1 - 1)) + 1;
        const den2 = Math.floor(Math.random() * 5) + 2;
        const nume2 = Math.floor(Math.random() * (den2 - 1)) + 1;
        const fracOp = Math.random() > 0.5 ? '+' : '-';
        if (fracOp === '+') {
          question = `${nume1}/${den1} + ${nume2}/${den2}`;
          answer = `${nume1 * den2 + nume2 * den1}/${den1 * den2}`;
        } else {
          question = `${nume1}/${den1} - ${nume2}/${den2}`;
          answer = `${nume1 * den2 - nume2 * den1}/${den1 * den2}`;
        }
        answer = this.simplifyFraction(answer);
        break;
        
      case 'type4': // 简单小数加减
        const decimal1 = parseFloat((Math.random() * 9 + 1).toFixed(1));
        const decimal2 = parseFloat((Math.random() * 9 + 1).toFixed(1));
        const decOp = Math.random() > 0.5 ? '+' : '-';
        question = `${decimal1} ${decOp} ${decimal2}`;
        if (decOp === '+') {
          answer = (decimal1 + decimal2).toFixed(1);
        } else {
          answer = (decimal1 - decimal2).toFixed(1);
        }
        break;
        
      case 'type5': // 混合运算
        const base = Math.floor(Math.random() * 50) + 10;
        const x = Math.floor(Math.random() * 10) + 2;
        const y = Math.floor(Math.random() * 10) + 2;
        const ops = ['+', '-', '×', '÷'];
        const opA = ops[Math.floor(Math.random() * 4)];
        const opB = ops[Math.floor(Math.random() * 2)];
        question = `${base} ${opA} ${x} ${opB} ${y}`;
        
        let result = 0;
        if (opA === '×' || opA === '÷') {
          result = opA === '×' ? base * x : Math.floor(base / x);
          result = opB === '+' ? result + y : result - y;
        } else {
          if (opB === '×' || opB === '÷') {
            const second = opB === '×' ? x * y : Math.floor(x / y);
            result = opA === '+' ? base + second : base - second;
          } else {
            result = opA === '+' ? base + x : base - x;
            result = opB === '+' ? result + y : result - y;
          }
        }
        
        answer = result.toString();
        break;
    }
    
    return {
      id: id.toString(),
      type: type,
      category: this.data.currentConfig[type].name,
      score: score,
      question: question,
      answer: answer
    };
  },

  // 四年级题目生成
  generateGrade4Question: function(type, id, score) {
    let question = '';
    let answer = '';
    
    switch(type) {
      case 'type1': // 多位数乘除法
        const num1 = Math.floor(Math.random() * 9000) + 1000;
        const num2 = Math.floor(Math.random() * 90) + 10;
        const isDiv = Math.random() > 0.5;
        if (isDiv) {
          question = `${num1} ÷ ${num2}`;
          answer = (num1 / num2).toFixed(2);
        } else {
          question = `${num1} × ${num2}`;
          answer = (num1 * num2).toString();
        }
        break;
        
      case 'type2': // 小数乘除法
        const decimal1 = parseFloat((Math.random() * 9 + 1).toFixed(2));
        const decimal2 = parseFloat((Math.random() * 9 + 1).toFixed(1));
        const decOp = Math.random() > 0.5 ? '×' : '÷';
        question = `${decimal1} ${decOp} ${decimal2}`;
        if (decOp === '×') {
          answer = (decimal1 * decimal2).toFixed(3);
        } else {
          answer = (decimal1 / decimal2).toFixed(3);
        }
        break;
        
      case 'type3': // 分数加减法
        const denA = Math.floor(Math.random() * 8) + 2;
        const numeA = Math.floor(Math.random() * (denA - 1)) + 1;
        const denB = Math.floor(Math.random() * 8) + 2;
        const numeB = Math.floor(Math.random() * (denB - 1)) + 1;
        const fracOperator = Math.random() > 0.5 ? '+' : '-';
        question = `${numeA}/${denA} ${fracOperator} ${numeB}/${denB}`;
        if (fracOperator === '+') {
          answer = `${numeA * denB + numeB * denA}/${denA * denB}`;
        } else {
          answer = `${numeA * denB - numeB * denA}/${denA * denB}`;
        }
        answer = this.simplifyFraction(answer);
        break;
        
      case 'type4': // 四则混合运算
        const a = Math.floor(Math.random() * 50) + 10;
        const b = Math.floor(Math.random() * 20) + 5;
        const c = Math.floor(Math.random() * 10) + 2;
        const d = Math.floor(Math.random() * 5) + 2;
        question = `${a} + ${b} × ${c} - ${d}`;
        answer = (a + b * c - d).toString();
        break;
        
      case 'type5': // 简便运算
        const numX = Math.floor(Math.random() * 50) + 10;
        const numY = Math.floor(Math.random() * 40) + 10;
        const numZ = Math.floor(Math.random() * 30) + 10;
        
        // 随机选择一种简便运算类型
        const method = Math.floor(Math.random() * 3);
        if (method === 0) {
          // 加法结合律
          question = `${numX} + ${numY} + ${numZ}`;
          answer = (numX + numY + numZ).toString();
        } else if (method === 1) {
          // 乘法分配律
          question = `${numX} × ${numY} + ${numX} × ${numZ}`;
          answer = (numX * (numY + numZ)).toString();
        } else {
          // 减法性质
          question = `${numX + numY + numZ} - ${numY} - ${numZ}`;
          answer = numX.toString();
        }
        break;
    }
    
    return {
      id: id.toString(),
      type: type,
      category: this.data.currentConfig[type].name,
      score: score,
      question: question,
      answer: answer
    };
  },

  // 五年级题目生成
  generateGrade5Question: function(type, id, score) {
    let question = '';
    let answer = '';
    
    switch(type) {
      case 'type1': // 小数四则运算
        const dec1 = parseFloat((Math.random() * 9 + 1).toFixed(2));
        const dec2 = parseFloat((Math.random() * 9 + 1).toFixed(1));
        const dec3 = parseFloat((Math.random() * 5 + 1).toFixed(1));
        const ops = ['+', '-', '×', '÷'];
        const op1 = ops[Math.floor(Math.random() * 4)];
        const op2 = ops[Math.floor(Math.random() * 2)];
        question = `${dec1} ${op1} ${dec2} ${op2} ${dec3}`;
        
        let result = 0;
        if (op1 === '×' || op1 === '÷') {
          result = op1 === '×' ? dec1 * dec2 : dec1 / dec2;
          result = op2 === '+' ? result + dec3 : result - dec3;
        } else {
          if (op2 === '×' || op2 === '÷') {
            const second = op2 === '×' ? dec2 * dec3 : dec2 / dec3;
            result = op1 === '+' ? dec1 + second : dec1 - second;
          } else {
            result = op1 === '+' ? dec1 + dec2 : dec1 - dec2;
            result = op2 === '+' ? result + dec3 : result - dec3;
          }
        }
        
        answer = parseFloat(result.toFixed(3)).toString();
        break;
        
      case 'type2': // 分数四则运算
        const den1 = Math.floor(Math.random() * 8) + 2;
        const nume1 = Math.floor(Math.random() * (den1 - 1)) + 1;
        const den2 = Math.floor(Math.random() * 8) + 2;
        const nume2 = Math.floor(Math.random() * (den2 - 1)) + 1;
        const fracOps = ['+', '-', '×', '÷'];
        const fracOp = fracOps[Math.floor(Math.random() * 4)];
        
        question = `${nume1}/${den1} ${fracOp} ${nume2}/${den2}`;
        
        switch(fracOp) {
          case '+':
            answer = `${nume1 * den2 + nume2 * den1}/${den1 * den2}`;
            break;
          case '-':
            answer = `${nume1 * den2 - nume2 * den1}/${den1 * den2}`;
            break;
          case '×':
            answer = `${nume1 * nume2}/${den1 * den2}`;
            break;
          case '÷':
            answer = `${nume1 * den2}/${den1 * nume2}`;
            break;
        }
        
        answer = this.simplifyFraction(answer);
        break;
        
      case 'type3': // 百分数计算
        const base = Math.floor(Math.random() * 500) + 100;
        const percent = Math.floor(Math.random() * 80) + 10;
        question = `${percent}% × ${base}`;
        answer = ((base * percent) / 100).toFixed(2);
        break;
        
      case 'type4': // 复杂混合运算
        const a = Math.floor(Math.random() * 50) + 10;
        const b = Math.floor(Math.random() * 20) + 5;
        const c = Math.floor(Math.random() * 10) + 2;
        const d = Math.floor(Math.random() * 10) + 2;
        question = `(${a} + ${b}) × ${c} - ${d} ÷ 2`;
        answer = ((a + b) * c - d / 2).toFixed(2);
        break;
        
      case 'type5': // 解方程
        const xCoeff = Math.floor(Math.random() * 5) + 1;
        const constant = Math.floor(Math.random() * 20) + 5;
        const resultNum = xCoeff * Math.floor(Math.random() * 10) + constant;
        question = `${xCoeff}x + ${constant} = ${resultNum}`;
        answer = ((resultNum - constant) / xCoeff).toFixed(2);
        break;
    }
    
    return {
      id: id.toString(),
      type: type,
      category: this.data.currentConfig[type].name,
      score: score,
      question: question,
      answer: answer
    };
  },

  // 六年级题目生成（保留原有功能）
  generateGrade6Question: function(type, id, score) {
    // 这里调用原来的六年级生成函数
    switch(type) {
      case 'type1': // 分数计算
        return this.generateFractionQuestion(id, score);
      case 'type2': // 小数计算
        return this.generateDecimalQuestion(id, score);
      case 'type3': // 百分数计算
        return this.generatePercentageQuestion(id, score);
      case 'type4': // 混合运算
        return this.generateMixedQuestion(id, score);
      case 'type5': // 综合运算
        return this.generateComprehensiveQuestion(id, score);
      default:
        return this.generateFractionQuestion(id, score);
    }
  },

  // 以下是原有的六年级题目生成函数
  generateFractionQuestion: function(id, score) {
    const operators = ['+', '-', '×', '÷'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    const den1 = Math.floor(Math.random() * 9) + 2;
    const num1 = Math.floor(Math.random() * (den1 - 1)) + 1;
    
    const den2 = Math.floor(Math.random() * 9) + 2;
    const num2 = Math.floor(Math.random() * (den2 - 1)) + 1;
    
    let answer;
    switch (operator) {
      case '+':
        answer = `${num1 * den2 + num2 * den1}/${den1 * den2}`;
        break;
      case '-':
        answer = `${num1 * den2 - num2 * den1}/${den1 * den2}`;
        break;
      case '×':
        answer = `${num1 * num2}/${den1 * den2}`;
        break;
      case '÷':
        answer = `${num1 * den2}/${den1 * num2}`;
        break;
    }
    
    return {
      id: id.toString(),
      type: 'fraction',
      category: '分数计算',
      score: score,
      num1: { numerator: num1, denominator: den1 },
      num2: { numerator: num2, denominator: den2 },
      operator: operator,
      answer: this.simplifyFraction(answer)
    };
  },

  generateDecimalQuestion: function(id, score) {
    const operators = ['+', '-', '×', '÷'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let num1, num2;
    
    if (operator === '×' || operator === '÷') {
      num1 = parseFloat((Math.random() * 9 + 1).toFixed(1));
      num2 = parseFloat((Math.random() * 9 + 1).toFixed(1));
    } else {
      num1 = parseFloat((Math.random() * 99 + 1).toFixed(2));
      num2 = parseFloat((Math.random() * 99 + 1).toFixed(2));
    }
    
    let answer;
    switch (operator) {
      case '+':
        answer = parseFloat((num1 + num2).toFixed(2));
        break;
      case '-':
        answer = parseFloat((num1 - num2).toFixed(2));
        break;
      case '×':
        answer = parseFloat((num1 * num2).toFixed(2));
        break;
      case '÷':
        answer = parseFloat((num1 / num2).toFixed(2));
        break;
    }
    
    return {
      id: id.toString(),
      type: 'decimal',
      category: '小数计算',
      score: score,
      question: `${num1} ${operator} ${num2}`,
      answer: answer.toString()
    };
  },

  generatePercentageQuestion: function(id, score) {
    const base = Math.floor(Math.random() * 900) + 100;
    const percentage = Math.floor(Math.random() * 90) + 10;
    
    const question = `${percentage}% × ${base}`;
    const answer = ((base * percentage) / 100).toString();
    
    return {
      id: id.toString(),
      type: 'percentage',
      category: '百分数计算',
      score: score,
      question: question,
      answer: parseFloat(answer).toFixed(2)
    };
  },

  generateMixedQuestion: function(id, score) {
    const base = Math.floor(Math.random() * 50) + 10;
    const ops = ['+', '-', '×', '÷'];
    
    const op1 = ops[Math.floor(Math.random() * 4)];
    const op2 = ops[Math.floor(Math.random() * 4)];
    
    const num1 = Math.floor(Math.random() * 20) + 5;
    const num2 = Math.floor(Math.random() * 20) + 5;
    
    const question = `${base} ${op1} ${num1} ${op2} ${num2}`;
    
    let answer;
    if ((op1 === '×' || op1 === '÷') && (op2 === '+' || op2 === '-')) {
      const firstResult = op1 === '×' ? base * num1 : base / num1;
      answer = op2 === '+' ? firstResult + num2 : firstResult - num2;
    } else if ((op2 === '×' || op2 === '÷') && (op1 === '+' || op1 === '-')) {
      const secondResult = op2 === '×' ? num1 * num2 : num1 / num2;
      answer = op1 === '+' ? base + secondResult : base - secondResult;
    } else {
      let result = op1 === '+' ? base + num1 :
                   op1 === '-' ? base - num1 :
                   op1 === '×' ? base * num1 :
                   base / num1;
                   
      answer = op2 === '+' ? result + num2 :
               op2 === '-' ? result - num2 :
               op2 === '×' ? result * num2 :
               result / num2;
    }
    
    return {
      id: id.toString(),
      type: 'mixed',
      category: '混合运算',
      score: score,
      question: question,
      answer: parseFloat(answer.toFixed(2)).toString()
    };
  },

  generateComprehensiveQuestion: function(id, score) {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const decimal = parseFloat((Math.random() * 9 + 1).toFixed(1));
    const percent = Math.floor(Math.random() * 40) + 10;
    
    const question = `(${num1} + ${num2}) × ${decimal} + ${percent}%`;
    const answer = (((num1 + num2) * decimal) * (1 + percent / 100)).toFixed(2);
    
    return {
      id: id.toString(),
      type: 'comprehensive',
      category: '综合运算',
      score: score,
      question: question,
      answer: answer
    };
  },

  // 辅助函数：简化分数
  simplifyFraction: function(fraction) {
    const parts = fraction.split('/');
    if (parts.length === 1) return fraction;
    
    let num = parseInt(parts[0]);
    let den = parseInt(parts[1]);
    
    const gcd = function(a, b) {
      while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
      }
      return a;
    };
    
    const divisor = gcd(Math.abs(num), den);
    
    num = num / divisor;
    den = den / divisor;
    
    if (den === 1) return num.toString();
    return `${num}/${den}`;
  },

  // 辅助函数：数字转中文读法
  numberToChinese: function(num) {
    const chineseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const units = ['', '十', '百'];
    
    if (num < 10) {
      return chineseNumbers[num];
    } else if (num < 100) {
      const ten = Math.floor(num / 10);
      const one = num % 10;
      if (ten === 1) {
        return `十${one === 0 ? '' : chineseNumbers[one]}`;
      } else {
        return `${chineseNumbers[ten]}十${one === 0 ? '' : chineseNumbers[one]}`;
      }
    } else if (num < 1000) {
      const hundred = Math.floor(num / 100);
      const ten = Math.floor((num % 100) / 10);
      const one = num % 10;
      let result = `${chineseNumbers[hundred]}百`;
      if (ten > 0) {
        result += `${chineseNumbers[ten]}十`;
      } else if (ten === 0 && one > 0) {
        result += '零';
      }
      if (one > 0) {
        result += chineseNumbers[one];
      }
      return result;
    }
    return num.toString();
  },

  // 以下函数保持不变
  toggleAnswerInputs: function() {
    this.setData({
      showAnswerInputs: !this.data.showAnswerInputs
    });
  },

  onAnswerInput: function(e) {
    const { id } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    const userAnswers = { ...this.data.userAnswers };
    userAnswers[id] = value;
    
    this.setData({
      userAnswers
    });
  },

  checkAnswers: function() {
    if (this.data.questions.length === 0) {
      wx.showToast({
        title: '请先生成试卷',
        icon: 'none'
      });
      return;
    }
    
    const questions = [...this.data.questions];
    let correctCount = 0;
    let totalScore = 0;
    
    questions.forEach((question, index) => {
      const userAnswer = this.data.userAnswers[question.id] || '';
      const correctAnswer = question.answer;
      
      const isCorrect = this.normalizeAnswer(userAnswer) === this.normalizeAnswer(correctAnswer);
      
      if (isCorrect) {
        correctCount++;
        totalScore += question.score;
      }
      
      questions[index] = {
        ...question,
        userAnswer: userAnswer,
        isCorrect: isCorrect
      };
    });
    
    this.setData({
      questions,
      correctCount,
      score: totalScore,
      showScore: true,
      activeTab: 'answer'
    });
    
    wx.showToast({
      title: `答对${correctCount}题，得分${totalScore}`,
      icon: 'success'
    });
  },

  // 标准化答案
  normalizeAnswer: function(answer) {
    if (!answer) return '';
    return answer.toString().replace(/\s+/g, '').toLowerCase();
  }
});