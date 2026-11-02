const size = 500;

// Distance of the circles from the centre. Bigger = further apart.
const orbitRadius = size * 0.3;

// Largest circle diameter (before the key boost)
const maxBallSize = size * 0.3;

let c = [
    [200, 0, 0, 127],
    [0, 200, 0, 127],
    [0, 0, 200, 127],
    [200, 200, 0, 127],
    [200, 0, 200, 127],
    [0, 200, 200, 127]
];

let angle = 0;

// Keys that are switched on: keyCode -> label to show
let activeKeys = new Map();

let speed = 1;
let scaleFactor = 1;

const keysDisplay = document.getElementById('keys');

function setup() {
    let cnv = createCanvas(window.innerWidth, window.innerHeight);
    cnv.parent('generativeCanvas');
    updateKeyList();

    document.getElementById('reset').addEventListener('click', (e) => {
        resetAll();
        e.target.blur();   // otherwise Space/Enter would "click" the button again
    });
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// Turn off every key at once
function resetAll() {
    activeKeys.clear();
    updateKeyList();
}

// Rebuilds the list of active keys on the page
function updateKeyList() {
    keysDisplay.textContent = '';

    if (activeKeys.size === 0) {
        keysDisplay.textContent = 'none';
        return;
    }

    for (let label of activeKeys.values()) {
        let chip = document.createElement('span');
        chip.className = 'key-chip';
        chip.textContent = label;
        keysDisplay.appendChild(chip);
    }
}

// Readable name for a key
function keyLabel() {
    if (key === ' ') return 'SPACE';
    if (key.length === 1) return key.toUpperCase();
    return key;   // e.g. "Enter", "ArrowUp", "Shift"
}

function keyPressed() {
    // Escape = reset, and is not counted as a key itself
    if (keyCode === ESCAPE) {
        resetAll();
        return;
    }

    if (activeKeys.has(keyCode)) {
        activeKeys.delete(keyCode);                 // was on -> off
    } else {
        activeKeys.set(keyCode, keyLabel());        // was off -> on
    }
    updateKeyList();
}

function draw() {
    clear();

    let n = activeKeys.size;

    let targetSpeed = 1 + n * 0.8;
    let targetScale = 1 + n * 0.3;

    speed = lerp(speed, targetSpeed, 0.1);
    scaleFactor = lerp(scaleFactor, targetScale, 0.1);

    strokeWeight(2);

    let grow = sin(angle) * maxBallSize * scaleFactor;
    let centerX = width / 2;
    let centerY = height / 2;

    for (let i = 0; i < 6; ++i) {
        let ballAngle = angle + i * TWO_PI / 6;
        let x = centerX + sin(ballAngle) * orbitRadius;
        let y = centerY + cos(ballAngle) * orbitRadius;

        push();
        fill(color(c[i]));
        circle(x, y, grow);
        pop();
    }

    angle += 0.01 * speed;
}