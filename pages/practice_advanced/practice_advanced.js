const Generator = require('../../utils/advancedGenerator.js');

Page({
  data: {
    // 基础信息
    grade: 1,
    gradeName: '',
    
    // 题目状态
    currentQuestion: 1,
    totalQuestions: 10,
    progressPercent: 0,
    
    // 题目内容
    question: '',       // 例如 "15 + ( ) = 20"
    answer: '',         // 正确答案
    inputType: 'number',// 控制显示键盘还是选项按钮
    options: [],        // 符号选项 ['>', '<', '='] 等
    userAnswer: '',     // 用户当前的输入
    
    // 统计
    score: 0,
    correctCount: 0,
    wrongCount: 0,
    
    // 计时
    startTime: 0,
    elapsedTime: 0,
    formattedTime: '00:00',
    timer: null,
    
    // 交互锁 (防止连点)
    isSubmitting: false
  },

  onLoad: function (options) {
    const grade = parseInt(options.grade) || 1;
    // 初始化你的生成器
    this.generator = new Generator(grade);
    
    this.setData({ 
      grade,
      gradeName: `拓展${grade}年级`,
      startTime: Date.now()
    });
    
    this.startTimer();
    this.nextQ();
  },

  onUnload: function () {
    this.stopTimer();
  },

  // --- 计时器逻辑 ---
  startTimer: function() {
    this.stopTimer();
    this.timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.data.startTime) / 1000);
      const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const s = (elapsed % 60).toString().padStart(2, '0');
      this.setData({ elapsedTime: elapsed, formattedTime: `${m}:${s}` });
    }, 1000);
  },

  stopTimer: function() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  },

  // --- 生成下一题 ---
  nextQ: function() {
    if (this.data.currentQuestion > this.data.totalQuestions) {
      this.finish();
      return;
    }
    
    // 调用你的生成器
    const q = this.generator.generate();
    
    this.setData({
      question: q.question,
      answer: q.answer,
      inputType: q.inputType, // 'number', 'symbol', 或 'compare'
      options: q.options || [],
      userAnswer: '',
      isSubmitting: false, // 解锁
      progressPercent: Math.round(((this.data.currentQuestion - 1) / this.data.totalQuestions) * 100)
    });
  },

  // --- 交互：数字键盘 (inputType === 'number') ---
  onKeyTap(e) {
    if (this.data.isSubmitting) return;
    const key = e.currentTarget.dataset.key;
    const current = this.data.userAnswer;
    
    if (current.length < 5) {
      this.setData({ userAnswer: current + key });
    }
  },

  onDelete() {
    if (this.data.isSubmitting) return;
    const current = this.data.userAnswer;
    if (current.length > 0) {
      this.setData({ userAnswer: current.slice(0, -1) });
    }
  },
  
  // --- 交互：符号选择 (inputType !== 'number') ---
  onOptionSelect(e) {
    if (this.data.isSubmitting) return;
    const val = e.currentTarget.dataset.val;
    
    this.setData({ userAnswer: val });
    
    // 符号题选中后，延迟200ms自动提交，体验更好
    setTimeout(() => {
      this.submitAnswer();
    }, 200);
  },

  // --- 提交判分 ---
  submitAnswer() {
    if (!this.data.userAnswer || this.data.isSubmitting) return;
    this.setData({ isSubmitting: true }); // 上锁

    const { userAnswer, answer, inputType } = this.data;
    let isCorrect = false;

    // 判分逻辑
    if (inputType === 'number') {
      // 数字题：转成数值比较，避免 "05" != "5" 的问题
      isCorrect = parseFloat(userAnswer) === parseFloat(answer);
    } else {
      // 符号题：字符串直接比较
      isCorrect = userAnswer === answer.toString();
    }

    if (isCorrect) {
      // 答对
      this.setData({
        score: this.data.score + 20,
        correctCount: this.data.correctCount + 1
      });
      wx.showToast({ title: '正确', icon: 'success', duration: 600 });
    } else {
      // 答错
      this.setData({ wrongCount: this.data.wrongCount + 1 });
      wx.vibrateShort({ type: 'medium' }); // 震动反馈
      wx.showToast({ title: '错误', icon: 'error', duration: 800 });
      
      this.saveToMistakeBook();
    }

    // 自动跳下一题
    setTimeout(() => {
      this.setData({ currentQuestion: this.data.currentQuestion + 1 });
      this.nextQ();
    }, 1000);
  },

  // --- 结算与上传 ---
  finish() {
    this.stopTimer();
    const { score, grade, correctCount, wrongCount, formattedTime } = this.data;
    
    // 拓展题双倍积分规则：年级 * 40
    const earnedPoints = score > 0 ? (grade * 40) : 0;
    
    // 1. 更新本地总积分
    if (earnedPoints > 0) {
      const currentTotal = wx.getStorageSync('totalIntegral') || 0;
      wx.setStorageSync('totalIntegral', currentTotal + earnedPoints);
    }

    // 2. 准备跳转参数
    const totalAns = correctCount + wrongCount;
    const rate = totalAns > 0 ? Math.round((correctCount / totalAns) * 100) : 0;
    
    const jumpToResult = () => {
      wx.redirectTo({
        url: `/pages/result/result?score=${score}&correct=${correctCount}&wrong=${wrongCount}&time=${formattedTime}&correctRate=${rate}&earnedPoints=${earnedPoints}&gradeName=拓展${grade}年级&type=advanced&grade=${grade}`
      });
    };

    // 3. 尝试上传云端 (如果有登录)
    if (score > 0) {
      wx.showLoading({ title: '保存中...' });
      this.uploadScore(score, this.data.elapsedTime, grade, jumpToResult);
    } else {
      jumpToResult();
    }
  },

  // 简化的上传逻辑
  uploadScore(score, time, grade, callback) {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) { callback && callback(); return; }

    let openid = wx.getStorageSync('openid');
    // 实际项目中 OpenID 应由后端获取
    if(!openid) openid = 'local_' + Date.now();

    wx.request({
      url: 'https://lch97.cn/math_api/submit_score.php',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        openid: openid,
        nickname: userInfo.nickName,
        avatar: userInfo.avatarUrl,
        grade: grade,
        score: score,
        time_used: time,
        type: 'advanced'
      },
      complete: () => {
        wx.hideLoading();
        if (callback) callback();
      }
    });
  },

  saveToMistakeBook() {
    // 简单的错题保存
    try {
      let list = wx.getStorageSync('mistakeList') || [];
      list.unshift({
        question: this.data.question,
        correctAnswer: this.data.answer,
        userAnswer: this.data.userAnswer,
        gradeName: this.data.gradeName,
        date: new Date().toLocaleDateString(),
        timestamp: Date.now()
      });
      if (list.length > 50) list = list.slice(0, 50);
      wx.setStorageSync('mistakeList', list);
    } catch(e) {}
  }
});