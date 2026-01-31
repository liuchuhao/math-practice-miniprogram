// pages/index/index.js
Page({
  data: {
    welcomeText: '欢迎使用',
    version: 'v4.0.0',
   
    // 用户信息
    userInfo: {
      avatarUrl: '', 
      nickName: ''
    },
    nicknameFocus: false,

    // 积分与称号
    userIntegral: 0,
    userTitle: '新兵',
    nextLevelNeed: 50, 
    currentFrameImg: '' // 相框路径
  },

  // ==========================================
  // 1. 页面显示时触发 (每次回来都会执行)
  // ==========================================
  onShow: function () {
    console.log('--- onShow 触发 ---'); // 确认 onShow 是否运行
    this.loadIntegralInfo();
    this.loadFrame(); // 关键：必须在这里调用
  },

  // ==========================================
  // 2. 加载相框逻辑 (带调试日志)
  // ==========================================
  loadFrame: function() {
    const frameId = wx.getStorageSync('currentFrameId') || 0;
    
    // >>>>>> 调试日志看这里 <<<<<<
    console.log('【调试】当前相框ID:', frameId); 
    
    // 图片数据 (Base64)
    const goodsMap = {
      1: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjY2Q3ZjMyIiBzdHJva2Utd2lkdGg9IjYiIC8+PC9zdmc+",
      2: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYzBjMGMwIiBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZS1kYXNoYXJyYXk9IjEwIDUiIC8+PC9zdmc+",
      3: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utd2lkdGg9IjQiIC8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMzgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0ZGQTUwMCIgc3Ryb2tlLXdpZHRoPSIyIiAvPjwvc3ZnPg==",
      4: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDBCRkZGIiBzdHJva2Utd2lkdGg9IjUiIG9wYWNpdHk9IjAuNiIgLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDBCRkZGIiBzdHJva2Utd2lkdGg9IjIiIC8+PHBhdGggZD0iTTUwIDIgTDU1IDEyIEw0NSAxMiBaIiBmaWxsPSIjMDBCRkZGIiAvPjwvc3ZnPg==",
      5: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOTQwMEQzIiBzdHJva2Utd2lkdGg9IjYiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkYwMEZGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1kYXNoYXJyYXk9IjEwIDUiLz48L3N2Zz4="
    };

    if (frameId && goodsMap[frameId]) {
      console.log('【调试】找到图片，正在设置');
      this.setData({ currentFrameImg: goodsMap[frameId] });
    } else {
      console.log('【调试】无佩戴或图片不存在');
      this.setData({ currentFrameImg: '' });
    }
  },

  // ==========================================
  // 3. 页面加载 (只执行一次)
  // ==========================================
  onLoad: function (options) {
    console.log('首页加载完成');
    
    // --- 🎁 临时送分代码 (测试完后删除) ---
    // wx.setStorageSync('totalIntegral', 10000); 

    const localInfo = wx.getStorageSync('userInfo');
    if (localInfo) {
      this.setData({ userInfo: localInfo });
    }
    // 这里也加载一次，以防万一
    this.loadIntegralInfo();
    this.loadFrame(); 
  },

  // ==========================================
  // 下面是其他业务逻辑，保持不变
  // ==========================================

  loadIntegralInfo: function() {
    const total = wx.getStorageSync('totalIntegral') || 0;
    const { title, nextNeed } = this.calculateTitle(total);
    this.setData({
      userIntegral: total,
      userTitle: title,
      nextLevelNeed: nextNeed
    });
  },

  calculateTitle: function(score) {
    const ranks = [
      { s: 45000, t: '五星上将' },
      { s: 40000, t: '上将' },
      { s: 35000, t: '中将' },
      { s: 30000, t: '少将' },
      { s: 25000, t: '准将' },
      { s: 22000, t: '上校' },
      { s: 19000, t: '中校' },
      { s: 16000, t: '少校' },
      { s: 13000, t: '上尉' },
      { s: 10000, t: '中尉' },
      { s: 8000,  t: '少尉' },
      { s: 6000,  t: '六级士官' },
      { s: 5000,  t: '五级士官' },
      { s: 4000,  t: '四级士官' },
      { s: 3000,  t: '三级士官' },
      { s: 2000,  t: '二级士官' },
      { s: 1000,  t: '一级士官' },
      { s: 500,   t: '上等兵' }
    ];

    let title = '新兵'; 
    let nextNeed = 50 - score; 

    for (let i = 0; i < ranks.length; i++) {
      if (score >= ranks[i].s) {
        title = ranks[i].t;
        if (i > 0) {
          nextNeed = ranks[i-1].s - score;
        } else {
          nextNeed = 0; 
        }
        break;
      }
    }
    if (score < 50) { nextNeed = 50 - score; }
    return { title, nextNeed };
  },

  showRankRules: function() {
    const content = '【积分获取规则】\n完成练习且分数>0，即可获得积分...\n(略)'; 
    wx.showModal({
      title: '🎖️ 军衔与积分说明',
      content: content,
      showCancel: false,
      confirmText: '我明白了',
      confirmColor: '#3498db'
    });
  },

  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    this.setData({ 'userInfo.avatarUrl': avatarUrl });
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
            this.setData({ 'userInfo.avatarUrl': data.url });
            this.saveToLocal(); 
            wx.showToast({ title: '头像已更新', icon: 'success' });
          } else {
            wx.showToast({ title: '上传失败', icon: 'none' });
          }
        } catch (e) {
          wx.showToast({ title: '服务器异常', icon: 'none' });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  onNicknameInput(e) {
    const val = e.detail.value;
    this.setData({ 'userInfo.nickName': val });
  },

  onNicknameChange(e) {
    let nickName = e.detail.value || '';
    if (!nickName.trim()) {
      this.setData({ 'userInfo.nickName': '' });
      return;
    }
    const len = this.getStrLength(nickName);
    if (len > 12) {
      const cutName = this.subStringByLength(nickName, 12);
      this.setData({ 'userInfo.nickName': cutName });
      wx.showToast({ title: '昵称过长已自动截断', icon: 'none', duration: 2000 });
      nickName = cutName; 
    } else {
      this.setData({ 'userInfo.nickName': nickName });
    }
    this.saveToLocal();
  },

  getStrLength: function (str) {
    let len = 0;
    for (let i = 0; i < str.length; i++) {
      if (str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94) {
        len += 2;
      } else {
        len++;
      }
    }
    return len;
  },

  subStringByLength: function (str, targetLen) {
    let len = 0;
    let result = "";
    for (let i = 0; i < str.length; i++) {
      if (str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94) {
        len += 2;
      } else {
        len++;
      }
      if (len > targetLen) { break; }
      result += str.charAt(i);
    }
    return result;
  },

  saveToLocal() {
    wx.setStorageSync('userInfo', this.data.userInfo);
  },

      // --- 1. 普通练习入口 ---
  startPractice: function() {
    // 传入 'normal' 标记，代表普通练习
    this.checkNicknameAndGo('normal'); 
  },

  // --- 2. 拓展练习入口 ---
  startAdvancedPractice: function() {
    // 传入 'advanced' 标记，代表拓展练习
    this.checkNicknameAndGo('advanced'); 
  },

  // --- 3. [核心修复] 通用检查昵称与跳转逻辑 ---
  // type 参数用于区分要去哪个功能
  checkNicknameAndGo: function(type) {
    // 定义一个执行跳转的内部函数
    const doNavigate = () => {
      if (type === 'games') {
        // -> 跳转游戏大厅
        wx.navigateTo({
          url: '/pages/math_game/menu/menu',
          fail: (err) => {
            console.error('跳转失败', err);
            wx.showToast({ title: '功能开发中', icon: 'none' });
          }
        });
      } else if (type === 'brain') {
        // -> 跳转大脑开发
        wx.navigateTo({
          url: '/pages/brain-dev/menu/menu'
        });
      } else {
        // -> 默认为练习模式，跳转年级选择
        // 如果是 advanced，传递给 goGradeSelect，否则传 undefined
        this.goGradeSelect(type === 'advanced' ? 'advanced' : undefined);
      }
    };

    // 检查是否有昵称
    if (!this.data.userInfo.nickName) {
      wx.showModal({
        title: '等等！你是神秘人吗？',
        content: '设置一个响亮的昵称，上榜之后更帅气哦！',
        cancelText: '匿名挑战',
        confirmText: '去设置',
        confirmColor: '#3498db',
        success: (res) => {
          if (res.confirm) {
            // 用户想设置昵称
            this.setData({ nicknameFocus: true });
          } else {
            // 用户选择匿名 -> 执行跳转
            doNavigate();
          }
        }
      });
    } else {
      // 已有昵称 -> 直接执行跳转
      doNavigate();
    }
  },

  // --- 4. 跳转年级选择 (保持不变，但被上方调用) ---
  goGradeSelect: function(mode) {
    wx.showLoading({ title: '准备中...', mask: true });
    
    setTimeout(() => {
      wx.hideLoading();
      
      // 默认 URL
      let targetUrl = '/pages/gradeSelect/gradeSelect';
      
      // 如果是拓展模式，加上参数
      if (mode === 'advanced') {
        targetUrl += '?mode=advanced';
      }
  
      wx.navigateTo({
        url: targetUrl,
        fail: (err) => {
          console.error('跳转失败', err);
          wx.showToast({ title: '页面不存在', icon: 'none' });
        }
      });
    }, 200);
  },

  // [修改后] 跳转到游戏大厅 (现在会检查匿名了)
  goToGames: function() {
    this.checkNicknameAndGo('games');
  },

  // 跳转到问题解决 (无需改动，如果你也想检查匿名，也可以改为调用 checkNicknameAndGo)
  goToProblemSolving() {
    wx.navigateTo({
      url: '/pages/problem_solving/menu/menu',
      fail: (err) => {
        wx.showToast({ title: '功能开发中', icon: 'none' });
      }
    });
  },

  // [修改后] 跳转到大脑开发 (现在会检查匿名了)
  goToBrainDev() {
    this.checkNicknameAndGo('brain');
  },
 

  goToStore: function() {
    wx.navigateTo({ url: '/pages/store/store' });
  },

  viewHistory: function() { wx.navigateTo({ url: '/pages/history/history' }); },
  goToGradeTestPaper: function() { wx.navigateTo({ url: '/pages/generatePaper/generatePaper' }); },
  goToRank: function() { wx.navigateTo({ url: '/pages/rank/index' }); },
  about: function() {
    wx.showModal({
      title: '关于',
      content: '本程序由Adam.Liu开发',
      showCancel: false,
      confirmText: '知道啦',
      confirmColor: '#3498db'
    });
  },
  onPullDownRefresh: function () {
    const localInfo = wx.getStorageSync('userInfo');
    if (localInfo) {
      this.setData({ userInfo: localInfo });
    }
    this.loadIntegralInfo(); 
    this.loadFrame(); // 刷新也要加载
    setTimeout(() => {
      wx.stopPullDownRefresh();
      wx.showToast({ title: '刷新成功', icon: 'none' });
    }, 500);
  },
  onShareAppMessage: function () {
    return {
      title: `我的军衔是【${this.data.userTitle}】，快来挑战我！`,
      path: '/pages/index/index',
      imageUrl: '/images/share.png' 
    };
  }
});