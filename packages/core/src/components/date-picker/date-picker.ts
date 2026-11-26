import { icon } from '../icon';
// 日期选择器（与 Svelte 包 date-picker.svelte 对齐；bits-ui DatePicker 降级为
// input[type=date] + 日历网格浮层。value 格式 YYYY-MM-DD，事件 value-change）
import { cn } from '../../internal/cn';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export class AluDatePicker extends HTMLElement {
  static observedAttributes = ['value', 'disabled', 'class'];

  get value(): string {
    return this.getAttribute('value') ?? '';
  }
  set value(v: string) {
    this.setAttribute('value', v);
    this._input.value = v.slice(0, 10);
    this._renderCalendar();
  }

  private _input!: HTMLInputElement;
  private _cal!: HTMLDivElement;
  private _calOpen = false;
  private _viewYear = new Date().getFullYear();
  private _viewMonth = new Date().getMonth();

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    const cls = cn(
      'flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm focus-within:border-info focus-within:ring-2 focus-within:ring-info/20 data-disabled:cursor-not-allowed data-disabled:opacity-50',
      this.getAttribute('class') ?? '',
    );
    shadow.innerHTML =
      `<style>:host{display:block}</style>` +
      `<div class="relative">
        <input type="text" data-slot="date-picker-input" placeholder="${this.getAttribute('placeholder') ?? 'YYYY-MM-DD'}" class="${cls}" />
        <div data-role="calendar" style="display:none" class="z-50 rounded-lg border border-border bg-popover text-popover-foreground shadow-md p-3"></div>
      </div>`;
    this._input = shadow.querySelector('input')!;
    this._cal = shadow.querySelector('[data-role="calendar"]')!;
    if (this.hasAttribute('disabled')) this._input.disabled = true;
    this._input.addEventListener('focus', () => {
      this._calOpen = true;
      this._cal.style.display = 'block';
      this._positionCalendar();
      this._renderCalendar();
    });
    this._input.addEventListener('change', () => {
      const v = this._input.value.replace(/[^\d]/g, '');
      this.value = v.slice(0, 4) + '-' + v.slice(4, 6) + '-' + v.slice(6, 8);
      this._calOpen = false;
      this._cal.style.display = 'none';
    });
    document.addEventListener('click', this._onDocClick);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._onDocClick);
  }

  private _onDocClick = (e: Event) => {
    if (this._calOpen && !this.contains(e.target as Node)) {
      this._calOpen = false;
      this._cal.style.display = 'none';
    }
  };

  private _positionCalendar() {
    const rect = this.getBoundingClientRect();
    this._cal.style.position = 'fixed';
    this._cal.style.left = `${rect.left}px`;
    this._cal.style.top = `${rect.bottom + 4}px`;
  }

  private _today(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private _renderCalendar() {
    const y = this._viewYear;
    const m = this._viewMonth;
    const todayStr = this._today();
    let sel = new Date(`${this.value}T00:00:00`);
    if (isNaN(sel.getTime()) || !this.value) {
      this._viewYear = new Date().getFullYear();
      this._viewMonth = new Date().getMonth();
      sel = new Date(y, m, 1);
    } else {
      this._viewYear = sel.getFullYear();
      this._viewMonth = sel.getMonth();
    }
    const firstDay = new Date(y, m, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const prevDays = new Date(y, m, 0).getDate();

    const cells: Array<{ day: number; inMonth: boolean; date: string }> = [];
    const startIdx = 6 - startWeekday; // 周一为第一列
    for (let i = 0; i < startIdx; i++) {
      const d = prevDays - startIdx + 1 + i;
      cells.push({ day: d, inMonth: false, date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, inMonth: true, date: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
    }
    while (cells.length % 7 !== 0) {
      const last = cells.length ? cells[cells.length - 1].day : 0;
      cells.push({ day: last + 1, inMonth: false, date: '' });
    }

    const weekRows: string[] = [];
    for (let w = 0; w < cells.length / 7; w++) {
      const row = cells.slice(w * 7, w * 7 + 7)
        .map((c) => {
          const sel = c.date && c.date === this.value;
          const isToday = c.date === todayStr;
          const cls = cn(
            'inline-flex h-8 w-8 items-center justify-center rounded text-sm text-foreground hover:bg-muted data-selected:bg-primary data-selected:text-primary-foreground data-outside-month:text-muted-foreground/50',
            sel && 'bg-primary text-primary-foreground',
            isToday && !sel && 'border border-primary',
          );
          return `<button type="button" data-date="${c.date}" class="${cls}">${c.day}</button>`;
        })
        .join('');
      weekRows.push(`<div class="flex w-full">${row}</div>`);
    }

    this._cal.innerHTML =
      `<div class="flex items-center justify-between pb-2">
        <button type="button" data-nav="prev" class="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground">${chevron('left')}</button>
        <div class="text-sm font-medium text-foreground">${MONTHS[m]} ${y}</div>
        <button type="button" data-nav="next" class="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground">${chevron('right')}</button>
      </div>
      <div class="grid grid-cols-7 gap-1">${WEEKDAYS.map((w) => `<div class="w-8 text-xs font-normal text-muted-foreground text-center">${w}</div>`).join('')}</div>
      ${weekRows.join('')}`;

    this._cal.querySelectorAll('[data-nav]').forEach((b) => {
      b.addEventListener('click', () => {
        const dir = b.getAttribute('data-nav') === 'prev' ? -1 : 1;
        let nm = m + dir;
        let ny = y;
        if (nm < 0) { nm = 11; ny--; }
        if (nm > 11) { nm = 0; ny++; }
        this._viewYear = ny;
        this._viewMonth = nm;
        this._renderCalendar();
      });
    });
    this._cal.querySelectorAll('[data-date]').forEach((b) => {
      b.addEventListener('click', () => {
        const date = b.getAttribute('data-date');
        if (!date) return;
        this.value = date;
        this._input.value = date;
        this._calOpen = false;
        this._cal.style.display = 'none';
        this.dispatchEvent(
          new CustomEvent('value-change', { detail: { value: date }, bubbles: true, composed: true }),
        );
      });
    });
  }

  attributeChangedCallback(name: string, _o: string | null, n: string | null) {
    if (name === 'value') {
      if (this._input) this._input.value = (n ?? '').slice(0, 10);
      this._renderCalendar();
    }
  }
}

function chevron(dir: 'left' | 'right'): string {
  const d = dir === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="${d}"/></svg>`;
}

if (!customElements.get('alu-date-picker')) {
  customElements.define('alu-date-picker', AluDatePicker);
}

export { icon as _icon };
