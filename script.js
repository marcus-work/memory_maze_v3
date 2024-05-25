document.addEventListener('DOMContentLoaded', () => {
    const mazeContainer = document.getElementById('maze');
    const startButton = document.getElementById('start-button');
    const playAgainButton = document.getElementById('play-again-button');
    const messageContainer = document.getElementById('message-container');
    const message = document.getElementById('message');
    const levelDisplay = document.getElementById('level-display');
    const scoreDisplay = document.getElementById('score-display');
    const highScoreDisplay = document.getElementById('high-score-display');

    let mazeSize = 6; // Starting maze size
    let maze = [];
    let isDrawing = false;
    let startCell;
    let currentPath = [];
    let level = 1;
    let score = 0;
    let highScore = 0;
    let countdown;

    // Function to generate a solvable maze
    function generateMaze() {
        maze = Array.from({ length: mazeSize }, () => Array(mazeSize).fill('path'));

        // Add walls to the maze based on the level
        let wallCount = Math.min(level * 2, Math.floor(mazeSize * mazeSize * 0.2));
        for (let i = 0; i < wallCount; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * mazeSize);
                y = Math.floor(Math.random() * mazeSize);
            } while (maze[x][y] !== 'path' || (x === 0 && y === 0) || (x === mazeSize - 1 && y === mazeSize - 1));
            maze[x][y] = 'wall';
        }

        // Add a collectible to the maze
        let collectibleCount = 1;
        for (let i = 0; i < collectibleCount; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * mazeSize);
                y = Math.floor(Math.random() * mazeSize);
            } while (maze[x][y] !== 'path' || (x === 0 && y === 0) || (x === mazeSize - 1 && y === mazeSize - 1));
            maze[x][y] = 'collectible';
        }

        // Ensure a solvable path exists
        ensureSolvablePath();

        // Set the start and end cells
        maze[0][0] = 'start';
        maze[mazeSize - 1][mazeSize - 1] = 'end';
    }

    // Function to ensure there is always a path from start to end
    function ensureSolvablePath() {
        let visited = Array.from({ length: mazeSize }, () => Array(mazeSize).fill(false));
        let stack = [[0, 0]];
        visited[0][0] = true;

        while (stack.length > 0) {
            let [x, y] = stack.pop();
            let directions = shuffle([[0, 1], [1, 0], [0, -1], [-1, 0]]);

            for (let [dx, dy] of directions) {
                let nx = x + dx;
                let ny = y + dy;

                if (nx >= 0 && ny >= 0 && nx < mazeSize && ny < mazeSize && !visited[nx][ny] && maze[nx][ny] !== 'wall') {
                    visited[nx][ny] = true;
                    stack.push([nx, ny]);
                    maze[nx][ny] = 'path';
                }
            }
        }
    }

    // Function to shuffle an array
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Function to create the maze grid in the DOM
    function createMaze() {
        mazeContainer.innerHTML = '';
        generateMaze();

        maze.forEach((row, rowIndex) => {
            row.forEach((cell, cellIndex) => {
                const cellDiv = document.createElement('div');
                cellDiv.classList.add('cell', cell);
                cellDiv.dataset.row = rowIndex;
                cellDiv.dataset.col = cellIndex;
                mazeContainer.appendChild(cellDiv);
            });
        });

        mazeContainer.style.gridTemplateColumns = `repeat(${mazeSize}, 30px)`;
        mazeContainer.style.gridTemplateRows = `repeat(${mazeSize}, 30px)`;
    }

    // Function to handle the player's move
    function handleMove(event) {
        if (!isDrawing) return;

        const cell = event.target;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        if (maze[row][col] === 'wall') {
            cell.style.backgroundColor = 'red'; // Indicate the hit wall
            gameOver();
        } else {
            cell.classList.add('flip');
            cell.style.backgroundColor = '#4caf50'; // Change to path color

            if (maze[row][col] === 'collectible') {
                score++;
                scoreDisplay.textContent = `Score: ${score}`;
                maze[row][col] = 'path'; // Collectible is collected
            }

            if (maze[row][col] === 'end') {
                levelComplete();
            }
        }

        currentPath.push(cell);
    }

    // Function to start the game
    function startGame() {
        startButton.style.display = 'none';
        messageContainer.style.display = 'block';
        message.textContent = 'Memorize the maze, connect the two squares';

        countdown = 5;
        const countdownInterval = setInterval(() => {
            message.textContent = `Memorize the maze, connect the two squares\n${countdown}`;
            countdown--;
            if (countdown < 0) {
                clearInterval(countdownInterval);
                messageContainer.style.display = 'none';
                isDrawing = true;
                addEventListeners();
            }
        }, 1000);
    }

    // Function to complete the level
    function levelComplete() {
        isDrawing = false;
        messageContainer.style.display = 'block';
        message.textContent = 'Congratulations! Next Level';
        playAgainButton.textContent = 'Next Level';
        playAgainButton.style.display = 'block';

        // Increase level and maze size after certain levels
        level++;
        if (level % 3 === 0) {
            mazeSize++;
        }

        levelDisplay.textContent = `Level: ${level}`;

        if (score > highScore) {
            highScore = score;
            highScoreDisplay.textContent = `High Score: ${highScore}`;
        }
    }

    // Function to handle game over
    function gameOver() {
        isDrawing = false;
        messageContainer.style.display = 'block';
        message.textContent = 'Game Over';
        playAgainButton.textContent = 'Play Again';
        playAgainButton.style.display = 'block';

        // Reset the game state
        level = 1;
        score = 0;
        mazeSize = 6;
        scoreDisplay.textContent = `Score: ${score}`;
        levelDisplay.textContent = `Level: ${level}`;
    }

    // Function to reset the game
    function resetGame() {
        messageContainer.style.display = 'none';
        playAgainButton.style.display = 'none';
        createMaze();
    }

    // Function to add event listeners for drawing
    function addEventListeners() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.addEventListener('mouseenter', handleMove);
            cell.addEventListener('mousedown', () => isDrawing = true);
            cell.addEventListener('mouseup', () => isDrawing = false);
            cell.addEventListener('touchstart', (e) => {
                e.preventDefault();
                isDrawing = true;
                handleMove(e);
            });
            cell.addEventListener('touchmove', (e) => {
                e.preventDefault();
                handleMove(e);
            });
            cell.addEventListener('touchend', () => isDrawing = false);
        });
    }

    // Event listener for start button
    startButton.addEventListener('click', startGame);

    // Event listener for play again button
    playAgainButton.addEventListener('click', resetGame);

    // Initial maze creation
    createMaze();
});
