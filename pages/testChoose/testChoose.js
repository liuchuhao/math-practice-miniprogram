Page({
  data: {
    gradeList: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
    itemDescriptions: [
      '10以内加减法，认识数字',
      '表内乘除法，100以内加减',
      '三位数加减，简单小数分数',
      '多位数乘除，四则混合运算',
      '小数分数运算，百分数计算',
      '综合运算，复杂问题解决'
    ]
  },

  onLoad: function(options) {
    // 页面加载时的逻辑
  },

  // 选择年级
  selectGrade: function(e) {
    const grade = e.currentTarget.dataset.grade;
    const pageMap = {
      '一年级': 'generatePaperGrade1',
      '二年级': 'generatePaperGrade2', 
      '三年级': 'generatePaperGrade3',
      '四年级': 'generatePaperGrade4',
      '五年级': 'generatePaperGrade5',
      '六年级': 'generatePaperGrade6'
    };
    
    // 跳转到对应年级的试卷生成页面
    wx.navigateTo({
      url: `/pages/${pageMap[grade]}/${pageMap[grade]}`
    });
  },

  onShow: function() {
    // 页面显示时的逻辑
  }
});