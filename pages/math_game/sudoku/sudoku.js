// pages/math_game/sudoku/sudoku.js
Page({
  data: {
    board: [],         // 9x9 游戏面板数据
    solution: [],      // 9x9 完整答案（用于比对）
    selected: { r: -1, c: -1 }, // 当前选中的格子
    
    difficulty: 'easy', // easy, medium, hard
    mistakes: 0,       // 错误次数
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
        // 默认简单
        this.startGame('easy');
      }
    });
  },

  // 2. 开始游戏
  startGame(difficulty) {
    wx.showLoading({ title: '生成题目中...' });
    this.stopTimer();
    
    // 异步生成，防止卡顿
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

  // --- 核心算法：生成数独 ---
  generateSudoku(diff) {
    // A. 初始化空盘
    let mat = Array.from({ length: 9 }, () => Array(9).fill(0));
    
    // B. 填充对角线上的三个 3x3 宫（互相独立，可随机填）
    for (let i = 0; i < 9; i = i + 3) {
      this.fillBox(mat, i, i);
    }
    
    // C. 递归填充剩余格子
    this.solveSudoku(mat);
    
    // D. 保存答案（深拷贝）
    const solution = JSON.parse(JSON.stringify(mat));
    
    // E. 挖洞（根据难度去掉数字）
    // 简单留40个，中等30个，困难24个 (大约)
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

    // F. 转换为前端需要的对象结构
    const puzzle = mat.map((row, rIndex) => {
      return row.map((val, cIndex) => ({
        val: val === 0 ? '' : val,
        fixed: val !== 0,   // 是否是题目自带的固定数字
        isError: false,     // 是否填错
        isRelated: false    // 是否是高亮辅助行列
      }));
    });

    return { puzzle, solution };
  },

  // 辅助：填充 3x3 宫
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
  // 辅助：检查宫内是否有重复
  isSafeInBox(mat, rowStart, colStart, num) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (mat[rowStart + i][colStart + j] === num) return false;
      }
    }
    return true;
  },
  // 辅助：检查位置是否合法
  isSafe(mat, row, col, num) {
    // 查行
    for (let x = 0; x < 9; x++) if (mat[row][x] === num) return false;
    // 查列
    for (let x = 0; x < 9; x++) if (mat[x][col] === num) return false;
    // 查宫
    let startRow = row - row % 3, startCol = col - col % 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (mat[i + startRow][j + startCol] === num) return false;
      }
    }
    return true;
  },
  // 辅助：回溯求解
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
    if (!isEmpty) return true; // 填满了

    for (let num = 1; num <= 9; num++) {
      if (this.isSafe(mat, row, col, num)) {
        mat[row][col] = num;
        if (this.solveSudoku(mat)) return true;
        mat[row][col] = 0; // 回溯
      }
    }
    return false;
  },

  // --- 交互逻辑 ---
  
  // 选中格子
  selectCell(e) {
    if (this.data.isGameover) return;
    const { r, c } = e.currentTarget.dataset;
    this.setData({ selected: { r, c } });
    this.highlightRelated(r, c);
  },

  // 高亮辅助行列
  highlightRelated(r, c) {
    const board = this.data.board;
    // 清除旧的高亮
    board.forEach(row => row.forEach(cell => cell.isRelated = false));
    
    // 设置新的高亮 (同行、同列、同数值)
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

  // 点击数字键盘
  onNumTap(e) {
    if (this.data.isGameover) return;
    const { r, c } = this.data.selected;
    if (r === -1) return; // 没选格子
    
    // 如果是固定格子，不可修改
    if (this.data.board[r][c].fixed) return;

    const num = parseInt(e.currentTarget.dataset.num);
    const correctVal = this.data.solution[r][c];
    
    // 检查正误
    const isCorrect = num === correctVal;
    
    // 更新格子数据
    const key = `board[${r}][${c}]`;
    this.setData({
      [key + '.val']: num,
      [key + '.isError']: !isCorrect
    });
    
    // 错误处理
    if (!isCorrect) {
      wx.vibrateShort({ type: 'heavy' }); // 震动提醒
      this.setData({ mistakes: this.data.mistakes + 1 });
      if (this.data.mistakes >= 3) {
        // 错误3次失败 (可选逻辑，也可以不让失败)
        // this.gameOver(false);
      }
    } else {
      this.checkWin();
    }
    
    // 重新计算高亮
    this.highlightRelated(r, c);
  },

  // 擦除
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

  // 检查是否胜利
  checkWin() {
    // 检查是否所有空都填了且没有错误
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
      // 1. 保存本地战绩 (逻辑正确)
      const key = `sudoku_wins_${this.data.difficulty}`;
      const oldVal = wx.getStorageSync(key) || 0;
      wx.setStorageSync(key, oldVal + 1);

      // 2. 增加总场次 (逻辑正确)
      const total = wx.getStorageSync('total_game_count') || 0;
      wx.setStorageSync('total_game_count', total + 1);

      // 3. 弹窗反馈 (优化交互)
      wx.showModal({
        title: '挑战成功!',
        content: `难度: ${this.data.difficulty}\n耗时: ${this.data.timeStr}`,
        confirmText: '上传战绩', // 右边按钮
        confirmColor: '#3498db',
        showCancel: true,
        cancelText: '再来一局', // 左边按钮
        success: (res) => {
          if (res.confirm) {
            this.uploadScore(); // 点击上传
          } else if (res.cancel) {
            this.onRestart();   // 点击再来一局
          }
        }
      });
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

  onRestart() {
    this.showDifficultySelect();
  },

  // 简单的上传逻辑
  uploadScore() {
    // 这里复用之前的上传代码，type='sudoku'
    wx.showToast({ title: '已上传(模拟)', icon: 'success' });
  }
});