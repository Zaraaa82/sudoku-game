/*------------------------ Cached Element References ------------------------*/
// Start Screen
const startScreenEl = document.querySelector('#start-screen');
const startScreenBtnEl = document.querySelector('#start-Screen-btn');
// Header controllers
const restartBtnEl = document.querySelector('#restart-game-btn');
const NewGametnEl = document.querySelector('#new-game-btn');

// Levels elements
const difficultyBackdrop = document.querySelector('#difficulty-backdrop');
const levelsEl = document.querySelector('.levels');

// Board Elements
const boardEl = document.querySelector("#board");
const cellEls = [...document.querySelectorAll('.cell')];

// Input Panel Elements 
const inputPanelEl = document.querySelector('#input-panel');
const numberBtnEls = [...document.querySelectorAll(".number-btn")];

// Status Elements
const difficultyEl = document.querySelector('#difficulty-status');
const heartEls = [...document.querySelectorAll(' .heart.chance')];
const [timeEl, timerBtnEl] = [...document.querySelectorAll('#timer-control *')]

// Controller Elements
const eraseBtnEl = document.querySelector('#erase-btn');
const notesBtnEl = document.querySelector('#notes-btn');

// Popup Elements
const popupbackdropEl = document.querySelector('#popup-backdrop');
const [popupImgEl,popupHeaderEl,popupstatusEl,popupMessageEl, popupPrimaryBtnEl, popupSecondaryBtnEl] = [...document.querySelectorAll('#popup .pop-element')];
const popupDifficultyEl = document.querySelector('#popup-difficulty');
const popupheartsEls = [...document.querySelectorAll('#popup-mistakes .heart')];
const popupTimeEl = document.querySelector('#popup-time');

/*-------------------------------- Constants --------------------------------*/
const boardCells = []; // Store cell Elements in 2D
const notes = [];
let puzzle = [];

let solution = [];

let solutionCount =0;

/*---------------------------- Variables (state) ----------------------------*/
// Selected Cell variables
let selectedCell = null;
let selectedRow = -1;
let selectedCol = -1;
let cellValue = null;
let rowCells = [];
let colCells = [];
let boxCells = [];
let relatedCells = [];
let selectedSameNumber = [];

// Game status Variables
let currentDifficulty; // will be changed later
let mistakesCounter = 0;
let timer = null;
let time = {
    seconds: 0,
    minutes: 0
}

let correctCellTracker = {
    '1':0,
    '2':0,
    '3':0,
    '4':0,
    '5':0,
    '6':0,
    '7':0,
    '8':0,
    '9':0,
}

let isTakingNotes = false;

/*--------------------------- Game Initialization ---------------------------*/
initializeGame();

function initializeGame(){
    fetchCells();
    createNotes();
}
/*------------------------------- Game Setup -------------------------------*/

function fetchCells() {
    for (let row = 0; row < 9; row++) {
        boardCells.push(cellEls.slice(row * 9, row * 9 + 9));
    }
}
function createNotes(){
    for(let row=0 ; row<9 ; row++){
        notes.push([]);
        for(let col=0 ; col<9 ;col++){
            notes[row].push([]);
            let noteGrid = document.createElement('div');
            noteGrid.classList.add('note-grid');
            let gridObject = {grid: noteGrid, cells: []};
            for(let i=1 ; i<=9 ; i++){
                let noteEl = document.createElement('div');
                noteEl.classList.add('note-cell');
                noteEl.dataset.note = i;
                gridObject.cells.push(noteEl);
                noteGrid.append(noteEl);            
            }
            notes[row][col]=gridObject;
        }
    }
}
function loadPuzzle(){
    puzzle.forEach((row, rowIndex)=>{
        row.forEach((cell, colIndex)=>{
            if(cell){
                boardCells[rowIndex][colIndex].textContent = cell;
                correctCellTracker[cell]++;
                updateClassList(boardCells[rowIndex][colIndex],'add', 'fixed');
            }
        })
    })
}

function selectStartingCell(){
    let firstSelect = cellEls.find(cell=> !cell.classList.contains('fixed'));
    setSelectedCell(firstSelect);
}



/*------------------------------ Game Lifecycle -----------------------------*/


function beginGame() {
    buildGame();
    clearBoard();
    loadPuzzle();
    selectStartingCell();
    startTimer();
}
function restartGame(){
    clearBoard();
    loadPuzzle();
    selectStartingCell();
    startTimer();
}
function closeGame(){
    manageStartScreen('remove');
}

