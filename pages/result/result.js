// pages/result/result.js
Page({
  data: {
    // 成绩信息
    score: 0,
    total: 0,
    grade: 1,
    gradeName: '',
    correctRate: 0,
    correctCount: 0,
    wrongCount: 0,
    time: '00:00',
    averageTime: 0,
    
    // 显示信息
    message: '',
    formattedDate: '',
    showBadge: false,
    badgeClass: '',
    badgeText: '',
    cheerMsg: '',
    
    // 历史记录
    recentHistory: []
  },
  
  onLoad: function(options) {
    console.log('结果页面参数:', options)
    
    // 解析参数
    const score = parseInt(options.score) || 0
    const total = parseInt(options.total) || 100
    const grade = parseInt(options.grade) || 1
    const gradeName = options.gradeName || `${grade}年级`
    const correctCount = parseInt(options.correct) || 0
    const wrongCount = parseInt(options.wrong) || 0
    const time = options.time || '00:00'
    const correctRateParam = options.correctRate || 0
    
    // 计算正确率 (处理可能带%的情况)
    let correctRate = 0;
    if (typeof correctRateParam === 'string') {
        correctRate = parseInt(correctRateParam.replace('%', ''));
    } else {
        correctRate = parseInt(correctRateParam);
    }
    
    // 计算平均用时
    const totalQuestions = correctCount + wrongCount
    const averageTime = totalQuestions > 0 
      ? Math.round((parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1])) / totalQuestions)
      : 0
    
    // 格式化日期
    const now = new Date()
    const formattedDate = `${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    // 生成评价
    const { message, showBadge, badgeClass, badgeText } = this.generateEvaluation(correctRate)
    
    // 保存历史
    this.saveHistory(score, total, grade, gradeName, correctRate, time, correctCount, wrongCount)
    
    this.setData({
      score: score,
      total: total,
      grade: grade,
      gradeName: gradeName,
      correctRate: correctRate + '%', // 这里加上%用于显示
      correctCount: correctCount,
      wrongCount: wrongCount,
      time: time,
      averageTime: averageTime,
      message: message,
      cheerMsg: message.split('！')[0] + '！', 
      formattedDate: formattedDate,
      showBadge: showBadge,
      badgeClass: badgeClass,
      badgeText: badgeText
    })
  },
  
  generateEvaluation: function(correctRate) {
    let message = ''
    let showBadge = false
    let badgeClass = ''
    let badgeText = ''
    
    if (correctRate === 100) {
      message = '太棒了！满分王者！🎉'
      showBadge = true
      badgeClass = 'gold-badge'
      badgeText = '满分王者'
    } else if (correctRate >= 90) {
      message = '太优秀了！名列前茅！🌟'
      showBadge = true
      badgeClass = 'silver-badge'
      badgeText = '数学高手'
    } else if (correctRate >= 80) {
      message = '非常好！稳定发挥！👍'
      showBadge = true
      badgeClass = 'bronze-badge'
      badgeText = '计算达人'
    } else if (correctRate >= 60) {
      message = '及格啦！还有进步空间！📈'
    } else {
      message = '不要气馁，坚持就是胜利！💪'
    }
    
    return { message, showBadge, badgeClass, badgeText }
  },

  // --- 按钮跳转区 ---

  // 1. 查看榜单
  goToRank: function() {
    wx.redirectTo({
      url: '/pages/math_rank/math_rank'
    });
  },

  // 2. 重新练习
  restartPractice: function() {
    const { grade, gradeName } = this.data;
    wx.redirectTo({
      url: `/pages/practice/practice?grade=${grade}&gradeName=${gradeName}`
    });
  },

  // 3. 查看历史记录 (找回这个功能了！)
  viewHistory: function() {
    wx.navigateTo({
      url: '/pages/history/history'
    });
  },

  // 4. 返回首页
  goHome: function() {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },
  
  // 5. 保存历史
  saveHistory: function(score, total, grade, gradeName, correctRate, time, correctCount, wrongCount) {
    try {
      let history = wx.getStorageSync('practiceHistory') || [];
      const now = new Date();
      const record = {
        id: `record_${now.getTime()}_${Math.random()}`,
        date: now.toLocaleString(),
        grade, gradeName, score, total, correctCount, wrongCount, correctRate, time
      };
      history.unshift(record);
      if (history.length > 50) history = history.slice(0, 50);
      wx.setStorageSync('practiceHistory', history);
    } catch (error) {
      console.error('保存失败', error);
    }
  },

  // 6. 分享功能
  onShareAppMessage: function() {
    const { score, correctRate, gradeName } = this.data
    return {
      title: `我在${gradeName}练习得了${score}分！快来挑战我！`,
      path: '/pages/index/index',
      imageUrl: '/images/share.png' // 确保有图片，或者删除这行
    }
  }
})