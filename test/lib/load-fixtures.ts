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
	for (let i = 0; i < lines.length; i += 3) {
		const fixture: FixtureItem = {
			id: fid++,
			header: (lines[i] ?? "").trim(),
			source: lines[i + 1] ?? "",
			result: lines[i + 2] ?? "",
		};
		if (fixture.source === undefined || fixture.result === undefined) {
			break;
		}
		if (!fixture.source.trim() && !fixture.result.trim()) {
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
