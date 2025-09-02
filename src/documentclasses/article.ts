import { Base } from './base';

interface ArticleConstructor {
  (generator: any, options: any): void;
  css: string;
  args: any;
  superclass?: any;
  prototype: any;
}

var export$;
export { export$ as Article }
var Article: ArticleConstructor;
export$ = Article = (function(superclass){
  var args, prototype = extend$((import$(Article, superclass).displayName = 'Article', Article), superclass).prototype, constructor = Article;
  Article.css = "css/article.css";
  function Article(generator, options){
    (Article as any).superclass.apply(this, arguments);
    this.g.setCounter('secnumdepth', 3);
    this.g.setCounter('tocdepth', 3);
  }
  args = Article.args = Base.args;
  Article.prototype['refname'] = function(){
    return ["References"];
  };
  args['tableofcontents'] = ['V'];
  Article.prototype['tableofcontents'] = function(){
    return this.section(true, undefined, this.g.macro('contentsname')).concat([this.g._toc]);
  };
  args['abstract'] = ['V'];
  Article.prototype['abstract'] = function(){
    var head;
    this.g.setFontSize("small");
    this.g.enterGroup();
    this.g.setFontWeight("bf");
    head = this.g.create(this.g.list, this.g.macro("abstractname"), "center");
    this.g.exitGroup();
    return [head].concat(this.quotation());
  };
  Article.prototype['endabstract'] = function(){
    this.endquotation();
  };
  args['appendix'] = ['V'];
  Article.prototype['appendix'] = function(){
    this.g.setCounter('section', 0);
    this.g.setCounter('subsection', 0);
    this['thesection'] = function(){
      return [this.g.Alph(this.g.counter('section'))];
    };
  };
  return Article;
}(Base));
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