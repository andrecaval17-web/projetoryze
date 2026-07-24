/**
 * pdfjs-dist (usado por pdf-parse) referencia `DOMMatrix` — uma API de
 * navegador — em código de módulo que roda incondicionalmente ao carregar
 * (não só ao renderizar num canvas). Node.js não tem essa classe
 * nativamente, o que quebra com "DOMMatrix is not defined" especificamente
 * no bundle de produção da Vercel (o bundling de produção parece puxar esse
 * caminho de código de um jeito que o modo de desenvolvimento não puxa).
 *
 * `@thednp/dommatrix` cobre a maior parte do spec 2D, mas não implementa
 * `invertSelf`/`preMultiplySelf` — métodos que o pdfjs-dist chama direto
 * durante a extração de texto. Completamos aqui em cima da matemática de
 * matriz afim 2D que o pacote já expõe (propriedades a/b/c/d/e/f +
 * `setMatrixValue`/`multiply`, que são as únicas primitivas que precisamos).
 */

interface Matrix2D {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  setMatrixValue(values: number[]): Matrix2D;
  multiply(other: Matrix2D): Matrix2D;
}

type Matrix2DCtor = new (init?: number[]) => Matrix2D;

let installed = false;

export async function ensureDomMatrixPolyfill(): Promise<void> {
  if (installed) return;
  installed = true;

  if (typeof (globalThis as { DOMMatrix?: unknown }).DOMMatrix !== "undefined") return;

  const mod = await import("@thednp/dommatrix");
  const DOMMatrixShim = ((mod as { default?: Matrix2DCtor }).default ?? (mod as unknown as Matrix2DCtor));

  const proto = DOMMatrixShim.prototype as Matrix2D & {
    invertSelf?: () => Matrix2D;
    preMultiplySelf?: (other: Matrix2D) => Matrix2D;
  };

  if (typeof proto.invertSelf !== "function") {
    proto.invertSelf = function (this: Matrix2D): Matrix2D {
      const { a, b, c, d, e, f } = this;
      const det = a * d - b * c;
      if (det === 0) {
        this.setMatrixValue([NaN, NaN, NaN, NaN, NaN, NaN]);
        return this;
      }
      const ia = d / det;
      const ib = -b / det;
      const ic = -c / det;
      const id = a / det;
      const ie = -(e * ia + f * ic);
      const iff = -(e * ib + f * id);
      this.setMatrixValue([ia, ib, ic, id, ie, iff]);
      return this;
    };
  }

  if (typeof proto.preMultiplySelf !== "function") {
    proto.preMultiplySelf = function (this: Matrix2D, other: Matrix2D): Matrix2D {
      const result = other.multiply(this);
      this.setMatrixValue([result.a, result.b, result.c, result.d, result.e, result.f]);
      return this;
    };
  }

  (globalThis as unknown as { DOMMatrix: Matrix2DCtor }).DOMMatrix = DOMMatrixShim;
}
