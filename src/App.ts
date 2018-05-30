declare const LIST: string[];

interface OPTION
{
	width: HTMLInputElement;
	height: HTMLInputElement;
}

class App
{
	private screen: HTMLCanvasElement;
	private vs: HTMLTextAreaElement;
	private fs: HTMLTextAreaElement;
	private gl: WebGLRenderingContext;
	private option: OPTION;

	constructor( config:
	{
		screen: HTMLCanvasElement,
		preset: HTMLSelectElement,
		vs: HTMLTextAreaElement,
		fs: HTMLTextAreaElement,
		option: OPTION,
	} )
	{
		this.screen = config.screen;
		this.option = config.option;
		this.vs = config.vs;
		this.fs = config.fs;
		this.initSelect( config.preset );
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
			const option = document.createElement( 'option' );
			option.value = shader;
			option.textContent = shader;
			select.appendChild( option );
		} );

		select.addEventListener( 'change', () =>
		{
			const shader = select.selectedOptions[ 0 ].value || '';

			const vsc = this.getShader( shader + '_vs' );
			const fsc = this.getShader( shader + '_fs' );

			this.vs.value = vsc;
			this.fs.value = fsc;
		}, false );
	}

	private initWebGL( canvas: HTMLCanvasElement )
	{
		this.gl = <WebGLRenderingContext>canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' );
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
			alert( this.gl.getShaderInfoLog( shader ) );
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
			alert( this.gl.getProgramInfoLog( program ) );
		}

		return program;
	}

	public setShader()
	{
		this.screen.width = parseInt( this.option.width.value );
		this.screen.height = parseInt( this.option.height.value );
		this.gl.viewport( 0, 0, this.gl.canvas.width, this.gl.canvas.height );

		const vs = this.createVertexShader( this.vs.value );
		const fs = this.createFragmentShader( this.fs.value );
		const program = this.createProgram( vs, fs );

		const attLocation: number[] = [];
		attLocation.push( this.gl.getAttribLocation( program, 'position' ) );
		//attLocation.push( this.gl.getAttribLocation( program, 'color' ) );
		//attLocation.push( this.gl.getAttribLocation( program, 'textureCoord' ) );

		const attStride = [ 3, 4, 2 ]; // pos, col, uv

		const vbo: WebGLBuffer[] = [];
		vbo.push( this.createVbo( new Float32Array( [ -1, 1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0 ] ) ) );

		const index = [ 0, 1, 2, 3, 2, 1 ];

		// Position
		this.gl.bindBuffer( this.gl.ARRAY_BUFFER, vbo[ 0 ] );
		this.gl.enableVertexAttribArray( attLocation[ 0 ] );
		this.gl.vertexAttribPointer( attLocation[ 0 ], attStride[ 0 ], this.gl.FLOAT, false, 0, 0 );

		// Index
		this.gl.bindBuffer( this.gl.ELEMENT_ARRAY_BUFFER, this.createIbo( new Int16Array( index ) ) );

		this.gl.enable( this.gl.DEPTH_TEST );
		this.gl.depthFunc( this.gl.LEQUAL );
		this.gl.enable( this.gl.BLEND );
		this.gl.blendFunc( this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA );
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

	public draw()
	{
		this.gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
		this.gl.clearDepth( 1.0 );
		this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );

		this.gl.drawElements( this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0 );

		this.gl.flush();
	}
}
