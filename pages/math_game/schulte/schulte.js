// pages/math_game/schulte/schulte.js

// 1. ✨ 引入游戏服务 (请确认路径层级)
const gameService = require('../../brain-dev/games/common/game-service.js');

Page({
  data: {
    gridNumbers: [],
    gridSize: 3,     // 默认3x3，可选 3,4,5
    nextNum: 1,
    startTime: 0,
    timeStr: '0.00',
    timer: null,
    isPlaying: false,
    bestScore: 0
  },

  onLoad() {
    this.initBestScore();
    // 进来先不开始，先让用户选难度
    this.showDifficultySelect();
  },

  onUnload() {
    this.stopTimer();
  },

  // 难度选择弹窗
  showDifficultySelect() {
    wx.showActionSheet({
      itemList: ['简单 (3x3)', '中等 (4x4)', '困难 (5x5)'],
      success: (res) => {
        let size = 3;
        if (res.tapIndex === 1) size = 4;
        if (res.tapIndex === 2) size = 5;
        
        this.setData({ gridSize: size });
        this.startGame(); 
      },
      fail: () => {
        // 默认简单
        this.setData({ gridSize: 3 });
        this.startGame();
      }
    });
  },

  initBestScore() {
    // 简单起见，这里只读一个通用缓存，或者你可以读当前难度的
    const key = `schulte_best_${this.data.gridSize}`;
    const best = wx.getStorageSync(key) || 0;
    this.setData({ bestScore: best });
  },

  startGame() {
    this.stopTimer();
    
    const size = this.data.gridSize;
    const total = size * size;

    // 1. 生成 1-total 的数组并打乱
    let arr = [];
    for (let i = 1; i <= total; i++) arr.push(i);
    
    // 洗牌算法
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    this.setData({
      gridNumbers: arr,
      nextNum: 1,
      timeStr: '0.00',
      isPlaying: true
    });

    // 2. 开始计时
    this.data.startTime = Date.now();
    this.data.timer = setInterval(() => {
      const now = Date.now();
      const diff = (now - this.data.startTime) / 1000;
      this.setData({ timeStr: diff.toFixed(2) });
    }, 30);
  },

  stopTimer() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
      this.data.timer = null;
    }
  },

  // 点击格子
  onCellTouch(e) {
    if (!this.data.isPlaying) return;
    
    const val = parseInt(e.currentTarget.dataset.val);
    
    if (val === this.data.nextNum) {
      const maxNum = this.data.gridSize * this.data.gridSize;

      if (val === maxNum) {
        this.gameFinish();
      } else {
        this.setData({ nextNum: val + 1 });
      }
    }
  },

  gameFinish() {
    this.stopTimer();
    this.setData({ isPlaying: false });
    const finalTime = parseFloat(this.data.timeStr);
    this.checkHighScore(finalTime);
  },

  restartGame() {
    this.showDifficultySelect();
  },

  // 结算与上传
  checkHighScore(score) {
    // 1. 本地记录最佳成绩
    const storageKey = `schulte_best_${this.data.gridSize}`;
    const oldBest = wx.getStorageSync(storageKey) || 0;
    
    let isNewRecord = false;
    // score 是用时，越小越好。oldBest=0 代表没记录
    if (oldBest === 0 || score < oldBest) {
      isNewRecord = true;
      wx.setStorageSync(storageKey, score);
      this.setData({ bestScore: score }); 
    }

        // 2. 计算积分 (高精度 0.01秒)
        let benchmark = 0;
    
        // 设定高难度基准时间
        if (this.data.gridSize === 3) {
          benchmark = 5;  // 3x3 目标 5.00s
        } else if (this.data.gridSize === 4) {
          benchmark = 12; // 4x4 目标 12.00s
        } else { 
          benchmark = 24; // 5x5 目标 24.00s
        }
    
        // 核心公式：保底分 + (基准 - 用时) * 100
        // 例如 3x3：
        // - 用时 3.00s: 10 + (5 - 3.00) * 100 = 210分
        // - 用时 2.99s: 10 + (5 - 2.99) * 100 = 211分 (微小进步也能破纪录)
        // - 用时 6.00s: 10 + 0 = 10分 (超时保底)
        let timeBonus = Math.max(0, (benchmark - score) * 100);
        
        // 基础分 (3阶10分, 4阶20分, 5阶30分)
        let baseScore = (this.data.gridSize - 2) * 10;
        
        let earnedPoints = Math.floor(baseScore + timeBonus);
        


    // 3. 积分累加
    let totalIntegral = wx.getStorageSync('totalIntegral') || 0;
    totalIntegral += earnedPoints;
    wx.setStorageSync('totalIntegral', totalIntegral);
    
    // 4. 增加总场次
    const totalKey = 'total_game_count';
    wx.setStorageSync(totalKey, (wx.getStorageSync(totalKey) || 0) + 1);

    // 5. 准备上传数据
    const uploadData = {
      gameId: 'schulte',
      level: this.data.gridSize + 'x' + this.data.gridSize,
      score: earnedPoints, // 积分
      avgTime: score       // 用时 (秒)
    };

    let modalContent = `${this.data.gridSize}x${this.data.gridSize} 模式\n你的成绩：${score} 秒\n\n🎉 获得积分 +${earnedPoints}`;
    if (isNewRecord) modalContent = "🏆 打破纪录！\n" + modalContent;
    
    wx.showModal({
      title: isNewRecord ? '🎉 新纪录！' : '挑战完成',
      content: modalContent,
      showCancel: true,
      confirmText: '上传战绩', // 改为上传
      cancelText: '再来一局',
      success: (res) => {
        if (res.confirm) {
          this.uploadScore(uploadData);
        } else if (res.cancel) {
          this.startGame(); // 直接重开当前难度
        }
      }
    });
  },

  // ✨ 上传函数
  uploadScore(data) {
    wx.showLoading({ title: '上传中...' });
    gameService.uploadRecord(data).then(res => {
      wx.hideLoading();
      if (res.success && res.uploaded !== false) {
        wx.showToast({ title: '上传成功', icon: 'success' });
      } else if (res.uploaded === false) {
        wx.showToast({ title: '已保存本地', icon: 'none' });
      } else {
        wx.showToast({ title: '上传失败', icon: 'none' });
      }
      setTimeout(() => { this.startGame(); }, 1500);
    });
  }
});