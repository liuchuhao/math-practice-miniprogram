// pages/math_game/klotski/klotski.js

// 1. 引入游戏服务 (回退3级到pages目录，再进入brain-dev目录)
const gameService = require('../../brain-dev/games/common/game-service.js'); 

Page({
  data: {
    size: 3,         // 3x3, 4x4, 5x5
    board: [],       // 一维数组
    emptyIndex: -1,  // 空格位置
    
    moves: 0,        // 步数
    timeStr: '00:00',
    timer: null,
    startTime: 0,
    
    isGameover: false,
    isPlaying: false
  },

  onLoad() {
    this.showDifficultySelect();
  },

  onUnload() {
    this.stopTimer();
  },

  // 1. 难度选择
  showDifficultySelect() {
    wx.showActionSheet({
      itemList: ['3x3 (入门)', '4x4 (经典)', '5x5 (专家)'],
      success: (res) => {
        let size = 3;
        if (res.tapIndex === 1) size = 4;
        if (res.tapIndex === 2) size = 5;
        this.startGame(size);
      },
      fail: () => {
        if (!this.data.isPlaying) this.startGame(3);
      }
    });
  },

  // 2. 开始游戏
  startGame(size) {
    this.stopTimer();
    const { board, emptyIndex } = this.generateSolvableBoard(size);
    
    this.setData({
      size,
      board,
      emptyIndex,
      moves: 0,
      timeStr: '00:00',
      isGameover: false,
      isPlaying: true
    });
    
    this.startTimer();
  },

  // --- 核心算法 ---
  generateSolvableBoard(size) {
    let arr = [];
    const len = size * size;
    for (let i = 1; i < len; i++) arr.push(i);
    arr.push(0); 

    do {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    } while (!this.isSolvable(arr, size));

    const emptyIndex = arr.indexOf(0);
    return { board: arr, emptyIndex };
  },

  isSolvable(arr, size) {
    let inversions = 0;
    const len = arr.length;
    for (let i = 0; i < len; i++) {
      if (arr[i] === 0) continue;
      for (let j = i + 1; j < len; j++) {
        if (arr[j] === 0) continue;
        if (arr[i] > arr[j]) inversions++;
      }
    }

    if (size % 2 !== 0) {
      return inversions % 2 === 0;
    } else {
      const emptyIdx = arr.indexOf(0);
      const rowFromBottom = size - Math.floor(emptyIdx / size);
      return (rowFromBottom + inversions) % 2 !== 0;
    }
  },

  // --- 交互逻辑 ---
  onBlockTap(e) {
    if (this.data.isGameover) return;
    
    const index = e.currentTarget.dataset.index;
    const empty = this.data.emptyIndex;
    const size = this.data.size;

    const isUp = index === empty - size;
    const isDown = index === empty + size;
    const isLeft = index === empty - 1 && Math.floor(index / size) === Math.floor(empty / size);
    const isRight = index === empty + 1 && Math.floor(index / size) === Math.floor(empty / size);

    if (isUp || isDown || isLeft || isRight) {
      let newBoard = [...this.data.board];
      [newBoard[index], newBoard[empty]] = [newBoard[empty], newBoard[index]];
      
      this.setData({
        board: newBoard,
        emptyIndex: index,
        moves: this.data.moves + 1
      });

      this.checkWin(newBoard);
    }
  },

  checkWin(arr) {
    if (arr[arr.length - 1] !== 0) return;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] !== i + 1) return;
    }

    // 胜利
    this.stopTimer();
    this.setData({ isGameover: true });
    
    // =========== [修改：纯步数积分计算] ===========
    let benchmarkMoves = 0;
    
    // 设定基准步数
    if (this.data.size === 3) benchmarkMoves = 100;
    else if (this.data.size === 4) benchmarkMoves = 300;
    else benchmarkMoves = 600;
    
    // 计算逻辑：每少走1步，多得1分
    // 公式：保底分 + (基准步数 - 实际步数)
    // 只要 moves 变小，(benchmark - moves) 就变大，总分就变大 -> 必定能上传
    let stepBonus = Math.max(0, benchmarkMoves - this.data.moves);
    
    // 难度基础分
    let baseScore = (this.data.size - 2) * 50; 
    
    // 最终得分 (去掉了破纪录额外加分)
    let finalScore = baseScore + stepBonus;
    
    // 本地最佳步数记录 (仅记录，不影响积分)
    const storageKey = `klotski_best_moves_${this.data.size}`;
    const oldBest = wx.getStorageSync(storageKey) || 99999;
    if (this.data.moves < oldBest) {
      wx.setStorageSync(storageKey, this.data.moves);
    }

    // 累加总积分
    let totalIntegral = wx.getStorageSync('totalIntegral') || 0;
    totalIntegral += finalScore;
    wx.setStorageSync('totalIntegral', totalIntegral);
    
    // 增加总场次
    const totalGameKey = 'total_game_count';
    const totalGames = wx.getStorageSync(totalGameKey) || 0;
    wx.setStorageSync(totalGameKey, totalGames + 1);
    // ===========================================
    
    const uploadData = {
      gameId: 'klotski',
      level: this.data.size + 'x' + this.data.size,
      score: finalScore, 
      avgTime: this.data.moves 
    };

    wx.showModal({
      title: '还原成功！',
      content: `${this.data.size}x${this.data.size} 模式\n步数：${this.data.moves}\n用时：${this.data.timeStr}\n\n🎉 获得积分 +${finalScore}`,
      confirmText: '上传战绩',
      cancelText: '再来一局',
      showCancel: true,
      success: (res) => {
        if (res.confirm) {
           this.uploadScore(uploadData);
        } else if (res.cancel) {
           this.restartGame(); 
        }
      }
    });
  },

  // ✨ 调用 Service 上传
  uploadScore(data) {
    wx.showLoading({ title: '上传中...' });
    
    // 华容道比较特殊，最好在这里强制设置一下，避免被 game-service 的 "分数没超过最高分就不上传" 的逻辑拦截
    // 因为这里分数(baseScore)是固定的，但步数可能变少。
    // 不过我们为了简单，还是直接调，如果被拦截了也没关系，说明没破纪录。
    
    gameService.uploadRecord(data).then(res => {
      wx.hideLoading();
      if (res.success && res.uploaded !== false) {
        wx.showToast({ title: '上传成功', icon: 'success' });
      } else if (res.uploaded === false) {
        wx.showToast({ title: '已保存本地', icon: 'none' });
      } else {
        wx.showToast({ title: '上传失败', icon: 'none' });
      }
      
      // 1.5秒后自动重开
      setTimeout(() => {
        this.restartGame();
      }, 1500);
    });
  },

  startTimer() {
    this.data.startTime = Date.now();
    this.data.timer = setInterval(() => {
      const diff = Math.floor((Date.now() - this.data.startTime) / 1000);
      const m = Math.floor(diff / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');
      this.setData({ timeStr: `${m}:${s}` });
    }, 1000);
  },
  
  stopTimer() {
    if (this.data.timer) clearInterval(this.data.timer);
  },

  restartGame() {
    this.showDifficultySelect();
  }
});