// get reference to canvas
var canvas = document.getElementById('canvas');

// get reference to canvas context
var context = canvas.getContext('2d');

// get reference to loading screen
var loading_screen = document.getElementById('loading');

// initialize loading variables
var loaded = false;
var load_counter = 0;

// initialize images for layers
var background = new Image();
var stars = new Image();
var meteors = new Image();
var hamtaro = new Image();
var konpeito = new Image();

// create a list of layered objects
var layer_list = [
    {
        'image': background,
        'src': 'layer1.png',
        'z_index': -5,
        'position': { x: 0, y: 0 },
        'blend': null,
        'opacity': 1
    },
    {
        'image': stars,
        'src': 'layer2.png',
        'z_index': -4,
        'position': { x: 0, y: 0 },
        'blend': null,
        'opacity': 1
    },
    {
        'image': meteors,
        'src': 'layer3.png',
        'z_index': -2,
        'position': { x: 0, y: 0 },
        'blend': 'lighten',
        'opacity': 1
    },
    {
        'image': hamtaro,
        'src': 'layer4.png',
        'z_index': -.5,
        'position': { x: 0, y: 0 },
        'blend': 'normal',
        'opacity': 1
    },
    {
        'image': konpeito,
        'src': 'layer5.png',
        'z_index': 1.5,
        'position': { x: 0, y: 0 },
        'blend': 'normal',
        'opacity': 1,
    }
];

layer_list.forEach(function (layer, index) {
    layer.image.onload = function () {
        load_counter += 1;
        if (load_counter >= layer_list.length) {
            // hide loading screen
            hideLoading();
            requestAnimationFrame(drawCanvas);
        }
    }
    layer.image.src = layer.src;
});

function hideLoading() {
    loading_screen.classList.add('hidden');
}

function drawCanvas() {
    // clear whatever is in the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // update tween
    TWEEN.update();

    // calculate how much canvas should rotate
    var rotate_x = (pointer.y * -0.07) + (motion.y * -.5);
    var rotate_y = (pointer.x * 0.07) + (motion.x * .5);

    var transform_string = "rotateX(" + rotate_x + "deg) rotateY(" + rotate_y + "deg)";

    // actually rotate canvas
    canvas.style.transform = transform_string;

    // loop through each layer and draw to canvas
    layer_list.forEach(function (layer, index) {

        layer.position = getOffset(layer);

        // If the layer has a blend mode set, use that blend mode, otherwise use normal
        if (layer.blend) {
            context.globalCompositeOperation = layer.blend;
        } else {
            context.globalCompositeOperation = 'normal';
        }

        // Set the opacity of the layer
        context.globalAlpha = layer.opacity;

        context.drawImage(layer.image, layer.position.x, layer.position.y);
    });
    requestAnimationFrame(drawCanvas);
}

// function to calculate layer offset
function getOffset(layer) {
    // calculate the amount you want the layers to move based on touch or mouse input.
    // you can play with the touch_multiplier variable here. Depending on the size of your canvas you may want to turn it up or down.
    var touch_multiplier = 0.1;
    var touch_offset_x = pointer.x * layer.z_index * touch_multiplier;
    var touch_offset_y = pointer.y * layer.z_index * touch_multiplier;

    var motion_multiplier = .5;
    var motion_offset_x = motion.x * layer.z_index * motion_multiplier;
    var motion_offset_y = motion.y * layer.z_index * motion_multiplier;

    // calculate the total offset for both X and Y
    var offset = {
        x: touch_offset_x + motion_offset_x,
        y: touch_offset_y + motion_offset_y
    };

    // return the calculated offset to whatever requested it.
    return offset;
}

//// TOUCH AND MOUSE CONTROLS

var moving = false;

// initialize touch and mouse position
pointer_initial = {
    x: 0,
    y: 0
};

var pointer = {
    x: 0,
    y: 0
}

canvas.addEventListener('touchstart', pointerStart);
canvas.addEventListener('mousedown', pointerStart);

function pointerStart(event) {
    moving = true;
    // check if touch event
    if (event.type === 'touchstart') {
        // set initial touch position to the coordinates where you first touched the screen
        pointer_initial.x = event.touches[0].clientX;
        pointer_initial.y = event.touches[0].clientY;
        // check if mouse click event
    } else if (event.type === 'mousedown') {
        // set initial mouse position to the coordinates where you first clicked
        pointer_initial.x = event.clientX;
        pointer_initial.y = event.clientY;
    }
}

window.addEventListener('touchmove', pointerMove);
window.addEventListener('mousemove', pointerMove);

function pointerMove(even) {
    event.preventDefault();
    // Only run this if touch or mouse click has started
    if (moving === true) {
        var current_x = 0;
        var current_y = 0;
        // check if touch event
        if (event.type === 'touchmove') {
            // Current position of touch
            current_x = event.touches[0].clientX;
            current_y = event.touches[0].clientY;
            // check if mouse event
        } else if (event.type === 'mousemove') {
            // Current position of mouse cursor
            current_x = event.clientX;
            current_y = event.clientY;
        }
        // set pointer position to the difference between current position and initial position
        pointer.x = current_x - pointer_initial.x;
        pointer.y = current_y - pointer_initial.y;
    }
};

canvas.addEventListener('touchmove', function (event) {
    event.preventDefault();
});

canvas.addEventListener('mousehmove', function (event) {
    event.preventDefault();
});

window.addEventListener('touchend', function (event) {
    endGesture();
});

window.addEventListener('mouseup', function (event) {
    endGesture();
});

function endGesture() {
    moving = false;
    // removes any in progress tweens
    TWEEN.removeAll();
    // starts the animation to reset the position of all layers when you stop moving them
    var pointer_tween = new TWEEN.Tween(pointer).to({ x: 0, y: 0 }, 300).easing(TWEEN.Easing.Back.Out).start();

}

//// MOTION CONTROLS ////

// initialize variables for motion-based parallax
var motion_initial = {
    x: null,
    y: null
};

var motion = {
    x: 0,
    y: 0
};

// listen to gyroscope events
window.addEventListener('deviceorientation', function (event) {
    // if this is the first time through
    if (!motion_initial.x && !motion_initial.y) {
        motion_initial.x = event.beta;
        motion_initial.y = event.gamma;
    }

    if (window.orientation === 0) {
        // device in portrait orientation
        motion.x = event.gamma - motion_initial.y;
        motion.y = event.beta - motion_initial.x;

    } else if (window.orientation === 90) {
        // device in landscape on left side
        motion.x = event.beta - motion_initial.x;
        motion.y = -event.gamma + motion_initial.y;

    } else if (window.orientation === -90) {
        // device in landscape on right side
        motion.x = -event.beta + motion_initial.x;
        motion.y = event.gamma - motion.initial.y;

    } else {
        // device upside down
        motion.x = -event.gamma + motion_initial.y;
        motion.y = -event.beta + motion_initial.x;
    }

});

// reset position of motion controls when device changes between portrait and landscape, etc.
window.addEventListener('orientationchange', function (event) {
    motion_initial.x = 0;
    motion_initial.y = 0;
});

window.addEventListener('touchend', function () {
    enableMotion();
});

function enableMotion() {
    if (window.DeviceOrientationEvent) {
        DeviceOrientationEvent.requestPermission();
    }
}
