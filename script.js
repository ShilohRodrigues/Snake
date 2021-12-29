//DOM elements
const game = document.getElementById("game")
const startText = document.getElementById("start-text")
const score = document.getElementById("score")
const highscore = document.getElementById("highscore")
const divStart = document.getElementById("start-div")
const btnStart = document.getElementById("start-btn")
const btnSett = document.getElementById("setting-btn")
const formSett = document.getElementById("settings")
const btnSave = document.getElementById("save-btn")
const snakeClass = document.getElementsByClassName("snake")
const appleClass = document.getElementsByClassName("apple")
const endScreen = document.getElementById('end-screen')
const btnClose = document.getElementById('close-btn')
const endScore = document.getElementById('end-score')

//Form elements for settings
const speedSlider = document.getElementById("speed")
const sizeSlider = document.getElementById("size")
const growthSlider = document.getElementById("growth-factor")
const snakeColorSel = document.getElementById("s-color")
const appleColorSel = document.getElementById("a-color")

//Variables to track direction
const direction = { x:1, y:0 }
let lastDir = { x:0, y:0 }

//Game settings
let grid_col_rows//Amount of columns and rows in our game grid
let speed = 10 //speed of the snake (i.e. difficulty of the game)
let snakeGrowFactor = 5 //Amount the snake grows by
let snakeColor = '#000000'
let appleColor = '#FF0000'

let lastFrameTime = 0 //time since the last frame was rendered
let gameRunning = false; //Flag to track if the game has started or not
const turns = []

//Create the snake array and initialize it with the head of the snake in the center
const snake = [
  { x: grid_col_rows / 2, y: grid_col_rows / 2 }
]
//Object for the apple position
const apple = { x:0 , y:0 }

setGameSettings()
function setGameSettings() {

  //Get highscore if it exists
  if (localStorage.getItem('highscore')) {
    highscore.innerHTML = localStorage.getItem('highscore')
  }
  else {
    highscore.innerHTML = 0
  }

  //Set the size of the grid
  switch (sizeSlider.value) {
    case '1':
      grid_col_rows = 50
      break
    case '2':
      grid_col_rows = 40
      break
    case '3':
      grid_col_rows = 30
      break
    case '4':
      grid_col_rows = 20
      break
    case '5':
      grid_col_rows = 10
      break
  }

  //Set the speed
  switch (speedSlider.value) {
    case '1':
      speed = 4
      break
    case '2':
      speed = 7
      break
    case '3':
      speed = 10
      break
    case '4':
      speed = 15
      break
    case '5':
      speed = 20
      break
  }

  //Set the amount the snake grows by
  snakeGrowFactor = growthSlider.value;

  //Set colors
  snakeColor = snakeColorSel.value;
  appleColor = appleColorSel.value;

}

//Start button
btnStart.addEventListener('click', () => {
  divStart.classList.add('hide')
  startText.classList.remove('hide')
  window.addEventListener('keydown', keyDownEvent)
})

//Settings button
btnSett.addEventListener('click', () => {
  divStart.classList.add('hide')
  formSett.classList.remove('hide')
}) 

//Settings submit 
btnSave.addEventListener('click', e => {
  e.preventDefault()
  setGameSettings();
  divStart.classList.remove('hide')
  formSett.classList.add('hide')
})

btnClose.addEventListener('click', () => {
  endScreen.classList.add('hide')
  divStart.classList.remove('hide')
})

//Event listener to listen for the arrow key down
function keyDownEvent(e) {
  turns.unshift(e.key) //Add the turn to the beginning of the turn array
  if (!gameRunning) startGame() //Start the game if it hasnt been started yet
}

function startGame() {

  gameRunning = true

  //Prepare the game grid
  game.style.setProperty('grid-template-columns', `repeat(${grid_col_rows}, 1fr)`)
  game.style.setProperty('grid-template-rows', `repeat(${grid_col_rows}, 1fr)`)

  //Put the snake in center of the screen
  snake[0].x = grid_col_rows / 2
  snake[0].y = grid_col_rows / 2

  //Set the apple to a random position
  moveApple();

  //Hide the start text
  startText.classList.add('hide')

  //Call the gameLoop function when a frame is ready 
  window.requestAnimationFrame(gameLoop)

}

