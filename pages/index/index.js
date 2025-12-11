// pages/index/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    welcomeText: '欢迎使用',
    version: 'v1.0.0',
    buttons: [
      { id: 1, text: '开始练习', icon: 'play-circle', color: '#3498db' },
      { id: 2, text: '练习记录', icon: 'history', color: '#2ecc71' },
      { id: 3, text: '关于我们', icon: 'info-circle', color: '#9b59b6' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('首页加载完成')
  },

  /**
   * 开始练习
   */
  startPractice: function() {
    console.log('开始练习')
    
    // 显示加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    
    // 模拟加载过程
    setTimeout(() => {
      wx.hideLoading()
      
      // 跳转到年级选择页面
      wx.navigateTo({
        url: '/pages/gradeSelect/gradeSelect',
        success: () => {
          console.log('跳转到年级选择页成功')
        },
        fail: (err) => {
          console.error('跳转失败:', err)
          wx.showToast({
            title: '跳转失败',
            icon: 'none'
          })
        }
      })
    }, 500)
  },

  /**
   * 查看历史记录
   */
  viewHistory: function() {
    console.log('查看历史记录')
    
    wx.showModal({
      title: '提示',
      content: '历史记录功能正在开发中，敬请期待！',
      showCancel: false,
      confirmText: '知道了',
      success: (res) => {
        if (res.confirm) {
          console.log('用户点击确定')
        }
      }
    })
  },

  /**
   * 关于我们
   */
  about: function() {
    console.log('关于我们')
    
    wx.showModal({
      title: '关于小学数学计算练习',
      content: '版本：v1.0.0\n\n功能：\n• 1-6年级数学计算练习\n• 多种题型选择\n• 自动评分系统\n• 练习记录保存\n\n开发目标：\n帮助小学生提高数学计算能力',
      showCancel: false,
      confirmText: '确定',
      confirmColor: '#3498db'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log('首页渲染完成')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('首页显示')
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('首页隐藏')
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('首页卸载')
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log('下拉刷新')
    setTimeout(() => {
      wx.stopPullDownRefresh()
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      })
    }, 1000)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('上拉触底')
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '小学数学计算练习',
      path: '/pages/index/index',
      imageUrl: '/images/share.png'
    }
  }
})