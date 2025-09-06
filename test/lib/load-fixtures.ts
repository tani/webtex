import fs from "node:fs";

interface FixtureItem {
	id: number;
	header: string;
	source: string;
	result: string;
}

interface FixturesResult {
	file?: string;
	fixtures: FixtureItem[];
}

const parse = (input: string, separator: string): FixturesResult => {
	const escapedSeparator = separator.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
	const separatorRegex = RegExp(
		`(?:^|\r\n|\n|\r)(?:${escapedSeparator}(?:$|\r\n|\n|\r)(?!${escapedSeparator})|${escapedSeparator}(?=$|\r\n|\n|\r))`,
	);
	const lines: string[] = input.split(separatorRegex);
	const result: FixturesResult = { fixtures: [] };
	let fid = 1;

	// Check if this is the old 3-part format or new 2-part format
	const isOldFormat =
		lines.length >= 3 && lines[2] && lines[2].trim().startsWith("<");
	const step = isOldFormat ? 3 : 2;

	for (let i = 0; i < lines.length; i += step) {
		const fixture: FixtureItem = {
			id: fid++,
			header: (lines[i] ?? "").trim(),
			source: lines[i + 1] ?? "",
			result: isOldFormat ? (lines[i + 2] ?? "") : "",
		};
		if (fixture.source === undefined) {
			break;
		}
		if (!fixture.source.trim()) {
			continue;
		}
		result.fixtures.push(fixture);
	}
	return result;
};
/* Read a file with fixtures.
    @param path         the path to the file with fixtures
    @param separator    fixture separator (default is '.')
    @return a fixture object:
        {
            file: path,
            fixtures: [
                fixture1,
                fixture2,
                ...
            ]
        }
*/
export const load = (path: string, separator: string = "."): FixturesResult => {
	const stat = fs.statSync(path);
	if (stat.isFile()) {
		const input = fs.readFileSync(path, "utf8");
		const result = parse(input, separator);
		result.file = path;
		return result;
	}
	return { fixtures: [] };
};
