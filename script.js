"use strict";


// ============================================
// DOM ELEMENTS
// ============================================

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");

const carColorInput =
    document.getElementById("carColor");

const speedSelect =
    document.getElementById("speedSelect");

const startButton =
    document.getElementById("startButton");

const restartButton =
    document.getElementById("restartButton");

const scoreElement =
    document.getElementById("score");

const highScoreElement =
    document.getElementById("highScore");

const gameOverScreen =
    document.getElementById("gameOverScreen");

const finalScoreElement =
    document.getElementById("finalScore");

const leftButton =
    document.getElementById("leftButton");

const rightButton =
    document.getElementById("rightButton");


// ============================================
// GAME SETTINGS
// ============================================

const ROAD_LEFT = 50;

const ROAD_RIGHT =
    canvas.width - 50;

const PLAYER_SPEED = 7;

const ROAD_MARKING_HEIGHT = 45;

const ROAD_MARKING_GAP = 35;


// ============================================
// GAME STATE
// ============================================

let gameRunning = false;

let gameSpeed = 1;

let score = 0;

let highScore =
    Number(
        localStorage.getItem(
            "carRacingHighScore"
        )
    ) || 0;

let roadOffset = 0;

let enemySpawnTimer = 0;

let animationId = null;


// ============================================
// DISPLAY HIGH SCORE
// ============================================

highScoreElement.textContent =
    highScore;


// ============================================
// PLAYER
// ============================================

const player = {

    x:
        canvas.width / 2 - 22,

    y:
        canvas.height - 110,

    width: 44,

    height: 78,

    speed:
        PLAYER_SPEED,

    color:
        "#ff0000"

};


// ============================================
// ENEMIES
// ============================================

let enemies = [];


// ============================================
// KEYBOARD INPUT
// ============================================

const keys = {

    left: false,

    right: false

};


document.addEventListener(
    "keydown",
    function (event) {

        const key =
            event.key.toLowerCase();


        if (
            key === "arrowleft" ||
            key === "a"
        ) {

            keys.left = true;

            event.preventDefault();

        }


        if (
            key === "arrowright" ||
            key === "d"
        ) {

            keys.right = true;

            event.preventDefault();

        }


        // Enter starts/restarts the game

        if (
            key === "enter" &&
            !gameRunning
        ) {

            startGame();

        }

    }
);


document.addEventListener(
    "keyup",
    function (event) {

        const key =
            event.key.toLowerCase();


        if (
            key === "arrowleft" ||
            key === "a"
        ) {

            keys.left = false;

        }


        if (
            key === "arrowright" ||
            key === "d"
        ) {

            keys.right = false;

        }

    }
);


// ============================================
// TOUCH CONTROLS
// ============================================

function setControl(
    direction,
    active
) {

    if (direction === "left") {

        keys.left = active;

        leftButton.classList.toggle(
            "active",
            active
        );

    }


    if (direction === "right") {

        keys.right = active;

        rightButton.classList.toggle(
            "active",
            active
        );

    }

}


// --------------------------------------------
// LEFT BUTTON
// --------------------------------------------

leftButton.addEventListener(
    "pointerdown",
    function (event) {

        event.preventDefault();

        setControl(
            "left",
            true
        );

    }
);


leftButton.addEventListener(
    "pointerup",
    function (event) {

        event.preventDefault();

        setControl(
            "left",
            false
        );

    }
);


leftButton.addEventListener(
    "pointercancel",
    function () {

        setControl(
            "left",
            false
        );

    }
);


leftButton.addEventListener(
    "pointerleave",
    function () {

        setControl(
            "left",
            false
        );

    }
);


// --------------------------------------------
// RIGHT BUTTON
// --------------------------------------------

rightButton.addEventListener(
    "pointerdown",
    function (event) {

        event.preventDefault();

        setControl(
            "right",
            true
        );

    }
);


rightButton.addEventListener(
    "pointerup",
    function (event) {

        event.preventDefault();

        setControl(
            "right",
            false
        );

    }
);


rightButton.addEventListener(
    "pointercancel",
    function () {

        setControl(
            "right",
            false
        );

    }
);


