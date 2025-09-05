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
	sharedWith?: string; // If sharing counter with another theorem environment
}

export class Amsthm {
	static displayName = "Amsthm";
	static args: Record<string, any[]> = {
		newtheorem: ["V", "g", "o?", "g", "o?"],
		theoremstyle: ["V", "g"],
		qed: ["H"],
		// Environment arguments - required for parser to handle optional arguments
		proof: ["HV", "o?"],
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

	static environments: Record<string, any[]> = {
		proof: ["HV", "o?"],
		// Theorem environments with optional argument support
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

	/**
	 * Define a new theorem environment using \newtheorem
	 * 
	 * IMPORTANT LIMITATION: Due to LaTeX.js architecture, environments must be statically declared.
	 * This means \newtheorem can only configure pre-defined environments, not create new ones.
	 * 
	 * Supported syntax:
	 * - \newtheorem{name}{display}                    - Simple numbered theorem
	 * - \newtheorem{name}{display}[parent]            - Numbered by parent counter (like section)  
	 * - \newtheorem{name}[counter]{display}           - Share counter with existing theorem
	 * - \newtheorem*{name}{display}                   - Unnumbered theorem
	 * 
	 * Pre-defined environments that work with \newtheorem:
	 * theorem, lemma, corollary, proposition, definition, example, remark, note, 
	 * observation, claim, fact, conjecture
	 * 
	 * For other environment names, \newtheorem will issue a warning and the environment
	 * will not be available for use.
	 * 
	 * @param envName - Name of the theorem environment (may include *)
	 * @param sharedCounter - Optional counter to share with existing theorem
	 * @param displayName - Display name for the theorem (e.g., "Theorem", "Lemma")
	 * @param parentCounter - Optional parent counter for hierarchical numbering
	 */
	newtheorem(envName: string, sharedCounter: string | undefined, displayName: string, parentCounter?: string): any[] {
		// Handle starred version for unnumbered theorems
		const isStarred = envName.includes('*');
		const actualEnvName = isStarred ? envName.replace('*', '') : envName;
		const numbered = !isStarred;

		// Parse the arguments to understand the syntax variants:
		// \newtheorem{name}{display}                    - Simple numbered theorem
		// \newtheorem{name}{display}[parent]            - Numbered by parent counter (like section)  
		// \newtheorem{name}[counter]{display}           - Share counter with existing theorem
		// \newtheorem*{name}{display}                   - Unnumbered theorem
		
		let counterName: string;
		let parentResetBy: string | undefined;
		let sharedWith: string | undefined;

		if (sharedCounter) {
			// Syntax: \newtheorem{lemma}[theorem]{Lemma}
			// This means lemma shares the counter with theorem
			sharedWith = sharedCounter;
			if (this.theoremEnvironments[sharedCounter]) {
				counterName = this.theoremEnvironments[sharedCounter].counter || sharedCounter;
			} else {
				counterName = sharedCounter;
			}
		} else {
			// Syntax: \newtheorem{theorem}{Theorem}[section] or \newtheorem{theorem}{Theorem}
			counterName = actualEnvName;
			parentResetBy = parentCounter;
		}

		// Check if this environment is already pre-defined in static environments
		const isPredefined = Object.keys(Amsthm.environments).includes(actualEnvName);
		
		// Issue warning if environment is not pre-defined
		if (!isPredefined) {
			console.warn(
				`amsthm warning: Environment '${actualEnvName}' created by \\newtheorem is not pre-defined in LaTeX.js.\n` +
				`This environment will not be available for use. LaTeX.js requires environments to be statically declared.\n` +
				`Consider using one of the pre-defined environments: ${Object.keys(Amsthm.environments).filter(e => e !== 'proof').join(', ')}\n` +
				`Or add '${actualEnvName}' to the static environments list in the amsthm package.`
			);
		}

		const environment: TheoremEnvironment = {
			name: actualEnvName,
			displayName: displayName,
			counter: numbered ? counterName : undefined,
			parentCounter: parentResetBy,
			numbered: numbered,
			style: this.theoremStyles[this.currentStyle],
			sharedWith: sharedWith
		};

		// Store the theorem environment configuration
		this.theoremEnvironments[actualEnvName] = environment;

		// Initialize counter if needed and not sharing
		if (numbered && !sharedWith && !this.counters[counterName]) {
			this.counters[counterName] = 0;
			try {
				this.g.newCounter(counterName, parentResetBy);
			} catch (e) {
				// Fallback if generator doesn't support newCounter
				console.warn(`amsthm warning: Could not create counter '${counterName}': ${e}`);
			}
		}

		// For pre-defined environments, the method already exists
		// For non-pre-defined environments, we can't create a usable method due to LaTeX.js limitations
		if (!isPredefined) {
			// Store a placeholder method that explains the limitation
			(this as any)[actualEnvName] = (content: any) => {
				return [this.g.error(
					`Environment '${actualEnvName}' was defined with \\newtheorem but is not available. ` +
					`LaTeX.js requires environments to be pre-declared. Use a pre-defined environment instead.`
				)];
			};
		}

		return [];
	}

	// Create a theorem environment instance
	private createTheoremEnvironment(envName: string, content: any, title?: any): any[] {
		console.log('createTheoremEnvironment called with:', envName, 'content:', content, 'title:', title);
		const env = this.theoremEnvironments[envName];
		if (!env) {
			return [this.g.error(`Unknown theorem environment: ${envName}`)];
		}

		let headerText = env.displayName;
		
		if (env.numbered && env.counter) {
			// Handle parent counter resets (like section numbering)
			if (env.parentCounter) {
				try {
					const parentValue = this.g.counter(env.parentCounter);
					// Reset counter when parent counter changes
					const parentKey = `${env.counter}_parent`;
					const lastParentValue = this.counters[parentKey] || 0;
					if (parentValue !== lastParentValue) {
						this.counters[env.counter] = 0;
						this.counters[parentKey] = parentValue;
					}
				} catch {
					// Parent counter not available, continue with normal numbering
				}
			}

			// Increment the counter
			this.counters[env.counter] = (this.counters[env.counter] || 0) + 1;
			
			// Format the number with parent counter if applicable
			let formattedNumber: string;
			try {
				this.g.setCounter(env.counter, this.counters[env.counter]);
				const counterValue = this.g.counter(env.counter);
				
				if (env.parentCounter) {
					const parentValue = this.g.counter(env.parentCounter);
					formattedNumber = `${this.g.arabic(parentValue)}.${this.g.arabic(counterValue)}`;
				} else {
					formattedNumber = this.g.arabic(counterValue);
				}
			} catch {
				// Fallback formatting
				if (env.parentCounter) {
					try {
						const parentValue = this.g.counter(env.parentCounter);
						formattedNumber = `${parentValue}.${this.counters[env.counter]}`;
					} catch {
						formattedNumber = `${this.counters[env.counter]}`;
					}
				} else {
					formattedNumber = `${this.counters[env.counter]}`;
				}
			}
			
			headerText += ` ${formattedNumber}`;
		}

		// Create theorem header with optional title
		let headerContent: any;
		if (title) {
			headerContent = [this.g.createText(headerText + ' ('), title, this.g.createText('). ')];
		} else {
			headerContent = this.g.createText(headerText + '. ');
		}
		const header = this.g.create('span', headerContent, env.style.headerFormat);
		
		// Create the theorem container with header and content
		const theorem = this.g.create('div', [header, content], `amsthm-environment amsthm-${env.style.name} ${env.style.bodyFormat}`);
		
		return [theorem];
	}

	// Proof environment with optional argument support  
	proof(label?: any): any[] {
		// Create proof header with optional label
		let headerContent: any;
		if (label) {
			headerContent = [label, this.g.createText('. ')];
		} else {
			headerContent = this.g.createText('Proof. ');
		}
		const header = this.g.create('em', headerContent, 'amsthm-proof-header');
		
		// Create proof container with header - QED symbol will be added via CSS
		const proofContainer = this.g.create('div', [header], 'amsthm-proof amsthm-proof-with-qed');
		
		return [proofContainer];
	}

	// QED symbol command
	qed(): any[] {
		const qedSymbol = this.g.create('span', this.g.createText('◻'), 'amsthm-qed');
		return [qedSymbol];
	}

	// Pre-defined theorem environment methods with optional argument support
	theorem(title?: any): any[] {
		return this.createTheoremContainer('theorem', title);
	}

	lemma(title?: any): any[] {
		return this.createTheoremContainer('lemma', title);
	}

	corollary(title?: any): any[] {
		return this.createTheoremContainer('corollary', title);
	}

	proposition(title?: any): any[] {
		return this.createTheoremContainer('proposition', title);
	}

	definition(title?: any): any[] {
		return this.createTheoremContainer('definition', title);
	}

	example(title?: any): any[] {
		return this.createTheoremContainer('example', title);
	}

	remark(title?: any): any[] {
		return this.createTheoremContainer('remark', title);
	}

	note(title?: any): any[] {
		return this.createTheoremContainer('note', title);
	}

	observation(title?: any): any[] {
		return this.createTheoremContainer('observation', title);
	}

	claim(title?: any): any[] {
		return this.createTheoremContainer('claim', title);
	}

	fact(title?: any): any[] {
		return this.createTheoremContainer('fact', title);
	}

	conjecture(title?: any): any[] {
		return this.createTheoremContainer('conjecture', title);
	}

	// Create theorem container with header - parser will append content
	private createTheoremContainer(envName: string, title?: any): any[] {
		
		// Get or create environment configuration
		if (!this.theoremEnvironments[envName]) {
			const defaultStyle = this.getDefaultStyle(envName);
			const environment: TheoremEnvironment = {
				name: envName,
				displayName: this.capitalizeFirst(envName),
				numbered: true,
				counter: envName,
				style: this.theoremStyles[defaultStyle]
			};
			this.theoremEnvironments[envName] = environment;
			
			// Initialize counter
			if (!this.counters[envName]) {
				this.counters[envName] = 0;
			}
		}
		
		const env = this.theoremEnvironments[envName];
		let headerText = env.displayName;
		
		if (env.numbered && env.counter) {
			// Handle parent counter resets (like section numbering)
			if (env.parentCounter) {
				try {
					const parentValue = this.g.counter(env.parentCounter);
					// Reset counter when parent counter changes
					const parentKey = `${env.counter}_parent`;
					const lastParentValue = this.counters[parentKey] || 0;
					if (parentValue !== lastParentValue) {
						this.counters[env.counter] = 0;
						this.counters[parentKey] = parentValue;
					}
				} catch {
					// Parent counter doesn't exist, continue without parent numbering
				}
			}
			
			// Increment counter
			this.counters[env.counter] = (this.counters[env.counter] || 0) + 1;
			const counter = this.counters[env.counter];
			
			if (env.parentCounter) {
				try {
					const parentValue = this.g.counter(env.parentCounter);
					headerText = `${headerText} ${parentValue}.${counter}`;
				} catch {
					headerText = `${headerText} ${counter}`;
				}
			} else {
				headerText = `${headerText} ${counter}`;
			}
		}
		
		// Create theorem header with optional title
		let headerContent: any;
		if (title) {
			headerContent = [this.g.createText(headerText + ' ('), title, this.g.createText('). ')];
		} else {
			headerContent = this.g.createText(headerText + '. ');
		}
		const header = this.g.create('span', headerContent, env.style.headerFormat);
		
		// Create container div with header - parser will append content
		const container = this.g.create('div', [header], `amsthm-environment amsthm-${env.style.name} ${env.style.bodyFormat}`);
		
		return [container];
	}

	// Generic environment handler
	private handleEnvironment(envName: string, content: any, title?: any): any[] {
		// If this environment has been defined by \newtheorem, use that configuration
		if (this.theoremEnvironments[envName]) {
			return this.createTheoremEnvironment(envName, content, title);
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

		return this.createTheoremEnvironment(envName, content, title);
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