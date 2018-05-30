/// <reference path="./App.ts" />

function Init()
{
	const app = new App(
	{
		screen: <HTMLCanvasElement>document.getElementById( 'screen' ),
		preset: <HTMLSelectElement>document.getElementById( 'preset' ),
		vs: <HTMLTextAreaElement>document.getElementById( 'vs' ),
		fs: <HTMLTextAreaElement>document.getElementById( 'fs' ),
	} );

	( <HTMLButtonElement>document.getElementById( 'run' ) ).addEventListener( 'click', () =>
	{
		if ( document.body.classList.contains( 'running' ) )
		{
		} else
		{
			app.setShader();
			app.draw();
		}
		document.body.classList.toggle( 'running' );
	}, false );

	( <HTMLButtonElement>document.getElementById( 'option' ) ).addEventListener( 'click', () =>
	{
		document.body.classList.toggle( 'open' );
	}, false );

}

window.addEventListener( 'DOMContentLoaded', Init );
