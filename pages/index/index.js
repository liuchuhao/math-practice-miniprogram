// pages/index/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    welcomeText: '欢迎使用',
    version: 'v1.0.0',
    // 用户信息（新增）
    userInfo: {
      avatarUrl: '', // 默认空，前端显示默认图
      nickName: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('首页加载完成');
    // 读取本地存储的用户信息，回显头像和昵称
    const localInfo = wx.getStorageSync('userInfo');
    if (localInfo) {
      this.setData({ userInfo: localInfo });
    }
  },

  // ==========================================
  // >>> 新增功能：头像与昵称设置 <<<
  // ==========================================

  /**
   * 当用户选择头像时触发
   */
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    
    // 1. 先在界面上显示刚才选的图（提升体验）
    this.setData({
      'userInfo.avatarUrl': avatarUrl
    });

    // 2. 马上上传到你的服务器
    wx.showLoading({ title: '保存头像中...' });
    
    wx.uploadFile({
      url: 'https://lch97.cn/math_api/upload_img.php', // 你的PHP上传接口
      filePath: avatarUrl,
      name: 'file',
      success: (res) => {
        wx.hideLoading();
        // uploadFile返回的是字符串，需要解析成JSON
        try {
          const data = JSON.parse(res.data);
          
          if (data.code === 200) {
            const serverUrl = data.url;
            console.log('头像上传成功，永久地址：', serverUrl);
            
            // 更新数据为服务器地址
            this.setData({
              'userInfo.avatarUrl': serverUrl
            });
            
            // 保存到本地，供练习页面使用
            this.saveToLocal();
            
            wx.showToast({ title: '头像已更新', icon: 'success' });
          } else {
            wx.showToast({ title: '上传失败', icon: 'none' });
            console.error('服务器返回错误:', data);
          }
        } catch (e) {
          console.error('解析JSON失败', e);
          wx.showToast({ title: '服务器异常', icon: 'none' });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('上传网络错误', err);
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  /**
   * 当用户输入/选择昵称时触发 (失焦或回车)
   */
  onNicknameChange(e) {
    const nickName = e.detail.value;
    if (!nickName) return;

    this.setData({
      'userInfo.nickName': nickName
    });
    this.saveToLocal();
    console.log('昵称已更新:', nickName);
  },

  /**
   * 监听昵称实时输入 (可选，用于处理一些即时逻辑)
   */
  onNicknameInput(e) {
    // 暂时不需要做什么，主要靠 bindblur 保存
  },

  /**
   * 保存信息到本地缓存
   */
  saveToLocal() {
    wx.setStorageSync('userInfo', this.data.userInfo);
  },

  // ==========================================
  // >>> 原有业务逻辑 <<<
  // ==========================================

  /**
   * 开始练习
   */
  startPractice: function() {
    console.log('开始练习');
    
    // 可选优化：提醒未设置昵称的用户
    if (!this.data.userInfo.nickName) {
      wx.showToast({
        title: '建议先设置昵称哦',
        icon: 'none',
        duration: 2000
      });
      // 这里不return，允许没昵称也能练，只是提醒一下
    }
    
    wx.showLoading({ title: '加载中...', mask: true });
    
    setTimeout(() => {
      wx.hideLoading();
      // 跳转到年级选择页面
      wx.navigateTo({
        url: '/pages/gradeSelect/gradeSelect',
        fail: (err) => {
          console.error('跳转失败:', err);
          wx.showToast({ title: '跳转失败', icon: 'none' });
        }
      });
    }, 300); // 稍微缩短等待时间，提升体验
  },

  /**
   * 查看历史记录
   */
  viewHistory: function() {
    console.log('查看历史记录');
    wx.navigateTo({
      url: '/pages/history/history'
    });
  },

  /**
   * 跳转到试卷生成页面
   */
  goToGradeTestPaper: function() {
    wx.navigateTo({
      url: '/pages/testChoose/testChoose'
    });
  },

  /**
   * 跳转到计算比赛 (排行榜)
   */
  goToRank: function() {
    wx.navigateTo({
      url: '/pages/math_rank/math_rank'
    });
  },

  /**
   * 关于我们
   */
  about: function() {
    wx.showModal({
      title: '关于小学数学计算练习',
      content: '版本：v4.0.0\n\n公众号：刘叔数学训练\n邮箱:8843326@qq.com\n本程序由Adam.Liu（刘叔）独立开发',
      showCancel: false,
      confirmText: '知道啦',
      confirmColor: '#3498db'
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // 下拉刷新时可以重新读取一下本地缓存，或者同步服务器数据
    const localInfo = wx.getStorageSync('userInfo');
    if (localInfo) {
      this.setData({ userInfo: localInfo });
    }
    
    setTimeout(() => {
      wx.stopPullDownRefresh();
      wx.showToast({ title: '刷新成功', icon: 'none' });
    }, 500);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '小学数学计算练习，快来和我比一比！',
      path: '/pages/index/index',
      imageUrl: '/images/share.png' // 确保你有这个图片，或者删掉这行用默认截图
    };
  }
});