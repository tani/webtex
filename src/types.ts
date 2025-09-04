interface LengthGenerator {
  error(message: string): any;
  round(value: number): number;
  Length: any;
}

const makeLengthClass = (generator: LengthGenerator) => {
  const g = generator;
  
  const unitsSp = new Map([
    ["sp", 1], 
    ["pt", 65536], 
    ["bp", 65536 * 72.27 / 72], 
    ["pc", 65536 * 12], 
    ["dd", 65536 * 1238 / 1157], 
    ["cc", 65536 * 1238 / 1157 * 12], 
    ["in", 65536 * 72.27], 
    ["px", 65536 * 72.27 / 96], 
    ["mm", 65536 * 7227 / 2540], 
    ["cm", 65536 * 7227 / 254]
  ]);

  class Length {
    _value: number = 0;
    _unit: string = "";
    static zero: Length;

    constructor(value: number, unit: string) {
      if (typeof value !== "number") {
        g.error("Length CTOR: value needs to be a number!");
      }
      this._value = value;
      this._unit = unit;
      if (unitsSp.has(unit)) {
        this._value = value * unitsSp.get(unit)!;
        this._unit = "sp";
      }
    }

    get value(): string {
      if (this._unit === "sp") {
        return g.round(this._value / unitsSp.get("px")!) + "px";
      } else {
        return g.round(this._value) + this._unit;
      }
    }

    get px(): number {
      if (this._unit === "sp") {
        return g.round(this._value / unitsSp.get("px")!);
      } else {
        return g.error("Length.px() called on relative length!");
      }
    }

    get pxpct(): string | number {
      if (this._unit === "sp") {
        return g.round(this._value / unitsSp.get("px")!);
      } else {
        return g.round(this._value) + this._unit;
      }
    }

    get unit(): string {
      return this._unit;
    }

    cmp(l: Length): number {
      if (this._unit !== l._unit) {
        g.error(`Length.cmp(): incompatible lengths! (${this._unit} and ${l._unit})`);
      }
      if (this._value < l._value) {
        return -1;
      }
      if (this._value === l._value) {
        return 0;
      }
      return 1;
    }

    add(l: Length): Length {
      if (this._unit !== l._unit) {
        g.error(`Length.add(): incompatible lengths! (${this._unit} and ${l._unit})`);
      }
      return new g.Length(this._value + l._value, this._unit);
    }

    sub(l: Length): Length {
      if (this._unit !== l._unit) {
        g.error(`Length.sub: incompatible lengths! (${this._unit} and ${l._unit})`);
      }
      return new g.Length(this._value - l._value, this._unit);
    }

    mul(s: number): Length {
      return new g.Length(this._value * s, this._unit);
    }

    div(s: number): Length {
      return new g.Length(this._value / s, this._unit);
    }

    abs(): Length {
      return new g.Length(Math.abs(this._value), this._unit);
    }

    ratio(l: Length): number {
      if (this._unit !== l._unit) {
        g.error(`Length.ratio: incompatible lengths! (${this._unit} and ${l._unit})`);
      }
      return this._value / l._value;
    }

    norm(l: Length): Length {
      if (this._unit !== l._unit) {
        g.error(`Length.norm: incompatible lengths! (${this._unit} and ${l._unit})`);
      }
      return new g.Length(Math.sqrt(Math.pow(this._value, 2) + Math.pow(l._value, 2)), this._unit);
    }

    static min(...lengths: Length[]): Length {
      return lengths.reduce((a, b) => a.cmp(b) < 0 ? a : b);
    }

    static max(...lengths: Length[]): Length {
      return lengths.reduce((a, b) => a.cmp(b) > 0 ? a : b);
    }
  }

  Length.zero = new Length(0, "sp");
  return Length;
};
interface VectorLength {
  unit: string;
  _value: number;
  add(other: VectorLength): VectorLength;
  sub(other: VectorLength): VectorLength;
  mul(scalar: number): VectorLength;
  div(scalar: number): VectorLength;
  norm(other: VectorLength): VectorLength;
}

class Vector {
  _x: VectorLength;
  _y: VectorLength;

  constructor(x: VectorLength, y: VectorLength) {
    this._x = x;
    this._y = y;
  }

  get x(): VectorLength {
    return this._x;
  }

  get y(): VectorLength {
    return this._y;
  }

  add(v: Vector): Vector {
    return new Vector(this._x.add(v.x), this._y.add(v.y));
  }

  sub(v: Vector): Vector {
    return new Vector(this._x.sub(v.x), this._y.sub(v.y));
  }

  mul(s: number): Vector {
    return new Vector(this._x.mul(s), this._y.mul(s));
  }

  shift_start(l: VectorLength): Vector {
    if (this._x.unit !== this._y.unit) {
      throw new Error(`Vector.shift_start: incompatible lengths! (${this._x.unit} and ${this._y.unit})`);
    }
    
    const x = this._x._value;
    const y = this._y._value;
    const msq = Math.sqrt(1 + y * y / (x * x));
    const imsq = Math.sqrt(1 + x * x / (y * y));
    const dir_x = x < 0 ? -1 : 1;
    const dir_y = y < 0 ? -1 : 1;
    
    let sx: VectorLength;
    let sy: VectorLength;
    
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
  }

  shift_end(l: VectorLength): Vector {
    if (this._x.unit !== this._y.unit) {
      throw new Error(`Vector.shift_end: incompatible lengths! (${this._x.unit} and ${this._y.unit})`);
    }
    
    const x = this._x._value;
    const y = this._y._value;
    const msq = Math.sqrt(1 + y * y / (x * x));
    const imsq = Math.sqrt(1 + x * x / (y * y));
    const dir_x = x < 0 ? -1 : 1;
    const dir_y = y < 0 ? -1 : 1;
    
    let ex: VectorLength;
    let ey: VectorLength;
    
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
  }

  norm(): VectorLength {
    return this._x.norm(this._y);
  }
}

export { makeLengthClass, Vector };