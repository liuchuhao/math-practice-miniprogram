// pages/generatePaperGrade3/generatePaperGrade3.js
Page({
  data: {
    activeTab: 'config',
    paperTitle: '三年级数学计算练习卷',
    isGenerating: false,
    showAnswerInputs: false,
    showScore: false,
    
    // 题目配置
    questionConfig: [
      { type: 'type1', name: '三位数加减法', count: 5, score: 5 },
      { type: 'type2', name: '两位数乘一位数', count: 5, score: 5 },
      { type: 'type3', name: '简单分数计算', count: 5, score: 5 },
      { type: 'type4', name: '简单小数加减', count: 5, score: 5 },
      { type: 'type5', name: '混合运算', count: 5, score: 6 }
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
  
  console.log('开始生成三年级试卷...');
  
  setTimeout(() => {
    try {
      const questions = this.generateQuestions();
      
      console.log('试卷生成完成，题目数量:', questions.length);
      console.log('题目数据:', questions);
      
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
    } catch (error) {
      console.error('生成试卷时出错:', error);
      this.setData({ isGenerating: false });
      
      wx.showToast({
        title: '生成失败，请重试',
        icon: 'none'
      });
    }
  }, 800);
},

  // 生成题目
generateQuestions: function() {
  const questions = [];
  const config = this.data.questionConfig;
  let questionId = 1;
  
  console.log('三年级开始生成题目，配置:', config);
  
  try {
    // 生成三位数加减法
    for (let i = 0; i < config[0].count; i++) {
      const q = this.generateType1Question(questionId++, config[0].score);
      questions.push(q);
      console.log(`生成三位数加减法第${i+1}题:`, q);
    }
    
    // 生成两位数乘一位数
    for (let i = 0; i < config[1].count; i++) {
      const q = this.generateType2Question(questionId++, config[1].score);
      questions.push(q);
      console.log(`生成两位数乘一位数第${i+1}题:`, q);
    }
    
    // 生成简单分数计算
    for (let i = 0; i < config[2].count; i++) {
      const q = this.generateType3Question(questionId++, config[2].score);
      questions.push(q);
      console.log(`生成简单分数计算第${i+1}题:`, q);
    }
    
    // 生成简单小数加减
    for (let i = 0; i < config[3].count; i++) {
      const q = this.generateType4Question(questionId++, config[3].score);
      questions.push(q);
      console.log(`生成简单小数加减第${i+1}题:`, q);
    }
    
    // 生成混合运算
    for (let i = 0; i < config[4].count; i++) {
      const q = this.generateType5Question(questionId++, config[4].score);
      questions.push(q);
      console.log(`生成混合运算第${i+1}题:`, q);
    }
  } catch (error) {
    console.error('生成题目过程中出错:', error);
    throw error; // 重新抛出错误
  }
  
  console.log('三年级总共生成题目数量:', questions.length);
  return questions;
},

  // 生成三位数加减法
  generateType1Question: function(id, score) {
    const num1 = Math.floor(Math.random() * 900) + 100;
    const num2 = Math.floor(Math.random() * 900) + 100;
    const operator = Math.random() > 0.5 ? '+' : '-';
    
    let question, answer;
    
    if (operator === '+') {
      question = `${num1} + ${num2} =`;
      answer = (num1 + num2).toString();
    } else {
      // 确保被减数大于减数
      const maxNum = Math.max(num1, num2);
      const minNum = Math.min(num1, num2);
      question = `${maxNum} - ${minNum} =`;
      answer = (maxNum - minNum).toString();
    }
    
    return {
      id: id.toString(),
      type: 'type1',
      category: '三位数加减法',
      score: score,
      question: question,
      answer: answer
    };
  },

  // 生成两位数乘一位数
  generateType2Question: function(id, score) {
    const twoDigit = Math.floor(Math.random() * 90) + 10;
    const oneDigit = Math.floor(Math.random() * 9) + 1;
    
    const question = `${twoDigit} × ${oneDigit} =`;
    const answer = (twoDigit * oneDigit).toString();
    
    return {
      id: id.toString(),
      type: 'type2',
      category: '两位数乘一位数',
      score: score,
      question: question,
      answer: answer
    };
  },

  // 生成简单分数计算（同分母或分母为倍数关系）
  generateType3Question: function(id, score) {
    // 生成分母
    const denominator = Math.floor(Math.random() * 8) + 2;
    
    // 生成两个分子
    const numerator1 = Math.floor(Math.random() * (denominator - 1)) + 1;
    let numerator2 = Math.floor(Math.random() * (denominator - 1)) + 1;
    
    // 确保两个分子不同
    while (numerator2 === numerator1) {
      numerator2 = Math.floor(Math.random() * (denominator - 1)) + 1;
    }
    
    const operator = Math.random() > 0.5 ? '+' : '-';
    
    let question = '';
    let answer = '';
    
    if (operator === '+') {
      question = `${numerator1}/${denominator} + ${numerator2}/${denominator} =`;
      const sumNumerator = numerator1 + numerator2;
      answer = this.simplifyFraction(`${sumNumerator}/${denominator}`);
    } else {
      // 确保被减数大于减数
      const maxNum = Math.max(numerator1, numerator2);
      const minNum = Math.min(numerator1, numerator2);
      question = `${maxNum}/${denominator} - ${minNum}/${denominator} =`;
      const diffNumerator = maxNum - minNum;
      answer = this.simplifyFraction(`${diffNumerator}/${denominator}`);
    }
    
    // 为分数显示准备数据
    const displayNum1 = Math.min(numerator1, numerator2);
    const displayNum2 = Math.max(numerator1, numerator2);
    const displayOperator = operator;
    
    return {
      id: id.toString(),
      type: 'fraction',
      category: '简单分数计算',
      score: score,
      num1: { numerator: displayNum1, denominator: denominator },
      num2: { numerator: displayNum2, denominator: denominator },
      operator: displayOperator,
      question: question,
      answer: answer
    };
  },

  // 生成简单小数加减
  generateType4Question: function(id, score) {
    const decimal1 = parseFloat((Math.random() * 9 + 1).toFixed(1));
    const decimal2 = parseFloat((Math.random() * 9 + 1).toFixed(1));
    const operator = Math.random() > 0.5 ? '+' : '-';
    
    let question, answer;
    
    if (operator === '+') {
      question = `${decimal1} + ${decimal2} =`;
      answer = (decimal1 + decimal2).toFixed(1);
    } else {
      // 确保被减数大于减数
      const maxDecimal = Math.max(decimal1, decimal2);
      const minDecimal = Math.min(decimal1, decimal2);
      question = `${maxDecimal} - ${minDecimal} =`;
      answer = (maxDecimal - minDecimal).toFixed(1);
    }
    
    return {
      id: id.toString(),
      type: 'type4',
      category: '简单小数加减',
      score: score,
      question: question,
      answer: answer
    };
  },

  // 生成混合运算（简单的乘除与加减混合）
generateType5Question: function(id, score) {
  const num1 = Math.floor(Math.random() * 50) + 10; // 10-59
  const num2 = Math.floor(Math.random() * 10) + 2; // 2-11
  const num3 = Math.floor(Math.random() * 10) + 2; // 2-11
  
  // 生成两种运算，确保至少有一个乘除
  const operators = ['+', '-', '×', '÷'];
  let op1, op2;
  
  // 随机选择第一个运算符
  op1 = operators[Math.floor(Math.random() * 4)];
  
  // 如果第一个运算符是加减，第二个必须是乘除
  if (op1 === '+' || op1 === '-') {
    op2 = operators[Math.floor(Math.random() * 2) + 2]; // 取×或÷
  } else {
    // 如果第一个运算符是乘除，第二个可以是加减或乘除
    op2 = operators[Math.floor(Math.random() * 4)];
  }
  
  // 确保除法的被除数能被整除
  if (op1 === '÷') {
    // 调整num1使能被num2整除
    const product = num1 * num2;
    const adjustedNum1 = product;
    const question = `${adjustedNum1} ÷ ${num2} ${op2} ${num3} =`;
    
    // 计算答案（考虑运算优先级）
    let result = 0;
    
    if (op2 === '+' || op2 === '-') {
      // 先算除法
      result = adjustedNum1 / num2;
      // 再算加减
      if (op2 === '+') {
        result += num3;
      } else {
        result -= num3;
      }
    } else if (op2 === '×') {
      // 从左到右计算
      result = (adjustedNum1 / num2) * num3;
    } else {
      // 从左到右计算除法
      const firstResult = adjustedNum1 / num2;
      // 确保能整除
      const product2 = firstResult * num3;
      result = firstResult / num3;
    }
    
    const answer = Math.floor(result).toString();
    
    return {
      id: id.toString(),
      type: 'type5',
      category: '混合运算',
      score: score,
      question: question,
      answer: answer
    };
  }
  
  // 如果第二个运算符是除法，需要调整num3使能被整除
  if (op2 === '÷') {
    // 先计算第一个运算的结果
    let firstResult;
    if (op1 === '+') {
      firstResult = num1 + num2;
    } else if (op1 === '-') {
      firstResult = num1 - num2;
    } else if (op1 === '×') {
      firstResult = num1 * num2;
    } else {
      // 调整使能整除
      const product = num1 * num2;
      firstResult = product / num2;
    }
    
    // 调整num3使能被整除
    const adjustedNum3 = firstResult * (Math.floor(Math.random() * 3) + 1); // 1-3倍
    const question = `${num1} ${op1} ${num2} ÷ ${adjustedNum3} =`;
    
    let result;
    if (op1 === '+' || op1 === '-') {
      // 先算除法
      const secondResult = num2 / adjustedNum3;
      if (op1 === '+') {
        result = num1 + secondResult;
      } else {
        result = num1 - secondResult;
      }
    } else {
      // 从左到右计算
      result = (num1 * num2) / adjustedNum3;
    }
    
    const answer = Math.floor(result).toString();
    
    return {
      id: id.toString(),
      type: 'type5',
      category: '混合运算',
      score: score,
      question: question,
      answer: answer
    };
  }
  
  // 普通情况：没有除法或除法已处理
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
  
  const answer = Math.floor(result).toString();
  
  return {
    id: id.toString(),
    type: 'type5',
    category: '混合运算',
    score: score,
    question: question,
    answer: answer
  };
},

  // 简化分数
  simplifyFraction: function(fraction) {
    const parts = fraction.split('/');
    if (parts.length === 1) return fraction;
    
    let numerator = parseInt(parts[0]);
    let denominator = parseInt(parts[1]);
    
    // 求最大公约数
    const gcd = function(a, b) {
      while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
      }
      return a;
    };
    
    const divisor = gcd(Math.abs(numerator), denominator);
    
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
    
    return normalized;
  }
});