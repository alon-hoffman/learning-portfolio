import React from 'react';
export function sameShape(v:unknown,t:unknown):boolean{if(t===null)return v===null||(typeof v==='object'&&!Array.isArray(v));if(Array.isArray(t))return Array.isArray(v)&&(t.length===0||(v.length===t.length&&v.every((x,i)=>sameShape(x,t[i]))));if(typeof t==='object'){if(typeof v!=='object'||v===null||Array.isArray(v))return false;const o=v as Record<string,unknown>;return Object.keys(t).length===0||Object.entries(t as object).every(([k,x])=>k in o&&sameShape(o[k],x))}return typeof v===typeof t}
export function load<T>(key:string,initial:T,valid:(v:T)=>boolean=()=>true):T{try{const v=JSON.parse(localStorage.getItem('learn-'+key)||'null');return v!==null&&sameShape(v,initial)&&valid(v)?v:initial}catch{return initial}}
export function save(key:string,value:unknown){try{localStorage.setItem('learn-'+key,JSON.stringify(value))}catch{window.dispatchEvent(new Event('save-failed'))}}
export const confirmSample=(dirty:boolean)=>!dirty||confirm('להחליף את העבודה הנוכחית בדוגמה?');
export function download(name:string,data:unknown){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
export const confirmReset=()=>confirm('לאפס את העבודה? כל מה שכתבתם כאן יימחק.');
export function Result({children}:{children:React.ReactNode}){const r=React.useRef<HTMLDivElement>(null);React.useEffect(()=>{r.current?.scrollIntoView({behavior:'smooth',block:'nearest'})},[]);return <div className="result" ref={r}>{children}</div>}
export function readJSON(file:File,callback:(data:any)=>void){file.text().then(x=>callback(JSON.parse(x))).catch(()=>alert('לא ניתן לקרוא את הקובץ'))}
export function Field({label,children}:{label:string,children:React.ReactNode}){return <label className="field"><span>{label}</span>{children}</label>}
const illustrations:Record<string,{src:string;alt:string}>={
  creatures:{src:new URL('./assets/creatures.webp',import.meta.url).href,alt:'יצור דמיוני בסביבת המחיה שלו'},
  engineers:{src:new URL('./assets/engineers.webp',import.meta.url).href,alt:'קסדת מגן וחומרי גלם על שולחן עבודה'},
  coffee:{src:new URL('./assets/coffee.webp',import.meta.url).href,alt:'שתי כוסות קפה, חלב ושעון'},
  hive:{src:new URL('./assets/hive.webp',import.meta.url).href,alt:'מפת מושגים בצורת כוורת'}
};
export function Art({id}:{id:string}){const art=illustrations[id]??illustrations.hive;return <img src={art.src} alt={art.alt} className={'art '+id} width={960} height={540} style={{aspectRatio:'16 / 9',objectFit:'cover'}}/>}
