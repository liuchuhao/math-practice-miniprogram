Page({
  startPractice: function() {
    wx.navigateTo({
      url: '/pages/gradeSelect/gradeSelect'
    })
  },
  
  viewHistory: function() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },
  
  about: function() {
    wx.showModal({
      title: '关于',
      content: '小学数学计算练习 v1.0\n适合1-6年级学生',
      showCancel: false
    })
  }
})