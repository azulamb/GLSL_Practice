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
            const fsc = this.getShader(shader + '_fs');
            this.fs.value = fsc;
        }, false);
    }
    initWebGL(canvas) {
        canvas.addEventListener('mousemove', (event) => {
            const target_rect = event.currentTarget.getBoundingClientRect();
            this.mx = (event.clientX - target_rect.left) / canvas.width;
            this.my = (event.clientY - target_rect.top) / canvas.height;
            if (this.mx < 0) {
                this.mx = 0;
            }
            if (1 < this.mx) {
                this.mx = 1;
            }
            if (this.my < 0) {
                this.my = 0;
            }
            if (1 < this.my) {
                this.my = 1;
            }
        }, false);
        this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        const ext = this.gl.getExtension('OES_texture_float');
        if (ext === null) {
            this.log.add('float texture not supported');
        }
        const vs = this.createVertexShader(document.getElementById('tvs').text);
        const fs = this.createFragmentShader(document.getElementById('tfs').text);
        this._program = this.createProgram(vs, fs);
        const uv = this.gl.getAttribLocation(this._program, 'textureCoord');
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.createVbo(new Float32Array([0, 0, 1, 0, 0, 1, 1, 1])));
        this.gl.enableVertexAttribArray(uv);
        this.gl.vertexAttribPointer(uv, 2, this.gl.FLOAT, false, 0, 0);
        const tex = this.gl.getUniformLocation(this._program, 'backbuffer');
        this.gl.uniform1i(tex, 0);
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
        this.mx = 0.5;
        this.my = 0.5;
        this.screen.width = parseInt(this.option.width.value);
        this.screen.height = parseInt(this.option.height.value);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        const vs = this.createVertexShader(this.vs.value);
        const fs = this.createFragmentShader(this.fs.value);
        this.program = this.createProgram(vs, fs);
        const attLocation = [];
        attLocation.push(this.gl.getAttribLocation(this.program, 'position'));
        const attStride = [3, 4, 2];
        const vbo = [];
        vbo.push(this.createVbo(new Float32Array([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0])));
        const index = [2, 3, 0, 3, 0, 1];
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo[0]);
        this.gl.enableVertexAttribArray(attLocation[0]);
        this.gl.vertexAttribPointer(attLocation[0], attStride[0], this.gl.FLOAT, false, 0, 0);
        const tex = this.gl.getUniformLocation(this.program, 'backbuffer');
        this.gl.uniform1i(tex, 0);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.createIbo(new Int16Array(index)));
        this.uniLocation = [];
        this.uniLocation.push(this.gl.getUniformLocation(this.program, 'frame'));
        this.uniLocation.push(this.gl.getUniformLocation(this.program, 'mouse'));
        this.uniLocation.push(this.gl.getUniformLocation(this.program, 'resolution'));
        this.back = this.createFrameBuffer(this.screen.width, this.screen.height, this.gl.FLOAT);
        this.front = this.createFrameBuffer(this.screen.width, this.screen.height, this.gl.FLOAT);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.back.f);
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.useProgram(this.program);
        this.gl.uniform1f(this.uniLocation[0], 0);
        this.gl.uniform2fv(this.uniLocation[1], [this.mx, this.my]);
        this.gl.uniform2fv(this.uniLocation[2], [this.screen.width, this.screen.height]);
        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
        this.gl.flush();
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
    createFrameBuffer(width, height, format) {
        const textureFormat = format || this.gl.UNSIGNED_BYTE;
        const frameBuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frameBuffer);
        const depthRenderBuffer = this.gl.createRenderbuffer();
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, depthRenderBuffer);
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, width, height);
        this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, depthRenderBuffer);
        const fTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, fTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, textureFormat, null);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, fTexture, 0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        return { f: frameBuffer, d: depthRenderBuffer, t: fTexture };
    }
    draw(frame) {
        this.gl.useProgram(this.program);
        this.gl.enable(this.gl.BLEND);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.front.f);
        this.gl.uniform1f(this.uniLocation[0], frame);
        this.gl.uniform2fv(this.uniLocation[1], [this.mx, this.my]);
        this.gl.uniform2fv(this.uniLocation[2], [this.screen.width, this.screen.height]);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.back.t);
        if (this.option.clear.checked) {
            this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
            this.gl.clearDepth(1.0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        }
        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
        this.renderFront();
        this.gl.flush();
        const tmp = this.back;
        this.back = this.front;
        this.front = tmp;
    }
    renderFront() {
        this.gl.useProgram(this._program);
        this.gl.disable(this.gl.BLEND);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.front.t);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clearDepth(1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
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
        this.textarea.addEventListener('keydown', (event) => {
            if (event.keyCode !== 9) {
                return;
            }
            event.preventDefault();
            const value = this.textarea.value;
            const pos = this.textarea.selectionStart;
            this.textarea.value = value.substr(0, pos) + '\t' + value.substr(pos, value.length);
            this.textarea.setSelectionRange(pos + 1, pos + 1);
        }, false);
        this.textarea.value = this.textContent || '';
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
        this.textarea.readOnly = true;
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
        if (!value) {
            this.removeAttribute('max');
            return;
        }
        if (Number.isNaN(value) || value <= 0) {
            return;
        }
        this.setAttribute('max', value + '');
    }
    get line() { return this.textarea.value.split('\n').length; }
    clear() { this.textarea.value = ''; }
    add(...logs) {
        if (this.hasAttribute('max') && this.line + logs.length <= this.max) {
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
class iOSToggle extends HTMLElement {
    static init(tagname = 'ios-toggle') {
        customElements.define(tagname, iOSToggle);
    }
    constructor() {
        super();
        this.contents = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = `#toggle {--height:var(--toggle-height,1.2em);--width:var(--toggle-width,calc(var(--height)*1.8));--back:var(--toggle-back,lightgray);--front:var(--toggle-front,white);--on:var(--toggle-on-color,springgreen);--bscale:var(--toggle-button-scale,0.8);--cursor:var(--toggle-cursor,pointer);--time:var(--toggle-time,0.1s);--anime:var(--toggle-timing-function,ease);--size:calc(var(--height)*var(--bscale));width:var(--width);height:var(--height);position:relative;border-radius:calc(var(--height)/2);overflow:hidden;background-color:var(--back);box-sizing:border-box;padding:calc((1 - var(--bscale))/2*var(--height))calc(var(--height)/2);cursor:var(--cursor);}
#toggle:before,#toggle:after{content:"";display:block;background-color:var(--on);border-radius:50%;width:var(--size);height:var(--size);position:absolute;top:0;bottom:0;left:calc((1 - var(--bscale))/2*var(--height));margin:auto;}
#toggle:after {background-color:var(--front);transition: left var( --anime ) var(--time);}
#toggle[checked="checked"]:after{left:calc(var(--width) - var(--height)*(1 + var(--bscale))/2);}
#toggle[checked="checked"] > div{width:100%;}
#toggle > div{height:var(--size);width:0;background-color:var(--on);transition:width var(--anime) var(--time);}`;
        const toggle = document.createElement('div');
        toggle.id = 'toggle';
        toggle.appendChild(document.createElement('div'));
        this.contents.appendChild(style);
        this.contents.appendChild(toggle);
        if (this.hasAttribute('checked')) {
            toggle.setAttribute('checked', this.getAttribute('checked') || 'checked');
        }
        else {
            toggle.removeAttribute('checked');
        }
        toggle.addEventListener('click', (event) => {
            if (this.hasAttribute('checked')) {
                this.removeAttribute('checked');
            }
            else {
                this.setAttribute('checked', 'checked');
            }
        }, false);
    }
    static get observedAttributes() { return ['checked']; }
    get checked() { return this.hasAttribute('checked'); }
    set checked(value) { this.setAttribute('checked', value === true ? 'checked' : ''); }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'checked') {
            this.toggle(newValue === 'checked');
        }
    }
    toggle(setValue) {
        const toggle = this.contents.getElementById('toggle');
        if (!toggle.hasAttribute('checked') || setValue === true) {
            toggle.setAttribute('checked', 'checked');
            return true;
        }
        toggle.removeAttribute('checked');
        return false;
    }
}
function Init() {
    CodeEditor.init();
    LogArea.init();
    iOSToggle.init();
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
            clear: document.getElementById('clear'),
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
