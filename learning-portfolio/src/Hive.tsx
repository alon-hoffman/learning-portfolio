import React from 'react';
import {load, save, confirmSample, confirmReset, download, Field} from './util';

// Board geometry: pointy-top hexagons on an odd-row offset grid, in SVG units.
const R = 50;
const W_HEX = Math.sqrt(3) * R;
const COLS = 6;
const ROWS = 7;
const PAD_X = W_HEX / 2 + 6;
const PAD_Y = R + 6;
const VB_W = Math.ceil(PAD_X * 2 + W_HEX * (COLS - 0.5));
const VB_H = Math.ceil(PAD_Y * 2 + 1.5 * R * (ROWS - 1));
const COLORS = ['#ff8a80', '#ffd54f', '#81c784', '#4dd0e1', '#7986cb', '#ba68c8', '#ffb74d'];
const COLOR_NAMES = ['אדום', 'צהוב', 'ירוק', 'תכלת', 'כחול', 'סגול', 'כתום'];

type HNode = {name: string; description: string; c: number; r: number; color: number};
type HiveState = {topic: string; nodes: HNode[]; links: Record<string, string>; selected: string; required: number};

const cellX = (c: number, r: number) => PAD_X + W_HEX * (c + (r & 1) / 2);
const cellY = (r: number) => PAD_Y + 1.5 * R * r;
const hexPoints = (x: number, y: number, rad: number) =>
  Array.from({length: 6}, (_, i) => {
    const a = (Math.PI / 180) * (60 * i + 30);
    return `${(x + rad * Math.cos(a)).toFixed(1)},${(y + rad * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
const cellKey = (c: number, r: number) => c + ',' + r;

const startCells: [number, number][] = [[0, 0], [2, 0], [4, 0], [1, 2], [3, 2], [0, 4], [2, 4]];
const flowerCells: [number, number][] = [[2, 3], [1, 3], [3, 3], [2, 2], [3, 2], [2, 4], [3, 4]];
const demoNodes = ['מערכת אקולוגית', 'אור השמש', 'יצרנים', 'צרכנים', 'מפרקים', 'קרקע', 'מים'];

const hiveInitial: HiveState = {
  topic: 'מערכת אקולוגית',
  nodes: startCells.map(([c, r], i) => ({name: '', description: '', c, r, color: i})),
  links: {},
  selected: 'n0',
  required: 10,
};

const linkKey = (a: number, b: number) => Math.min(a, b) + '-' + Math.max(a, b);

function touching(nodes: HNode[]): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < nodes.length; i++)
    for (let j = i + 1; j < nodes.length; j++) {
      const d = Math.hypot(cellX(nodes[i].c, nodes[i].r) - cellX(nodes[j].c, nodes[j].r), cellY(nodes[i].r) - cellY(nodes[j].r));
      if (d < W_HEX * 1.1) out.push([i, j]);
    }
  return out;
}

function nearestFree(x: number, y: number, taken: Set<string>): [number, number] {
  let best: [number, number] = [0, 0];
  let bd = Infinity;
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      if (taken.has(cellKey(c, r))) continue;
      const d = Math.hypot(cellX(c, r) - x, cellY(r) - y);
      if (d < bd) {
        bd = d;
        best = [c, r];
      }
    }
  return best;
}

function wrap(text: string, max = 9, maxLines = 3): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (let w of words) {
    while (w.length > max) {
      if (cur) {
        lines.push(cur);
        cur = '';
      }
      lines.push(w.slice(0, max));
      w = w.slice(max);
    }
    if (!cur) cur = w;
    else if ((cur + ' ' + w).length <= max) cur += ' ' + w;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const cut = lines.slice(0, maxLines);
    cut[maxLines - 1] = cut[maxLines - 1].slice(0, max - 1) + '…';
    return cut;
  }
  return lines;
}

function validHive(v: HiveState) {
  const seen = new Set<string>();
  return (
    /^(n[0-6]|e[0-6]-[0-6])$/.test(v.selected) &&
    Number.isInteger(v.required) &&
    v.required >= 7 &&
    v.required <= 12 &&
    Object.values(v.links).every(x => typeof x === 'string') &&
    v.nodes.length === 7 &&
    v.nodes.every(n => {
      const ok = Number.isInteger(n.c) && Number.isInteger(n.r) && n.c >= 0 && n.c < COLS && n.r >= 0 && n.r < ROWS && Number.isInteger(n.color) && n.color >= 0 && n.color < COLORS.length && !seen.has(cellKey(n.c, n.r));
      seen.add(cellKey(n.c, n.r));
      return ok;
    })
  );
}

type Drag = {i: number; x: number; y: number; dx: number; dy: number; sx: number; sy: number; moved: boolean};

export function Hive() {
  const [s, setS] = React.useState<HiveState>(() => load('hive', hiveInitial, validHive));
  const [drag, setDrag] = React.useState<Drag | null>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => save('hive', s), [s]);

  const node = s.selected.startsWith('n') ? +s.selected.slice(1) : -1;
  const edge = s.selected.startsWith('e') ? (s.selected.slice(1).split('-').map(Number) as [number, number]) : null;

  const pairs = touching(s.nodes);
  const named = (i: number) => s.nodes[i].name.trim();
  const completeNodes = s.nodes.filter(n => n.name.trim() && n.description.trim()).length;
  const completeEdges = pairs.filter(([a, b]) => s.links[linkKey(a, b)]?.trim() && named(a) && named(b)).length;
  const ready = completeNodes === 7 && completeEdges >= s.required;
  const orphaned = Object.keys(s.links).filter(k => s.links[k]?.trim() && !pairs.some(([a, b]) => linkKey(a, b) === k)).length;

  const setNode = (i: number, p: Partial<HNode>) => setS(prev => ({...prev, nodes: prev.nodes.map((n, j) => (j === i ? {...n, ...p} : n))}));
  const select = (key: string) => setS(prev => ({...prev, selected: key}));

  const toSvg = (e: React.PointerEvent) => {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const m = svg.getScreenCTM();
    return m ? pt.matrixTransform(m.inverse()) : {x: pt.x, y: pt.y};
  };

  const onDown = (e: React.PointerEvent, i: number) => {
    e.preventDefault();
    (e.currentTarget as SVGGElement).focus({preventScroll: true});
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const p = toSvg(e);
    const n = s.nodes[i];
    setDrag({i, x: cellX(n.c, n.r), y: cellY(n.r), dx: cellX(n.c, n.r) - p.x, dy: cellY(n.r) - p.y, sx: p.x, sy: p.y, moved: false});
    select('n' + i);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const p = toSvg(e);
    const moved = drag.moved || Math.hypot(p.x - drag.sx, p.y - drag.sy) > 5;
    if (!moved) return;
    setDrag({...drag, moved, x: Math.max(0, Math.min(VB_W, p.x + drag.dx)), y: Math.max(0, Math.min(VB_H, p.y + drag.dy))});
  };
  const takenBy = (skip: number) => new Set(s.nodes.filter((_, j) => j !== skip).map(n => cellKey(n.c, n.r)));
  const onUp = () => {
    if (drag?.moved) {
      const [c, r] = nearestFree(drag.x, drag.y, takenBy(drag.i));
      setNode(drag.i, {c, r});
    }
    setDrag(null);
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      select('n' + i);
      return;
    }
    const dirs: Record<string, [number, number]> = {ArrowLeft: [-W_HEX, 0], ArrowRight: [W_HEX, 0], ArrowUp: [0, -1.5 * R], ArrowDown: [0, 1.5 * R]};
    const d = dirs[e.key];
    if (!d) return;
    e.preventDefault();
    const n = s.nodes[i];
    const taken = takenBy(i);
    taken.add(cellKey(n.c, n.r));
    const [c, r] = nearestFree(cellX(n.c, n.r) + d[0], cellY(n.r) + d[1], taken);
    const moved = Math.hypot(cellX(c, r) - cellX(n.c, n.r), cellY(r) - cellY(n.r)) < W_HEX * 2.1;
    if (moved) setNode(i, {c, r});
    select('n' + i);
  };

  const arrangeFlower = () => setS(prev => ({...prev, nodes: prev.nodes.map((n, i) => ({...n, c: flowerCells[i][0], r: flowerCells[i][1]}))}));
  const demo = () =>
    confirmSample(JSON.stringify(s) !== JSON.stringify(hiveInitial)) &&
    setS({
      ...hiveInitial,
      nodes: demoNodes.map((name, i) => ({name, description: i === 0 ? 'מערכת שבה יצורים חיים וסביבה מקיימים קשרי גומלין.' : '', c: flowerCells[i][0], r: flowerCells[i][1], color: i})),
      links: {'0-1': 'אור השמש הוא מקור האנרגיה של המערכת האקולוגית.'},
      selected: 'n1',
    });

  const order = drag ? [...s.nodes.keys()].filter(i => i !== drag.i).concat(drag.i) : [...s.nodes.keys()];
  const ghost = drag?.moved ? nearestFree(drag.x, drag.y, takenBy(drag.i)) : null;

  return (
    <>
      <div className="activity-top">
        <div>
          <div className="eyebrow">משימה / מפת מושגים</div>
          <h2>בנו כוורת: גררו, חברו והסבירו</h2>
        </div>
        <div className="actions">
          <button className="secondary" onClick={demo}>מושגים לדוגמה</button>
          <button className="secondary" onClick={arrangeFlower}>סידור מהיר</button>
          <button className="quiet" onClick={() => confirmReset() && setS(hiveInitial)}>איפוס</button>
        </div>
      </div>

      <div className="two">
        <Field label="נושא הכוורת">
          <input value={s.topic} onChange={e => setS({...s, topic: e.target.value})} />
        </Field>
        <Field label="מספר קשרים נדרשים">
          <select value={s.required} onChange={e => setS({...s, required: +e.target.value})}>
            {[7, 8, 9, 10, 11, 12].map(n => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </Field>
      </div>

      <ol className="hive-how">
        <li>לחצו על משושה וכתבו מושג והסבר.</li>
        <li>גררו משושים והצמידו אותם זה לזה: משושים שנוגעים בצלע יוצרים קשר.</li>
        <li>לחצו על העיגול שבין שני משושים צמודים והסבירו את הקשר.</li>
      </ol>

      <div className="stats">
        <div className="stat"><strong>{completeNodes}/7</strong> מושגים מוסברים</div>
        <div className="stat"><strong>{pairs.length}</strong> קשרים בין משושים</div>
        <div className="stat"><strong>{completeEdges}/{s.required}</strong> קשרים מוסברים</div>
      </div>

      <div className="hive-layout">
        <svg ref={svgRef} viewBox={`0 0 ${VB_W} ${VB_H}`} role="group" aria-label="לוח הכוורת. אפשר לגרור משושים או להזיז במקשי החיצים" className="hive-board" onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
                    {Array.from({length: ROWS}, (_, r) => Array.from({length: COLS}, (_, c) => <circle key={cellKey(c, r)} cx={cellX(c, r)} cy={cellY(r)} r="2.5" fill="#d9d4ee" />))}
          {ghost && <polygon points={hexPoints(cellX(ghost[0], ghost[1]), cellY(ghost[1]), R - 3)} fill="#6c4cf722" stroke="#6c4cf7" strokeDasharray="6 5" strokeWidth="2" />}

          {order.map(i => {
            const n = s.nodes[i];
            const dragging = drag?.moved && drag.i === i;
            const x = dragging ? drag.x : cellX(n.c, n.r);
            const y = dragging ? drag.y : cellY(n.r);
            const sel = s.selected === 'n' + i;
            const lines = wrap(n.name || 'מושג ' + (i + 1));
            return (
              <g
                key={i}
                className={'hex' + (dragging ? ' dragging' : '')}
                role="button"
                tabIndex={0}
                aria-label={`מושג ${i + 1}: ${n.name || 'ללא שם'}${n.description ? ', מוסבר' : ''}`}
                aria-pressed={sel}
                transform={dragging ? `translate(0 -4)` : undefined}
                onPointerDown={e => onDown(e, i)}
                onKeyDown={e => onKey(e, i)}
              >
                <polygon points={hexPoints(x, y, R - 2)} fill={COLORS[n.color]} stroke={sel ? '#2b1a6b' : '#fff'} strokeWidth={sel ? 4 : 2.5} strokeLinejoin="round" />
                <text x={x} y={y - ((lines.length - 1) * 8) + 5} textAnchor="middle" className={'hex-text' + (n.name ? '' : ' ph')}>
                  {lines.map((l, k) => (
                    <tspan key={k} x={x} dy={k === 0 ? 0 : 17}>{l}</tspan>
                  ))}
                </text>
                {n.name && !n.description && <text x={x} y={y + R - 14} textAnchor="middle" className="hex-flag">חסר הסבר</text>}
              </g>
            );
          })}

          {pairs.map(([a, b]) => {
            const k = linkKey(a, b);
            const has = !!s.links[k]?.trim();
            const x = (cellX(s.nodes[a].c, s.nodes[a].r) + cellX(s.nodes[b].c, s.nodes[b].r)) / 2;
            const y = (cellY(s.nodes[a].r) + cellY(s.nodes[b].r)) / 2;
            const sel = s.selected === 'e' + k;
            if (drag?.moved && (drag.i === a || drag.i === b)) return null;
            return (
              <g key={k} className="badge" role="button" tabIndex={0} aria-label={`קשר בין ${s.nodes[a].name || 'מושג ' + (a + 1)} לבין ${s.nodes[b].name || 'מושג ' + (b + 1)}${has ? ', מוסבר' : ', טרם הוסבר'}`} onClick={() => select('e' + k)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), select('e' + k))}>
                <circle cx={x} cy={y} r="14" fill={has ? '#4b2fd0' : '#fff'} stroke={sel ? '#2b1a6b' : '#4b2fd0'} strokeWidth={sel ? 3.5 : 2} />
                <text x={x} y={y + 5} textAnchor="middle" fontSize="15" fontWeight="700" fill={has ? '#fff' : '#4b2fd0'}>{has ? '✓' : '+'}</text>
              </g>
            );
          })}
        </svg>

        <div className="inner hive-panel">
          {node >= 0 ? (
            <>
              <h3>עריכת מושג {node + 1}</h3>
              <Field label="שם המושג">
                <input value={s.nodes[node].name} maxLength={40} onChange={e => setNode(node, {name: e.target.value})} />
              </Field>
              <Field label="הסבר המושג">
                <textarea rows={4} value={s.nodes[node].description} onChange={e => setNode(node, {description: e.target.value})} />
              </Field>
              <div className="option-row" role="group" aria-label="צבע המשושה">
                <span>צבע</span>
                {COLORS.map((c, ci) => (
                  <button key={c} className={'swatch ' + (s.nodes[node].color === ci ? 'selected' : '')} aria-pressed={s.nodes[node].color === ci} aria-label={'צבע ' + COLOR_NAMES[ci]} style={{background: c}} onClick={() => setNode(node, {color: ci})} />
                ))}
              </div>
            </>
          ) : edge ? (
            <>
              <h3>
                {s.nodes[edge[0]].name || 'מושג ' + (edge[0] + 1)} ↔ {s.nodes[edge[1]].name || 'מושג ' + (edge[1] + 1)}
              </h3>
              <Field label="מהו הקשר בין המושגים?">
                <textarea rows={5} value={s.links[linkKey(edge[0], edge[1])] || ''} onChange={e => setS({...s, links: {...s.links, [linkKey(edge[0], edge[1])]: e.target.value}})} />
              </Field>
              {!pairs.some(([a, b]) => linkKey(a, b) === linkKey(edge[0], edge[1])) && <p className="hint">המשושים האלה כבר לא נוגעים זה בזה, ולכן הקשר לא נספר. הצמידו אותם שוב כדי להחזיר אותו.</p>}
              <p className="note">כתבו משפט שמסביר את הקשר ולא רק מציין שהם קשורים.</p>
            </>
          ) : null}
          {orphaned > 0 && <p className="note">{orphaned === 1 ? 'קשר אחד שכתבתם לא נספר' : orphaned + ' קשרים שכתבתם לא נספרים'} כי המשושים התרחקו. {orphaned === 1 ? 'הוא נשמר' : 'הם נשמרו'}.</p>}
        </div>
      </div>

      <div className="actions">
        <button className="primary" disabled={!ready} onClick={() => download('knowledge-hive', s)}>ייצוא כוורת מלאה</button>
        <button className="secondary" onClick={() => download('knowledge-hive-draft', s)}>שמירת טיוטה</button>
        <button className="secondary" onClick={() => window.print()}>הדפסה / PDF</button>
      </div>
      <p className="note">{ready ? 'השלמתם את האילוץ הכמותי! כעת בדקו את איכות ההסברים.' : 'כדי להשלים את המשימה יש להסביר את כל שבעת המושגים ולפחות ' + s.required + ' קשרים בין משושים צמודים.'}</p>

      {completeEdges > 0 && (
        <details>
          <summary>רשימת הקשרים שהוסברו</summary>
          {pairs.map(([a, b]) => s.links[linkKey(a, b)]?.trim() && (
            <p key={linkKey(a, b)}><strong>{s.nodes[a].name} ↔ {s.nodes[b].name}:</strong> {s.links[linkKey(a, b)]}</p>
          ))}
        </details>
      )}

      <div className="print-only">
        <h3>{s.topic}</h3>
        {s.nodes.map((n, i) => n.name.trim() && <p key={i}><strong>{n.name}:</strong> {n.description}</p>)}
        {pairs.map(([a, b]) => s.links[linkKey(a, b)]?.trim() && <p key={linkKey(a, b)}><strong>{s.nodes[a].name} ↔ {s.nodes[b].name}:</strong> {s.links[linkKey(a, b)]}</p>)}
      </div>
    </>
  );
}
