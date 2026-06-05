const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2', { alpha: true, antialias: true });

if (!gl) {
    console.error('WebGL2 not supported');
}

// Vertex Shader
const vertexShaderSource = `#version 300 es
    in vec3 position;
    in vec3 normal;
    in vec2 uv;
    
    uniform mat4 uProjection;
    uniform mat4 uView;
    uniform mat4 uModel;
    uniform mat4 uNormalMatrix;
    
    out vec3 vNormal;
    out vec2 vUv;
    out vec3 vFragPos;
    
    void main() {
        vFragPos = vec3(uModel * vec4(position, 1.0));
        vNormal = normalize(vec3(uNormalMatrix * vec4(normal, 1.0)));
        vUv = uv;
        gl_Position = uProjection * uView * uModel * vec4(position, 1.0);
    }
`;

// Fragment Shader
const fragmentShaderSource = `#version 300 es
    precision highp float;
    
    in vec3 vNormal;
    in vec2 vUv;
    in vec3 vFragPos;
    
    uniform sampler2D uTexture;
    uniform vec3 uAmbientLight;
    uniform vec3 uDirectionalLight;
    uniform vec3 uDirectionalLightDir;
    
    out vec4 outColor;
    
    void main() {
        vec4 texColor = texture(uTexture, vUv);
        
        // Ambient
        vec3 ambient = uAmbientLight * texColor.rgb;
        
        // Directional
        float diff = max(dot(normalize(vNormal), normalize(uDirectionalLightDir)), 0.0);
        vec3 directional = uDirectionalLight * diff * texColor.rgb;
        
        vec3 result = ambient + directional;
        outColor = vec4(result, texColor.a);
    }
`;

function compileShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    
    return shader;
}

function createProgram(vertexSource, fragmentSource) {
    const vertexShader = compileShader(vertexSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentSource, gl.FRAGMENT_SHADER);
    
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return null;
    }
    
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    
    return program;
}

const program = createProgram(vertexShaderSource, fragmentShaderSource);

// Cube geometry
function createCubeGeometry() {
    const size = 0.75;
    const positions = [
        // Front
        -size, -size, size,
        size, -size, size,
        size, size, size,
        -size, size, size,
        // Back
        -size, -size, -size,
        -size, size, -size,
        size, size, -size,
        size, -size, -size,
        // Top
        -size, size, -size,
        -size, size, size,
        size, size, size,
        size, size, -size,
        // Bottom
        -size, -size, -size,
        size, -size, -size,
        size, -size, size,
        -size, -size, size,
        // Right
        size, -size, -size,
        size, size, -size,
        size, size, size,
        size, -size, size,
        // Left
        -size, -size, -size,
        -size, -size, size,
        -size, size, size,
        -size, size, -size,
    ];
    
    const normals = [
        // Front
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
        // Back
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
        // Top
        0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
        // Bottom
        0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
        // Right
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        // Left
        -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
    ];
    
    const uvs = [
        0, 0, 1, 0, 1, 1, 0, 1,
        0, 0, 1, 0, 1, 1, 0, 1,
        0, 0, 1, 0, 1, 1, 0, 1,
        0, 0, 1, 0, 1, 1, 0, 1,
        0, 0, 1, 0, 1, 1, 0, 1,
        0, 0, 1, 0, 1, 1, 0, 1,
    ];
    
    const indices = [
        0, 1, 2, 0, 2, 3,
        4, 5, 6, 4, 6, 7,
        8, 9, 10, 8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23,
    ];
    
    return { positions, normals, uvs, indices };
}

const cubeData = createCubeGeometry();

// Create VAO and buffers
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeData.positions), gl.STATIC_DRAW);
const positionLocation = gl.getAttribLocation(program, 'position');
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

const normalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeData.normals), gl.STATIC_DRAW);
const normalLocation = gl.getAttribLocation(program, 'normal');
gl.enableVertexAttribArray(normalLocation);
gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

const uvBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeData.uvs), gl.STATIC_DRAW);
const uvLocation = gl.getAttribLocation(program, 'uv');
gl.enableVertexAttribArray(uvLocation);
gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeData.indices), gl.STATIC_DRAW);

