var vertexShaderText = 
[
// level of quality = medium
'precision mediump float;',
'',
// incoming positions of vertices
'attribute vec2 vertPosition;',
'',
'void main()',
'{',
'   gl_Position =  vec4(vertPosition, 0.0, 1.0);',
'}'
].join('\n');

var fragmentShaderText = 
[
'precision mediump float',
'',
'void main()',
'{',
'   gl_FragColor = vec4(1.0, 0.0, 0.0, 0.0);',
'}'
].join('\n');

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
// colour buffer - stores all the colours you want the pixel to be
// depth buffer - stores the depth of the pixels in the screen (z value)
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

// create new shader objects
let vertexShader = gl.createShader(gl.VERTEX_SHADER);
let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

// compile shaders from vertexShaderText and fragmentShaderText
gl.shaderSource(vertexShader, vertexShaderText);
gl.shaderSource(fragmentShader, fragmentShaderText);

// compile shaders




