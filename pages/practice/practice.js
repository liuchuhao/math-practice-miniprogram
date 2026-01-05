const QuestionGenerator = require('../../utils/questionGenerator.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 年级信息
    grade: 1,
    gradeName: '一年级',

    // 题目相关
    currentQuestion: 1,
    totalQuestions: 10,
    question: '',
    correctAnswer: 0,
    userAnswer: '',
    difficulty: '简单',

    // 得分相关
    score: 0,
    correctCount: 0,
    wrongCount: 0,
    correctRate: 0,

    // 计时相关
    startTime: 0,
    elapsedTime: 0,
    timer: null,
    formattedTime: '00:00',

    // 历史记录
    history: [],

    // UI控制
    autoFocus: true,
    showKeypad: false,
    progressPercent: 0,

    // 题目生成器
    questionGenerator: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('练习页面加载，参数:', options)

    const grade = parseInt(options.grade) || 1
    const gradeName = options.gradeName || '一年级'

    // 初始化题目生成器
    const generator = new QuestionGenerator(grade)

    this.setData({
      grade: grade,
      gradeName: gradeName,
      questionGenerator: generator,
      startTime: Date.now(),
      progressPercent: 0
    })

    // 开始计时
    this.startTimer()

    // 生成第一道题目
    this.generateNewQuestion()
  },

  /**
   * 开始计时器
   */
  startTimer: function () {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.data.startTime) / 1000)
      const minutes = Math.floor(elapsed / 60)
      const seconds = elapsed % 60

      this.setData({
        elapsedTime: elapsed,
        formattedTime: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      })
    }, 1000)

    this.setData({
      timer
    })
  },

  /**
   * 使用题目生成器生成题目
   */
  generateNewQuestion: function () {
    const generator = this.data.questionGenerator
    if (!generator) return

    const questionData = generator.generate()

    // 根据题目类型设置难度显示
    let difficulty = '简单'
    const grade = this.data.grade

    if (grade >= 4) {
      if (questionData.type === 'mixed' || questionData.type === 'decimal') {
        difficulty = '困难'
      } else if (questionData.type === 'multiplication' || questionData.type === 'division') {
        difficulty = '中等'
      }
    } else if (grade === 3) {
      if (questionData.type === 'multiplication') {
        difficulty = '中等'
      }
    }

    this.setData({
      question: questionData.question,
      correctAnswer: questionData.answer,
      userAnswer: '',
      autoFocus: true,
      difficulty: difficulty,
      progressPercent: Math.round((this.data.currentQuestion / this.data.totalQuestions) * 100)
    })
  },

  /**
   * 输入交互函数
   */
  onInput: function (e) {
    this.setData({ userAnswer: e.detail.value })
  },

  onKeyTap: function (e) {
    const key = e.currentTarget.dataset.key
    this.setData({ userAnswer: this.data.userAnswer + key })
  },

  onDelete: function () {
    const currentAnswer = this.data.userAnswer
    if (currentAnswer.length > 0) {
      this.setData({ userAnswer: currentAnswer.slice(0, -1) })
    }
  },

  toggleKeypad: function () {
    this.setData({ showKeypad: !this.data.showKeypad })
  },

  clearInput: function () {
    this.setData({ userAnswer: '' })
  },

  /**
   * 【核心】提交答案
   */
  submitAnswer: function () {
    const userAnswerStr = this.data.userAnswer.trim()
    const correctAnswer = this.data.correctAnswer

    if (userAnswerStr === '') {
      wx.showToast({ title: '请输入答案', icon: 'none' })
      return
    }

    const userAnswer = parseFloat(userAnswerStr)
    if (isNaN(userAnswer)) {
      wx.showToast({ title: '请输入数字', icon: 'none' })
      return
    }

    // 判题逻辑
    const tolerance = 0.001
    let isCorrect = Math.abs(userAnswer - correctAnswer) < tolerance
    if (!isCorrect) {
      // 字符串兜底匹配
      const userStr = userAnswer.toString().replace(/\.0+$/, '').replace(/(\..*?)0+$/, '$1')
      const correctStr = correctAnswer.toString().replace(/\.0+$/, '').replace(/(\..*?)0+$/, '$1')
      isCorrect = userStr === correctStr
    }

    // 本次练习的临时历史
    const historyItem = {
      question: this.data.question,
      userAnswer: userAnswerStr,
      correctAnswer: correctAnswer,
      isCorrect: isCorrect,
      time: this.data.formattedTime
    }

    let newHistory = [historyItem, ...this.data.history]
    if (newHistory.length > 5) newHistory = newHistory.slice(0, 5)

    // 更新分数
    let newScore = this.data.score
    let newCorrectCount = this.data.correctCount
    let newWrongCount = this.data.wrongCount

    if (isCorrect) {
      newScore += 10
      newCorrectCount += 1
      wx.showToast({ title: '✅ 正确！', icon: 'success', duration: 1000 })
    } else {
      newWrongCount += 1
      
      // >>>>>> 错题本功能：答错自动保存 <<<<<<
      this.saveToMistakeBook(this.data.question, correctAnswer, userAnswerStr);

      wx.showModal({
        title: '答案不正确',
        content: `你的答案：${userAnswerStr}\n正确答案：${correctAnswer}`,
        showCancel: false,
        confirmText: '知道了',
        confirmColor: '#e74c3c'
      })
    }

    const totalAnswered = newCorrectCount + newWrongCount
    const newCorrectRate = totalAnswered > 0 ? Math.round((newCorrectCount / totalAnswered) * 100) : 0

    this.setData({
      history: newHistory,
      score: newScore,
      correctCount: newCorrectCount,
      wrongCount: newWrongCount,
      correctRate: newCorrectRate
    })

    // 延迟跳转下一题
    setTimeout(() => {
      this.nextQuestion()
    }, isCorrect ? 1000 : 2000)
  },

  /**
   * 下一题逻辑
   */
  nextQuestion: function () {
    const nextQuestion = this.data.currentQuestion + 1

    if (nextQuestion > this.data.totalQuestions) {
      this.completePractice()
    } else {
      this.setData({
        currentQuestion: nextQuestion,
        userAnswer: '',
        autoFocus: true,
        progressPercent: Math.round((nextQuestion / this.data.totalQuestions) * 100)
      })
      this.generateNewQuestion()
    }
  },

  /**
   * 跳过题目 (视为错题)
   */
  skipQuestion: function () {
    const historyItem = {
      question: this.data.question,
      userAnswer: '跳过',
      correctAnswer: this.data.correctAnswer,
      isCorrect: false,
      time: this.data.formattedTime,
      skipped: true
    }

    let newHistory = [historyItem, ...this.data.history]
    if (newHistory.length > 5) newHistory = newHistory.slice(0, 5)

    // >>>>>> 错题本功能：跳过自动保存 <<<<<<
    this.saveToMistakeBook(this.data.question, this.data.correctAnswer, '跳过');

    this.setData({
      history: newHistory,
      wrongCount: this.data.wrongCount + 1
    })
    setTimeout(() => { this.nextQuestion() }, 300)
  },

  /**
   * ===============================================
   * >>> 完成练习 (此处修改增加了积分逻辑) <<<
   * ===============================================
   */
  completePractice: function () {
    if (this.data.timer) clearInterval(this.data.timer)

    const averageTime = this.data.elapsedTime / this.data.totalQuestions
    
    // --- 1. 计算本局积分 ---
    let earnedPoints = 0;
    // 只有分数大于0才计算积分，防止完全挂机
    if (this.data.score > 0) {
      // 规则：1年级=10分 ... 6年级=60分
      earnedPoints = this.data.grade * 10;
      
      // 读取旧总分 -> 累加 -> 保存
      let totalIntegral = wx.getStorageSync('totalIntegral') || 0;
      totalIntegral += earnedPoints;
      wx.setStorageSync('totalIntegral', totalIntegral);
      
      console.log(`[积分系统] 本次获得: ${earnedPoints}, 总积分: ${totalIntegral}`);
    }

    // --- 2. 构造记录对象 ---
    const practiceRecord = {
      grade: this.data.grade,
      gradeName: this.data.gradeName,
      score: this.data.score,
      total: this.data.totalQuestions * 10,
      correctCount: this.data.correctCount,
      wrongCount: this.data.wrongCount,
      time: this.data.formattedTime,
      averageTime: Math.round(averageTime),
      date: new Date().toLocaleString(),
      correctRate: this.data.correctRate,
      earnedPoints: earnedPoints // 记录本次积分
    }

    this.savePracticeRecord(practiceRecord)

    // 定义跳转动作
    const doRedirect = () => {
      // 将 earnedPoints 传给结果页，方便结果页展示“本次获得xx积分”
      wx.redirectTo({
        url: `/pages/result/result?grade=${this.data.grade}&gradeName=${this.data.gradeName}&score=${this.data.score}&total=${this.data.totalQuestions * 10}&correct=${this.data.correctCount}&wrong=${this.data.wrongCount}&time=${this.data.formattedTime}&correctRate=${this.data.correctRate}&earnedPoints=${earnedPoints}&type=basic`
      })
    };

    // ==============================================
    // >>> 核心修改：上传时的匿名检测 <<<
    // ==============================================
    
    // 1. 获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    // 2. 判断是否有效 (必须有昵称且有头像)
    const isRealUser = userInfo && userInfo.nickName;

    if (this.data.score > 0) {
      if (isRealUser) {
        // --- 情况A: 实名用户 -> 上传云端 ---
        wx.showLoading({ title: '上传战绩...', mask: true });
        this.uploadScoreToCloud(
          this.data.score, 
          this.data.elapsedTime, 
          this.data.grade,
          'basic',
          () => {
            wx.hideLoading();
            doRedirect();
          }
        );
      } else {
        // --- 情况B: 匿名用户 -> 不上传，给提示 ---
        wx.showToast({
          title: '匿名成绩仅保存本地，未上榜',
          icon: 'none',
          duration: 2500 // 提示显示久一点
        });
        
        // 延迟跳转，让用户看清提示
        setTimeout(() => {
          doRedirect();
        }, 2500);
      }
    } else {
      // --- 情况C: 0分 -> 直接跳转 ---
      doRedirect();
    }
  },

  /**
   * 【新增】保存错题到本地缓存
   */
  saveToMistakeBook: function(questionText, correctAns, userAns) {
    try {
      let mistakes = wx.getStorageSync('mistakeList') || [];
      
      const wrongItem = {
        question: questionText,
        correctAnswer: correctAns,
        userAnswer: userAns,
        gradeName: this.data.gradeName,
        date: new Date().toLocaleDateString(),
        timestamp: Date.now() 
      };

      // 简单去重
      const isDuplicate = mistakes.length > 0 && mistakes[0].question === wrongItem.question;
      
      if (!isDuplicate) {
        mistakes.unshift(wrongItem);
        if (mistakes.length > 100) mistakes = mistakes.slice(0, 100);
        wx.setStorageSync('mistakeList', mistakes);
      }
    } catch (err) {
      console.error('错题存储失败', err);
    }
  },

  savePracticeRecord: function (record) {
    try {
      let history = wx.getStorageSync('practiceHistory') || []
      history.unshift(record)
      if (history.length > 50) history = history.slice(0, 50)
      wx.setStorageSync('practiceHistory', history)
    } catch (error) {
      console.error('保存失败', error)
    }
  },

  restartPractice: function () {
    wx.showModal({
      title: '重新开始',
      content: '确定要重新开始吗？进度将丢失。',
      success: (res) => {
        if (res.confirm) {
          if (this.data.timer) clearInterval(this.data.timer)
          if (this.data.questionGenerator) this.data.questionGenerator.clearHistory()
          
          this.setData({
            currentQuestion: 1,
            score: 0,
            correctCount: 0,
            wrongCount: 0,
            correctRate: 0,
            history: [],
            startTime: Date.now(),
            elapsedTime: 0,
            formattedTime: '00:00',
            progressPercent: 0
          })
          
          this.startTimer()
          this.generateNewQuestion()
        }
      }
    })
  },

  clearHistory: function () {
    this.setData({ history: [] })
  },

  onUnload: function () {
    if (this.data.timer) clearInterval(this.data.timer)
  },

  onShareAppMessage: function () {
    return {
      title: `我在做${this.data.gradeName}数学练习，得了${this.data.score}分！`,
      path: '/pages/index/index',
      imageUrl: '/images/share.png'
    }
  },

  uploadScoreToCloud: function (finalScore, usedTime, gradeLevel, practiceType,callback) {
    const userInfo = wx.getStorageSync('userInfo') || { nickName: '未名大侠', avatarUrl: '' };
    let openid = wx.getStorageSync('openid');
    if (!openid) {
      openid = 'user_' + Date.now() + Math.random().toString(36).substr(2);
      wx.setStorageSync('openid', openid);
    }

    wx.request({
      url: 'https://lch97.cn/math_api/submit_score.php',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        openid: openid,
        nickname: userInfo.nickName,
        avatar: userInfo.avatarUrl,
        grade: gradeLevel,
        score: finalScore,
        time_used: usedTime,
        type: practiceType || 'basic'
      },
      success: (res) => { console.log('上传成功') },
      fail: (err) => { console.error('上传失败') },
      complete: () => {
        if (callback) callback();
      }
    });
  }
})