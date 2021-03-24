var VSHADER_SOURCE = `
        attribute vec4 a_Position;
        attribute vec4 a_Color;
        varying vec4 v_Color;
        uniform mat4 u_modelMatrix;
        void main(){
            gl_Position = u_modelMatrix * a_Position;
            v_Color = a_Color;
        }    
    `;

var FSHADER_SOURCE = `
        precision mediump float;
        varying vec4 v_Color;
        void main(){
            gl_FragColor = v_Color;
        }
    `;

var hatFlag = 0;
var starFlag = 0;

function createProgram(gl, vertexShader, fragmentShader){
    //create the program and attach the shaders
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    //if success, return the program. if not, log the program info, and delete it.
    if(gl.getProgramParameter(program, gl.LINK_STATUS)){
        return program;
    }
    alert(gl.getProgramInfoLog(program) + "");
    gl.deleteProgram(program);
}

function compileShader(gl, vShaderText, fShaderText){
    //////Build vertex and fragment shader objects
    var vertexShader = gl.createShader(gl.VERTEX_SHADER)
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    //The way to  set up shader text source
    gl.shaderSource(vertexShader, vShaderText)
    gl.shaderSource(fragmentShader, fShaderText)
    //compile vertex shader
    gl.compileShader(vertexShader)
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        console.log('vertex shader ereror');
        var message = gl.getShaderInfoLog(vertexShader); 
        console.log(message);//print shader compiling error message
    }
    //compile fragment shader
    gl.compileShader(fragmentShader)
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        console.log('fragment shader ereror');
        var message = gl.getShaderInfoLog(fragmentShader);
        console.log(message);//print shader compiling error message
    }

    /////link shader to program (by a self-define function)
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    //if not success, log the program info, and delete it.
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        alert(gl.getProgramInfoLog(program) + "");
        gl.deleteProgram(program);
    }

    return program;
}

function initArrayBuffer( gl, data, num, type, attribute){
    var buffer = gl.createBuffer();
    if(!buffer){
        console.log("failed to create the buffere object");
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    var a_attribute = gl.getAttribLocation(gl.getParameter(gl.CURRENT_PROGRAM), attribute);

    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);

    return true;
}

var transformMat = new Matrix4();
var matStack = [];
var u_modelMatrix;
function pushMatrix(){
    matStack.push(new Matrix4(transformMat));
}
function popMatrix(){
    transformMat = matStack.pop();
}
//variables for tx, red,green and yellow arms angle 
var tx = 0;
var ty = 0;
var rightHandAngle = 0;
var leftHandAngle = 0;
var eyesTranslate = 0;
var footsTranslate = 0;
var _scale = 0;
var hatTop = 0;
var starAngle = 0;
var rightstickAngle = 0;
var leftstickAngle = 0;

