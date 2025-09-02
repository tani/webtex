var load;
export { load }
'use strict';
var fs, p, parse;
fs = require('fs');
p = require('path');
parse = function(input, separator){
  var lines, result, fid, i$, to$, line, fixture;
  separator = separator.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
  separator = RegExp('(?:^|\\r\\n|\\n|\\r)(?:' + separator + '(?:$|\\r\\n|\\n|\\r)(?!' + separator + ')|' + separator + '(?=$|\\r\\n|\\n|\\r))');
  lines = input.split(separator);
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
load = function(path, separator){
  var stat, input, result;
  separator == null && (separator = '.');
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