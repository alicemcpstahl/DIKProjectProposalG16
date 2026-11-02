// SETUP
// Finds the <canvas> element in the HTML page and stores it in canvas. const means the variable can’t be reassigned.
const canvas = document.getElementById('generativeCanvas');
// Gets the “drawing context”, the object with all the drawing commands (lineTo, stroke, fillRect, and so on). You never draw on canvas directly, always through ctx.
const ctx = canvas.getContext('2d');
// Finds a text element on the page where the number of held keys is shown.
const countDisplay = document.getElementById('count');

// TRACKING KEYS
// Track active keys using a Set to guarantee uniqueness
// A Set is a list where each value can exist only once. Adding the same key twice does nothing, so activeKeys.size is always the number of different keys currently held. e.code is a physical key name such as "KeyA" or "Space".
const activeKeys = new Set();

// RESIZING
// Resize handler
// Makes the canvas as big as the browser window. A canvas has its own pixel size, separate from CSS, so it must be set explicitly.
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// INPUT LISTENERS
// The first line runs resizeCanvas whenever the window is resized. The second runs it once at startup so the canvas has the right size from the beginning.
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Input listeners
// Runs the function every time any key is pushed down. e is the event object describing which key it was.
window.addEventListener('keydown', (e) => {
    // Prevent repeating triggers from holding down a single key
    // When you hold a key, the browser fires keydown over and over. e.repeat is true for those repeats, so !e.repeat means “only react to the first real press”.
    if (!e.repeat) {
        // Adds the key to the set, then updates the counter on screen.
        activeKeys.add(e.code);
        updateUI();
    }
});

// When a key is released, remove it from the set and update the counter.
window.addEventListener('keyup', (e) => {
    activeKeys.delete(e.code);
    updateUI();
});

// Blur event clears keys if user tabs away to prevent sticky states
// blur fires when the window loses focus (you switch tab). If you release a key while away, keyup never arrives and the key would be stuck as “held”. So everything is cleared.
window.addEventListener('blur', () => {
    activeKeys.clear();
    updateUI();
});
// Writes the number of held keys into the page.
function updateUI() {
    countDisplay.textContent = activeKeys.size;
}

// THE GENERATIVE SHAPE CLASS
// Shape class for handling generative geometries
// Stores the starting position. this means “this particular shape”.
class GenerativeShape {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        // Math.random() gives 0 to 1. Times 60, plus 40, gives a radius between 40 and 100 pixels.
        this.baseRadius = Math.random() * 60 + 40;
        // Random whole number from 5 to 9 (floor rounds down). It controls how many “corners” the shape has.
        this.points = Math.floor(Math.random() * 5) + 5; // Number of vertices
        // Starting rotation in radians. Math.PI * 2 is a full circle (360°).
        this.angle = Math.random() * Math.PI * 2;

        // Base independent directional speeds
        // Speed in x and y. Math.random() - 0.5 gives -0.5 to 0.5, times 2 gives -1 to 1. Negative means left or up, positive means right or down.
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        // How fast it spins, in radians per frame. It can be negative (counter-clockwise).
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;

