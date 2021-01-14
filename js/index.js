import {
    randomSudoku,
    sudokuCells,
    emptySudokuCells,
    createBoardInterface,
    initializeBoardCells,
    displayPageElements,
    removePageElements
} from "./functions.js";

// Initial variables
let targetBoard = randomSudoku();
let targetCells = sudokuCells(targetBoard);
let loggedInUser, score, level, interfaceCells, initialGameCells;

// Page elements
const loginScreen = document.getElementById("login");
const loginForm = document.querySelector("#login .form");
const signupScreen = document.getElementById("signup");
const signupForm = document.querySelector("#signup .form");
const signupSwitch = document.getElementById("signup-switch");
const loginSwitch = document.getElementById("login-switch");
const spinner = document.querySelector(".spinner");

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
const scoreBoxUsername = document.getElementById("scorebox-username");

const logoutButton = document.getElementById("logout-button");

// Checking if a user is already logged in when the page loads
// If so, loading the level choice screen instead of the login screen
loggedInUser = JSON.parse(localStorage.getItem("currentUser"));
const expired = loggedInUser && new Date(loggedInUser.expirationDate) <= new Date();

if (loggedInUser && !expired) {
    displayPageElements([levelChoiceScreen, logoutButton, scoreBox]);
    usernameTitle.innerText = loggedInUser.name;
    scoreBoxUsername.innerText = loggedInUser.name;

    score = loggedInUser.score;
    scoreCount.innerText = loggedInUser.score;
}
else {
    displayPageElements(loginScreen);
    localStorage.removeItem("currentUser");
}

// Switching between login and signup screens
signupSwitch.addEventListener("click", () => {
    removePageElements(loginScreen);
    loginForm.classList.remove("error");
    loginForm.reset();
    displayPageElements(signupScreen);
})

loginSwitch.addEventListener("click", () => {
    removePageElements(signupScreen);
    signupForm.classList.remove("error");
    signupForm.classList.remove("fail");
    signupForm.reset();
    displayPageElements(loginScreen);
})

// Registering a user when signup form is submitted
signupForm.addEventListener("submit", async event => {
    event.preventDefault();
    const {
        name: { value: name },
        email: { value: email },
        password: { value: password },
        confirmPassword: { value: confirmPassword }
    } = signupForm;

    if (password !== confirmPassword) {
        signupForm.classList.add("error");
        signupForm.classList.remove("fail");
    }
    else {
        signupForm.classList.remove("error");
        signupForm.classList.remove("fail");
        displayPageElements(spinner);

        try {
            const authRes = await axios.post("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDSDS_F7tUc8QEbBwy-HiHu8Wy1Su3adQw", {
                email: email,
                password: password,
                returnSecureToken: true
            });
            const profileRes = await axios.post(`https://sudoku-6c11e.firebaseio.com/profiles.json?auth=${authRes.data.idToken}`,
                { name: name, email: email, score: 0 }
            );

            removePageElements([spinner, signupScreen]);
            displayPageElements([levelChoiceScreen, logoutButton, scoreBox]);
            signupForm.reset();

            usernameTitle.innerText = name;
            scoreBoxUsername.innerText = name;
            score = 0;
            scoreCount.innerText = 0;

            loggedInUser = {
                id: profileRes.data.name,
                name: name,
                score: 0,
                idToken: authRes.data.idToken
            };

            localStorage.setItem("currentUser", JSON.stringify({
                ...loggedInUser,
                expirationDate: new Date(new Date().getTime() + authRes.data.expiresIn * 1000)
            }));
        }
        catch {
            removePageElements(spinner);
            signupForm.classList.add("fail");
        }
    }
})

// Validating the login form when submitted
// If success, logging the user in and saving the user to the local storage
loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    const { email: { value: email }, password: { value: password } } = loginForm;
    loginForm.classList.remove("error");
    displayPageElements(spinner);

    try {
        const authRes = await axios.post("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDSDS_F7tUc8QEbBwy-HiHu8Wy1Su3adQw", {
            email: email,
            password: password,
            returnSecureToken: true
        });
        const profileRes = await axios.get("https://sudoku-6c11e.firebaseio.com/profiles.json");
        const profiles = [];
        for (let key in profileRes.data) {
            profiles.push({ id: key, ...profileRes.data[key] });
        }
        const matchingUser = profiles.find(user => user.email === email);
        if (!matchingUser) throw new Error();

        loginForm.reset();
        removePageElements([spinner, loginScreen]);
        displayPageElements([levelChoiceScreen, logoutButton, scoreBox]);

        usernameTitle.innerText = matchingUser.name;
        scoreBoxUsername.innerText = matchingUser.name;
        score = matchingUser.score;
        scoreCount.innerText = score;

        loggedInUser = {
            id: matchingUser.id,
            name: matchingUser.name,
            score: matchingUser.score,
            idToken: authRes.data.idToken
        };

        localStorage.setItem("currentUser", JSON.stringify({
            ...loggedInUser,
            expirationDate: new Date(new Date().getTime() + authRes.data.expiresIn * 1000)
        }));
    }
    catch {
        loginForm.classList.add("error");
        removePageElements(spinner);
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
            interfaceCells = createBoardInterface(gameBoard);
        }

        // Filling the game board's cells with their initial values
        initialGameCells = emptySudokuCells(targetCells, level);
        initializeBoardCells(interfaceCells, initialGameCells);
    })
})

// Resetting the board and the game when reset button is clicked
resetButton.addEventListener("click", () => {
    initializeBoardCells(interfaceCells, initialGameCells);
})

// Checking the user's result when finish button is clicked
// If successful, awarding points based on the level
// 3 points for level 1, 10 points for level 2, 20 points for level 3
finishButton.addEventListener("click", async () => {
    const answersCorrect = interfaceCells.every((cell, index) => cell.value === targetCells[index]);
    displayPageElements(resultModal);
    resultTitle.innerText = answersCorrect ? "You won!" : "You failed";

    if (answersCorrect) {
        const pointsAdded = level === 1 ? 3 : level === 2 ? 10 : 20;
        score += pointsAdded;
        scoreCount.innerText = score;

        await axios.patch(
            `https://sudoku-6c11e.firebaseio.com/profiles/${loggedInUser.id}.json?auth=${loggedInUser.idToken}`,
            { score }
        );
        loggedInUser.score = score;
        localStorage.setItem("currentUser", JSON.stringify(loggedInUser));
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
    targetBoard = randomSudoku();
    targetCells = sudokuCells(targetBoard);
})