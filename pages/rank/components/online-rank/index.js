/**
 * 在线排行榜组件
 * pages/rank/components/online-rank/index.js
 */
const onlineData = require('../../modules/online-data');

Component({
  properties: {
    initialParams: {
      type: Object,
      value: null,
      observer: function(newVal) {
        if (newVal) this.initFromParams(newVal);
      }
    }
  },
  
  data: {
    curGrade: 1,
    curTab: 1,
    rankType: 'basic', 
    rankList: [],
    loading: true,
    loadError: false,
    errorMsg: '',

    curGameId: 'floating',
    curGameName: '漂浮乐园', 
    
    // ✨ 数学游戏难度相关
    curMathLevel: '', // 当前选中的难度 (例如 '3x3', 'easy')
    mathLevels: [],   // 当前游戏可用的难度列表
    
    levelConfig: {
      schulte: [
        { id: '3x3', name: '3x3' }, { id: '4x4', name: '4x4' }, { id: '5x5', name: '5x5' }
      ],
      klotski: [
        { id: '3x3', name: '3x3' }, { id: '4x4', name: '4x4' }, { id: '5x5', name: '5x5' }
      ],
      sudoku: [
        { id: 'easy', name: '简单' }, { id: 'medium', name: '中等' }, { id: 'hard', name: '困难' }
      ]
    },

    brainDevGames: [
      { id: 'floating',     name: '漂浮乐园' },
      { id: 'speed_math',   name: '速算高手' },
      { id: 'digit_code',   name: '数字密码' },
      { id: 'q_avatar',     name: 'Q趣头像' },
      { id: 'hanzi_cube',   name: '汉字魔方' },
      { id: 'animal_party', name: '动物派对' }
    ],

    mathGames: [
      { id: 'schulte',      name: '舒尔特' },
      { id: 'minesweeper',  name: '扫雷' },
      { id: 'klotski',      name: '华容道' },
      { id: 'twentyfour',   name: '24点' },
      { id: 'sudoku',       name: '数独' }
    ]
  },

  lifetimes: {
    attached() {
      if (this.data.initialParams) {
        this.initFromParams(this.data.initialParams);
      } else {
        this.getRankData();
      }
    }
  },

  methods: {
    initFromParams(params) {
      let type = params.type || 'basic';
      let gameId = params.gameId || 'floating';

      const isMath = this.data.mathGames.some(g => g.id === gameId);
      if (isMath && type === 'brain') type = 'math';

      const gameName = this.findGameName(gameId);
      
      // ✨ 初始化时也要更新难度选项
      this.updateLevelTabs(gameId);

      this.setData({
        curGrade: params.grade || 1,
        rankType: type,
        curGameId: gameId,
        curGameName: gameName,
        rankList: [], 
        loadError: false
      }, () => {
        this.getRankData();
      });
    },

    findGameName(gid) {
      const all = [...this.data.brainDevGames, ...this.data.mathGames];
      const found = all.find(g => g.id === gid);
      return found ? found.name : '当前游戏';
    },

    // ✨ 核心逻辑：更新难度选项卡
    updateLevelTabs(gameId) {
      const config = this.data.levelConfig[gameId];
      if (config) {
        this.setData({
          mathLevels: config,
          curMathLevel: config[0].id // 默认选中第一个难度
        });
      } else {
        // 如果没有配置难度（比如24点/扫雷暂时没有），清空
        this.setData({ mathLevels: [], curMathLevel: '' });
      }
    },

    // ✨ 切换难度
    changeMathLevel(e) {
      const level = e.currentTarget.dataset.id;
      if (level === this.data.curMathLevel) return;
      this.setData({ curMathLevel: level, rankList: [], loadError: false });
      this.getRankData();
    },

    changeRankType(e) {
      const type = e.currentTarget.dataset.type;
      if (type === this.data.rankType) return;

      let defaultGame = '';
      if (type === 'brain') defaultGame = 'floating';
      if (type === 'math') defaultGame = 'schulte';

      // 切换 Tab 时也要更新默认游戏的难度选项
      this.updateLevelTabs(defaultGame);

      this.setData({ 
        rankType: type, 
        curGameId: defaultGame, 
        curGameName: this.findGameName(defaultGame),
        rankList: [], 
        loadError: false 
      });
      this.getRankData();
    },
    
    switchTab(e) {
      const index = parseInt(e.currentTarget.dataset.index);
      if (index === this.data.curTab) return;
      this.setData({ curTab: index, rankList: [], loadError: false });
      this.getRankData();
    },
    
    changeGrade(e) {
      const grade = parseInt(e.currentTarget.dataset.grade);
      if (grade === this.data.curGrade) return;
      this.setData({ curGrade: grade, rankList: [], loadError: false });
      this.getRankData();
    },

    changeGame(e) {
      const gid = e.currentTarget.dataset.id;
      if (gid === this.data.curGameId) return;
      
      // ✨ 切换游戏时更新难度
      this.updateLevelTabs(gid);
      
      this.setData({ 
        curGameId: gid, 
        curGameName: this.findGameName(gid), 
        rankList: [], 
        loadError: false 
      });
      this.getRankData();
    },
    
    async getRankData() {
      const { curGrade, curTab, rankType, curGameId, curMathLevel } = this.data;
      this.setData({ loading: true, loadError: false });
      
      try {
        let list = [];
        if (rankType === 'brain' || rankType === 'math') {
          // ✨ 请求时带上 level 参数
          // 只有当存在有效的 mathLevels 时才传 level，避免传错
          let queryLevel = '';
          if (this.data.mathLevels.length > 0) {
            queryLevel = curMathLevel;
          }

          list = await onlineData.getBrainRankList({ 
            gameId: curGameId,
            level: queryLevel 
          });
        } else {
          list = await onlineData.getRankList({
            grade: curGrade,
            type: rankType,
            isTopRank: curTab === 1
          });
        }
        this.setData({ rankList: list, loading: false });
      } catch (err) {
        console.error('加载排行榜失败:', err);
        this.setData({ loading: false, loadError: true, errorMsg: '服务器繁忙，请稍后再试' });
      }
    },
    
    refresh() { this.getRankData(); },
    retryLoad() { this.getRankData(); },
    
    startChallenge() {
      const hasUserInfo = onlineData.checkUserInfo();
      if (hasUserInfo) {
        this.navigateToPractice();
      } else {
        wx.showModal({
          title: '温馨提示',
          content: '您还没有设置昵称头像，成绩将无法计入榜单',
          cancelText: '匿名挑战',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) wx.reLaunch({ url: '/pages/index/index' });
            else if (res.cancel) this.navigateToPractice();
          }
        });
      }
    },
    
    navigateToPractice() {
      const { curGrade, rankType, curGameId } = this.data;
      const folderName = curGameId.replace(/_/g, '-');

      if (rankType === 'brain') {
        const url = `/pages/brain-dev/games/${folderName}/index`;
        wx.navigateTo({ url, fail: () => wx.showToast({ title: '敬请期待', icon: 'none' }) });
      } 
      else if (rankType === 'math') {
        const url = `/pages/math_game/${folderName}/${folderName}`;
        wx.navigateTo({ url, fail: () => wx.showToast({ title: '敬请期待', icon: 'none' }) });
      } 
      else if (rankType === 'advanced') {
        wx.navigateTo({ url: `/pages/practice_advanced/practice_advanced?grade=${curGrade}` });
      } else {
        wx.navigateTo({ url: `/pages/practice/practice?grade=${curGrade}&gradeName=${curGrade}年级` });
      }
    }
  }
});