        // Color configuration
        // Color on the color wheel, 0 to 360 (0 = red, 120 = green, 240 = blue).
        this.hue = Math.random() * 360;
        // A random starting phase for the wobbling animation, so shapes don’t all wobble in sync.
        this.noiseOffset = Math.random() * 1000;
    }

    // Runs every frame
    update(keyCount) {
        // The core requirement: speed scaling factor based on pressed keys
        // Base multiplier is 1 (no keys). Every key adds significant speed.
        // This is the key-to-speed link. With 0 keys it’s 1 (normal speed), with 1 key it’s 3.5, with 2 keys it’s 6, and so on. Change 2.5 to make keys more or less powerful.
        const speedMultiplier = 1 + (keyCount * 2.5);

        // Update positional coordinates
        // Moves and rotates the shape, scaled by the multiplier.
        this.x += this.vx * speedMultiplier;
        this.y += this.vy * speedMultiplier;
        this.angle += this.rotationSpeed * speedMultiplier;

        // Morph shape details over time, faster based on key pressure
        // Advances the wobble phase, so the shape morphs faster too.
        this.noiseOffset += 0.01 * speedMultiplier;

        // Screen boundaries wrapping logic
        // Screen wrapping: when a shape fully leaves one side (with a margin of its own size), it reappears on the opposite side.
        if (this.x < -this.baseRadius * 2) this.x = canvas.width + this.baseRadius;
        if (this.x > canvas.width + this.baseRadius * 2) this.x = -this.baseRadius;
        if (this.y < -this.baseRadius * 2) this.y = canvas.height + this.baseRadius;
        if (this.y > canvas.height + this.baseRadius * 2) this.y = -this.baseRadius;
    }

    // Runs every frame
    draw() {
        // Saves the current drawing state (position, rotation) so it can be restored later.
        ctx.save();
        // Moves the drawing origin (0,0) to the shape’s position and rotates the whole coordinate system. Everything drawn afterwards is relative to the shape’s center.
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Starts a new path (a fresh line drawing).
        ctx.beginPath();
        // Generate complex procedural vertex structures using sine/cosine modulation
        // Loops once per vertex. There are points * 2 vertices, so 5 to 9 points gives 10 to 18 vertices.
        for (let i = 0; i < this.points * 2; i++) {
            // Divides the full circle evenly among the vertices. Vertex i sits at this angle around the center.
            const currentAngle = (Math.PI * 2 / (this.points * 2)) * i;

            // Modulate radius dynamically to create shifting generative waves
            // Each vertex’s distance from center is the base radius plus or minus up to 20 pixels. Since noiseOffset keeps growing, the wave moves and the shape “breathes”. The i * 1.5 makes neighbouring vertices differ, which gives the jagged star-like look.
            const wave = Math.sin(i * 1.5 + this.noiseOffset) * 20;
            const r = this.baseRadius + wave;

            // Converts angle plus distance into x and y coordinates (polar to Cartesian).
            const lx = Math.cos(currentAngle) * r;
            const ly = Math.sin(currentAngle) * r;

            // The first vertex lifts the pen to that spot, the rest draw lines to the next point. closePath connects the last point back to the first.
            if (i === 0) {
                ctx.moveTo(lx, ly);
            } else {
                ctx.lineTo(lx, ly);
            }
        }
        ctx.closePath();

        // Style configurations
        // Sets the line color (hue, saturation, lightness, opacity), the thickness, and draws the outline.
        ctx.strokeStyle = `hsla(${this.hue}, 80%, 60%, 0.8)`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner abstract detail lines
        // A new path: a full circle at the center (arc(x, y, radius, startAngle, endAngle)) with 30% of the radius. Its color is shifted 120° around the color wheel (% 360 keeps it in range).
        ctx.beginPath();
        ctx.arc(0, 0, this.baseRadius * 0.3, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${(this.hue + 120) % 360}, 70%, 50%, 0.4)`;
        ctx.stroke();

        // Undoes the translate and rotate so the next shape starts from a clean state.
        ctx.restore();
    }
}

// CREATING THE SHAPES
// Initialize shape population
// Makes an empty array, then 15 times creates a new shape at a random position and adds it with push.
const shapes = [];
for (let i = 0; i < 15; i++) {
    shapes.push(new GenerativeShape(Math.random() * canvas.width, Math.random() * canvas.height));
}

// MAIN LOOP
// Main Loop
// Instead of erasing the screen fully, it paints a nearly black rectangle at 15% opacity. Old frames fade out slowly, which creates the trails. A lower alpha (e.g. 0.05) gives longer trails, and 1 gives no trails.
function animate() {
    // Semi-transparent trailing clear to create smooth visual motion blur
    ctx.fillStyle = 'rgba(5, 5, 10, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Reads how many keys are held right now.
    const activeCount = activeKeys.size;

    // Process updates and renders
    // For every shape: move it, then draw it.
    shapes.forEach(shape => {
        shape.update(activeCount);
        shape.draw();
    });

    // requestAnimationFrame asks the browser to call animate again before the next screen repaint (about 60 times per second). The last line starts the loop.
    requestAnimationFrame(animate);
}

// Fire loop
animate();