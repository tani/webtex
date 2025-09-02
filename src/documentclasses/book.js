import { Report } from './report';
var export$;
export { export$ as Book }
var Book;
export$ = Book = (function(superclass){
  var args, x$, y$, prototype = extend$((import$(Book, superclass).displayName = 'Book', Book), superclass).prototype, constructor = Book;
  Book.css = "css/book.css";
  function Book(generator, options){
    Book.superclass.apply(this, arguments);
    this['@mainmatter'] = true;
  }
  args = Book.args = Report.args;
  x$ = args;
  x$['part'] = x$['chapter'] = ['V', 's', 'X', 'o?', 'g'];
  Book.prototype['chapter'] = function(s, toc, ttl){
    return [this.g.startsection('chapter', 0, s || !this["@mainmatter"], toc, ttl)];
  };
  y$ = args;
  y$['frontmatter'] = y$['mainmatter'] = y$['backmatter'] = ['V'];
  Book.prototype['frontmatter'] = function(){
    this['@mainmatter'] = false;
  };
  Book.prototype['mainmatter'] = function(){
    this['@mainmatter'] = true;
  };
  Book.prototype['backmatter'] = function(){
    this['@mainmatter'] = false;
  };
  return Book;
}(Report));
function extend$(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}