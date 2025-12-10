Page({
  data: {
    grades: [
      { grade: 1, name: '一年级', desc: '20以内加减法' },
      { grade: 2, name: '二年级', desc: '100以内加减法' },
      { grade: 3, name: '三年级', desc: '乘除法入门' },
      { grade: 4, name: '四年级', desc: '多位数运算' },
      { grade: 5, name: '五年级', desc: '小数分数' },
      { grade: 6, name: '六年级', desc: '综合运算' }
    ]
  },
  
  selectGrade: function(e) {
    const grade = e.currentTarget.dataset.grade
    wx.navigateTo({
      url: `/pages/practice/practice?grade=${grade}`
    })
  }
})