function gameLoop(timestamp) {

  //Break out of the gameloop if the game is done 
  if (!gameRunning) { 
    game.innerHTML = ''
    direction.x = 1
    direction.y = 0
    lastDir = { x:0, y:0 }
    return
  }

  //Call the gameloop function recursively
  window.requestAnimationFrame(gameLoop)
  //Get the time between the last rendered frame to the current time, convert to seconds
  const timeSinceLastFrame = (timestamp - lastFrameTime) / 1000
  //Check if the time from the last render is less than the speed time.. dont update the last frame time if not
  if (timeSinceLastFrame < 1/speed) return
  //Update the time since the last frame
  lastFrameTime = timestamp

  processTurns()
  moveSnake()
  drawPieces()
  
}

function processTurns() {

  lastDir = direction
  switch (turns[turns.length-1]) {
    case 'ArrowUp':
      if (lastDir.y !== 0) break
      direction.x = 0
      direction.y = -1
      break
    case 'ArrowDown':
      if (lastDir.y !== 0) break
      direction.x = 0
      direction.y = 1
      break
    case 'ArrowLeft':
      if (lastDir.x !== 0) break
      direction.x = -1
      direction.y = 0
      break
    case 'ArrowRight':
      if (lastDir.x !== 0) break
      direction.x = 1
      direction.y = 0
      break
  }
  
  turns.pop() //Remove the turn at the end of the arr

}

function moveSnake() {

  //Start at the end of the snake and move every snake reference to the one after it
  for (let i = snake.length-2; i>=0; i--) {
    snake[i+1] = { ...snake[i] }
  }

  //Move the head to the new position
  snake[0].y += direction.y
  snake[0].x += direction.x

  //Check if the head of the snake is outside the game board, end the game if it is
  if (snake[0].x > grid_col_rows || snake[0].x == 0 || 
    snake[0].y > grid_col_rows || snake[0].y == 0) {
    endGame()
  }

  //Check if the snake is on top of its own body
  if (checkIfOnSnake(snake[0].x, snake[0].y, false)) {
    endGame()
  }

  //Check if the snake is on top of an apple
  if (snake[0].x == apple.x && snake[0].y == apple.y) {
    feedSnake()
  }

}

function feedSnake() {

  //Add another snake body coordinate object to the array
  for (let i = 0; i<snakeGrowFactor; i++) {
    const tempSnake = { x: snake[0].x, y: snake[0].y }
    snake.push(tempSnake)
  }

  //update the score 
  score.innerHTML = parseFloat(score.innerHTML) + 1
  moveApple()

}

function drawPieces() {

  //Delete previously drawn pieces before drawing the new ones
  game.innerHTML = ''

  //Draw the apple
  const apl = document.createElement('div')
  apl.style.gridColumnStart = apple.x
  apl.style.gridRowStart = apple.y
  apl.style.backgroundColor = appleColor
  apl.classList.add('apple')
  game.appendChild(apl)

  //Loop for each snake body piece
  snake.forEach(snakePiece => {
    //Create the new snake piece
    const snakeEl = document.createElement('div')
    snakeEl.style.gridRowStart = snakePiece.y
    snakeEl.style.gridColumnStart = snakePiece.x
    snakeEl.style.backgroundColor = snakeColor
    snakeEl.classList.add('snake')
    game.appendChild(snakeEl)
  })

}

function moveApple() {

  //loop until random position is found within the board and not on the snake
  let applePositionX, applePositionY
  do {
    applePositionX = Math.ceil(Math.random() * grid_col_rows)
    applePositionY = Math.ceil(Math.random() * grid_col_rows)
  }
  while(checkIfOnSnake(applePositionX, applePositionY, true))
  
  apple.x = applePositionX
  apple.y = applePositionY

}

//check head parameter is a flag to indicate whether or not the head of snake should be included in the check loop
function checkIfOnSnake(x, y, checkHead) {
  //Loops for each snake element and checks whether the entered position is equal to any of the snakes body parts
  let flag = false
  snake.forEach((element, index) => {
    if (!checkHead && index == 0) return //Skip if on the head
    if (x == element.x && y == element.y) {
      flag = true
      return
    }
  })
  return flag
}

function endGame() {

  gameRunning = false

  //Check if new score is above highscore if one exists in the localstorage
  if (localStorage.getItem("highscore")) {
    if(parseFloat(localStorage.getItem("highscore")) < parseFloat(score.innerHTML)) {
      localStorage.setItem("highscore", score.innerHTML)
    }
  }
  else {
    localStorage.setItem("highscore", score.innerHTML)
  }

  highscore.innerHTML = localStorage.getItem("highscore")

  endScore.innerText = score.innerText
  endScreen.classList.remove('hide')
  score.innerHTML = 0
  snake.length = 1
  window.removeEventListener('keydown', keyDownEvent)

}