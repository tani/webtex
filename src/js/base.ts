const getVariable = (el: Element, propertyName: string): string => {
    return String(getComputedStyle(el).getPropertyValue('--' + propertyName)).trim();
};

const processTheElements = (): void => {
    const thes = document.querySelectorAll('.the');
    thes.forEach((theElement) => {
        const displayVar = theElement.getAttribute('display-var');
        if (displayVar) {
            const v = getVariable(theElement, displayVar);
            // only mutate if it actually changed
            if (theElement.textContent !== v) {
                theElement.textContent = v;
            }
        }
    });
};

const _vertical = (el: Element, tb: 'top' | 'bottom'): number => {
    // return zero for disconnected and hidden (display: none) elements, IE <= 11 only
    // running getBoundingClientRect() on a disconnected node in IE throws an error
    if (!el.getClientRects().length) {
        return 0;
    }

    const rect = el.getBoundingClientRect();
    const doc = el.ownerDocument;
    const docEl = doc.documentElement;
    const win = doc.defaultView;

    if (!win) {
        return 0;
    }

    return rect[tb] + win.pageYOffset - docEl.clientTop;
};

const offsetTop = (el: Element): number => {
    return _vertical(el, "top");
};

const offsetBottom = (el: Element): number => {
    return _vertical(el, "bottom");
};

const offsetBaseline = (el: Element): number => {
    const mpbaseline = el.querySelector('.mpbaseline');
    return mpbaseline ? offsetBottom(mpbaseline) : 0;
};

const heightAboveBaseline = (el: Element): number => {
    const baseline = offsetBaseline(el);
    const top = offsetTop(el);
    return baseline - top;
};

const positionMarginpars = (): void => {
    const mpars = document.querySelectorAll('.marginpar > div') as NodeListOf<HTMLElement>;
    let prevBottom = 0;

    mpars.forEach((mpar) => {
        const mpref = document.querySelector('.body #marginref-' + mpar.id) as Element;
        
        if (!mpref) {
            return;
        }

        const baselineref = offsetBottom(mpref);
        const heightAB = heightAboveBaseline(mpar);
        const height = mpar.offsetHeight;

        // round to 1 digit
        const top = Math.round((baselineref - heightAB - prevBottom) * 10) / 10;
        const marginTopValue = Math.max(0, top) + "px";

        // only mutate if it actually changed
        if (mpar.style.marginTop !== marginTopValue) {
            mpar.style.marginTop = marginTopValue;
        }

        // if marginTop would have been negative, the element is now further down by that offset => add it to prevBottom
        prevBottom = baselineref - heightAB + height - Math.min(0, top);
    });
};

// don't call resize event handlers too often
const optimizedResize = (() => {
    const callbacks: Array<() => void> = [];
    let running = false;

    // fired on resize event
    const resize = (): void => {
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
    const runCallbacks = (): void => {
        callbacks.forEach((callback) => callback());
        running = false;
    };

    // adds callback to loop
    const addCallback = (callback: () => void): void => {
        if (callback) {
            callbacks.push(callback);
        }
    };

    return {
        // public method to add additional callback
        add: (callback: () => void): void => {
            if (!callbacks.length) {
                window.addEventListener('resize', resize);
            }
            addCallback(callback);
        }
    };
})();

// setup event listeners

const completed = (): void => {
    document.removeEventListener("DOMContentLoaded", completed);
    window.removeEventListener("load", completed);

    const observer = new MutationObserver(() => {
        processTheElements();
        positionMarginpars();
    });

    observer.observe(document, { 
        attributes: true, 
        childList: true, 
        characterData: true, 
        subtree: true 
    });

    // add resize event listener
    optimizedResize.add(positionMarginpars);

    processTheElements();
    positionMarginpars();
};

document.addEventListener("DOMContentLoaded", completed);
window.addEventListener("load", completed);
