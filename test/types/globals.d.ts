declare global {
	var expect: any;
	var test: any;
	var chrome: any;
	var firefox: any;
	var takeScreenshot: (html: string, filename: string) => Promise<void>;
}

export {};
