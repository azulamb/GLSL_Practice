/// <reference path="./App.ts" />
/// <reference path="./CodeEditor.ts" />
/// <reference path="./LogArea.ts" />
/// <reference path="./iOSToggle.ts" />

function Init()
{
	CodeEditor.init();
	LogArea.init();
	iOSToggle.init();

	let frame = 0;
	const render = () =>
	{
		if ( !document.body.classList.contains( 'running' ) ) { return; }
		requestAnimationFrame( render );
		app.draw( frame++ );
	}

	const start = () =>
	{
		frame = 0;
		app.setShader();
		render();
	}

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
			scale: <HTMLInputElement>document.getElementById( 'scale' ),
			antialias: <iOSToggle>document.getElementById( 'antialias' ),
			clear: <iOSToggle>document.getElementById( 'clear' ),
		},
	} );

	( <HTMLButtonElement>document.getElementById( 'run' ) ).addEventListener( 'click', () =>
	{
		document.body.classList.toggle( 'running' );
		if ( document.body.classList.contains( 'running' ) )
		{
			start();
		}
	}, false );

	( <HTMLButtonElement>document.getElementById( 'option' ) ).addEventListener( 'click', () =>
	{
		document.body.classList.toggle( 'open' );
	}, false );

}

window.addEventListener( 'DOMContentLoaded', Init );
