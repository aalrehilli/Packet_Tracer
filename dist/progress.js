import {labs} from './labs.js';
const keys=['R1','S1','S2','PC-A','PC-B'];
const seq=n=>Number.isSafeInteger(n)&&n>=0;
const text=v=>typeof v==='string'&&v.length<=200;
function validAction(a){if(!a||!seq(a.seq))return false;switch(a.type){
case 'observe':return true;
case 'quiz':return Number.isInteger(a.answer)&&a.answer>=0&&a.answer<3;
case 'link':return Number.isInteger(a.index)&&a.index>=0&&a.index<4&&typeof a.up==='boolean';
case 'device':return ['PC-A','PC-B'].includes(a.key)&&a.values&&['ip','mask','gateway','ipv6','gateway6'].every(k=>text(a.values[k]))&&a.values.prefix===64;
case 'subnet':return Array.isArray(a.answers)&&a.answers.length===3&&a.answers.every(v=>v&&text(v.network)&&text(v.broadcast)&&text(String(v.prefix))&&/^\d{1,3}$/.test(String(v.prefix)));
default:return false;
}}
export function validProgress(p){return !!(p&&p.version===1&&labs.some(l=>l.id===p.last)&&p.labs&&typeof p.labs==='object'&&!Array.isArray(p.labs)&&Object.entries(p.labs).every(([id,v])=>labs.some(l=>l.id===id)&&v&&seq(v.seq)&&typeof v.completed==='boolean'&&Array.isArray(v.commands)&&v.commands.length<=3000&&v.commands.every(c=>c&&keys.includes(c.key)&&text(c.raw)&&seq(c.seq)&&c.seq<=v.seq)&&Array.isArray(v.actions)&&v.actions.length<=3000&&v.actions.every(a=>validAction(a)&&a.seq<=v.seq)&&new Set([...v.commands,...v.actions].map(a=>a.seq)).size===v.commands.length+v.actions.length));}
