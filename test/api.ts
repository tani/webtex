'use strict';
var path, fs, spawnProcess, EOL;
path = require('path');
fs = require('fs').promises;
spawnProcess = require('child_process').spawn;
EOL = require('os').EOL;
describe('LaTeX.js API test', function(){
  test('node legacy module API', function(){
    var node;
    node = spawnProcess('node', [path.join(__dirname, 'api/node.js')], {
      env: {
        PATH: process.env.PATH
      }
    });
    return expect(new Promise(function(resolve, reject){
      var stdout, stderr;
      stdout = "";
      stderr = "";
      node.stdout.on('data', function(data){
        return stdout += data.toString();
      });
      node.stderr.on('data', function(data){
        return stderr += data.toString();
      });
      node.on('exit', function(code, signal){
        if (code === 0) {
          return resolve(stdout);
        } else {
          return reject(stderr);
        }
      });
      return node.on('error', function(err){
        node.removeAllListeners('exit');
        return reject(err);
      });
    })).to.eventually.equal('<html style="--size: 13.284px; --textwidth: 56.162%; --marginleftwidth: 21.919%; --marginrightwidth: 21.919%; --marginparwidth: 48.892%; --marginparsep: 14.612px; --marginparpush: 6.642px;"><head><title>untitled</title><meta charset="UTF-8"></meta><link type="text/css" rel="stylesheet" href="css/katex.css"><link type="text/css" rel="stylesheet" href="css/article.css"><script src="js/base.js"></script></head><body><div class="body"><p>Hi, this is a line of text.</p></div></body></html>' + EOL);
  });
  test('node ES6 module API', function(){
    var node;
    node = spawnProcess('node', [path.join(__dirname, 'api/node.mjs')], {
      env: {
        PATH: process.env.PATH
      }
    });
    return expect(new Promise(function(resolve, reject){
      var stdout, stderr;
      stdout = "";
      stderr = "";
      node.stdout.on('data', function(data){
        return stdout += data.toString();
      });
      node.stderr.on('data', function(data){
        return stderr += data.toString();
      });
      node.on('exit', function(code, signal){
        if (code === 0) {
          return resolve(stdout);
        } else {
          return reject(stderr);
        }
      });
      return node.on('error', function(err){
        node.removeAllListeners('exit');
        return reject(err);
      });
    })).to.eventually.equal('<html style="--size: 13.284px; --textwidth: 56.162%; --marginleftwidth: 21.919%; --marginrightwidth: 21.919%; --marginparwidth: 48.892%; --marginparsep: 14.612px; --marginparpush: 6.642px;"><head><title>untitled</title><meta charset="UTF-8"></meta><link type="text/css" rel="stylesheet" href="css/katex.css"><link type="text/css" rel="stylesheet" href="css/article.css"><script src="js/base.js"></script></head><body><div class="body"><p>Hi, this is a line of text.</p></div></body></html>' + EOL);
  });
  test('browser API', async function(){
    var page;
    page = (await chrome.newPage());
    (await page.goto('file://' + path.join(__dirname, 'api/browser.html')));
    expect((await page.$eval('.body', function(node){
      return node.outerHTML;
    }))).to.equal('<div class="body"><p>Hi, this is a line of text.</p></div>');
    return (await page.close());
  });
  test('web component API', async function(){
    var data;
    data = (await fs.readFile(path.join(__dirname, 'api/webcomponent.html'), 'utf8'));
    return (await takeScreenshot(data, path.join(__dirname, 'screenshots/webcomponent')));
  });
  test('web component module API', async function(){
    var data;
    data = (await fs.readFile(path.join(__dirname, 'api/webcomponent.module.html'), 'utf8'));
    return (await takeScreenshot(data, path.join(__dirname, 'screenshots/webcomponent')));
  });
});