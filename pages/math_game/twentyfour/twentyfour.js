// pages/math_game/twentyfour/twentyfour.js
Page({
  data: {
    cards: [],        // 当前桌面上剩余的数字对象 {val: 3, id: 0, expr: '3'}
    history: [],      // 历史记录，用于撤销
    
    selectedIdx: -1,  // 选中的第一张牌下标
    operator: '',     // 选中的运算符
    
    score: 0,
    startTime: 0,
    timer: null,
    timeStr: '00:00'
  },

  onLoad() {
    this.startGame();
  },

  onUnload() {
    this.stopTimer();
  },

  // 1. 开始新的一局
  startGame() {
    this.stopTimer();
    const cards = this.generateSolvableCards();
    
    this.setData({
      cards: cards.map((val, idx) => ({ val: val, id: idx, expr: val.toString() })),
      history: [],
      selectedIdx: -1,
      operator: '',
      timeStr: '00:00'
    });
    
    this.startTimer();
  },

  // --- 核心算法：生成有解的4个数字 ---
  generateSolvableCards() {
    while (true) {
      // 随机生成 4 个 1-13 的数字 (A-K)，这里简化为 1-10 适合小学生
      let nums = [];
      for (let i = 0; i < 4; i++) nums.push(Math.floor(Math.random() * 10) + 1);
      
      // 验证是否有解 (DFS暴力搜索)
      if (this.solve24(nums)) {
        return nums;
      }
    }
  },

  // 验证是否有解的递归函数
  solve24(nums) {
    if (nums.length === 1) return Math.abs(nums[0] - 24) < 0.0001;
    
    for (let i = 0; i < nums.length; i++) {
      for (let j = 0; j < nums.length; j++) {
        if (i === j) continue;
        
        let newNums = [];
        for (let k = 0; k < nums.length; k++) {
          if (k !== i && k !== j) newNums.push(nums[k]);
        }
        
        const a = nums[i], b = nums[j];
        // 加减乘除尝试
        if (this.solve24([...newNums, a + b])) return true;
        if (this.solve24([...newNums, a - b])) return true;
        if (this.solve24([...newNums, a * b])) return true;
        if (b !== 0 && this.solve24([...newNums, a / b])) return true;
      }
    }
    return false;
  },

  // --- 交互逻辑 ---

  // 点击卡片
  onCardTap(e) {
    const idx = e.currentTarget.dataset.index;
    const { selectedIdx, operator, cards } = this.data;

    // 1. 如果还没选第一张牌 -> 选中它
    if (selectedIdx === -1) {
      this.setData({ selectedIdx: idx });
      return;
    }

    // 2. 如果点了同一张牌 -> 取消选中
    if (selectedIdx === idx) {
      this.setData({ selectedIdx: -1, operator: '' });
      return;
    }

    // 3. 如果已经选了第一张牌，但没选符号 -> 切换选中为当前这张
    if (operator === '') {
      this.setData({ selectedIdx: idx });
      return;
    }

    // 4. 选了第一张 + 选了符号 + 点了第二张 -> 执行计算
    this.calculate(selectedIdx, idx, operator);
  },

  // 点击运算符
  onOpTap(e) {
    const op = e.currentTarget.dataset.op;
    if (this.data.selectedIdx === -1) {
      wx.showToast({ title: '先选一张牌', icon: 'none' });
      return;
    }
    this.setData({ operator: op });
  },

  // 执行计算
  calculate(idx1, idx2, op) {
    let cards = [...this.data.cards];
    const c1 = cards[idx1];
    const c2 = cards[idx2];
    
    let resultVal = 0;
    let resultExpr = '';

    // 计算逻辑
    if (op === '+') {
      resultVal = c1.val + c2.val;
      resultExpr = `(${c1.expr}+${c2.expr})`;
    } else if (op === '-') {
      resultVal = c1.val - c2.val;
      resultExpr = `(${c1.expr}-${c2.expr})`;
    } else if (op === '×') {
      resultVal = c1.val * c2.val;
      resultExpr = `(${c1.expr}×${c2.expr})`;
    } else if (op === '÷') {
      if (c2.val === 0) { wx.showToast({ title: '除数不能为0', icon: 'none' }); return; }
      if (c1.val % c2.val !== 0) { wx.showToast({ title: '不能整除', icon: 'none' }); return; } // 小学生版本建议限制整除
      resultVal = c1.val / c2.val;
      resultExpr = `(${c1.expr}÷${c2.expr})`;
    }

    // 存入历史记录以便撤销
    const historyItem = JSON.parse(JSON.stringify(cards));
    let history = [...this.data.history, historyItem];

    // 移除这两张牌，加入新结果牌
    // 为了方便，过滤掉这两张，再 push 新的
    let newCards = cards.filter((_, i) => i !== idx1 && i !== idx2);
    newCards.push({ val: resultVal, id: Date.now(), expr: resultExpr });

    this.setData({
      cards: newCards,
      history: history,
      selectedIdx: -1,
      operator: ''
    });

    // 检查是否只剩一张牌且等于24
    if (newCards.length === 1 && newCards[0].val === 24) {
      this.gameWin();
    }
  },

  // 撤销
  undo() {
    if (this.data.history.length === 0) return;
    const history = [...this.data.history];
    const lastState = history.pop();
    this.setData({
      cards: lastState,
      history: history,
      selectedIdx: -1,
      operator: ''
    });
  },

    // 下一题 / 放弃
    nextLevel() {
      wx.showModal({
        title: '跳过',
        content: '跳过本题会中断连胜哦，确定吗？',
        success: (res) => {
          if(res.confirm) {
            // 跳过则重置连胜分数为 0
            this.setData({ score: 0 }); 
            this.startGame();
          }
        }
      });
    },

  gameWin() {
    this.stopTimer();
    wx.vibrateShort({ type: 'heavy' });
    
    // 1. 更新当前连胜分数
    const currentScore = this.data.score + 1;
    this.setData({ score: currentScore });
    
    // =========== [新增：保存数据] ===========
    // A. 保存通关总数
    const countKey = 'twentyfour_win_count';
    wx.setStorageSync(countKey, (wx.getStorageSync(countKey) || 0) + 1);

    // B. 保存总游戏场次
    const totalKey = 'total_game_count';
    wx.setStorageSync(totalKey, (wx.getStorageSync(totalKey) || 0) + 1);

    // C. [补全] 保存最高连胜记录
    // 逻辑：如果当前得分(连胜)超过了历史最高，就更新
    const streakKey = 'twentyfour_max_streak';
    const maxStreak = wx.getStorageSync(streakKey) || 0;
    if (currentScore > maxStreak) {
      wx.setStorageSync(streakKey, currentScore);
    }
    // =======================================
    
    wx.showModal({
      title: '算对啦！',
      content: '24点达成！\n用时：' + this.data.timeStr,
      confirmText: '下一题',
      cancelText: '上传战绩', // 或者改为“休息一下”
      success: (res) => {
        if (res.confirm) {
          this.startGame();
        } else if (res.cancel) {
          // 这里可以跳转回菜单或者上传
          this.uploadScore();
        }
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
  
  uploadScore() {
    wx.showToast({ title: '已上传(模拟)', icon: 'success' });
  }
});