/// <reference path="./App.ts" />

function Init()
{
	const app = new App(
	{
		screen: <HTMLCanvasElement>document.getElementById( 'screen' ),
		preset: <HTMLSelectElement>document.getElementById( 'preset' ),
		vs: <HTMLTextAreaElement>document.getElementById( 'vs' ),
		fs: <HTMLTextAreaElement>document.getElementById( 'fs' ),
		run: <HTMLButtonElement>document.getElementById( 'run' ),
	} );
}

window.addEventListener( 'DOMContentLoaded', Init );