gl.bindVertexArray(null);

// Load texture
let texture = null;
const textureImage = new Image();
textureImage.onload = () => {
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);
};
textureImage.src = 'images/brick.jpg';

// Math utilities
function mat4Identity() {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
}

function mat4Multiply(a, b) {
    const result = new Float32Array(16);
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            result[i * 4 + j] = 0;
            for (let k = 0; k < 4; k++) {
                result[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
            }
        }
    }
    return result;
}

function mat4Translate(m, x, y, z) {
    const result = m.slice();
    result[12] += x;
    result[13] += y;
    result[14] += z;
    return result;
}

function mat4RotateX(m, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rotation = [
        1, 0, 0, 0,
        0, cos, -sin, 0,
        0, sin, cos, 0,
        0, 0, 0, 1
    ];
    return mat4Multiply(m, rotation);
}

function mat4RotateY(m, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rotation = [
        cos, 0, sin, 0,
        0, 1, 0, 0,
        -sin, 0, cos, 0,
        0, 0, 0, 1
    ];
    return mat4Multiply(m, rotation);
}

function mat4Perspective(fov, aspect, near, far) {
    const f = 1.0 / Math.tan(fov / 2);
    const nf = 1 / (near - far);
    return [
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) * nf, -1,
        0, 0, 2 * far * near * nf, 0
    ];
}

function mat4Inverse(m) {
    const result = new Float32Array(16);
    const inv = new Float32Array(16);
    
    inv[0] = m[5] * m[10] * m[15] - m[5] * m[11] * m[14] - m[9] * m[6] * m[15] + m[9] * m[7] * m[14] + m[13] * m[6] * m[11] - m[13] * m[7] * m[10];
    inv[4] = -m[4] * m[10] * m[15] + m[4] * m[11] * m[14] + m[8] * m[6] * m[15] - m[8] * m[7] * m[14] - m[12] * m[6] * m[11] + m[12] * m[7] * m[10];
    inv[8] = m[4] * m[9] * m[15] - m[4] * m[11] * m[13] - m[8] * m[5] * m[15] + m[8] * m[7] * m[13] + m[12] * m[5] * m[11] - m[12] * m[7] * m[9];
    inv[12] = -m[4] * m[9] * m[14] + m[4] * m[10] * m[13] + m[8] * m[5] * m[14] - m[8] * m[6] * m[13] - m[12] * m[5] * m[10] + m[12] * m[6] * m[9];
    
    inv[1] = -m[1] * m[10] * m[15] + m[1] * m[11] * m[14] + m[9] * m[2] * m[15] - m[9] * m[3] * m[14] - m[13] * m[2] * m[11] + m[13] * m[3] * m[10];
    inv[5] = m[0] * m[10] * m[15] - m[0] * m[11] * m[14] - m[8] * m[2] * m[15] + m[8] * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10];
    inv[9] = -m[0] * m[9] * m[15] + m[0] * m[11] * m[13] + m[8] * m[1] * m[15] - m[8] * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[9];
    inv[13] = m[0] * m[9] * m[14] - m[0] * m[10] * m[13] - m[8] * m[1] * m[14] + m[8] * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[9];
    
    inv[2] = m[1] * m[6] * m[15] - m[1] * m[7] * m[14] - m[5] * m[2] * m[15] + m[5] * m[3] * m[14] + m[13] * m[2] * m[7] - m[13] * m[3] * m[6];
    inv[6] = -m[0] * m[6] * m[15] + m[0] * m[7] * m[14] + m[4] * m[2] * m[15] - m[4] * m[3] * m[14] - m[12] * m[2] * m[7] + m[12] * m[3] * m[6];
    inv[10] = m[0] * m[5] * m[15] - m[0] * m[7] * m[13] - m[4] * m[1] * m[15] + m[4] * m[3] * m[13] + m[12] * m[1] * m[7] - m[12] * m[3] * m[5];
    inv[14] = -m[0] * m[5] * m[14] + m[0] * m[6] * m[13] + m[4] * m[1] * m[14] - m[4] * m[2] * m[13] - m[12] * m[1] * m[6] + m[12] * m[2] * m[5];
    
    inv[3] = -m[1] * m[6] * m[11] + m[1] * m[7] * m[10] + m[5] * m[2] * m[11] - m[5] * m[3] * m[10] - m[9] * m[2] * m[7] + m[9] * m[3] * m[6];
    inv[7] = m[0] * m[6] * m[11] - m[0] * m[7] * m[10] - m[4] * m[2] * m[11] + m[4] * m[3] * m[10] + m[8] * m[2] * m[7] - m[8] * m[3] * m[6];
    inv[11] = -m[0] * m[5] * m[11] + m[0] * m[7] * m[9] + m[4] * m[1] * m[11] - m[4] * m[3] * m[9] - m[8] * m[1] * m[7] + m[8] * m[3] * m[5];
    inv[15] = m[0] * m[5] * m[10] - m[0] * m[6] * m[9] - m[4] * m[1] * m[10] + m[4] * m[2] * m[9] + m[8] * m[1] * m[6] - m[8] * m[2] * m[5];
    
    let det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];
    
    if (det === 0) return m;
    
    det = 1 / det;
    for (let i = 0; i < 16; i++) result[i] = inv[i] * det;
    return result;
}

