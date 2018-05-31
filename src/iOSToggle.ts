class iOSToggle extends HTMLElement
{
	private contents: ShadowRoot;

	public static init( tagname = 'ios-toggle' )
	{
		customElements.define( tagname, iOSToggle );
	}

	constructor()
	{
		super();

		this.contents = this.attachShadow( { mode: 'open' } );

		const style = document.createElement( 'style' );
		style.textContent = `#toggle {--height:var(--toggle-height,1.2em);--width:var(--toggle-width,calc(var(--height)*1.8));--back:var(--toggle-back,lightgray);--front:var(--toggle-front,white);--on:var(--toggle-on-color,springgreen);--bscale:var(--toggle-button-scale,0.8);--cursor:var(--toggle-cursor,pointer);--time:var(--toggle-time,0.1s);--anime:var(--toggle-timing-function,ease);--size:calc(var(--height)*var(--bscale));width:var(--width);height:var(--height);position:relative;border-radius:calc(var(--height)/2);overflow:hidden;background-color:var(--back);box-sizing:border-box;padding:calc((1 - var(--bscale))/2*var(--height))calc(var(--height)/2);cursor:var(--cursor);}
#toggle:before,#toggle:after{content:"";display:block;background-color:var(--on);border-radius:50%;width:var(--size);height:var(--size);position:absolute;top:0;bottom:0;left:calc((1 - var(--bscale))/2*var(--height));margin:auto;}
#toggle:after {background-color:var(--front);transition: left var( --anime ) var(--time);}
#toggle[checked="checked"]:after{left:calc(var(--width) - var(--height)*(1 + var(--bscale))/2);}
#toggle[checked="checked"] > div{width:100%;}
#toggle > div{height:var(--size);width:0;background-color:var(--on);transition:width var(--anime) var(--time);}`;

		const toggle = document.createElement( 'div' );
		toggle.id = 'toggle';
		toggle.appendChild( document.createElement( 'div' ) );
		this.contents.appendChild( style );
		this.contents.appendChild( toggle );

		if ( this.hasAttribute( 'checked' ) )
		{
			toggle.setAttribute( 'checked', this.getAttribute( 'checked' ) || 'checked' );
		} else
		{
			toggle.removeAttribute( 'checked' );
		}

		toggle.addEventListener( 'click', ( event ) =>
		{
			if ( this.hasAttribute( 'checked' ) )
			{
				this.removeAttribute( 'checked' );
			} else
			{
				this.setAttribute( 'checked', 'checked' );
			}
		}, false );
	}

	static get observedAttributes() { return [ 'checked' ]; }

	get checked() { return this.hasAttribute( 'checked' ); }

	set checked( value ) { this.setAttribute( 'checked', value === true ? 'checked' : '' ); }

	public attributeChangedCallback( name: string, oldValue: any, newValue: string )
	{
		if ( name === 'checked' )
		{
			this.toggle( newValue === 'checked' );
		}
	}

	private toggle( setValue: boolean )
	{
		const toggle = <HTMLElement>this.contents.getElementById( 'toggle' );
		if ( !toggle.hasAttribute( 'checked' ) || setValue === true )
		{
			toggle.setAttribute( 'checked', 'checked' );
			return true;
		}
		toggle.removeAttribute( 'checked' );
		return false;
	}

}