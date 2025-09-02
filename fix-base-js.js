const fs = require('fs');

let content = fs.readFileSync('src/js/base.js', 'utf8');

// Fix function declarations
content = content.replace(/^_vertical\(/gm, 'function _vertical(');
content = content.replace(/^offsetTop\(/gm, 'function offsetTop(');  
content = content.replace(/^offsetLeft\(/gm, 'function offsetLeft(');
content = content.replace(/^_top\(/gm, 'function _top(');
content = content.replace(/^_left\(/gm, 'function _left(');
content = content.replace(/^_right\(/gm, 'function _right(');
content = content.replace(/^_bottom\(/gm, 'function _bottom(');
content = content.replace(/^processElementsQueue\(/gm, 'function processElementsQueue(');
content = content.replace(/^processMarginPars\(/gm, 'function processMarginPars(');
content = content.replace(/^_shiftElementsInternal\(/gm, 'function _shiftElementsInternal(');
content = content.replace(/^lazyProcess\(/gm, 'function lazyProcess(');
content = content.replace(/^offsetBottom\(/gm, 'function offsetBottom(');
content = content.replace(/^offsetBaseline\(/gm, 'function offsetBaseline(');

fs.writeFileSync('src/js/base.js', content, 'utf8');
console.log('Fixed base.js function declarations');