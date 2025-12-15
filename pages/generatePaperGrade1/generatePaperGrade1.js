// pages/generatePaperGrade1/generatePaperGrade1.js
Page({
  data: {
    activeTab: 'config',
    paperTitle: '一年级数学计算练习卷',
    isGenerating: false,
    showAnswerInputs: false,
    showScore: false,
    
    // 题目配置
    questionConfig: [
      { type: 'type1', name: '10以内加减法', count: 5, score: 5 },
      { type: 'type2', name: '20以内不进位加法', count: 5, score: 5 },
      { type: 'type3', name: '20以内不退位减法', count: 5, score: 5 },
      { type: 'type4', name: '认识数字', count: 5, score: 5 },
      { type: 'type5', name: '简单比较', count: 5, score: 5 }
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
    
    // 生成10以内加减法
    for (let i = 0; i < config[0].count; i++) {
      questions.push(this.generateType1Question(questionId++, config[0].score));
    }
    
    // 生成20以内不进位加法
    for (let i = 0; i < config[1].count; i++) {
      questions.push(this.generateType2Question(questionId++, config[1].score));
    }
    
    // 生成20以内不退位减法
    for (let i = 0; i < config[2].count; i++) {
      questions.push(this.generateType3Question(questionId++, config[2].score));
    }
    
    // 生成认识数字
    for (let i = 0; i < config[3].count; i++) {
      questions.push(this.generateType4Question(questionId++, config[3].score));
    }
    
    // 生成简单比较
    for (let i = 0; i < config[4].count; i++) {
      questions.push(this.generateType5Question(questionId++, config[4].score));
    }
    
    return questions;
  },

  // 生成10以内加减法
  generateType1Question: function(id, score) {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * (10 - num1));
    const operator = Math.random() > 0.5 ? '+' : '-';
    
    let question, answer;
    
    if (operator === '+') {
      question = `${num1} + ${num2} =`;
      answer = (num1 + num2).toString();
    } else {
      question = `${num1} - ${num2} =`;
      answer = (num1 - num2).toString();
    }
    
    return {
      id: id.toString(),
      type: 'type1',
      category: '10以内加减法',
      score: score,
      question: question,
      answer: answer
    };
  },

  // 生成20以内不进位加法
  generateType2Question: function(id, score) {
    const num1 = Math.floor(Math.random() * 10) + 10;
    const num2 = Math.floor(Math.random() * (20 - num1));
    
    const question = `${num1} + ${num2} =`;
    const answer = (num1 + num2).toString();
    
    return {
      id: id.toString(),
      type: 'type2',
      category: '20以内不进位加法',
      score: score,
      question: question,
      answer: answer
    };
  },

  // 生成20以内不退位减法
  generateType3Question: function(id, score) {
    const num1 = Math.floor(Math.random() * 10) + 10;
    const num2 = Math.floor(Math.random() * num1);
    
    const question = `${num1} - ${num2} =`;
    const answer = (num1 - num2).toString();
    
    return {
      id: id.toString(),
      type: 'type3',
      category: '20以内不退位减法',
      score: score,
      question: question,
      answer: answer
    };
  },

  // 生成认识数字
  generateType4Question: function(id, score) {
    const number = Math.floor(Math.random() * 100);
    
    const question = `写出数字 ${number} 的读法`;
    const answer = this.numberToChinese(number);
    
    return {
      id: id.toString(),
      type: 'type4',
      category: '认识数字',
      score: score,
      question: question,
      answer: answer
    };
  },

  // 生成简单比较
  generateType5Question: function(id, score) {
    const num1 = Math.floor(Math.random() * 20);
    const num2 = Math.floor(Math.random() * 20);
    
    const question = `比较大小：${num1} ○ ${num2}`;
    let answer;
    
    if (num1 > num2) {
      answer = '＞';
    } else if (num1 < num2) {
      answer = '＜';
    } else {
      answer = '＝';
    }
    
    return {
      id: id.toString(),
      type: 'type5',
      category: '简单比较',
      score: score,
      question: question,
      answer: answer
    };
  },

  // 数字转中文读法
  numberToChinese: function(num) {
    const chineseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    
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
    }
    return num.toString();
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
      
      // 对于比较符号，允许使用 > < = 或者 ＞ ＜ ＝
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
      .toLowerCase();
    
    return normalized;
  }
});