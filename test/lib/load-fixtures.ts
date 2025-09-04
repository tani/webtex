import fs from 'fs';
import p from 'path';

const parse = function(input: string, separator: string) {
  var lines, result, fid, i$, to$, line, fixture;
  const escapedSeparator = separator.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
  const separatorRegex = RegExp('(?:^|\\r\\n|\\n|\\r)(?:' + escapedSeparator + '(?:$|\\r\\n|\\n|\\r)(?!' + escapedSeparator + ')|' + escapedSeparator + '(?=$|\\r\\n|\\n|\\r))');
  lines = input.split(separatorRegex);
  result = {
    fixtures: []
  };
  fid = 1;
  for (i$ = 0, to$ = lines.length; i$ < to$; i$ += 3) {
    line = i$;
    fixture = {
      id: fid++,
      header: lines[line].trim(),
      source: lines[line + 1],
      result: lines[line + 2]
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
export const load = function(path: string, separator: string = '.') {
  var stat, input, result;
  stat = fs.statSync(path);
  if (stat.isFile()) {
    input = fs.readFileSync(path, 'utf8');
    result = parse(input, separator);
    result.file = path;
    return result;
  }
  return {
    fixtures: []
  };
};

