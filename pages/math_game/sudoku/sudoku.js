// pages/math_game/sudoku/sudoku.js

// 1. ✨ 引入游戏服务 (确认路径)
const gameService = require('../../brain-dev/games/common/game-service.js');

Page({
  data: {
    board: [],         // 9x9 面板
    solution: [],      // 9x9 答案
    selected: { r: -1, c: -1 }, 
    
    difficulty: 'easy', 
    mistakes: 0,       
    timeStr: '00:00',
    timer: null,
    startTime: 0,
    isGameover: false
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
      itemList: ['简单', '中等', '困难'],
      success: (res) => {
        const levels = ['easy', 'medium', 'hard'];
        this.startGame(levels[res.tapIndex]);
      },
      fail: () => {
        if (!this.data.board.length) this.startGame('easy');
      }
    });
  },

  // 2. 开始游戏
  startGame(difficulty) {
    wx.showLoading({ title: '生成题目中...' });
    this.stopTimer();
    
    setTimeout(() => {
      const { puzzle, solution } = this.generateSudoku(difficulty);
      
      this.setData({
        board: puzzle,
        solution: solution,
        difficulty: difficulty,
        selected: { r: -1, c: -1 },
        mistakes: 0,
        timeStr: '00:00',
        isGameover: false
      });
      
      this.startTimer();
      wx.hideLoading();
    }, 100);
  },

  // --- 核心算法 (保持不变) ---
  generateSudoku(diff) {
    let mat = Array.from({ length: 9 }, () => Array(9).fill(0));
    for (let i = 0; i < 9; i = i + 3) this.fillBox(mat, i, i);
    this.solveSudoku(mat);
    const solution = JSON.parse(JSON.stringify(mat));
    
    let clues = 40; 
    if (diff === 'medium') clues = 30;
    if (diff === 'hard') clues = 24;
    
    let attempts = 81 - clues;
    while (attempts > 0) {
      let row = Math.floor(Math.random() * 9);
      let col = Math.floor(Math.random() * 9);
      if (mat[row][col] !== 0) {
        mat[row][col] = 0;
        attempts--;
      }
    }

    const puzzle = mat.map((row, rIndex) => {
      return row.map((val, cIndex) => ({
        val: val === 0 ? '' : val,
        fixed: val !== 0,
        isError: false,
        isRelated: false
      }));
    });

    return { puzzle, solution };
  },

  fillBox(mat, row, col) {
    let num;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        do {
          num = Math.floor(Math.random() * 9) + 1;
        } while (!this.isSafeInBox(mat, row, col, num));
        mat[row + i][col + j] = num;
      }
    }
  },
  isSafeInBox(mat, rowStart, colStart, num) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (mat[rowStart + i][colStart + j] === num) return false;
      }
    }
    return true;
  },
  isSafe(mat, row, col, num) {
    for (let x = 0; x < 9; x++) if (mat[row][x] === num) return false;
    for (let x = 0; x < 9; x++) if (mat[x][col] === num) return false;
    let startRow = row - row % 3, startCol = col - col % 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (mat[i + startRow][j + startCol] === num) return false;
      }
    }
    return true;
  },
  solveSudoku(mat) {
    let row = 0, col = 0, isEmpty = false;
    for (let i = 0; i < 81; i++) {
      row = Math.floor(i / 9);
      col = i % 9;
      if (mat[row][col] === 0) {
        isEmpty = true;
        break;
      }
    }
    if (!isEmpty) return true; 

    for (let num = 1; num <= 9; num++) {
      if (this.isSafe(mat, row, col, num)) {
        mat[row][col] = num;
        if (this.solveSudoku(mat)) return true;
        mat[row][col] = 0; 
      }
    }
    return false;
  },

  // --- 交互逻辑 ---
  selectCell(e) {
    if (this.data.isGameover) return;
    const { r, c } = e.currentTarget.dataset;
    this.setData({ selected: { r, c } });
    this.highlightRelated(r, c);
  },

  highlightRelated(r, c) {
    const board = this.data.board;
    board.forEach(row => row.forEach(cell => cell.isRelated = false));
    const selectedVal = board[r][c].val;
    for(let i=0; i<9; i++) {
      for(let j=0; j<9; j++) {
        const isSameRow = i === r;
        const isSameCol = j === c;
        const isSameNum = selectedVal && board[i][j].val === selectedVal;
        if (isSameRow || isSameCol || isSameNum) {
          board[i][j].isRelated = true;
        }
      }
    }
    this.setData({ board });
  },

  onNumTap(e) {
    if (this.data.isGameover) return;
    const { r, c } = this.data.selected;
    if (r === -1 || this.data.board[r][c].fixed) return;

    const num = parseInt(e.currentTarget.dataset.num);
    const correctVal = this.data.solution[r][c];
    const isCorrect = num === correctVal;
    
    const key = `board[${r}][${c}]`;
    this.setData({
      [key + '.val']: num,
      [key + '.isError']: !isCorrect
    });
    
    if (!isCorrect) {
      wx.vibrateShort({ type: 'heavy' }); 
      this.setData({ mistakes: this.data.mistakes + 1 });
    } else {
      this.checkWin();
    }
    this.highlightRelated(r, c);
  },

  onDelete() {
    const { r, c } = this.data.selected;
    if (r === -1 || this.data.board[r][c].fixed) return;
    
    const key = `board[${r}][${c}]`;
    this.setData({
      [key + '.val']: '',
      [key + '.isError']: false
    });
    this.highlightRelated(r, c);
  },

  checkWin() {
    const finished = this.data.board.every(row => 
      row.every(cell => cell.val !== '' && !cell.isError)
    );
    if (finished) {
      this.gameOver(true);
    }
  },

  gameOver(isWin) {
    this.stopTimer();
    this.setData({ isGameover: true });
    
    if (isWin) {
      // 1. 本地统计 (保持不变)
      const key = `sudoku_wins_${this.data.difficulty}`;
      const oldVal = wx.getStorageSync(key) || 0;
      wx.setStorageSync(key, oldVal + 1);

      const total = wx.getStorageSync('total_game_count') || 0;
      wx.setStorageSync('total_game_count', total + 1);

      // =========== [修改：动态积分计算] ===========
      // 解析用时 (秒)
      const timeParts = this.data.timeStr.split(':');
      const seconds = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);

      let baseScore = 0;
      let benchmark = 0;
      
      // 设定基准时间 (秒) 和 保底分
      // 简单: 5分钟(300s)内有奖励，保底200分
      // 中等: 10分钟(600s)内有奖励，保底400分
      // 困难: 15分钟(900s)内有奖励，保底600分
      if (this.data.difficulty === 'easy') {
        baseScore = 200;
        benchmark = 300;
      } else if (this.data.difficulty === 'medium') {
        baseScore = 400;
        benchmark = 600;
      } else { // hard
        baseScore = 600;
        benchmark = 900;
      }

      // 计算时间奖励：每快1秒，加1分
      const timeBonus = Math.max(0, benchmark - seconds);
      
      const finalScore = baseScore + timeBonus;

      // 累加积分
      let totalIntegral = wx.getStorageSync('totalIntegral') || 0;
      totalIntegral += finalScore;
      wx.setStorageSync('totalIntegral', totalIntegral);
      // ===========================================

      // 3. 准备上传数据
      const uploadData = {
        gameId: 'sudoku',
        level: this.data.difficulty, // easy, medium, hard
        score: finalScore, // 动态高分
        avgTime: seconds   // 耗时
      };

      console.log(`[数独] 胜利！获得 ${finalScore} 分，当前总积分: ${totalIntegral}`);

      wx.showModal({
        title: '挑战成功!',
        content: `难度: ${this.data.difficulty}\n耗时: ${this.data.timeStr}\n\n🎉 获得积分 +${finalScore}`,
        confirmText: '上传战绩',
        cancelText: '再来一局',
        showCancel: true, 
        confirmColor: '#3498db',
        success: (res) => {
          if (res.confirm) {
            this.uploadScore(uploadData); 
          } else if (res.cancel) {
            this.onRestart();
          }
        }
      });
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
      setTimeout(() => { this.onRestart(); }, 1500);
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

  onRestart() {
    this.showDifficultySelect();
  }
});