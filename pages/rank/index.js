/**
 * 排行榜主页面
 */
Page({
  data: {
    mainTab: 0,  // 0: 在线排行(默认), 1: 本地战绩
    mainTabs: [
      { id: 0, name: '在线排行', icon: '🏆' },
      { id: 1, name: '本地战绩', icon: '📊' }
    ],
    pageReady: false,
    initialParams: null,
    localParams: null
  },

  onLoad(options) {
    if (options.tab) {
      this.setData({ mainTab: parseInt(options.tab) });
    }
    // 2. ✨ 新增：如果带了 grade 或 type 参数，存起来
    if (options.grade || options.type) {
      this.setData({
        initialParams: {
          grade: options.grade ? parseInt(options.grade) : 1,
          type: options.type || 'basic'
        }
      });
    }
    // 3. ✨ 新增：处理本地战绩的子Tab参数
    if (options.sub) {
      this.setData({
        localParams: {
          tab: parseInt(options.sub)
        }
      });
    }
    
    // 延迟显示，避免卡顿
    setTimeout(() => {
      this.setData({ pageReady: true });
    }, 100);
  },
  
  switchMainTab(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    if (id === this.data.mainTab) return;
    this.setData({ mainTab: id });
  },
  
  onPullDownRefresh() {
    if (this.data.mainTab === 0) {
      const onlineRank = this.selectComponent('#onlineRank');
      if (onlineRank) onlineRank.refresh();
    } else {
      const localRank = this.selectComponent('#localRank');
      if (localRank) localRank.loadData();
    }
    setTimeout(() => wx.stopPullDownRefresh(), 500);
  },

  onShareAppMessage() {
    return {
      title: '🏆 来看看谁是计算之王！',
      path: '/pages/rank/index'
    };
  }
});