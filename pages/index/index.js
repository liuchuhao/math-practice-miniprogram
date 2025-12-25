// pages/index/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    welcomeText: '欢迎使用',
    version: 'v4.0.0',
   
    // 用户信息
    userInfo: {
      avatarUrl: '', // 默认空
      nickName: ''
    },
    nicknameFocus: false // 新增：控制输入框焦点
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('首页加载完成');
    // 读取本地存储的用户信息
    const localInfo = wx.getStorageSync('userInfo');
    if (localInfo) {
      this.setData({ userInfo: localInfo });
    }
  },

  // ==========================================
  // >>> 头像与昵称设置逻辑 <<<
  // ==========================================

  /**
   * 选择头像
   */
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    
    // 1. 界面回显
    this.setData({
      'userInfo.avatarUrl': avatarUrl
    });

    // 2. 上传服务器
    wx.showLoading({ title: '保存头像中...' });
    
    wx.uploadFile({
      url: 'https://lch97.cn/math_api/upload_img.php', 
      filePath: avatarUrl,
      name: 'file',
      success: (res) => {
        wx.hideLoading();
        try {
          const data = JSON.parse(res.data);
          if (data.code === 200) {
            const serverUrl = data.url;
            console.log('头像上传成功：', serverUrl);
            this.setData({ 'userInfo.avatarUrl': serverUrl });
            this.saveToLocal(); // 保存
            wx.showToast({ title: '头像已更新', icon: 'success' });
          } else {
            wx.showToast({ title: '上传失败', icon: 'none' });
          }
        } catch (e) {
          console.error('JSON解析失败', e);
          wx.showToast({ title: '服务器异常', icon: 'none' });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  /**
   * 昵称改变
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

  onNicknameInput(e) { },

  saveToLocal() {
    wx.setStorageSync('userInfo', this.data.userInfo);
  },

  // ==========================================
  // >>> 核心业务逻辑 (已优化) <<<
  // ==========================================

  /**
   * 开始练习 (优化版：增加弹窗引导)
   */
  startPractice: function() {
    console.log('点击开始练习');
    
    // 检查是否有昵称
    if (!this.data.userInfo.nickName) {
      // 如果没有昵称，弹出模态框
      wx.showModal({
        title: '等等！你是神秘人吗？',
        content: '设置一个响亮的昵称，上榜之后更帅气哦！',
        cancelText: '匿名挑战', // 用户选这个就直接开始
        confirmText: '去设置',   // 用户选这个就聚焦输入框
        confirmColor: '#3498db',
        success: (res) => {
          if (res.confirm) {
            // 用户点击"去设置" -> 聚焦输入框
            this.setData({ nicknameFocus: true });
          } else {
            // 用户点击"匿名挑战" -> 直接进入
            this.goGradeSelect();
          }
        }
      });
    } else {
      // 有昵称 -> 直接进入
      this.goGradeSelect();
    }
  },

  /**
   * 提取出来的跳转函数，避免代码重复
   */
  goGradeSelect: function() {
    wx.showLoading({ title: '准备中...', mask: true });
    
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
    }, 200);
  },

  /**
   * 查看历史记录
   */
  viewHistory: function() {
    wx.navigateTo({
      url: '/pages/history/history'
    });
  },

  /**
   * 跳转到试卷生成
   */
  goToGradeTestPaper: function() {
    wx.navigateTo({
      url: '/pages/testChoose/testChoose'
    });
  },

  /**
   * 跳转到排行榜
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
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    const localInfo = wx.getStorageSync('userInfo');
    if (localInfo) {
      this.setData({ userInfo: localInfo });
    }
    setTimeout(() => {
      wx.stopPullDownRefresh();
      wx.showToast({ title: '刷新成功', icon: 'none' });
    }, 500);
  },

  onShareAppMessage: function () {
    return {
      title: '小学数学计算练习，快来和我比一比！',
      path: '/pages/index/index',
      imageUrl: '/images/share.png' 
    };
  }
});