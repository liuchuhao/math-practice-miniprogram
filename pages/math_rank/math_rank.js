// pages/math_rank/math_rank.js
Page({
  data: {
    curGrade: 1, // 默认一年级
    rankList: []
  },

  onLoad: function (options) {
    this.getRankData(1);
  },

  // 切换年级
  changeGrade: function(e) {
    let grade = e.currentTarget.dataset.grade;
    if (grade === this.data.curGrade) return;

    this.setData({
      curGrade: grade,
      rankList: [] // 清空列表，避免显示错乱
    });
    this.getRankData(grade);
  },

  // 获取数据
  getRankData: function(grade) {
    wx.showLoading({ title: '加载榜单...' });

    wx.request({
      url: 'https://lch97.cn/math_api/get_rank.php', 
      method: 'GET',
      data: { grade: grade },
      success: (res) => {
        console.log('排行榜数据:', res.data);
        if (res.data.code === 200) {
          // 处理一下头像，防止null报错
          const list = res.data.data.map(item => {
            if(!item.avatar) item.avatar = '/images/default_avatar.png';
            return item;
          });

          this.setData({ rankList: list });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络开小差了', icon: 'none' });
      },
      complete: () => {
        wx.hideLoading();
        wx.stopPullDownRefresh(); // 停止下拉动画
      }
    });
  },

  // 下拉刷新功能
  onPullDownRefresh: function() {
    this.getRankData(this.data.curGrade);
  },

  // 分享功能
  onShareAppMessage: function() {
    return {
      title: '谁是计算小能手？快来看看排行榜！',
      path: '/pages/math_rank/math_rank'
    }
  },

  // ============================================
  // >>> 修改核心：开始挑战逻辑 <<<
  // ============================================
  startChallenge: function() {
    // 1. 获取本地存储的用户信息
    const userInfo = wx.getStorageSync('userInfo');

    // 2. 判断是否有昵称和头像
    const hasUserInfo = userInfo && userInfo.nickName && userInfo.avatarUrl;

    if (hasUserInfo) {
      // A. 信息齐全 -> 直接去练习
      this.navigateToPractice();
    } else {
      // B. 信息不全 -> 弹窗提示
      wx.showModal({
        title: '温馨提示',
        content: '您还没有设置昵称和头像，本次成绩将无法计入排行榜哦。',
        cancelText: '匿名挑战',
        confirmText: '去设置',
        confirmColor: '#007aff',
        success: (res) => {
          if (res.confirm) {
            // --- 修改点：使用 reLaunch 强力跳转 ---
            wx.reLaunch({
              url: '/pages/index/index',
              fail: (err) => {
                // 如果还跳不过去，这里会打印错误原因
                console.error('跳转失败详情：', err);
                wx.showToast({ title: '跳转失败，请手动返回', icon: 'none' });
              }
            });
          } else if (res.cancel) {
            // 点击匿名挑战
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