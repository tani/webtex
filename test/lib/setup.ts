var fs, util, chai, http, serveHandler, puppeteer, pixelmatch, PNG, cPage, fPage, server, testHtmlPage;
fs = require('fs');
util = require('util');
chai = require('chai');
http = require('http');
serveHandler = require('serve-handler');
puppeteer = require('puppeteer');
pixelmatch = require('pixelmatch').default;
PNG = require('pngjs').PNG;
chai.use(require('chai-as-promised'));
global.expect = chai.expect;
global.test = it;
before(async function(){
  var listen;
  global.chrome = (await puppeteer.launch({
    devtools: false,
    dumpio: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files'],
    defaultViewport: {
      width: 1000,
      height: 0,
      deviceScaleFactor: 2
    }
  }));
  try {
    global.firefox = (await puppeteer.launch({
      product: 'firefox',
      executablePath: '/opt/firefox/firefox',
      headless: true,
      devtools: false,
      dumpio: false,
      defaultViewport: {
        width: 1000,
        height: 0,
        deviceScaleFactor: 2
      }
    }));
  } catch (error) {
    console.warn('Firefox not available, skipping Firefox tests');
    global.firefox = null;
  }
  cPage = (await chrome.pages())[0];
  if (firefox) {
    fPage = (await firefox.pages())[0];
  } else {
    fPage = null;
  }
  cPage.on('console', function(msg){
    if (msg._type === 'error') {
      return console.error("Error in chrome: ", msg._text);
    }
  });
  if (fPage) {
    fPage.on('console', function(msg){
      if (msg._type === 'error') {
        return console.error("Error in firefox: ", msg._text);
      }
    });
  }
  server = http.createServer(async function(request, response){
    if (request.url === "/") {
      response.writeHead(200, {
        'Content-Type': 'text/html'
      });
      response.end(testHtmlPage);
    } else {
      (await serveHandler(request, response, {
        'public': process.cwd() + "/dist",
        redirects: [
          {
            source: "/dist/:file",
            destination: "/:file"
          }, {
            source: "/dist/:dir/:file",
            destination: "/:dir/:file"
          }
        ]
      }));
    }
  });
  listen = util.promisify(server.listen.bind(server));
  (await listen({
    host: 'localhost',
    port: 0,
    exclusive: true
  }));
});
after(async function(){
  (await chrome.close());
  if (firefox) {
    (await firefox.close());
  }
  server.close();
});
function compareScreenshots(filename){
  var png1, png2, diff, dfpx;
  if (fs.existsSync(filename + '.png')) {
    png1 = PNG.sync.read(fs.readFileSync(filename + '.png'));
    png2 = PNG.sync.read(fs.readFileSync(filename + '.new.png'));
    diff = new PNG({
      width: png1.width,
      height: png1.height
    });
    dfpx = pixelmatch(png1.data, png2.data, diff.data, png1.width, png1.height, {
      threshold: 0,
      diffColorAlt: [0, 255, 0]
    });
    fs.writeFileSync(filename + '.diff.png', PNG.sync.write(diff));
    if (dfpx > 0) {
      throw new Error("screenshots differ by " + dfpx + " pixels - see " + (filename + '.*.png'));
    } else {
      fs.unlinkSync(filename + '.new.png');
      return fs.unlinkSync(filename + '.diff.png');
    }
  } else {
    return fs.renameSync(filename + '.new.png', filename + '.png');
  }
}
global.takeScreenshot = async function(html, filename){
  var cfile, ffile;
  testHtmlPage = html;
  (await cPage.goto('http://localhost:' + server.address().port));
  (await cPage.addStyleTag({
    content: ".body { border: .4px solid; height: max-content; }"
  }));
  cfile = filename + ".ch";
  (await cPage.screenshot({
    omitBackground: true,
    fullPage: false,
    captureBeyondViewport: false,
    path: cfile + '.new.png'
  }));
  compareScreenshots(cfile);
  
  if (fPage) {
    (await fPage.goto('http://localhost:' + server.address().port));
    (await fPage.addStyleTag({
      content: ".body { border: .4px solid; height: max-content; }"
    }));
    ffile = filename + ".ff";
    (await fPage.screenshot({
      path: ffile + '.new.png'
    }));
    compareScreenshots(ffile);
  }
  testHtmlPage = "";
};