'use strict';
var path, fs, pkg, EOL, tmp, cmd, binFile, latexjs;
path = require('path');
fs = require('fs');
pkg = require('../package');
EOL = require('os').EOL;
tmp = require('tmp');
cmd = require('./lib/cmd');
binFile = path.resolve(pkg.bin[pkg.name]);
latexjs = cmd.create(binFile);
describe('LaTeX.js CLI test', function(){
  test('get version', function(){
    return expect(latexjs.execute(['-V'])).to.eventually.include.nested({
      stdout: pkg.version + EOL
    });
  });
  test('get help', function(){
    return expect(latexjs.execute(['-h'])).to.eventually.be.fulfilled.and.to.be.an('object').that.satisfies(function(h){
      return h.stdout.includes(pkg.description);
    });
  });
  test('error on unknown option', function(){
    return expect(latexjs.execute(['-x'])).to.eventually.be.rejected.and.to.be.an('object').that.includes.key('stderr').and.to.satisfy(function(res){
      return res.stderr.includes('error: unknown option');
    });
  });
  test('error on incorrect use', function(){
    return Promise.all([expect(latexjs.execute(['-b', '-s'])).to.eventually.be.rejected, expect(latexjs.execute(['-b', '-u'])).to.eventually.be.rejected, expect(latexjs.execute(['-bus'])).to.eventually.be.rejected, expect(latexjs.execute(['-b -s style.css'])).to.eventually.be.rejected]);
  });
  test('default translation', function(){
    return expect(latexjs.execute([], ["A paragraph."])).to.eventually.be.fulfilled.and.to.be.an('object').that.includes.key('stdout').and.to.satisfy(function(res){
      return expect(res.stdout).to.equal('<html style="--size: 13.284px; --textwidth: 56.162%; --marginleftwidth: 21.919%; --marginrightwidth: 21.919%; --marginparwidth: 48.892%; --marginparsep: 14.612px; --marginparpush: 6.642px;"><head><title>untitled</title><meta charset="UTF-8"></meta><link type="text/css" rel="stylesheet" href="css/katex.css"><link type="text/css" rel="stylesheet" href="css/article.css"><script src="js/base.js"></script></head><body><div class="body"><p>A para­graph.</p></div></body></html>' + EOL);
    });
  });
  test('return only the body', function(){
    return expect(latexjs.execute(['-b'], ["A paragraph."])).to.eventually.be.fulfilled.and.to.be.an('object').that.includes.key('stdout').and.to.satisfy(function(res){
      return res.stdout === '<div class="body"><p>A para­graph.</p></div>' + EOL;
    });
  });
  test('include custom macros', function(){
    var tmpfile, macroCode;
    tmpfile = tmp.fileSync();
    macroCode = fs.readFileSync('test/api/CustomMacros.js', 'utf8');
    fs.writeSync(tmpfile.fd, macroCode);
    return expect(latexjs.execute(['-b', '-m', tmpfile.name], ["A \\myMacro[custom] macro."])).to.eventually.be.fulfilled.and.to.satisfy(function(res){
      return res.stdout === '<div class="body"><p>A -cus­tom- macro.</p></div>' + EOL;
    });
  });
});