function clearBoard(){
    cellEls.forEach(cell=>{
        cell.textContent = '';
        cell.classList = 'cell';
    });
    heartEls.forEach(heart => {
        heart.src = './assets/images/Remaining-chance.png';
        heart.alt = 'Lost Chance';
    });
    mistakesCounter = 0;
    for(let key in correctCellTracker){
        correctCellTracker[key] = 0;
    }
    numberBtnEls.forEach(number => updateClassList(number, 'remove', 'hidden'))
    clearSelected();
    clearTimer();
    clearAllNotes();

}
function clearSelected(){
    selectedCell = null;
    selectedRow = -1;
    selectedCol = -1;
    cellValue = null;

    rowCells = [];
    colCells = [];
    boxCells = [];
    relatedCells = [];
    selectedSameNumber = [];
}


/*------------------------- Sudoku Generation -------------------------------*/

function buildGame(){
     solution.length = 0;
    for(let r=0; r<9; r++){
        solution.push([]);
        for(let c=0; c<9; c++){
            solution[r][c] = '';
        }
    }
    generateSolution(solution);
    generatePuzzle(currentDifficulty);
}


// Generation:

function generateSolution(board) {
    let {row,col} = {...findFirstEmpty(board)};

    if(row === -1 && col === -1){
        return true;
    }

    let numbers = shuffledNumbers();

    for(let i=0; i < numbers.length ; i++){
        // if the number is valid Place it
        if(isValidPlacement(board, row, col, numbers[i])){
            board[row][col] = numbers[i];
            if(generateSolution(board)){
                return true;
            }else{
                // Backtrack if the placement result in no solution
                board[row][col] = '';
            }
        }
    }
    // If there is no solution for current empty cell
    return false;
   
}

function generatePuzzle(difficulty) {
    puzzle = copyBoard(solution);

    let removeCount = 0;
    switch(difficulty){
        case 'Easy':
            removeCount = 35;
            break;
        case 'Medium':
            removeCount = 45;
            break;
        case 'Hard':
            removeCount = 55;
            break;
    }
    let positions = shuffledPositions();

    // Try removing cells in random order
    for(let {row, col} of positions){
        let cellValue = puzzle[row][col];

        // Skip empty cells
        if(cellValue){

            // Remove the cell
            puzzle[row][col] ='';

            // Check if the solution is still unique
            solutionCount = 0;
            countSolutions(puzzle);
            
            if(solutionCount === 1){
                // Keep the cell empty
                removeCount--;
                if(removeCount === 0){
                    break;
                }
            }else{
                // Put the number back
                puzzle[row][col] = cellValue;
            }
        }
    }

}

// Uniqueness Checker:
function countSolutions(board){
    let {row,col} = findFirstEmpty(board);
    
    // Stopping Condition 
    if(row === -1 && col === -1){
        solutionCount++;
        return;
    }

    for(let number = 1; number <=9  ; number++){
        if(isValidPlacement(board, row, col, number)){
            board[row][col] = number;

            // Check all possible solutions after placing this number
            countSolutions(board);

            // Remove the number and try the next possibility
            board[row][col] = '';

            // Stop if another solution has already been found
            if(solutionCount >= 2){
                return;
            }
            
        }
    }
}

// Generation Helpers:

function findFirstEmpty(board){
    for(let row=0; row<9 ; row++){
        for(let col=0; col<9 ; col++){
            if(board[row][col] === ''){
                return {row: row, col:col};
            }
        }
    }
    return {row:-1, col:-1};
}

function isValidPlacement(board, row, col, number) {
    const boxStartRow = Math.floor(row/3) * 3;
    const boxStartCol = Math.floor(col/3) * 3;

    const isValidRow = !board[row].includes(number);
    const isValidCol = board.every(row => row[col] !== number);
    const isValidBox = true;

    for(let r = boxStartRow ; r < (boxStartRow + 3) ; r++){
        for(let c = boxStartCol ; c < (boxStartCol + 3) ; c++){
            if(board[r][c] === number)
                return false;
        }
    }

    return isValidRow && isValidCol && isValidBox;

}

function copyBoard(board){
    let copyBoard = [];
    board.forEach((row, rowIndex)=>{
        copyBoard.push([...board[rowIndex]]);
    })
    return copyBoard;
}


