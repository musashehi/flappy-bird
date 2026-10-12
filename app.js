const GRAVITY = 0.35;
const JUMP_STRENGTH = -7.5;
const PIPE_SPEED = 3;
const PIPE_GAP = 160;
const PIPE_SPAWN_INTERVAL = 1600;

const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

const bgImg = new Image();
bgImg.src = "assets/background.png";

const roadImg = new Image();
roadImg.src = "assets/road.png";

const birdImg = new Image();
birdImg.src = "assets/bird.png";

const pipeImg = new Image();
pipeImg.src = "assets/column.png";

let gameState = "START";
let score = 0;
let bestScore = localStorage.getItem("flappyBestScore") || 0;

let bird = {
    x: 150,
    y: 250,
    width: 37,
    height: 25,
    velocity: 0
};

let pipes = [];
let spawnTimer = 0;
let lastTime = 0;

function reset() {
    bird.y = 250;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    spawnTimer = 0;
    gameState = "PLAYING";
}

function checkCollision() {
    if (bird.y <= 0 || bird.y + bird.height >= 530) {
        return true;
    }

    for (let pipe of pipes) {
        if (
            bird.x < pipe.x + pipe.width &&
            bird.x + bird.width > pipe.x &&
            bird.y < pipe.topHeight
        ) {
            return true;
        }
        if (
            bird.x < pipe.x + pipe.width &&
            bird.x + bird.width > pipe.x &&
            bird.y + bird.height > pipe.bottomY
        ) {
            return true;
        }
    }
    return false;
}

function update(deltaTime) {
    if (gameState !== "PLAYING") return;

    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

    spawnTimer += deltaTime;
    if (spawnTimer >= PIPE_SPAWN_INTERVAL) {
        spawnTimer = 0;
        let minHeight = 50;
        let maxHeight = 350;
        let topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        
        pipes.push({
            x: canvas.width,
            width: 60,
            topHeight: topHeight,
            bottomY: topHeight + PIPE_GAP,
            passed: false
        });
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= PIPE_SPEED;

        if (!pipes[i].passed && pipes[i].x + pipes[i].width < bird.x) {
            pipes[i].passed = true;
            score++;
            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem("flappyBestScore", bestScore);
            }
        }

        if (pipes[i].x + pipes[i].width < 0) {
            pipes.splice(i, 1);
        }
    }

    if (checkCollision()) {
        gameState = "GAMEOVER";
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (bgImg.complete) {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    }

    for (let pipe of pipes) {
        ctx.drawImage(pipeImg, pipe.x, 0, pipe.width, pipe.topHeight);
        ctx.drawImage(pipeImg, pipe.x, pipe.bottomY, pipe.width, canvas.height - pipe.bottomY);
    }

    if (roadImg.complete) {
        ctx.drawImage(roadImg, 0, 530, canvas.width, 70);
    }

    if (birdImg.complete) {
        ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    if (gameState === "START") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "bold 36px 'Comic Sans MS', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Flappy Bird", canvas.width / 2, 220);
        
        ctx.font = "20px 'Comic Sans MS', sans-serif";
        ctx.fillText("Prek ekranin ose shtyp SPACE për të filluar", canvas.width / 2, 280);
    } 
    else if (gameState === "PLAYING") {
        ctx.fillStyle = "white";
        ctx.font = "bold 32px 'Comic Sans MS', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(score, canvas.width / 2, 60);
    } 
    else if (gameState === "GAMEOVER") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "red";
        ctx.font = "bold 42px 'Comic Sans MS', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("OH NO! YOU CRASHED!", canvas.width / 2, 200);

        ctx.fillStyle = "white";
        ctx.font = "24px 'Comic Sans MS', sans-serif";
        ctx.fillText(`Score: ${score}   |   Best: ${bestScore}`, canvas.width / 2, 260);

        ctx.fillStyle = "red";
        ctx.fillRect(canvas.width / 2 - 100, 320, 200, 60);
        ctx.fillStyle = "white";
        ctx.font = "bold 26px 'Comic Sans MS', sans-serif";
        ctx.fillText("RESTART", canvas.width / 2, 360);
    }
}

function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    update(deltaTime);
    draw();

    requestAnimationFrame(gameLoop);
}

function handleInput() {
    if (gameState === "START") {
        reset();
    } else if (gameState === "PLAYING") {
        bird.velocity = JUMP_STRENGTH;
    } else if (gameState === "GAMEOVER") {
        reset();
    }
}

window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        handleInput();
    }
});

window.addEventListener("mousedown", () => {
    handleInput();
});

window.addEventListener("touchstart", (e) => {
    e.preventDefault();
    handleInput();
}, { passive: false });

requestAnimationFrame(gameLoop);