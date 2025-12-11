// pages/result/result.js
Page({
  data: {
    // 成绩信息
    score: 0,
    total: 0,
    grade: 1,
    gradeName: '',
    correctRate: '0%',
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
    const correctRateParam = options.correctRate || Math.round((score / total) * 100)
    
    // 计算正确率
    const correctRate = typeof correctRateParam === 'string' 
      ? parseInt(correctRateParam) 
      : Math.round((score / total) * 100)
    
    // 计算平均用时
    const totalQuestions = correctCount + wrongCount
    const averageTime = totalQuestions > 0 
      ? Math.round(parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]) / totalQuestions)
      : 0
    
    // 格式化日期
    const now = new Date()
    const formattedDate = `${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    // 生成评价和徽章
    const { message, showBadge, badgeClass, badgeText } = this.generateEvaluation(correctRate)
    
    // 保存历史记录
    this.saveHistory(score, total, grade, gradeName, correctRate, time, correctCount, wrongCount)
    
    // 获取最近历史记录
    const recentHistory = this.getRecentHistory(5)
    
    this.setData({
      score: score,
      total: total,
      grade: grade,
      gradeName: gradeName,
      correctRate: correctRate + '%',
      correctCount: correctCount,
      wrongCount: wrongCount,
      time: time,
      averageTime: averageTime,
      message: message,
      formattedDate: formattedDate,
      showBadge: showBadge,
      badgeClass: badgeClass,
      badgeText: badgeText,
      recentHistory: recentHistory
    })
  },
  
  /**
   * 生成评价和徽章
   */
  generateEvaluation: function(correctRate) {
    let message = ''
    let showBadge = false
    let badgeClass = ''
    let badgeText = ''
    
    if (correctRate === 100) {
      message = '太棒了！满分！🎉 你是数学小天才！'
      showBadge = true
      badgeClass = 'gold-badge'
      badgeText = '满分王者'
    } else if (correctRate >= 90) {
      message = '太优秀了！继续加油！🌟'
      showBadge = true
      badgeClass = 'silver-badge'
      badgeText = '数学高手'
    } else if (correctRate >= 80) {
      message = '非常好！稳定发挥！👍'
      showBadge = true
      badgeClass = 'bronze-badge'
      badgeText = '计算达人'
    } else if (correctRate >= 70) {
      message = '不错哦！继续努力！💪'
    } else if (correctRate >= 60) {
      message = '及格啦！还有进步空间！📈'
    } else if (correctRate >= 50) {
      message = '加把劲，多练习会更好！📚'
    } else {
      message = '不要气馁，坚持就是胜利！💪'
    }
    
    return { message, showBadge, badgeClass, badgeText }
  },
  
  /**
   * 保存历史记录
   */
  saveHistory: function(score, total, grade, gradeName, correctRate, time, correctCount, wrongCount) {
    try {
      let history = wx.getStorageSync('practiceHistory') || []
      
      const record = {
        date: new Date().toLocaleString(),
        grade: grade,
        gradeName: gradeName,
        score: score,
        total: total,
        correctRate: correctRate + '%',
        time: time,
        correctCount: correctCount,
        wrongCount: wrongCount,
        timestamp: Date.now()
      }
      
      history.unshift(record)
      
      // 只保留最近50条记录
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
   * 获取最近历史记录
   */
  getRecentHistory: function(limit = 5) {
    try {
      const history = wx.getStorageSync('practiceHistory') || []
      // 排除当前这次记录（因为是刚保存的）
      return history.slice(1, limit + 1)
    } catch (error) {
      console.error('获取历史记录失败', error)
      return []
    }
  },
  
  /**
   * 格式化预览日期
   */
  formatPreviewDate: function(dateString) {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return dateString.split(' ')[0] || dateString
    }
    
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffMins < 24 * 60) return `${Math.floor(diffMins / 60)}小时前`
    
    return `${date.getMonth() + 1}-${date.getDate()}`
  },
  
  /**
   * 返回首页
   */
  goHome: function() {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  },
  
  /**
   * 重新练习
   */
  restart: function() {
    const { grade, gradeName } = this.data
    wx.redirectTo({
      url: `/pages/practice/practice?grade=${grade}&gradeName=${gradeName}`
    })
  },
  
  /**
   * 查看历史记录
   */
  viewHistory: function() {
    wx.navigateTo({
      url: '/pages/history/history'
    })
  },
  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    const { score, total, correctRate, gradeName } = this.data
    return {
      title: `我在${gradeName}数学练习中得了${score}分（${correctRate}正确率）！`,
      path: '/pages/index/index',
      imageUrl: '/images/share-result.png'
    }
  },
  
  /**
   * 分享到朋友圈
   */
  onShareTimeline: function() {
    const { score, total, correctRate, gradeName } = this.data
    return {
      title: `小学数学练习 - ${gradeName} ${score}分`,
      query: `from=result`
    }
  }
})