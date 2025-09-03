'use strict';
var createHTMLWindow, path, fs, he, slugify, spawnChild, ref$, parse, HtmlGenerator, decache, htmlBeautify, loadFixture, registerWindow, subdirs;
createHTMLWindow = require('svgdom').createHTMLWindow;
global.window = createHTMLWindow();
global.document = window.document;
path = require('path');
fs = require('fs');
he = require('he');
slugify = require('slugify');
spawnChild = require('child_process').spawn;
ref$ = require('../dist/latex'), parse = ref$.parse, HtmlGenerator = ref$.HtmlGenerator;
decache = require('decache');
htmlBeautify = require('js-beautify').html;
loadFixture = require('./lib/load-fixtures').load;
registerWindow = require('@svgdotjs/svg.js').registerWindow;
function resetSvgIds(){
  decache('@svgdotjs/svg.js');
  delete HtmlGenerator.prototype.SVG;
  HtmlGenerator.prototype.SVG = require('@svgdotjs/svg.js').SVG;
  return registerWindow(window, document);
}
subdirs = [];
describe('LaTeX.js fixtures', function(){
  var fixturesPath;
  fixturesPath = path.join(__dirname, 'fixtures');
  fs.readdirSync(fixturesPath).forEach(function(name){
    var fixtureFile, stat;
    fixtureFile = path.join(fixturesPath, name);
    stat = fs.statSync(fixtureFile);
    if (stat.isDirectory()) {
      subdirs.push(name);
      return;
    }
    return describe(name, function(){
      loadFixture(fixtureFile).fixtures.forEach(function(fixture){
        runFixture(fixture, name);
      });
    });
  });
  subdirs.forEach(function(dir){
    describe(dir, function(){
      fs.readdirSync(path.join(fixturesPath, dir)).forEach(function(name){
        describe(name, function(){
          var fixtureFile;
          fixtureFile = path.join(fixturesPath, dir, name);
          loadFixture(fixtureFile).fixtures.forEach(function(fixture){
            runFixture(fixture, dir + " - " + name);
          });
        });
      });
    });
  });
});
function runFixture(fixture, name){
  var _test, ref$, ref1$, ref2$, screenshot;
  _test = test;
  if (((ref$ = fixture.header) != null ? ref$.charAt(0) : void 8) === "!") {
    _test = test.skip;
    fixture.header = fixture.header.substr(1);
  } else if (((ref1$ = fixture.header) != null ? ref1$.charAt(0) : void 8) === "+") {
    _test = test.only;
    fixture.header = fixture.header.substr(1);
  }
  if (((ref2$ = fixture.header) != null ? ref2$.charAt(0) : void 8) === "s") {
    screenshot = true;
    fixture.header = fixture.header.substr(1);
  }
  _test(fixture.header || 'fixture number ' + fixture.id, function(){
    var generator, div, htmlIs, htmlShould, e, filename;
    resetSvgIds();
    try {
      generator = parse(fixture.source, {
        generator: new HtmlGenerator({
          hyphenate: false
        })
      });
      div = document.createElement('div');
      div.appendChild(generator.domFragment().cloneNode(true));
      htmlIs = div.innerHTML;
      htmlShould = fixture.result;
    } catch (e$) {
      e = e$;
      if (e.location) {
        e.message = (e.message + " at line " + e.location.start.line + " (column " + e.location.start.column + "): ") + fixture.source.split(/\r\n|\n|\r/)[e.location.start.line - 1];
      }
      throw e;
    }
    htmlIs = he.decode(htmlIs.replace(/\r\n|\n|\r/g, ""));
    htmlShould = he.decode(htmlShould.replace(/\r\n|\n|\r/g, ""));
    
    // Normalize SVG marker and clipPath IDs for consistent testing
    htmlIs = htmlIs.replace(/SvgjsMarker\d+/g, 'SvgjsMarkerNORM');
    htmlShould = htmlShould.replace(/SvgjsMarker\d+/g, 'SvgjsMarkerNORM');
    htmlIs = htmlIs.replace(/SvgjsClipPath\d+/g, 'SvgjsClipPathNORM');
    htmlShould = htmlShould.replace(/SvgjsClipPath\d+/g, 'SvgjsClipPathNORM');
    if (htmlIs !== htmlShould) {
      filename = path.join(__dirname, 'html', slugify(name + ' ' + fixture.header, {
        remove: /[*+~()'"!:@,{}\\]/g
      }));
      try {
        fs.mkdirSync(path.dirname(filename));
      } catch (e$) {}
      fs.writeFileSync(filename, htmlIs);
    }
    expect(htmlIs).to.equal(htmlShould);
  });
  if (screenshot) {
    return _test('   - screenshot', async function(){
      var htmlDoc, favicon, filename;
      resetSvgIds();
      htmlDoc = parse(fixture.source, {
        generator: new HtmlGenerator({
          hyphenate: false
        })
      }).htmlDocument();
      favicon = document.createElement("link");
      favicon.rel = "icon";
      favicon.href = "data:;base64,iVBORw0KGgo=";
      htmlDoc.head.appendChild(favicon);
      filename = path.join(__dirname, 'screenshots', slugify(name + ' ' + fixture.header, {
        remove: /[*+~()'"!:@,{}\\]/g
      }));
      return (await takeScreenshot(htmlDoc.documentElement.outerHTML, filename));
    });
  }
}
function latexScreenshot(source, filename){
  var process, stdout, stderr;
  process = spawnChild(path.join(__dirname, 'latex2png.sh'), [filename + ".latex.png"]);
  stdout = "";
  stderr = "";
  process.stdout.on('data', function(data){
    return stdout += data.toString();
  });
  process.stderr.on('data', function(data){
    return stderr += data.toString();
  });
  process.on('exit', function(code, signal){
    if (code !== 0) {
      console.warn("latex screenshot failed: " + code);
      return console.log("#### std err output: " + stderr);
    }
  });
  process.on('error', function(err){
    process.removeAllListeners('exit');
    return console.warn("latex screenshot failed: " + err);
  });
  process.stdin.write(source);
  return process.stdin.end();
}