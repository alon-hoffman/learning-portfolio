import React from 'react';
import {Canvas, PencilBrush, Rect, Ellipse, Line, IText, FabricText, FabricObject, FabricImage, Group, Circle, Path} from 'fabric';

export const CANVAS_W = 800;
export const CANVAS_H = 500;

type Tool = 'select' | 'pencil' | 'eraser' | 'bucket' | 'line' | 'rect' | 'ellipse' | 'text';

const TOOLS: {id: Tool; icon: string; label: string}[] = [
  {id: 'select', icon: '🖱️', label: 'בחירה והזזה'},
  {id: 'pencil', icon: '✏️', label: 'עיפרון'},
  {id: 'eraser', icon: '🧽', label: 'מחק'},
  {id: 'bucket', icon: '🪣', label: 'מילוי צבע'},
  {id: 'line', icon: '╱', label: 'קו'},
  {id: 'rect', icon: '▭', label: 'מלבן'},
  {id: 'ellipse', icon: '◯', label: 'אליפסה'},
  {id: 'text', icon: 'A', label: 'טקסט'},
];

const COLORS = [
  '#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', '#22b14c', '#00a2e8', '#3f48cc', '#a349a4',
  '#ffffff', '#c3c3c3', '#b97a57', '#ffaec9', '#ffc90e', '#efe4b0', '#b5e61d', '#99d9ea', '#7092be', '#c8bfe7',
];

const STICKERS: {name: string; items: string[]}[] = [
  {name: 'פרצופים', items: ['👀', '👂', '👃', '👅', '😀', '😮', '😡', '🥶', '🥵']},
  {name: 'איברים', items: ['🦷', '🦴', '🐾', '🪽', '🦵', '🦶', '🦾', '🧠', '🫁', '🫀']},
  {name: 'בעלי חיים', items: ['🦔', '🐪', '🐧', '🐙', '🦎', '🐍', '🦉', '🦇', '🐸', '🦋', '🐢', '🦀']},
  {name: 'טבע', items: ['🌵', '🌴', '🌿', '❄️', '☀️', '🌙', '💧', '🔥', '⭐', '🪨', '🌊', '⛰️']},
];

type Builder = () => FabricObject;
const googly = (r: number, px: number, py: number) =>
  new Group([new Circle({radius: r, fill: '#fff', stroke: '#000', strokeWidth: 3, originX: 'center', originY: 'center'}), new Circle({radius: r * 0.45, fill: '#000', left: px, top: py, originX: 'center', originY: 'center'})]);
const DRAWN: {id: string; label: string; icon: string; build: Builder}[] = [
  {id: 'googly', label: 'עיניים מצחיקות', icon: '🤪', build: () => { const a = googly(34, 6, 8); const b = googly(34, -6, 10); b.set({left: 80}); return new Group([a, b]); }},
  {id: 'cyclops', label: 'עין אחת גדולה', icon: '👁️', build: () => googly(55, -10, 12)},
  {id: 'smile', label: 'חיוך עם שיניים', icon: '😁', build: () => new Group([
    new Path('M0 0 Q60 70 120 0 Z', {fill: '#fff', stroke: '#000', strokeWidth: 5}),
    new Path('M20 8 L20 30 M40 12 L40 44 M60 14 L60 48 M80 12 L80 44 M100 8 L100 30', {stroke: '#000', strokeWidth: 3, fill: ''}),
  ])},
  {id: 'tongue', label: 'לשון בחוץ', icon: '😛', build: () => new Group([
    new Path('M0 0 Q60 40 120 0', {fill: '', stroke: '#000', strokeWidth: 6}),
    new Path('M45 22 Q60 80 80 20 Z', {fill: '#ff6b81', stroke: '#000', strokeWidth: 3}),
  ])},
  {id: 'brows', label: 'גבות כועסות', icon: '😠', build: () => new Group([
    new Path('M0 0 L60 24', {stroke: '#000', strokeWidth: 10, strokeLineCap: 'round', fill: ''}),
    new Path('M130 0 L70 24', {stroke: '#000', strokeWidth: 10, strokeLineCap: 'round', fill: ''}),
  ])},
  {id: 'fang', label: 'ניבים', icon: '🧛', build: () => new Group([
    new Path('M0 0 L14 40 L28 0 Z', {fill: '#fff', stroke: '#000', strokeWidth: 3}),
    new Path('M60 0 L74 40 L88 0 Z', {fill: '#fff', stroke: '#000', strokeWidth: 3}),
  ])},
];

