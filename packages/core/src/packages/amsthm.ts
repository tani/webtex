import type { AmsthrmGenerator } from "../interfaces";

interface TheoremStyle {
	name: string;
	headerFormat: string; // CSS class for header formatting
	bodyFormat: string; // CSS class for body formatting
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
	static args: Record<string, unknown[]> = {
		newtheorem: ["V", "s", "g", "o?", "g", "o?"],
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

	static environments: Record<string, unknown[]> = {
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
	private theoremStyles: {
		plain: TheoremStyle;
		definition: TheoremStyle;
		remark: TheoremStyle;
	} & Record<string, TheoremStyle>;
	private currentStyle: string = "plain";
	private theoremEnvironments: Record<string, TheoremEnvironment> = {};
	private counterInitialized: Record<string, boolean> = {};

	constructor(generator: AmsthrmGenerator, _options?: unknown) {
		this.g = generator;

		// Define the three standard theorem styles
		this.theoremStyles = {
			plain: {
				name: "plain",
				headerFormat: "amsthm-plain-header",
				bodyFormat: "amsthm-plain-body",
			},
			definition: {
				name: "definition",
				headerFormat: "amsthm-definition-header",
				bodyFormat: "amsthm-definition-body",
			},
			remark: {
				name: "remark",
				headerFormat: "amsthm-remark-header",
				bodyFormat: "amsthm-remark-body",
			},
		};
	}

	// Set the current theorem style
	theoremstyle(styleName: string | Node): unknown[] {
		const styleNameStr = typeof styleName === "string" 
			? styleName 
			: styleName.nodeValue || styleName.textContent || "";
		
		if (this.theoremStyles[styleNameStr]) {
			this.currentStyle = styleNameStr;
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
	 * @param starred - Whether this is the starred version (\newtheorem*)
	 * @param envName - Name of the theorem environment
	 * @param sharedCounter - Optional shared counter name (from middle [counter] position)
	 * @param displayName - Display name for the theorem
	 * @param parentCounter - Optional parent counter for hierarchical numbering
	 */
	newtheorem(
		starred: boolean,
		envName: string | Node,
		sharedCounter: string | Node | undefined,
		displayName: string | Node,
		parentCounter?: string | Node
	): unknown[] {
		// Extract text content from DOM nodes
		const envNameStr =
			typeof envName === "string"
				? envName
				: envName.nodeValue || envName.textContent || "";
		
		const sharedCounterStr = sharedCounter
			? typeof sharedCounter === "string"
				? sharedCounter
				: sharedCounter.nodeValue || sharedCounter.textContent || ""
			: undefined;
		
		const displayNameStr =
			typeof displayName === "string"
				? displayName
				: displayName.nodeValue || displayName.textContent || "";
		
		const parentCounterStr = parentCounter
			? typeof parentCounter === "string"
				? parentCounter
				: parentCounter.nodeValue || parentCounter.textContent || ""
			: undefined;

		// Handle starred version for unnumbered theorems
		const actualEnvName = envNameStr;
		const numbered = !starred;

		// Parse arguments based on new signature
		let sharedWith: string | undefined;
		let parentResetBy: string | undefined;
		let counterName: string;

		if (sharedCounterStr) {
			// \newtheorem{name}[counter]{display} - Shared counter
			sharedWith = sharedCounterStr;
			counterName = sharedWith;
		} else {
			// \newtheorem{name}{display} or \newtheorem{name}{display}[parent]
			counterName = actualEnvName;
		}

		if (parentCounterStr) {
			parentResetBy = parentCounterStr;
		}

		// Check if this environment is already pre-defined in static environments
		const isPredefined = Object.keys(Amsthm.environments).includes(
			actualEnvName,
		);

		if (isPredefined) {
			// Customize existing pre-defined environment
			const environment: TheoremEnvironment = {
				name: actualEnvName,
				displayName: displayNameStr,
				counter: numbered ? counterName : undefined,
				parentCounter: parentResetBy,
				numbered: numbered,
				style:
					this.theoremStyles[this.currentStyle] ?? this.theoremStyles.plain,
				sharedWith: sharedWith,
			};

			// Update the environment configuration
			this.theoremEnvironments[actualEnvName] = environment;
		} else {
			// Issue warning if environment is not pre-defined
			console.warn(
				`amsthm warning: Environment '${actualEnvName}' created by \\newtheorem is not pre-defined in LaTeX.js.\n` +
					`This environment will not be available for use. LaTeX.js requires environments to be statically declared.\n` +
					`Consider using one of the pre-defined environments: ${Object.keys(
						Amsthm.environments,
					)
						.filter((e) => e !== "proof")
						.join(", ")}\n` +
					`Or add '${actualEnvName}' to the static environments list in the amsthm package.`,
			);
		}

		// Initialize counter if needed (only for predefined environments)
		if (isPredefined && numbered && !this.counterInitialized[counterName]) {
			this.counterInitialized[counterName] = true;
			try {
				if (sharedWith) {
					// When sharing counter, don't create a new one, just mark as initialized
					// The shared counter should already exist
					if (!this.counterInitialized[sharedWith]) {
						console.warn(
							`amsthm warning: Trying to share counter '${sharedWith}' but it doesn't exist. Creating it.`,
						);
						this.g.newCounter(sharedWith, parentResetBy);
						this.counterInitialized[sharedWith] = true;
					}
				} else {
					// Create new counter
					this.g.newCounter(counterName, parentResetBy);
				}
			} catch (e) {
				console.warn(
					`amsthm warning: Could not create counter '${counterName}': ${e}`,
				);
			}
		}

		// For pre-defined environments, the method already exists
		// For non-pre-defined environments, we can't create a usable method due to LaTeX.js limitations
		if (!isPredefined) {
			// Store a placeholder method that explains the limitation
			(this as Record<string, unknown>)[actualEnvName] = () => {
				return [
					this.g.error(
						`Environment '${actualEnvName}' was defined with \\newtheorem but is not available. ` +
							`LaTeX.js requires environments to be pre-declared. Use a pre-defined environment instead.`,
					),
				];
			};
		}

		return [];
	}

	// Proof environment with optional argument support
	proof(label?: unknown): unknown[] {
		// Create proof header with optional label
		let headerContent: unknown;
		if (label) {
			headerContent = [label, this.g.createText(". ")];
		} else {
			headerContent = this.g.createText("Proof. ");
		}
		const header = this.g.create("em", headerContent, "amsthm-proof-header");

		// Create proof container with header - QED symbol will be added via CSS
		const proofContainer = this.g.create(
			"div",
			[header],
			"amsthm-proof amsthm-proof-with-qed",
		);

		return [proofContainer];
	}

	// QED symbol command
	qed(): unknown[] {
		const qedSymbol = this.g.create(
			"span",
			this.g.createText("◻"),
			"amsthm-qed",
		);
		return [qedSymbol];
	}

	// Pre-defined theorem environment methods with optional argument support
	theorem(title?: unknown): unknown[] {
		return this.createTheoremContainer("theorem", title);
	}

	lemma(title?: unknown): unknown[] {
		return this.createTheoremContainer("lemma", title);
	}

	corollary(title?: unknown): unknown[] {
		return this.createTheoremContainer("corollary", title);
	}

	proposition(title?: unknown): unknown[] {
		return this.createTheoremContainer("proposition", title);
	}

	definition(title?: unknown): unknown[] {
		return this.createTheoremContainer("definition", title);
	}

	example(title?: unknown): unknown[] {
		return this.createTheoremContainer("example", title);
	}

	remark(title?: unknown): unknown[] {
		return this.createTheoremContainer("remark", title);
	}

	note(title?: unknown): unknown[] {
		return this.createTheoremContainer("note", title);
	}

	observation(title?: unknown): unknown[] {
		return this.createTheoremContainer("observation", title);
	}

	claim(title?: unknown): unknown[] {
		return this.createTheoremContainer("claim", title);
	}

	fact(title?: unknown): unknown[] {
		return this.createTheoremContainer("fact", title);
	}

	conjecture(title?: unknown): unknown[] {
		return this.createTheoremContainer("conjecture", title);
	}

	// Create theorem container with header - parser will append content
	private createTheoremContainer(envName: string, title?: unknown): unknown[] {
		// Get or create environment configuration
		if (!this.theoremEnvironments[envName]) {
			const defaultStyle = this.getDefaultStyle(envName);
			const environment: TheoremEnvironment = {
				name: envName,
				displayName: this.capitalizeFirst(envName),
				numbered: true,
				counter: envName,
				style: this.theoremStyles[defaultStyle] ?? this.theoremStyles.plain,
			};
			this.theoremEnvironments[envName] = environment;
		}

		const env = this.theoremEnvironments[envName];
		let headerText = env.displayName;

		let labelId: string | undefined;
		if (env.numbered && env.counter) {
			// Ensure counter exists before using it
			if (!this.counterInitialized[env.counter]) {
				this.counterInitialized[env.counter] = true;
				try {
					this.g.newCounter(env.counter, env.parentCounter);
				} catch (e) {
					// Counter might already exist, that's ok
				}
			}

			// Use the actual counter name (which might be shared)
			const actualCounterName = env.sharedWith || env.counter;
			
			// Ensure the actual counter exists too
			if (env.sharedWith && !this.counterInitialized[actualCounterName]) {
				this.counterInitialized[actualCounterName] = true;
				try {
					this.g.newCounter(actualCounterName, env.parentCounter);
				} catch (e) {
					// Counter might already exist, that's ok
				}
			}

			this.g.stepCounter(actualCounterName);
			const counter = this.g.counter(actualCounterName);

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

			labelId = `${actualCounterName}-${counter}`;
			this.g.refCounter(actualCounterName, labelId);
		}

		// Create theorem header with optional title
		let headerContent: unknown;
		if (title) {
			headerContent = [
				this.g.createText(`${headerText} (`),
				title,
				this.g.createText("). "),
			];
		} else {
			headerContent = this.g.createText(`${headerText}. `);
		}
		const header = this.g.create("span", headerContent, env.style.headerFormat);

		// Create container div with header - parser will append content
		const container = this.g.create(
			"div",
			[header],
			`amsthm-environment amsthm-${env.style.name} ${env.style.bodyFormat}`,
		);

		if (labelId) {
			(container as Node as Element).id = labelId;
		}

		return [container];
	}

	private getDefaultStyle(envName: string): string {
		const definitionStyle = ["definition", "example", "problem", "exercise"];
		const remarkStyle = ["remark", "note", "case", "observation"];

		if (definitionStyle.includes(envName)) return "definition";
		if (remarkStyle.includes(envName)) return "remark";
		return "plain"; // theorem, lemma, corollary, proposition, etc.
	}

	private capitalizeFirst(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
}
