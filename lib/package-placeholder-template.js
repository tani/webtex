export class PACKAGE_NAME {
	static displayName = "PACKAGE_NAME";
	static args = {};
	static symbols = new Map([]);

	constructor(generator, options) {
		this.g = generator;
		if (options) {
			this.options = options;
		}
	}
}

export default PACKAGE_NAME;
