// pages/math_game/twentyfour/twentyfour.js
Page({
  data: {
    cards: [],
    history: [],
    selectedIdx: -1,
    operator: '',

    score: 0,
    startTime: 0,
    timer: null,
    timeStr: '00:00',

    currentAnswer: '',
    hasUsedHint: false // [修复] 新增标记：本局是否看过答案
  },

  onLoad() {
    this.startGame();
  },

  onUnload() {
    this.stopTimer();
  },

  startGame() {
    this.stopTimer();
    const gameData = this.generateGameData();

    this.setData({
      cards: gameData.nums.map((val, idx) => ({ val: val, id: idx, expr: val.toString() })),
      currentAnswer: gameData.answer,
      history: [],
      selectedIdx: -1,
      operator: '',
      timeStr: '00:00',
      hasUsedHint: false // [修复] 新的一局，重置为未看答案
    });

    this.startTimer();
  },

  // ... generateGameData, getSolution, solveRecursive 保持不变 ...
  // ... (省略中间算法代码，与上一次回答一致) ...
  
  // --- 核心算法部分请保留原样 ---
  generateGameData() {
    while (true) {
      let nums = [];
      for (let i = 0; i < 4; i++) nums.push(Math.floor(Math.random() * 10) + 1);
      let numObjs = nums.map(n => ({ val: n, expr: n.toString() }));
      let answer = this.getSolution(numObjs);
      if (answer) return { nums, answer };
    }
  },
  
  getSolution(list) { return this.solveRecursive(list); },

  solveRecursive(list) {
    if (list.length === 1) {
      if (Math.abs(list[0].val - 24) < 0.0001) return list[0].expr;
      return null;
    }
    for (let i = 0; i < list.length; i++) {
      for (let j = 0; j < list.length; j++) {
        if (i === j) continue;
        let newList = [];
        for (let k = 0; k < list.length; k++) {
          if (k !== i && k !== j) newList.push(list[k]);
        }
        const a = list[i], b = list[j];
        let res = this.solveRecursive([...newList, { val: a.val + b.val, expr: `(${a.expr}+${b.expr})` }]);
        if (res) return res;
        res = this.solveRecursive([...newList, { val: a.val - b.val, expr: `(${a.expr}-${b.expr})` }]);
        if (res) return res;
        res = this.solveRecursive([...newList, { val: a.val * b.val, expr: `(${a.expr}×${b.expr})` }]);
        if (res) return res;
        if (b.val !== 0) {
          res = this.solveRecursive([...newList, { val: a.val / b.val, expr: `(${a.expr}÷${b.expr})` }]);
          if (res) return res;
        }
      }
    }
    return null;
  },
  // -------------------------

  // 点击卡片
  onCardTap(e) {
    const idx = e.currentTarget.dataset.index;
    const { selectedIdx, operator } = this.data;
    if (selectedIdx === -1) {
      this.setData({ selectedIdx: idx });
      return;
    }
    if (selectedIdx === idx) {
      this.setData({ selectedIdx: -1, operator: '' });
      return;
    }
    if (operator === '') {
      this.setData({ selectedIdx: idx });
      return;
    }
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

  // 计算逻辑
  calculate(idx1, idx2, op) {
    let cards = [...this.data.cards];
    const c1 = cards[idx1];
    const c2 = cards[idx2];
    
    let resultVal = 0;
    let resultExpr = '';

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
      resultVal = c1.val / c2.val;
      resultExpr = `(${c1.expr}÷${c2.expr})`;
    }

    const historyItem = JSON.parse(JSON.stringify(cards));
    let history = [...this.data.history, historyItem];

    let newCards = cards.filter((_, i) => i !== idx1 && i !== idx2);
    newCards.push({ val: resultVal, id: Date.now(), expr: resultExpr });

    this.setData({
      cards: newCards,
      history: history,
      selectedIdx: -1,
      operator: ''
    });

    if (newCards.length === 1 && Math.abs(newCards[0].val - 24) < 0.0001) {
      this.gameWin();
    }
  },

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

  // [修复] 查看答案
  showAnswer() {
    let ans = this.data.currentAnswer;
    if(ans.startsWith('(') && ans.endsWith(')')) {
        ans = ans.substring(1, ans.length - 1);
    }

    // 只要点击查看答案，就标记为已作弊
    this.setData({ hasUsedHint: true }); 

    wx.showModal({
      title: '参考答案',
      content: ans + ' = 24\n\n查看答案后，本局连胜将中断。',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  nextLevel() {
    wx.showModal({
      title: '跳过',
      content: '跳过本题会中断连胜哦，确定吗？',
      success: (res) => {
        if(res.confirm) {
          this.setData({ score: 0 }); 
          this.startGame();
        }
      }
    });
  },

  // [修复] 游戏胜利逻辑
  gameWin() {
    this.stopTimer();
    wx.vibrateShort({ type: 'heavy' });

    // 检查是否使用了提示
    if (this.data.hasUsedHint) {
      // 1. 如果使用了提示：连胜清零（或保持不变，看你想怎么设计，通常是清零）
      this.setData({ score: 0 }); 

      wx.showModal({
        title: '计算正确', // 标题不给“太棒了”
        content: '使用了提示，本次不计入连胜哦~\n用时：' + this.data.timeStr,
        confirmText: '下一题',
        showCancel: false,
        success: () => {
          this.startGame();
        }
      });

    } else {
      // 2. 正常通关：加分
      const currentScore = this.data.score + 1;
      this.setData({ score: currentScore });

      // 保存记录
      const countKey = 'twentyfour_win_count';
      wx.setStorageSync(countKey, (wx.getStorageSync(countKey) || 0) + 1);
      
      const streakKey = 'twentyfour_max_streak';
      const maxStreak = wx.getStorageSync(streakKey) || 0;
      if (currentScore > maxStreak) {
        wx.setStorageSync(streakKey, currentScore);
      }
      // =========== [新增：计算和保存积分] ===========
      // 基础分 10 分 + 连胜奖励 (连胜几局就多加几分，上限+10)
      const streakBonus = Math.min(currentScore, 10);
      const earnedPoints = 10 + streakBonus;

      // 累加积分
      let totalIntegral = wx.getStorageSync('totalIntegral') || 0;
      totalIntegral += earnedPoints;
      wx.setStorageSync('totalIntegral', totalIntegral);
      
      console.log(`[24点] 胜利！获得 ${earnedPoints} 分 (含连胜 ${streakBonus})，总积分: ${totalIntegral}`);
      // ===========================================

      wx.showModal({
        title: '🎉 算对啦！',
        content: `24点达成！\n用时：${this.data.timeStr}\n\n🎉 获得积分 +${earnedPoints}`,
        confirmText: '下一题',
        cancelText: '上传战绩',
        showCancel: true,      // 确保显示取消按钮
        success: (res) => {
          if (res.confirm) {
            this.startGame();
          } else if (res.cancel) {
            this.uploadScore();
          }
        }
      });
    }
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