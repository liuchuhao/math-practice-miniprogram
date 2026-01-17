Page({
  data: {
    gridNumbers: [],
    gridSize: 3,     // [新增] 默认3x3，可选 3,4,5
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

  // [新增] 难度选择弹窗
  showDifficultySelect() {
    wx.showActionSheet({
      itemList: ['简单 (3x3)', '中等 (4x4)', '困难 (5x5)'],
      success: (res) => {
        let size = 3;
        if (res.tapIndex === 1) size = 4;
        if (res.tapIndex === 2) size = 5;
        
        this.setData({ gridSize: size });
        this.startGame(); // 选完难度开始游戏
      },
      fail: () => {
        // 如果用户点取消，默认给个简单的，或者退出
        this.setData({ gridSize: 3 });
        this.startGame();
      }
    });
  },

  initBestScore() {
    // 最佳成绩应该分难度存储，这里简单起见暂存一个通用的，建议按 key 区分
    // const key = `schulte_best_${this.data.gridSize}`; 
    const best = wx.getStorageSync('schulte_best') || 0;
    this.setData({ bestScore: best });
  },

  startGame() {
    this.stopTimer();
    
    const size = this.data.gridSize;
    const total = size * size; // 9, 16, or 25

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

    // [修改] 改用 Touch 事件，手指碰到屏幕瞬间触发，无视滑动和长按
    onCellTouch(e) {
      if (!this.data.isPlaying) return;
      
      // 逻辑和之前完全一样
      const val = parseInt(e.currentTarget.dataset.val);
      
      // 只有点对的时候才执行逻辑
      if (val === this.data.nextNum) {
        
        // 这里的震动如果觉得太频密影响手感，可以注释掉
        // wx.vibrateShort({ type: 'light' });
  
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

  // 点击“重新开始”按钮时，也弹出难度选择
  restartGame() {
    this.showDifficultySelect();
  },

  // ... checkHighScore 和 uploadScore 逻辑保持不变 ...
  // 注意：上传成绩时建议把 gridSize 也传给后端，或者在前端区分存储 key
  checkHighScore(score) {
    // 简单演示，实际建议区分难度存储 key
    const storageKey = `schulte_best_${this.data.gridSize}`;
    const oldBest = wx.getStorageSync(storageKey) || 0;
    
    let isNewRecord = false;
    if (oldBest === 0 || score < oldBest) {
      isNewRecord = true;
      wx.setStorageSync(storageKey, score);
      // 更新界面显示的 best (如果界面只显示当前难度的 best)
      this.setData({ bestScore: score }); 
    }
    // =========== [新增：计算和保存积分] ===========
    // 基础分：3x3=10分, 4x4=20分, 5x5=30分
    let earnedPoints = (this.data.gridSize - 2) * 5;
    
    // 额外奖励：打破纪录额外加 10 分
    if (isNewRecord && oldBest !== 0) {
      earnedPoints += 10;
    }

    // 保存积分到本地
    let totalIntegral = wx.getStorageSync('totalIntegral') || 0;
    totalIntegral += earnedPoints;
    wx.setStorageSync('totalIntegral', totalIntegral);
    
    console.log(`[舒尔特方格] 完成！获得 ${earnedPoints} 分，总积分: ${totalIntegral}`);
    // ===========================================

    let modalContent = `${this.data.gridSize}x${this.data.gridSize} 模式\n你的成绩：${score} 秒\n\n🎉 获得积分 +${earnedPoints}`;
    if (isNewRecord) modalContent = "🏆 打破纪录！\n" + modalContent;
    
    wx.showModal({
      title: isNewRecord ? '🎉 新纪录！' : '挑战完成',
      content: modalContent,
      showCancel: true, 
      cancelText: '返回菜单',
      confirmText: '再来一局',
      success: (res) => {
        if (res.confirm) {
          // 直接重开当前难度
          this.startGame(); 
        } else if (res.cancel) {
          wx.navigateBack();
        }
      }
    });
  },
});