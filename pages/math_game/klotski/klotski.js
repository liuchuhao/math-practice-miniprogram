// pages/math_game/klotski/klotski.js
Page({
  data: {
    size: 3,         // 3x3, 4x4, 5x5
    board: [],       // 一维数组存储 [1, 2, 3, ..., 0]
    emptyIndex: -1,  // 空格(0)的位置索引
    
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
    
    // 生成有解的乱序数组
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

  // --- 核心算法：生成有解盘面 ---
  generateSolvableBoard(size) {
    let arr = [];
    const len = size * size;
    // 生成 1 到 len-1 和 0
    for (let i = 1; i < len; i++) arr.push(i);
    arr.push(0); // 0 代表空格

    // 随机打乱
    do {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    } while (!this.isSolvable(arr, size)); // 如果无解，重来

    // 找到空格位置
    const emptyIndex = arr.indexOf(0);
    return { board: arr, emptyIndex };
  },

  // 判断是否有解
  // 规则：
  // 1. 逆序数：不计算0，前面比后面大的数对个数。
  // 2. N为奇数：逆序数为偶数 -> 有解
  // 3. N为偶数：(空格所在行距底部的距离 + 逆序数) 为奇数 -> 有解 (注意：行距底部距离从0开始算还是从1开始算取决于逆序数定义，这里使用经典公式)
  // 通用简单判断：N为奇数看逆序数是否偶数；N为偶数，看 (逆序数 + 空格所在行号) 的奇偶性与 (目标状态逆序数 + 目标空格行号) 是否一致
  // 为了简单，我们使用最通用的判断：
  isSolvable(arr, size) {
    let inversions = 0;
    const len = arr.length;
    // 计算逆序数 (不包含0)
    for (let i = 0; i < len; i++) {
      if (arr[i] === 0) continue;
      for (let j = i + 1; j < len; j++) {
        if (arr[j] === 0) continue;
        if (arr[i] > arr[j]) inversions++;
      }
    }

    if (size % 2 !== 0) {
      // 奇数阶：逆序数必须为偶数
      return inversions % 2 === 0;
    } else {
      // 偶数阶：
      // 找到空格所在行 (从下往上数，倒数第一行是1)
      const emptyIdx = arr.indexOf(0);
      const rowFromBottom = size - Math.floor(emptyIdx / size);
      
      // 规则：(倒数行数 + 逆序数) 必须是奇数 (针对目标状态 123...0 的情况)
      // 也有说法是：如果空格在偶数行(倒数)，逆序数需为奇数；空格在奇数行(倒数)，逆序数需为偶数。
      // 即：(rowFromBottom % 2 === 0 && inversions % 2 !== 0) || (rowFromBottom % 2 !== 0 && inversions % 2 === 0)
      // 简化为：(rowFromBottom + inversions) % 2 !== 0
      return (rowFromBottom + inversions) % 2 !== 0;
    }
  },

  // --- 交互逻辑 ---
  onBlockTap(e) {
    if (this.data.isGameover) return;
    
    const index = e.currentTarget.dataset.index;
    const empty = this.data.emptyIndex;
    const size = this.data.size;

    // 判断是否相邻 (上下左右)
    // 上下：index = empty ± size
    // 左右：index = empty ± 1 且 在同一行
    const isUp = index === empty - size;
    const isDown = index === empty + size;
    const isLeft = index === empty - 1 && Math.floor(index / size) === Math.floor(empty / size);
    const isRight = index === empty + 1 && Math.floor(index / size) === Math.floor(empty / size);

    if (isUp || isDown || isLeft || isRight) {
      // 交换
      let newBoard = [...this.data.board];
      [newBoard[index], newBoard[empty]] = [newBoard[empty], newBoard[index]];
      
      this.setData({
        board: newBoard,
        emptyIndex: index,
        moves: this.data.moves + 1
      });


      // 检查胜利
      this.checkWin(newBoard);
    }
  },

  checkWin(arr) {
    // 最后一个必须是0
    if (arr[arr.length - 1] !== 0) return;
    
    // 前面必须是 1, 2, 3 ...
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] !== i + 1) return;
    }

    // 胜利
    this.stopTimer();
    this.setData({ isGameover: true });
     // =========== [新增：保存本地最佳成绩] ===========
    // 1. 获取当前难度的存储Key (如: klotski_best_moves_3)
    const storageKey = `klotski_best_moves_${this.data.size}`;
    
    // 2. 读取旧记录 (如果没有记录，默认为 99999 步)
    const oldBest = wx.getStorageSync(storageKey) || 99999;
    
    // 3. 如果当前步数更少，则更新记录
    if (this.data.moves < oldBest) {
      wx.setStorageSync(storageKey, this.data.moves);
    }

    // 4. 增加总游戏场次 (用于战绩页头部统计)
    const totalGameKey = 'total_game_count';
    const totalGames = wx.getStorageSync(totalGameKey) || 0;
    wx.setStorageSync(totalGameKey, totalGames + 1);
    // ===============================================
    
    wx.showModal({
      title: '还原成功！',
      content: `${this.data.size}x${this.data.size} 模式\n步数：${this.data.moves}\n用时：${this.data.timeStr}`,
      confirmText: '上传战绩',
      success: (res) => {
        if (res.confirm) this.uploadScore();
      }
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
  },

  uploadScore() {
    // 模拟上传
    wx.showToast({ title: '已上传(模拟)', icon: 'success' });
  }
});