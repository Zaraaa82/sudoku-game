/*------------------------ Cached Element References ------------------------*/
const boardEl = document.querySelector("#board");
const rowEls = document.querySelectorAll(".row");
const cellEls = [...document.querySelectorAll('.cell')];

const inputPanelEl = document.querySelector('#input-panel');
const numberBtnEls = [...document.querySelectorAll(".number-btn")];
const heartEls = [...document.querySelectorAll('.heart')];
const popupbackdropEl = document.querySelector('#popup-backdrop');
const [popupHeaderEl,popupMessageEl, popupBtnEl] = [...document.querySelectorAll('#popup *')];

/*-------------------------------- Constants --------------------------------*/
const boardCells = []; // Store cell Elements in 2D
const dummyPuzzle = [
    [7, 3, '',  9, 5, '',  '','',''],
    [2, 1, '',  6, 7, '',  5, 8, ''],
    ['','', 5,  3, 1, '',  4,'','',],
    
    [1, 9, '',  '', 6, 3,  2,'','',],
    [3, 4,  2,   1,'','',  6,'','',],
    [5, 6,  8,   2, '',7,  '','',''],

    ['', 2,'',  '',8, 1,   3,'',''],
    ['','', 1,  '','', 9,  7, 6, 2],
    ['', 7, '',  5, 2,'',  8, 1, 9]
]
const dummySolution = [
  [7, 3, 4, 9, 5, 8, 1, 2, 6],
  [2, 1, 9, 6, 7, 4, 5, 8, 3],
  [6, 8, 5, 3, 1, 2, 4, 9, 7],
  [1, 9, 7, 8, 6, 3, 2, 4, 5],
  [3, 4, 2, 1, 9, 5, 6, 7, 8],
  [5, 6, 8, 2, 4, 7, 9, 3, 1],
  [9, 2, 6, 7, 8, 1, 3, 5, 4],
  [8, 5, 1, 4, 3, 9, 7, 6, 2],
  [4, 7, 3, 5, 2, 6, 8, 1, 9]
];

const solution = [];
const puzzle = [];

/*---------------------------- Variables (state) ----------------------------*/
let selectedCell = null;
let selectedRow = -1;
let selectedCol = -1;
let cellValue = null;

let rowCells = [];
let colCells = [];
let boxCells = [];
let relatedCells = [];
let selectedSameNumber = [];

let mistakesCounter = 0;


/*-------------------------------- Functions --------------------------------*/



/*--------------------------- Game Initialization ---------------------------*/
initializeGame();

function initializeGame(){
    fetchCells()
    addBoardBorders();
    loadPuzzle();
    selectStartingCell();
}
/*------------------------------- Game Setup -------------------------------*/

function fetchCells() {
  for (let row = 0; row < 9; row++) {
    boardCells.push(cellEls.slice(row * 9, row * 9 + 9));
  }
}

function  addBoardBorders(){
    boardCells.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
        if (colIndex === 2 || colIndex === 5 || colIndex === 8) {
            updateClassList(cell, 'add', 'right-border');
        } else if (colIndex === 0 || colIndex === 3 || colIndex === 6) {
            updateClassList(cell, 'add', 'left-border');
        }

        if (rowIndex === 2 || rowIndex === 5 || rowIndex === 8) {
            updateClassList(cell, 'add', 'bottom-border');
        }else if (rowIndex === 0 || rowIndex === 3 || rowIndex === 6) {
            updateClassList(cell, 'add', 'top-border');
        }
    });
    });
}

function loadPuzzle(){
    dummyPuzzle.forEach((row, rowIndex)=>{
        row.forEach((cell, colIndex)=>{
            if(cell){
                boardCells[rowIndex][colIndex].textContent = cell;
                updateClassList(boardCells[rowIndex][colIndex],'add', 'fixed');
            }
        })
    })
}

function selectStartingCell(){
    let firstSelect = cellEls.find(cell=> !cell.classList.contains('fixed'));
    setSelectedCell(firstSelect);
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
    cellValue = Number(selectedCell.textContent);
    [selectedRow,selectedCol] = selectedCell.id.split("-").map(num=>Number(num));
    rowCells = findRowCells(selectedRow, boardCells);
    colCells = findColCells(selectedCol, boardCells);
    boxCells = findBoxCells(selectedRow, selectedCol, boardCells);
    relatedCells = [...rowCells, ...colCells, ...boxCells];
    findSameNumber(selectedCell.textContent);
    
    updateSelectedCellHighlight('add');
}

/*------------------------- Highlight Management ---------------------------*/

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
    selectedSameNumber.forEach(cell => updateClassList(cell, action,'same-Number-color'));
}

