class App {
    constructor(config) {
        this.vs = config.vs;
        this.fs = config.fs;
        this.initSelect(config.preset);
        this.initWebGL(config.screen);
    }
    initSelect(select) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '-';
        select.appendChild(option);
        LIST.forEach((shader) => {
            const option = document.createElement('option');
            option.value = shader;
            option.textContent = shader;
            select.appendChild(option);
        });
        select.addEventListener('change', () => {
            const shader = select.selectedOptions[0].value || '';
            const vsc = this.getShader(shader + '_vs');
            const fsc = this.getShader(shader + '_fs');
            this.vs.value = vsc;
            this.fs.value = fsc;
        }, false);
    }
    initWebGL(canvas) {
        this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    }
    getShader(name) {
        const script = document.getElementById(name);
        if (!script) {
            return '';
        }
        return script.text;
    }
    createShader(type, code) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, code);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            alert(this.gl.getShaderInfoLog(shader));
        }
        return shader;
    }
    createVertexShader(shader) {
        return this.createShader(this.gl.VERTEX_SHADER, shader);
    }
    createFragmentShader(shader) {
        return this.createShader(this.gl.FRAGMENT_SHADER, shader);
    }
    createProgram(vs, fs) {
        const program = this.gl.createProgram();
        if (!program) {
            return program;
        }
        this.gl.attachShader(program, vs);
        this.gl.attachShader(program, fs);
        this.gl.linkProgram(program);
        if (this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            this.gl.useProgram(program);
        }
        else {
            alert(this.gl.getProgramInfoLog(program));
        }
        return program;
    }
    setShader() {
        const vs = this.createVertexShader(this.vs.value);
        const fs = this.createFragmentShader(this.fs.value);
        const program = this.createProgram(vs, fs);
        const attLocation = [];
        attLocation.push(this.gl.getAttribLocation(program, 'position'));
        const attStride = [3, 4, 2];
        const vbo = [];
        vbo.push(this.createVbo(new Float32Array([-1, 1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0])));
        const index = [0, 1, 2, 3, 2, 1];
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo[0]);
        this.gl.enableVertexAttribArray(attLocation[0]);
        this.gl.vertexAttribPointer(attLocation[0], attStride[0], this.gl.FLOAT, false, 0, 0);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.createIbo(new Int16Array(index)));
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    }
    createVbo(data, dynamic = false) {
        const vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data, dynamic ? this.gl.DYNAMIC_DRAW : this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        return vbo;
    }
    createIbo(data) {
        const ibo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        return ibo;
    }
    draw() {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clearDepth(1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
        this.gl.flush();
    }
}
function Init() {
    const app = new App({
        screen: document.getElementById('screen'),
        preset: document.getElementById('preset'),
        vs: document.getElementById('vs'),
        fs: document.getElementById('fs'),
    });
    document.getElementById('run').addEventListener('click', () => {
        if (document.body.classList.contains('running')) {
        }
        else {
            app.setShader();
            app.draw();
        }
        document.body.classList.toggle('running');
    }, false);
    document.getElementById('option').addEventListener('click', () => {
        document.body.classList.toggle('open');
    }, false);
}
window.addEventListener('DOMContentLoaded', Init);
