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
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('练习页面显示')
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('练习页面隐藏')
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
    if (!generator) {
      console.error('题目生成器未初始化')
      return
    }

    // 使用 QuestionGenerator 生成题目
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
   * 输入答案（文本框输入）
   */
  onInput: function (e) {
    this.setData({
      userAnswer: e.detail.value
    })
  },

  /**
   * 键盘按键点击（虚拟键盘）
   */
  onKeyTap: function (e) {
    const key = e.currentTarget.dataset.key
    const currentAnswer = this.data.userAnswer

    this.setData({
      userAnswer: currentAnswer + key
    })
  },

  /**
   * 删除最后一个字符
   */
  onDelete: function () {
    const currentAnswer = this.data.userAnswer
    if (currentAnswer.length > 0) {
      this.setData({
        userAnswer: currentAnswer.slice(0, -1)
      })
    }
  },

  /**
   * 切换键盘显示
   */
  toggleKeypad: function () {
    this.setData({
      showKeypad: !this.data.showKeypad
    })
  },

  /**
   * 清空输入
   */
  clearInput: function () {
    this.setData({
      userAnswer: ''
    })
  },

  /**
   * 提交答案
   */
  submitAnswer: function () {
    const userAnswerStr = this.data.userAnswer.trim()
    const correctAnswer = this.data.correctAnswer

    if (userAnswerStr === '') {
      wx.showToast({
        title: '请输入答案',
        icon: 'none',
        duration: 1500
      })
      return
    }

    // 更好的数字解析（支持小数和整数）
    const userAnswer = parseFloat(userAnswerStr)
    if (isNaN(userAnswer)) {
      wx.showToast({
        title: '请输入有效的数字',
        icon: 'none',
        duration: 1500
      })
      return
    }

    // 更精确的比较（考虑小数精度）
    const tolerance = 0.001 // 增加容差
    let isCorrect = Math.abs(userAnswer - correctAnswer) < tolerance

    // 如果没有匹配，再尝试字符串比较（去除多余的0）
    if (!isCorrect) {
      const userStr = userAnswer.toString().replace(/\.0+$/, '').replace(/(\..*?)0+$/, '$1')
      const correctStr = correctAnswer.toString().replace(/\.0+$/, '').replace(/(\..*?)0+$/, '$1')
      isCorrect = userStr === correctStr
    }

    // 调试信息
    console.log('答案比较:', {
      userAnswer: userAnswer,
      correctAnswer: correctAnswer,
      difference: Math.abs(userAnswer - correctAnswer),
      tolerance: tolerance,
      isCorrect: isCorrect
    })

    // 添加到历史记录
    const historyItem = {
      question: this.data.question,
      userAnswer: userAnswerStr,
      correctAnswer: correctAnswer,
      isCorrect: isCorrect,
      time: this.data.formattedTime
    }

    let newHistory = [historyItem, ...this.data.history]
    if (newHistory.length > 5) {
      newHistory = newHistory.slice(0, 5)
    }

    // 更新得分
    let newScore = this.data.score
    let newCorrectCount = this.data.correctCount
    let newWrongCount = this.data.wrongCount

    if (isCorrect) {
      newScore += 10
      newCorrectCount += 1

      wx.showToast({
        title: '✅ 正确！',
        icon: 'success',
        duration: 1500,
        mask: true
      })
    } else {
      newWrongCount += 1

      wx.showModal({
        title: '答案不正确',
        content: `你的答案：${userAnswerStr}\n正确答案：${correctAnswer}`,
        showCancel: false,
        confirmText: '知道了',
        confirmColor: '#e74c3c'
      })
    }

    // 计算正确率
    const totalAnswered = newCorrectCount + newWrongCount
    const newCorrectRate = totalAnswered > 0 ? Math.round((newCorrectCount / totalAnswered) * 100) : 0

    // 更新数据
    this.setData({
      history: newHistory,
      score: newScore,
      correctCount: newCorrectCount,
      wrongCount: newWrongCount,
      correctRate: newCorrectRate
    })

    // 延迟后进入下一题
    setTimeout(() => {
      this.nextQuestion()
    }, isCorrect ? 1500 : 2000) // 错误时多给点时间看正确答案
  },

  /**
   * 下一题
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
   * 跳过本题
   */
  skipQuestion: function () {
    wx.showModal({
      title: '跳过题目',
      content: '确定要跳过这道题吗？',
      success: (res) => {
        if (res.confirm) {
          // 添加到历史记录（标记为跳过）
          const historyItem = {
            question: this.data.question,
            userAnswer: '跳过',
            correctAnswer: this.data.correctAnswer,
            isCorrect: false,
            time: this.data.formattedTime,
            skipped: true
          }

          let newHistory = [historyItem, ...this.data.history]
          if (newHistory.length > 5) {
            newHistory = newHistory.slice(0, 5)
          }

          this.setData({
            history: newHistory,
            wrongCount: this.data.wrongCount + 1
          })

          // 进入下一题
          setTimeout(() => {
            this.nextQuestion()
          }, 500)
        }
      }
    })
  },

  /**
   * 完成练习（这里修改了代码，增加了上传成绩的逻辑）
   */
  completePractice: function () {
    // 停止计时器
    if (this.data.timer) {
      clearInterval(this.data.timer)
    }

    // 计算平均用时
    const averageTime = this.data.elapsedTime / this.data.totalQuestions

    // 保存练习记录
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
      correctRate: this.data.correctRate
    }

    // 保存到本地存储
    this.savePracticeRecord(practiceRecord)

    // >>>>>>> 修改开始：调用云端上传接口 <<<<<<<
    // 只有得分为正数才上传，避免0分刷榜
    if (this.data.score > 0) {
      this.uploadScoreToCloud(
        this.data.score, // 分数
        this.data.elapsedTime, // 总耗时（秒）
        this.data.grade // 年级
      )
    }
    // >>>>>>> 修改结束 <<<<<<<

    // 跳转到结果页面
    setTimeout(() => {
      wx.redirectTo({
        url: `/pages/result/result?grade=${this.data.grade}&gradeName=${this.data.gradeName}&score=${this.data.score}&total=${this.data.totalQuestions * 10}&correct=${this.data.correctCount}&wrong=${this.data.wrongCount}&time=${this.data.formattedTime}&correctRate=${this.data.correctRate}`
      })
    }, 1000)
  },

  /**
   * 保存练习记录
   */
  savePracticeRecord: function (record) {
    try {
      let history = wx.getStorageSync('practiceHistory') || []
      history.unshift(record)

      if (history.length > 50) {
        history = history.slice(0, 50)
      }

      wx.setStorageSync('practiceHistory', history)
      console.log('练习记录保存成功', record)
    } catch (error) {
      console.error('保存练习记录失败', error)
    }
  },

  /**
   * 重新开始练习
   */
  restartPractice: function () {
    wx.showModal({
      title: '重新开始',
      content: '确定要重新开始练习吗？当前进度将丢失。',
      success: (res) => {
        if (res.confirm) {
          // 停止计时器
          if (this.data.timer) {
            clearInterval(this.data.timer)
          }

          // 重置题目生成器的历史记录
          if (this.data.questionGenerator) {
            this.data.questionGenerator.clearHistory()
          }

          // 重置数据
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

          // 重新开始计时
          this.startTimer()

          // 生成新题目
          this.generateNewQuestion()

          wx.showToast({
            title: '重新开始',
            icon: 'success'
          })
        }
      }
    })
  },

  /**
   * 清空历史记录
   */
  clearHistory: function () {
    wx.showModal({
      title: '清空记录',
      content: '确定要清空答题记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            history: []
          })
          wx.showToast({
            title: '已清空',
            icon: 'success'
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('练习页面卸载')
    // 清理计时器
    if (this.data.timer) {
      clearInterval(this.data.timer)
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log('下拉刷新')
    // 重新开始
    this.restartPractice()
    wx.stopPullDownRefresh()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: `我在做${this.data.gradeName}数学练习，得了${this.data.score}分！`,
      path: '/pages/index/index',
      imageUrl: '/images/share.png'
    }
  },

  // ==========================================
  // >>> 新增：上传成绩到你的服务器 <<<
  // ==========================================
  uploadScoreToCloud: function (finalScore, usedTime, gradeLevel) {
    // 1. 获取本地存储的用户信息（如果你没有做登录，这里是空的或者默认值）
    const userInfo = wx.getStorageSync('userInfo') || {
      nickName: '未名大侠',
      avatarUrl: ''
    };

    // 2. 获取或生成 OpenID (作为用户唯一标识)
    let openid = wx.getStorageSync('openid');
    if (!openid) {
      // 这里的逻辑是：如果没登录，生成一个随机ID存起来，保证同一台手机下次还是这个人
      openid = 'user_' + Date.now() + Math.random().toString(36).substr(2);
      wx.setStorageSync('openid', openid);
    }

    console.log('开始上传成绩到服务器...', {
      score: finalScore,
      time: usedTime,
      grade: gradeLevel,
      openid: openid
    });

    // 3. 发送 POST 请求
    wx.request({
      url: 'https://lch97.cn/math_api/submit_score.php', // 你的服务器接口
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        openid: openid,
        nickname: userInfo.nickName,
        avatar: userInfo.avatarUrl,
        grade: gradeLevel,
        score: finalScore,
        time_used: usedTime
      },
      success: (res) => {
        console.log('上传结果:', res.data);
        if (res.data.code === 200) {
          // 提示用户上传成功（因为马上要跳转，可能显示时间很短，可以去掉这行或者改到result页显示）
          // wx.showToast({ title: '战绩已上传榜单!', icon: 'success' });
        }
      },
      fail: (err) => {
        console.error('上传失败', err);
      }
    });
  }
})