function mat4Transpose(m) {
    return [
        m[0], m[4], m[8], m[12],
        m[1], m[5], m[9], m[13],
        m[2], m[6], m[10], m[14],
        m[3], m[7], m[11], m[15]
    ];
}

let rotationX = 0;
let rotationY = 0;

function resizeCanvas() {
    const width = canvas.clientWidth || canvas.parentElement.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || Math.round(width * 9 / 16);

    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
}

resizeCanvas();

function render() {
    requestAnimationFrame(render);
    
    if (!texture) return;
    
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    
    rotationX += 0.01;
    rotationY += 0.01;
    
    const width = canvas.width;
    const height = canvas.height;
    
    const projectionMatrix = mat4Perspective(Math.PI / 4, width / height, 0.1, 1000);
    const viewMatrix = mat4Translate(mat4Identity(), 0, 0, -3);
    
    let modelMatrix = mat4Identity();
    modelMatrix = mat4RotateX(modelMatrix, rotationX);
    modelMatrix = mat4RotateY(modelMatrix, rotationY);
    modelMatrix = mat4Translate(modelMatrix, 0, 0, 0);
    
    const normalMatrix = mat4Inverse(modelMatrix);
    const normalMatrixTransposed = mat4Transpose(normalMatrix);
    
    const projectionLoc = gl.getUniformLocation(program, 'uProjection');
    const viewLoc = gl.getUniformLocation(program, 'uView');
    const modelLoc = gl.getUniformLocation(program, 'uModel');
    const normalMatrixLoc = gl.getUniformLocation(program, 'uNormalMatrix');
    const textureLoc = gl.getUniformLocation(program, 'uTexture');
    const ambientLightLoc = gl.getUniformLocation(program, 'uAmbientLight');
    const directionalLightLoc = gl.getUniformLocation(program, 'uDirectionalLight');
    const directionalLightDirLoc = gl.getUniformLocation(program, 'uDirectionalLightDir');
    
    gl.uniformMatrix4fv(projectionLoc, false, projectionMatrix);
    gl.uniformMatrix4fv(viewLoc, false, viewMatrix);
    gl.uniformMatrix4fv(modelLoc, false, modelMatrix);
    gl.uniformMatrix4fv(normalMatrixLoc, false, normalMatrixTransposed);
    
    gl.uniform1i(textureLoc, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    gl.uniform3f(ambientLightLoc, 0.6, 0.6, 0.6);
    gl.uniform3f(directionalLightLoc, 0.8, 0.8, 0.8);
    gl.uniform3f(directionalLightDirLoc, 5, 5, 5);
    
    gl.drawElements(gl.TRIANGLES, cubeData.indices.length, gl.UNSIGNED_SHORT, 0);
    
    gl.bindVertexArray(null);
}

render();

window.addEventListener('resize', resizeCanvas);