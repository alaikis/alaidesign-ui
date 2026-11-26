import { cn } from '../../internal/cn';
import { icon } from '../icon';
// 签名板（与 Svelte 包 signature-pad.svelte 对齐：canvas + 高 DPI + 鼠标/触控 + placeholder）
export class AluSignaturePad extends HTMLElement {
  static observedAttributes = ['width', 'height', 'stroke-color', 'stroke-width', 'background-color', 'placeholder'];

  get width(): number {
    return Number(this.getAttribute('width')) || 400;
  }
  get height(): number {
    return Number(this.getAttribute('height')) || 200;
  }
  get strokeColor(): string {
    return this.getAttribute('stroke-color') ?? '#000000';
  }
  get strokeWidth(): number {
    return Number(this.getAttribute('stroke-width')) || 2;
  }
  get backgroundColor(): string {
    return this.getAttribute('background-color') ?? '#ffffff';
  }
  get placeholder(): string {
    return this.getAttribute('placeholder') ?? 'Sign here';
  }

  private _canvas!: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D | null = null;
  private _drawing = false;
  private _lastX = 0;
  private _lastY = 0;
  private _hasSignature = false;

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    shadow.innerHTML =
      '<style>:host{display:inline-block;position:relative;overflow:hidden}.alu-signature-canvas{display:block;width:100%;height:100%}</style>' +
      `<div class="alu-signature-container" style="width:${this.width}px;height:${this.height}px">
        <canvas class="alu-signature-canvas border-2 border-border rounded-lg cursor-crosshair touch-none" style="background-color:${this.backgroundColor}"></canvas>
      </div>`;
    this._canvas = shadow.querySelector('canvas')!;
    const dpr = window.devicePixelRatio || 1;
    this._canvas.width = this.width * dpr;
    this._canvas.height = this.height * dpr;
    this._canvas.style.width = `${this.width}px`;
    this._canvas.style.height = `${this.height}px`;
    this._ctx = this._canvas.getContext('2d');
    this._ctx?.scale(dpr, dpr);
    this._drawPlaceholder();
    this._bindEvents();
  }

  private _drawPlaceholder() {
    const ctx = this._ctx;
    if (!ctx) return;
    ctx.font = '16px Inter, sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.textAlign = 'center';
    ctx.fillText(this.placeholder, this.width / 2, this.height / 2);
  }

  private _pos(e: MouseEvent | TouchEvent): { x: number; y: number } {
    const rect = this._canvas.getBoundingClientRect();
    const sx = this._canvas.width / rect.width;
    const sy = this._canvas.height / rect.height;
    if (e instanceof TouchEvent) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * sx, y: (t.clientY - rect.top) * sy };
    }
    const m = e as MouseEvent;
    return { x: (m.clientX - rect.left) * sx, y: (m.clientY - rect.top) * sy };
  }

  private _start(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    this._drawing = true;
    const p = this._pos(e);
    this._lastX = p.x;
    this._lastY = p.y;
  }

  private _draw(e: MouseEvent | TouchEvent) {
    if (!this._drawing || !this._ctx) return;
    e.preventDefault();
    const p = this._pos(e);
    const ctx = this._ctx;
    ctx.beginPath();
    ctx.moveTo(this._lastX, this._lastY);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = this.strokeColor;
    ctx.lineWidth = this.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    this._lastX = p.x;
    this._lastY = p.y;
    if (!this._hasSignature) {
      this._hasSignature = true;
      this.dispatchEvent(new CustomEvent('change', { bubbles: true, composed: true }));
    }
  }

  private _stop() {
    this._drawing = false;
  }

  private _bindEvents() {
    this._canvas.addEventListener('mousedown', (e) => this._start(e as MouseEvent));
    this._canvas.addEventListener('mousemove', (e) => this._draw(e as MouseEvent));
    this._canvas.addEventListener('mouseup', () => this._stop());
    this._canvas.addEventListener('mouseleave', () => this._stop());
    this._canvas.addEventListener('touchstart', (e) => this._start(e as TouchEvent), { passive: false });
    this._canvas.addEventListener('touchmove', (e) => this._draw(e as TouchEvent), { passive: false });
    this._canvas.addEventListener('touchend', () => this._stop());
  }

  // 公共 API（与 Svelte 组件导出方法对齐）
  getSignatureData(): string {
    if (!this._canvas) return '';
    return this._canvas.toDataURL('image/png');
  }
  clear(): void {
    if (!this._ctx || !this._canvas) return;
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this._hasSignature = false;
    this._drawPlaceholder();
  }
  isEmpty(): boolean {
    return !this._hasSignature;
  }
}

if (!customElements.get('alu-signature-pad')) {
  customElements.define('alu-signature-pad', AluSignaturePad);
}

export { icon as _icon, cn };
