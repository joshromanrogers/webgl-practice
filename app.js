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
'   gl_Position = vec4(vertPosition, 0.0, 1.0);',
'}'
].join('\n');

var fragmentShaderText = 
[
'precision mediump float;',
'',
'void main()',
'{',
'   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);',
'}'
].join('\n');

InitDemo = () => {
    console.log('This is working');

    let canvas = document.getElementById('game-surface');
    let gl = canvas.getContext('webgl');

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

    // compile shaders + implement error if statements
    gl.compileShader(vertexShader);
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
    }
    gl.compileShader(fragmentShader);
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
    }

    // tell openGL these are the programs we want to use together
    // create program and attach shaders
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // link program together + implemenet error if statement
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(program));
        return;
    }

    // validate program + catch additional errors (only use in testing)
    gl.validateProgram(program);
    if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', gl.getProgramInfoLog(program));
        return;
    }

    //
    // below we need to set all the information that the graphics card (that we built above) is going to be using
    //

    // create buffer, send information over to the graphics card.
    // CPU => GPU memory transfer

    // vertices of the triangle on the CPU
    let triangleVertices = [
        // X, Y
        0.0, 0.5,
        -0.5, -0.5,
        0.5, -0.5,
    ];

    // chunk of memory on the GPU that we're ready to use
    let triangleVertexBufferObject = gl.createBuffer();
    // binding this buffer to be the active buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    // specify data on active buffer (type of buffer we are talking about, vertices to use, 
    // sending information from CPU to GPU memory once)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

    // now need to inform the vertex shader that the attribute vertPosition is the triangleVertices pairs

    // get a handle to the attribute (in vertex shader)
    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    // specify the layout of the attribute
    gl.vertexAttribPointer(
        positionAttribLocation, // Attribute location
        2, // Number of elements per attribute
        gl.FLOAT, // type of elements
        gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
        0 // offset from the beginning of a single vertex to this attribute
    );

    // enable attribute for use
    gl.enableVertexAttribArray(positionAttribLocation);

    //
    // main render loop
    //

    // specifiy which program to use
    gl.useProgram(program);
    // draw arrays (draw in triangles, how many vertices to skip, how many vertices to draw)
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}
