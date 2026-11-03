function openForm() {
    document.getElementById("myForm").style.display = "block";
}

function closeForm() {
    document.getElementById("myForm").style.display = "none";
}
// test3.js
const size = 500;

// Distance of the circles from the centre. Bigger = further apart.
const orbitRadius = size * 0.3;

// Largest circle diameter (before the key boost)
const maxBallSize = size * 0.3;

// Färgpalett för bubblorna
const palette = [
    '#ff70ba',
    '#8a79b7',
    '#1989d8',
    '#8ec55e',
    '#ffde59',
    '#c61f72',
    '#ffad85'
];

let angle = 0;

// Keys that are switched on: keyCode -> label to show
let activeKeys = new Map();

let speed = 1;
let scaleFactor = 1;

const keysDisplay = document.getElementById('keys');

function setup() {
    let cnv = createCanvas(window.innerWidth, window.innerHeight * 1.0);
    cnv.parent('generativeCanvas');
    updateKeyList();

    document.getElementById('reset').addEventListener('click', (e) => {
        resetAll();
        e.target.blur();   // otherwise Space/Enter would "click" the button again
    });
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight *1.0);
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
        activeKeys.delete(keyCode);  // was on -> off
    } else {
        activeKeys.set(keyCode, keyLabel());  // was off -> on
    }
    updateKeyList();
}

function draw() {
    clear();

    let n = activeKeys.size;

 //intensivare animationen med flera akrriva knappar
    let targetSpeed = 1 + n * 0.15;
    let targetScale = 1 + n * 0.12;

    speed = lerp(speed, targetSpeed, 0.1);
    scaleFactor = lerp(scaleFactor, targetScale, 0.1);

    // Visualiseringens centrum
    let centerX = width / 2;
    let centerY = height / 2;

    // Avstånd mellan bubblorna
    let spaceX = min(width * 0.35, height * 0.55);
    let spaceY = height * 0.32;

    // Skapa 55 animerade bubblor

    for (let i = 0; i < 50; i++) {

   // eget rörelse
   let x = centerX + sin(angle * (0.5 + i * 0.03) + i * 2.4) * spaceX;
   let y = centerY + cos(angle * (0.4 + i * 0.025) + i * 3.1) * spaceY;
 
 // Olika storlekar på bubblorna
   let baseSize ;
   if(i % 8===0){
    baseSize = 90; 
 } else if (i % 4 === 0) {
    baseSize=55;
 } else {
  baseSize = 18+(i % 5) *13;
 }

 let pulse = sin(angle *2 + i)*8;


  // Vissa bubblor växer extra mycket när fler beats aktiveras
   let extraGrowth = (i % 4 === 0) ? n * 12 : n * 3;
   let ballSize = (baseSize + pulse + extraGrowth) * scaleFactor;

 // Välj färg
    let ballColor = color(palette[i % palette.length]);
    push();

    // Var tredje bubbla får endast en outline
   if (i % 3 === 0) {
    noFill();
    stroke(ballColor);
    strokeWeight(3);

  } else {

    ballColor.setAlpha(150);
    fill(ballColor);
    noStroke();

   }
   circle(x, y, ballSize);
   pop(); 
}
    angle += 0.01 * speed;
}