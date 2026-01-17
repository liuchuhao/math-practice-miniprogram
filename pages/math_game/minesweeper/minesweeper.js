// pages/math_game/minesweeper/minesweeper.js
Page({
  data: {
    rows: 10,       // 行数
    cols: 8,        // 列数 (适配手机竖屏，稍微瘦一点)
    totalMines: 8, // 雷总数
    
    grid: [],       // 二维数组存放格子数据
    mineCount: 8,  // 剩余雷数显示 (总数 - 插旗数)
    timeStr: '00:00',
    timer: null,
    startTime: 0,
    
    isGameover: false,
    isWin:false,
    gameState: 'ready' // ready, playing, win, lose
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
    
    // 初始化空网格
    let grid = [];
    for (let r = 0; r < rows; r++) {
      let row = [];
      for (let c = 0; c < cols; c++) {
        row.push({
          row: r,
          col: c,
          value: 0,      // 0-8:周围雷数, -1:是雷
          status: 0,     // 0:未翻开, 1:已翻开, 2:插旗
          isBoom: false  // 是否是炸的那颗雷
        });
      }
      grid.push(row);
    }

    // 随机布雷
    let minesPlaced = 0;
    while (minesPlaced < totalMines) {
      let r = Math.floor(Math.random() * rows);
      let c = Math.floor(Math.random() * cols);
      if (grid[r][c].value !== -1) {
        grid[r][c].value = -1;
        minesPlaced++;
        // 更新周围格子的数字
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

  // 更新周围8个格子的计数
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

  // 短按：翻开
  onCellTap(e) {
    if (this.data.isGameover) return;
    const { r, c } = e.currentTarget.dataset;
    const cell = this.data.grid[r][c];

    // 如果已插旗或已翻开，不做反应
    if (cell.status !== 0) return;

    // 第一次点击开始计时
    if (this.data.gameState === 'ready') {
      this.setData({ gameState: 'playing' });
      this.startTimer();
    }

    // 点到雷 -> 游戏结束
    if (cell.value === -1) {
      this.gameOver(false, r, c);
      return;
    }

    // 点到空白 -> 递归翻开
    this.revealCell(r, c);
    
    // 检查胜利
    this.checkWin();
  },

  // 长按：插旗/取消插旗
  onCellLongPress(e) {
    if (this.data.isGameover) return;
    const { r, c } = e.currentTarget.dataset;
    let grid = this.data.grid;
    let cell = grid[r][c];
    let mineCount = this.data.mineCount;

    // 只有未翻开(0)和已插旗(2)可以切换
    if (cell.status === 1) return;

    if (cell.status === 0) {
      cell.status = 2; // 插旗
      mineCount--;
      wx.vibrateShort({ type: 'medium' }); // 震动反馈
    } else {
      cell.status = 0; // 取消
      mineCount++;
    }

    this.setData({ 
      [`grid[${r}][${c}]`]: cell,
      mineCount 
    });
  },

  // 递归翻开 (Flood Fill)
  revealCell(r, c) {
    let grid = this.data.grid;
    if (!this.isValid(r, c) || grid[r][c].status !== 0) return;

    // 设置为已翻开
    grid[r][c].status = 1;
    
    // 如果是数字 > 0，只翻开自己，停止递归
    if (grid[r][c].value > 0) {
      this.setData({ [`grid[${r}][${c}]`]: grid[r][c] });
      return;
    }

    // 如果是 0，递归翻开周围8个
    this.setData({ [`grid[${r}][${c}]`]: grid[r][c] }); // 局部更新优化性能

    const directions = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    directions.forEach(([dr, dc]) => {
      this.revealCell(r + dr, c + dc);
    });
  },

  // 检查胜利
  checkWin() {
    let unrevealedSafeCells = 0;
    const { rows, cols, grid } = this.data;
    
    for(let i=0; i<rows; i++) {
      for(let j=0; j<cols; j++) {
        // 如果不是雷，且未翻开
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
    this.setData({ isGameover: true ,
    isWin: isWin
    });

    // 显示所有雷
    let grid = this.data.grid;
    for(let i=0; i<this.data.rows; i++) {
      for(let j=0; j<this.data.cols; j++) {
        if (grid[i][j].value === -1) {
          grid[i][j].status = 1; // 翻开雷
        }
      }
    }
    // 标记爆炸的那颗
    if (!isWin && boomR !== undefined) {
      grid[boomR][boomC].isBoom = true;
    }

    this.setData({ grid });

    if (isWin) {
      // =========== [核心修复开始] ===========
      
      // 1. 保存【扫雷】通关次数 (Key: minesweeper_win_count)
      const winKey = 'minesweeper_win_count';
      const oldWins = wx.getStorageSync(winKey) || 0;
      wx.setStorageSync(winKey, oldWins + 1);

      // 2. 保存【扫雷】最快用时 (Key: minesweeper_best_time)
      const timeKey = 'minesweeper_best_time';
      const oldTime = wx.getStorageSync(timeKey);
      // 逻辑：如果没有旧记录，或者当前时间字符串更小(例如 "00:30" < "01:00")，则更新
      if (!oldTime || this.data.timeStr < oldTime) {
        wx.setStorageSync(timeKey, this.data.timeStr);
      }

      // 3. 增加总游戏场次
      const totalKey = 'total_game_count';
      const totalGames = wx.getStorageSync(totalKey) || 0;
      wx.setStorageSync(totalKey, totalGames + 1);
      // 基础分 50 分 (扫雷比较难，给多点)
      const baseScore = 100;
      
      // 1. 读取旧的总积分
      let totalIntegral = wx.getStorageSync('totalIntegral') || 0;
      
      // 2. 累加新积分
      totalIntegral += baseScore;
      
      // 3. 保存回本地缓存
      wx.setStorageSync('totalIntegral', totalIntegral);
      
      console.log(`[扫雷] 胜利！获得 ${baseScore} 分，当前总积分: ${totalIntegral}`);
      // =========== [核心修复结束] ===========
      wx.showModal({
        title: '🎉 扫雷成功！',
        content: `用时: ${this.data.timeStr}\n\n🎉 获得积分 +${baseScore}`,
        confirmText: '上传战绩',
        confirmColor: '#3498db',
        showCancel: true,
        cancelText: '再来一局', // [新增]
        cancelColor: '#2c3e50',
        success: (res) => {
          if (res.confirm) {this.uploadScore();}
          else if(res.cancel){this.restartGame();
        } 

        }
      });
    } else {
      wx.vibrateLong(); // 失败长震动
      wx.showToast({ title: '踩到雷了!', icon: 'error' });
    }
  },

  // 计时器
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
  },

  uploadScore() {
    // 模拟上传 type='minesweeper'
    wx.showToast({ title: '已上传(模拟)', icon: 'success' });
  }
});