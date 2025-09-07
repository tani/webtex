let window: typeof globalThis.window;
let document: typeof globalThis.document;

try {
	const { createHTMLWindow } = await import("svgdom");
	window = createHTMLWindow();
	document = window.document;
	globalThis.window = window;
	globalThis.document = document;
} catch (_error) {
	window = globalThis.window;
	document = globalThis.document;
}

export { window, document };
