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
		option: <HTMLButtonElement>document.getElementById( 'option' ),
	} );
}

window.addEventListener( 'DOMContentLoaded', Init );
