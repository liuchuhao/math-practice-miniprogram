// pages/math_rank/math_rank.js
Page({
  data: {
    curGrade: 1, 
    curTab: 0,   // 0: 实时榜(默认左侧), 1: 高手榜(右侧)
    rankType: 'basic', // 'basic' (基础) 或 'advanced' (拓展)
    rankList: []
  },

  onLoad: function (options) {
      // 如果有传入 grade，就用传入的，否则默认 1
      const targetGrade = options.grade ? parseInt(options.grade) : 1;
      const targetType = options.type || 'basic'; // 默认为 basic
      this.setData({
        curGrade: targetGrade,
        rankType: targetType,// 设置当前榜单类型
        curTab: 0
      });
    this.getRankData();
  },

  // 1. 切换大类 (基础/拓展)
  changeRankType: function(e) {
    const type = e.currentTarget.dataset.type;
    if (type === this.data.rankType) return;
    
    this.setData({ 
      rankType: type, 
      rankList: [] // 切换时清空防闪烁
    });
    this.getRankData();
  },

  // 2. 切换 Tab (实时/高手)
  switchTab: function(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    if (index === this.data.curTab) return;

    this.setData({
      curTab: index,
      rankList: [] 
    });
    this.getRankData();
  },

  // 3. 切换年级
  changeGrade: function(e) {
    let grade = e.currentTarget.dataset.grade;
    if (grade === this.data.curGrade) return;

    this.setData({
      curGrade: grade,
      rankList: [] 
    });
    this.getRankData();
  },

  // 4. 获取数据
  getRankData: function() {
    const grade = this.data.curGrade;
    const isBestRank = (this.data.curTab === 1); 
    const type = this.data.rankType; // 获取当前是基础还是拓展

    wx.showLoading({ title: '加载榜单...' });

    wx.request({
      url: 'https://lch97.cn/math_api/get_rank.php', 
      method: 'GET',
      data: { 
        grade: grade,
        type: type // [新增] 告诉后端查哪种类型的榜单
      },
      success: (res) => {
        if (res.data.code === 200) {
          let rawList = res.data.data;
          let finalList = [];

          // 处理头像防挂
          rawList = rawList.map((item, index) => {
             if(!item.avatar) item.avatar = '/images/default_avatar.png';
             item.uniqueKey = 'rank_' + index; 
             return item;
          });

          if (isBestRank) {
            // === 高手榜模式 (去重 + 去匿名) ===
            const uniqueMap = new Map();
            rawList.forEach(item => {
              if (!item.nickname || item.nickname.trim() === '') return;
              if (!uniqueMap.has(item.nickname)) {
                uniqueMap.set(item.nickname, true);
                finalList.push(item);
              }
            });
          } else {
            // === 实时榜模式 (原样) ===
            finalList = rawList;
          }

          this.setData({ rankList: finalList });
        } else {
          // 如果后端没数据返回code不是200，或者空数组，也要处理
          this.setData({ rankList: [] });
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

  onShareAppMessage: function() {
    const typeName = this.data.rankType === 'basic' ? '基础' : '拓展';
    const tabName = this.data.curTab === 1 ? '高手榜' : '实时榜';
    
    return {
      title: `谁是${this.data.curGrade}年级${typeName}计算之王？快来看${tabName}！`,
      path: '/pages/math_rank/math_rank'
    }
  },

  // 5. 开始挑战逻辑
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

  // [修改核心] 根据当前榜单类型跳转到对应的练习页
  navigateToPractice: function() {
    const grade = this.data.curGrade;
    
    if (this.data.rankType === 'advanced') {
      // 如果当前看的是拓展榜 -> 跳去拓展练习
      wx.navigateTo({
        url: `/pages/practice_advanced/practice_advanced?grade=${grade}`
      });
    } else {
      // 否则 -> 跳去基础练习
      wx.navigateTo({
        url: `/pages/practice/practice?grade=${grade}&gradeName=${grade}年级`
      });
    }
  }
});