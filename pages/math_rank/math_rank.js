// pages/math_rank/math_rank.js
Page({
  data: {
    curGrade: 1, 
    curTab: 0,   // 0: 实时榜(默认左侧), 1: 高手榜(右侧)
    rankList: []
  },

  onLoad: function (options) {
    this.getRankData();
  },

  switchTab: function(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    if (index === this.data.curTab) return;

    this.setData({
      curTab: index,
      rankList: [] 
    });
    this.getRankData();
  },

  changeGrade: function(e) {
    let grade = e.currentTarget.dataset.grade;
    if (grade === this.data.curGrade) return;

    this.setData({
      curGrade: grade,
      rankList: [] 
    });
    this.getRankData();
  },

  // 获取数据
  getRankData: function() {
    const grade = this.data.curGrade;
    
    // [修改核心] 现在 Index 1 才是高手榜
    const isBestRank = (this.data.curTab === 1); 

    wx.showLoading({ title: '加载榜单...' });

    wx.request({
      url: 'https://lch97.cn/math_api/get_rank.php', 
      method: 'GET',
      data: { grade: grade },
      success: (res) => {
        if (res.data.code === 200) {
          let rawList = res.data.data;
          let finalList = [];

          rawList = rawList.map((item, index) => {
             if(!item.avatar) item.avatar = '/images/default_avatar.png';
             item.uniqueKey = 'rank_' + index; 
             return item;
          });

          if (isBestRank) {
            // === 模式 1：高手榜 (去重 + 去匿名) ===
            const uniqueMap = new Map();
            rawList.forEach(item => {
              if (!item.nickname || item.nickname.trim() === '') return;
              if (!uniqueMap.has(item.nickname)) {
                uniqueMap.set(item.nickname, true);
                finalList.push(item);
              }
            });

          } else {
            // === 模式 0：实时榜 (原样显示) ===
            finalList = rawList;
          }

          this.setData({ rankList: finalList });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络开小差了', icon: 'none' });
      },
      complete: () => {
        wx.hideLoading();
        wx.stopPullDownRefresh(); 
      }
    });
  },

  onPullDownRefresh: function() {
    this.getRankData();
  },

  // 分享文案逻辑也需要对应调整
  onShareAppMessage: function() {
    // 0是实时榜，1是高手榜
    const title = this.data.curTab === 1
      ? `谁是${this.data.curGrade}年级计算之王？快来看高手榜！` 
      : '实时战况激烈，快来看看谁上榜了！';
      
    return {
      title: title,
      path: '/pages/math_rank/math_rank'
    }
  },

  // 开始挑战逻辑不变
  startChallenge: function() {
    const userInfo = wx.getStorageSync('userInfo');
    const hasUserInfo = userInfo && userInfo.nickName && userInfo.avatarUrl;

    if (hasUserInfo) {
      this.navigateToPractice();
    } else {
      wx.showModal({
        title: '温馨提示',
        content: '您还没有设置昵称和头像，成绩将无法计入【高手榜】哦。（实时榜仍可记录）',
        cancelText: '匿名挑战',
        confirmText: '去设置',
        confirmColor: '#007aff',
        success: (res) => {
          if (res.confirm) {
            wx.reLaunch({
              url: '/pages/index/index',
              fail: (err) => { console.error('跳转失败', err); }
            });
          } else if (res.cancel) {
            this.navigateToPractice();
          }
        }
      });
    }
  },

  navigateToPractice: function() {
    wx.navigateTo({
      url: `/pages/practice/practice?grade=${this.data.curGrade}&gradeName=${this.data.curGrade}年级`
    });
  }
});