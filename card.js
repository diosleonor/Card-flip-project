const GAME_STATE = { // 狀態機
	FirstCardAwaits:'FirstCardAwaits',
	SecondCardAwaits:'SecondCardAwaits',
	CardsMatchFailed:'CardsMatchFailed',
	CardsMatch:'CardsMatch',
	GameFinished:'GameFinished'
}

const Symbols = [ // 首字母大寫的意思是常數儲存的資料不會變動
	'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]

// MVC模組化架構
const model = {
	revealedCards : [],
	isRevealedCardsMatched(){
		return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
	},
	score: 0,
	trials: 0
}

const view = {
	transfromNumber(number){
  	switch(number){
  		case 1:
  			return 'A'
  		case 11:
  			return 'J'
  		case 12:
  			return 'Q'
  		case 13:
  			return 'K'
  		default:
        return number
  	}
  },
  flipCards(...cards){
  	cards.map(card => {
  		if(card.classList.contains('back')){
  		card.classList.remove('back')
  		card.innerHTML = this.getCardContent(parseInt(card.dataset.index))
  		return
  	}
  	card.classList.add('back')
  	card.innerHTML = null
  	})
  },
  getCardContent(index){
  	const number = this.transfromNumber((index % 13) + 1)
  	const symbol = Symbols[Math.floor(index/13)]
  	return `<p>${number}</p>
        <img src="${symbol}">
        <p>${number}</p>`
  },
  getCardElement (index) {
    return `
      <div data-index='${index}' class="card back"></div>
    `
  },
  displayCards (indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  pairCards(...cards){
  	cards.map( card => {
  		card.classList.add('paired')
  	})
  },
  renderScore(score){
  	document.querySelector('.score').textContent = `Score: ${score}`
  },
  renderTrials(trials){
  	document.querySelector('.tried').textContent = `You've tried: ${trials} times`
  },
 	appendWrongAnimation(...cards){
		cards.map(card => {
			card.classList.add('wrong')
			card.addEventListener('animationend',event => 
				event.target.classList.remove('wrong'), {once: true})
		})
	},
	showGamefinished(){
		const div = document.createElement('div')
		div.classList.add('completed')
		div.innerHTML = `<p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.trials} times</p>`
    const header = document.querySelector('#header')
    header.before(div)
	}
}

const controller = {
	currentState : GAME_STATE.FirstCardAwaits,
	generateCards(){
		view.displayCards(utility.getRandomNumberArr(52))
	},
	dispatchCardAction(card){
		if(!card.classList.contains('back')){
			return
		}
		switch(this.currentState){
			case GAME_STATE.FirstCardAwaits:
				view.flipCards(card)
				this.currentState = GAME_STATE.SecondCardAwaits
				model.revealedCards.push(card)
				break
			case GAME_STATE.SecondCardAwaits:
				view.renderTrials(++model.trials)
				view.flipCards(card)
				model.revealedCards.push(card)
				if(model.isRevealedCardsMatched()){
					// CardsMatched
					view.renderScore(model.score += 10)
					this.currentState = GAME_STATE.CardsMatch
					view.pairCards(...model.revealedCards)
					model.revealedCards = []
					// All cards have been matched.(Judge by score.)
					if(model.score === 260){
						console.log('showGamefinished')
						this.currentState = GAME_STATE.GameFinished
						view.showGamefinished()
						return
					}
					this.currentState = GAME_STATE.FirstCardAwaits
				} else {
					// CardsMatchFailed
					// 用setTimeout讓兩張配對失敗卡面停留一秒後翻面
					this.currentState = GAME_STATE.CardsMatchFailed
					view.appendWrongAnimation(...model.revealedCards)
					setTimeout(this.resetCards, 1000)
				}
				break
		}
	},
	resetCards(){
		view.flipCards(...model.revealedCards)
		model.revealedCards = []
		controller.currentState = GAME_STATE.FirstCardAwaits
	}
}

// 外掛函式庫
const utility = {
	getRandomNumberArr(count){
		const number = Array.from(Array(count).keys())
		for(let index = number.length - 1; index > 0; index--){
			let randomIndex = Math.floor(Math.random() * (index+1));
			[number[index],number[randomIndex]] = [number[randomIndex],number[index]]
		}
		return number
	}
}


controller.generateCards()


// 卡片監聽器
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})