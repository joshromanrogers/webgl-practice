var glm = require('gl-matrix');

var vertexShaderText = 
[
// level of quality = medium
'precision mediump float;',
'',
// incoming positions of vertices [inputs]
'attribute vec3 vertPosition;',
'attribute vec2 vertTexCoord;',
// varyings = outputs [to the fragment shader]
'varying vec2 fragTexCoord;',
'uniform mat4 mWorld;',
'uniform mat4 mView;',
'uniform mat4 mProj;',
'',
'void main()',
'{',
'   fragTexCoord = vertTexCoord;',
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
'varying vec2 fragTexCoord;',
// sample image [grabs info from texture 0 as it supplies information from the graphics card]
'uniform sampler2D sampler;',
'',
'void main()',
'{',
// grabs information from texture 2d [sampler] and grabs coordinates from fragTexCoord
'   gl_FragColor = texture2D(sampler, fragTexCoord);',
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

    // only draw on rasterisation if closer to the camera than other element [front of box, not back]
    gl.enable(gl.DEPTH_TEST);

    // only compute visibile faces
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);

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
    let boxVertices = [
      // X, Y, Z           R, G, B
         // Top
		-1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
		-1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
		1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
		1.0, 1.0, -1.0,    0.5, 0.5, 0.5,

		// Left
		-1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
		-1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
		-1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
		-1.0, 1.0, -1.0,   0.75, 0.25, 0.5,

		// Right
		1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
		1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
		1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
		1.0, 1.0, -1.0,   0.25, 0.25, 0.75,

		// Front
		1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
		1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, 1.0, 1.0,    1.0, 0.0, 0.15,

		// Back
		1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
		1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, 1.0, -1.0,    0.0, 1.0, 0.15,

		// Bottom
		-1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
		-1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
		1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
		1.0, -1.0, -1.0,    0.5, 0.5, 1.0,
    ];

    // index list, which sets of vertices form a triangle
    let boxIndices =
	[
		// Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
    ];


    // chunk of memory on the GPU that we're ready to use
    let triangleVertexBufferObject = gl.createBuffer();
    // binding this buffer to be the active buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    // specify data on active buffer (type of buffer we are talking about, vertices to use, 
    // sending information from CPU to GPU memory once)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

    // introduce indices buffer to compliment vertex buffer [order triangles should be drawn]
    let boxIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

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

    let xRotationMatrix = new Float32Array(16);
    let yRotationMatrix = new Float32Array(16);


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
        glm.mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
        glm.mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
        glm.mat4.mul(worldMatrix, xRotationMatrix, yRotationMatrix);

        // update worldMatrix [send to shader]
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

        // clear screen, erase everything from previous frame
        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        
        // draw arrays (draw in triangles, how many vertices to skip, how many vertices to draw)
        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

        // whatever function is on the inside here, call that function whenever the screen is ready to draw
        // a new image (~1/60 s)
        // will not call function if tab looses focus, great for power saving.
        requestAnimationFrame(loop);
        
    };
    requestAnimationFrame(loop);
}
