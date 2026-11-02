const size = 500;

let c = [
    [200, 0, 0, 127],
    [0, 200, 0, 127],
    [0, 0, 200, 127],
    [200, 200, 0, 127],
    [200, 0, 200, 127],
    [0, 200, 200, 127]
];

let angle = 0;

// Keys that are currently switched on
let activeKeys = new Set();

// Smoothed values that chase their targets
let speed = 1;
let scaleFactor = 1;

const countDisplay = document.getElementById('count');

function setup() {
    let cnv = createCanvas(size, size);
    cnv.parent('generativeCanvas');
}

// p5 calls this once per key press
function keyPressed() {
    if (activeKeys.has(keyCode)) {
        activeKeys.delete(keyCode);   // was on -> turn off
    } else {
        activeKeys.add(keyCode);      // was off -> turn on
    }
    countDisplay.textContent = activeKeys.size;
}

function draw() {
    background(255);

    let n = activeKeys.size;

    // Targets: 0 keys = normal, each key adds more
    let targetSpeed = 1 + n * 0.8;
    let targetScale = 1 + n * 0.3;

    // lerp eases toward the target so changes aren't abrupt
    speed = lerp(speed, targetSpeed, 0.1);
    scaleFactor = lerp(scaleFactor, targetScale, 0.1);

    strokeWeight(2);
    circle(size / 2, size / 2, size / 2);

    let grow = sin(angle) * (size / 2) * scaleFactor;

    for (let i = 0; i < 6; ++i) {
        let x = (size / 2) + sin(angle + i) * (size / 4);
        let y = (size / 2) + cos(angle + i) * (size / 4);

        push();
        fill(color(c[i]));
        circle(x, y, grow);
        pop();
    }

    angle += 0.01 * speed;
}