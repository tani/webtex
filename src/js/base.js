const getVariable = (el, propertyName) => {
	return String(
		getComputedStyle(el).getPropertyValue(`--${propertyName}`),
	).trim();
};

const processTheElements = () => {
	const thes = document.querySelectorAll(".the");
	thes.forEach((theElement) => {
		const displayVar = theElement.getAttribute("display-var");
		if (displayVar) {
			const v = getVariable(theElement, displayVar);
			if (theElement.textContent !== v) {
				theElement.textContent = v;
			}
		}
	});
};

const completed = () => {
	document.removeEventListener("DOMContentLoaded", completed);
	window.removeEventListener("load", completed);

	const observer = new MutationObserver(() => {
		processTheElements();
	});

	observer.observe(document, {
		attributes: true,
		childList: true,
		characterData: true,
		subtree: true,
	});

	processTheElements();
};

document.addEventListener("DOMContentLoaded", completed);
window.addEventListener("load", completed);
