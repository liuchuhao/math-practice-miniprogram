// pages/history/history.js
Page({
  data: {
    // === Tab 控制 ===
    currentTab: 0, // 0: 练习记录, 1: 错题本

    // === 练习记录数据 ===
    totalCount: 0,
    averageRate: 0,
    totalTime: '00:00',
    historyList: [],
    filteredHistory: [],
    activeGrade: 0, // 0表示全部
    sortType: 'date',
    hasMore: false,
    pageSize: 10,
    page: 1,

    // === 错题本数据 ===
    mistakeList: [], // 错题列表
    mistakeCount: 0
  },

  onLoad: function() {
    this.loadPracticeHistory();
    this.loadMistakeBook(); // 加载错题
  },

  onShow: function() {
    // 每次显示页面都刷新一下，防止在其他页面产生了新记录
    this.loadPracticeHistory();
    this.loadMistakeBook();
  },

  // ==========================
  // >>> Tab 切换逻辑 <<<
  // ==========================
  switchTab: function(e) {
    const idx = parseInt(e.currentTarget.dataset.index);
    this.setData({ currentTab: idx });
  },

  // ==========================
  // >>> 错题本核心逻辑 <<<
  // ==========================
  
  /**
   * 加载错题本
   */
  loadMistakeBook: function() {
    // 获取本地存储的错题 (需要在 practice.js 里保存)
    let mistakes = wx.getStorageSync('mistakeList') || [];
    this.setData({
      mistakeList: mistakes,
      mistakeCount: mistakes.length
    });
  },

  /**
   * 移除错题 (消灭错题)
   */
  removeMistake: function(e) {
    const index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '移除错题',
      content: '确定这道题已经学会了吗？',
      success: (res) => {
        if (res.confirm) {
          const list = this.data.mistakeList;
          list.splice(index, 1); // 删除
          
          this.setData({ 
            mistakeList: list,
            mistakeCount: list.length
          });
          wx.setStorageSync('mistakeList', list); // 更新缓存
          wx.showToast({ title: '已移除', icon: 'success' });
        }
      }
    });
  },

  /**
   * 一键清空错题
   */
  clearMistakes: function() {
    wx.showModal({
      title: '清空错题本',
      content: '确定要清空所有错题吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ mistakeList: [], mistakeCount: 0 });
          wx.removeStorageSync('mistakeList');
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  },

  // ==========================
  // >>> 原有的练习记录逻辑 <<<
  // ==========================
  
  loadPracticeHistory: function() {
    let history = wx.getStorageSync('practiceHistory') || [];
    
    // 【核心修复】数据清洗：给旧数据补上 ID
    // 防止旧数据没有 id 导致列表切换时报错
    history = history.map((item, index) => {
      if (!item.id) {
        // 如果没有ID，用时间戳+索引生成一个
        item.id = `legacy_${Date.now()}_${index}`; 
      }
      return item;
    });

    this.setData({ historyList: history });
    this.calculateStats(history);
    this.applyFilters();
  },

  calculateStats: function(list) {
    if (list.length === 0) {
      this.setData({ totalCount: 0, averageRate: 0, totalTime: '00:00' });
      return;
    }
    const totalRate = list.reduce((sum, item) => sum + (item.correctRate || 0), 0);
    // 简单估算总时间
    let totalSeconds = list.reduce((sum, item) => {
      const parts = (item.time || '00:00').split(':');
      return sum + parseInt(parts[0])*60 + parseInt(parts[1]);
    }, 0);
    
    // 格式化总时间 (小时:分钟)
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const timeStr = hours > 0 ? `${hours}小时${mins}分` : `${mins}分钟`;

    this.setData({
      totalCount: list.length,
      averageRate: Math.round(totalRate / list.length),
      totalTime: timeStr
    });
  },

  filterByGrade: function(e) {
    this.setData({ activeGrade: parseInt(e.currentTarget.dataset.grade) });
    this.applyFilters();
  },

  changeSort: function(e) {
    this.setData({ sortType: e.currentTarget.dataset.type });
    this.applyFilters();
  },

  applyFilters: function() {
    let list = [...this.data.historyList];
    
    // 1. 年级筛选
    if (this.data.activeGrade > 0) {
      list = list.filter(item => item.grade === this.data.activeGrade);
    }

    // 2. 排序
    if (this.data.sortType === 'score') {
      list.sort((a, b) => b.score - a.score);
    } else if (this.data.sortType === 'rate') {
      list.sort((a, b) => b.correctRate - a.correctRate);
    } else {
      // 默认按时间倒序 (虽然存储时已经是倒序，但保险起见)
      // 假设 item.timestamp 存在，或者依赖数组顺序
    }

    this.setData({ filteredHistory: list });
  },

  // 清空练习记录
  showClearConfirm: function() {
    wx.showModal({
      title: '警告',
      content: '确定清空所有练习记录吗？不可恢复。',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('practiceHistory');
          this.loadPracticeHistory();
        }
      }
    });
  },

  // 辅助函数
  formatDate: function(str) { return str ? str.split(' ')[0] : ''; },
  formatTime: function(str) { return str ? str.split(' ')[1] : ''; },
  getRateColor: function(rate) {
    if(rate >= 90) return '#2ecc71';
    if(rate >= 60) return '#f39c12';
    return '#e74c3c';
  }
});