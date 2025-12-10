Page({
  data: {
    score: 0,
    total: 0,
    grade: 1,
    correctRate: '0%',
    message: ''
  },
  
  onLoad: function(options) {
    const score = parseInt(options.score) || 0
    const total = parseInt(options.total) || 10
    const grade = parseInt(options.grade) || 1
    const correctRate = Math.round((score / total) * 100)
    
    // 保存历史记录
    this.saveHistory(score, total, grade, correctRate)
    
    // 根据得分显示不同评价
    let message = ''
    if (correctRate === 100) {
      message = '太棒了！满分！🎉'
    } else if (correctRate >= 80) {
      message = '非常好！继续努力！👍'
    } else if (correctRate >= 60) {
      message = '不错，还有进步空间！💪'
    } else {
      message = '再加把劲，多练习就会更好！📚'
    }
    
    this.setData({
      score: score,
      total: total,
      grade: grade,
      correctRate: correctRate + '%',
      message: message
    })
  },
  
  // 保存历史记录的函数
  saveHistory: function(score, total, grade, correctRate) {
    const history = wx.getStorageSync('practiceHistory') || []
    history.unshift({
      date: new Date().toLocaleString(),
      grade: grade,
      score: score,
      total: total,
      correctRate: correctRate + '%'
    })
    
    // 只保留最近50条记录
    if (history.length > 50) {
      history.pop()
    }
    
    wx.setStorageSync('practiceHistory', history)
  },
  
  // 返回首页
  goHome: function() {
    wx.navigateBack({
      delta: 2  // 返回两级，跳回首页
    })
  },
  
  // 重新练习
  restart: function() {
    wx.navigateBack({
      delta: 1  // 返回一级，回到练习页面
    })
  },
  
  // 查看历史记录
  viewHistory: function() {
    wx.navigateTo({
      url: '/pages/history/history'
    })
  }
})