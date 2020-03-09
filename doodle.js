// things we need at the start
// downloaded RNN model
let model;

// position of imaginary 'pen'
let x;
let y;

// variable to hold if we are drawing with the pen, or just moving the pen
// can be 'up' or 'down'
let penState;

// variable to hold pen motion
let strokeInstruction = null;

// canvas size
const width = 400;
const height = 400;

// canvas background color
const bgColor = [200, 100, 200];


//--------------------------

// code that runs when page is loaded
function setup() {
    // create area to draw within
    createCanvas(width, height);

    // color background
    background(bgColor);

    // move pen to random position, and place pen down
    createNewDoodle();

    // set stroke to random color
    stroke(random(255), 0, random(255));

    // load RNN model and run 'callback' function on completion
    model = ml5.sketchRNN('elephant', modelReady);
}

//--------------------------

// move pen to random position, and place pen down
function createNewDoodle() {
    penState = 'down';
    x = random(-width / 2, width / 2)
    y = random(-height / 2, height / 2)
}

//--------------------------

// when the model is RNN downloaded...
function modelReady() {
    // note that everything downloaded correctly
    console.log('model ready');
    // ask the model to generate a new sketch instructions
    model.generate(strokeGenerated);
}

//--------------------------

// when we have a new stroke instruction...
function strokeGenerated(error, instruction) {
    if (error) {
        // print an error if one shows up
        console.error(error);
        return;
    }

    // expose our new instruction so the draw loop can see it
    strokeInstruction = instruction;
    // console.log(strokeInstruction);
}

//--------------------------

// the constantly running loop
function draw() {

    // If there is no strokeInstruction, early exit
    if (strokeInstruction == null) {
        return;
    }

    // since p5 draws (0,0) in the middle but our model
    // assumes (0,0) at the bottom left...
    // we shift everything up and to the right
    translate(width / 2, height / 2);

    // where should the pen move to?
    // the multiplication is for scaling
    const newX = x + strokeInstruction.dx * 0.2;
    const newY = y + strokeInstruction.dy * 0.2;

    // check if we should draw a line...
    if (penState == 'down') {
        // set thickness of line
        strokeWeight(1);
        // draw a line!
        line(x, y, newX, newY);
    }

    // save next pen up- or down-ness
    penState = strokeInstruction.pen;

    // ensure we do not redraw the same line
    strokeInstruction = null;

    // save end of last instruction as new pen location
    x = newX;
    y = newY;

    // if the model does not say our sketch is finished
    if (penState !== 'end') {
        //generate next stroke instruction
        model.generate(strokeGenerated);
    }
    // we're done with this sketch
    else {
        // console.log('drawing complete');
        // select new random stroke color
        stroke(random(255), 0, random(255));

        // move pen to new location
        createNewDoodle();

        // reset the model
        model.reset();

        // generate new instruction
        model.generate(strokeGenerated);
    }
}
