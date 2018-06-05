interface SHADER_INFO{ name: string, width?: number, height?: number, scale?: number }
declare const LIST: (string|SHADER_INFO)[];

interface OPTION
{
	width: HTMLInputElement;
	height: HTMLInputElement;
	scale: HTMLInputElement;
	antialias: iOSToggle;
	clear: iOSToggle;
}

interface FrameBuffer
{
	f: WebGLFramebuffer;
	d: WebGLRenderbuffer;
	t: WebGLTexture;
}

class App
{
	private screen: HTMLCanvasElement;
	private log: LogArea;
	private vs: CodeEditor;
	private fs: CodeEditor;
	private gl: WebGLRenderingContext;
	private option: OPTION;

	private uniLocation: WebGLUniformLocation[];
	private mx: number;
	private my: number;
	private back: FrameBuffer;
	private front: FrameBuffer;

	private program: WebGLProgram;
	private _program: WebGLProgram;

	constructor( config:
	{
		screen: HTMLCanvasElement,
		log: LogArea,
		preset: HTMLSelectElement,
		vs: CodeEditor,
		fs: CodeEditor,
		option: OPTION,
	} )
	{
		this.screen = config.screen;
		this.log = config.log;
		this.option = config.option;
		this.vs = config.vs;
		this.fs = config.fs;
		this.initSelect( config.preset );
		this.initScale( config.option.scale );
		this.initAntialias( config.option.antialias );
		this.initWebGL( config.screen );
	}

	private initSelect( select: HTMLSelectElement )
	{
		const option = document.createElement( 'option' );
		option.value = '';
		option.textContent = '-';
		select.appendChild( option );

		LIST.forEach( ( shader ) =>
		{
			const info: SHADER_INFO = typeof shader === 'string' ? { name: shader } : shader;
			const option = document.createElement( 'option' );
			option.value = info.name;
			option.textContent = info.name;

			if ( info.width && 0 < info.width && info.height && 0 < info.height )
			{
				option.dataset.width = info.width + '';
				option.dataset.height = info.height + '';
			}

			if ( info.scale && 0 < info.scale ) { option.dataset.scale = info.scale + ''; }

			select.appendChild( option );
		} );

		select.addEventListener( 'change', () =>
		{
			const element = select.selectedOptions[ 0 ];
			const shader = element.value || '';

			if ( element.dataset.width && element.dataset.height )
			{
				this.option.width.value = element.dataset.width;
				this.option.height.value = element.dataset.height;
			}
			if ( element.dataset.scale )
			{
				this.option.scale.value = element.dataset.scale;
				this.updateScale();
			}

			//const vsc = this.getShader( shader + '_vs' );
			const fsc = this.getShader( shader + '_fs' );

			//this.vs.value = vsc;
			this.fs.value = fsc;
		}, false );
	}

	private initScale( scale: HTMLInputElement )
	{
		scale.addEventListener( 'change', () => { this.updateScale(); }, false );
	}

	private initAntialias( antialias: iOSToggle )
	{
		antialias.addEventListener( 'change', () =>
		{
			const prev = (<any>this.screen.style).imageRendering;
			(<any>this.screen.style).imageRendering = antialias.checked ? 'auto' : 'crisp-edges';
			if ( (<any>this.screen.style).imageRendering !== prev ) { return; }
			(<any>this.screen.style).imageRendering = antialias.checked ? 'auto' : 'pixelated';
		}, false );
	}

	private getWebGLContext( antialias: boolean )
	{
		return <WebGLRenderingContext>this.screen.getContext( 'webgl', { antialias: antialias } ) || this.screen.getContext( 'experimental-webgl', { antialias: antialias } );
	}