function updateConflictingCellsHighlight(action){
    if(action === 'remove'){
        relatedCells.forEach(cell => updateClassList(cell, 'remove', 'conflicting-number'));
        return;
    }
    // Always clear old conflicts

    if(!cellValue)
        return;

    let conflictingCells = relatedCells.filter(cell => Number(cell.textContent) === cellValue);
    conflictingCells.forEach(cell => updateClassList(cell, 'add', 'conflicting-number'));
    updateClassList(selectedCell, 'remove', 'conflicting-number');
}

/*------------------------- Related Cell Helpers ----------------------------*/

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
    selectedSameNumber = cellEls.filter(cell=> cell.textContent === number);
}

/*--------------------------- Game Actions ---------------------------------*/
function handleNumberSelection(number){

    if(selectedCell.classList.contains('fixed')){
        // shake animation or give a message
        return;
    }
    if(number === cellValue){
        eraseNumber();
    }else{
        selectedCell.textContent = number;

        if (!isValidNumber(number)) {
            updateClassList(selectedCell, 'add', 'wrongNumber');
            updateClassList(selectedCell, 'remove', 'filled');
            handleMistake();

        } 
        else {
            updateClassList(selectedCell, 'remove', 'wrongNumber');
            updateClassList(selectedCell, 'add', 'filled');
        }
        setSelectedCell(selectedCell);
    }
    
}

// Will be Used for erase btn ....
function eraseNumber(){
    // Prevent erasing a fixed cell
    if(!selectedCell.classList.contains('fixed')){
        selectedCell.textContent = '';
        updateClassList(selectedCell, 'remove','wrongNumber','filled');
        setSelectedCell(selectedCell);
    }
}

function handleMistake(){
    mistakesCounter++;
    let heart = heartEls[heartEls.length - mistakesCounter];
    heart.src = './assets/images/Lost-chance.png';
    heart.alt = 'Remaining chance';
    if(mistakesCounter === heartEls.length){
        displayPopup('Game Over')
    }
}
function displayPopup(displayType){
    if(displayType == 'Game Over'){
        popupHeaderEl.textContent = 'Game Over';
        popupMessageEl.innerHTML = 'You\'ve reached the maximum number of mistakes.<br><br>Try again with a new puzzle!'
        popupBtnEl.textContent = 'New Game';
        updateClassList(popupBtnEl, 'add', 'mistakes');
        updateClassList(popupbackdropEl, 'remove', 'hidden');
    }
}
// managePopu(true, 'mistakes');
function handlePopupBtnClick(){
    if(popupBtnEl.classList.contains('mistakes')){
        setTimeout(()=>{
            updateClassList(popupBtnEl, 'remove', 'mistakes');
            updateClassList(popupbackdropEl, 'add', 'hidden');
            startNewGame();
        },100)
    }
}
function startNewGame(){
    clearBoard();
    clearSelected();
    initializeGame();
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
    clearSelected();

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

 
/*---------------------------- Validation ----------------------------------*/

function isValidNumber(number){
    return number === dummySolution[selectedRow][selectedCol];
}

/*------------------------------ Helper Functions ---------------------------*/

// Adds, removes, or toggles one or more CSS classes on an element
function updateClassList(element, action, ...className){
    element.classList[action](...className);
}


/*----------------------------- Event Listeners -----------------------------*/
boardEl.addEventListener('click', event=>{
    if (event.target.classList.contains("cell"))
        handleCellClick(event.target); 
})
inputPanelEl.addEventListener('click',(event)=>{
    if(event.target.classList.contains('number-btn')){
        handleNumberSelection(Number(event.target.textContent));
    }
})

document.addEventListener('keydown', (event)=>{
    
    let key = event.key;
    let number = Number(key);
    if(number >= 1 &&  number <= 9){
        handleNumberSelection(number);
        const pressedBtn = numberBtnEls.find(btn => Number(btn.textContent) == number);
        updateClassList(pressedBtn, 'add', 'pressed-number-btn');
    }
    else if(key === 'Backspace'){
        eraseNumber();
    }else if(key === 'ArrowUp' && selectedRow > 0){
        setSelectedCell(boardCells[selectedRow - 1][selectedCol]);
    }else if(key === 'ArrowDown' && selectedRow < 8){
        setSelectedCell(boardCells[selectedRow + 1][selectedCol]);
    }else if(key === 'ArrowLeft' && selectedCol > 0){
        setSelectedCell(boardCells[selectedRow][selectedCol - 1]);
    }else if(key === 'ArrowRight' && selectedCol < 8){
        setSelectedCell(boardCells[selectedRow][selectedCol + 1]);
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

popupBtnEl.addEventListener('click', handlePopupBtnClick);