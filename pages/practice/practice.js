Page({
  data: {
    currentQuestion: 1,
    totalQuestions: 10,
    score: 0,
    userAnswer: '',
    question: '',
    correctAnswer: 0,
    grade: 1
  },
  
  onLoad: function(options) {
    const grade = parseInt(options.grade) || 1
    this.setData({ grade: grade })
    this.generateQuestion()
  },
  
  // 生成题目
  generateQuestion: function() {
    const grade = this.data.grade
    let num1, num2, operator, answer
    
    // 根据年级生成不同难度的题目
    if (grade === 1) {
      num1 = Math.floor(Math.random() * 10) + 1
      num2 = Math.floor(Math.random() * 10) + 1
      operator = Math.random() > 0.5 ? '+' : '-'
    } else if (grade === 2) {
      num1 = Math.floor(Math.random() * 50) + 1
      num2 = Math.floor(Math.random() * 50) + 1
      const operators = ['+', '-']
      operator = operators[Math.floor(Math.random() * operators.length)]
    }
    // ... 其他年级的逻辑
    
    // 计算答案
    switch(operator) {
      case '+': answer = num1 + num2; break;
      case '-': answer = num1 - num2; break;
      case '×': answer = num1 * num2; break;
      case '÷': answer = num1 / num2; break;
    }
    
    this.setData({
      question: `${num1} ${operator} ${num2} = ?`,
      correctAnswer: answer
    })
  },
  
  // 输入答案
  onInput: function(e) {
    this.setData({ userAnswer: e.detail.value })
  },
  
  // 提交答案
  submitAnswer: function() {
    const userAnswer = parseFloat(this.data.userAnswer)
    const correctAnswer = this.data.correctAnswer
    
    if (Math.abs(userAnswer - correctAnswer) < 0.01) {
      this.setData({ score: this.data.score + 1 })
      wx.showToast({ title: '正确！', icon: 'success' })
    } else {
      wx.showToast({ title: `正确答案：${correctAnswer}`, icon: 'none' })
    }
    
    // 下一题
    setTimeout(() => {
      const nextQuestion = this.data.currentQuestion + 1
      if (nextQuestion > this.data.totalQuestions) {
        this.showResult()
      } else {
        this.setData({
          currentQuestion: nextQuestion,
          userAnswer: ''
        })
        this.generateQuestion()
      }
    }, 1500)
  },
  
  // 显示结果
  showResult: function() {
    const score = this.data.score
    const total = this.data.totalQuestions
  
    wx.navigateTo({
      url: `/pages/result/result?score=${score}&total=${total}&grade=${this.data.grade}`
    })
  }
})