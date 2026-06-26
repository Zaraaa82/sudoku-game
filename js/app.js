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


/*-------------------------------- Functions --------------------------------*/



/*--------------------------- Game Initialization ---------------------------*/
initializeGame();

function initializeGame(){
    fetchCells()
    addBoardBorders();
    loadPuzzle();
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

/*------------------------------ Helper Functions ---------------------------*/
function toggleCellClass(cell, className){
    cell.classList.toggle(className);
}