// Randomization:

function shuffledNumbers() {
    let array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    let shuffledArray = [];

    for(let i=0; i< 9; i++){
        let index = randomNumber(array.length);
        shuffledArray.push(...array.splice(index,1));
    }

    return shuffledArray;
}

function shuffledPositions(){
    let positions = [];
    let shuffledPositions = [];
    for(let r=0; r< 9; r++){
        for(let c=0; c< 9; c++){
            positions.push({row: r, col: c});
        }
    }
    for(let r=0; r< 81; r++){
        let index = randomNumber(positions.length);
        shuffledPositions.push(...positions.splice(index, 1))
    }
    return shuffledPositions;
}

function randomNumber(length){
    return Math.floor(Math.random() * length)
}


/*-------------------------- Selection Management ---------------------------*/

function handleCellClick(clickedCell){
     if(clickedCell !== selectedCell) 
        setSelectedCell(clickedCell);
}

function setSelectedCell(cell){
    if(selectedCell)
        updateSelectedCellHighlight('remove');

    selectedCell = cell;
    [selectedRow,selectedCol] = selectedCell.id.split("-").map(num=>Number(num));
    rowCells = findRowCells(selectedRow, boardCells);
    colCells = findColCells(selectedCol, boardCells);
    boxCells = findBoxCells(selectedRow, selectedCol, boardCells);
    relatedCells = [...rowCells, ...colCells, ...boxCells];

    if(!containsNotes(selectedCell)){
        cellValue = Number(selectedCell.textContent);
        findSameNumber(selectedCell.textContent);
    }else{
        cellValue = '';
        findSameNumber('');
    }
    
    updateSelectedCellHighlight('add');
}

/*-------------------------- Highlight Management ---------------------------*/

function updateSelectedCellHighlight(action){
    // Selected cell
    updateClassList(selectedCell,action,'selected');

    // Related row, col, and box cells
     updateRelatedCellsHighlight(action);

    // Cells with the same number
    updateSameNumberHighlight(action);
    
    // Conflicting cells
    updateConflictingCellsHighlight(action);
}

function  updateRelatedCellsHighlight(action) {
    relatedCells.forEach(cell => updateClassList(cell, action, 'related-cell'));
    // Remove the highlight from the selected cell
    updateClassList(selectedCell, 'remove', 'related-cell');
}

function updateSameNumberHighlight(action){
    selectedSameNumber.forEach(cell => updateClassList(cell, action,'same-number-color'));
}

function updateConflictingCellsHighlight(action){
    if(action === 'remove'){
        relatedCells.forEach(cell => updateClassList(cell, 'remove', 'conflicting-number'));
        return;
    }

    if(!cellValue)
        return;

    let conflictingCells = relatedCells.filter(cell => !containsNotes(cell) && Number(cell.textContent) === cellValue);
    conflictingCells.forEach(cell => updateClassList(cell, 'add', 'conflicting-number'));
    updateClassList(selectedCell, 'remove', 'conflicting-number');
}

/*--------------------------- Board Helpers --------------------------------*/
function findRowCells(row,grid){
    return grid[row];
}
function findColCells(col, grid){
    return grid.map(row=> row[col]);
}
function findBoxCells(row, col, grid){
    let cells = [];
    let startingRow = Math.floor(row/3) * 3;
    let startingCol = Math.floor(col/3) * 3;

    for(let r=startingRow; r< (startingRow+3) ; r++){
        for(let c=startingCol; c < (startingCol+3) ; c++){
            cells.push(grid[r][c]);
        }
    }
    return cells;
}

function findSameNumber(number){
     if (!number) {
        selectedSameNumber = [];
        return;
    }
    selectedSameNumber = cellEls.filter(cell=> !containsNotes(cell) && cell.textContent === number);
}



/*--------------------------- Number Management -----------------------------*/

function handleNumberSelection(number){

    if(selectedCell.classList.contains('fixed')){
        // shake animation or give a message
        selectedCell.classList.remove('shake');
        selectedCell.classList.add('shake');
        setTimeout(() => {
            selectedCell.classList.remove('shake');
        }, 300);
        return;
    }
    if(isTakingNotes){
        handleNoteSelection(number);
    }else{
        handleValueSelection(number);
    }    
}

