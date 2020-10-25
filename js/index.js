import {
    randomSudoku,
    sudokuCells,
    emptySudokuCells,
    createBoardInterface,
    initializeBoardCells,
    displayPageElements,
    removePageElements
} from "./functions.js";

// The users that can log into the app
const users = [
    { name: "abcd", password: "1234" },
    { name: "Yinon", password: "1234" },
    { name: "stranger", password: "1234" }
];
// Getting the existing user scores from the local storage, if they exist
const scores = JSON.parse(localStorage.getItem("scores")) || {};

// Initial variables
let targetBoard = randomSudoku();
let targetCells = sudokuCells(targetBoard);
let loggedInUser, score, level, interfaceCells, initialUserCells;

// Page elements
const loginScreen = document.getElementById("login");
const loginForm = document.querySelector("#login .form");

const levelChoiceScreen = document.getElementById("level-choice");
const usernameTitle = document.getElementById("username");
const levelButtons = Array.from(document.querySelectorAll(".button--level"));

const gameScreen = document.getElementById("game");
const gameBoard = document.querySelector(".board");
const levelTitle = document.getElementById("level");
const finishButton = document.getElementById("finish-button");
const resetButton = document.getElementById("reset-button");

const resultModal = document.getElementById("result");
const resultTitle = document.getElementById("result-title");
const restartButton = document.getElementById("restart-button");

const scoreBox = document.getElementById("score-box");
const scoreCount = document.getElementById("score");

const logoutButton = document.getElementById("logout-button");

// Checking if a user is already logged in
loggedInUser = localStorage.getItem("currentUser");
if (loggedInUser) {
    removePageElements(loginScreen);
    displayPageElements([levelChoiceScreen, logoutButton, scoreBox]);
    usernameTitle.innerText = loggedInUser;

    // Checking if the user already has a score in the local storage
    // If not, setting the score to 0
    score = scores[loggedInUser] || 0;
    scoreCount.innerText = score;
}

// Validating the login form when submitted
// If success, logging the user in and saving the user to the local storage
loginForm.addEventListener("submit", event => {
    event.preventDefault();
    const { name: { value: name }, password: { value: password } } = loginForm;
    const matchingUser = users.find(user => user.name === name && user.password === password);

    if (matchingUser) {
        removePageElements(loginScreen);
        displayPageElements([levelChoiceScreen, logoutButton, scoreBox]);
        loginForm.classList.remove("error");
        loginForm.reset();
        usernameTitle.innerText = name;

        loggedInUser = name;
        localStorage.setItem("currentUser", name);

        // Checking if the user already has a score in the local storage
        // If not, setting the score to 0
        score = scores[name] || 0;
        scoreCount.innerText = score;
    }
    else {
        loginForm.classList.add("error");
    }
})

// Starting the game when the user chooses a level
levelButtons.forEach(levelButton => {
    levelButton.addEventListener("click", event => {
        // Displaying the game screen and the level
        removePageElements(levelChoiceScreen);
        displayPageElements(gameScreen);
        level = Number(event.target.innerText);
        levelTitle.innerText = level;

        // Creating the game board's inner elements (if they haven't been created yet)
        if (!interfaceCells) {
            createBoardInterface(gameBoard);
            interfaceCells = Array.from(document.querySelectorAll(".board__cell"));
        }

        // Filling the game board's cells with their initial values
        initialUserCells = emptySudokuCells(targetCells, level);
        initializeBoardCells(interfaceCells, initialUserCells);
    })
})

// Resetting the board and the game when reset button is clicked
resetButton.addEventListener("click", () => {
    initializeBoardCells(interfaceCells, initialUserCells);
})

// Checking the user's result when finish button is clicked
// If successful, awarding points based on the level
// 3 points for level 1, 10 points for level 2, 20 points for level 3
finishButton.addEventListener("click", () => {
    const answersCorrect = interfaceCells.every((cell, index) => cell.value === targetCells[index]);
    displayPageElements(resultModal);
    resultTitle.innerText = answersCorrect ? "You won!" : "You failed";

    if (answersCorrect) {
        const pointsAdded = level === 1 ? 3 : level === 2 ? 10 : 20;
        score += pointsAdded;
        scoreCount.innerText = score;

        // Adding the updated score to the local storage
        scores[loggedInUser] = score;
        localStorage.setItem("scores", JSON.stringify(scores));
    }
})

// Restarting the game when the Play Again button is clicked
restartButton.addEventListener("click", () => {
    removePageElements([resultModal, gameScreen]);
    displayPageElements(levelChoiceScreen);

    targetBoard = randomSudoku();
    targetCells = sudokuCells(targetBoard);
})

// Logging the user out when logout button is clicked
logoutButton.addEventListener("click", () => {
    removePageElements([levelChoiceScreen, gameScreen, logoutButton, scoreBox, resultModal]);
    displayPageElements(loginScreen);

    localStorage.removeItem("currentUser");
})