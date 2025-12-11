Page({
  data: {
    grades: [
      { id: 1, grade: 1, name: '一年级', desc: '20以内加减法', icon: '1' },
      { id: 2, grade: 2, name: '二年级', desc: '100以内加减法', icon: '2' },
      { id: 3, grade: 3, name: '三年级', desc: '乘除法入门', icon: '3' },
      { id: 4, grade: 4, name: '四年级', desc: '多位数运算', icon: '4' },
      { id: 5, grade: 5, name: '五年级', desc: '小数分数', icon: '5' },
      { id: 6, grade: 6, name: '六年级', desc: '综合运算', icon: '6' }
    ]
  },

  selectGrade: function(e) {
    const grade = e.currentTarget.dataset.grade
    const gradeInfo = this.data.grades.find(g => g.grade === grade)
    
    wx.showLoading({
      title: '加载中...',
    })
    
    setTimeout(() => {
      wx.hideLoading()
      wx.navigateTo({
        url: `/pages/practice/practice?grade=${grade}&gradeName=${gradeInfo.name}`,
        fail: (err) => {
          console.error('跳转失败:', err)
          wx.showToast({
            title: '功能开发中',
            icon: 'none'
          })
        }
      })
    }, 500)
  },

  onLoad: function(options) {
    console.log('年级选择页加载')
  }
})