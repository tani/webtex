export declare class LaTeXJSComponent extends HTMLElement {
    constructor();
    shadow: ShadowRoot;
    onContentReady(): Promise<void>;
    connectedCallback(): void;
}

export declare let LaTeXJSComponent: typeof LaTeXJSComponent | null;