Page({
  data: {
    // --- [新增] 模式标记 ---
    mode: 'basic', // 默认为基础模式，如果是 'advanced' 则为拓展模式

    grades: [
      { 
        id: 1, 
        grade: 1, 
        name: '一年级', 
        desc: '10/20以内加减法，100以内整十数运算',
        tags: ['10以内加减', '20以内加减', '整十数'],
        difficulty: 1,
        color: '#ff6b6b'
      },
      { 
        id: 2, 
        grade: 2, 
        name: '二年级', 
        desc: '100以内加减法，表内乘除法',
        tags: ['百以内加减', '乘法口诀' ],
        difficulty: 2,
        color: '#ff9f43'
      },
      { 
        id: 3, 
        grade: 3, 
        name: '三年级', 
        desc: '三位数加减，两位数乘除法，小数入门',
        tags: ['三位数运算', '两位数乘除', '小数认识'],
        difficulty: 2,
        color: '#2ecc71'
      },
      { 
        id: 4, 
        grade: 4, 
        name: '四年级', 
        desc: '多位数乘除，简便运算，小数加减法',
        tags: ['多位数乘除', '简便计算', '小数加减'],
        difficulty: 3,
        color: '#54a0ff'
      },
      { 
        id: 5, 
        grade: 5, 
        name: '五年级', 
        desc: '小数乘除',
        tags: ['小数乘除'],
        difficulty: 3,
        color: '#9b59b6'
      },
      { 
        id: 6, 
        grade: 6, 
        name: '六年级', 
        desc: '小数乘除，百分数，比例，综合运算',
        tags: ['小数乘除', '百分数', '比例'],
        difficulty: 4,
        color: '#00d2d3'
      }
    ],
    lastGrade: null,
    animationReady: false
  },

  onLoad: function(options) {
    // --- [新增] 接收首页传来的模式参数 ---
    if (options.mode === 'advanced') {
      this.setData({ mode: 'advanced' });
      // 可以在这里改变标题，提示用户当前是拓展模式
      wx.setNavigationBarTitle({ title: '选择拓展挑战难度' });
    } else {
      this.setData({ mode: 'basic' });
    }

    // 获取上次选择的年级
    const lastGrade = wx.getStorageSync('lastSelectedGrade');
    if (lastGrade) {
      const gradeInfo = this.data.grades.find(g => g.grade === lastGrade);
      if (gradeInfo) {
        this.setData({ lastGrade: gradeInfo });
      }
    }
  },

  onReady: function() {
    // 延迟触发动画
    setTimeout(() => {
      this.setData({ animationReady: true });
    }, 100);
  },

  // 选择年级 (核心修改处)
  selectGrade: function(e) {
    const grade = e.currentTarget.dataset.grade;
    const gradeInfo = this.data.grades.find(g => g.grade === grade);
    
    if (!gradeInfo) {
      wx.showToast({ title: '年级信息错误', icon: 'error' });
      return;
    }

    // 保存选择记录
    wx.setStorageSync('lastSelectedGrade', grade);

    // 触觉反馈
    wx.vibrateShort({ type: 'light' });

    // --- [核心修改] 根据模式跳转到不同页面 ---
    let targetUrl = '';
    
    if (this.data.mode === 'advanced') {
      // 如果是拓展模式 -> 跳去新的 practice_advanced 页面
      // 注意：这里没有传 gradeName，因为新页面可能自己生成标题，如果需要也可以传
      targetUrl = `/pages/practice_advanced/practice_advanced?grade=${grade}`;
    } else {
      // 如果是基础模式 -> 跳去旧的 practice 页面 (保持原样)
      targetUrl = `/pages/practice/practice?grade=${grade}&gradeName=${gradeInfo.name}`;
    }

    // 跳转
    wx.navigateTo({
      url: targetUrl,
      fail: (err) => {
        console.error('跳转失败:', err);
        wx.showToast({
          title: '即将开放', // 提示语更友好一点
          icon: 'none'
        });
      }
    });
  },

  // 长按显示详细题型 (保持不变)
  showDetail: function(e) {
    const grade = e.currentTarget.dataset.grade;
    const gradeInfo = this.data.grades.find(g => g.grade === grade);
    
    if (!gradeInfo) return;

    wx.vibrateShort({ type: 'medium' });
    
    // 如果是拓展模式，这里的提示文案其实可以换一下，不过暂时保持原样也没大问题
    wx.showModal({
      title: `${gradeInfo.name}题型详情`,
      content: `包含题型：\n${gradeInfo.tags.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n难度：${'⭐'.repeat(gradeInfo.difficulty)}`,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 快速进入上次年级
  quickEnter: function() {
    if (this.data.lastGrade) {
      // 复用 selectGrade 逻辑，这样快速进入也能享受到模式分流
      this.selectGrade({
        currentTarget: {
          dataset: { grade: this.data.lastGrade.grade }
        }
      });
    }
  },

  // 生成难度星星
  getDifficultyStars: function(level) {
    return '⭐'.repeat(level);
  }
});