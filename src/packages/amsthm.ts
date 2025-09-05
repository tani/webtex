import type { AmsthrmGenerator } from "../interfaces";

interface TheoremStyle {
	name: string;
	headerFormat: string; // CSS class for header formatting
	bodyFormat: string;   // CSS class for body formatting
}

interface TheoremEnvironment {
	name: string;
	displayName: string;
	counter?: string;
	parentCounter?: string;
	numbered: boolean;
	style: TheoremStyle;
}

export class Amsthm {
	static displayName = "Amsthm";
	static args: Record<string, any[]> = {
		newtheorem: ["V", "g", "g", "o?", "o?"],
		theoremstyle: ["V", "g"],
		qed: ["H"],
	};

	static environments: Record<string, any[]> = {
		proof: ["HV", "o?"],
		// Pre-define common theorem environments that users typically create
		theorem: ["HV", "o?"],
		lemma: ["HV", "o?"],
		corollary: ["HV", "o?"],
		proposition: ["HV", "o?"],
		definition: ["HV", "o?"],
		example: ["HV", "o?"],
		remark: ["HV", "o?"],
		note: ["HV", "o?"],
		observation: ["HV", "o?"],
		claim: ["HV", "o?"],
		fact: ["HV", "o?"],
		conjecture: ["HV", "o?"],
	};

	private g: AmsthrmGenerator;
	private theoremStyles: Record<string, TheoremStyle>;
	private currentStyle: string = "plain";
	private theoremEnvironments: Record<string, TheoremEnvironment> = {};
	private counters: Record<string, number> = {};

	constructor(generator: AmsthrmGenerator, options?: any) {
		this.g = generator;
		
		// Define the three standard theorem styles
		this.theoremStyles = {
			plain: {
				name: "plain",
				headerFormat: "amsthm-plain-header",
				bodyFormat: "amsthm-plain-body"
			},
			definition: {
				name: "definition", 
				headerFormat: "amsthm-definition-header",
				bodyFormat: "amsthm-definition-body"
			},
			remark: {
				name: "remark",
				headerFormat: "amsthm-remark-header", 
				bodyFormat: "amsthm-remark-body"
			}
		};
	}

	// Set the current theorem style
	theoremstyle(styleName: string): any[] {
		if (this.theoremStyles[styleName]) {
			this.currentStyle = styleName;
		}
		return [];
	}

	// Define a new theorem environment
	newtheorem(envName: string, displayName: string, parentOrCounter?: string, resetBy?: string): any[] {
		const isStarred = envName.endsWith('*');
		const actualEnvName = isStarred ? envName.slice(0, -1) : envName;
		
		let counterName: string;
		let parentCounter: string | undefined;
		let numbered = !isStarred;

		if (parentOrCounter) {
			// Check if parentOrCounter is an existing theorem environment (shared counter)
			if (this.theoremEnvironments[parentOrCounter]) {
				counterName = this.theoremEnvironments[parentOrCounter].counter || parentOrCounter;
			} else {
				// It's a parent counter (like 'section')
				counterName = actualEnvName;
				parentCounter = parentOrCounter;
			}
		} else {
			counterName = actualEnvName;
		}

		const environment: TheoremEnvironment = {
			name: actualEnvName,
			displayName: displayName,
			counter: numbered ? counterName : undefined,
			parentCounter: parentCounter,
			numbered: numbered,
			style: this.theoremStyles[this.currentStyle]
		};

		this.theoremEnvironments[actualEnvName] = environment;

		// Initialize counter if needed
		if (numbered && !this.counters[counterName]) {
			this.counters[counterName] = 0;
			try {
				this.g.newCounter(counterName, parentCounter);
			} catch {
				// Fallback if generator doesn't support newCounter
			}
		}

		// Create dynamic method for this theorem environment
		(this as any)[actualEnvName] = (content: any) => {
			return this.createTheoremEnvironment(actualEnvName, content);
		};

		return [];
	}

