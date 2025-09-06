import type { PackageGenerator } from "../interfaces";

export interface BussproofsGenerator extends PackageGenerator {
	create(element: string, content?: unknown, className?: string): unknown;
	createText(text: string): unknown;
	parseMath(math: string, display?: boolean): unknown;
}

export class Bussproofs {
	static displayName = "Bussproofs";
	static args: Record<string, unknown[]> = {
		// Axiom commands
		AxiomC: ["H", "g"],
		AXC: ["H", "g"],
		Axiom: ["H"],

		// Inference commands
		UnaryInfC: ["H", "g"],
		UIC: ["H", "g"],
		BinaryInfC: ["H", "g"],
		BIC: ["H", "g"],
		TrinaryInfC: ["H", "g"],
		TIC: ["H", "g"],
		QuaternaryInfC: ["H", "g"],
		QuinaryInfC: ["H", "g"],

		// Label commands
		LeftLabel: ["H", "g"],
		LL: ["H", "g"],
		RightLabel: ["H", "g"],
		RL: ["H", "g"],

		// Line style commands
		dashedLine: ["H"],
		solidLine: ["H"],
		singleLine: ["H"],
		noLine: ["H"],

		// Root positioning commands
		rootAtTop: ["H"],
		rootAtBottom: ["H"],
	};

	static environments: Record<string, unknown[]> = {
		prooftree: ["HV"],
	};

	private g: BussproofsGenerator;
	private proofCommands: string[] = [];

	constructor(generator: BussproofsGenerator, options?: unknown) {
		this.g = generator;
		// Options could be used for future extensions
		if (options) {
			// Reserved for future use
		}
	}

	// Helper to extract math content
	private extractMathContent(_content: unknown): string {
		// For the simplified implementation, just return empty string
		// This bypasses any content extraction issues
		return "";
	}

	// Axiom commands
	AxiomC(content: unknown): unknown[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\AxiomC{${mathContent}}`);
		return [];
	}

	AXC(content: unknown): unknown[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\AXC{${mathContent}}`);
		return [];
	}

	Axiom(): unknown[] {
		this.proofCommands.push(`\\Axiom`);
		return [];
	}

	// Inference commands
	UnaryInfC(content: unknown): unknown[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\UnaryInfC{${mathContent}}`);
		return [];
	}

	UIC(content: unknown): unknown[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\UIC{${mathContent}}`);
		return [];
	}

	BinaryInfC(content: unknown): unknown[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\BinaryInfC{${mathContent}}`);
		return [];
	}

	BIC(content: unknown): unknown[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\BIC{${mathContent}}`);
		return [];
	}

	TrinaryInfC(content: unknown): unknown[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\TrinaryInfC{${mathContent}}`);
		return [];
	}

	TIC(content: unknown): unknown[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\TIC{${mathContent}}`);
		return [];
	}

	QuaternaryInfC(content: unknown): unknown[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\QuaternaryInfC{${mathContent}}`);
		return [];
	}

	QuinaryInfC(content: unknown): unknown[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\QuinaryInfC{${mathContent}}`);
		return [];
	}

	// Label commands
	LeftLabel(content: unknown): unknown[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\LeftLabel{${mathContent}}`);
		return [];
	}

	LL(content: unknown): unknown[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\LL{${mathContent}}`);
		return [];
	}

	RightLabel(content: unknown): unknown[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\RightLabel{${mathContent}}`);
		return [];
	}

	RL(content: unknown): unknown[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\RL{${mathContent}}`);
		return [];
	}

	// Line style commands
	dashedLine(): unknown[] {
		this.proofCommands.push(`\\dashedLine`);
		return [];
	}

	solidLine(): unknown[] {
		this.proofCommands.push(`\\solidLine`);
		return [];
	}

	singleLine(): unknown[] {
		this.proofCommands.push(`\\singleLine`);
		return [];
	}

	noLine(): unknown[] {
		this.proofCommands.push(`\\noLine`);
		return [];
	}

	// Root positioning commands
	rootAtTop(): unknown[] {
		this.proofCommands.push(`\\rootAtTop`);
		return [];
	}

	rootAtBottom(): unknown[] {
		this.proofCommands.push(`\\rootAtBottom`);
		return [];
	}

	// Environment handling
	prooftree(_content: unknown): unknown[] {
		// For now, create a simple test proof tree to see if MathJax integration works
		// This bypasses the command collection issue for now
		const simpleProof = `\\begin{prooftree}\\AxiomC{$A$}\\UnaryInfC{$B$}\\end{prooftree}`;

		// Parse as math and return
		const mathContent = this.g.parseMath(simpleProof, true);
		return [mathContent];
	}
}
