class PACKAGE_NAME {
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

module.exports = PACKAGE_NAME;
module.exports.default = PACKAGE_NAME;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PACKAGE_NAME = PACKAGE_NAME;