function handleValueSelection(number){
    if(number === cellValue){
        eraseCell();
    }else{
        selectedCell.innerHTML = number;

        if (!isValidNumber(number)) {
            updateClassList(selectedCell, 'add', 'wrong-number');
            updateClassList(selectedCell, 'remove', 'filled');
            handleMistake();
        } 
        else {
            correctCellTracker[number]++;
            updateRelatedNotes(number);
            updateClassList(selectedCell, 'remove', 'wrong-number');
            updateClassList(selectedCell, 'add', 'filled');
        }
        setSelectedCell(selectedCell);
    }
    clearCellNotes(selectedRow,selectedCol)
    detectNumberCompletion(number);
    detectWin();
}

function eraseCell(){
    // Prevent erasing a fixed cell
    if(!selectedCell.classList.contains('fixed')){
        if(isValidNumber(cellValue)){
            correctCellTracker[cellValue]--;
        }
        clearCellNotes(selectedRow, selectedCol);
        selectedCell.innerHTML = '';
        updateClassList(selectedCell, 'remove','wrong-number','filled');
        setSelectedCell(selectedCell);
    }else{
        selectedCell.classList.remove('shake');
        selectedCell.classList.add('shake');
        setTimeout(() => {
            selectedCell.classList.remove('shake');
        }, 300);
    }
}

/*---------------------------- Notes Management -----------------------------*/

function handleTakingNotes(){
    isTakingNotes = !isTakingNotes;
    notesBtnEl.classList.toggle('on');
}

function handleNoteSelection(number){
    let noteCell = getNotesCell(selectedRow, selectedCol, number)
    // Update note cell value
    if(noteCell.textContent){
        noteCell.textContent = '';
    }else{
        noteCell.textContent = number;
    }
    updateClassList(selectedCell, 'remove', 'wrong-number', 'filled');

    selectedCell.replaceChildren(getNotesGrid(selectedRow, selectedCol));
}

function updateRelatedNotes(number){
    relatedCells.forEach(cell =>{
        let [row,col] = [...cell.id.split('-').map(num=> Number(num))];
        if(containsNotes(cell)){
            updateNoteCell(row, col, number, '');
        }
    })
}

function clearCellNotes(row, col){
    notes[row][col].cells.forEach(noteCell => noteCell.textContent = '');
}

function clearAllNotes(){
    notes.forEach((row,rowIndex)=> row.forEach((cell,colIndex)=>{
        clearCellNotes(rowIndex, colIndex);
    }));
}


/*---------------------------- Notes Helpers -----------------------------*/

function containsNotes(cell){
    return cell.firstElementChild && cell.firstElementChild.classList.contains('note-grid')
}
function getNotesGrid(row, col){
    return notes[row][col].grid;
}
function getNotesCell(row, col, number){
    return notes[row][col].cells[number-1];
}
function updateNoteCell(row, col, number, value){
    notes[row][col].cells[number-1].textContent = value;
}

/*-------------------------- Game State Management --------------------------*/

function handleMistake(){
    mistakesCounter++;
    let heart = heartEls[heartEls.length - mistakesCounter];
    heart.src = './assets/images/Lost-chance.png';
    heart.alt = 'Remaining chance';
    if(mistakesCounter === heartEls.length){
        stopTimer();
        displayPopup('Game Over');
    }
}

function detectNumberCompletion(number){
    if(correctCellTracker[number] === 9){
        updateClassList(numberBtnEls[number-1], 'add', 'hidden');
    }else{
        updateClassList(numberBtnEls[number-1], 'remove', 'hidden');
    }
}
function detectWin(){
    let isWin = Object.values(correctCellTracker).every(value=> value==9);
    if(isWin){
        stopTimer();
        displayPopup('win');
    }
}


/*---------------------------- Timer Management -----------------------------*/

function startTimer(){
    if (timer) 
        return;
    timer = setInterval(()=>{
        time.seconds++;
        if(time.seconds === 60){
            time.seconds = 0;
            time.minutes++;
        }
        if(time.minutes === 60){
            stopTimer();
            displayPopup('Timeout');
        }
        timeEl.textContent = formatTimer();
    },1000);
}

function stopTimer(){
    clearInterval(timer);
    timer = null
    timerBtnEl.src = './assets/images/play.png';
    timerBtnEl.alt = 'Play Button';
}

function pauseTimer(){
    stopTimer();
    timerBtnEl.dataset.status = 'paused';
    displayPopup('Pause Timer');
}

