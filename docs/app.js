class App {
    constructor(config) {
        this.screen = config.screen;
        this.log = config.log;
        this.option = config.option;
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
            this.log.add(this.gl.getShaderInfoLog(shader) || '');
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
            this.log.add(this.gl.getProgramInfoLog(program) || '');
        }
        return program;
    }
    setShader() {
        this.log.clear();
        this.screen.width = parseInt(this.option.width.value);
        this.screen.height = parseInt(this.option.height.value);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
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
        this.uniLocation = [];
        this.uniLocation.push(this.gl.getUniformLocation(program, 'frame'));
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
    draw(frame) {
        this.gl.uniform1f(this.uniLocation[0], frame);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clearDepth(1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
        this.gl.flush();
    }
}
class CodeEditor extends HTMLElement {
    static init(tagname = 'code-editor') {
        customElements.define(tagname, CodeEditor);
    }
    constructor() {
        super();
        this.contents = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = 'textarea{display:block;width:100%;height:100%;box-sizing:border-box;}';
        this.textarea = document.createElement('textarea');
        this.contents.appendChild(style);
        this.contents.appendChild(this.textarea);
    }
    get value() { return this.textarea.value; }
    set value(value) { this.textarea.value = value; }
}
class LogArea extends HTMLElement {
    static init(tagname = 'log-area') {
        customElements.define(tagname, LogArea);
    }
    constructor() {
        super();
        this.contents = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = 'textarea{display:block;width:100%;height:100%;box-sizing:border-box;}';
        this.textarea = document.createElement('textarea');
        this.contents.appendChild(style);
        this.contents.appendChild(this.textarea);
        if (this.hasAttribute('max')) {
            const max = parseInt(this.getAttribute('max') || '');
            if (Number.isNaN(max) || max <= 0) {
                this.setAttribute('max', '10');
            }
        }
        else {
            this.setAttribute('max', '10');
        }
    }
    get max() { return parseInt(this.getAttribute('max') || '10'); }
    set max(value) {
        if (Number.isNaN(value) || value <= 0) {
            return;
        }
        this.setAttribute('max', value + '');
    }
    get line() { return this.textarea.value.split('\n').length; }
    clear() { this.textarea.value = ''; }
    add(...logs) {
        if (this.line + logs.length <= this.max) {
            this.textarea.value += logs.join('\n');
            return;
        }
        const newlogs = this.textarea.value.split('\n').concat(logs);
        while (this.max < newlogs.length) {
            newlogs.shift();
        }
        this.textarea.value = newlogs.join('\n');
    }
}
function Init() {
    CodeEditor.init();
    LogArea.init();
    let frame = 0;
    const render = () => {
        if (!document.body.classList.contains('running')) {
            return;
        }
        requestAnimationFrame(render);
        app.draw(frame++);
    };
    const start = () => {
        frame = 0;
        app.setShader();
        render();
    };
    const app = new App({
        screen: document.getElementById('screen'),
        log: document.getElementById('log'),
        preset: document.getElementById('preset'),
        vs: document.getElementById('vs'),
        fs: document.getElementById('fs'),
        option: {
            width: document.getElementById('width'),
            height: document.getElementById('height'),
        },
    });
    document.getElementById('run').addEventListener('click', () => {
        document.body.classList.toggle('running');
        if (document.body.classList.contains('running')) {
            start();
        }
    }, false);
    document.getElementById('option').addEventListener('click', () => {
        document.body.classList.toggle('open');
    }, false);
}
window.addEventListener('DOMContentLoaded', Init);
