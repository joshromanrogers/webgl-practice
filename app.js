InitDemo = () => {
    console.log('This is working');
}

let canvas = document.getElementById('game-surface');
var gl = canvas.getContext('webgl');

if (!gl) {
    alert('your browser does not support WebGL');
}

// setting colour 
gl.clearColor(0.75, 0.85, 0.8, 1.0);

// perform
// colour buffer  - stores all the colours you want the pixel to be
// depth buffer - stores the depth of the pixels in the screen (z value)
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

