import React from 'react';
import {load, save, confirmSample, confirmReset, download, Result, Field} from './util';
import type {PaintApi} from './PaintEditor';

const PaintEditor = React.lazy(() => import('./PaintEditor'));

export const habitats = [
  ['מדבר', 'חום ביום, קור בלילה ומעט מים', '#f3d7a5'],
  ['אנטארקטיקה', 'קור קיצוני, רוחות ומעט מזון יבשתי', '#d4e8ef'],
  ['אוקיינוס', 'תנועה במים, חמצן מומס ולחץ משתנה', '#b7e1df'],
  ['יער גשם', 'לחות גבוהה, תחרות על אור ומגוון טורפים', '#c2dcb4'],
] as const;
const habitatIcons = ['☀', '❄', '≈', '♧'];

type CreatureState = {
  hab: number;
  name: string;
  adapt: string[];
  why: string[];
  drawing: string;
  empty: boolean;
  png: string;
  done: boolean;
};

const creatureInitial: CreatureState = {hab: 0, name: '', adapt: ['', '', ''], why: ['', '', ''], drawing: '', empty: true, png: '', done: false};

export function Creatures() {
  const [s, setS] = React.useState<CreatureState>(() =>
    load('creatures', creatureInitial, v => Number.isInteger(v.hab) && v.hab >= 0 && v.hab < habitats.length),
  );
  const api = React.useRef<PaintApi | null>(null);
  const [editorKey, setEditorKey] = React.useState(0);

  React.useEffect(() => save('creatures', s), [s]);

  const patch = (p: Partial<CreatureState>) => setS(prev => ({...prev, ...p, done: false}));
  const update = (key: 'adapt' | 'why', i: number, v: string) => setS(prev => ({...prev, done: false, [key]: prev[key].map((a, j) => (j === i ? v : a))}));

  const dirty = JSON.stringify({...s, drawing: ''}) !== JSON.stringify({...creatureInitial});
  const fill = () =>
    confirmSample(dirty) &&
    setS({
      ...creatureInitial,
      name: 'מר קיפודי המדברי',
      adapt: ['אוזניים גדולות', 'פעילות בלילה', 'שתן מרוכז'],
      why: ['שטח פנים גדול מסייע בפיזור חום', 'הימנעות מחום היום מפחיתה איבוד מים', 'הגוף שומר על מים בסביבה יבשה'],
      drawing: s.drawing,
      empty: s.empty,
    });
  const reset = () => {
    if (!confirmReset()) return;
    setS({...creatureInitial});
    setEditorKey(k => k + 1);
  };

  const valid = s.name.trim() && s.adapt.every(x => x.trim()) && s.why.every(x => x.trim()) && !s.empty;
  const makeCard = () => setS(prev => ({...prev, png: api.current?.exportImage() ?? prev.png, done: true}));

  return (
    <>
      <div className="activity-top">
        <div>
          <span className="eyebrow">משימה / יצירת בעל חיים</span>
          <h2>הכירו את היצור החדש שלכם</h2>
        </div>
        <div className="actions">
          <button className="secondary" onClick={fill}>דוגמה לטקסטים</button>
          <button className="quiet" onClick={reset}>איפוס</button>
        </div>
      </div>

      <div className="step-label">1. בחרו סביבת מחיה</div>
      <div className="habitats">
        {habitats.map((h, i) => (
          <button key={h[0]} aria-pressed={s.hab === i} className={'choice ' + (s.hab === i ? 'selected' : '')} style={{background: h[2]}} onClick={() => patch({hab: i})}>
            {habitatIcons[i]} {h[0]}
          </button>
        ))}
      </div>
      <p className="note">אתגר סביבתי: {habitats[s.hab][1]}</p>

      <div className="step-label">2. ציירו את היצור</div>
      <React.Suspense fallback={<div className="paint-loading" role="status">טוען את לוח הציור…</div>}>
        <PaintEditor
          key={editorKey}
          initialJson={s.drawing}
          background={habitats[s.hab][2]}
          apiRef={api}
          onChange={(json, empty) => setS(prev => ({...prev, drawing: json, empty, done: false}))}
        />
      </React.Suspense>

      <div className="step-label">3. תנו שם והסבירו את ההתאמות</div>
      <Field label="שם היצור">
        <input value={s.name} onChange={e => patch({name: e.target.value})} placeholder="המציאו שם משעשע" />
      </Field>
      <div className="three">
        {['מבנית · מבנה הגוף', 'התנהגותית · מה היצור עושה', 'פיזיולוגית · תהליכים בגוף'].map((a, i) => (
          <div className="inner" key={a}>
            <h3>{a}</h3>
            <Field label="מהי ההתאמה?">
              <input value={s.adapt[i]} onChange={e => update('adapt', i, e.target.value)} />
            </Field>
            <Field label="איך היא מסייעת בסביבה?">
              <textarea value={s.why[i]} onChange={e => update('why', i, e.target.value)} />
            </Field>
          </div>
        ))}
      </div>

      <div className="actions">
        <button className="primary" disabled={!valid} onClick={makeCard}>הכנת כרטיס יצור</button>
      </div>
      {!valid && <p className="hint">כדי להכין כרטיס: ציירו את היצור, תנו לו שם, וכתבו שלוש התאמות עם הסבר לכל אחת.</p>}

      {s.done && valid && (
        <Result>
          <h3>כרטיס היצור: {s.name}</h3>
          {s.png && <img className="creature-card-img" src={s.png} alt={'ציור של ' + s.name} />}
          <p>{habitats[s.hab][0]}</p>
          {s.adapt.map((a, i) => (
            <p key={i}>
              <strong>
                {['מבנית', 'התנהגותית', 'פיזיולוגית'][i]}: {a}
              </strong>{' '}
              — {s.why[i]}
            </p>
          ))}
          <p>בדיקה עצמית: האם כל התאמה עונה על אתגר סביבתי מסוים?</p>
          <div className="actions">
            <button className="secondary" onClick={() => download('creature', {...s, drawing: undefined})}>ייצוא תוצר</button>
            <a className="secondary" href={s.png} download={'creature-' + (s.name || 'drawing') + '.jpg'}>הורדת הציור</a>
            <button className="secondary" onClick={() => window.print()}>הדפסה / PDF</button>
          </div>
        </Result>
      )}
    </>
  );
}
