// 内联 SVG 图标工厂函数（替代 @lucide/svelte，避免 lucide import 解析问题）
export function icon(name: string, size: number, cls = ''): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  if (cls) svg.setAttribute('class', cls);
  const pathD: Record<string, string> = {
    x: 'M18 6 6 18|M6 6l12 12',
    check: 'M18 6 6 18|M6 18l12-12'.split('|')[0] + '|M9 18 18 9',
    'chevron-down': 'M6 9l6 6 6-6',
    'chevron-left': 'M15 18l-6-6 6-6',
    'chevron-right': 'M9 18l6-6-6-6',
    'chevron-up': 'M18 15l-6-6-6 6',
    calendar: 'M8 2v4|M16 2v4|M3 10h18|M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    alert: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z|M12 9v4|M12 17h.01',
    info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z|M12 16v-4|M12 8h.01',
    'check-circle': 'M22 11.08V12a10 10 0 1 1-5.93-9.14|M22 4 12 14.01l-3-3',
    'alert-circle': 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z|M12 8v4|M12 16h.01',
    'refresh-cw': 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8|M21 3v5h-5|M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16|M3 21v-5h5',
    loader: 'M21 12a9 9 0 1 1-6.219-8.56',
    inbox: 'M22 12h-6l-2 3h-4l-2-3H2|M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
  };
  const d = pathD[name] ?? pathD.inbox;
  for (const p of d.split('|')) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', p.trim());
    svg.appendChild(path);
  }
  return svg;
}
