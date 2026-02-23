/**
 * Complex number type and arithmetic operations.
 *
 * All operations return new Complex objects — no mutation.
 */

export interface Complex {
  re: number;
  im: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const ZERO: Complex = Object.freeze({ re: 0, im: 0 });
export const ONE: Complex = Object.freeze({ re: 1, im: 0 });
export const I: Complex = Object.freeze({ re: 0, im: 1 });

// ---------------------------------------------------------------------------
// Constructors
// ---------------------------------------------------------------------------

/** Create a complex number from Cartesian components. */
export function complex(re: number, im: number = 0): Complex {
  return { re, im };
}

/**
 * Create a complex number from polar form: r * e^(iθ) = r*cos(θ) + i*r*sin(θ).
 */
export function fromPolar(r: number, theta: number): Complex {
  return { re: r * Math.cos(theta), im: r * Math.sin(theta) };
}

// ---------------------------------------------------------------------------
// Arithmetic
// ---------------------------------------------------------------------------

export function add(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}

export function subtract(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}

export function multiply(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

/** Scale a complex number by a real scalar. */
export function scale(a: Complex, s: number): Complex {
  return { re: a.re * s, im: a.im * s };
}

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------

/** Complex conjugate: a* = re - i*im */
export function conjugate(a: Complex): Complex {
  return { re: a.re, im: -a.im };
}

/** Absolute value (modulus): |a| = sqrt(re² + im²) */
export function magnitude(a: Complex): number {
  return Math.sqrt(a.re * a.re + a.im * a.im);
}

/** |a|² = re² + im²  (avoids a square-root, useful for probabilities) */
export function magnitudeSquared(a: Complex): number {
  return a.re * a.re + a.im * a.im;
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * Return a human-readable string for debugging.
 * Examples: "1", "0.707i", "0.5+0.5i", "0.5-0.5i"
 */
export function complexToString(a: Complex, precision: number = 4): string {
  const re = parseFloat(a.re.toFixed(precision));
  const im = parseFloat(a.im.toFixed(precision));

  if (im === 0) return `${re}`;
  if (re === 0) return `${im}i`;
  const sign = im < 0 ? '-' : '+';
  return `${re}${sign}${Math.abs(im)}i`;
}
