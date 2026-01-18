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
    isAnonymous: false, 
    earnedPoints: 0,    
    resultType: 'basic', // [新增] 默认为基础
    
    // 显示信息
    message: '',
    formattedDate: '',
    showBadge: false,
    badgeClass: '',
    badgeText: '',
    cheerMsg: '',
  },
  
  onLoad: function(options) {
    console.log('结果页面参数:', options)
    
    // 1. 获取用户信息，判断是否匿名
    const userInfo = wx.getStorageSync('userInfo');
    // 注意：这里判断是否有 nickName 即可，和 practice.js 逻辑保持一致
    const hasNickName = userInfo && userInfo.nickName;

    // 解析参数
    const score = parseInt(options.score) || 0
    const total = parseInt(options.total) || 100
    const grade = parseInt(options.grade) || 1
    const gradeName = options.gradeName || `${grade}年级`
    const correctCount = parseInt(options.correct) || 0
    const wrongCount = parseInt(options.wrong) || 0
    const time = options.time || '00:00'
    const correctRateParam = options.correctRate || 0
    const earnedPoints = parseInt(options.earnedPoints) || 0 // 转为数字

    // 计算正确率 (处理可能带%的情况)
    let correctRate = 0;
    if (typeof correctRateParam === 'string') {
        correctRate = parseInt(correctRateParam.replace('%', ''));
    } else {
        correctRate = parseInt(correctRateParam);
    }
    
    // 计算平均用时 (仅作展示用)
    const totalQuestions = correctCount + wrongCount
    const averageTime = totalQuestions > 0 
      ? Math.round((parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1])) / totalQuestions)
      : 0
    
    // 格式化日期
    const now = new Date()
    const formattedDate = `${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    // 生成评价
    const { message, showBadge, badgeClass, badgeText } = this.generateEvaluation(correctRate)
    
    // ⚠️【已删除】saveHistory 调用
    // 原因：practice.js 结算时已经保存过一次了，这里再保存会导致重复记录。

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
      // 简单的截取逻辑，确保 message 中包含中文感叹号
      cheerMsg: message.split('！')[0] + '！', 
      formattedDate: formattedDate,
      showBadge: showBadge,
      badgeClass: badgeClass,
      badgeText: badgeText,
      earnedPoints: earnedPoints,
      isAnonymous: !hasNickName,
      resultType: options.type || 'basic'
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

  // 1. 查看榜单 (使用 redirectTo 防止层级过深)
  goToRank: function() {
    // 假设 this.data.grade 是数字 (如 1, 2, 3)
    // 假设 this.data.resultType 是 'basic' 或 'advanced'
    // 这里的 url 参数带过去
    wx.redirectTo({
      url: `/pages/rank/index?tab=0&grade=${this.data.grade}&type=${this.data.resultType}`
    });
  },

  // 2. 重新练习 (使用 redirectTo 关闭当前结果页)
  restartPractice: function() {
    const { grade, gradeName } = this.data;
    wx.redirectTo({
      url: `/pages/practice/practice?grade=${grade}&gradeName=${gradeName}`
    });
  },

  // 3. 查看历史记录
  viewHistory: function() {
    wx.navigateTo({
      url: '/pages/history/history'
    });
  },

  // 4. 返回首页 (reLaunch 清空所有页面栈)
  goHome: function() {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },
  
  // 5. 分享功能
  onShareAppMessage: function() {
    const { score, correctRate, gradeName } = this.data
    return {
      title: `我在${gradeName}练习得了${score}分！快来挑战我！`,
      path: '/pages/index/index',
      imageUrl: '/images/share.png' 
    }
  }
})