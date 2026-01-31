const MathGen = require('../../utils/mathGenerator.js');

const GRADES = ['Grade1', 'Grade2', 'Grade3', 'Grade4', 'Grade5', 'Grade6'];
const NAMES = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'];

Page({
  data: {
    gradeList: NAMES,
    gradeIndex: 0,
    currentGradeKey: 'Grade1',
    
    activeTab: 'config',
    paperTitle: '小学数学练习卷',
    
    currentConfig: [],
    questions: [],
    userAnswers: {},
    
    totalCount: 0,
    totalScore: 0,
    score: 0,
    showScore: false
  },

  onLoad() {
    this.initData(0);
  },

  // 初始化年级配置
  initData(idx) {
    const key = GRADES[idx];
    const defaultConfig = MathGen.GRADE_CONFIGS[key];
    // 深拷贝，避免污染
    const config = JSON.parse(JSON.stringify(defaultConfig));
    
    this.setData({
      gradeIndex: idx,
      currentGradeKey: key,
      paperTitle: `${NAMES[idx]}数学计算练习卷`,
      currentConfig: config,
      questions: [],
      userAnswers: {},
      showScore: false,
      activeTab: 'config'
    });
    this.calcTotal();
  },

  onGradeChange(e) {
    this.initData(e.detail.value);
  },

  updateCount(e) {
    const idx = e.currentTarget.dataset.index;
    let val = parseInt(e.detail.value) || 0;
    if (val < 0) val = 0;
    if (val > 50) val = 50;
    
    this.setData({
      [`currentConfig[${idx}].count`]: val
    }, () => this.calcTotal());
  },

  calcTotal() {
    let c = 0, s = 0;
    this.data.currentConfig.forEach(i => {
      c += parseInt(i.count);
      s += parseInt(i.count) * parseInt(i.score);
    });
    this.setData({ totalCount: c, totalScore: s });
  },

  onTitleInput(e) { this.setData({ paperTitle: e.detail.value }); },
  switchTab(e) { this.setData({ activeTab: e.currentTarget.dataset.tab }); },
  switchToConfig() { this.setData({ activeTab: 'config', showScore: false }); },

  // 生成试卷
  generatePaper() {
    wx.showLoading({ title: '出题中' });
    setTimeout(() => {
      try {
        const qs = MathGen.generatePaper(this.data.currentGradeKey, this.data.currentConfig);
        this.setData({
          questions: qs,
          userAnswers: {},
          showScore: false,
          activeTab: 'preview'
        });
        wx.hideLoading();
      } catch (e) {
        wx.hideLoading();
        wx.showToast({ title: '生成失败', icon: 'none' });
        console.error(e);
      }
    }, 500);
  },

  onInputAnswer(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ [`userAnswers.${id}`]: e.detail.value });
  },

  // 判分
  checkAnswers() {
    if (this.data.questions.length === 0) return;
    
    let score = 0;
    const checkedQs = this.data.questions.map(q => {
      const uAns = this.data.userAnswers[q.id];
      // 调用工具类的标准化方法
      const normU = MathGen.normalizeAnswer(uAns);
      const normA = MathGen.normalizeAnswer(q.answer);
      const isCorrect = (normU == normA);
      
      if (isCorrect) score += q.score;
      return { ...q, isCorrect };
    });

    this.setData({
      questions: checkedQs,
      score,
      showScore: true,
      activeTab: 'preview' // 停留在试卷页查看结果
    });
    
    // 自动滚动到顶部看分数
    wx.pageScrollTo({ scrollTop: 0 });
  }
});