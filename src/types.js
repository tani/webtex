var makeLengthClass,export$;
export { makeLengthClass }
export { export$ as Vector }
var Vector;
makeLengthClass = function(generator){
  return (function(){
    var g, unitsSp, prototype = constructor.prototype;
    g = generator;
    constructor.prototype._value = 0;
    constructor.prototype._unit = "";
    unitsSp = new Map([["sp", 1], ["pt", 65536], ["bp", 65536 * 72.27 / 72], ["pc", 65536 * 12], ["dd", 65536 * 1238 / 1157], ["cc", 65536 * 1238 / 1157 * 12], ["in", 65536 * 72.27], ["px", 65536 * 72.27 / 96], ["mm", 65536 * 7227 / 2540], ["cm", 65536 * 7227 / 254]]);
    constructor.zero = new constructor(0, "sp");
    function constructor(value, unit){
      if (!typeof value === "number") {
        g.error("Length CTOR: value needs to be a number!");
      }
      this._value = value;
      this._unit = unit;
      if (unitsSp.has(unit)) {
        this._value = value * unitsSp.get(unit);
        this._unit = "sp";
      }
    }
    Object.defineProperty(constructor.prototype, 'value', {
      get: function(){
        if (this._unit === "sp") {
          return g.round(this._value / unitsSp.get("px")) + "px";
        } else {
          return g.round(this._value) + this._unit;
        }
      },
      configurable: true,
      enumerable: true
    });
    Object.defineProperty(constructor.prototype, 'px', {
      get: function(){
        if (this._unit === "sp") {
          return g.round(this._value / unitsSp.get("px"));
        } else {
          return g.error("Length.px() called on relative length!");
        }
      },
      configurable: true,
      enumerable: true
    });
    Object.defineProperty(constructor.prototype, 'pxpct', {
      get: function(){
        if (this._unit === "sp") {
          return g.round(this._value / unitsSp.get("px"));
        } else {
          return g.round(this._value) + this._unit;
        }
      },
      configurable: true,
      enumerable: true
    });
    Object.defineProperty(constructor.prototype, 'unit', {
      get: function(){
        return this._unit;
      },
      configurable: true,
      enumerable: true
    });
    constructor.prototype.cmp = function(l){
      if (this._unit !== l._unit) {
        g.error("Length.cmp(): incompatible lengths! (" + this._unit + " and " + l._unit + ")");
      }
      if (this._value < l._value) {
        return -1;
      }
      if (this._value === l._value) {
        return 0;
      }
      return 1;
    };
    constructor.prototype.add = function(l){
      if (this._unit !== l._unit) {
        g.error("Length.add(): incompatible lengths! (" + this._unit + " and " + l._unit + ")");
      }
      return new g.Length(this._value + l._value, this._unit);
    };
    constructor.prototype.sub = function(l){
      if (this._unit !== l._unit) {
        g.error("Length.sub: incompatible lengths! (" + this._unit + " and " + l._unit + ")");
      }
      return new g.Length(this._value - l._value, this._unit);
    };
    constructor.prototype.mul = function(s){
      return new g.Length(this._value * s, this._unit);
    };
    constructor.prototype.div = function(s){
      return new g.Length(this._value / s, this._unit);
    };
    constructor.prototype.abs = function(){
      return new g.Length(Math.abs(this._value), this._unit);
    };
    constructor.prototype.ratio = function(l){
      if (this._unit !== l._unit) {
        g.error("Length.ratio: incompatible lengths! (" + this._unit + " and " + l._unit + ")");
      }
      return this._value / l._value;
    };
    constructor.prototype.norm = function(l){
      if (this._unit !== l._unit) {
        g.error("Length.norm: incompatible lengths! (" + this._unit + " and " + l._unit + ")");
      }
      return new g.Length(Math.sqrt(Math.pow(this._value, 2) + Math.pow(l._value, 2)), this._unit);
    };
    constructor.min = function(){
      return Array.from(arguments).reduce(function(a, b){
        if (a.cmp(b) < 0) {
          return a;
        } else {
          return b;
        }
      });
    };
    constructor.max = function(){
      return Array.from(arguments).reduce(function(a, b){
        if (a.cmp(b) > 0) {
          return a;
        } else {
          return b;
        }
      });
    };
    return constructor;
  }());
};
export$ = Vector = (function(){
  Vector.displayName = 'Vector';
  var prototype = Vector.prototype, constructor = Vector;
  Vector.prototype._x = null;
  Vector.prototype._y = null;
  function Vector(x, y){
    this._x = x;
    this._y = y;
  }
  Object.defineProperty(Vector.prototype, 'x', {
    get: function(){
      return this._x;
    },
    configurable: true,
    enumerable: true
  });
  Object.defineProperty(Vector.prototype, 'y', {
    get: function(){
      return this._y;
    },
    configurable: true,
    enumerable: true
  });
  Vector.prototype.add = function(v){
    return new Vector(this._x.add(v.x), this._y.add(v.y));
  };
  Vector.prototype.sub = function(v){
    return new Vector(this._x.sub(v.x), this._y.sub(v.y));
  };
  Vector.prototype.mul = function(s){
    return new Vector(this._x.mul(s), this._y.mul(s));
  };
  Vector.prototype.shift_start = function(l){
    var x, y, msq, imsq, dir_x, dir_y, sx, sy;
    if (this._x.unit !== this._y.unit) {
      throw new Error("Vector.shift_start: incompatible lengths! (" + this._x.unit + " and " + this._y.unit + ")");
    }
    x = this._x._value;
    y = this._y._value;
    msq = Math.sqrt(1 + y * y / (x * x));
    imsq = Math.sqrt(1 + x * x / (y * y));
    dir_x = x < 0 ? -1 : 1;
    dir_y = y < 0 ? -1 : 1;
    if (x !== 0 && y !== 0) {
      sx = l.div(msq).mul(-dir_x);
      sy = l.div(imsq).mul(-dir_y);
    } else if (y === 0) {
      sx = l.mul(-dir_x);
      sy = this._y.mul(0);
    } else {
      sx = this._x.mul(0);
      sy = l.mul(-dir_y);
    }
    return new Vector(sx, sy);
  };
  Vector.prototype.shift_end = function(l){
    var x, y, msq, imsq, dir_x, dir_y, ex, ey;
    if (this._x.unit !== this._y.unit) {
      throw new Error("Vector.shift_end: incompatible lengths! (" + this._x.unit + " and " + this._y.unit + ")");
    }
    x = this._x._value;
    y = this._y._value;
    msq = Math.sqrt(1 + y * y / (x * x));
    imsq = Math.sqrt(1 + x * x / (y * y));
    dir_x = x < 0 ? -1 : 1;
    dir_y = y < 0 ? -1 : 1;
    if (x !== 0 && y !== 0) {
      ex = this._x.add(l.div(msq).mul(dir_x));
      ey = this._y.add(l.div(imsq).mul(dir_y));
    } else if (y === 0) {
      ex = this._x.add(l.mul(dir_x));
      ey = this._y;
    } else {
      ex = this._x;
      ey = this._y.add(l.mul(dir_y));
    }
    return new Vector(ex, ey);
  };
  Vector.prototype.norm = function(){
    return this._x.norm(this._y);
  };
  return Vector;
}());