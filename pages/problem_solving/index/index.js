const bank = require('../../../utils/problemBank.js');

Page({
  data: {
    grade: 1,
    mode: 'normal', // 'normal' or 'endless'
    
    problemList: [],
    currentIndex: 0,
    currentProblem: {},
    userAnswer: '',
    
    correctCount: 0,
    isFinished: false,
    
    scorePerQ: 0 // 每题得分
  },

  onLoad(options) {
    const grade = parseInt(options.grade) || 1;
    const mode = options.mode || 'normal';
    
    // 计算单题积分: 1年级30, 2年级40... (基数20 + 年级*10)
    const scorePerQ = 50 + grade * 10;

    this.setData({ grade, mode, scorePerQ });
    this.initGame();
  },

  initGame() {
    const grade = this.data.grade;
    let list = [...(bank[grade] || [])];
    
    if (list.length === 0) {
      wx.showToast({ title: '题库暂无', icon: 'none' });
      return;
    }

    // 随机打乱题目 (Fisher-Yates)
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }

    // 如果是普通模式，只取前5题
    if (this.data.mode === 'normal') {
      list = list.slice(0, 5);
    }

    this.setData({
      problemList: list,
      currentIndex: 0,
      currentProblem: list[0],
      userAnswer: '',
      correctCount: 0,
      isFinished: false
    });
  },

  onInput(e) {
    this.setData({ userAnswer: e.detail.value });
  },

  submitAnswer() {
    if (!this.data.userAnswer) return;
    
    const userVal = parseFloat(this.data.userAnswer);
    const correctVal = this.data.currentProblem.answer;
    const isCorrect = Math.abs(userVal - correctVal) < 0.01; // 浮点容错

    if (isCorrect) {
      wx.showToast({ title: '正确！', icon: 'success' });
      this.setData({ correctCount: this.data.correctCount + 1 });
      setTimeout(() => this.nextQuestion(), 800);
    } else {
      // 答错处理
      if (this.data.mode === 'endless') {
        // 无尽模式：答错直接结束
        wx.showModal({
          title: '挑战结束',
          content: `正确答案是 ${correctVal}。\n很遗憾，止步于第 ${this.data.currentIndex + 1} 题。`,
          showCancel: false,
          confirmText: '看成绩',
          success: () => this.finishGame()
        });
      } else {
        // 普通模式：提示错误，进入下一题
        wx.showToast({ title: '错误', icon: 'error' });
        setTimeout(() => this.nextQuestion(), 1000);
      }
    }
  },

  nextQuestion() {
    const nextIdx = this.data.currentIndex + 1;
    
    // 检查是否结束
    if (nextIdx >= this.data.problemList.length) {
      this.finishGame();
    } else {
      this.setData({
        currentIndex: nextIdx,
        currentProblem: this.data.problemList[nextIdx],
        userAnswer: ''
      });
    }
  },

  // 结算
  finishGame() {
    this.setData({ isFinished: true });
    
    const totalScore = this.data.correctCount * this.data.scorePerQ;
    
    // 1. 保存总积分
    if (totalScore > 0) {
      const oldTotal = wx.getStorageSync('totalIntegral') || 0;
      wx.setStorageSync('totalIntegral', oldTotal + totalScore);
    }

    // 2. 保存练习记录 (用于排行榜/档案)
    // 结构：{ total: 100, correct: 80 }
    const statsKey = 'stats_problem_solving';
    let stats = wx.getStorageSync(statsKey) || { total: 0, correct: 0 };
    stats.total += (this.data.currentIndex + 1); // 答过的题数
    stats.correct += this.data.correctCount;
    wx.setStorageSync(statsKey, stats);
  },

  restart() {
    wx.navigateBack(); // 返回菜单重选
  }
});