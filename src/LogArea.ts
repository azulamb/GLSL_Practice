class LogArea extends HTMLElement
{
	private contents: ShadowRoot;
	private textarea: HTMLTextAreaElement;

	public static init( tagname = 'log-area' )
	{
		customElements.define( tagname, LogArea );
	}

	constructor()
	{
		super();

		this.contents = this.attachShadow( { mode: 'open' } );

		const style = document.createElement( 'style' );
		style.textContent = 'textarea{display:block;width:100%;height:100%;box-sizing:border-box;}';

		this.textarea = document.createElement( 'textarea' );
		this.textarea.readOnly = true;

		this.contents.appendChild( style );
		this.contents.appendChild( this.textarea );

		if ( this.hasAttribute( 'max' ) )
		{
			const max = parseInt( this.getAttribute( 'max' ) || '' );
			if ( Number.isNaN( max ) || max <= 0 )
			{
				this.setAttribute( 'max', '10' );
			}
		} else { this.setAttribute( 'max', '10' ); }
	}

	public get max() { return parseInt( this.getAttribute( 'max' ) || '10' ); }
	public set max( value )
	{
		if ( !value ) { this.setAttribute( 'max', '' ); return; }
		if ( Number.isNaN( value ) || value <= 0 ) { return; }
		this.setAttribute( 'max', value + '' );
	}

	public get line() { return this.textarea.value.split( '\n' ).length; }

	public clear() { this.textarea.value = ''; }

	public add( ... logs: string[] )
	{
		if ( this.hasAttribute( 'max' ) && this.line + logs.length <= this.max )
		{
			this.textarea.value += logs.join( '\n' );
			return;
		}
		const newlogs = this.textarea.value.split( '\n' ).concat( logs );
		while ( this.max < newlogs.length ) { newlogs.shift(); }
		this.textarea.value = newlogs.join( '\n' );
	}
}
