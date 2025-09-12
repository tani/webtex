interface LengthLike {
  _value: number;
  unit: string;
  add(other: LengthLike): LengthLike;
  sub(other: LengthLike): LengthLike;
  mul(scalar: number): LengthLike;
  div(scalar: number): LengthLike;
  norm(other: LengthLike): LengthLike;
}

interface LengthConstructor {
  new (value: number, unit: string): LengthLike;
  zero: LengthLike;
}

interface LengthGenerator {
  error(message: string): unknown;
  round(value: number): number;
  Length: LengthConstructor;
}

const makeLengthClass = (generator: LengthGenerator): LengthConstructor => {
  const g = generator;

  const unitsSp = new Map([
    ["sp", 1],
    ["pt", 65536],
    ["bp", (65536 * 72.27) / 72],
    ["pc", 65536 * 12],
    ["dd", (65536 * 1238) / 1157],
    ["cc", ((65536 * 1238) / 1157) * 12],
    ["in", 65536 * 72.27],
    ["px", (65536 * 72.27) / 96],
    ["mm", (65536 * 7227) / 2540],
    ["cm", (65536 * 7227) / 254],
  ]);

  class Length implements LengthLike {
    public _value: number = 0;
    public _unit: string = "";
    static zero: Length;

    constructor(value: number, unit: string) {
      if (typeof value !== "number") {
        g.error("Length CTOR: value needs to be a number!");
      }
      this._value = value;
      this._unit = unit;

      // Convert to scaled points if possible
      const unitValue = unitsSp.get(unit);
      if (unitValue !== undefined) {
        this._value = value * unitValue;
        this._unit = "sp";
      }
    }

    public toPx(): number {
      if (this._unit !== "sp") {
        g.error("Length.toPx() called on relative length!");
      }
      const pxValue = unitsSp.get("px");
      if (pxValue === undefined) {
        throw new Error("px unit conversion not found");
      }
      return g.round(this._value / pxValue);
    }

    public assertCompatible(other: Length, operation: string): void {
      if (this._unit !== other._unit) {
        g.error(
          `Length.${operation}: incompatible lengths! (${this._unit} and ${other._unit})`,
        );
      }
    }

    get value(): string {
      return this._unit === "sp"
        ? `${this.toPx()}px`
        : `${g.round(this._value)}${this._unit}`;
    }

    get px(): number {
      return this.toPx();
    }

    get pxpct(): string | number {
      return this._unit === "sp"
        ? this.toPx()
        : `${g.round(this._value)}${this._unit}`;
    }

    get unit(): string {
      return this._unit;
    }

    cmp(other: Length): number {
      this.assertCompatible(other, "cmp");
      return Math.sign(this._value - other._value);
    }

    add(other: Length): Length {
      this.assertCompatible(other, "add");
      return new Length(this._value + other._value, this._unit);
    }

    sub(other: Length): Length {
      this.assertCompatible(other, "sub");
      return new Length(this._value - other._value, this._unit);
    }

    mul(scalar: number): Length {
      return new Length(this._value * scalar, this._unit);
    }

    div(scalar: number): Length {
      return new Length(this._value / scalar, this._unit);
    }

    abs(): Length {
      return new Length(Math.abs(this._value), this._unit);
    }

    ratio(other: Length): number {
      this.assertCompatible(other, "ratio");
      return this._value / other._value;
    }

    norm(other: Length): Length {
      this.assertCompatible(other, "norm");
      return new Length(
        Math.sqrt(this._value ** 2 + other._value ** 2),
        this._unit,
      );
    }

    static min(...lengths: Length[]): Length {
      return lengths.reduce((a, b) => (a.cmp(b) < 0 ? a : b));
    }

    static max(...lengths: Length[]): Length {
      return lengths.reduce((a, b) => (a.cmp(b) > 0 ? a : b));
    }
  }

  Length.zero = new Length(0, "sp");
  return Length;
};

type ShiftDirection = "start" | "end";

interface ShiftCalc {
  x: number;
  y: number;
  msq: number;
  imsq: number;
  dir_x: number;
  dir_y: number;
}

class Vector<T extends LengthLike> {
  public _x: T;
  public _y: T;

  constructor(x: T, y: T) {
    this._x = x;
    this._y = y;
  }

  get x(): T {
    return this._x;
  }

  get y(): T {
    return this._y;
  }

  add(v: Vector<T>): Vector<T> {
    return new Vector(this._x.add(v.x) as T, this._y.add(v.y) as T);
  }

  sub(v: Vector<T>): Vector<T> {
    return new Vector(this._x.sub(v.x) as T, this._y.sub(v.y) as T);
  }

  mul(scalar: number): Vector<T> {
    return new Vector(this._x.mul(scalar) as T, this._y.mul(scalar) as T);
  }

  private assertCompatibleUnits(operation: string): void {
    if (this._x.unit !== this._y.unit) {
      throw new Error(
        `Vector.${operation}: incompatible lengths! (${this._x.unit} and ${this._y.unit})`,
      );
    }
  }

  private calculateShift(): ShiftCalc {
    const x = this._x._value;
    const y = this._y._value;

    return {
      x,
      y,
      msq: Math.sqrt(1 + (y * y) / (x * x)),
      imsq: Math.sqrt(1 + (x * x) / (y * y)),
      dir_x: x < 0 ? -1 : 1,
      dir_y: y < 0 ? -1 : 1,
    };
  }

  private performShift(l: T, direction: ShiftDirection): Vector<T> {
    this.assertCompatibleUnits(`shift_${direction}`);

    const calc = this.calculateShift();
    const { x, y, msq, imsq, dir_x, dir_y } = calc;

    const isStart = direction === "start";
    const multiplier = isStart ? -1 : 1;

    let newX: T;
    let newY: T;

    if (x !== 0 && y !== 0) {
      const shiftX = l.div(msq).mul(dir_x * multiplier) as T;
      const shiftY = l.div(imsq).mul(dir_y * multiplier) as T;
      newX = isStart ? shiftX : (this._x.add(shiftX) as T);
      newY = isStart ? shiftY : (this._y.add(shiftY) as T);
    } else if (y === 0) {
      const shiftX = l.mul(dir_x * multiplier) as T;
      newX = isStart ? shiftX : (this._x.add(shiftX) as T);
      newY = isStart ? (this._y.mul(0) as T) : this._y;
    } else {
      const shiftY = l.mul(dir_y * multiplier) as T;
      newX = isStart ? (this._x.mul(0) as T) : this._x;
      newY = isStart ? shiftY : (this._y.add(shiftY) as T);
    }

    return new Vector(newX, newY);
  }

  shift_start(l: T): Vector<T> {
    return this.performShift(l, "start");
  }

  shift_end(l: T): Vector<T> {
    return this.performShift(l, "end");
  }

  norm(): T {
    return this._x.norm(this._y) as T;
  }
}

export { makeLengthClass, Vector };
