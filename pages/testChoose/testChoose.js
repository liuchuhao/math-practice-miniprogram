Page({
  data: {
    gradeList: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
    
    // 优化：更详细的题型描述
    itemDescriptions: [
      '10/20以内加减法，100以内整十数运算',
      '100以内加减法，表内乘除法，有余数除法',
      '三位数加减，两位数乘除法，小数分数入门',
      '多位数乘除，简便运算，小数加减法',
      '小数乘除，分数加减，简易方程',
      '分数乘除，百分数，比例，综合运算'
    ],
    
    // 新增：每个年级的详细题型配置
    gradeTopics: {
      '一年级': [
        { name: '10以内加减', icon: '➕' },
        { name: '20以内加减', icon: '➖' },
        { name: '整十数加减', icon: '🔢' }
      ],
      '二年级': [
        { name: '100以内加减', icon: '➕' },
        { name: '表内乘法', icon: '✖️' },
        { name: '表内除法', icon: '➗' },
        { name: '有余数除法', icon: '📊' }
      ],
      '三年级': [
        { name: '三位数加减', icon: '🔢' },
        { name: '两位数乘法', icon: '✖️' },
        { name: '一位数除法', icon: '➗' },
        { name: '简单小数', icon: '📐' }
      ],
      '四年级': [
        { name: '多位数乘法', icon: '✖️' },
        { name: '两位数除法', icon: '➗' },
        { name: '混合运算', icon: '🎯' },
        { name: '简便运算', icon: '💡' },
        { name: '小数加减', icon: '📐' }
      ],
      '五年级': [
        { name: '小数乘除', icon: '📐' },
        { name: '分数加减', icon: '🔢' },
        { name: '简易方程', icon: '⚖️' },
        { name: '分数比较', icon: '📊' }
      ],
      '六年级': [
        { name: '分数乘除', icon: '🔢' },
        { name: '百分数', icon: '💯' },
        { name: '比例计算', icon: '⚖️' },
        { name: '综合运算', icon: '🎯' }
      ]
    },

    // 新增：难度等级
    difficultyLevels: ['⭐', '⭐⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐']
  },

  onLoad: function(options) {
    // 可以添加加载动画或数据预加载
    this.preloadGradeData();
  },

  // 新增：预加载数据
  preloadGradeData: function() {
    // 预加载常用配置，提高响应速度
    const lastGrade = wx.getStorageSync('lastSelectedGrade');
    if (lastGrade) {
      this.setData({ lastGrade });
    }
  },

  // 选择年级 - 优化版本
  selectGrade: function(e) {
    const grade = e.currentTarget.dataset.grade;
    
    // 保存用户上次选择
    wx.setStorageSync('lastSelectedGrade', grade);
    
    const pageMap = {
      '一年级': 'generatePaperGrade1',
      '二年级': 'generatePaperGrade2',
      '三年级': 'generatePaperGrade3',
      '四年级': 'generatePaperGrade4',
      '五年级': 'generatePaperGrade5',
      '六年级': 'generatePaperGrade6'
    };

    // 添加点击反馈
    wx.vibrateShort({ type: 'light' });

    wx.navigateTo({
      url: `/pages/${pageMap[grade]}/${pageMap[grade]}`,
      fail: (err) => {
        console.error('页面跳转失败:', err);
        wx.showToast({
          title: '页面加载失败',
          icon: 'error'
        });
      }
    });
  },

  // 新增：长按显示详细题型
  showGradeDetail: function(e) {
    const grade = e.currentTarget.dataset.grade;
    const topics = this.data.gradeTopics[grade];
    
    const topicNames = topics.map(t => `${t.icon} ${t.name}`).join('\n');
    
    wx.showModal({
      title: `${grade}题型详情`,
      content: topicNames,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  onShow: function() {
    // 页面显示时刷新状态
  }
});