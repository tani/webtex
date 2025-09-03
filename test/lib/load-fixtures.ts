'use strict';

import * as fs from 'fs';
import * as path from 'path';

interface Fixture {
  id: number;
  header: string;
  source: string;
  result: string;
}

interface FixtureResult {
  file?: string;
  fixtures: Fixture[];
}
const parse = (input: string, separator: string): FixtureResult => {
  // Escape separator for regex
  const escapedSeparator = separator.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
  const separatorRegex = new RegExp('(?:^|\\r\\n|\\n|\\r)(?:' + escapedSeparator + '(?:$|\\r\\n|\\n|\\r)(?!' + escapedSeparator + ')|' + escapedSeparator + '(?=$|\\r\\n|\\n|\\r))');
  const lines = input.split(separatorRegex);
  const result: FixtureResult = {
    fixtures: []
  };
  let fid = 1;
  
  for (let i = 0; i < lines.length; i += 3) {
    const fixture: Fixture = {
      id: fid++,
      header: lines[i].trim(),
      source: lines[i + 1],
      result: lines[i + 2]
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
const load = (filePath: string, separator: string = '.'): FixtureResult => {
  const stat = fs.statSync(filePath);
  
  if (stat.isFile()) {
    const input = fs.readFileSync(filePath, 'utf8');
    const result = parse(input, separator);
    result.file = filePath;
    return result;
  }
  
  return {
    fixtures: []
  };
};

export { load };