function main(){
    //////Get the canvas context
    var canvas = document.getElementById('webgl');
    var gl = canvas.getContext('webgl2');
    if(!gl){
        console.log('Failed to get the rendering context for WebGL');
        return ;
    }

    program = compileShader(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    redraw(gl); //call redarw here to show the initial image

    //setup the call back function of tx Sliders
    var txSlider = document.getElementById("Translate-X");
    txSlider.oninput = function() {
        tx = this.value / 100; //convert sliders value to -1 to +1
        redraw(gl);
    }

    //setup the call back function of ty Sliders
    var tySlider = document.getElementById("Translate-Y");
    tySlider.oninput = function() {
        ty = this.value / 100; //convert sliders value to -1 to +1
        redraw(gl);
    }

    //setup the call back function of right arm rotation Sliders
    var jointRighthand = document.getElementById("jointRighthand");
    jointRighthand.oninput = function() {
        rightHandAngle = this.value;
        redraw(gl);
    }

    //setup the call back function of left arm rotation Sliders
    var jointLefthand = document.getElementById("jointLefthand");
    jointLefthand.oninput = function() {
        leftHandAngle = this.value;
        redraw(gl);
    }

    //setup the call back function of eyes translate Sliders
    var jointEyes = document.getElementById("jointEyes");
    jointEyes.oninput = function() {
        eyesTranslate = this.value / 1000;
        redraw(gl);
    }

    //setup the call back function of foots translate Sliders
    var jointFoots = document.getElementById("jointFoots");
    jointFoots.oninput = function() {
        footsTranslate = this.value / 1000;
        redraw(gl);
    }

    //setup the call back function of scale Sliders
    var _Scale = document.getElementById("Scale");
    _Scale.oninput = function() {
        _scale = this.value / 100;
        redraw(gl);
    }

    //setup the call back function of hat top Sliders
    var jointHat = document.getElementById("jointHat");
    jointHat.oninput = function() {
        hatTop = this.value / 200;
        redraw(gl);
    }

    //setup the call back function of right stick Sliders
    var jointRightStick = document.getElementById("jointRightStick");
    jointRightStick.oninput = function() {
        rightstickAngle = this.value;
        redraw(gl);
    }
    //setup the call back function of left stick Sliders
    var jointLeftStick = document.getElementById("jointLeftStick");
    jointLeftStick.oninput = function() {
        leftstickAngle = this.value;
        redraw(gl);
    }

    //setup the call back function of star Sliders
    var jointStar = document.getElementById("jointStar");
    jointStar.oninput = function() {
        starAngle = this.value;
        redraw(gl);
    }

    document.onkeydown = function(ev){keydown(ev)};
    redraw(gl);
}

function keydown(ev){
    if(ev.key == 'h'){
        hatFlag += 1;
    }
    else if(ev.key == 's'){
        starFlag += 1;
    }
}

//Call this funtion when we have to update the screen (eg. user input happens)
//double PI = 3.14159265358;
function redraw(gl)
{
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    u_modelMatrix = gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM), 'u_modelMatrix');
    
    RectVertices = [-0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5];
    var BodyColor = [   0.4+rightHandAngle/360, 1.0, 0.4+leftHandAngle/360,
                        0.4+rightHandAngle/360, 1.0, 0.4+leftHandAngle/360,
                        0.4+rightHandAngle/360, 1.0, 0.4+leftHandAngle/360,
                        0.4+rightHandAngle/360, 1.0, 0.4+leftHandAngle/360 ];
    var StickColor = [  0.5, 0.15, 0.15,
                        0.5, 0.15, 0.15,
                        0.5, 0.15, 0.15, 
                        0.5, 0.15, 0.15 ]
    var CircleVertices = [];
    var CircleColor_g = [];
    var CircleColor_black = [];
    var CircleColor_brown = [];
    var CircleColor_y = [];
    for( i = 0.0; i < 180.0; i+=1.0 ){
        CircleVertices.push( Math.cos( 3.14159265358/180*i ) );
        CircleVertices.push( Math.sin( 3.14159265358/180*i ) );
        CircleVertices.push( 0 );
        CircleVertices.push( 0 );
        CircleVertices.push( Math.cos( 3.14159265358/180*(i+1) ) );
        CircleVertices.push( Math.sin( 3.14159265358/180*(i+1) ) );
        for(j = 0; j < 3; j++){
                CircleColor_g.push(0.4+rightHandAngle/360);
                CircleColor_g.push(1.0);
                CircleColor_g.push(0.4+leftHandAngle/360);
                CircleColor_black.push(0.0);
                CircleColor_black.push(0.0);
                CircleColor_black.push(0.0);
                CircleColor_brown.push(0.5);
                CircleColor_brown.push(0.15);
                CircleColor_brown.push(0.15);
                CircleColor_y.push(1.0);
                CircleColor_y.push(1.0);
                CircleColor_y.push(0.0);
        }
    }
    var HatVertices = [hatTop, 0.5, -0.5, -0.5, 0.5, -0.5];
    var HatColor = [1.0, 0.0, 0.0, 1.0, 0.8, 0.8, 1.0, 0.8, 0.8];
    var StarVertices = [0.0, 0.577, -0.5, -0.289, 0.5, -0.289];
    var rightStarColor = [1.0, 1.0-rightstickAngle/90, 0.4+starAngle/360, 1.0, 1.0-rightstickAngle/90, 0.4+starAngle/360, 1.0, 1.0-rightstickAngle/90, 0.4+starAngle/360];
    var leftStarColor = [1.0, 1.0-leftstickAngle/90, 0.4+starAngle/360, 1.0, 1.0-leftstickAngle/90, 0.4+starAngle/360, 1.0, 1.0-leftstickAngle/90, 0.4+starAngle/360];
     
    /////////////////////draw Body/////////////////////
    //rect
    buffer0 = initArrayBuffer(gl, new Float32Array(RectVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(BodyColor), 3, gl.FLOAT, 'a_Color');
    transformMat.setIdentity();
    transformMat.scale( 1+_scale, 1+_scale, 0.0);
    transformMat.translate(0.0+tx, -0.1+ty, 0.0);
    pushMatrix();
    transformMat.scale(0.5, 0.3, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, RectVertices.length/2);
    //small_rect
    popMatrix();
    buffer1 = initArrayBuffer(gl, new Float32Array(BodyColor), 3, gl.FLOAT, 'a_Color');
    transformMat.translate(0.0, -0.2, 0.0);
    pushMatrix();
    transformMat.scale(0.3, 0.1, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, RectVertices.length/2);
    //circle*2
    popMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(CircleVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(CircleColor_g), 3, gl.FLOAT, 'a_Color');
    transformMat.translate(0.0, 0.05, 0.0);
    transformMat.rotate(180, 0.0, 0.0, 1.0);
    transformMat.translate(-0.15, 0.0, 0.0);
    pushMatrix();
    transformMat.scale(0.1, 0.1, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLES, 0, CircleVertices.length/2);
    popMatrix();
    transformMat.translate(0.3, 0.0, 0.0);
    pushMatrix();
    transformMat.scale(0.1, 0.1, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLES, 0, CircleVertices.length/2);
    
    
    /////////////////////draw head/////////////////////
    //draw half_circle
    popMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(CircleVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(CircleColor_g), 3, gl.FLOAT, 'a_Color');
    transformMat.rotate(180, 0.0, 0.0, 1.0);
    transformMat.translate(0.15, 0.32, 0.0);
    pushMatrix();
    transformMat.scale(0.25, 0.25, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLES, 0, CircleVertices.length/2);
    //hat
    if(hatFlag %2 == 1){
        popMatrix();
        buffer0 = initArrayBuffer(gl, new Float32Array(HatVertices), 2, gl.FLOAT, 'a_Position');
        buffer1 = initArrayBuffer(gl, new Float32Array(HatColor), 3, gl.FLOAT, 'a_Color');
        transformMat.translate(0.0, 0.37, 0.0);
        pushMatrix();
        transformMat.scale(0.2, 0.3, 0.0);
        gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
        gl.drawArrays(gl.TRIANGLES, 0, HatVertices.length/2);
        popMatrix();
        buffer0 = initArrayBuffer(gl, new Float32Array(CircleVertices), 2, gl.FLOAT, 'a_Position');
        buffer1 = initArrayBuffer(gl, new Float32Array(CircleColor_y), 3, gl.FLOAT, 'a_Color');
        transformMat.translate(0.0+ hatTop/5 ,0.15, 0.0);
        pushMatrix();
        transformMat.scale(0.03, 0.03, 0.0);
        gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
        gl.drawArrays(gl.TRIANGLES, 0, CircleVertices.length/2);
        popMatrix();
        pushMatrix();
        transformMat.rotate(180, 0.0, 0.0, 1.0);
        transformMat.scale(0.03, 0.03, 0.0);
        gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
        gl.drawArrays(gl.TRIANGLES, 0, CircleVertices.length/2);
    }
    //left_eyes
    popMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(CircleVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(CircleColor_black), 3, gl.FLOAT, 'a_Color');
    transformMat.setIdentity();
    transformMat.scale( 1+_scale, 1+_scale, 0.0);
    transformMat.translate(0.12+tx+eyesTranslate, 0.18+ty, 0.0);
    pushMatrix();
    transformMat.scale(0.025, 0.025, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLES, 0, CircleVertices.length/2);
    popMatrix();
    transformMat.rotate(180, 0.0, 0.0, 1.0);
    pushMatrix();
    transformMat.scale(0.025, 0.025, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLES, 0, CircleVertices.length/2);
    //right_eyes
    popMatrix();
    transformMat.translate(0.24, 0.0, 0.0);
    pushMatrix();
    transformMat.scale(0.025, 0.025, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLES, 0, CircleVertices.length/2);
    popMatrix();
    transformMat.rotate(180, 0.0, 0.0, 1.0);
    pushMatrix();
    transformMat.scale(0.025, 0.025, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLES, 0, CircleVertices.length/2);
    //left_antenna
    popMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(RectVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(BodyColor), 3, gl.FLOAT, 'a_Color');
    transformMat.setIdentity();
    transformMat.scale( 1+_scale, 1+_scale, 0.0);
    transformMat.translate(0.12+tx, 0.3+ty, 0.0);
    transformMat.rotate(60, 0.0, 0.0, 1.0);
    pushMatrix();
    transformMat.scale(0.15, 0.02, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, RectVertices.length/2);
    popMatrix();//helf_circle
    buffer0 = initArrayBuffer(gl, new Float32Array(CircleVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(CircleColor_g), 3, gl.FLOAT, 'a_Color');
    transformMat.translate(0.07, 0.0, 0.0);
    transformMat.rotate(-90, 0.0, 0.0, 1.0);
    pushMatrix();
    transformMat.scale(0.01, 0.01, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLES, 0, CircleVertices.length/2);
    //right_antenna
    popMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(RectVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(BodyColor), 3, gl.FLOAT, 'a_Color');
    transformMat.setIdentity();
    transformMat.scale( 1+_scale, 1+_scale, 0.0);
    transformMat.translate(-0.12+tx, 0.3+ty, 0.0);
    transformMat.rotate(120, 0.0, 0.0, 1.0);
    pushMatrix();
    transformMat.scale(0.15, 0.02, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, RectVertices.length/2);
    popMatrix();//helf_circle
    buffer0 = initArrayBuffer(gl, new Float32Array(CircleVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(CircleColor_g), 3, gl.FLOAT, 'a_Color');
    transformMat.translate(0.07, 0.0, 0.0);
    transformMat.rotate(-90, 0.0, 0.0, 1.0);
    pushMatrix();
    transformMat.scale(0.01, 0.01, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLES, 0, CircleVertices.length/2);
    
    
    /////////////////////draw righthand/////////////////////
    //circle*2
    popMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(CircleVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(CircleColor_g), 3, gl.FLOAT, 'a_Color');
    transformMat.setIdentity();
    transformMat.scale( 1+_scale, 1+_scale, 0.0);
    transformMat.translate(-0.33+tx, 0.0+ty, 0.0);
    transformMat.rotate(-rightHandAngle, 0.0, 0.0, 1.0);
    pushMatrix();
    transformMat.scale(0.05, 0.05, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLES, 0, CircleVertices.length/2);
    popMatrix();
    transformMat.translate(0.0, -0.24, 0.0);
    transformMat.rotate(180, 0.0, 0.0, 1.0);
    pushMatrix();
    transformMat.scale(0.05, 0.05, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLES, 0, CircleVertices.length/2);
    //rect
    popMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(RectVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(BodyColor), 3, gl.FLOAT, 'a_Color');
    transformMat.translate(0.0, -0.12, 0.0);
    pushMatrix();
    transformMat.rotate(90, 0.0, 0.0, 1.0);
    transformMat.scale(0.25, 0.1, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, RectVertices.length/2);
    if(starFlag %4 == 1 || starFlag %4 == 3){
        //stick
        popMatrix();
        buffer0 = initArrayBuffer(gl, new Float32Array(CircleVertices), 2, gl.FLOAT, 'a_Position');
        buffer1 = initArrayBuffer(gl, new Float32Array(CircleColor_brown), 3, gl.FLOAT, 'a_Color');
        transformMat.translate(0.0, 0.15, 0.0);
        transformMat.rotate( 180-rightstickAngle, 0.0, 0.0, 1.0);
        pushMatrix();
        transformMat.scale(0.01, 0.01, 0.0);
        gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
        gl.drawArrays(gl.TRIANGLES, 0, CircleVertices.length/2);
        popMatrix();
        buffer0 = initArrayBuffer(gl, new Float32Array(RectVertices), 2, gl.FLOAT, 'a_Position');
        buffer1 = initArrayBuffer(gl, new Float32Array(StickColor), 3, gl.FLOAT, 'a_Color');
        transformMat.translate(0.0, -0.15, 0.0);
        transformMat.rotate( 90, 0.0, 0.0, 1.0);
        pushMatrix();
        transformMat.scale(0.3, 0.02, 0.0);
        gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, RectVertices.length/2);
        //star
        popMatrix();
        buffer0 = initArrayBuffer(gl, new Float32Array(StarVertices), 2, gl.FLOAT, 'a_Position');
        buffer1 = initArrayBuffer(gl, new Float32Array(rightStarColor), 3, gl.FLOAT, 'a_Color');
        transformMat.translate(-0.15, 0.00, 0.0);
        transformMat.rotate(starAngle, 0.0, 0.0, 1.0);
        pushMatrix();
        transformMat.scale(0.15, 0.15, 0.0);
        gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
        gl.drawArrays(gl.TRIANGLES, 0, StarVertices.length/2);
        popMatrix();
        transformMat.rotate(180, 0.0, 0.0, 1.0);
        pushMatrix();
        transformMat.scale(0.15, 0.15, 0.0);
        gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
        gl.drawArrays(gl.TRIANGLES, 0, StarVertices.length/2);
    }

    /////////////////////draw lefthand/////////////////////
    //circle*2
    popMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(CircleVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(CircleColor_g), 3, gl.FLOAT, 'a_Color');
    transformMat.setIdentity();
    transformMat.scale( 1+_scale, 1+_scale, 0.0);
    transformMat.translate(0.33+tx, 0.0+ty, 0.0);
    transformMat.rotate(leftHandAngle, 0.0, 0.0, 1.0);
    pushMatrix();
    transformMat.scale(0.05, 0.05, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLES, 0, CircleVertices.length/2);
    popMatrix();
    transformMat.translate(0.0, -0.24, 0.0);
    transformMat.rotate(180, 0.0, 0.0, 1.0);
    pushMatrix();
    transformMat.scale(0.05, 0.05, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLES, 0, CircleVertices.length/2);
    //rect
    popMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(RectVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(BodyColor), 3, gl.FLOAT, 'a_Color');
    transformMat.translate(0.0, -0.12, 0.0);
    pushMatrix();
    transformMat.rotate(90, 0.0, 0.0, 1.0);
    transformMat.scale(0.25, 0.1, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, RectVertices.length/2);
    if(starFlag %4 >= 2){
        //stick
        popMatrix();
        buffer0 = initArrayBuffer(gl, new Float32Array(CircleVertices), 2, gl.FLOAT, 'a_Position');
        buffer1 = initArrayBuffer(gl, new Float32Array(CircleColor_brown), 3, gl.FLOAT, 'a_Color');
        transformMat.translate(0.0, 0.15, 0.0);
        transformMat.rotate( 180, 0.0, 0.0, 1.0);
        transformMat.rotate( leftstickAngle, 0.0, 0.0, 1.0);
        pushMatrix();
        transformMat.scale(0.01, 0.01, 0.0);
        gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
        gl.drawArrays(gl.TRIANGLES, 0, CircleVertices.length/2);
        popMatrix();
        buffer0 = initArrayBuffer(gl, new Float32Array(RectVertices), 2, gl.FLOAT, 'a_Position');
        buffer1 = initArrayBuffer(gl, new Float32Array(StickColor), 3, gl.FLOAT, 'a_Color');
        transformMat.translate(0.0, -0.15, 0.0);
        transformMat.rotate( 90, 0.0, 0.0, 1.0);
        pushMatrix();
        transformMat.scale(0.3, 0.02, 0.0);
        gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, RectVertices.length/2);
        //star
        popMatrix();
        buffer0 = initArrayBuffer(gl, new Float32Array(StarVertices), 2, gl.FLOAT, 'a_Position');
        buffer1 = initArrayBuffer(gl, new Float32Array(leftStarColor), 3, gl.FLOAT, 'a_Color');
        transformMat.translate(-0.15, 0.00, 0.0);
        transformMat.rotate(starAngle, 0.0, 0.0, 1.0);
        pushMatrix();
        transformMat.scale(0.15, 0.15, 0.0);
        gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
        gl.drawArrays(gl.TRIANGLES, 0, StarVertices.length/2);
        popMatrix();
        transformMat.rotate(180, 0.0, 0.0, 1.0);
        pushMatrix();
        transformMat.scale(0.15, 0.15, 0.0);
        gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
        gl.drawArrays(gl.TRIANGLES, 0, StarVertices.length/2);
    }
    
    /////////////////////draw rightfoot/////////////////////
    //rect
    popMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(RectVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(BodyColor), 3, gl.FLOAT, 'a_Color');
    transformMat.setIdentity();
    transformMat.scale( 1+_scale, 1+_scale, 0.0);
    transformMat.translate(-0.09+tx, -0.37+ty+footsTranslate, 0.0);
    pushMatrix();
    transformMat.rotate(90, 0.0, 0.0, 1.0);
    transformMat.scale(0.2, 0.1, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, RectVertices.length/2);
    //circle
    popMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(CircleVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(CircleColor_g), 3, gl.FLOAT, 'a_Color');
    transformMat.translate(0.0, -0.1, 0.0);
    pushMatrix();
    transformMat.rotate(180, 0.0, 0.0, 1.0);
    transformMat.scale(0.05, 0.05, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLES, 0, CircleVertices.length/2);

    /////////////////////draw leftfoot/////////////////////
    //rect
    popMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(RectVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(BodyColor), 3, gl.FLOAT, 'a_Color');
    transformMat.translate(0.18, 0.1, 0.0);
    pushMatrix();
    transformMat.rotate(90, 0.0, 0.0, 1.0);
    transformMat.scale(0.2, 0.1, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, RectVertices.length/2);
    //circle
    popMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(CircleVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(CircleColor_g), 3, gl.FLOAT, 'a_Color');
    transformMat.translate(0.0, -0.1, 0.0);
    transformMat.rotate(180, 0.0, 0.0, 1.0);
    //pushMatrix();
    transformMat.scale(0.05, 0.05, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLES, 0, CircleVertices.length/2);
    
}
