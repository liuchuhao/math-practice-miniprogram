// pages/store/store.js
Page({
  data: {
    myPoints: 0,
    ownedList: [], // 已拥有的头像框ID列表
    currentFrameId: 0, // 当前佩戴的ID (0代表没戴)
    
    // 商品列表 (使用 UrlEncoded SVG，兼容性更好)
    goodsList: [
      { 
        id: 1, 
        name: '青铜边框', 
        price: 200, 
        // 1. 青铜 (Bronze)
        img: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjY2Q3ZjMyIiBzdHJva2Utd2lkdGg9IjYiIC8+PC9zdmc+"
      },
      { 
        id: 2, 
        name: '白银边框', 
        price: 500, 
        // 2. 白银 (Silver)
        img: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYzBjMGMwIiBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZS1kYXNoYXJyYXk9IjEwIDUiIC8+PC9zdmc+"
      },
      { 
        id: 3, 
        name: '黄金边框', 
        price: 1000, 
        // 3. 黄金 (Gold)
        img: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utd2lkdGg9IjQiIC8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMzgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0ZGQTUwMCIgc3Ryb2tlLXdpZHRoPSIyIiAvPjwvc3ZnPg=="
      },
      { 
        id: 4, 
        name: '王者光环', 
        price: 2000, 
        // 4. 王者 (Blue Glow)
        img: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDBCRkZGIiBzdHJva2Utd2lkdGg9IjUiIG9wYWNpdHk9IjAuNiIgLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDBCRkZGIiBzdHJva2Utd2lkdGg9IjIiIC8+PHBhdGggZD0iTTUwIDIgTDU1IDEyIEw0NSAxMiBaIiBmaWxsPSIjMDBCRkZGIiAvPjwvc3ZnPg=="
      },
      { 
        id: 5, 
        name: '至尊特效', 
        price: 5000, 
        // 5. 至尊 (Purple)
        img: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOTQwMEQzIiBzdHJva2Utd2lkdGg9IjYiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkYwMEZGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1kYXNoYXJyYXk9IjEwIDUiLz48L3N2Zz4="
      }
    ]
  },

  onShow: function () {
    this.refreshData();
  },

  refreshData: function() {
    // 1. 读取积分
    const points = wx.getStorageSync('totalIntegral') || 0;
    // 2. 读取已拥有列表 (默认为空)
    const owned = wx.getStorageSync('myFrames') || [];
    // 3. 读取当前佩戴 (默认为0)
    const current = wx.getStorageSync('currentFrameId') || 0;

    this.setData({
      myPoints: points,
      ownedList: owned,
      currentFrameId: current
    });
  },

  // 购买头像框
  buyFrame: function(e) {
    const item = e.currentTarget.dataset.item;
    
    if (this.data.myPoints < item.price) {
      wx.showToast({ title: '积分不足', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认兑换',
      content: `确定消耗 ${item.price} 积分兑换【${item.name}】吗？`,
      success: (res) => {
        if (res.confirm) {
          // 1. 扣分
          const newPoints = this.data.myPoints - item.price;
          wx.setStorageSync('totalIntegral', newPoints);

          // 2. 加入已拥有
          const newOwned = [...this.data.ownedList, item.id];
          wx.setStorageSync('myFrames', newOwned);

          // 3. 刷新界面
          this.refreshData();
          wx.showToast({ title: '兑换成功', icon: 'success' });
        }
      }
    });
  },

  // 佩戴头像框
  useFrame: function(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.setStorageSync('currentFrameId', id);
    this.setData({ currentFrameId: id });
    
    wx.showToast({ title: '佩戴成功', icon: 'success' });
  },

  // 卸下头像框
  unequip: function() {
    wx.setStorageSync('currentFrameId', 0);
    this.setData({ currentFrameId: 0 });
    wx.showToast({ title: '已恢复默认', icon: 'none' });
  }
});