	// Create a theorem environment instance
	private createTheoremEnvironment(envName: string, content: any, optionalTitle?: string): any[] {
		const env = this.theoremEnvironments[envName];
		if (!env) {
			return [this.g.error(`Unknown theorem environment: ${envName}`)];
		}

		let headerText = env.displayName;
		
		if (env.numbered && env.counter) {
			// Increment counter
			this.counters[env.counter] = (this.counters[env.counter] || 0) + 1;
			
			try {
				this.g.setCounter(env.counter, this.counters[env.counter]);
				const counterValue = this.g.counter(env.counter);
				const formattedNumber = this.g.arabic(counterValue);
				headerText += ` ${formattedNumber}`;
			} catch {
				// Fallback if generator methods fail
				headerText += ` ${this.counters[env.counter]}`;
			}
		}

		// Add optional title if provided
		if (optionalTitle) {
			headerText += ` (${optionalTitle})`;
		}

		// Create theorem header
		const header = this.g.create('span', this.g.createText(headerText), env.style.headerFormat);
		
		// Create theorem body
		const body = this.g.create('div', content, env.style.bodyFormat);
		
		// Wrap in theorem container
		const theorem = this.g.create('div', [header, body], `amsthm-environment amsthm-${env.style.name}`);
		
		return [theorem];
	}

	// Proof environment
	proof(content: any, label?: string): any[] {
		const proofLabel = label || 'Proof';
		
		// Create proof header
		const header = this.g.create('em', this.g.createText(proofLabel + '.'), 'amsthm-proof-header');
		
		// Create QED symbol
		const qedSymbol = this.g.create('span', this.g.createText('◻'), 'amsthm-qed');
		
		// Create proof body - handle content properly
		let bodyElements: any[] = [];
		if (content) {
			if (Array.isArray(content)) {
				bodyElements = [...content];
			} else {
				bodyElements = [content];
			}
		}
		bodyElements.push(qedSymbol);
		
		// Wrap in proof container
		const proofEnv = this.g.create('div', [header, ...bodyElements], 'amsthm-proof');
		
		return [proofEnv];
	}

	// QED symbol command
	qed(): any[] {
		const qedSymbol = this.g.create('span', this.g.createText('◻'), 'amsthm-qed');
		return [qedSymbol];
	}

	// Pre-defined theorem environment methods
	theorem(content: any, optionalTitle?: string): any[] {
		return this.handleEnvironment('theorem', content, optionalTitle);
	}

	lemma(content: any, optionalTitle?: string): any[] {
		return this.handleEnvironment('lemma', content, optionalTitle);
	}

	corollary(content: any, optionalTitle?: string): any[] {
		return this.handleEnvironment('corollary', content, optionalTitle);
	}

	proposition(content: any, optionalTitle?: string): any[] {
		return this.handleEnvironment('proposition', content, optionalTitle);
	}

	definition(content: any, optionalTitle?: string): any[] {
		return this.handleEnvironment('definition', content, optionalTitle);
	}

	example(content: any, optionalTitle?: string): any[] {
		return this.handleEnvironment('example', content, optionalTitle);
	}

	remark(content: any, optionalTitle?: string): any[] {
		return this.handleEnvironment('remark', content, optionalTitle);
	}

	note(content: any, optionalTitle?: string): any[] {
		return this.handleEnvironment('note', content, optionalTitle);
	}

	observation(content: any, optionalTitle?: string): any[] {
		return this.handleEnvironment('observation', content, optionalTitle);
	}

	claim(content: any, optionalTitle?: string): any[] {
		return this.handleEnvironment('claim', content, optionalTitle);
	}

	fact(content: any, optionalTitle?: string): any[] {
		return this.handleEnvironment('fact', content, optionalTitle);
	}

	conjecture(content: any, optionalTitle?: string): any[] {
		return this.handleEnvironment('conjecture', content, optionalTitle);
	}

	// Generic environment handler
	private handleEnvironment(envName: string, content: any, optionalTitle?: string): any[] {
		// If this environment has been defined by \newtheorem, use that configuration
		if (this.theoremEnvironments[envName]) {
			return this.createTheoremEnvironment(envName, content, optionalTitle);
		}
		
		// Otherwise, use default configuration based on environment name
		const defaultStyle = this.getDefaultStyle(envName);
		const environment: TheoremEnvironment = {
			name: envName,
			displayName: this.capitalizeFirst(envName),
			numbered: true,
			counter: envName,
			style: this.theoremStyles[defaultStyle]
		};

		// Store the default environment
		this.theoremEnvironments[envName] = environment;
		
		// Initialize counter
		if (!this.counters[envName]) {
			this.counters[envName] = 0;
		}

		return this.createTheoremEnvironment(envName, content, optionalTitle);
	}

	private getDefaultStyle(envName: string): string {
		const definitionStyle = ['definition', 'example', 'problem', 'exercise'];
		const remarkStyle = ['remark', 'note', 'case', 'observation'];
		
		if (definitionStyle.includes(envName)) return 'definition';
		if (remarkStyle.includes(envName)) return 'remark';
		return 'plain'; // theorem, lemma, corollary, proposition, etc.
	}

	private capitalizeFirst(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
}