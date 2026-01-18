// pages/brain-dev/menu/menu.js
Page({
  data: {
    gameList: [
      {
        id: 'floating',
        name: '漂浮乐园',
        desc: '数数空中的星星，唯快不破',
        icon: '✨',
        stars: '⭐⭐',
        colorClass: 'card-floating',
        targetUrl: '/pages/brain-dev/games/floating/index'
      },
      {
        id: 'speed_math',
        name: '速算高手',
        desc: '桌面数字大乱炖，极速求和',
        icon: '🧮',
        stars: '⭐⭐⭐',
        colorClass: 'card-math', // 我在CSS里暂时用了绿色
        targetUrl: '/pages/brain-dev/games/speed-math/index'
      },
      {
        id: 'digit_code',
        name: '数字密码',
        desc: '瞬间记忆，还原数字序列',
        icon: '🔢',
        stars: '⭐⭐⭐⭐',
        colorClass: 'card-code-alt', // 使用亮一点的青色
        targetUrl: '/pages/brain-dev/games/digit-code/index'
      },
      {
        id: 'q_avatar',
        name: 'Q趣头像',
        desc: '过目不忘，找出消失的脸',
        icon: '🤠',
        stars: '⭐⭐⭐',
        colorClass: 'card-avatar',
        targetUrl: '/pages/brain-dev/games/q-avatar/index'
      },
      {
        id: 'hanzi_cube',
        name: '汉字魔方',
        desc: '火眼金睛，找不同部首',
        icon: '🀄',
        stars: '⭐⭐⭐⭐⭐',
        colorClass: 'card-hanzi',
        targetUrl: '/pages/brain-dev/games/hanzi-cube/index'
      },
      {
        id: 'animal_party',
        name: '动物派对',
        desc: '谁是这里出现最多的仔？',
        icon: '🦁',
        stars: '⭐⭐',
        colorClass: 'card-animal',
        targetUrl: '/pages/brain-dev/games/animal-party/index'
      }
    ]
  },
  goRank() {
    wx.navigateTo({
      // tab=1: 本地战绩
      // sub=2: 大脑开发 (根据你的 local-rank 组件里的 tabs 顺序，大脑开发是 id:2)
      url: '/pages/rank/index?tab=1&sub=2'
    });
  },

  onLoad(options) {
    // 可以在这里加载用户之前的最高分记录等
  },

  navigateToGame(e) {
    const { targetUrl, gameId } = e.currentTarget.dataset;
    
    // 增加一个震动反馈，提升游戏感
    wx.vibrateShort();

    // 检查页面是否存在，暂时只打印日志或跳转
    console.log(`准备进入游戏: ${gameId}`);
    
    wx.navigateTo({
      url: targetUrl,
      fail: (err) => {
        // 如果页面还没做，提示一下
        wx.showToast({
          title: '功能开发中...',
          icon: 'none'
        });
        console.error(err);
      }
    });
  }
});