rightButton.addEventListener(
    "pointerleave",
    function () {

        setControl(
            "right",
            false
        );

    }
);


// ============================================
// RELEASE TOUCH WHEN POINTER LEAVES WINDOW
// ============================================

window.addEventListener(
    "blur",
    function () {

        keys.left = false;

        keys.right = false;

        leftButton.classList.remove(
            "active"
        );

        rightButton.classList.remove(
            "active"
        );

    }
);


// ============================================
// START BUTTON
// ============================================

startButton.addEventListener(
    "click",
    startGame
);


restartButton.addEventListener(
    "click",
    startGame
);


// ============================================
// START GAME
// ============================================

function startGame() {

    if (animationId !== null) {

        cancelAnimationFrame(
            animationId
        );

        animationId = null;

    }


    gameRunning = true;

    score = 0;

    roadOffset = 0;

    enemySpawnTimer = 0;

    enemies = [];


    // Get selected settings

    gameSpeed =
        Number(
            speedSelect.value
        );


    player.color =
        carColorInput.value;


    // Reset player position

    player.x =
        canvas.width / 2 -
        player.width / 2;


    // Reset controls

    keys.left = false;

    keys.right = false;


    leftButton.classList.remove(
        "active"
    );

    rightButton.classList.remove(
        "active"
    );


    // Reset score

    scoreElement.textContent =
        "0";


    // Hide game over screen

    gameOverScreen.classList.add(
        "hidden"
    );


    startButton.textContent =
        "Restart Game";


    // Start game loop

    gameLoop();

}


// ============================================
// GAME LOOP
// ============================================

function gameLoop() {

    if (!gameRunning) {

        return;

    }


    update();

    draw();


    animationId =
        requestAnimationFrame(
            gameLoop
        );

}


// ============================================
// UPDATE GAME
// ============================================

function update() {

    updatePlayer();

    updateRoad();

    updateEnemies();

    checkCollisions();

}


// ============================================
// UPDATE PLAYER
// ============================================

function updatePlayer() {

    if (keys.left) {

        player.x -=
            player.speed;

    }


    if (keys.right) {

        player.x +=
            player.speed;

    }


    // Keep player inside road

    const leftLimit =
        ROAD_LEFT + 7;

    const rightLimit =
        ROAD_RIGHT -
        player.width -
        7;


    if (
        player.x <
        leftLimit
    ) {

        player.x =
            leftLimit;

    }


    if (
        player.x >
        rightLimit
    ) {

        player.x =
            rightLimit;

    }

}


// ============================================
// UPDATE ROAD
// ============================================

function updateRoad() {

    roadOffset +=
        gameSpeed;


    const patternSize =
        ROAD_MARKING_HEIGHT +
        ROAD_MARKING_GAP;


    if (
        roadOffset >=
        patternSize
    ) {

        roadOffset -=
            patternSize;

    }

}


// ============================================
// CREATE ENEMY
// ============================================

function createEnemy() {

    const enemyColors = [

        "#2196f3",

        "#ffeb3b",

        "#e91e63",

        "#ffffff",

        "#00e676",

        "#ff9800"

    ];


    const roadWidth =
        ROAD_RIGHT -
        ROAD_LEFT;


    const laneWidth =
        roadWidth / 3;


    const lane =
        Math.floor(
            Math.random() * 3
        );


    const x =
        ROAD_LEFT +
        lane * laneWidth +
        (laneWidth - 44) / 2;


    const enemy = {

        x: x,

        y: -100,

        width: 44,

        height: 78,

        speed:
            gameSpeed * 0.65 +
            Math.random() * 2.5,

        color:
            enemyColors[
                Math.floor(
                    Math.random() *
                    enemyColors.length
                )
            ]

    };


    enemies.push(enemy);

}


// ============================================
// UPDATE ENEMIES
// ============================================

