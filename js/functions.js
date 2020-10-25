import sudokus from "./sudokus.js";

// Drawing a random sudoku board from the initial options
export const randomSudoku = () => {
    const random = Math.floor(Math.random() * sudokus.length);
    return sudokus[random];
}

// Creating a single flattened array of all the sudoku's board cells, row by row.
// The first 9 items are the first row's cells, the next 9 are the second row's cells, and so on.
export const sudokuCells = sudoku => {
    let cells = [];
    sudoku.forEach(row => {
        cells = [...cells, ...row];
    })
    cells = cells.map(cell => cell.toString());
    return cells;
}

// Randomally emptying some of the sudoku's board cells, according to the selected level.
// 21 random cells are emptied in level 1, 41 in level 2, and 60 in level 3.
export const emptySudokuCells = (cells, level) => {
    let newCells = [...cells];
    const cellsToEmpty = level === 1 ? 21 : level === 2 ? 41 : 60;

    for (let i = 0; i < cellsToEmpty; i++) {
        let indexToEmpty;
        while (!indexToEmpty || newCells[indexToEmpty] === 0) {
            indexToEmpty = Math.floor(Math.random() * cells.length);
        }
        newCells[indexToEmpty] = 0;
    }

    return newCells;
}

// Creating the game board's inner HTML elements (rows and cells).
// Responsively adjusting the board's height to be the same as the width.
export const createBoardInterface = board => {
    const adjustHeight = () => {
        if (board.offsetWidth > 0) {
            board.style.height = `${board.offsetWidth}px`;
        }
    }
    adjustHeight();
    window.addEventListener("resize", adjustHeight);

    for (let i = 0; i < 9; i++) {
        board.insertAdjacentHTML("beforeend", `<div class="board__row"></div>`);
    }

    const boardRows = Array.from(document.querySelectorAll(".board__row"));
    boardRows.forEach(row => {
        for (let i = 0; i < 9; i++) {
            row.insertAdjacentHTML("beforeend", `
                <input class="board__cell" maxlength="1" oninput="this.value=this.value.replace(/[^1-9]/g,'');" />
            `);
        }
    })
}

// Filling the game board's cells with their initial values (if they have initial values).
// Modifying each cell's appearance according to whether it has a value or not.
export const initializeBoardCells = (interfaceCells, userCells) => {
    interfaceCells.forEach((interfaceCell, index) => {
        if (userCells[index] === 0) {
            interfaceCell.value = "";
            interfaceCell.removeAttribute("readonly");
            interfaceCell.classList.remove("board__cell--prefilled");
        }
        else {
            interfaceCell.value = userCells[index];
            interfaceCell.setAttribute("readonly", "true");
            interfaceCell.classList.add("board__cell--prefilled");
        }
    })
}

// Displaying certain HTML elements on the page
export const displayPageElements = elements => {
    if (Array.isArray(elements)) {
        elements.forEach(el => el.classList.add("display"));
    }
    else {
        elements.classList.add("display");
    }
}

// Removing certain HTML elements from the page
export const removePageElements = elements => {
    if (Array.isArray(elements)) {
        elements.forEach(el => el.classList.remove("display"));
    }
    else {
        elements.classList.remove("display");
    }
}