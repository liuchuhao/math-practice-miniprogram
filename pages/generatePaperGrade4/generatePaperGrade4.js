// pages/generatePaperGrade4/generatePaperGrade4.js
Page({
  data: {
    activeTab: 'config',
    paperTitle: '四年级数学计算练习卷',
    isGenerating: false,
    showAnswerInputs: false,
    showScore: false,
    
    // 题目配置
    questionConfig: [
      { type: 'type1', name: '三位数乘两位数', count: 5, score: 5 },
      { type: 'type2', name: '除法运算', count: 5, score: 5 },
      { type: 'type3', name: '小数加减乘除', count: 5, score: 5 },
      { type: 'type4', name: '分数加减法', count: 5, score: 5 },
      { type: 'type5', name: '四则混合运算', count: 5, score: 6 }
    ],
    
    questions: [],
    userAnswers: {},
    score: 0,
    correctCount: 0,
    totalCount: 0,
    totalScore: 0
  },

  onLoad: function() {
    this.computeTotals();
  },

  // 计算总数
  computeTotals: function() {
    const config = this.data.questionConfig;
    let totalCount = 0;
    let totalScore = 0;
    
    for (const item of config) {
      totalCount += item.count;
      totalScore += item.count * item.score;
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
    const config = this.data.questionConfig;
    const newConfig = config.map(item => {
      if (item.type === type) {
        return { ...item, count: count };
      }
      return item;
    });
    
    this.setData({
      questionConfig: newConfig
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
  const config = this.data.questionConfig;
  let questionId = 1;
  
  console.log('四年级开始生成题目...');
  
  // 生成三位数乘两位数
  for (let i = 0; i < config[0].count; i++) {
    const q = this.generateType1Question(questionId++, config[0].score);
    questions.push(q);
    console.log(`题目${questionId-1}（三位数乘两位数）:`, q);
  }
  
  // 生成除法运算
  for (let i = 0; i < config[1].count; i++) {
    const q = this.generateType2Question(questionId++, config[1].score);
    questions.push(q);
    console.log(`题目${questionId-1}（除法运算）:`, q);
  }
  
  // 生成小数加减乘除
  for (let i = 0; i < config[2].count; i++) {
    const q = this.generateType3Question(questionId++, config[2].score);
    questions.push(q);
    console.log(`题目${questionId-1}（小数加减乘除）:`, q);
  }
  
  // 生成分数加减法
  for (let i = 0; i < config[3].count; i++) {
    const q = this.generateType4Question(questionId++, config[3].score);
    questions.push(q);
    console.log(`题目${questionId-1}（分数加减法）:`, q);
  }
  
  // 生成综合运算
  for (let i = 0; i < config[4].count; i++) {
    const q = this.generateType5Question(questionId++, config[4].score);
    questions.push(q);
    console.log(`题目${questionId-1}（综合运算）:`, q);
  }
  
  console.log('四年级总共生成题目数量:', questions.length);
  console.log('四年级题目数组:', questions);
  
  return questions;
},

  // 生成三位数乘两位数
  generateType1Question: function(id, score) {
    const threeDigit = Math.floor(Math.random() * 900) + 100; // 100-999
    const twoDigit = Math.floor(Math.random() * 90) + 10; // 10-99
    
    // 确保计算不太复杂，避免太大的数
    const question = `${threeDigit} × ${twoDigit} =`;
    const answer = (threeDigit * twoDigit).toString();
    
    return {
      id: id.toString(),
      type: 'type1',
      category: '三位数乘两位数',
      score: score,
      question: question,
      answer: answer
    };
  },

  // 生成除法运算
  generateType2Question: function(id, score) {
    // 生成被除数（三位数以内）
    const dividend = Math.floor(Math.random() * 900) + 100; // 100-999
    // 生成除数（两位数以内，且能被整除）
    let divisor = Math.floor(Math.random() * 89) + 11; // 11-99
    
    // 调整被除数使其能被整除
    const remainder = dividend % divisor;
    const adjustedDividend = dividend - remainder;
    
    // 确保被除数至少是除数两倍，且不为0
    const finalDividend = Math.max(adjustedDividend, divisor * 2);
    
    const question = `${finalDividend} ÷ ${divisor} =`;
    const answer = (finalDividend / divisor).toString();
    
    return {
      id: id.toString(),
      type: 'type2',
      category: '除法运算',
      score: score,
      question: question,
      answer: answer
    };
  },

  // 生成小数加减乘除
  generateType3Question: function(id, score) {
    const operations = ['+', '-', '×', '÷'];
    const operation = operations[Math.floor(Math.random() * 4)];
    
    let question, answer;
    
    if (operation === '×') {
      // 小数乘法：一位小数×整数或两位小数×整数
      const decimal = parseFloat((Math.random() * 9 + 0.1).toFixed(2));
      const integer = Math.floor(Math.random() * 9) + 2; // 2-10
      question = `${decimal} × ${integer} =`;
      answer = (decimal * integer).toFixed(2);
      // 去除末尾的0
      answer = parseFloat(answer).toString();
    } else if (operation === '÷') {
      // 小数除法：小数除以整数，能除尽
      const dividend = parseFloat((Math.random() * 8 + 0.1).toFixed(1));
      let divisor = Math.floor(Math.random() * 8) + 2; // 2-9
      
      // 调整被除数使能整除
      const product = parseFloat((dividend * divisor).toFixed(1));
      question = `${product} ÷ ${divisor} =`;
      answer = dividend.toString();
    } else {
      // 小数加减法
      const decimal1 = parseFloat((Math.random() * 9 + 0.1).toFixed(2));
      const decimal2 = parseFloat((Math.random() * 9 + 0.1).toFixed(2));
      
      if (operation === '+') {
        question = `${decimal1} + ${decimal2} =`;
        answer = (decimal1 + decimal2).toFixed(2);
        answer = parseFloat(answer).toString();
      } else {
        // 确保被减数大于减数
        const maxDecimal = Math.max(decimal1, decimal2);
        const minDecimal = Math.min(decimal1, decimal2);
        question = `${maxDecimal.toFixed(2)} - ${minDecimal.toFixed(2)} =`;
        answer = (maxDecimal - minDecimal).toFixed(2);
        answer = parseFloat(answer).toString();
      }
    }
    
    return {
      id: id.toString(),
      type: 'type3',
      category: '小数加减乘除',
      score: score,
      question: question,
      answer: answer
    };
  },

  // 生成分数加减法（异分母）
generateType4Question: function(id, score) {
  // 生成两个分母
  let denominator1, denominator2;
  let gcd;
  
  // 确保分母不同，且最大公约数不是1，便于找公倍数
  do {
    denominator1 = Math.floor(Math.random() * 8) + 2; // 2-9
    denominator2 = Math.floor(Math.random() * 8) + 2; // 2-9
    
    // 求最大公约数
    const temp1 = denominator1;
    const temp2 = denominator2;
    gcd = this.gcd(temp1, temp2);
  } while (denominator1 === denominator2 || gcd === 1);
  
  // 生成分子
  const numerator1 = Math.floor(Math.random() * (denominator1 - 1)) + 1;
  const numerator2 = Math.floor(Math.random() * (denominator2 - 1)) + 1;
  
  const operator = Math.random() > 0.5 ? '+' : '-';
  
  let question, answer;
  
  // 计算公倍数
  const lcm = (denominator1 * denominator2) / gcd;
  
  if (operator === '+') {
    question = `${numerator1}/${denominator1} + ${numerator2}/${denominator2} =`;
    const newNumerator1 = numerator1 * (lcm / denominator1);
    const newNumerator2 = numerator2 * (lcm / denominator2);
    const sumNumerator = newNumerator1 + newNumerator2;
    answer = this.simplifyFraction(`${sumNumerator}/${lcm}`);
  } else {
    // 确保结果为正数
    const value1 = numerator1 / denominator1;
    const value2 = numerator2 / denominator2;
    
    if (value1 >= value2) {
      question = `${numerator1}/${denominator1} - ${numerator2}/${denominator2} =`;
      const newNumerator1 = numerator1 * (lcm / denominator1);
      const newNumerator2 = numerator2 * (lcm / denominator2);
      const diffNumerator = newNumerator1 - newNumerator2;
      answer = this.simplifyFraction(`${diffNumerator}/${lcm}`);
    } else {
      question = `${numerator2}/${denominator2} - ${numerator1}/${denominator1} =`;
      const newNumerator1 = numerator1 * (lcm / denominator1);
      const newNumerator2 = numerator2 * (lcm / denominator2);
      const diffNumerator = newNumerator2 - newNumerator1;
      answer = this.simplifyFraction(`${diffNumerator}/${lcm}`);
    }
  }
  
  // 为分数显示准备数据
  const displayNum1 = Math.min(numerator1, numerator2);
  const displayNum2 = Math.max(numerator1, numerator2);
  const displayDen1 = denominator1;
  const displayDen2 = denominator2;
  
  return {
    id: id.toString(),
    type: 'fraction',
    category: '分数加减法',
    score: score,
    question: question,
    answer: answer,
    // 为分数显示准备数据
    num1: { numerator: displayNum1, denominator: displayDen1 },
    num2: { numerator: displayNum2, denominator: displayDen2 },
    operator: operator
  };
},

  // 生成综合运算（三步运算）
generateType5Question: function(id, score) {
  const num1 = Math.floor(Math.random() * 20) + 10; // 10-29
  const num2 = Math.floor(Math.random() * 9) + 2; // 2-10
  const num3 = Math.floor(Math.random() * 9) + 2; // 2-10
  
  // 生成两个运算符，确保至少有一个乘除
  const operators = ['+', '-', '×', '÷'];
  const op1 = operators[Math.floor(Math.random() * 4)];
  let op2 = operators[Math.floor(Math.random() * 2)]; // 第二个运算符只取+或-
  
  // 确保至少有一个乘除
  if (op1 !== '×' && op1 !== '÷') {
    op2 = operators[Math.floor(Math.random() * 2) + 2]; // 取×或÷
  }
  
  const question = `${num1} ${op1} ${num2} ${op2} ${num3} =`;
  
  // 计算答案（考虑运算优先级）
  let result = 0;
  
  if ((op1 === '×' || op1 === '÷') && (op2 === '+' || op2 === '-')) {
    // 先算第一个运算
    if (op1 === '×') {
      result = num1 * num2;
    } else {
      result = Math.floor(num1 / num2);
    }
    // 再算第二个运算
    if (op2 === '+') {
      result += num3;
    } else {
      result -= num3;
    }
  } else if ((op2 === '×' || op2 === '÷') && (op1 === '+' || op1 === '-')) {
    // 先算第二个运算
    let secondResult = 0;
    if (op2 === '×') {
      secondResult = num2 * num3;
    } else {
      secondResult = Math.floor(num2 / num3);
    }
    // 再算第一个运算
    if (op1 === '+') {
      result = num1 + secondResult;
    } else {
      result = num1 - secondResult;
    }
  } else {
    // 两个都是加减或都是乘除，从左到右计算
    let firstResult = 0;
    if (op1 === '+') {
      firstResult = num1 + num2;
    } else if (op1 === '-') {
      firstResult = num1 - num2;
    } else if (op1 === '×') {
      firstResult = num1 * num2;
    } else {
      firstResult = Math.floor(num1 / num2);
    }
    
    if (op2 === '+') {
      result = firstResult + num3;
    } else if (op2 === '-') {
      result = firstResult - num3;
    } else if (op2 === '×') {
      result = firstResult * num3;
    } else {
      result = Math.floor(firstResult / num3);
    }
  }
  
  const answer = result.toString();
  
  return {
    id: id.toString(),
    type: 'type5',
    category: '综合运算',
    score: score,
    question: question,
    answer: answer
  };
},

  // 计算表达式（支持加减乘除优先级）
  calculateExpression: function(expression) {
    // 处理乘除运算
    for (let i = 1; i < expression.length; i += 2) {
      if (expression[i] === '×' || expression[i] === '÷') {
        const left = parseFloat(expression[i-1]);
        const right = parseFloat(expression[i+1]);
        let result;
        
        if (expression[i] === '×') {
          result = left * right;
        } else {
          result = left / right;
        }
        
        // 替换这三个元素为结果
        expression.splice(i-1, 3, result);
        i -= 2; // 调整索引
      }
    }
    
    // 处理加减运算
    let result = parseFloat(expression[0]);
    for (let i = 1; i < expression.length; i += 2) {
      const operator = expression[i];
      const operand = parseFloat(expression[i+1]);
      
      if (operator === '+') {
        result += operand;
      } else {
        result -= operand;
      }
    }
    
    return result;
  },

  // 求最大公约数
  gcd: function(a, b) {
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  },

  // 简化分数
  simplifyFraction: function(fraction) {
    if (!fraction.includes('/')) return fraction;
    
    const parts = fraction.split('/');
    let numerator = parseInt(parts[0]);
    let denominator = parseInt(parts[1]);
    
    if (denominator === 0) return '0';
    if (numerator === 0) return '0';
    
    const divisor = this.gcd(Math.abs(numerator), denominator);
    
    numerator = numerator / divisor;
    denominator = denominator / divisor;
    
    if (denominator === 1) return numerator.toString();
    return `${numerator}/${denominator}`;
  },

  // 切换答案输入显示
  toggleAnswerInputs: function() {
    this.setData({
      showAnswerInputs: !this.data.showAnswerInputs
    });
  },

  // 处理答案输入
  onAnswerInput: function(e) {
    const { id } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    const userAnswers = { ...this.data.userAnswers };
    userAnswers[id] = value;
    
    this.setData({
      userAnswers
    });
  },

  // 检查答案
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
      
      // 标准化答案
      const normalizedUserAnswer = this.normalizeAnswer(userAnswer);
      const normalizedCorrectAnswer = this.normalizeAnswer(correctAnswer);
      
      const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
      
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
    
    // 移除空格
    let normalized = answer.toString().replace(/\s+/g, '');
    
    // 将全角符号转换为半角
    normalized = normalized
      .replace(/＞/g, '>')
      .replace(/＜/g, '<')
      .replace(/＝/g, '=')
      .replace(/÷/g, '/')
      .replace(/×/g, '*')
      .toLowerCase();
    
    // 处理小数：去除末尾的0
    if (normalized.includes('.')) {
      normalized = normalized.replace(/\.?0+$/, '');
      if (normalized.endsWith('.')) {
        normalized = normalized.slice(0, -1);
      }
    }
    
    return normalized;
  }
});