function resumeTimer(){
    timerBtnEl.src = './assets/images/pause.png';
    timerBtnEl.alt = 'Pause Button'; 
    timerBtnEl.dataset.status = 'playing'
    startTimer();
}

function clearTimer(){
    clearInterval(timer);
    time.seconds = 0;
    time.minutes = 0;
    timer = null;
    timerBtnEl.dataset.status = 'playing';
    timerBtnEl.src = './assets/images/pause.png';
    timeEl.textContent = '00:00';
}

function formatTimer(){
    let seconds = (time.seconds < 10)? '0'+ time.seconds : time.seconds;
    let minutes = (time.minutes < 10)? '0'+ time.minutes : time.minutes; 
    return minutes + ':' + seconds;
}

/*---------------------------- Popup Management -----------------------------*/

function displayPopup(displayType){
    switch(displayType){
        case 'Game Over':
            updatePopupContent(
                'lose',
                'Game Over',
                'You\'ve reached the maximum number of mistakes.<br>Try again with a new puzzle!',
                false,
                'New Game',
                'mistakes',
                ''
            );
        break;

        case 'Pause Timer':
            updatePopupContent(
                'Pause icon',
                'Pause Game',
                'Need a moment? Your game is waiting for you.',
                true,
                'Resume',
                'unpause',
                ''
            );        
        break;
        case 'win':
            updatePopupContent(
                'winning-cup',
                'Congratulations!',
                'You solved the puzzle Successfully! <br> Ready for <span id="another-game">another game?</span> ',
                true,
                'New Game',
                'win',
                'Close'
            ); 
        break;
        case 'Timeout':
            updatePopupContent(
                'Timeout icon',
                'Time\'s UP!',
                'Better luck next time! <br> Try solving the puzzle before timer expires',
                false,
                'Try Again',
                'timeout',
                'New Game'
            );
        break;        
    }
    updateClassList(popupbackdropEl, 'remove', 'hidden');    
}

function closePopup(callback){
    setTimeout(() => {
        updateClassList(popupPrimaryBtnEl, 'remove', 'tab');
        updateClassList(popupbackdropEl, 'add', 'hidden');
    }, 50);
    setTimeout(()=>{
        updateClassList(popupstatusEl, 'add', 'block');
    },300)

    if (callback) 
        callback();
}

function updatePopupContent(img,header, message, gameStatus, primaryBtn, primaryBtnstatus, secondaryBtn){
    updatePopupStatus();
    popupImgEl.src = './assets/images/' + img +'.png';
    popupImgEl.alt = img; 
    popupHeaderEl.textContent = header;
    popupMessageEl.innerHTML = message;
    popupPrimaryBtnEl.textContent = primaryBtn;
    popupPrimaryBtnEl.dataset.status = primaryBtnstatus;
    popupSecondaryBtnEl.dataset.status = secondaryBtn;
    if(secondaryBtn === ''){
        updateClassList(popupSecondaryBtnEl, 'add', 'block');
    }else{
        updateClassList(popupSecondaryBtnEl, 'remove', 'block');
        popupSecondaryBtnEl.textContent = secondaryBtn;
    }
    if(gameStatus){
        updateClassList(popupstatusEl, 'remove', 'block');
    }else{
        
        updateClassList(popupstatusEl, 'add', 'block',);
    }

}

function updatePopupStatus(){
    popupDifficultyEl.textContent = currentDifficulty;

    for(let i=1; i<=heartEls.length ; i++){
        if(i<= mistakesCounter){
            popupheartsEls[heartEls.length-i].src = './assets/images/Lost-chance.png';
        }else{
            popupheartsEls[heartEls.length-i].src = './assets/images/Remaining-chance.png';
        }
    }
    popupTimeEl.textContent = formatTimer(); 

}

function handlePopupPrimaryBtnClick(){
    updateClassList(popupPrimaryBtnEl, 'add', 'tab');
    switch(popupPrimaryBtnEl.dataset.status){
        case 'mistakes':
            closePopup(openDifficultyScreen);               
        break;
        case 'unpause': 
            closePopup(resumeTimer)
        break;
        case 'win':
            closePopup(openDifficultyScreen);
        break;
        case 'timeout':
            closePopup(restartGame);
        break;   
    }       
}