function updateEnemies() {

    enemySpawnTimer++;


    const spawnRate =
        Math.max(
            38,
            78 - gameSpeed * 2
        );


    if (
        enemySpawnTimer >=
        spawnRate
    ) {

        createEnemy();

        enemySpawnTimer = 0;

    }


    for (
        let i = enemies.length - 1;
        i >= 0;
        i--
    ) {

        const enemy =
            enemies[i];


        enemy.y +=
            enemy.speed;


        // Enemy passed player

        if (
            enemy.y >
            canvas.height + 100
        ) {

            enemies.splice(
                i,
                1
            );


            score++;


            scoreElement.textContent =
                score;


            // Update high score

            if (
                score > highScore
            ) {

                highScore =
                    score;


                highScoreElement.textContent =
                    highScore;


                localStorage.setItem(
                    "carRacingHighScore",
                    highScore
                );

            }

        }

    }

}


// ============================================
// COLLISION
// ============================================

function checkCollision(
    a,
    b
) {

    const padding = 6;


    return (

        a.x + padding <
        b.x +
        b.width -
        padding

        &&

        a.x +
        a.width -
        padding >
        b.x +
        padding

        &&

        a.y + padding <
        b.y +
        b.height -
        padding

        &&

        a.y +
        a.height -
        padding >
        b.y +
        padding

    );

}


// ============================================
// CHECK COLLISIONS
// ============================================

function checkCollisions() {

    for (
        const enemy of enemies
    ) {

        if (
            checkCollision(
                player,
                enemy
            )
        ) {

            gameOver();

            return;

        }

    }

}


// ============================================
// GAME OVER
// ============================================

function gameOver() {

    gameRunning = false;


    if (
        animationId !== null
    ) {

        cancelAnimationFrame(
            animationId
        );

        animationId = null;

    }


    keys.left = false;

    keys.right = false;


    leftButton.classList.remove(
        "active"
    );

    rightButton.classList.remove(
        "active"
    );


    finalScoreElement.textContent =
        score;


    gameOverScreen.classList.remove(
        "hidden"
    );

}


// ============================================
// DRAW EVERYTHING
// ============================================

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    drawGrass();

    drawRoad();

    drawRoadMarkings();

    drawPlayer();

    drawEnemies();

}


// ============================================
// DRAW GRASS
// ============================================

function drawGrass() {

    ctx.fillStyle =
        "#238b23";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Grass details

    ctx.fillStyle =
        "#1b741b";


    for (
        let y = 0;
        y < canvas.height;
        y += 25
    ) {

        ctx.fillRect(
            15,
            y,
            4,
            10
        );


        ctx.fillRect(
            canvas.width - 20,
            y + 8,
            4,
            10
        );

    }

}


// ============================================
// DRAW ROAD
// ============================================

function drawRoad() {

    ctx.fillStyle =
        "#3c3c3c";


    ctx.fillRect(
        ROAD_LEFT,
        0,
        ROAD_RIGHT -
        ROAD_LEFT,
        canvas.height
    );


    // White road edges

    ctx.fillStyle =
        "#ffffff";


    ctx.fillRect(
        ROAD_LEFT,
        0,
        5,
        canvas.height
    );


    ctx.fillRect(
        ROAD_RIGHT - 5,
        0,
        5,
        canvas.height
    );


    // Red / white road stripes

    const stripeHeight =
        20;


    for (
        let y =
            -stripeHeight +
            roadOffset;

        y <
            canvas.height;

        y +=
            stripeHeight * 2
    ) {

        ctx.fillStyle =
            "#e53935";


        ctx.fillRect(
            ROAD_LEFT - 5,
            y,
            5,
            stripeHeight
        );


        ctx.fillRect(
            ROAD_RIGHT,
            y,
            5,
            stripeHeight
        );

    }

}


// ============================================
// DRAW ROAD MARKINGS
// ============================================

function drawRoadMarkings() {

    ctx.fillStyle =
        "#ffffff";


    const markingWidth =
        5;


    const markingHeight =
        ROAD_MARKING_HEIGHT;


    const pattern =
        markingHeight +
        ROAD_MARKING_GAP;


    const roadWidth =
        ROAD_RIGHT -
        ROAD_LEFT;


    const lane1 =
        ROAD_LEFT +
        roadWidth / 3;


    const lane2 =
        ROAD_LEFT +
        roadWidth * 2 / 3;


    for (
        let y =
            -pattern +
            roadOffset;

        y <
            canvas.height;

        y +=
            pattern
    ) {

        ctx.fillRect(
            lane1 -
            markingWidth / 2,
            y,
            markingWidth,
            markingHeight
        );


        ctx.fillRect(
            lane2 -
            markingWidth / 2,
            y,
            markingWidth,
            markingHeight
        );

    }

}


