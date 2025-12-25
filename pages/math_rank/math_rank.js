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
          // 处理一下头像，防止null报错（虽然wxml里也做了处理，双重保险）
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
  startChallenge: function() {
    // 带着当前的年级，直接跳去练习页
    // 注意：这里用 reLaunch 或 redirectTo 可能更好，防止层级太深，
    // 但为了有返回按钮，这里用 navigateTo
    wx.navigateTo({
      // 假设你的练习页路径是这个，参数名字要对应
      url: `/pages/practice/practice?grade=${this.data.curGrade}&gradeName=${this.data.curGrade}年级`
    });
  },

});