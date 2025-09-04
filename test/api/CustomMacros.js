class CustomMacros {
	static displayName = "CustomMacros";
	static args = {
		myMacro: ["H", "o?"],
	};

	constructor(generator) {
		this.g = generator;
	}

	myMacro(o) {
		return ["-", o, "-"];
	}
}

module.exports = CustomMacros;
module.exports.default = CustomMacros;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomMacros = CustomMacros;
