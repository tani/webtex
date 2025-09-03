export const makeLengthClass = function(generator: any) {
  return class Length {
    static zero: any;
    
    static unitsSp = new Map([
      ["sp", 1], ["pt", 65536], ["bp", 65536 * 72.27 / 72], 
      ["pc", 65536 * 12], ["dd", 65536 * 1238 / 1157], 
      ["cc", 65536 * 1238 / 1157 * 12], ["in", 65536 * 72.27], 
      ["px", 65536 * 72.27 / 96], ["mm", 65536 * 7227 / 2540], 
      ["cm", 65536 * 7227 / 254]
    ]);
    
    private _value: number = 0;
    private _unit: string = "";
    
    constructor(value: number, unit: string) {
      if (typeof value !== "number") {
        generator.error("Length CTOR: value needs to be a number!");
      }
      this._value = value;
      this._unit = unit;
      if (Length.unitsSp.has(unit)) {
        this._value = value * Length.unitsSp.get(unit)!;
        this._unit = "sp";
      }
    }
    get value(): string {
      if (this._unit === "sp") {
        return generator.round(this._value / Length.unitsSp.get("px")!) + "px";
      } else {
        return generator.round(this._value) + this._unit;
      }
    }
    
    get px(): number {
      if (this._unit === "sp") {
        return generator.round(this._value / Length.unitsSp.get("px")!);
      } else {
        return generator.error("Length.px() called on relative length!");
      }
    }
    
    get pxpct(): string | number {
      if (this._unit === "sp") {
        return generator.round(this._value / Length.unitsSp.get("px")!);
      } else {
        return generator.round(this._value) + this._unit;
      }
    }
    
    get unit(): string {
      return this._unit;
    }
    cmp(l: any): number {
      if (this._unit !== l._unit) {
        generator.error("Length.cmp(): incompatible lengths! (" + this._unit + " and " + l._unit + ")");
      }
      if (this._value < l._value) {
        return -1;
      }
      if (this._value === l._value) {
        return 0;
      }
      return 1;
    }
    
    add(l: any): any {
      if (this._unit !== l._unit) {
        generator.error("Length.add(): incompatible lengths! (" + this._unit + " and " + l._unit + ")");
      }
      return new generator.Length(this._value + l._value, this._unit);
    }
    
    sub(l: any): any {
      if (this._unit !== l._unit) {
        generator.error("Length.sub: incompatible lengths! (" + this._unit + " and " + l._unit + ")");
      }
      return new generator.Length(this._value - l._value, this._unit);
    }
    
    mul(s: number): any {
      return new generator.Length(this._value * s, this._unit);
    }
    
    div(s: number): any {
      return new generator.Length(this._value / s, this._unit);
    }
    
    abs(): any {
      return new generator.Length(Math.abs(this._value), this._unit);
    }
    
    ratio(l: any): number {
      if (this._unit !== l._unit) {
        generator.error("Length.ratio: incompatible lengths! (" + this._unit + " and " + l._unit + ")");
      }
      return this._value / l._value;
    }
    
    norm(l: any): any {
      if (this._unit !== l._unit) {
        generator.error("Length.norm: incompatible lengths! (" + this._unit + " and " + l._unit + ")");
      }
      return new generator.Length(Math.sqrt(Math.pow(this._value, 2) + Math.pow(l._value, 2)), this._unit);
    }
    static min(...lengths: any[]): any {
      return lengths.reduce((a, b) => {
        if (a.cmp(b) < 0) {
          return a;
        } else {
          return b;
        }
      });
    }
    
    static max(...lengths: any[]): any {
      return lengths.reduce((a, b) => {
        if (a.cmp(b) > 0) {
          return a;
        } else {
          return b;
        }
      });
    }
  };
  
  // Initialize static zero property after class definition
  (Length as any).zero = new Length(0, "sp");
  return Length;
};
export class Vector {
  static displayName = 'Vector';
  
  private _x: any = null;
  private _y: any = null;
  
  constructor(x: any, y: any) {
    this._x = x;
    this._y = y;
  }
  
  get x(): any {
    return this._x;
  }
  
  get y(): any {
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
  
  shift_start(l: any): Vector {
    if (this._x.unit !== this._y.unit) {
      throw new Error("Vector.shift_start: incompatible lengths! (" + this._x.unit + " and " + this._y.unit + ")");
    }
    const x = this._x._value;
    const y = this._y._value;
    const msq = Math.sqrt(1 + y * y / (x * x));
    const imsq = Math.sqrt(1 + x * x / (y * y));
    const dir_x = x < 0 ? -1 : 1;
    const dir_y = y < 0 ? -1 : 1;
    let sx: any, sy: any;
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
  
  shift_end(l: any): Vector {
    if (this._x.unit !== this._y.unit) {
      throw new Error("Vector.shift_end: incompatible lengths! (" + this._x.unit + " and " + this._y.unit + ")");
    }
    const x = this._x._value;
    const y = this._y._value;
    const msq = Math.sqrt(1 + y * y / (x * x));
    const imsq = Math.sqrt(1 + x * x / (y * y));
    const dir_x = x < 0 ? -1 : 1;
    const dir_y = y < 0 ? -1 : 1;
    let ex: any, ey: any;
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
  
  norm(): any {
    return this._x.norm(this._y);
  }
}