// pages/math_game/minesweeper/minesweeper.js

// 1. ✨ 引入游戏服务 (使用正确的绝对路径或相对路径)
const gameService = require('../../brain-dev/games/common/game-service.js');

Page({
  data: {
    rows: 10,       // 行数
    cols: 8,        // 列数
    totalMines: 8, // 雷总数
    
    grid: [],       // 二维数组存放格子数据
    mineCount: 8,  // 剩余雷数显示
    timeStr: '00:00',
    timer: null,
    startTime: 0,
    
    isGameover: false,
    isWin:false,
    gameState: 'ready'
  },

  onLoad() {
    this.initGame();
  },

  onUnload() {
    this.stopTimer();
  },

  // 1. 初始化游戏
  initGame() {
    this.stopTimer();
    const { rows, cols, totalMines } = this.data;
    
    let grid = [];
    for (let r = 0; r < rows; r++) {
      let row = [];
      for (let c = 0; c < cols; c++) {
        row.push({
          row: r, col: c,
          value: 0, status: 0, isBoom: false
        });
      }
      grid.push(row);
    }

    let minesPlaced = 0;
    while (minesPlaced < totalMines) {
      let r = Math.floor(Math.random() * rows);
      let c = Math.floor(Math.random() * cols);
      if (grid[r][c].value !== -1) {
        grid[r][c].value = -1;
        minesPlaced++;
        this.updateNeighbors(grid, r, c);
      }
    }

    this.setData({
      grid,
      mineCount: totalMines,
      timeStr: '00:00',
      isGameover: false,
      isWin:false,
      gameState: 'ready'
    });
  },

  updateNeighbors(grid, r, c) {
    const directions = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    directions.forEach(([dr, dc]) => {
      let nr = r + dr, nc = c + dc;
      if (this.isValid(nr, nc) && grid[nr][nc].value !== -1) {
        grid[nr][nc].value++;
      }
    });
  },

  isValid(r, c) {
    return r >= 0 && r < this.data.rows && c >= 0 && c < this.data.cols;
  },

  // --- 交互逻辑 ---
  onCellTap(e) {
    if (this.data.isGameover) return;
    const { r, c } = e.currentTarget.dataset;
    const cell = this.data.grid[r][c];

    if (cell.status !== 0) return;

    if (this.data.gameState === 'ready') {
      this.setData({ gameState: 'playing' });
      this.startTimer();
    }

    if (cell.value === -1) {
      this.gameOver(false, r, c);
      return;
    }

    this.revealCell(r, c);
    this.checkWin();
  },

  onCellLongPress(e) {
    if (this.data.isGameover) return;
    const { r, c } = e.currentTarget.dataset;
    let grid = this.data.grid;
    let cell = grid[r][c];
    let mineCount = this.data.mineCount;

    if (cell.status === 1) return;

    if (cell.status === 0) {
      cell.status = 2; // 插旗
      mineCount--;
      wx.vibrateShort({ type: 'medium' });
    } else {
      cell.status = 0; // 取消
      mineCount++;
    }

    this.setData({ 
      [`grid[${r}][${c}]`]: cell,
      mineCount 
    });
  },

  revealCell(r, c) {
    let grid = this.data.grid;
    if (!this.isValid(r, c) || grid[r][c].status !== 0) return;

    grid[r][c].status = 1;
    
    if (grid[r][c].value > 0) {
      this.setData({ [`grid[${r}][${c}]`]: grid[r][c] });
      return;
    }

    this.setData({ [`grid[${r}][${c}]`]: grid[r][c] });

    const directions = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    directions.forEach(([dr, dc]) => {
      this.revealCell(r + dr, c + dc);
    });
  },

  checkWin() {
    let unrevealedSafeCells = 0;
    const { rows, cols, grid } = this.data;
    for(let i=0; i<rows; i++) {
      for(let j=0; j<cols; j++) {
        if (grid[i][j].value !== -1 && grid[i][j].status !== 1) {
          unrevealedSafeCells++;
        }
      }
    }
    if (unrevealedSafeCells === 0) {
      this.gameOver(true);
    }
  },

  // 游戏结束
  gameOver(isWin, boomR, boomC) {
    this.stopTimer();
    this.setData({ isGameover: true, isWin: isWin });

    let grid = this.data.grid;
    for(let i=0; i<this.data.rows; i++) {
      for(let j=0; j<this.data.cols; j++) {
        if (grid[i][j].value === -1) {
          grid[i][j].status = 1;
        }
      }
    }
    if (!isWin && boomR !== undefined) {
      grid[boomR][boomC].isBoom = true;
    }
    this.setData({ grid });

    if (isWin) {
      // 1. 本地记录 (原有代码保持不变)
      const winKey = 'minesweeper_win_count';
      wx.setStorageSync(winKey, (wx.getStorageSync(winKey) || 0) + 1);

      const timeKey = 'minesweeper_best_time';
      const oldTimeStr = wx.getStorageSync(timeKey);
      
      // 判断是否打破本地时间记录
      let isNewRecord = false;
      if (!oldTimeStr || this.data.timeStr < oldTimeStr) {
        wx.setStorageSync(timeKey, this.data.timeStr);
        isNewRecord = true;
      }

      const totalKey = 'total_game_count';
      wx.setStorageSync(totalKey, (wx.getStorageSync(totalKey) || 0) + 1);
      
      // =========== [新增：动态积分计算] ===========
      // 解析当前用时 (秒)
      const timeParts = this.data.timeStr.split(':');
      const seconds = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
      
      // 设定基准时间：60秒
      // 公式：保底50分 + (60 - 用时) * 10
      // - 用时 30秒: 50 + (60-30)*10 = 350分
      // - 用时 29秒: 50 + (60-29)*10 = 360分 (破纪录可上传)
      const benchmark = 60; 
      const timeBonus = Math.max(0, (benchmark - seconds) * 10);
      
      let baseScore = 50 + timeBonus;
      
      // 破纪录额外加 50 分
      if (isNewRecord && oldTimeStr) {
        baseScore += 50;
      }

      // 累加总积分
      let totalIntegral = wx.getStorageSync('totalIntegral') || 0;
      totalIntegral += baseScore;
      wx.setStorageSync('totalIntegral', totalIntegral);
      // ===========================================
      
      const uploadData = {
        gameId: 'minesweeper',
        level: '普通', 
        score: baseScore, // 动态分数
        avgTime: seconds  // 秒数
      };

      console.log(`[扫雷] 胜利！获得 ${baseScore} 分，总积分: ${totalIntegral}`);

      wx.showModal({
        title: '🎉 扫雷成功！',
        content: `用时: ${this.data.timeStr}\n\n🎉 获得积分 +${baseScore}`,
        confirmText: '上传战绩',
        confirmColor: '#3498db',
        showCancel: true,
        cancelText: '再来一局',
        cancelColor: '#2c3e50',
        success: (res) => {
          if (res.confirm) {
            this.uploadScore(uploadData);
          } else if(res.cancel) {
            this.restartGame();
          } 
        }
      });
    } else {
      wx.vibrateLong();
      wx.showToast({ title: '踩到雷了!', icon: 'error' });
    }
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
      setTimeout(() => { this.restartGame(); }, 1500);
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
    this.initGame();
  }
});