export type PaintApi = {
  /** JPEG data URL of the current drawing at presentation size. */
  exportImage: () => string;
  /** True when something has been drawn. */
  isEmpty: () => boolean;
};

type Props = {
  initialJson: string;
  background: string;
  onChange: (json: string, empty: boolean) => void;
  apiRef: React.MutableRefObject<PaintApi | null>;
};

export default function PaintEditor({initialJson, background, onChange, apiRef}: Props) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const elRef = React.useRef<HTMLCanvasElement>(null);
  const canvasRef = React.useRef<Canvas | null>(null);
  const history = React.useRef<string[]>([]);
  const cursor = React.useRef(0);
  const restoring = React.useRef(false);
  const busy = React.useRef(false); // while a shape/eraser gesture is in progress
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  const [tool, setTool] = React.useState<Tool>('pencil');
  const [color, setColor] = React.useState('#000000');
  const [size, setSize] = React.useState(4);
  const [filled, setFilled] = React.useState(false);
  const [sticker, setSticker] = React.useState(0);
  const [, force] = React.useReducer((n: number) => n + 1, 0);

  const toolRef = React.useRef(tool);
  const colorRef = React.useRef(color);
  const sizeRef = React.useRef(size);
  const filledRef = React.useRef(filled);
  toolRef.current = tool;
  colorRef.current = color;
  sizeRef.current = size;
  filledRef.current = filled;

  const emit = React.useCallback((json: string) => {
    const empty = JSON.parse(json).objects.length === 0;
    onChangeRef.current(json, empty);
  }, []);

  const snapshot = React.useCallback(() => {
    const c = canvasRef.current;
    if (!c || restoring.current || busy.current) return;
    const json = JSON.stringify(c.toJSON());
    history.current = history.current.slice(0, cursor.current + 1);
    history.current.push(json);
    if (history.current.length > 60) history.current.shift();
    cursor.current = history.current.length - 1;
    emit(json);
    force();
  }, [emit]);

  const applyMode = React.useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const t = toolRef.current;
    const interactive = t === 'select';
    const pickable = interactive || t === 'eraser' || t === 'bucket';
    c.isDrawingMode = t === 'pencil';
    c.selection = interactive;
    c.skipTargetFind = !pickable;
    c.defaultCursor = t === 'select' ? 'default' : 'crosshair';
    c.hoverCursor = t === 'eraser' || t === 'bucket' ? 'pointer' : 'move';
    if (!interactive) c.discardActiveObject();
    c.forEachObject((o: FabricObject) => {
      o.selectable = interactive;
      o.evented = pickable;
    });
    if (c.freeDrawingBrush) {
      c.freeDrawingBrush.color = colorRef.current;
      c.freeDrawingBrush.width = sizeRef.current;
    }
    c.requestRenderAll();
  }, []);

  const restore = React.useCallback(
    async (json: string) => {
      const c = canvasRef.current;
      if (!c) return;
      restoring.current = true;
      await c.loadFromJSON(JSON.parse(json));
      restoring.current = false;
      applyMode();
      c.requestRenderAll();
      emit(json);
      force();
    },
    [applyMode, emit],
  );

  // create the canvas once
  React.useEffect(() => {
    const c = new Canvas(elRef.current!, {
      width: CANVAS_W,
      height: CANVAS_H,
      backgroundColor: background,
      preserveObjectStacking: true,
      enableRetinaScaling: true,
    });
    canvasRef.current = c;
    c.freeDrawingBrush = new PencilBrush(c);
    c.freeDrawingBrush.strokeLineCap = 'round';
    c.freeDrawingBrush.strokeLineJoin = 'round';

    const fit = () => {
      const host = hostRef.current;
      if (!host) return;
      const w = Math.max(240, Math.min(host.clientWidth, CANVAS_W));
      c.setDimensions({width: w, height: Math.round((w * CANVAS_H) / CANVAS_W)});
      c.setZoom(w / CANVAS_W);
      c.requestRenderAll();
    };
    const ro = new ResizeObserver(fit);
    ro.observe(hostRef.current!);
    fit();

    let start: {x: number; y: number} | null = null;
    let shape: FabricObject | null = null;

    // Real flood fill: fill only the enclosed region under the click, placed just above the background.
    const floodFill = (sx: number, sy: number) => {
      const src = c.toCanvasElement(1 / c.getZoom());
      const w = src.width;
      const h = src.height;
      const x0 = Math.floor(sx * (w / CANVAS_W));
      const y0 = Math.floor(sy * (h / CANVAS_H));
      if (x0 < 0 || y0 < 0 || x0 >= w || y0 >= h) return;
      const data = src.getContext('2d')!.getImageData(0, 0, w, h).data;
      const at = (x: number, y: number) => (y * w + x) * 4;
      const i0 = at(x0, y0);
      const base = [data[i0], data[i0 + 1], data[i0 + 2]];
      const near = (i: number) => Math.abs(data[i] - base[0]) + Math.abs(data[i + 1] - base[1]) + Math.abs(data[i + 2] - base[2]) < 60;
      const mask = new Uint8Array(w * h);
      const stack = [x0, y0];
      while (stack.length) {
        const y = stack.pop()!;
        const x = stack.pop()!;
        if (x < 0 || y < 0 || x >= w || y >= h || mask[y * w + x] || !near(at(x, y))) continue;
        mask[y * w + x] = 1;
        stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
      }
      // grow the region by 2px so it tucks under anti-aliased edges of the outline
      const grown = new Uint8Array(mask);
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++)
          if (mask[y * w + x]) for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < w && ny < h) grown[ny * w + nx] = 1;
          }
      const out = document.createElement('canvas');
      out.width = w;
      out.height = h;
      const octx = out.getContext('2d')!;
      const img = octx.createImageData(w, h);
      const hex = colorRef.current.replace('#', '');
      const rgb = [0, 2, 4].map(k => parseInt(hex.slice(k, k + 2), 16));
      for (let i = 0; i < w * h; i++) {
        if (!grown[i]) continue;
        img.data[i * 4] = rgb[0];
        img.data[i * 4 + 1] = rgb[1];
        img.data[i * 4 + 2] = rgb[2];
        img.data[i * 4 + 3] = 255;
      }
      octx.putImageData(img, 0, 0);
      const fillImg = new FabricImage(out, {left: 0, top: 0, scaleX: CANVAS_W / w, scaleY: CANVAS_H / h, selectable: false, evented: false});
      busy.current = true;
      c.add(fillImg);
      c.sendObjectToBack(fillImg);
      busy.current = false;
      snapshot();
    };

    const eraseAt = (target: FabricObject | undefined) => {
      if (target) c.remove(target);
    };

    c.on('mouse:down', opt => {
      const t = toolRef.current;
      const p = c.getScenePoint(opt.e);
      if (t === 'eraser') {
        busy.current = true;
        eraseAt(opt.target);
      } else if (t === 'bucket') {
        floodFill(p.x, p.y);
      } else if (t === 'text') {
        const txt = new IText('טקסט', {
          left: p.x,
          top: p.y,
          fontSize: 14 + sizeRef.current * 4,
          fill: colorRef.current,
          fontFamily: 'Arial, sans-serif',
          direction: 'rtl',
        });
        c.add(txt);
        setTool('select');
        toolRef.current = 'select';
        applyMode();
        c.setActiveObject(txt);
        txt.enterEditing();
        txt.selectAll();
      } else if (t === 'line' || t === 'rect' || t === 'ellipse') {
        busy.current = true;
        start = {x: p.x, y: p.y};
        const common = {
          left: p.x,
          top: p.y,
          stroke: colorRef.current,
          strokeWidth: sizeRef.current,
          fill: filledRef.current ? colorRef.current : 'rgba(0,0,0,0)',
          selectable: false,
          evented: false,
        };
        shape =
          t === 'line'
            ? new Line([p.x, p.y, p.x, p.y], {stroke: colorRef.current, strokeWidth: sizeRef.current, strokeLineCap: 'round', selectable: false, evented: false})
            : t === 'rect'
              ? new Rect({...common, width: 1, height: 1})
              : new Ellipse({...common, rx: 1, ry: 1});
        c.add(shape);
      }
    });

    c.on('mouse:move', opt => {
      const t = toolRef.current;
      if (t === 'eraser' && busy.current) {
        eraseAt(c.findTarget(opt.e));
        return;
      }
      if (!start || !shape) return;
      const p = c.getScenePoint(opt.e);
      if (shape instanceof Line) {
        shape.set({x2: p.x, y2: p.y});
      } else if (shape instanceof Rect) {
        shape.set({left: Math.min(start.x, p.x), top: Math.min(start.y, p.y), width: Math.abs(p.x - start.x), height: Math.abs(p.y - start.y)});
      } else if (shape instanceof Ellipse) {
        shape.set({left: Math.min(start.x, p.x), top: Math.min(start.y, p.y), rx: Math.abs(p.x - start.x) / 2, ry: Math.abs(p.y - start.y) / 2});
      }
      shape.setCoords();
      c.requestRenderAll();
    });

    c.on('mouse:up', () => {
      if (shape) {
        const tiny = shape instanceof Line ? Math.hypot((shape.x2 ?? 0) - (shape.x1 ?? 0), (shape.y2 ?? 0) - (shape.y1 ?? 0)) < 3 : (shape.width ?? 0) < 3 && (shape.height ?? 0) < 3 && (shape as Ellipse).rx < 3;
        if (tiny) c.remove(shape);
        shape = null;
        start = null;
      }
      if (busy.current) {
        busy.current = false;
        snapshot();
      }
    });

    c.on('object:added', e => {
      const t = toolRef.current;
      const interactive = t === 'select';
      if (!restoring.current && !busy.current) {
        e.target.selectable = interactive;
        e.target.evented = interactive || t === 'eraser' || t === 'bucket';
      }
      snapshot();
    });
    c.on('object:modified', snapshot);
    c.on('object:removed', snapshot);
    c.on('text:editing:exited', snapshot);

    const first = initialJson || JSON.stringify(c.toJSON());
    history.current = [first];
    cursor.current = 0;
    if (initialJson) {
      restoring.current = true;
      c.loadFromJSON(JSON.parse(initialJson)).then(() => {
        restoring.current = false;
        applyMode();
        c.requestRenderAll();
        emit(initialJson);
      });
    } else {
      applyMode();
    }

    apiRef.current = {
      exportImage: () => {
        c.discardActiveObject();
        c.requestRenderAll();
        return c.toDataURL({format: 'jpeg', quality: 0.85, multiplier: Math.min(1, 640 / c.getWidth())});
      },
      isEmpty: () => c.getObjects().length === 0,
    };

    return () => {
      ro.disconnect();
      apiRef.current = null;
      void c.dispose();
      canvasRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // tool / colour / size changes
  React.useEffect(() => {
    applyMode();
    const c = canvasRef.current;
    const active = c?.getActiveObject();
    if (c && active && tool === 'select') {
      // recolour the selected object so the palette feels like Paint
      if (active.type === 'Path' || active.type === 'Line') active.set('stroke', color);
      else active.set('fill', color);
      c.requestRenderAll();
    }
  }, [tool, color, size, applyMode]);

  // habitat background changes
  React.useEffect(() => {
    const c = canvasRef.current;
    if (!c || c.backgroundColor === background) return;
    c.backgroundColor = background;
    c.requestRenderAll();
    snapshot();
  }, [background, snapshot]);

  const undo = () => {
    if (cursor.current > 0) {
      cursor.current -= 1;
      void restore(history.current[cursor.current]);
    }
  };
  const redo = () => {
    if (cursor.current < history.current.length - 1) {
      cursor.current += 1;
      void restore(history.current[cursor.current]);
    }
  };
  const removeSelected = () => {
    const c = canvasRef.current;
    if (!c) return;
    const sel = c.getActiveObjects();
    if (!sel.length) return;
    busy.current = true;
    c.discardActiveObject();
    sel.forEach(o => c.remove(o));
    busy.current = false;
    snapshot();
  };
  const clearAll = () => {
    const c = canvasRef.current;
    if (!c || !c.getObjects().length) return;
    if (!confirm('למחוק את כל הציור?')) return;
    busy.current = true;
    c.discardActiveObject();
    c.getObjects().forEach(o => c.remove(o));
    busy.current = false;
    snapshot();
  };
  const addDrawn = (build: Builder) => {
    const c = canvasRef.current;
    if (!c) return;
    const g = build();
    g.set({originX: 'center', originY: 'center', left: CANVAS_W / 2 + (Math.random() - 0.5) * 120, top: CANVAS_H / 2 + (Math.random() - 0.5) * 80});
    c.add(g);
    setTool('select');
    toolRef.current = 'select';
    applyMode();
    c.setActiveObject(g);
    c.requestRenderAll();
  };
  const addSticker = (emoji: string) => {
    const c = canvasRef.current;
    if (!c) return;
    const s = new FabricText(emoji, {
      fontSize: 72,
      originX: 'center',
      originY: 'center',
      left: CANVAS_W / 2 + (Math.random() - 0.5) * 120,
      top: CANVAS_H / 2 + (Math.random() - 0.5) * 80,
    });
    c.add(s);
    setTool('select');
    toolRef.current = 'select';
    applyMode();
    c.setActiveObject(s);
    c.requestRenderAll();
  };

  // keyboard: Delete removes selection, Ctrl+Z / Ctrl+Y
  const onKey = (e: React.KeyboardEvent) => {
    const editing = (canvasRef.current?.getActiveObject() as IText | undefined)?.isEditing;
    if (editing) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      removeSelected();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      undo();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      redo();
    }
  };

  const canUndo = cursor.current > 0;
  const canRedo = cursor.current < history.current.length - 1;

  return (
    <div className="paint" onKeyDown={onKey}>
      <div className="paint-toolbar" role="toolbar" aria-label="כלי ציור">
        <div className="paint-group" role="group" aria-label="כלים">
          {TOOLS.map(t => (
            <button key={t.id} type="button" className={'paint-tool' + (tool === t.id ? ' on' : '')} aria-pressed={tool === t.id} title={t.label} aria-label={t.label} onClick={() => setTool(t.id)}>
              <span aria-hidden="true">{t.icon}</span>
            </button>
          ))}
        </div>
        <div className="paint-group" role="group" aria-label="פעולות">
          <button type="button" className="paint-tool" title="ביטול" aria-label="ביטול פעולה" disabled={!canUndo} onClick={undo}>↶</button>
          <button type="button" className="paint-tool" title="שחזור" aria-label="שחזור פעולה" disabled={!canRedo} onClick={redo}>↷</button>
          <button type="button" className="paint-tool" title="מחיקת הפריט שנבחר" aria-label="מחיקת הפריט שנבחר" onClick={removeSelected}>🗑️</button>
          <button type="button" className="paint-tool wide" onClick={clearAll}>נקה הכול</button>
        </div>
      </div>

      <div className="paint-stage" ref={hostRef}>
        <canvas ref={elRef} aria-label="משטח ציור" />
      </div>

      <div className="paint-bottom">
        <div className="paint-palette" role="group" aria-label="צבעים">
          <div className="paint-colors">
            {COLORS.map(c => (
              <button key={c} type="button" className={'paint-swatch' + (c === color ? ' on' : '')} style={{background: c}} aria-label={'צבע ' + c} aria-pressed={c === color} onClick={() => setColor(c)} />
            ))}
          </div>
          <label className="paint-custom" title="צבע מותאם אישית">
            <span className="sr-only">צבע מותאם אישית</span>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} />
          </label>
        </div>
        <label className="paint-size">
          <span>עובי · {size}</span>
          <input type="range" min={1} max={24} value={size} onChange={e => setSize(+e.target.value)} />
        </label>
        {(tool === 'rect' || tool === 'ellipse') && (
          <label className="paint-fill">
            <input type="checkbox" checked={filled} onChange={e => setFilled(e.target.checked)} /> צורה מלאה
          </label>
        )}
      </div>

      <div className="paint-stickers">
        <div className="paint-sticker-tabs" role="tablist" aria-label="קבוצות מדבקות">
          {STICKERS.map((g, i) => (
            <button key={g.name} type="button" role="tab" aria-selected={sticker === i} className={sticker === i ? 'on' : ''} onClick={() => setSticker(i)}>
              {g.name}
            </button>
          ))}
        </div>
        <div className="paint-sticker-list">
          {sticker === 0 && DRAWN.map(d => (
            <button key={d.id} type="button" title={d.label} aria-label={'הוספת מדבקה ' + d.label} onClick={() => addDrawn(d.build)}>
              {d.icon}
            </button>
          ))}
          {STICKERS[sticker].items.map(e => (
            <button key={e} type="button" aria-label={'הוספת מדבקה ' + e} onClick={() => addSticker(e)}>
              {e}
            </button>
          ))}
        </div>
      </div>
      <p className="note">
        {tool === 'select' && 'לחצו על פריט כדי להזיז, לסובב או לשנות גודל. לחצו על צבע כדי לצבוע אותו.'}
        {tool === 'pencil' && 'ציירו בחופשיות עם העכבר או עם האצבע.'}
        {tool === 'eraser' && 'גררו על קווים וצורות כדי למחוק אותם.'}
        {tool === 'bucket' && 'לחצו בתוך אזור סגור כדי למלא אותו בצבע (הקווים צריכים להיות סגורים).'}
        {tool === 'text' && 'לחצו על הציור כדי להוסיף טקסט.'}
        {(tool === 'line' || tool === 'rect' || tool === 'ellipse') && 'גררו על הציור כדי ליצור צורה.'}
      </p>
    </div>
  );
}