	private initWebGL( canvas: HTMLCanvasElement )
	{
		canvas.addEventListener( 'mousemove', ( event ) =>
		{
			const target_rect = (<HTMLElement>event.currentTarget).getBoundingClientRect();
			this.mx = ( event.clientX - target_rect.left ) / canvas.width;
			this.my = ( event.clientY - target_rect.top ) / canvas.height;
			if ( this.mx < 0  ) { this.mx = 0; }
			if ( 1 < this.mx ) { this.mx = 1; }
			if ( this.my < 0  ) { this.my = 0; }
			if ( 1 < this.my ) { this.my = 1; }
		}, false );
		this.gl = this.getWebGLContext( false );
		// Memo: this.gl.getContextAttributes().antialias

		const ext = this.gl.getExtension( 'OES_texture_float' );
		if ( ext === null ) { this.log.add( 'float texture not supported' ); }

		const vs = this.createVertexShader( (<HTMLScriptElement>document.getElementById( 'tvs' )).text );
		const fs = this.createFragmentShader( (<HTMLScriptElement>document.getElementById( 'tfs' )).text );
		this._program = this.createProgram( vs, fs );
		const uv = this.gl.getAttribLocation( this._program, 'textureCoord' );
		this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.createVbo( new Float32Array( [ 0, 0, 1, 0, 0, 1, 1, 1 ] ) ) );
		this.gl.enableVertexAttribArray( uv );
		this.gl.vertexAttribPointer( uv, 2, this.gl.FLOAT, false, 0, 0 );
		const tex = this.gl.getUniformLocation( this._program, 'backbuffer' );
		this.gl.uniform1i( tex, 0 );
	}

	private updateScale()
	{
		const scale = parseFloat( this.option.scale.value ) || 1.0;
		const width = this.screen.width * scale;
		const height = this.screen.height * scale;
		this.screen.style.width = width + 'px';
		this.screen.style.height = height + 'px';
	}

	private getShader( name: string )
	{
		const script = <HTMLScriptElement>document.getElementById( name );

		if ( !script ) { return ''; }

		return script.text;
	}

	private createShader( type: number, code: string )
	{
		const shader = <WebGLShader>this.gl.createShader( type );

		this.gl.shaderSource( shader, code );

		this.gl.compileShader( shader );

		if ( !this.gl.getShaderParameter( shader, this.gl.COMPILE_STATUS ) )
		{
			this.log.add( this.gl.getShaderInfoLog( shader ) || '' );
		}

		return shader;
	}

	private createVertexShader( shader: string )
	{
		return this.createShader( this.gl.VERTEX_SHADER, shader );
	}

	private createFragmentShader( shader: string )
	{
		return this.createShader( this.gl.FRAGMENT_SHADER, shader );
	}

	private createProgram( vs: WebGLShader, fs:WebGLShader )
	{
		const program = <WebGLProgram>this.gl.createProgram();

		if ( !program ) { return program; }

		this.gl.attachShader( program, vs );
		this.gl.attachShader( program, fs );

		this.gl.linkProgram( program );

		if ( this.gl.getProgramParameter( program, this.gl.LINK_STATUS ) )
		{
			this.gl.useProgram( program );
		} else
		{
			this.log.add( this.gl.getProgramInfoLog( program ) || '' );
		}

		return program;
	}

	public setShader()
	{
		this.log.clear();

		this.mx = 0.5;
		this.my = 0.5;

		this.screen.width = parseInt( this.option.width.value );
		this.screen.height = parseInt( this.option.height.value );
		this.gl.viewport( 0, 0, this.gl.canvas.width, this.gl.canvas.height );
		this.updateScale();

		const vs = this.createVertexShader( this.vs.value );
		const fs = this.createFragmentShader( this.fs.value );
		this.program = this.createProgram( vs, fs );

		const attLocation: number[] = [];
		attLocation.push( this.gl.getAttribLocation( this.program, 'position' ) );

		const attStride = [ 3 ]; // pos

		const vbo: WebGLBuffer[] = [];
		vbo.push( this.createVbo( new Float32Array( [ -1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0 ] ) ) );

		const index = [ 2, 3, 0, 3, 0, 1 ];

		// Position
		this.gl.bindBuffer( this.gl.ARRAY_BUFFER, vbo[ 0 ] );
		this.gl.enableVertexAttribArray( attLocation[ 0 ] );
		this.gl.vertexAttribPointer( attLocation[ 0 ], attStride[ 0 ], this.gl.FLOAT, false, 0, 0 );

		const tex = this.gl.getUniformLocation( this.program, 'backbuffer' );
		this.gl.uniform1i( tex, 0 );

		// Index
		this.gl.bindBuffer( this.gl.ELEMENT_ARRAY_BUFFER, this.createIbo( new Int16Array( index ) ) );

		this.uniLocation = [];
		this.uniLocation.push( <WebGLUniformLocation>this.gl.getUniformLocation( this.program, 'frame' ) );
		this.uniLocation.push( <WebGLUniformLocation>this.gl.getUniformLocation( this.program, 'mouse') );
		this.uniLocation.push( <WebGLUniformLocation>this.gl.getUniformLocation( this.program, 'resolution') );

		this.back  = this.createFrameBuffer( this.screen.width, this.screen.height, this.gl.FLOAT );
		this.front = this.createFrameBuffer( this.screen.width, this.screen.height, this.gl.FLOAT );

		this.gl.enable( this.gl.DEPTH_TEST );
		this.gl.depthFunc( this.gl.LEQUAL );
		this.gl.enable( this.gl.BLEND );
		this.gl.blendFunc( this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA );

		// Init backbuffer.
		this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, this.back.f );
		this.gl.clearColor( 0, 0, 0, 0 );
		this.gl.clear( this.gl.COLOR_BUFFER_BIT );
		this.gl.useProgram( this.program );
		this.gl.uniform1f( this.uniLocation[ 0 ], 0 );
		this.gl.uniform2fv( this.uniLocation[ 1 ], [ this.mx, this.my ] );
		this.gl.uniform2fv( this.uniLocation[ 2 ], [ this.screen.width, this.screen.height ] );
		this.gl.drawElements( this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0 );
		this.gl.flush();
	}

	private createVbo( data: Float32Array, dynamic = false )
	{
		const vbo = <WebGLBuffer>this.gl.createBuffer();

		this.gl.bindBuffer( this.gl.ARRAY_BUFFER, vbo );

		this.gl.bufferData( this.gl.ARRAY_BUFFER, data, dynamic ? this.gl.DYNAMIC_DRAW : this.gl.STATIC_DRAW );

		this.gl.bindBuffer( this.gl.ARRAY_BUFFER, null );

		return vbo;
	}

	public createIbo( data: Int16Array )
	{
		const ibo = <WebGLBuffer>this.gl.createBuffer();

		this.gl.bindBuffer( this.gl.ELEMENT_ARRAY_BUFFER, ibo );
		this.gl.bufferData( this.gl.ELEMENT_ARRAY_BUFFER, data, this.gl.STATIC_DRAW );

		this.gl.bindBuffer( this.gl.ELEMENT_ARRAY_BUFFER, null );

		return ibo;
	}

	public createFrameBuffer( width: number, height: number, format: number ): FrameBuffer
	{
		const textureFormat = format || this.gl.UNSIGNED_BYTE;

		const frameBuffer = <WebGLFramebuffer>this.gl.createFramebuffer();

		this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, frameBuffer );

		const depthRenderBuffer = <WebGLRenderbuffer>this.gl.createRenderbuffer();
		this.gl.bindRenderbuffer( this.gl.RENDERBUFFER, depthRenderBuffer );

		this.gl.renderbufferStorage( this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, width, height );

		this.gl.framebufferRenderbuffer( this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, depthRenderBuffer );

		const fTexture = <WebGLTexture>this.gl.createTexture();

		this.gl.bindTexture( this.gl.TEXTURE_2D, fTexture );

		this.gl.texImage2D( this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, textureFormat, null );

		this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST );
		this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST );
		this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE );
		this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE );

		this.gl.framebufferTexture2D( this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, fTexture, 0 );

		this.gl.bindTexture( this.gl.TEXTURE_2D, null );
		this.gl.bindRenderbuffer( this.gl.RENDERBUFFER, null );
		this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, null );

		return { f : frameBuffer, d : depthRenderBuffer, t : fTexture };
	}

	public draw( frame: number )
	{
		this.gl.useProgram( this.program );
		this.gl.enable( this.gl.BLEND );

		this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, this.front.f);

		this.gl.uniform1f( this.uniLocation[ 0 ], frame );
		this.gl.uniform2fv( this.uniLocation[ 1 ], [ this.mx, this.my ] );
		this.gl.uniform2fv( this.uniLocation[ 2 ], [ this.screen.width, this.screen.height ] );
		this.gl.bindTexture( this.gl.TEXTURE_2D, this.back.t );

		if ( this.option.clear.checked )
		{
			this.gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
			this.gl.clearDepth( 1.0 );
			this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );
		}

		this.gl.drawElements( this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0 );

		this.renderFront();

		this.gl.flush();

		const tmp = this.back;
		this.back = this.front;
		this.front = tmp;
	}

	private renderFront()
	{
		this.gl.useProgram( this._program );
		this.gl.disable( this.gl.BLEND );
		this.gl.bindTexture( this.gl.TEXTURE_2D, this.front.t );

		this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, null );
		this.gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
		this.gl.clearDepth( 1.0 );
		this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );
		this.gl.drawElements( this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0 );
	}
}
