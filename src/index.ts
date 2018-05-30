/// <reference path="./App.ts" />
/// <reference path="./CodeEditor.ts" />
/// <reference path="./LogArea.ts" />

function Init()
{
	CodeEditor.init();
	LogArea.init();

	const app = new App(
	{
		screen: <HTMLCanvasElement>document.getElementById( 'screen' ),
		log: <LogArea>document.getElementById( 'log' ),
		preset: <HTMLSelectElement>document.getElementById( 'preset' ),
		vs: <CodeEditor>document.getElementById( 'vs' ),
		fs: <CodeEditor>document.getElementById( 'fs' ),
		option:
		{
			width: <HTMLInputElement>document.getElementById( 'width' ),
			height: <HTMLInputElement>document.getElementById( 'height' ),
		},
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
