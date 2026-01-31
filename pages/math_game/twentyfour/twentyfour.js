// pages/math_game/twentyfour/twentyfour.js
const gameService = require('../../brain-dev/games/common/game-service.js');

Page({
  data: {
    cards: [],
    history: [],
    selectedIdx: -1,
    operator: '',

    score: 0,   // 当前连胜次数 (用于排行榜)
    points: 0,  // 用户总积分 (用于显示)
    
    startTime: 0,
    timer: null,
    timeStr: '00:00',

    currentAnswer: '',
    hasUsedHint: false 
  },

  onLoad() {
    // 初始化时，读取本地存储的总积分
    const savedPoints = wx.getStorageSync('totalIntegral') || 0;
    this.setData({ points: savedPoints });
    
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
      hasUsedHint: false 
    });

    this.startTimer();
  },

  // --- 核心算法 (只能整除) ---
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
      if (list[0].val === 24) return list[0].expr;
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
        
        // ✨ 只能整除逻辑
        if (b.val !== 0 && a.val % b.val === 0) {
          res = this.solveRecursive([...newList, { val: a.val / b.val, expr: `(${a.expr}÷${b.expr})` }]);
          if (res) return res;
        }
      }
    }
    return null;
  },

  // --- 交互逻辑 ---
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

  onOpTap(e) {
    const op = e.currentTarget.dataset.op;
    if (this.data.selectedIdx === -1) {
      wx.showToast({ title: '请先选数字', icon: 'none' });
      return;
    }
    this.setData({ operator: op });
  },

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
      // ✨ 必须整除
      if (c1.val % c2.val !== 0) {
        wx.showToast({ title: '只能整除', icon: 'none' });
        this.setData({ operator: '' }); // 重置操作符方便重新选
        return;
      }
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

    if (newCards.length === 1 && newCards[0].val === 24) {
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

  showAnswer() {
    let ans = this.data.currentAnswer;
    if(ans.startsWith('(') && ans.endsWith(')')) ans = ans.substring(1, ans.length - 1);

    this.setData({ hasUsedHint: true }); 

    wx.showModal({
      title: '参考答案',
      content: ans + ' = 24\n\n提示：查看答案后，连胜中断且不加分。',
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
          this.setData({ score: 0 }); // 连胜清零
          this.startGame();
        }
      }
    });
  },

  // --- 胜利结算逻辑 ---
  gameWin() {
    this.stopTimer();
    wx.vibrateShort({ type: 'heavy' });

    if (this.data.hasUsedHint) {
      // 使用提示：连胜中断，不加积分
      this.setData({ score: 0 }); 
      wx.showModal({
        title: '计算正确',
        content: '使用了提示，本次不获得积分，连胜中断~',
        confirmText: '下一题',
        showCancel: false,
        success: () => { this.startGame(); }
      });
    } else {
      // 1. 处理连胜 (Streak)
      const currentStreak = this.data.score + 1;
      
      // 2. 处理积分 (Points) - 固定 +50 分
      const earnedPoints = 50; 
      const newTotalPoints = this.data.points + earnedPoints;

      // 更新页面数据
      this.setData({ 
        score: currentStreak,
        points: newTotalPoints
      });

      // 3. 存储数据
      // 存总积分
      wx.setStorageSync('totalIntegral', newTotalPoints);
      
      // 存连胜记录
      const countKey = 'twentyfour_win_count';
      wx.setStorageSync(countKey, (wx.getStorageSync(countKey) || 0) + 1);
      
      const streakKey = 'twentyfour_max_streak';
      const maxStreak = wx.getStorageSync(streakKey) || 0;
      if (currentStreak > maxStreak) {
        wx.setStorageSync(streakKey, currentStreak);
      }
      wx.setStorageSync('total_game_count', (wx.getStorageSync('total_game_count') || 0) + 1);

      // 4. 准备上传数据 
      // 注意：这里 Score 字段传的是连胜次数(用于排名)，也可以改成 newTotalPoints 取决于你的排行榜规则
      const timeParts = this.data.timeStr.split(':');
      const seconds = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);

      const uploadData = {
        gameId: 'twentyfour',
        level: 'normal',
        score: currentStreak, // 战绩上传连胜次数
        avgTime: seconds
      };

      console.log(`[24点] 连胜: ${currentStreak}, 积分: ${this.data.points} (+${earnedPoints})`);

      wx.showModal({
        title: '🎉 算对啦！',
        content: `24点达成！\n\n🔥 当前连胜：${currentStreak}\n💰 获得积分：+${earnedPoints}\n🏆 总积分：${newTotalPoints}`,
        confirmText: '下一题',
        cancelText: '上传战绩',
        showCancel: true,
        success: (res) => {
          if (res.confirm) {
            this.startGame();
          } else if (res.cancel) {
            this.uploadScore(uploadData);
          }
        }
      });
    }
  },

  uploadScore(data) {
    wx.showLoading({ title: '上传中...' });
    gameService.uploadRecord(data).then(res => {
      wx.hideLoading();
      if (res.success && res.uploaded !== false) {
        wx.showToast({ title: '上传成功', icon: 'success' });
      } else if (res.uploaded === false) {
        wx.showToast({ title: '连胜未破纪录', icon: 'none' });
      } else {
        wx.showToast({ title: '上传失败', icon: 'none' });
      }
      setTimeout(() => { this.startGame(); }, 1500);
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
  }
});