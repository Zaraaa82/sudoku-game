/*------------------------ Cached Element References ------------------------*/
const boardEl = document.querySelector("#board");
const rowEls = document.querySelectorAll(".row");
const cellEls = [...document.querySelectorAll('.cell')];

/*-------------------------------- Constants --------------------------------*/
const boardCells = []; // Store cell Elements in 2D
const puzzle = [
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

/*---------------------------- Variables (state) ----------------------------*/
let selectedCell = null;
let selectedRow = -1;
let selectedCol = -1;
let selectedSameNumber = [];

/*-------------------------------- Functions --------------------------------*/



/*--------------------------- Game Initialization ---------------------------*/
initializeGame();

function initializeGame(){
    fetchCells()
    addBoardBorders();
    loadPuzzle();
    selectStartingCell();
}

function handleCellClick(clickedCell){
     if(clickedCell !== selectedCell) 
        setSelectedCell(clickedCell);
}


function fetchCells() {
  for (let row = 0; row < 9; row++) {
    boardCells.push(cellEls.slice(row * 9, row * 9 + 9));
  }
}

function  addBoardBorders(){
    boardCells.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
        if (colIndex === 2 || colIndex === 5 || colIndex === 8) {
        cell.classList.add("right-border");
        } else if (colIndex === 0 || colIndex === 3 || colIndex === 6) {
        cell.classList.add("left-border");
        }

        if (rowIndex === 2 || rowIndex === 5 || rowIndex === 8) {
        cell.classList.add("bottom-border");
        }

        if (rowIndex === 0 || rowIndex === 3 || rowIndex === 6) {
        cell.classList.add("top-border");
        }
    });
    });
}

function loadPuzzle(){
    puzzle.forEach((row, rowIndex)=>{
        row.forEach((cell, colIndex)=>{
            if(cell){
                boardCells[rowIndex][colIndex].textContent = cell;
                toggleCellClass(boardCells[rowIndex][colIndex], 'fixed');
            }
        })
    })
}

function selectStartingCell(){
    let firstSelect = cellEls.find(cell=> !cell.classList.contains('fixed'));
    setSelectedCell(firstSelect);
}

function findSameNumber(){
     if (!selectedCell.textContent) {
        selectedSameNumber = [];
        return;
    }
    selectedSameNumber = cellEls.filter(cell=> cell.textContent === selectedCell.textContent);
}

function setSelectedCell(cell){
    if(selectedCell){
        highlightSelectedCell();
    }
    selectedCell = cell;
    [selectedRow,selectedCol] = selectedCell.id.split("-").map(Number);
    findSameNumber();

    highlightSelectedCell();
}

function highlightSelectedCell(){
    // Selected cell
    toggleCellClass(selectedCell, 'selected');

    // Select box, row, and column
    highlightRelatedCells();

    // select same number
    highlightSameNumber()
}

function highlightRelatedCells() {
    boardCells.forEach((row, rowIndex)=>{
        row.forEach((cell, colIndex)=>{
            // Prevent highlighting the selected cell
            if(rowIndex !== selectedRow || colIndex!==selectedCol){

                if(isSameBox(rowIndex,colIndex)|| // Same Box
                   rowIndex === selectedRow || // Same Row
                   colIndex === selectedCol // Same Column
                ){
                    toggleCellClass(cell,"related-cell");
                }

            }
        })
    })
}

function highlightSameNumber(){
    selectedSameNumber.forEach(cell => toggleCellClass(cell,'same-Number-color'));
}



/*------------------------------ Helper Functions ---------------------------*/
function toggleCellClass(cell, className){
    cell.classList.toggle(className);
}
function isSameBox(row, col) {
    return findSubBox(row, col) === findSubBox(selectedRow, selectedCol);
}
/**
 * findSubBox()
 * Determines which sub-box a cell belongs to.
 * 
 * The Sudoku board contains 9 sub-boxes arranged as:
 *          col-0     col-1    Col-2
 * Row-0:    0          1         2
 * Row-1:    3          4         5
 * Row-2:    6          7         8
 * 
 * Math.floor(cellRow / 3) determines the row of sub-boxes (0-2)
 * Math.floor(cellCol / 3) determines the column of sub-boxes (0-2)
 * 
 * Each row of sub-boxes contains 3 sub-boxes, so multiplying
 * the sub-box row by 3 gives the index of the first sub-box
 * in that row (0, 3, or 6). 
 * Adding the sub-box column (0–2) gives the final sub-box index (0–8).
 */

function findSubBox(cellRow, cellCol) {
  return Math.floor(cellRow / 3) * 3 + Math.floor(cellCol / 3);
}


/*----------------------------- Event Listeners -----------------------------*/
boardEl.addEventListener('click', event=>{
    if (event.target.classList.contains("cell"))
        handleCellClick(event.target); 
})