function handlePopupSecondaryBtnClick(){
    switch(popupSecondaryBtnEl.dataset.status){
        case 'New Game':
            closePopup(openDifficultyScreen);
        break;
        case 'Close':
            closePopup(closeGame);
        break;
    }

}

/*-------------------------- Screen Management --------------------------*/
function openDifficultyScreen(){
    manageLevelScreen('remove');
}

function handleDifficultySelection(event) {
    if (event.target.classList.contains('level-btn')){
        const level = event.target;
    
        currentDifficulty = level.dataset.difficulty;
        difficultyEl.textContent = currentDifficulty;
        
        manageLevelScreen('add');
        manageStartScreen('add');
        beginGame();
    } 
}

function manageLevelScreen(action) {
    updateClassList(difficultyBackdrop, action, 'hidden');
}
function manageStartScreen(action) {
    updateClassList(startScreenEl, action, 'hidden');
}




 
/*---------------------------- Validation ----------------------------------*/

function isValidNumber(number){
    return number === solution[selectedRow][selectedCol];
}

/*------------------------------ Helper Functions ---------------------------*/

// Adds, removes, or toggles one or more CSS classes on an element
function updateClassList(element, action, ...className){
    element.classList[action](...className);
}


/*----------------------------- Event Listeners -----------------------------*/
// Start Screen
startScreenBtnEl.addEventListener('click', openDifficultyScreen);

// Difficulty Screen
levelsEl.addEventListener('click', handleDifficultySelection);

NewGametnEl.addEventListener('click', openDifficultyScreen);

// Header
restartBtnEl.addEventListener('click', restartGame);

// Board
boardEl.addEventListener('click', event=>{
    if (event.target.classList.contains("cell"))
        handleCellClick(event.target); 
})

// Input Panel
inputPanelEl.addEventListener('click',(event)=>{
    if(event.target.classList.contains('number-btn')){
        handleNumberSelection(Number(event.target.textContent));
    }
})
// Controllers
eraseBtnEl.addEventListener('click', eraseCell);
notesBtnEl.addEventListener('click', handleTakingNotes)
// Timer
timerBtnEl.addEventListener('click', ()=>{
    if (timerBtnEl.dataset.status === 'playing')
        pauseTimer();
    else
        resumeTimer();
});

// Popup
popupPrimaryBtnEl.addEventListener('click', handlePopupPrimaryBtnClick);
popupSecondaryBtnEl.addEventListener('click', handlePopupSecondaryBtnClick)

// Keyboard
document.addEventListener('keydown', (event)=>{
    let key = event.key;
    // Prevent udpating the board when popup is display
    if(!popupbackdropEl.classList.contains('hidden') || !startScreenEl.classList.contains('hidden') || !difficultyBackdrop.classList.contains('hidden')){
        if(key == ' '){
            event.preventDefault();
            handlePopupPrimaryBtnClick();
        }
    }else{
        let number = Number(key);
        if(number >= 1 &&  number <= 9){
            handleNumberSelection(number);
            const pressedBtn = numberBtnEls.find(btn => Number(btn.textContent) == number);
            updateClassList(pressedBtn, 'add', 'pressed-number-btn');
        }else if(key === 'Backspace'){
            eraseCell();
        }else if(key === 'ArrowUp' && selectedRow > 0){
            event.preventDefault();
            setSelectedCell(boardCells[selectedRow - 1][selectedCol]);
        }else if(key === 'ArrowDown' && selectedRow < 8){
            event.preventDefault();
            setSelectedCell(boardCells[selectedRow + 1][selectedCol]);
        }else if(key === 'ArrowLeft' && selectedCol > 0){
            event.preventDefault();
            setSelectedCell(boardCells[selectedRow][selectedCol - 1]);
        }else if(key === 'ArrowRight' && selectedCol < 8){
            event.preventDefault();
            setSelectedCell(boardCells[selectedRow][selectedCol + 1]);
        }else if(key == ' '){
            event.preventDefault();
            if(timerBtnEl.dataset.status == 'playing'){
                pauseTimer();
            }else{
                resumeTimer();
            }
        }else if(key == 'n'){
            handleTakingNotes();
        }

    }
})
document.addEventListener('keyup', (event)=>{
    let key = event.key;
    let number = Number(key);
     if(number >= 1 &&  number <= 9){
        const pressedBtn = numberBtnEls.find(btn => Number(btn.textContent) == number);
        updateClassList(pressedBtn, 'remove', 'pressed-number-btn');
     }
})







