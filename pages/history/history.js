// pages/history/history.js
Page({
  data: {
    // 原始历史数据
    history: [],
    // 筛选后的数据
    filteredHistory: [],
    // 筛选条件
    activeGrade: 0, // 0表示全部
    sortType: 'date', // date:时间 score:分数 rate:正确率
    // 分页
    currentPage: 1,
    pageSize: 10,
    hasMore: true,
    // 统计数据
    totalCount: 0,
    averageRate: 0,
    totalTime: '00:00'
  },

  onLoad(options) {
    this.loadHistoryData();
  },

  onShow() {
    this.loadHistoryData();
  },

  onPullDownRefresh() {
    this.loadHistoryData();
    wx.stopPullDownRefresh();
  },

  onShareAppMessage() {
    return {
      title: '我的数学练习记录',
      path: '/pages/history/history'
    };
  },

  // 加载历史数据
  loadHistoryData() {
    try {
      const history = wx.getStorageSync('practiceHistory') || [];
      const stats = this.calculateStatistics(history);
      
      this.setData({
        history: history,
        totalCount: history.length,
        averageRate: stats.averageRate,
        totalTime: stats.totalTime,
        currentPage: 1,
        hasMore: history.length > this.data.pageSize
      }, () => {
        this.applyFilters();
      });
    } catch (error) {
      console.error('加载历史数据失败', error);
      wx.showToast({ title: '加载失败', icon: 'error' });
    }
  },

  // 计算统计数据
  calculateStatistics(history) {
    if (history.length === 0) {
      return { averageRate: 0, totalTime: '00:00' };
    }

    let totalRate = 0;
    let totalSeconds = 0;
    let validRecords = 0;

    history.forEach(item => {
      // correctRate 现在已经是数字，直接累加
      if (typeof item.correctRate === 'number') {
        totalRate += item.correctRate;
        validRecords++;
      }
      
      // 计算总用时
      if (item.time) {
        const timeParts = item.time.split(':');
        if (timeParts.length >= 2) {
          const minutes = parseInt(timeParts[0]) || 0;
          const seconds = parseInt(timeParts[1]) || 0;
          totalSeconds += minutes * 60 + seconds;
        }
      }
    });

    const averageRate = validRecords > 0 ? Math.round(totalRate / validRecords) : 0;
    
    // 格式化总用时
    let totalTime = '';
    if (totalSeconds >= 3600) {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      totalTime = `${hours}小时${minutes}分钟`;
    } else if (totalSeconds > 0) {
      const minutes = Math.ceil(totalSeconds / 60);
      totalTime = `${minutes}分钟`;
    } else {
      totalTime = '00:00';
    }

    return { averageRate, totalTime };
  },

  // 应用筛选和排序
  applyFilters() {
    const { history, activeGrade, sortType, currentPage, pageSize } = this.data;
    
    // 1. 年级筛选
    let filtered = history;
    if (activeGrade !== 0) {
      filtered = history.filter(item => item.grade === activeGrade);
    }
    
    // 2. 排序
    filtered.sort((a, b) => {
      switch (sortType) {
        case 'score':
          return (b.score || 0) - (a.score || 0);
        case 'rate':
          return (b.correctRate || 0) - (a.correctRate || 0);
        case 'date':
        default:
          return (b.timestamp || 0) - (a.timestamp || 0);
      }
    });
    
    // 3. 分页
    const startIndex = 0;
    const endIndex = currentPage * pageSize;
    const paginatedData = filtered.slice(startIndex, endIndex);
    
    this.setData({
      filteredHistory: paginatedData,
      hasMore: endIndex < filtered.length
    });
  },

  // 年级筛选
  filterByGrade(e) {
    const grade = parseInt(e.currentTarget.dataset.grade);
    this.setData({
      activeGrade: grade,
      currentPage: 1
    }, () => {
      this.applyFilters();
    });
  },

  // 更改排序方式
  changeSort(e) {
    const sortType = e.currentTarget.dataset.type;
    this.setData({
      sortType: sortType,
      currentPage: 1
    }, () => {
      this.applyFilters();
    });
  },

  // 加载更多
  loadMore() {
    if (!this.data.hasMore) return;
    
    this.setData({
      currentPage: this.data.currentPage + 1
    }, () => {
      this.applyFilters();
    });
  },

  // 格式化日期显示
  formatDate(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString.split(' ')[0] || dateString;
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const diffDays = Math.round((today - targetDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return '今天';
      if (diffDays === 1) return '昨天';
      if (diffDays === 2) return '前天';
      if (diffDays < 7) return `${diffDays}天前`;
      
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    } catch (error) {
      return dateString;
    }
  },

  // 格式化时间显示
  formatTime(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        const timePart = dateString.split(' ')[1];
        return timePart || '';
      }
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch (error) {
      return '';
    }
  },

  // 获取正确率对应的颜色
  getRateColor(rate) {
    if (!rate && rate !== 0) return '#e74c3c';
    if (rate >= 90) return '#2ecc71';
    if (rate >= 80) return '#3498db';
    if (rate >= 70) return '#f39c12';
    if (rate >= 60) return '#e67e22';
    return '#e74c3c';
  },

  // 查看详情
  viewDetail(e) {
    const index = e.currentTarget.dataset.index;
    const record = this.data.filteredHistory[index];
    
    wx.showModal({
      title: '练习详情',
      content: this.generateDetailContent(record),
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 生成详情内容
  generateDetailContent(record) {
    return [
      `年级：${record.gradeName || record.grade + '年级'}`,
      `得分：${record.score || 0}/${record.total || 0}`,
      `正确：${record.correctCount || 0}题`,
      `错误：${record.wrongCount || 0}题`,
      `正确率：${record.correctRate || 0}%`,
      `用时：${record.time || '00:00'}`,
      `平均每题用时：${record.averageTime || '0'}秒`,
      `日期：${record.date || '未知'}`
    ].join('\n');
  },

  // 重新练习（回顾）
  reviewPractice(e) {
    const index = e.currentTarget.dataset.index;
    const record = this.data.filteredHistory[index];
    
    wx.showModal({
      title: '重新练习',
      content: `确定要重新开始${record.gradeName || record.grade + '年级'}的练习吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.redirectTo({
            url: `/pages/practice/practice?grade=${record.grade}&gradeName=${encodeURIComponent(record.gradeName || record.grade + '年级')}`
          });
        }
      }
    });
  },

  // 阻止事件冒泡
  stopPropagation(e) {
    // 空函数，仅用于阻止事件冒泡
  },

  // 清空记录确认
  showClearConfirm() {
    wx.showModal({
      title: '清空记录',
      content: '确定要清空所有练习记录吗？此操作不可恢复。',
      confirmColor: '#e74c3c',
      success: (res) => {
        if (res.confirm) {
          this.clearAllHistory();
        }
      }
    });
  },

  // 清空所有记录
  clearAllHistory() {
    try {
      wx.setStorageSync('practiceHistory', []);
      
      this.setData({
        history: [],
        filteredHistory: [],
        totalCount: 0,
        averageRate: 0,
        totalTime: '00:00',
        hasMore: false
      });
      
      wx.showToast({ title: '已清空', icon: 'success' });
    } catch (error) {
      console.error('清空记录失败', error);
      wx.showToast({ title: '清空失败', icon: 'error' });
    }
  },

  // 去练习
  goPractice() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
});