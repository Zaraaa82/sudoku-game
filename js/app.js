/*------------------------ Cached Element References ------------------------*/
const boardEl = document.querySelector("#board");
const rowEls = document.querySelectorAll(".row");
const cellEls = [...document.querySelectorAll('.cell')];

/*-------------------------------- Constants --------------------------------*/
const boardCells = []; // Store cell Elements in 2D

/*---------------------------- Variables (state) ----------------------------*/


/*-------------------------------- Functions --------------------------------*/



/*--------------------------- Game Initialization ---------------------------*/
initializeGame();

function initializeGame(){
    fetchCells()
    addBoardBorders();
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
