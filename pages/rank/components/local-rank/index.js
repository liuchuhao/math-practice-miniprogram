/**
 * 本地排行榜组件
 * pages/rank/components/local-rank/index.js
 */
const localData = require('../../modules/local-data');

Component({
  properties: {
    // 接收外部跳转参数 (例如从游戏结束页跳过来)
    initialParams: {
      type: Object,
      value: null,
      observer: function(newVal) {
        if (newVal && typeof newVal.tab !== 'undefined') {
          // 动态切换到指定的子Tab
          this.setData({ curTab: newVal.tab });
        }
      }
    }
  },

  data: {
    curTab: 0, // 统一使用 curTab 控制标签页 (0:总览, 1:数学游戏, 2:大脑开发)
    tabs: [
      { id: 0, name: '总览', icon: '👤' },
      { id: 1, name: '数学游戏', icon: '🧮' },
      { id: 2, name: '大脑开发', icon: '🧠' }
    ],
    loading: true,
    
    // 用户及统计数据
    userInfo: {},
    totalScore: 0,
    userTitle: '计算小白',
    totalGamesPlayed: 0,
    
    // 数学游戏数据
    schulte3: null, schulte4: null, schulte5: null,
    minesweeperBest: null, minesweeperWins: 0,
    klotski3: null, klotski4: null, klotski5: null,
    twentyfourWins: 0, twentyfourStreak: 0,
    sudokuEasy: 0, sudokuMedium: 0, sudokuHard: 0,
    
    // 大脑开发数据
    floatingBest: null, floatingLevel: 0,
    speedMathBest: null, speedMathLevel: 0,
    digitCodeBest: null, digitCodeLevel: 0,
    qAvatarBest: null, qAvatarLevel: 0,
    hanziCubeBest: null, hanziCubeLevel: 0,
    animalPartyBest: null, animalPartyLevel: 0,
    brainTotalReward: 0
  },

  lifetimes: {
    attached() {
      // 组件加载时，检查是否有外部传入的参数
      if (this.data.initialParams && typeof this.data.initialParams.tab !== 'undefined') {
        this.setData({ curTab: this.data.initialParams.tab });
      }
      this.loadData();
    }
  },

  pageLifetimes: {
    show() {
      // 页面每次显示时重新加载最新数据
      this.loadData();
    }
  },

  methods: {
    switchTab(e) {
      const id = parseInt(e.currentTarget.dataset.id);
      if (id === this.data.curTab) return;
      this.setData({ curTab: id });
    },
    
    loadData() {
      this.setData({ loading: true });
      
      // 使用setTimeout模拟异步，避免UI卡顿
      setTimeout(() => {
        const userInfo = localData.getUserInfo();
        const mathGames = localData.getMathGames();
        const brainGames = localData.getBrainGames();
        
        this.setData({
          ...userInfo,
          ...mathGames,
          ...brainGames,
          loading: false
        });
      }, 50);
    }
  }
});