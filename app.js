var glm = require('gl-matrix');

var vertexShaderText = 
[
// level of quality = medium
'precision mediump float;',
'',
// incoming positions of vertices [inputs]
'attribute vec3 vertPosition;',
'attribute vec3 vertColor;',
// varyings = outputs [to the fragment shader]
'varying vec3 fragColor;',
'uniform mat4 mWorld;',
'uniform mat4 mView;',
'uniform mat4 mProj;',
'',
'void main()',
'{',
'   fragColor = vertColor;',
// transformations happen in reverse order, starting with vec4
// matrix * position
// position * rotating cube in 3d space * camera position * projection matrix
'   gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
'}'
].join('\n');

var fragmentShaderText = 
[
'precision mediump float;',
'',
'varying vec3 fragColor;',
'void main()',
'{',
'   gl_FragColor = vec4(fragColor, 1.0);',
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
      // X, Y, Z           R, G, B
         0.0,  0.5, 0.0,   1.0, 1.0, 0.0,
        -0.5, -0.5, 0.0,   0.7, 0.0, 1.0,
         0.5, -0.5, 0.0,   0.1, 1.0, 0.6
    ];

    // chunk of memory on the GPU that we're ready to use
    let triangleVertexBufferObject = gl.createBuffer();
    // binding this buffer to be the active buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    // specify data on active buffer (type of buffer we are talking about, vertices to use, 
    // sending information from CPU to GPU memory once)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

    // now need to inform the vertex shader that the attribute vertPosition is the triangleVertices pairs

    // get a handle to the attributes (in vertex shader)
    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

    // specify the layout of the attributes
    gl.vertexAttribPointer(
        positionAttribLocation, // Attribute location
        3, // Number of elements per attribute [JUST TAKES THE X+Y VERTICES]
        gl.FLOAT, // type of elements
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
        0, // offset from the beginning of a single vertex to this attribute
    );

    gl.vertexAttribPointer(
        colorAttribLocation, // Attribute location
        3, // Number of elements per attribute
        gl.FLOAT, // type of elements
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
        3 * Float32Array.BYTES_PER_ELEMENT, // SKIPS THE X + Y VERTICES AND JUST USES THE RGBS
    );

    // enable attribute for use
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    // Tell OpenGL state machine which program should be active [specifiy which program to use]
    gl.useProgram(program);

    // get a handle to the uniforms (in vertex shader)
    // [locations in the GPU for the below CPU values]
    let matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
    let matViewUniformLocation = gl.getUniformLocation(program, 'mView');
    let matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

    // set values equal to zero in the CPU
    let worldMatrix = new Float32Array(16);
    let viewMatrix = new Float32Array(16);
    let projMatrix = new Float32Array(16);

    // use gl-matrix library to create an identity matrix
    // identity matrix = a square matrix in which all the elements of the principal diagonal are 
    // ones and all other elements are zeros. The effect of multiplying a given matrix by an 
    // identity matrix is to leave the given matrix unchanged.
    glm.mat4.identity(worldMatrix);
    // lookAt(out, eye, center, up)
    glm.mat4.lookAt(viewMatrix, [0, 0, -5], [0, 0, 0], [0, 1, 0]);
    // perspective(out, fovy, aspect, near, far)
    glm.mat4.perspective(projMatrix, glm.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

    // now send the above matrices over to the shader
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);



    //
    // main render loop (changes the world for whatever gets drawn, for us: rotation)
    //
    // get an indentity matrix
    let identityMatrix = new Float32Array(16);
    glm.mat4.identity(identityMatrix);
    let angle = 0;
    loop = () => {
        // full rotation every 6 seconds
        // performance.now() returned value represents time elapsed since time origin
        angle = performance.now() / 1000 / 6 * 2 * Math.PI;

        // rotate(output, original matrix, angle degrees, axis)
        glm.mat4.rotate(worldMatrix, identityMatrix, angle, [0, 1, 0]);

        // update worldMatrix [send to shader]
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

        // clear screen, erase everything from previous frame
        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        
        // draw arrays (draw in triangles, how many vertices to skip, how many vertices to draw)
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        // whatever function is on the inside here, call that function whenever the screen is ready to draw
        // a new image (~1/60 s)
        // will not call function if tab looses focus, great for power saving.
        requestAnimationFrame(loop);
        
    };
    requestAnimationFrame(loop);
}
