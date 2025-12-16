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

  // 生成试卷 - 修复版本
  generatePaper: function() {
    if (this.data.isGenerating) {
      console.log('正在生成中，跳过重复点击');
      return;
    }
    
    console.log('开始生成三年级试卷...');
    this.setData({ isGenerating: true });
    
    // 使用 setTimeout 确保 UI 更新
    setTimeout(() => {
      try {
        console.log('生成试卷开始时间:', new Date().toLocaleTimeString());
        
        // 生成题目
        const questions = this.generateQuestions();
        
        console.log('试卷生成完成，题目数量:', questions.length);
        console.log('生成试卷结束时间:', new Date().toLocaleTimeString());
        
        // 更新数据
        this.setData({
          questions,
          isGenerating: false,
          activeTab: 'preview',
          userAnswers: {},
          showAnswerInputs: false,
          score: 0,
          correctCount: 0,
          showScore: false
        }, () => {
          console.log('页面数据更新完成');
          wx.showToast({
            title: '试卷生成成功',
            icon: 'success',
            duration: 1500
          });
        });
        
      } catch (error) {
        console.error('生成试卷时发生错误:', error);
        console.error('错误堆栈:', error.stack);
        
        this.setData({ 
          isGenerating: false,
          questions: [] // 清空题目，防止显示错误数据
        });
        
        wx.showToast({
          title: '生成失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    }, 300); // 缩短延迟时间
  },

  // 生成题目 - 修复版本
  generateQuestions: function() {
    console.log('开始生成题目...');
    const questions = [];
    const config = this.data.questionConfig;
    let questionId = 1;
    
    try {
      console.log('配置信息:', JSON.stringify(config));
      
      // 生成三位数加减法
      console.log('生成三位数加减法...');
      for (let i = 0; i < config[0].count; i++) {
        const q = this.generateType1Question(questionId++, config[0].score);
        if (q) {
          questions.push(q);
        } else {
          console.error('生成三位数加减法题目失败');
        }
      }
      
      // 生成两位数乘一位数
      console.log('生成两位数乘一位数...');
      for (let i = 0; i < config[1].count; i++) {
        const q = this.generateType2Question(questionId++, config[1].score);
        if (q) {
          questions.push(q);
        } else {
          console.error('生成两位数乘一位数题目失败');
        }
      }
      
      // 生成简单分数计算
      console.log('生成简单分数计算...');
      for (let i = 0; i < config[2].count; i++) {
        const q = this.generateType3Question(questionId++, config[2].score);
        if (q) {
          questions.push(q);
        } else {
          console.error('生成简单分数计算题目失败');
        }
      }
      
      // 生成简单小数加减
      console.log('生成简单小数加减...');
      for (let i = 0; i < config[3].count; i++) {
        const q = this.generateType4Question(questionId++, config[3].score);
        if (q) {
          questions.push(q);
        } else {
          console.error('生成简单小数加减题目失败');
        }
      }
      
      // 生成混合运算 - 特别关注
      console.log('生成混合运算...');
      for (let i = 0; i < config[4].count; i++) {
        const q = this.generateType5Question(questionId++, config[4].score);
        if (q) {
          questions.push(q);
          console.log(`混合运算第${i+1}题生成成功:`, q.question);
        } else {
          console.error(`生成混合运算第${i+1}题失败`);
          // 生成一个简单的替代题目
          const fallbackQuestion = this.generateSimpleMixedQuestion(questionId++, config[4].score);
          questions.push(fallbackQuestion);
        }
      }
      
    } catch (error) {
      console.error('生成题目过程中发生错误:', error);
      console.error('错误堆栈:', error.stack);
      throw error;
    }
    
    console.log('题目生成完成，总数:', questions.length);
    return questions;
  },

  // 生成三位数加减法
  generateType1Question: function(id, score) {
    try {
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
    } catch (error) {
      console.error('生成三位数加减法题目时出错:', error);
      return null;
    }
  },

  // 生成两位数乘一位数
  generateType2Question: function(id, score) {
    try {
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
    } catch (error) {
      console.error('生成两位数乘一位数题目时出错:', error);
      return null;
    }
  },

  // 生成简单分数计算
  generateType3Question: function(id, score) {
    try {
      // 生成分母（至少为3，避免分子只有1个选择）
      const denominator = Math.floor(Math.random() * 6) + 3; // 3-8
      
      // 生成两个不同的分子
      const numerator1 = Math.floor(Math.random() * (denominator - 1)) + 1;
      let numerator2;
      do {
        numerator2 = Math.floor(Math.random() * (denominator - 1)) + 1;
      } while (numerator2 === numerator1);
      
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
      
      return {
        id: id.toString(),
        type: 'fraction',
        category: '简单分数计算',
        score: score,
        num1: { numerator: displayNum1, denominator: denominator },
        num2: { numerator: displayNum2, denominator: denominator },
        operator: operator,
        question: question,
        answer: answer
      };
    } catch (error) {
      console.error('生成简单分数计算题目时出错:', error);
      return null;
    }
  },

  // 生成简单小数加减
  generateType4Question: function(id, score) {
    try {
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
    } catch (error) {
      console.error('生成简单小数加减题目时出错:', error);
      return null;
    }
  },

  // 生成混合运算 - 安全版本
  generateType5Question: function(id, score) {
    try {
      // 限制尝试次数，避免无限循环
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        attempts++;
        
        // 生成数字
        const num1 = Math.floor(Math.random() * 30) + 10; // 10-39
        const num2 = Math.floor(Math.random() * 8) + 2; // 2-9
        const num3 = Math.floor(Math.random() * 8) + 2; // 2-9
        
        // 简化运算符选择：只使用安全的组合
        const safeCombinations = [
          { op1: '+', op2: '×' },
          { op1: '+', op2: '÷' },
          { op1: '-', op2: '×' },
          { op1: '-', op2: '÷' },
          { op1: '×', op2: '+' },
          { op1: '×', op2: '-' },
          { op1: '÷', op2: '+' },
          { op1: '÷', op2: '-' }
        ];
        
        const combo = safeCombinations[Math.floor(Math.random() * safeCombinations.length)];
        const op1 = combo.op1;
        const op2 = combo.op2;
        
        let question, answer;
        
        // 处理除法，确保能整除且除数不为0
        if (op1 === '÷') {
          // 确保能整除且除数不为0
          if (num2 === 0) continue;
          const adjustedNum1 = num1 * num2; // 确保能整除
          question = `${adjustedNum1} ÷ ${num2} ${op2} ${num3} =`;
          
          // 计算结果
          const firstResult = adjustedNum1 / num2;
          if (op2 === '+') {
            answer = (firstResult + num3).toString();
          } else {
            answer = (firstResult - num3).toString();
          }
          
          return {
            id: id.toString(),
            type: 'type5',
            category: '混合运算',
            score: score,
            question: question,
            answer: answer
          };
          
        } else if (op2 === '÷') {
          // 确保能整除且除数不为0
          if (num3 === 0) continue;
          const adjustedNum3 = num2 * num3; // 确保能整除
          question = `${num1} ${op1} ${num2} ÷ ${adjustedNum3} =`;
          
          // 计算结果
          const secondResult = num2 / adjustedNum3;
          if (op1 === '+') {
            answer = (num1 + secondResult).toString();
          } else {
            answer = (num1 - secondResult).toString();
          }
          
          return {
            id: id.toString(),
            type: 'type5',
            category: '混合运算',
            score: score,
            question: question,
            answer: answer
          };
          
        } else if (op1 === '×' && (op2 === '+' || op2 === '-')) {
          question = `${num1} × ${num2} ${op2} ${num3} =`;
          const firstResult = num1 * num2;
          if (op2 === '+') {
            answer = (firstResult + num3).toString();
          } else {
            answer = (firstResult - num3).toString();
          }
          
          return {
            id: id.toString(),
            type: 'type5',
            category: '混合运算',
            score: score,
            question: question,
            answer: answer
          };
          
        } else if ((op1 === '+' || op1 === '-') && op2 === '×') {
          question = `${num1} ${op1} ${num2} × ${num3} =`;
          const secondResult = num2 * num3;
          if (op1 === '+') {
            answer = (num1 + secondResult).toString();
          } else {
            answer = (num1 - secondResult).toString();
          }
          
          return {
            id: id.toString(),
            type: 'type5',
            category: '混合运算',
            score: score,
            question: question,
            answer: answer
          };
        }
      }
      
      // 如果多次尝试都失败，返回一个简单的替代题目
      console.warn(`混合运算生成失败，使用替代题目，尝试次数: ${attempts}`);
      return this.generateSimpleMixedQuestion(id, score);
      
    } catch (error) {
      console.error('生成混合运算题目时出错:', error);
      return this.generateSimpleMixedQuestion(id, score);
    }
  },

  // 简单的混合运算替代题目
  generateSimpleMixedQuestion: function(id, score) {
    const num1 = Math.floor(Math.random() * 20) + 10;
    const num2 = Math.floor(Math.random() * 8) + 2;
    const num3 = Math.floor(Math.random() * 8) + 2;
    
    // 简单的加法乘法组合
    const question = `${num1} + ${num2} × ${num3} =`;
    const answer = (num1 + (num2 * num3)).toString();
    
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
    try {
      const parts = fraction.split('/');
      if (parts.length === 1) return fraction;
      
      let numerator = parseInt(parts[0]);
      let denominator = parseInt(parts[1]);
      
      if (denominator === 0) return '0';
      if (numerator === 0) return '0';
      
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
    } catch (error) {
      console.error('简化分数时出错:', error);
      return fraction;
    }
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