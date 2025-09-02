export interface SyntaxError extends Error {
    name: string;
    message: string;
    location: {
        start: { line: number; column: number; offset: number };
        end: { line: number; column: number; offset: number };
    };
}

export function parse(input: string, options?: { generator?: any }): any;
export { SyntaxError };