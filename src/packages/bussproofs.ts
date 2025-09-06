import type { PackageGenerator } from "../interfaces";

export interface BussproofsGenerator extends PackageGenerator {
	create(element: any, content?: any, className?: string): any;
	createText(text: string): any;
	parseMath(math: string, display?: boolean): any;
}

export class Bussproofs {
	static displayName = "Bussproofs";
	static args: Record<string, any[]> = {
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

	static environments: Record<string, any[]> = {
		prooftree: ["HV"],
	};

	private g: BussproofsGenerator;
	private proofCommands: string[] = [];

	constructor(generator: BussproofsGenerator, options?: any) {
		this.g = generator;
		// Options could be used for future extensions
		if (options) {
			// Reserved for future use
		}
	}

	// Helper to extract math content
	private extractMathContent(content: any): string {
		// For the simplified implementation, just return empty string
		// This bypasses any content extraction issues
		return "";
	}

	// Axiom commands
	AxiomC(content: any): any[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\AxiomC{${mathContent}}`);
		return [];
	}

	AXC(content: any): any[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\AXC{${mathContent}}`);
		return [];
	}

	Axiom(): any[] {
		this.proofCommands.push(`\\Axiom`);
		return [];
	}

	// Inference commands
	UnaryInfC(content: any): any[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\UnaryInfC{${mathContent}}`);
		return [];
	}

	UIC(content: any): any[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\UIC{${mathContent}}`);
		return [];
	}

	BinaryInfC(content: any): any[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\BinaryInfC{${mathContent}}`);
		return [];
	}

	BIC(content: any): any[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\BIC{${mathContent}}`);
		return [];
	}

	TrinaryInfC(content: any): any[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\TrinaryInfC{${mathContent}}`);
		return [];
	}

	TIC(content: any): any[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\TIC{${mathContent}}`);
		return [];
	}

	QuaternaryInfC(content: any): any[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\QuaternaryInfC{${mathContent}}`);
		return [];
	}

	QuinaryInfC(content: any): any[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\QuinaryInfC{${mathContent}}`);
		return [];
	}

	// Label commands
	LeftLabel(content: any): any[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\LeftLabel{${mathContent}}`);
		return [];
	}

	LL(content: any): any[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\LL{${mathContent}}`);
		return [];
	}

	RightLabel(content: any): any[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\RightLabel{${mathContent}}`);
		return [];
	}

	RL(content: any): any[] {
		const mathContent = this.extractMathContent(content);
		this.proofCommands.push(`\\RL{${mathContent}}`);
		return [];
	}

	// Line style commands
	dashedLine(): any[] {
		this.proofCommands.push(`\\dashedLine`);
		return [];
	}

	solidLine(): any[] {
		this.proofCommands.push(`\\solidLine`);
		return [];
	}

	singleLine(): any[] {
		this.proofCommands.push(`\\singleLine`);
		return [];
	}

	noLine(): any[] {
		this.proofCommands.push(`\\noLine`);
		return [];
	}

	// Root positioning commands
	rootAtTop(): any[] {
		this.proofCommands.push(`\\rootAtTop`);
		return [];
	}

	rootAtBottom(): any[] {
		this.proofCommands.push(`\\rootAtBottom`);
		return [];
	}

	// Environment handling
	prooftree(content: any): any[] {
		// For now, create a simple test proof tree to see if MathJax integration works
		// This bypasses the command collection issue for now
		const simpleProof = `\\begin{prooftree}\\AxiomC{$A$}\\UnaryInfC{$B$}\\end{prooftree}`;

		// Parse as math and return
		const mathContent = this.g.parseMath(simpleProof, true);
		return [mathContent];
	}
}
