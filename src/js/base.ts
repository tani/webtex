function getVariable(el: Element, propertyName: string): string {
    return String(getComputedStyle(el).getPropertyValue('--' + propertyName)).trim();
}

function processTheElements(): void {
    const thes = document.querySelectorAll('.the');
    for (const theElement of thes) {
        const v = getVariable(theElement, theElement.getAttribute('display-var') || '');
        // only mutate if it actually changed
        if (theElement.textContent != v) {
            theElement.textContent = v;
        }
    }
}

function _vertical(el: Element, tb: 'top' | 'bottom'): number {
    // return zero for disconnected and hidden (display: none) elements, IE <= 11 only
    // running getBoundingClientRect() on a disconnected node in IE throws an error
    if (!el.getClientRects().length) {
        return 0;
    }

    const rect = el.getBoundingClientRect();
    const doc = el.ownerDocument;
    const docEl = doc.documentElement;
    const win = doc.defaultView;

    return rect[tb] + (win?.pageYOffset || 0) - docEl.clientTop;
}

function offsetTop(el: Element): number {
    return _vertical(el, "top");
}

function offsetBottom(el: Element): number {
    return _vertical(el, "bottom");
}

function offsetBaseline(el: Element): number {
    const mpbaseline = el.querySelector('.mpbaseline');
    return offsetBottom(mpbaseline!);
}

function heightAboveBaseline(el: Element): number {
    const baseline = offsetBaseline(el);
    const top = offsetTop(el);
    return baseline - top;
}

function positionMarginpars(): void {
    const mpars = document.querySelectorAll('.marginpar > div');
    let prevBottom = 0;

    mpars.forEach((mpar) => {
        const mpref = document.querySelector('.body #marginref-' + mpar.id);
        if (!mpref) return;

        const baselineref = offsetBottom(mpref);
        const heightAB = heightAboveBaseline(mpar);
        const height = (mpar as HTMLElement).offsetHeight;

        // round to 1 digit
        const top = Math.round((baselineref - heightAB - prevBottom) * 10) / 10;

        // only mutate if it actually changed
        if ((mpar as HTMLElement).style.marginTop != Math.max(0, top) + "px") {
            (mpar as HTMLElement).style.marginTop = Math.max(0, top) + "px";
        }

        // if marginTop would have been negative, the element is now further down by that offset => add it to prevBottom
        prevBottom = baselineref - heightAB + height - Math.min(0, top);
    });
}

// don't call resize event handlers too often
const optimizedResize = (() => {
    const callbacks: (() => void)[] = [];
    let running = false;

    // fired on resize event
    const resize = () => {
        if (!running) {
            running = true;

            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(runCallbacks);
            } else {
                setTimeout(runCallbacks, 66);
            }
        }
    };

    // run the actual callbacks
    const runCallbacks = () => {
        callbacks.forEach((callback) => callback());
        running = false;
    };

    // adds callback to loop
    const addCallback = (callback: () => void) => {
        if (callback) {
            callbacks.push(callback);
        }
    };

    return {
        // public method to add additional callback
        add: (callback: () => void) => {
            if (!callbacks.length) {
                window.addEventListener('resize', resize);
            }
            addCallback(callback);
        }
    };
})();

// setup event listeners

function completed(): void {
    document.removeEventListener("DOMContentLoaded", completed);
    window.removeEventListener("load", positionMarginpars);

    const observer = new MutationObserver(() => {
        processTheElements();
        positionMarginpars();
    });

    observer.observe(document, { attributes: true, childList: true, characterData: true, subtree: true });

    // add resize event listener
    optimizedResize.add(positionMarginpars);

    processTheElements();
    positionMarginpars();
}

document.addEventListener("DOMContentLoaded", completed);
window.addEventListener("load", completed);
