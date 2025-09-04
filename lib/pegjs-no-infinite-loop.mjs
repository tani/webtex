export default {
	use: (config, _options) => {
		// Find and remove reportInfiniteRepetition from check passes
		const checkPasses = config.passes.check;
		const index = checkPasses.findIndex(
			(pass) => pass.name === "reportInfiniteRepetition",
		);
		if (index !== -1) {
			checkPasses.splice(index, 1);
		} else {
			console.warn("reportInfiniteRepetition pass not found");
		}
	},
};
