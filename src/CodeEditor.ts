class CodeEditor extends HTMLElement
{
	private contents: ShadowRoot;
	private textarea: HTMLTextAreaElement;

	public static init( tagname = 'code-editor' )
	{
		customElements.define( tagname, CodeEditor );
	}

	constructor()
	{
		super();

		this.contents = this.attachShadow( { mode: 'open' } );

		const style = document.createElement( 'style' );
		style.textContent = 'textarea{display:block;width:100%;height:100%;box-sizing:border-box;}';

		this.textarea = document.createElement( 'textarea' );
		this.textarea.addEventListener( 'keydown', ( event ) =>
		{
			if ( event.keyCode !== 9 ) { return; }
			event.preventDefault();
			const value = this.textarea.value;
			const pos = this.textarea.selectionStart;
			this.textarea.value = value.substr( 0, pos ) + '\t' + value.substr( pos, value.length );
			this.textarea.setSelectionRange( pos + 1, pos + 1 );
		}, false );
		//contentEditable

		this.contents.appendChild( style );
		this.contents.appendChild( this.textarea );
	}

	public get value() { return this.textarea.value; }
	public set value( value ) { this.textarea.value = value; }
}