// ============================================
// DRAW PLAYER
// ============================================

function drawPlayer() {

    drawCar(
        player,
        true
    );

}


// ============================================
// DRAW ENEMIES
// ============================================

function drawEnemies() {

    for (
        const enemy of enemies
    ) {

        drawCar(
            enemy,
            false
        );

    }

}


// ============================================
// DRAW CAR
// ============================================

function drawCar(
    car,
    isPlayer
) {

    ctx.save();


    // Shadow

    ctx.fillStyle =
        "rgba(0,0,0,0.35)";


    ctx.fillRect(
        car.x + 4,
        car.y + 5,
        car.width,
        car.height
    );


    // Main body

    ctx.fillStyle =
        car.color;


    roundRect(
        ctx,
        car.x,
        car.y,
        car.width,
        car.height,
        8
    );


    ctx.fill();


    // Highlight

    ctx.fillStyle =
        "rgba(255,255,255,0.2)";


    ctx.fillRect(
        car.x + 5,
        car.y + 5,
        5,
        car.height - 10
    );


    // Roof

    ctx.fillStyle =
        "#222";


    roundRect(
        ctx,
        car.x + 7,
        car.y + 14,
        car.width - 14,
        35,
        7
    );


    ctx.fill();


    // Windshield

    ctx.fillStyle =
        "#8ed8ff";


    roundRect(
        ctx,
        car.x + 11,
        car.y + 18,
        car.width - 22,
        12,
        3
    );


    ctx.fill();


    // Rear windshield

    ctx.fillStyle =
        "#5db5df";


    roundRect(
        ctx,
        car.x + 11,
        car.y + 34,
        car.width - 22,
        9,
        3
    );


    ctx.fill();


    // Wheels

    ctx.fillStyle =
        "#111";


    ctx.fillRect(
        car.x - 4,
        car.y + 12,
        7,
        22
    );


    ctx.fillRect(
        car.x + car.width - 3,
        car.y + 12,
        7,
        22
    );


    ctx.fillRect(
        car.x - 4,
        car.y + 50,
        7,
        22
    );


    ctx.fillRect(
        car.x + car.width - 3,
        car.y + 50,
        7,
        22
    );


    // Lights

    if (isPlayer) {

        ctx.fillStyle =
            "#fff59d";


        ctx.fillRect(
            car.x + 7,
            car.y + 3,
            10,
            5
        );


        ctx.fillRect(
            car.x + car.width - 17,
            car.y + 3,
            10,
            5
        );

    } else {

        ctx.fillStyle =
            "#ff3333";


        ctx.fillRect(
            car.x + 7,
            car.y + car.height - 8,
            10,
            5
        );


        ctx.fillRect(
            car.x + car.width - 17,
            car.y + car.height - 8,
            10,
            5
        );

    }


    ctx.restore();

}


// ============================================
// ROUNDED RECTANGLE
// ============================================

function roundRect(
    context,
    x,
    y,
    width,
    height,
    radius
) {

    context.beginPath();


    context.moveTo(
        x + radius,
        y
    );


    context.lineTo(
        x + width - radius,
        y
    );


    context.quadraticCurveTo(
        x + width,
        y,
        x + width,
        y + radius
    );


    context.lineTo(
        x + width,
        y + height - radius
    );


    context.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height
    );


    context.lineTo(
        x + radius,
        y + height
    );


    context.quadraticCurveTo(
        x,
        y + height,
        x,
        y + height - radius
    );


    context.lineTo(
        x,
        y + radius
    );


    context.quadraticCurveTo(
        x,
        y,
        x + radius,
        y
    );


    context.closePath();

}


// ============================================
// INITIAL SCREEN
// ============================================

drawGrass();

drawRoad();

drawRoadMarkings();

drawPlayer();